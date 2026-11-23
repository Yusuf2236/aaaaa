import React from 'react';
import { ShieldAlert, BookOpen, FileText, Zap, Activity } from 'lucide-react';
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
  return (
    <header className="sticky top-0 z-50 bg-[#070b14]/90 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand */}
          <button
            onClick={() => setActiveTab('intro')}
            className="flex items-center space-x-3 text-left group focus:outline-none"
          >
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 text-white shrink-0 group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-500 border-2 border-[#070b14] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base sm:text-xl tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                  Smart-Kontrakt Audit Lab
                </span>
                <span className="hidden md:inline-flex px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  v2.5 Guided
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Topshiriq: <span className="text-cyan-400 font-mono font-semibold">A23, A16, A8 · TN2, TN4</span>
              </p>
            </div>
          </button>

          {/* Center Navigation Actions */}
          <div className="hidden md:flex items-center space-x-1.5">
            <button
              onClick={() => setActiveTab('intro')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'intro'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Bosh sahifa</span>
            </button>

            <button
              onClick={() => setActiveTab('manual')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab !== 'intro' && activeTab !== 'report'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Audit Stepper</span>
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'report'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Yakuniy Hisobot</span>
            </button>
          </div>

          {/* Right items: Progress + Auth & Wallet Button */}
          <div className="flex items-center space-x-3">
            {/* Real-time backend status badge */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-[11px] font-mono text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-Time Engine: Live</span>
            </div>

            {/* Progress widget */}
            <div className="hidden lg:flex items-center space-x-3 bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-slate-800">
              <div className="text-right">
                <div className="text-[10px] font-medium text-slate-400 flex items-center justify-end gap-1">
                  <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
                  Progress
                </div>
                <div className="text-xs font-bold text-slate-200 font-mono">
                  {completedTasksCount}/7 <span className="text-cyan-400">({progressPercent}%)</span>
                </div>
              </div>
              <div className="w-16 bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Auth & Wallet Button */}
            <WalletButton />
          </div>
        </div>
      </div>
    </header>
  );
};
