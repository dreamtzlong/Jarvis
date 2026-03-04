import React, { useState } from 'react';
import { JarvisHome } from './components/JarvisHome';
import { Scene1Code } from './components/Scene1Code';
import { Scene2Data } from './components/Scene2Data';
import { Scene3Deploy } from './components/Scene3Deploy';
import { LayoutDashboard, Code, BarChart3, Rocket } from 'lucide-react';

type Scene = 'landing' | 'jarvis-home-1' | 'scene1-code' | 'jarvis-home-2' | 'scene2-data' | 'scene3-deploy';

export default function App() {
  const [currentScene, setCurrentScene] = useState<Scene>('landing');
  const [query, setQuery] = useState('');

  const handleJarvisSubmit1 = (q: string) => {
    setQuery(q);
    setCurrentScene('scene1-code');
  };

  const handleJarvisSubmit2 = (q: string) => {
    setQuery(q);
    setCurrentScene('scene2-data');
  };

  if (currentScene === 'jarvis-home-1') {
    return <JarvisHome onSubmit={handleJarvisSubmit1} placeholder="如何优化价格缓存命中率的算法" />;
  }

  if (currentScene === 'scene1-code') {
    return <Scene1Code query={query} onBack={() => setCurrentScene('landing')} />;
  }

  if (currentScene === 'jarvis-home-2') {
    return <JarvisHome onSubmit={handleJarvisSubmit2} placeholder="分析过去半年的酒店预订数据，并预测未来5个月的收益趋势..." />;
  }

  if (currentScene === 'scene2-data') {
    return <Scene2Data query={query} onBack={() => setCurrentScene('landing')} />;
  }

  if (currentScene === 'scene3-deploy') {
    return <Scene3Deploy onBack={() => setCurrentScene('landing')} />;
  }

  // Landing Page for Video Shoot Setup
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-12">
        <div className="flex items-center justify-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <LayoutDashboard className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">宣发视频拍摄控制台</h1>
        <p className="text-center text-gray-500 mb-12 max-w-lg mx-auto">
          请选择需要录制的画面。每个画面都已配置好对应的交互流程和动画效果，适配拍摄脚本。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Scene 1 */}
          <button 
            onClick={() => setCurrentScene('jarvis-home-1')}
            className="flex flex-col items-center p-8 bg-gray-50 rounded-2xl border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all group text-left"
          >
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Code className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">画面 1：代码生成</h3>
            <p className="text-sm text-gray-500 text-center">Jarvis主页输入请求，跳转深色代码生成页面，带打字机动画。</p>
          </button>

          {/* Scene 2 */}
          <button 
            onClick={() => setCurrentScene('jarvis-home-2')}
            className="flex flex-col items-center p-8 bg-gray-50 rounded-2xl border border-gray-200 hover:border-purple-500 hover:bg-purple-50/50 transition-all group text-left"
          >
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">画面 2：数据图表</h3>
            <p className="text-sm text-gray-500 text-center">Jarvis主页输入请求，跳转浅色数据看板，生成历史与预测图表。</p>
          </button>

          {/* Scene 3 */}
          <button 
            onClick={() => setCurrentScene('scene3-deploy')}
            className="flex flex-col items-center p-8 bg-gray-50 rounded-2xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all group text-left"
          >
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Rocket className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">画面 3：发版模拟</h3>
            <p className="text-sm text-gray-500 text-center">Hotel开发者后台，点击发版按钮，展示进度条及成功提示。</p>
          </button>
        </div>
      </div>
    </div>
  );
}
