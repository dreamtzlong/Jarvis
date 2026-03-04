import React, { useState } from 'react';
import { Paperclip, Book, Globe, ArrowUp, Sparkles, Languages, Image as ImageIcon, Mic, Search, TrendingUp, Building2 } from 'lucide-react';
import { motion } from 'motion/react';

interface JarvisHomeProps {
  onSubmit: (query: string) => void;
  placeholder?: string;
}

export function JarvisHome({ onSubmit, placeholder = "输入你想咨询的问题..." }: JarvisHomeProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmit(query);
    }
  };

  const SUGGESTIONS = [
    { icon: TrendingUp, text: "分析近期酒店入住率趋势", color: "text-blue-500", bg: "bg-blue-50" },
    { icon: Building2, text: "优化价格缓存命中率算法", color: "text-emerald-500", bg: "bg-emerald-50" },
    { icon: Book, text: "生成本周收益管理报告", color: "text-purple-500", bg: "bg-purple-50" },
    { icon: Languages, text: "翻译最新客户评价", color: "text-orange-500", bg: "bg-orange-50" },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center pt-16 md:pt-24 pb-12 font-sans selection:bg-blue-100">
      {/* Background decorative elements */}
      <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none"></div>
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center mb-10 relative z-10"
      >
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden mb-5 shadow-lg shadow-blue-500/10 ring-4 ring-white">
          <img 
            src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=200&h=200" 
            alt="Jarvis Avatar" 
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-2xl md:text-4xl font-semibold text-gray-900 mb-3 tracking-tight">
          下午好，唐正龙
        </h1>
        <p className="text-gray-500 text-sm md:text-base font-medium">
          我是你的智能助手 Jarvis，今天想了解点什么？
        </p>
      </motion.div>

      {/* Input Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-3xl px-4 flex flex-col items-center relative z-10"
      >
        <form 
          onSubmit={handleSubmit} 
          className={`w-full bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border transition-all duration-300 ${
            isFocused ? 'border-blue-300 shadow-[0_8px_30px_rgba(59,130,246,0.12)] ring-4 ring-blue-50/50' : 'border-gray-200 hover:border-gray-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]'
          } p-4 md:p-5 mb-8`}
        >
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="w-full h-24 md:h-32 resize-none outline-none text-gray-800 placeholder-gray-400 text-base md:text-lg bg-transparent leading-relaxed"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1 md:gap-2">
              <button type="button" className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors" title="上传附件">
                <Paperclip className="w-5 h-5" />
              </button>
              <button type="button" className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors" title="上传图片">
                <ImageIcon className="w-5 h-5" />
              </button>
              <button type="button" className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors" title="语音输入">
                <Mic className="w-5 h-5" />
              </button>
              <div className="h-5 w-px bg-gray-200 mx-1 md:mx-2 hidden md:block"></div>
              <button type="button" className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200">
                <Globe className="w-4 h-4 text-blue-500" />
                <span>联网搜索</span>
              </button>
              <button type="button" className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>深度思考</span>
              </button>
            </div>
            
            <button 
              type="submit"
              disabled={!query.trim()}
              className={`p-3 rounded-2xl transition-all duration-300 flex items-center justify-center ${
                query.trim() 
                  ? 'bg-black text-white hover:bg-gray-800 shadow-md hover:shadow-lg hover:-translate-y-0.5' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Suggestions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12 w-full">
          {SUGGESTIONS.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                onClick={() => setQuery(item.text)}
                className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 bg-white hover:border-blue-200 hover:shadow-md transition-all text-left group"
              >
                <div className={`p-2.5 rounded-xl ${item.bg} group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{item.text}</span>
              </motion.button>
            );
          })}
        </div>

        {/* News Section - Redesigned as sleek cards */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="w-full"
        >
          <div className="flex items-center justify-between mb-5 px-2">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              今日热点
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">查看全部</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                title: "【DIDA Tea Time】喜气洋洋闹元宵",
                date: "2026-02-25",
                image: "https://images.unsplash.com/photo-1541592102775-7b1c31828d02?auto=format&fit=crop&q=80&w=400&h=250",
                tag: "活动"
              },
              {
                title: "道旅「文化IP」征集大赛！",
                date: "2026-02-12",
                image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=400&h=250",
                tag: "文化"
              },
              {
                title: "马上有礼！一代人有一代人的年货",
                date: "2026-02-05",
                image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&q=80&w=400&h=250",
                tag: "福利"
              }
            ].map((news, i) => (
              <div key={i} className="group cursor-pointer bg-white rounded-[1.5rem] border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 hover:border-gray-200 transition-all duration-300 flex flex-col">
                <div className="h-36 overflow-hidden relative">
                  <img src={news.image} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-bold text-gray-700 shadow-sm">
                    {news.tag}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors leading-relaxed">{news.title}</h4>
                  <div className="text-xs font-medium text-gray-400">{news.date}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
        
        <div className="text-center mt-12 mb-4 text-xs text-gray-400 font-medium">
          内容由 AI 生成，请仔细甄别。
        </div>
      </motion.div>
    </div>
  );
}
