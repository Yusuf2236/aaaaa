import React from 'react';
import { CheckCircle2, Circle, ArrowRight, ShieldCheck, Zap, Layers } from 'lucide-react';

interface LabProgressTrackerProps {
  completedTasks: Record<string, boolean>;
  onSelectTask: (tabId: string) => void;
}

export const LabProgressTracker: React.FC<LabProgressTrackerProps> = ({
  completedTasks,
  onSelectTask
}) => {
  const tasks = [
    {
      id: 'task-1',
      tabId: 'manual',
      number: '1',
      title: '1. Qo‘lda Tahlil (Manual)',
      desc: '3+ ta kontraktni tekshirish (reentrancy, access, oracle, overflow)',
      completed: completedTasks['task-1']
    },
    {
      id: 'task-2',
      tabId: 'static',
      number: '2',
      title: '2. Slither Statik Tahlil',
      desc: 'AST va CFG orqali Slither 0.10 detektorlarini yurgizish',
      completed: completedTasks['task-2']
    },
    {
      id: 'task-3',
      tabId: 'exploit',
      number: '3',
      title: '3. Ekspluatatsiya Testi (PoC)',
      desc: 'Foundry/Forge testida zaiflikni amalda isbotlash (drain proof)',
      completed: completedTasks['task-3']
    },
    {
      id: 'task-4',
      tabId: 'severity',
      number: '4',
      title: '4. CVSS Tasniflash',
      desc: 'CVSS 3.1 va SWC matritsasi bo‘yicha xatoni baholash',
      completed: completedTasks['task-4']
    },
    {
      id: 'task-5',
      tabId: 'fix',
      number: '5',
      title: '5. Tuzatilgan Versiya & Test',
      desc: 'CEI / OpenZeppelin patch yozish va exploit bloklanganini tasdiqlash',
      completed: completedTasks['task-5']
    },
    {
      id: 'task-6',
      tabId: 'ai-review',
      number: '6',
      title: '6. AI Audit Benchmark',
      desc: 'AI xatolari va halyutsinatsiyalarini qo‘lda tahlil qilish',
      completed: completedTasks['task-6']
    },
    {
      id: 'task-7',
      tabId: 'deploy',
      number: '7',
      title: '7. Blokcheynga Qo‘shish & Imzolash',
      desc: 'Tekshirilgan kontraktni raqamli imzolab EVM tarmog‘iga deploy qilish',
      completed: completedTasks['task-7']
    }
  ];

  return (
    <div className="cyber-card rounded-3xl p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <span>Laboratoriya Topshiriqlari Marshruti (SOC Workflow Roadmap)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Har bir topshiriqni ketma-ket bajaring va real smart-kontrakt xavfsizligini tekshiring
          </p>
        </div>
        <div className="mt-2 sm:mt-0">
          <span className="text-xs font-mono font-bold bg-slate-800/80 text-cyan-300 px-3 py-1.5 rounded-full border border-slate-700 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            SWC & OWASP Smart Contract Top 10
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => onSelectTask(task.tabId)}
            className={`text-left p-4 rounded-2xl border transition-all duration-200 flex items-start space-x-3 group relative overflow-hidden ${
              task.completed
                ? 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-400 hover:bg-emerald-950/30'
                : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {task.completed ? (
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:border-slate-500">
                  <Circle className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {task.title}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {task.desc}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
