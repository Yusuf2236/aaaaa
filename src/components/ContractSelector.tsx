import React from 'react';
import { ContractLabCase } from '../types';
import { Flame, Coins, ShieldCheck, DollarSign, Activity } from 'lucide-react';

interface ContractSelectorProps {
  contracts: ContractLabCase[];
  selectedContractId: string;
  onSelectContract: (id: string) => void;
}

export const ContractSelector: React.FC<ContractSelectorProps> = ({
  contracts,
  selectedContractId,
  onSelectContract
}) => {
  return (
    <div className="bg-[#090f1e]/80 border-b border-slate-800/80 py-5 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <h2 className="text-xs sm:text-sm font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Flame className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>Tahlil Qilinayotgan Smart-Kontraktlar (Real Hujum Keyslari):</span>
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-cyan-950/60 text-cyan-300 px-3 py-1 rounded-full border border-cyan-800/50 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              {contracts.length} ta kontrakt (Laboratoriya bazasi)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {contracts.map((c) => {
            const isSelected = c.id === selectedContractId;
            return (
              <button
                key={c.id}
                onClick={() => onSelectContract(c.id)}
                className={`text-left p-4 rounded-2xl transition-all duration-200 border relative overflow-hidden group ${
                  isSelected
                    ? 'bg-gradient-to-br from-cyan-950/40 via-slate-900/90 to-indigo-950/40 border-cyan-500/60 shadow-[0_0_20px_rgba(0,240,255,0.15)] ring-1 ring-cyan-400/40'
                    : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none overflow-hidden">
                    <div className="absolute transform rotate-45 bg-gradient-to-r from-cyan-500 to-indigo-600 text-[#070b14] font-mono font-black text-[10px] py-0.5 right-[-35px] top-[18px] w-[130px] text-center shadow-lg uppercase tracking-wider">
                      FAOL
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-extrabold text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-800/40 group-hover:border-cyan-500/50 transition-colors">
                    {c.fileName}
                  </span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                      c.severity === 'CRITICAL'
                        ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {c.severity}
                  </span>
                </div>

                <div className="text-xs font-extrabold text-slate-200 group-hover:text-white transition-colors line-clamp-1 mb-1.5">
                  {c.title}
                </div>

                <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <span className="truncate max-w-[140px] text-slate-400">
                    {c.historicalIncident.name}
                  </span>
                  <span className="font-mono font-bold text-rose-400 flex items-center shrink-0">
                    <DollarSign className="w-3.5 h-3.5" />
                    {c.historicalIncident.stolenAmount}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
