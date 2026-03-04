import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceDot, ComposedChart
} from 'recharts';
import { Search, Bell, User, Menu, MoreHorizontal, ArrowLeft, Database, BrainCircuit, Activity, LayoutDashboard, CheckCircle2, Loader2, TrendingUp, MapPin, PieChart as PieChartIcon, BarChart3 as BarChartIcon, LineChart as LineChartIcon } from 'lucide-react';

interface Scene2DataProps {
  query: string;
  onBack: () => void;
}

// --- Data Generation ---

const MAIN_CHART_DATA: any[] = [];
let sp500 = 100;
let nasdaq = 100;
let emerging = 100;

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const getMonth = (i: number) => `${months[i % 12]} '${23 + Math.floor(i / 12)}`;

for (let i = 0; i <= 35; i++) { 
  const isForecast = i >= 24; 
  
  sp500 += Math.sin(i) * 4 + 1.5;
  nasdaq += Math.cos(i) * 6 + 2;
  emerging += Math.sin(i * 1.5) * 3 + 0.5;

  const dataPoint: any = {
    name: getMonth(i),
    index: i
  };

  if (i <= 24) {
    dataPoint.sp500 = sp500;
    dataPoint.nasdaq = nasdaq;
    dataPoint.emerging = emerging;
  }
  
  if (i >= 24) {
    dataPoint.sp500_forecast = sp500;
    dataPoint.nasdaq_forecast = nasdaq;
    dataPoint.emerging_forecast = emerging;
    
    const spread = (i - 24) * 2.5;
    dataPoint.sp500_range = [sp500 - spread, sp500 + spread];
    dataPoint.nasdaq_range = [nasdaq - spread * 1.5, nasdaq + spread * 1.5];
  }
  
  MAIN_CHART_DATA.push(dataPoint);
}

const PORTFOLIO_DATA = [
  { name: 'B2B', value: 38.2, color: '#3b82f6' },
  { name: 'OTA', value: 23.7, color: '#10b981' },
  { name: 'Direct', value: 16.5, color: '#f43f5e' },
  { name: 'Corp', value: 12.1, color: '#f59e0b' },
  { name: 'Groups', value: 9.5, color: '#8b5cf6' },
];

const REGION_DATA = [
  { name: 'APAC', value: 6.8, color: '#3b82f6' },
  { name: 'NA', value: 3.2, color: '#10b981' },
  { name: 'EMEA', value: 1.1, color: '#8b5cf6' },
];

const ASSET_DATA = Array.from({length: 30}, (_, i) => ({
  name: i,
  b2b: 100 + i + Math.random() * 10,
  ota: 100 + i * 0.2 + Math.random() * 5,
  direct: 100 + Math.sin(i/3)*10 + Math.random() * 5,
  corp: 100 + i * 1.5 + (Math.random()-0.5) * 20,
}));

// --- Components ---

const Panel = ({ title, children, className = "", rightElement = null, icon: Icon = null }: any) => (
  <div className={`bg-slate-900 border border-slate-800 rounded-3xl shadow-[0_2px_10px_rgb(0,0,0,0.2)] flex flex-col overflow-hidden ${className}`}>
    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-blue-400" />}
        <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
      </div>
      {rightElement || <MoreHorizontal className="w-5 h-5 text-slate-500 cursor-pointer hover:text-slate-300 transition-colors" />}
    </div>
    <div className="flex-1 p-4 relative overflow-hidden">
      {children}
    </div>
  </div>
);

const VixGauge = ({ value, label, color, trend }: any) => {
  const data = [
    { name: 'Value', value: value },
    { name: 'Empty', value: 100 - value }
  ];
  return (
    <div className="flex flex-col items-center flex-1">
      <div className="text-xs text-slate-400 mb-2 font-medium">{label}</div>
      <div className="h-20 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius="75%" outerRadius="100%" stroke="none" paddingAngle={0}>
              <Cell fill={color} />
              <Cell fill="#334155" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute bottom-0 left-0 w-full flex flex-col items-center justify-end pb-1">
          <span className="text-xl font-bold text-slate-100">{value}%</span>
          {trend && <span className={`text-[10px] font-bold ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{trend > 0 ? '+' : ''}{trend}%</span>}
        </div>
      </div>
    </div>
  );
};

export function Scene2Data({ query, onBack }: Scene2DataProps) {
  const [showCharts, setShowCharts] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const ANALYSIS_STEPS = [
    { icon: Search, text: "解析查询意图: 全球酒店预订动态与收益管理分析" },
    { icon: Database, text: "连接全球酒店分销系统 (GDS, OTA, PMS)..." },
    { icon: BrainCircuit, text: "提取历史预订数据并运行动态定价预测模型..." },
    { icon: Activity, text: "计算取消率 (BCR)、各房型表现及区域入住率预测..." },
    { icon: LayoutDashboard, text: "渲染高密度多维酒店运营数据看板..." }
  ];

  useEffect(() => {
    const runSteps = async () => {
      for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
        setActiveStep(i);
        await new Promise(r => setTimeout(r, 1000 + Math.random() * 600));
      }
      setActiveStep(ANALYSIS_STEPS.length);
      await new Promise(r => setTimeout(r, 500));
      setShowCharts(true);
    };
    runSteps();
  }, []);

  if (!showCharts) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-slate-200 font-sans flex flex-col items-center justify-center relative overflow-hidden p-6">
        {/* Background effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-2xl w-full z-10">
          <div className="flex flex-col items-center gap-4 mb-12">
            <div className="relative flex items-center justify-center w-20 h-20 bg-slate-900 rounded-2xl shadow-lg shadow-blue-900/20 border border-slate-800">
              <div className="absolute inset-0 border-2 border-transparent border-t-blue-500 rounded-2xl animate-spin"></div>
              <BrainCircuit className="w-8 h-8 text-blue-400" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-100 mb-1">Jarvis 正在分析数据</h2>
              <p className="text-slate-400 text-sm">请稍候，正在为您生成深度洞察报告</p>
            </div>
          </div>

          <div className="space-y-3">
            {ANALYSIS_STEPS.map((step, index) => {
              const isActive = index === activeStep;
              const isCompleted = index < activeStep;
              const StepIcon = step.icon;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ 
                    opacity: isCompleted || isActive ? 1 : 0.4,
                    y: isCompleted || isActive ? 0 : 5
                  }}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-500 ${
                    isActive ? 'bg-slate-800/80 border-blue-500/30 shadow-md shadow-blue-900/20 scale-[1.02]' : 
                    isCompleted ? 'bg-slate-900/60 border-slate-800' : 'bg-transparent border-transparent'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isActive ? 'bg-blue-500/10 text-blue-400' :
                    isCompleted ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : 
                     isActive ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                     <StepIcon className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium transition-colors ${
                      isActive ? 'text-slate-200' :
                      isCompleted ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      {step.text}
                    </p>
                  </div>
                  {isActive && (
                    <div className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md animate-pulse">
                      进行中
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-200 font-sans flex flex-col selection:bg-blue-900/50">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-100">酒店运营与收益预测分析</h1>
            <p className="text-xs text-slate-400">Jarvis Analytics Engine • 实时数据</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" placeholder="搜索指标..." className="bg-slate-800 rounded-xl text-sm pl-9 pr-4 py-2 outline-none text-slate-200 border border-slate-700 w-64 focus:border-blue-500/50 focus:bg-slate-800 focus:shadow-sm transition-all placeholder:text-slate-500" />
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900"></span>
          </button>
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-700 cursor-pointer">
            <img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=100&h=100" alt="User" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>
      
      {/* Tabs */}
      <div className="flex px-8 pt-4 gap-8 text-sm font-medium border-b border-slate-800 bg-slate-900/30">
        <div className="text-blue-400 border-b-2 border-blue-400 pb-3 cursor-pointer">总览看板</div>
        <div className="text-slate-400 pb-3 hover:text-slate-200 cursor-pointer transition-colors">收益分析</div>
        <div className="text-slate-400 pb-3 hover:text-slate-200 cursor-pointer transition-colors">预订趋势</div>
        <div className="text-slate-400 pb-3 hover:text-slate-200 cursor-pointer transition-colors">客群画像</div>
      </div>

      {/* Main Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 p-6 grid grid-cols-1 md:grid-cols-12 gap-6 max-w-[1600px] mx-auto w-full"
      >
        {/* Left Column */}
        <div className="col-span-1 md:col-span-4 flex flex-col gap-6">
          {/* VIX */}
          <Panel title="预订取消率 (BCR)" icon={Activity} className="h-48">
            <div className="flex justify-around items-end h-full pb-2">
              <VixGauge value={9.2} label="历史平均" color="#3b82f6" trend={-1.2} />
              <VixGauge value={15.3} label="未来预测" color="#f59e0b" trend={+6.1} />
            </div>
          </Panel>

          {/* Sector Performance */}
          <Panel title="各房型收益表现" icon={TrendingUp} className="min-h-[280px]">
            <div className="grid grid-cols-2 gap-3 h-full">
              <div className="bg-emerald-500/10 rounded-2xl p-4 flex flex-col justify-between border border-emerald-500/20 hover:shadow-md transition-shadow cursor-pointer">
                <span className="text-sm font-semibold text-emerald-400">度假别墅</span>
                <div>
                  <div className="text-2xl font-bold text-emerald-400">+18%</div>
                  <div className="text-xs text-emerald-400/70 mt-1">较上月提升</div>
                </div>
              </div>
              <div className="bg-blue-500/10 rounded-2xl p-4 flex flex-col justify-between border border-blue-500/20 hover:shadow-md transition-shadow cursor-pointer">
                <span className="text-sm font-semibold text-blue-400">豪华套房</span>
                <div>
                  <div className="text-2xl font-bold text-blue-400">+12%</div>
                  <div className="text-xs text-blue-400/70 mt-1">稳定增长</div>
                </div>
              </div>
              <div className="bg-red-500/10 rounded-2xl p-4 flex flex-col justify-between border border-red-500/20 hover:shadow-md transition-shadow cursor-pointer">
                <span className="text-sm font-semibold text-red-400">商务标间</span>
                <div>
                  <div className="text-2xl font-bold text-red-400">-5%</div>
                  <div className="text-xs text-red-400/70 mt-1">需关注淡季</div>
                </div>
              </div>
              <div className="bg-purple-500/10 rounded-2xl p-4 flex flex-col justify-between border border-purple-500/20 hover:shadow-md transition-shadow cursor-pointer">
                <span className="text-sm font-semibold text-purple-400">精品大床</span>
                <div>
                  <div className="text-2xl font-bold text-purple-400">+9%</div>
                  <div className="text-xs text-purple-400/70 mt-1">情侣偏好</div>
                </div>
              </div>
            </div>
          </Panel>

          {/* Portfolio Risk */}
          <Panel title="收益渠道分布" icon={PieChartIcon} className="flex-1 min-h-[220px]">
            <div className="flex h-full items-center">
              <div className="w-1/2 h-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={PORTFOLIO_DATA} innerRadius="60%" outerRadius="80%" stroke="none" paddingAngle={5}>
                      {PORTFOLIO_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)'}}
                      itemStyle={{fontSize: '12px', fontWeight: '600', color: '#f8fafc'}}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold text-slate-100">100%</span>
                  <span className="text-xs text-slate-400 font-medium">总收益</span>
                </div>
              </div>
              <div className="w-1/2 flex flex-col gap-3 pl-4">
                {PORTFOLIO_DATA.map(d => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: d.color}}></div>
                      <span className="text-sm text-slate-400 font-medium">{d.name}</span>
                    </div>
                    <span className="font-bold text-sm text-slate-200">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </div>
        
        {/* Right Column */}
        <div className="col-span-1 md:col-span-8 flex flex-col gap-6">
          {/* Main Chart */}
          <Panel 
            title="入住率与 ADR 趋势：历史与预测" 
            icon={LineChart}
            className="flex-1 min-h-[360px]"
            rightElement={
              <div className="flex gap-4 text-xs font-medium bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                <span className="flex items-center gap-1.5 text-slate-300"><div className="w-2.5 h-2.5 rounded-sm bg-blue-500"></div> 入住率</span>
                <span className="flex items-center gap-1.5 text-slate-300"><div className="w-2.5 h-2.5 rounded-sm bg-purple-500"></div> ADR</span>
                <span className="flex items-center gap-1.5 text-slate-300"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></div> RevPAR</span>
              </div>
            }
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={MAIN_CHART_DATA} margin={{ top: 20, right: 20, bottom: 10, left: -20 }}>
                <defs>
                  <linearGradient id="colorSp500" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 12}} tickLine={false} axisLine={false} minTickGap={30} dy={10} />
                <YAxis stroke="#64748b" tick={{fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)'}}
                  itemStyle={{fontSize: '12px', fontWeight: '600'}}
                  labelStyle={{color: '#94a3b8', marginBottom: '4px'}}
                />
                
                {/* Forecast Areas */}
                <Area type="monotone" dataKey="sp500_range" stroke="none" fill="url(#colorSp500)" />
                <Area type="monotone" dataKey="nasdaq_range" stroke="none" fill="#8b5cf6" fillOpacity={0.1} />
                
                {/* Historical Lines */}
                <Line type="monotone" dataKey="sp500" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{r: 6, strokeWidth: 0}} />
                <Line type="monotone" dataKey="nasdaq" stroke="#8b5cf6" strokeWidth={3} dot={false} activeDot={{r: 6, strokeWidth: 0}} />
                <Line type="monotone" dataKey="emerging" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{r: 6, strokeWidth: 0}} />
                
                {/* Forecast Lines */}
                <Line type="monotone" dataKey="sp500_forecast" stroke="#3b82f6" strokeWidth={3} strokeDasharray="6 6" dot={false} />
                <Line type="monotone" dataKey="nasdaq_forecast" stroke="#8b5cf6" strokeWidth={3} strokeDasharray="6 6" dot={false} />
                <Line type="monotone" dataKey="emerging_forecast" stroke="#10b981" strokeWidth={3} strokeDasharray="6 6" dot={false} />
                
                {/* Annotations */}
                <ReferenceLine x="Jan '25" stroke="#475569" strokeWidth={2} strokeDasharray="4 4" label={{ position: 'top', value: '今日', fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </Panel>
          
          {/* Bottom Row */}
          <div className="h-64 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Panel title="区域增长预测" icon={BarChartIcon}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={REGION_DATA} margin={{top: 20, right: 10, left: -25, bottom: 0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 11, fontWeight: '600'}} axisLine={false} tickLine={false} dy={5} />
                  <YAxis stroke="#64748b" tick={{fontSize: 11}} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} />
                  <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)'}} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={36}>
                    {REGION_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Panel>
            
            <Panel title="全球热度分布" icon={MapPin}>
              <div className="w-full h-full relative flex items-center justify-center bg-blue-900/20 rounded-xl overflow-hidden border border-blue-900/30">
                {/* Simple SVG World Map Placeholder */}
                <svg viewBox="0 0 1000 500" className="w-full h-full fill-slate-800">
                  <path d="M200,100 Q250,80 300,120 T400,100 T500,150 T600,100 T700,150 T800,100 T900,150 L900,400 L100,400 Z" opacity="0.5" />
                  <circle cx="250" cy="150" r="6" className="fill-blue-500" />
                  <circle cx="250" cy="150" r="16" className="fill-blue-500/30 animate-ping" />
                  
                  <circle cx="480" cy="120" r="5" className="fill-blue-500" />
                  <circle cx="480" cy="120" r="12" className="fill-blue-500/30 animate-ping" style={{animationDelay: '0.5s'}} />
                  
                  <circle cx="750" cy="180" r="8" className="fill-blue-500" />
                  <circle cx="750" cy="180" r="20" className="fill-blue-500/30 animate-ping" style={{animationDelay: '1s'}} />
                </svg>
                <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 shadow-sm border border-slate-700">
                  亚太地区热度最高
                </div>
              </div>
            </Panel>
            
            <Panel 
              title="渠道历史表现"
              icon={LineChartIcon}
              rightElement={
                <div className="flex gap-2 text-[10px] font-semibold">
                  <span className="text-blue-400">B2B</span>
                  <span className="text-emerald-400">OTA</span>
                </div>
              }
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ASSET_DATA} margin={{top: 10, right: 5, left: -25, bottom: 0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" hide />
                  <YAxis stroke="#64748b" tick={{fontSize: 10}} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} />
                  <Tooltip contentStyle={{backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)'}} labelStyle={{display: 'none'}} />
                  <Line type="monotone" dataKey="b2b" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="ota" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Panel>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
