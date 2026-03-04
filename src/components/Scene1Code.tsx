import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Copy, Terminal, Brain, Search, FileText, Cpu, Loader2, ChevronDown, ChevronRight, CheckCircle2, ArrowUp } from 'lucide-react';

interface Scene1CodeProps {
  query: string;
  onBack: () => void;
}

const CODE_CONTENT = `/**
 * 价格缓存优化策略：多级缓存与预热算法 (Price Cache Optimization)
 * 
 * 核心思路：
 * 1. L1 本地内存缓存 (Caffeine) - 极高频热点数据，毫秒级过期
 * 2. L2 分布式缓存 (Redis) - 全局共享，采用 Hash 结构存储价格计划
 * 3. 缓存穿透保护：布隆过滤器 (Bloom Filter) 拦截无效房型请求
 * 4. 缓存击穿保护：分布式互斥锁 (Redisson)
 * 5. 缓存雪崩保护：随机化过期时间 (Jitter)
 * 6. 智能预热：基于历史访问频次和促销日历的后台异步预热
 */

package com.hotel.core.cache;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.redisson.api.RBloomFilter;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class PriceCacheManager {

    private final StringRedisTemplate redisTemplate;
    private final RedissonClient redissonClient;
    private final RBloomFilter<String> ratePlanBloomFilter;
    private final DatabaseRepository databaseRepository;
    private final CampaignRepository campaignRepository;
    
    // L1 Caffeine 本地缓存，最大容量 10000，写入后 5 秒过期
    private final Cache<String, Double> localCache = Caffeine.newBuilder()
            .maximumSize(10000)
            .expireAfterWrite(5, TimeUnit.SECONDS)
            .build();

    // 基础配置
    private static final long L2_BASE_TTL_SEC = 3600; // Redis 基础缓存 1 小时
    private static final int JITTER_SEC = 600; // 随机抖动 10 分钟，防止雪崩
    private static final String PRICE_KEY_PREFIX = "price:ratePlan:";
    private static final String LOCK_KEY_PREFIX = "lock:price:";

    public PriceCacheManager(StringRedisTemplate redisTemplate, RedissonClient redissonClient, 
                             DatabaseRepository databaseRepository, CampaignRepository campaignRepository) {
        this.redisTemplate = redisTemplate;
        this.redissonClient = redissonClient;
        this.databaseRepository = databaseRepository;
        this.campaignRepository = campaignRepository;
        
        // 初始化布隆过滤器，预计 1000 万价格计划，误判率 1%
        this.ratePlanBloomFilter = redissonClient.getBloomFilter("ratePlan:bloom:filter");
        this.ratePlanBloomFilter.tryInit(10000000L, 0.01);
    }

    /**
     * 获取价格计划 (核心入口)
     */
    public Double getPrice(String ratePlanId) {
        // 1. 布隆过滤器拦截：如果价格计划绝对不存在，直接返回 null，防止缓存穿透
        if (!ratePlanBloomFilter.contains(ratePlanId)) {
            return null;
        }

        // 2. 查询 L1 本地缓存
        Double localPrice = localCache.getIfPresent(ratePlanId);
        if (localPrice != null) {
            return localPrice; // L1 命中
        }

        // 3. 查询 L2 分布式缓存 (Redis)
        String redisKey = PRICE_KEY_PREFIX + ratePlanId;
        String redisData = redisTemplate.opsForValue().get(redisKey);
        
        if (redisData != null) {
            Double price = Double.parseDouble(redisData);
            // 回填 L1 缓存
            localCache.put(ratePlanId, price);
            return price; // L2 命中
        }

        // 4. 缓存未命中，尝试获取分布式锁，防止缓存击穿 (并发查询数据库)
        String lockKey = LOCK_KEY_PREFIX + ratePlanId;
        RLock lock = redissonClient.getLock(lockKey);
        
        try {
            // 尝试加锁，最多等待 50ms，上锁后 5s 自动解锁
            boolean isLocked = lock.tryLock(50, 5000, TimeUnit.MILLISECONDS);
            if (isLocked) {
                // 4.1 拿到锁的线程去查询数据库 (Double Check)
                redisData = redisTemplate.opsForValue().get(redisKey);
                if (redisData != null) {
                    return Double.parseDouble(redisData);
                }

                Double dbPrice = databaseRepository.findPriceByRatePlanId(ratePlanId);
                
                if (dbPrice != null) {
                    // 4.2 重建缓存，加入随机过期时间防止雪崩
                    long ttl = L2_BASE_TTL_SEC + ThreadLocalRandom.current().nextInt(JITTER_SEC);
                    redisTemplate.opsForValue().set(redisKey, dbPrice.toString(), ttl, TimeUnit.SECONDS);
                    localCache.put(ratePlanId, dbPrice);
                }
                return dbPrice;
            } else {
                // 5. 没拿到锁的线程，短暂休眠后重试
                Thread.sleep(50);
                return getPrice(ratePlanId); // 递归重试
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Cache lock interrupted", e);
        } finally {
            // 4.3 释放锁
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }

    /**
     * 智能预热算法 (后台任务)
     * 针对即将到来的旅游旺季，提前将热门房型价格加载到 Redis
     */
    public void smartPreheat(String campaignId) {
        // 1. 获取旺季房型清单和预测热度
        List<RatePlanHeatDTO> hotRatePlans = campaignRepository.findHotRatePlans(campaignId);
        
        // 2. 批量写入 Redis (Pipeline 优化网络 IO)
        redisTemplate.executePipelined((org.springframework.data.redis.connection.RedisConnection connection) -> {
            for (RatePlanHeatDTO ratePlan : hotRatePlans) {
                Double price = databaseRepository.findPriceByRatePlanId(ratePlan.getId());
                if (price != null) {
                    byte[] key = (PRICE_KEY_PREFIX + ratePlan.getId()).getBytes();
                    byte[] value = price.toString().getBytes();
                    
                    // 热度越高的房型，缓存时间越长
                    long ttl = L2_BASE_TTL_SEC * (ratePlan.getHeatScore() > 90 ? 24 : 12);
                    connection.setEx(key, ttl, value);
                    
                    // 同步更新布隆过滤器
                    ratePlanBloomFilter.add(ratePlan.getId());
                }
            }
            return null;
        });
    }
}`;

const JAVA_KEYWORDS = /^(?:import|package|public|private|protected|class|interface|extends|implements|return|if|else|for|while|try|catch|finally|throw|throws|new|static|final|void|boolean|int|long|double|float|String)$/;

function highlightJava(line: string): string {
  // Escape HTML entities first to prevent tag injection
  const escaped = line
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Block comment lines (/** ... */ style)
  const trimmed = escaped.trim();
  if (trimmed.startsWith('*') || trimmed.startsWith('/**') || trimmed.startsWith('*/')) {
    return `<span class="text-[#808080]">${escaped}</span>`;
  }

  // Single-pass regex: matches tokens in priority order so later patterns
  // never see HTML produced by earlier ones
  return escaped.replace(
    /(\/\/.*$|"[^"]*"|\b(?:import|package|public|private|protected|class|interface|extends|implements|return|if|else|for|while|try|catch|finally|throw|throws|new|static|final|void|boolean|int|long|double|float|String)\b|[{}[\]()]|@\w+)/g,
    (match) => {
      if (match.startsWith('//')) return `<span class="text-[#808080]">${match}</span>`;
      if (match.startsWith('"')) return `<span class="text-[#6A8759]">${match}</span>`;
      if (JAVA_KEYWORDS.test(match)) return `<span class="text-[#CC7832]">${match}</span>`;
      if (/^[{}[\]()]$/.test(match)) return `<span class="text-[#FFC66D]">${match}</span>`;
      if (match.startsWith('@')) return `<span class="text-[#BBB529]">${match}</span>`;
      return match;
    }
  );
}

const AGENT_STEPS = [
  { id: 1, text: '解析用户意图与需求', detail: '识别核心场景: 高并发、价格查询、缓存命中率', icon: Brain },
  { id: 2, text: '检索内部架构规范', detail: '查找分布式缓存最佳实践 (Redis/LocalCache)', icon: Search },
  { id: 3, text: '设计多级缓存架构', detail: 'L1本地内存 + L2分布式Redis + 布隆过滤器', icon: FileText },
  { id: 4, text: '合成高可用算法', detail: '处理缓存穿透、击穿(互斥锁)与雪崩(随机抖动)', icon: Cpu },
  { id: 5, text: '开始生成代码', detail: '', icon: Terminal }
];

export function Scene1Code({ query, onBack }: Scene1CodeProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [displayedCode, setDisplayedCode] = useState('');
  const [isDone, setIsDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(true);
  const codeEndRef = useRef<HTMLDivElement>(null);
  const [chatInput, setChatInput] = useState('');

  // Agent Thinking Process
  useEffect(() => {
    if (stepIndex < AGENT_STEPS.length) {
      const timer = setTimeout(() => {
        setStepIndex(prev => prev + 1);
      }, stepIndex === 0 ? 2200 : stepIndex === 1 ? 2500 : stepIndex === 2 ? 2800 : stepIndex === 3 ? 2200 : 1800);
      return () => clearTimeout(timer);
    } else if (stepIndex === AGENT_STEPS.length && !isGeneratingCode) {
      setIsGeneratingCode(true);
      setTimeout(() => setIsThinkingExpanded(false), 1000); // Auto collapse thinking after a short delay
    }
  }, [stepIndex, isGeneratingCode]);

  // Code Generation Typewriter
  useEffect(() => {
    if (!isGeneratingCode) return;

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= CODE_CONTENT.length) {
        setDisplayedCode(CODE_CONTENT.slice(0, currentIndex));
        currentIndex += Math.floor(Math.random() * 8) + 4; // Type 4-11 chars at a time (slightly faster for longer code)
      } else {
        clearInterval(interval);
        setIsDone(true);
      }
    }, 12); // Slightly faster interval for longer code

    return () => clearInterval(interval);
  }, [isGeneratingCode]);

  // Auto-scroll to bottom as code is generated
  useEffect(() => {
    if (isGeneratingCode && codeEndRef.current) {
      codeEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [displayedCode, isGeneratingCode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(CODE_CONTENT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-screen bg-[#1E2030] text-gray-100 font-sans flex flex-col relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <button
        onClick={onBack}
        className="fixed top-6 left-6 text-gray-500 hover:text-gray-300 transition-colors z-50 text-sm flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/5"
      >
        ← 返回
      </button>

      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col pt-12 px-6 md:px-12 relative z-10 overflow-y-auto">
        {/* User Query */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-row-reverse items-start gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
            <span className="text-white text-base font-medium">U</span>
          </div>
          <div className="bg-[#2A2B32] border border-white/5 rounded-2xl rounded-tr-sm p-5 text-gray-100 text-lg leading-relaxed max-w-[80%] shadow-sm">
            {query || "如何优化价格缓存命中率的算法"}
          </div>
        </motion.div>

        {/* Jarvis Response */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-start gap-3 flex-1 pb-28"
        >
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-indigo-500/20 blur-md rounded-full"></div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm flex items-center justify-center relative z-10 border border-white/10">
              <span className="text-white text-sm font-bold">J</span>
            </div>
          </div>
          
          <div className="flex-1 min-w-0 max-w-[90%]">
            {/* Agent Thinking Process UI */}
            <div className="mb-6">
              <button 
                onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors mb-2 group"
              >
                {isThinkingExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                <span className="font-medium">深度思考过程</span>
                {stepIndex < AGENT_STEPS.length && (
                  <span className="ml-1 text-indigo-400 text-xs animate-pulse">
                    处理中...
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isThinkingExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pl-5 border-l-2 border-white/10 ml-1.5 py-1 space-y-3 mb-4">
                      {AGENT_STEPS.map((step, idx) => {
                        const isActive = idx === stepIndex;
                        const isDone = idx < stepIndex;
                        const isVisible = idx <= stepIndex;
                        
                        if (!isVisible) return null;

                        return (
                          <motion.div 
                            key={step.id} 
                            initial={{ opacity: 0, x: -10 }} 
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 text-sm"
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : isActive ? (
                              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-gray-600 shrink-0" />
                            )}
                            <span className={isDone ? 'text-gray-400' : isActive ? 'text-gray-200' : 'text-gray-500'}>
                              {step.text}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Code Generation Result */}
            {isGeneratingCode && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-gray-200 text-lg leading-relaxed mb-5">好的，针对高并发场景下的价格查询，我为您设计了一套**多级缓存与智能预热算法**。该方案采用了 L1 本地缓存结合 L2 Redis 分布式缓存，并引入了布隆过滤器和互斥锁来彻底解决缓存穿透、击穿和雪崩问题：</p>
                
                <div className="rounded-xl overflow-hidden border border-white/10 bg-[#282A3A] shadow-lg">
                  {/* Code Editor Header */}
                  <div className="flex items-center justify-between px-5 py-3 bg-white/[0.02] border-b border-white/10">
                    <div className="flex items-center gap-2 text-gray-400 text-sm font-sans">
                      <Terminal className="w-4 h-4" />
                      <span>java</span>
                    </div>
                    <button 
                      onClick={handleCopy}
                      disabled={!isDone}
                      className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-200 transition-colors disabled:opacity-50"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      {copied ? '已复制' : '复制代码'}
                    </button>
                  </div>
                  
                  {/* Code Content */}
                  <div className="p-5 relative">
                    <pre className="font-mono text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                      <code className="text-[#A9B7C6] block">
                        {displayedCode.split('\n').map((line, i) => (
                          <div key={i} className="flex hover:bg-white/[0.02] transition-colors">
                            <span className="text-right pr-4 text-gray-500/50 select-none w-10 shrink-0">{i + 1}</span>
                            <span
                              className="flex-1"
                              dangerouslySetInnerHTML={{ __html: highlightJava(line) }}
                            />
                          </div>
                        ))}
                        {!isDone && (
                          <span className="inline-block w-2 h-4 bg-indigo-400 ml-1 animate-pulse align-middle mt-1"></span>
                        )}
                      </code>
                    </pre>
                    <div ref={codeEndRef} />
                  </div>
                </div>
                
                {isDone && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-5 text-gray-400 text-base flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    代码生成完毕。您可以直接复制并应用到您的项目中。
                  </motion.p>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Floating Chat Input */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-6 md:px-12 pb-6 pt-4 bg-gradient-to-t from-[#1E2030] via-[#1E2030] to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 bg-[#282A3A] border border-white/10 rounded-2xl px-5 py-3 shadow-lg">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="继续提问..."
              className="flex-1 bg-transparent outline-none text-gray-100 placeholder-gray-500 text-base"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && chatInput.trim()) {
                  setChatInput('');
                }
              }}
            />
            <button
              disabled={!chatInput.trim()}
              className={`p-2.5 rounded-xl transition-all ${
                chatInput.trim()
                  ? 'bg-indigo-500 text-white hover:bg-indigo-400 shadow-md'
                  : 'bg-white/5 text-gray-500 cursor-not-allowed'
              }`}
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
