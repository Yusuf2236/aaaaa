import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Terminal,
  Cpu,
  Layers,
  Lock
} from 'lucide-react';

export const LabHeroHeader: React.FC = () => {
  return (
    <div className="cyber-card rounded-3xl p-6 sm:p-8 mb-6 relative overflow-hidden">
      {/* Decorative background ambient glows */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -mb-16 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Column: Problem, Title & Solution */}
        <div className="max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-extrabold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,240,255,0.2)]">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              9-Laboratoriya Ishi (SOC Edition)
            </span>
            <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-mono font-bold bg-slate-800/80 text-slate-300 border border-slate-700">
              A23, A16, A8 · TN2, TN4
            </span>
            <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <Flame className="w-4 h-4 text-amber-400" />
              Murakkablik: Tahliliy / Yuqori
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
            Smart-Kontrakt Xavfsizlik Auditi Laboratoriyasi
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 text-sm">
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-slate-200 backdrop-blur-sm">
              <div className="font-extrabold text-rose-400 flex items-center gap-1.5 mb-1.5 text-xs uppercase tracking-wide">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Muammo:
              </div>
              <p className="leading-relaxed font-medium text-slate-300 text-xs sm:text-sm">
                Smart-kontraktdagi bitta mantiqiy xato tuzatib bo‘lmas moliyaviy o‘g‘irlikka olib keladi. Kod blokcheynda o‘zgarmas (immutable) bo‘lgani uchun deploydan keyin qaytarib bo‘lmaydi.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-slate-200 backdrop-blur-sm">
              <div className="font-extrabold text-emerald-400 flex items-center gap-1.5 mb-1.5 text-xs uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Yechim & Maqsad:
              </div>
              <p className="leading-relaxed font-medium text-slate-300 text-xs sm:text-sm">
                Qo‘lda tahlil, Slither statik tekshiruvi, Foundry PoC ekspluatatsiya testi, CVSS tasnifi, OpenZeppelin himoyalari va AI audit baholash orqali to‘liq professional hisobot tayyorlash.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Key metrics widget */}
        <div className="grid grid-cols-2 gap-3.5 shrink-0 lg:w-80">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider">Tarixiy Zarar</div>
            <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono mt-1">$1.2B+</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Real keyslar yo‘qotishi</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider">Kontraktlar</div>
            <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono mt-1">4 ta</div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-1">To‘liq tayyorlangan</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider">Ekspluatatsiya PoC</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mt-1">100%</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Foundry / Forge test</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider">Texnik Stek</div>
            <div className="text-base sm:text-lg font-black text-purple-400 font-mono mt-1.5">Slither & OZ</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">CVSS 3.1 & EIP-4361</div>
          </div>
        </div>
      </div>
    </div>
  );
};
