import React from 'react';
import { ShieldAlert, Terminal, Award, FileText, CheckCircle2, Cpu, Activity, Layers } from 'lucide-react';
import { WalletButton } from './WalletButton';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  progressPercent: number;
  completedTasksCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  progressPercent,
  completedTasksCount
}) => {
  const navTabs = [
    { id: 'manual', label: '1. Qo‘lda Audit', short: '1. Qo‘lda', icon: Terminal, task: 'T1' },
    { id: 'static', label: '2. Slither Tahlil', short: '2. Slither', icon: ShieldAlert, task: 'T2' },
    { id: 'exploit', label: '3. Exploit PoC', short: '3. PoC', icon: Terminal, task: 'T3' },
    { id: 'severity', label: '4. Tasniflash (CVSS)', short: '4. CVSS', icon: Award, task: 'T4' },
    { id: 'fix', label: '5. Tuzatish & Test', short: '5. Tuzatish', icon: CheckCircle2, task: 'T5' },
    { id: 'ai-review', label: '6. AI Benchmark', short: '6. AI Audit', icon: Cpu, task: 'T6' },
    { id: 'deploy', label: '7. Blokcheynga Qo‘shish', short: '7. Blokcheyn', icon: Layers, task: 'T7' },
    { id: 'report', label: 'Hisobot (Yakuniy)', short: 'Hisobot', icon: FileText, task: 'Final' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#070b14]/90 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand */}
          <div className="flex items-center space-x-3.5">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 text-white shrink-0">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#070b14] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-2">
                  Smart-Kontrakt Audit Lab
                </span>
                <span className="hidden md:inline-flex px-2.5 py-0.5 text-[11px] font-mono font-bold rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  v2.5 On-Chain
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block mt-0.5">
                Akademik topshiriq: <span className="text-cyan-400 font-mono font-semibold">A23, A16, A8 · TN2, TN4</span>
              </p>
            </div>
          </div>

          {/* Right items: Progress + Auth & Wallet Button */}
          <div className="flex items-center space-x-3.5">
            {/* Progress widget */}
            <div className="hidden lg:flex items-center space-x-4 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800">
              <div className="text-right">
                <div className="text-[11px] font-medium text-slate-400 flex items-center justify-end gap-1">
                  <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
                  Audit Progressi
                </div>
                <div className="text-sm font-bold text-slate-200 font-mono">
                  {completedTasksCount} / 7 <span className="text-cyan-400 font-extrabold">({progressPercent}%)</span>
                </div>
              </div>
              <div className="w-24 bg-slate-800 rounded-full h-2.5 overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-1.5 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(0,240,255,0.5)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Auth & Wallet Button (Kirish / Chiqish) */}
            <WalletButton />
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="flex space-x-1.5 overflow-x-auto pb-3 pt-1 scrollbar-none border-t border-slate-800/60">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 relative ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className="hidden md:inline">{tab.label}</span>
                <span className="md:hidden">{tab.short}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
