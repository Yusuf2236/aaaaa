import React, { useState } from 'react';
import { ContractLabCase, Severity } from '../types';
import {
  Award,
  AlertOctagon,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  FileCheck,
  Grid,
  Activity,
  SlidersHorizontal
} from 'lucide-react';

interface SeverityClassificationTabProps {
  contract: ContractLabCase;
  onClassified: (contractId: string, severity: Severity) => void;
  isClassified: boolean;
}

export const SeverityClassificationTab: React.FC<SeverityClassificationTabProps> = ({
  contract,
  onClassified,
  isClassified
}) => {
  // Interactive Risk Parameters
  const [impact, setImpact] = useState<'High' | 'Medium' | 'Low'>('High');
  const [likelihood, setLikelihood] = useState<'High' | 'Medium' | 'Low'>('High');
  const [attackVector, setAttackVector] = useState<'Network' | 'Adjacent' | 'Local'>('Network');
  const [privileges, setPrivileges] = useState<'None' | 'Low' | 'High'>('None');

  // Calculate dynamic CVSS score
  const calculateCVSS = () => {
    let base = 4.0;
    if (impact === 'High') base += 4.5;
    else if (impact === 'Medium') base += 2.5;
    else base += 1.0;

    if (likelihood === 'High') base += 1.0;
    else if (likelihood === 'Medium') base += 0.5;

    if (attackVector === 'Network') base += 0.4;
    if (privileges === 'None') base += 0.5;

    const finalScore = Math.min(10.0, Math.round(base * 10) / 10);
    return finalScore;
  };

  const cvssScore = calculateCVSS();

  const getCalculatedSeverity = (score: number): Severity => {
    if (score >= 9.0) return 'CRITICAL';
    if (score >= 7.0) return 'HIGH';
    if (score >= 4.0) return 'MEDIUM';
    if (score >= 0.1) return 'LOW';
    return 'INFORMATIONAL';
  };

  const calculatedSeverity = getCalculatedSeverity(cvssScore);

  const handleConfirmClassification = () => {
    onClassified(contract.id, calculatedSeverity);
  };

  // Matrix cell definition
  const MATRIX_CELLS: {
    imp: 'High' | 'Medium' | 'Low';
    lik: 'Low' | 'Medium' | 'High';
    label: string;
    sev: Severity;
    color: string;
    activeBorder: string;
  }[] = [
    { imp: 'High', lik: 'Low', label: 'Medium', sev: 'MEDIUM', color: 'bg-cyan-950/40 text-cyan-300 border-cyan-800/60', activeBorder: 'border-cyan-400 ring-2 ring-cyan-400/50' },
    { imp: 'High', lik: 'Medium', label: 'High', sev: 'HIGH', color: 'bg-amber-950/40 text-amber-300 border-amber-800/60', activeBorder: 'border-amber-400 ring-2 ring-amber-400/50' },
    { imp: 'High', lik: 'High', label: 'Critical', sev: 'CRITICAL', color: 'bg-rose-950/50 text-rose-300 border-rose-800/60', activeBorder: 'border-rose-500 ring-2 ring-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.4)]' },
    { imp: 'Medium', lik: 'Low', label: 'Low', sev: 'LOW', color: 'bg-slate-900 text-slate-400 border-slate-800', activeBorder: 'border-slate-500 ring-2 ring-slate-500/50' },
    { imp: 'Medium', lik: 'Medium', label: 'Medium', sev: 'MEDIUM', color: 'bg-cyan-950/40 text-cyan-300 border-cyan-800/60', activeBorder: 'border-cyan-400 ring-2 ring-cyan-400/50' },
    { imp: 'Medium', lik: 'High', label: 'High', sev: 'HIGH', color: 'bg-amber-950/40 text-amber-300 border-amber-800/60', activeBorder: 'border-amber-400 ring-2 ring-amber-400/50' },
    { imp: 'Low', lik: 'Low', label: 'Info', sev: 'INFORMATIONAL', color: 'bg-slate-950 text-slate-500 border-slate-900', activeBorder: 'border-slate-600 ring-2 ring-slate-600/50' },
    { imp: 'Low', lik: 'Medium', label: 'Low', sev: 'LOW', color: 'bg-slate-900 text-slate-400 border-slate-800', activeBorder: 'border-slate-500 ring-2 ring-slate-500/50' },
    { imp: 'Low', lik: 'High', label: 'Medium', sev: 'MEDIUM', color: 'bg-cyan-950/40 text-cyan-300 border-cyan-800/60', activeBorder: 'border-cyan-400 ring-2 ring-cyan-400/50' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="cyber-card rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 font-mono text-xs font-bold border border-amber-500/30 flex items-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                4-Topshiriq: Jiddiylikni Tasniflash (Severity Matrix)
              </span>
              <span className="text-xs text-slate-400 font-mono font-semibold bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
                CVSS v3.1 & SWC Registry
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mt-3 tracking-tight">
              Xavf Matritsasi & CVSS 3.1 Kalkulyatori
            </h1>
            <p className="text-sm text-slate-300 mt-1.5 max-w-3xl leading-relaxed font-medium">
              Topilgan zaiflikning ta’siri (Impact) va uni amalga oshirish ehtimolini (Likelihood) baholash orqali
              xalqaro CVSS 3.1 formula bo‘yicha ballni hisoblang va rasmiy tasnifni tasdiqlang.
            </p>
          </div>

          <button
            onClick={handleConfirmClassification}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-extrabold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95 shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Tasnifni Tasdiqlash</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Matrix + CVSS Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 3x3 Heatmap Matrix */}
        <div className="lg:col-span-7 cyber-card rounded-3xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              <Grid className="w-4 h-4 text-cyan-400" />
              Vizual 3x3 Xavf Matritsasi (Interaktiv Matritsa):
            </h3>
            <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-500/40">
              Topilma: {contract.findings[0]?.id}
            </span>
          </div>

          {/* Interactive Heatmap Table */}
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[420px]">
              <div className="text-center text-xs font-mono font-bold text-slate-400 mb-2 uppercase tracking-wider">
                ← Ehtimollik (Likelihood) →
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                {/* Header Row */}
                <div className="p-2 text-slate-500 font-bold text-[11px] flex items-center justify-center">
                  Zarar ↓
                </div>
                <div className="p-2 bg-slate-900 rounded-xl text-slate-400 font-bold border border-slate-800">Low</div>
                <div className="p-2 bg-slate-900 rounded-xl text-slate-400 font-bold border border-slate-800">Medium</div>
                <div className="p-2 bg-slate-900 rounded-xl text-slate-400 font-bold border border-slate-800">High</div>

                {/* Rows for High, Medium, Low */}
                {(['High', 'Medium', 'Low'] as const).map((impLevel) => (
                  <React.Fragment key={impLevel}>
                    <div className="p-2 bg-slate-900 rounded-xl text-slate-300 font-bold border border-slate-800 flex items-center justify-center">
                      {impLevel}
                    </div>
                    {(['Low', 'Medium', 'High'] as const).map((likLevel) => {
                      const isSelected = impact === impLevel && likelihood === likLevel;
                      const cell = MATRIX_CELLS.find((c) => c.imp === impLevel && c.lik === likLevel)!;
                      return (
                        <button
                          key={likLevel}
                          onClick={() => {
                            setImpact(impLevel);
                            setLikelihood(likLevel);
                          }}
                          className={`p-3.5 rounded-xl border text-xs font-bold transition-all relative ${cell.color} ${
                            isSelected
                              ? `${cell.activeBorder} scale-105 z-10 font-extrabold shadow-lg`
                              : 'opacity-70 hover:opacity-100 hover:scale-[1.02]'
                          }`}
                        >
                          <div>{cell.label}</div>
                          {isSelected && (
                            <div className="text-[9px] font-mono font-black uppercase mt-1 tracking-wider text-cyan-300">
                              [FAOL]
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Attack Vector & Privileges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 mt-2 border-t border-slate-800/80">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                Hujum Yo‘nalishi (Attack Vector):
              </label>
              <select
                value={attackVector}
                onChange={(e) => setAttackVector(e.target.value as any)}
                className="w-full bg-[#060a14] border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60 font-mono font-medium"
              >
                <option value="Network">Network (Internet / Web3 RPC orqali)</option>
                <option value="Adjacent">Adjacent (L2 yoki maxsus bridge)</option>
                <option value="Local">Local (Faqat multisig ishtirokchisi)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                Talab Etiladigan Huquq (Privileges):
              </label>
              <select
                value={privileges}
                onChange={(e) => setPrivileges(e.target.value as any)}
                className="w-full bg-[#060a14] border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60 font-mono font-medium"
              >
                <option value="None">None (Ixtiyoriy hamyon/haker)</option>
                <option value="Low">Low (Foydalanuvchi/depozitor)</option>
                <option value="High">High (Faqat admin / multisig)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right: Dynamic CVSS Score & Severity Badge */}
        <div className="lg:col-span-5 flex flex-col space-y-5">
          <div className="cyber-card rounded-3xl p-6 text-center flex-1 flex flex-col justify-center items-center relative overflow-hidden">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">
              CVSS v3.1 Xavf Bahosi
            </span>

            <div className="my-3 flex items-baseline justify-center space-x-1.5">
              <span
                className={`text-6xl font-black font-mono tracking-tight ${
                  calculatedSeverity === 'CRITICAL'
                    ? 'text-rose-400 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]'
                    : calculatedSeverity === 'HIGH'
                    ? 'text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                    : 'text-cyan-400 drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]'
                }`}
              >
                {cvssScore.toFixed(1)}
              </span>
              <span className="text-slate-500 font-mono text-xl font-bold">/ 10.0</span>
            </div>

            <div
              className={`px-4 py-1.5 rounded-full font-black font-mono text-sm uppercase tracking-wider mb-4 border ${
                calculatedSeverity === 'CRITICAL'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                  : calculatedSeverity === 'HIGH'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              }`}
            >
              Jiddiylik: {calculatedSeverity}
            </div>

            <p className="text-xs text-slate-300 max-w-sm leading-relaxed font-medium">
              {calculatedSeverity === 'CRITICAL'
                ? 'Bu darajadagi zaiflik protokol deployment qilinishidan oldin to‘xtatilishini shart qiladi. Mablag‘ yo‘qotish ehtimoli 100%.'
                : calculatedSeverity === 'HIGH'
                ? 'Protokol ishiga jiddiy putur yetkazuvchi va mablag‘larni xavf ostiga qo‘yuvchi yuqori darajadagi topilma.'
                : 'O‘rtacha darajali xavf, tuzatilishi tavsiya etiladi.'}
            </p>

            {isClassified && (
              <div className="mt-4 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                ✓ Auditor tomonidan tasdiqlangan
              </div>
            )}
          </div>

          {/* Standard Matrix Legend */}
          <div className="cyber-card rounded-3xl p-5 text-xs space-y-2">
            <div className="font-bold text-white mb-2 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-cyan-400" />
              Sanoat Standartlari (ConsenSys & OpenZeppelin):
            </div>
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center justify-between p-2.5 bg-rose-950/30 rounded-xl border border-rose-500/30">
                <span className="text-rose-400 font-bold">Critical (9.0 - 10.0)</span>
                <span className="text-slate-300 font-medium">To‘g‘ridan-to‘g‘ri o‘g‘irlik</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-amber-950/30 rounded-xl border border-amber-500/30">
                <span className="text-amber-400 font-bold">High (7.0 - 8.9)</span>
                <span className="text-slate-300 font-medium">Shartli zarar / Muzlatish</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-cyan-950/30 rounded-xl border border-cyan-500/30">
                <span className="text-cyan-400 font-bold">Medium (4.0 - 6.9)</span>
                <span className="text-slate-300 font-medium">Qisman DoS / Katta gaz</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-bold">Low & Info (0.1 - 3.9)</span>
                <span className="text-slate-400 font-medium">Kod sifati / Pragma</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
