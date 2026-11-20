import React, { useState } from 'react';
import { ContractLabCase, DeployedContractRecord } from '../types';
import { CodeViewer } from './CodeViewer';
import { DeployToBlockchainModal } from './DeployToBlockchainModal';
import {
  ShieldCheck,
  CheckCircle2,
  Play,
  RotateCcw,
  Lock,
  ArrowRight,
  TrendingUp,
  Cpu,
  FileCheck2,
  Terminal,
  ShieldAlert,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface FixAndVerifyTabProps {
  contract: ContractLabCase;
  onFixVerified: (contractId: string) => void;
  isVerified: boolean;
  onDeploySuccess?: (record: DeployedContractRecord) => void;
}

export const FixAndVerifyTab: React.FC<FixAndVerifyTabProps> = ({
  contract,
  onFixVerified,
  isVerified,
  onDeploySuccess
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(
    isVerified ? contract.exploitScenario.finalStatePatched.result : null
  );
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);

  const scenario = contract.exploitScenario;

  const runPatchVerification = () => {
    setIsRunning(true);
    setTestResult(null);

    setTimeout(() => {
      setTestResult(scenario.finalStatePatched.result);
      setIsRunning(false);
      onFixVerified(contract.id);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="cyber-card rounded-3xl p-6 sm:p-7 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 font-mono text-xs sm:text-sm font-bold border border-emerald-500/30 flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                5-Topshiriq: Tuzatilgan Versiya va Testda Tasdiqlash
              </span>
              <span className="text-xs sm:text-sm text-slate-400 font-mono font-semibold bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
                Defense in Depth & Formal Remediation
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mt-3 tracking-tight">
              Xavfsiz Arxitektura & Qayta Tekshirish
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-1.5 max-w-3xl leading-relaxed font-medium">
              Auditor zaiflikni topish bilan cheklanmaydi — u sanoat standartlariga (OpenZeppelin, Checks-Effects-Interactions)
              mos tuzatilgan kodni yozadi va xuddi shu exploit testi endi bloklanishini tasdiqlaydi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={runPatchVerification}
              disabled={isRunning}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm sm:text-base font-extrabold transition-all duration-200 shrink-0 ${
                isRunning
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95'
              }`}
            >
              {isRunning ? (
                <>
                  <Cpu className="w-5 h-5 animate-spin text-slate-950" />
                  <span>Test Bajarilmoqda...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Tuzatishni Testda Tasdiqlash</span>
                </>
              )}
            </button>

            {(testResult || isVerified) && (
              <button
                onClick={() => setIsDeployModalOpen(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 shadow-[0_0_25px_rgba(0,240,255,0.35)] transition-all hover:scale-105 active:scale-95 shrink-0"
              >
                <Layers className="w-4 h-4" />
                <span>Imzolab Blokcheynga Qo‘shish</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Verification Result Banner (when test ran) */}
      {testResult && (
        <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-emerald-950/40 border border-emerald-500/50 rounded-3xl p-6 shadow-[0_0_25px_rgba(16,185,129,0.2)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-md">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Tuzatish Muvaffaqiyatli Tasdiqlandi (Fix Verified)!</span>
                <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  PASS
                </span>
              </div>
              <div className="text-xs sm:text-sm text-emerald-400 font-mono mt-1 font-bold">
                {testResult}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <div className="text-xs sm:text-sm text-slate-400 font-mono font-bold">Mablag‘lar Saqlab Qolindi:</div>
              <div className="text-emerald-400 font-mono font-black text-base sm:text-lg">
                {scenario.finalStatePatched.contractBalance} (100% Xavfsiz)
              </div>
            </div>
            <button
              onClick={() => setIsDeployModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Blokcheynga Qo‘shish</span>
            </button>
          </div>
        </div>
      )}

      {/* Code Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vulnerable Code */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between text-sm px-1 font-bold">
            <span className="text-rose-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              Oldingi Zaif Kod (Ekspluatatsiya qilingan)
            </span>
            <span className="font-mono text-xs font-black text-rose-400 bg-rose-950/80 px-2.5 py-0.5 rounded-full border border-rose-500/40">CRITICAL</span>
          </div>
          <CodeViewer
            code={contract.vulnerableCode}
            title={`${contract.fileName} (Zaif)`}
            language="solidity"
            highlightLines={contract.findings[0]?.vulnerableLines || []}
            badge="Oldingi Versiya"
            badgeType="danger"
          />
        </div>

        {/* Fixed Code */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between text-sm px-1 font-bold">
            <span className="text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Tuzatilgan Yangi Kod (Secure Patch)
            </span>
            <span className="font-mono text-xs font-black text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40">TUZATILDI ✓</span>
          </div>
          <CodeViewer
            code={contract.fixedCode}
            title={`${contract.fileName.replace('.sol', 'Secure.sol')}`}
            language="solidity"
            badge="Tuzatilgan Versiya"
            badgeType="success"
          />
        </div>
      </div>

      {/* Key Architectural Improvements */}
      <div className="cyber-card rounded-3xl p-6 sm:p-7">
        <h3 className="text-base sm:text-lg font-extrabold text-white mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-emerald-400" />
          Kiritilgan Asosiy Xavfsizlik O‘zgarishlari (Remediation Details):
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {contract.fixDiffNotes.map((note, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed flex items-start space-x-3.5 font-medium hover:border-slate-700 transition-colors"
            >
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 font-mono font-black text-xs sm:text-sm shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                {idx + 1}
              </div>
              <p className="pt-0.5">{note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Deploy Modal */}
      <DeployToBlockchainModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        contract={contract}
        onDeploySuccess={onDeploySuccess}
      />
    </div>
  );
};
