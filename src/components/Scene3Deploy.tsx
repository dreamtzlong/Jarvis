import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Rocket, Settings, GitBranch, History, CheckCircle2, ChevronRight, Play } from 'lucide-react';

interface Scene3DeployProps {
  onBack: () => void;
}

export function Scene3Deploy({ onBack }: Scene3DeployProps) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const startDeploy = () => {
    setIsDeploying(true);
    setProgress(0);
    setIsSuccess(false);
    setLogs(['[系统] 正在启动部署流程...']);

    const steps = [
      { p: 15, log: '[构建] 正在编译资源并优化打包...' },
      { p: 35, log: '[测试] 正在运行单元测试和集成测试...' },
      { p: 50, log: '[容器] 正在构建 Docker 镜像 v2.4.1...' },
      { p: 75, log: '[仓库] 正在推送镜像到容器仓库...' },
      { p: 90, log: '[K8s] 正在更新部署配置...' },
      { p: 100, log: '[系统] 流量已成功切换到新版本。' }
    ];

    let currentStep = 0;
    
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + (Math.random() * 2 + 1);
        
        if (currentStep < steps.length && next >= steps[currentStep].p) {
          const logMessage = steps[currentStep].log;
          setLogs(l => [...l, logMessage]);
          currentStep++;
        }

        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsSuccess(true), 500);
          return 100;
        }
        return next;
      });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-gray-800 font-sans flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-gray-900">Hotel Dev</span>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">主菜单</div>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <LayoutDashboard className="w-5 h-5 text-gray-400" /> 仪表盘
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg bg-blue-50 text-blue-700 transition-colors">
            <Rocket className="w-5 h-5 text-blue-600" /> 版本发布
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <GitBranch className="w-5 h-5 text-gray-400" /> 分支管理
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <History className="w-5 h-5 text-gray-400" /> 操作日志
          </button>
        </div>
        
        <div className="p-4 border-t border-gray-100">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <Settings className="w-5 h-5 text-gray-400" /> 设置
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 shrink-0">
          <div className="flex items-center text-sm text-gray-500">
            <span>项目</span>
            <ChevronRight className="w-4 h-4 mx-1" />
            <span>Hotel Core</span>
            <ChevronRight className="w-4 h-4 mx-1" />
            <span className="font-medium text-gray-900">版本发布</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">版本发布管理</h1>
                <p className="text-gray-500 text-sm">管理并部署版本到生产环境。</p>
              </div>
              <button 
                onClick={startDeploy}
                disabled={isDeploying}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4 fill-current" />
                新版本发布
              </button>
            </div>

            {/* Recent Releases Table */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
                  <tr>
                    <th className="px-6 py-4">版本号</th>
                    <th className="px-6 py-4">状态</th>
                    <th className="px-6 py-4">环境</th>
                    <th className="px-6 py-4">发布人</th>
                    <th className="px-6 py-4 text-right">日期</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-gray-400" /> v2.4.0
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> 运行中
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">生产环境</td>
                    <td className="px-6 py-4 text-gray-600">陈志远</td>
                    <td className="px-6 py-4 text-gray-500 text-right">2 天前</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-gray-400" /> v2.3.5
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div> 已停用
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">生产环境</td>
                    <td className="px-6 py-4 text-gray-600">林晓华</td>
                    <td className="px-6 py-4 text-gray-500 text-right">1 周前</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-gray-400" /> v2.3.4
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div> 已停用
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">生产环境</td>
                    <td className="px-6 py-4 text-gray-600">陈志远</td>
                    <td className="px-6 py-4 text-gray-500 text-right">2 周前</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* Deployment Modal Overlay */}
        <AnimatePresence>
          {isDeploying && !isSuccess && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: -20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
              >
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-900">正在部署 v2.4.1</h2>
                      <span className="text-blue-600 font-mono font-medium">{Math.floor(progress)}%</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden mb-8">
                      <motion.div 
                        className="h-full bg-blue-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: "linear", duration: 0.1 }}
                      />
                    </div>

                    {/* Terminal Logs */}
                    <div className="bg-gray-900 rounded-xl p-4 h-48 overflow-y-auto font-mono text-xs text-gray-300 space-y-2 flex flex-col justify-end">
                      {logs.map((log, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={log.includes('系统') ? 'text-blue-400' : ''}
                        >
                          {log}
                        </motion.div>
                      ))}
                      <div className="flex items-center gap-2 text-gray-500 mt-2">
                        <span className="w-2 h-4 bg-gray-500 animate-pulse"></span>
                      </div>
                    </div>
                  </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Modal */}
        <AnimatePresence>
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", bounce: 0.35 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-center p-10"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-gray-900 font-bold text-2xl mb-3">发布成功</h3>
                <p className="text-gray-500 text-base mb-8">版本 v2.4.1 已成功部署到生产环境。</p>
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setIsDeploying(false);
                  }}
                  className="px-8 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  确定
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
