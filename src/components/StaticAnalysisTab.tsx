import React, { useState } from 'react';
import { ContractLabCase } from '../types';
import {
  ShieldAlert,
  Play,
  RotateCcw,
  Terminal,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowRight,
  Radar,
  Radio,
  FileCode2
} from 'lucide-react';

interface StaticAnalysisTabProps {
  contract: ContractLabCase;
  onScanCompleted: (contractId: string) => void;
  isScanned: boolean;
}

export const StaticAnalysisTab: React.FC<StaticAnalysisTabProps> = ({
  contract,
  onScanCompleted,
  isScanned
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [activeDetector, setActiveDetector] = useState<string | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    `[INFO] Slither v0.10.2 static analyzer initialized.`,
    `[INFO] Target: contracts/${contract.fileName}`,
    `[READY] Tahlilni boshlash uchun "Slither Tahlilini Boshlash" tugmasini bosing.`
  ]);

  const runSlitherScan = () => {
    setIsRunning(true);
    setTerminalLogs([
      `[INFO] Compiling contracts/${contract.fileName} with solc-select...`,
      `[INFO] Running 93 detectors against AST & Control Flow Graph (CFG)...`
    ]);

    setTimeout(() => {
      setTerminalLogs((prev) => [
        ...prev,
        `[SCAN] Generating CFG (Control Flow Graph) representation...`,
        `[SCAN] Checking SSA (Static Single Assignment) variables...`,
        `[DETECT] Running detector: reentrancy-eth...`,
        `[DETECT] Running detector: unprotected-upgrade...`,
        `[DETECT] Running detector: arbitrary-send-erc20...`
      ]);
    }, 700);

    setTimeout(() => {
      setTerminalLogs((prev) => [
        ...prev,
        `------------------------------------------------------------`,
        `[ALERT] ${contract.slitherReport.summary}`,
        `[SUCCESS] Slither tahlili yakunlandi: ${contract.slitherReport.issues.length} ta xavfsizlik ogohlantirishi qayd etildi.`
      ]);
      setIsRunning(false);
      onScanCompleted(contract.id);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="cyber-card rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/30 flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                <Radar className="w-3.5 h-3.5 text-cyan-400" />
                2-Topshiriq: Statik Tahlil (Slither Static Analyzer)
              </span>
              <span className="text-xs text-slate-400 font-mono font-semibold bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
                AST & Data Flow Tahlili
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mt-3 tracking-tight">
              Slither & Statik Vositalar Konsoli
            </h1>
            <p className="text-sm text-slate-300 mt-1.5 max-w-3xl leading-relaxed font-medium">
              Slither dasturi Solidity kodini kompilyatsiya qilib, uni oraliq ifoda (Intermediate Representation - SlithIR) va
              boshqaruv oqimi grafigi (CFG) orqali xavfsizlik qoidalariga solishtiradi.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={runSlitherScan}
              disabled={isRunning}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-extrabold transition-all duration-200 ${
                isRunning
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:scale-105 active:scale-95'
              }`}
            >
              {isRunning ? (
                <>
                  <Cpu className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Tekshirilmoqda...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Slither Tahlilini Boshlash</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Terminal View */}
      <div className="bg-[#050811] rounded-3xl border border-slate-800/90 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#0a1020] border-b border-slate-800 text-xs sm:text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80 shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80 shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
            <span className="font-mono text-slate-300 pl-2 font-bold">terminal: bash — slither contracts/{contract.fileName}</span>
          </div>
          <span className="font-mono text-xs sm:text-sm text-cyan-400 font-bold bg-cyan-950/80 px-2.5 py-0.5 rounded border border-cyan-800/60">
            Slither Engine v0.10.2
          </span>
        </div>

        <div className="p-5 font-mono text-xs sm:text-sm text-slate-200 space-y-2 max-h-72 overflow-y-auto leading-relaxed bg-[#050811]">
          {terminalLogs.map((log, index) => {
            const isAlert = log.includes('[ALERT]');
            const isSuccess = log.includes('[SUCCESS]');
            const isDetect = log.includes('[DETECT]');
            return (
              <div
                key={index}
                className={`${
                  isAlert
                    ? 'text-rose-300 font-bold bg-rose-950/40 px-3 py-1.5 rounded-lg border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                    : isSuccess
                    ? 'text-emerald-400 font-bold bg-emerald-950/20 px-3 py-1.5 rounded-lg border border-emerald-500/30'
                    : isDetect
                    ? 'text-cyan-300'
                    : 'text-slate-400'
                }`}
              >
                {log}
              </div>
            );
          })}
        </div>
      </div>

      {/* Slither Findings Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            Slither Detektorlari Natijalari ({contract.slitherReport.issues.length} ta topilma)
          </h3>
          <span
            className={`text-xs sm:text-sm font-mono font-bold px-3 py-1.5 rounded-full border ${
              isScanned
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {isScanned ? 'Status: Tahlil yakunlangan ✓' : 'Status: Tahlil kutilmoqda'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contract.slitherReport.issues.map((issue) => {
            const isSelected = activeDetector === issue.id;
            return (
              <div
                key={issue.id}
                onClick={() => setActiveDetector(isSelected ? null : issue.id)}
                className={`p-6 rounded-3xl border transition-all duration-200 cursor-pointer shadow-lg relative overflow-hidden group ${
                  issue.impact === 'CRITICAL'
                    ? 'bg-gradient-to-br from-rose-950/30 via-slate-900/90 to-slate-900 border-rose-500/40 hover:border-rose-400'
                    : issue.impact === 'HIGH'
                    ? 'bg-gradient-to-br from-amber-950/30 via-slate-900/90 to-slate-900 border-amber-500/40 hover:border-amber-400'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs sm:text-sm font-black text-cyan-300 bg-cyan-950/80 px-3 py-1 rounded-lg border border-cyan-500/40">
                      {issue.check}
                    </span>
                    <span
                      className={`text-xs font-black px-2.5 py-0.5 rounded-full font-mono border ${
                        issue.impact === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                          : issue.impact === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      Impact: {issue.impact}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono font-bold">
                    Confidence: {issue.confidence}
                  </span>
                </div>

                <p className="text-sm text-slate-200 font-mono leading-relaxed mb-3.5 font-medium">
                  {issue.description}
                </p>

                <div className="flex items-center justify-between text-xs sm:text-sm pt-3 border-t border-slate-800 font-medium">
                  <span className="text-slate-400 font-mono">
                    Tegishli qatorlar: <strong className="text-rose-400 font-bold">{issue.lines.join(', ')}</strong>
                  </span>
                  <span className="text-cyan-400 flex items-center gap-1 font-bold group-hover:translate-x-1 transition-transform">
                    Tavsiya <ArrowRight className="w-4 h-4" />
                  </span>
                </div>

                <div className="mt-3.5 p-3.5 rounded-xl bg-[#060a14] border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                  <strong className="text-emerald-400 font-bold">Tavsiya:</strong> {issue.recommendation}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Static Analysis Comparison Table */}
      <div className="cyber-card rounded-3xl p-6">
        <h4 className="text-base font-bold text-white mb-3.5 flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          Statik Vositalar Xususiyatlari Taqqoslanishi (Benchmark)
        </h4>
        <div className="overflow-x-auto border border-slate-800 rounded-2xl">
          <table className="w-full text-xs sm:text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-300 font-mono bg-[#060a14] font-bold">
                <th className="py-3 px-4">Vosita (Tool)</th>
                <th className="py-3 px-4">Tahlil Usuli</th>
                <th className="py-3 px-4">Kuchli Tomoni</th>
                <th className="py-3 px-4">Zaif Tomoni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono text-xs sm:text-sm">
              <tr className="hover:bg-slate-900/60 transition-colors">
                <td className="py-3.5 px-4 font-bold text-cyan-400">Slither (Trail of Bits)</td>
                <td className="py-3.5 px-4 text-slate-300 font-medium">CFG, AST & Dataflow Tahlili</td>
                <td className="py-3.5 px-4 text-emerald-400 font-bold">Juda tez (&lt; 2 soniya), CI/CD integratsiyasi oson</td>
                <td className="py-3.5 px-4 text-amber-300 font-medium">Murakkab iqtisodiy/oracle mantig‘ini tushunmaydi</td>
              </tr>
              <tr className="hover:bg-slate-900/60 transition-colors">
                <td className="py-3.5 px-4 font-bold text-indigo-400">Mythril (ConsenSys)</td>
                <td className="py-3.5 px-4 text-slate-300 font-medium">Symbolic Execution (SMT Solver)</td>
                <td className="py-3.5 px-4 text-emerald-400 font-bold">Chuqur holat ekspluatatsiyalarini topadi</td>
                <td className="py-3.5 px-4 text-amber-300 font-medium">Juda sekin, state explosion muammosi</td>
              </tr>
              <tr className="hover:bg-slate-900/60 transition-colors">
                <td className="py-3.5 px-4 font-bold text-purple-400">Echidna / Medusa</td>
                <td className="py-3.5 px-4 text-slate-300 font-medium">Coverage-guided Fuzzing</td>
                <td className="py-3.5 px-4 text-emerald-400 font-bold">Invariant buzilishlarini aniq PoC bilan isbotlaydi</td>
                <td className="py-3.5 px-4 text-amber-300 font-medium">Invariants qo‘lda yozilishi kerak</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
