import React, { useState } from 'react';
import { ContractLabCase } from '../types';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Layers,
  Terminal,
  ShieldAlert,
  Award,
  Cpu,
  FileText,
  Activity,
  Flame,
  ShieldCheck,
  Check
} from 'lucide-react';

export interface StepItem {
  id: string;
  stepNumber: number;
  label: string;
  shortLabel: string;
  taskId?: string;
  icon: any;
}

export const AUDIT_STEPS: StepItem[] = [
  { id: 'manual', stepNumber: 1, label: 'Qo‘lda Audit', shortLabel: '1. Qo‘lda', taskId: 'task-1', icon: Terminal },
  { id: 'static', stepNumber: 2, label: 'Slither Tahlil', shortLabel: '2. Slither', taskId: 'task-2', icon: ShieldAlert },
  { id: 'exploit', stepNumber: 3, label: 'PoC Exploit', shortLabel: '3. PoC', taskId: 'task-3', icon: Flame },
  { id: 'severity', stepNumber: 4, label: 'CVSS Tasnif', shortLabel: '4. CVSS', taskId: 'task-4', icon: Award },
  { id: 'fix', stepNumber: 5, label: 'Tuzatish & Patch', shortLabel: '5. Patch', taskId: 'task-5', icon: CheckCircle2 },
  { id: 'ai-review', stepNumber: 6, label: 'AI Benchmark', shortLabel: '6. AI Audit', taskId: 'task-6', icon: Cpu },
  { id: 'deploy', stepNumber: 7, label: 'Blokcheyn Deploy', shortLabel: '7. Deploy', taskId: 'task-7', icon: Layers },
  { id: 'report', stepNumber: 8, label: 'Yakuniy Hisobot', shortLabel: 'Hisobot', taskId: undefined, icon: FileText }
];

interface AuditStepperHeaderProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  contracts: ContractLabCase[];
  selectedContractId: string;
  onSelectContract: (contractId: string) => void;
  completedTasks: Record<string, boolean>;
}

export const AuditStepperHeader: React.FC<AuditStepperHeaderProps> = ({
  activeTab,
  setActiveTab,
  contracts,
  selectedContractId,
  onSelectContract,
  completedTasks
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const currentContract = contracts.find((c) => c.id === selectedContractId) || contracts[0];
  const currentIndex = AUDIT_STEPS.findIndex((s) => s.id === activeTab);
  const currentStep = AUDIT_STEPS[currentIndex] || AUDIT_STEPS[0];
  const prevStep = currentIndex > 0 ? AUDIT_STEPS[currentIndex - 1] : null;

  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 7) * 100);

  return (
    <div className="bg-[#080d1a]/95 border-b border-slate-800 backdrop-blur-xl mb-6 rounded-2xl shadow-xl overflow-visible relative z-30">
      {/* Top Context Sub-Bar: Back button + Contract Switcher + Progress */}
      <div className="px-4 sm:px-6 py-3 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Back button + Contract Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3">
          {prevStep ? (
            <button
              onClick={() => {
                setActiveTab(prevStep.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 hover:text-white text-xs font-bold border border-cyan-500/40 transition-all shadow-[0_0_10px_rgba(0,240,255,0.15)] group"
              title={`Oldingi bosqich: ${prevStep.label}`}
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Orqaga <span className="hidden md:inline font-normal text-slate-400">({prevStep.shortLabel})</span></span>
            </button>
          ) : null}

          <button
            onClick={() => {
              setActiveTab('intro');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/80 transition-colors"
            title="Laboratoriya bosh sahifasiga qaytish"
          >
            {!prevStep && <ArrowLeft className="w-3.5 h-3.5" />}
            <span>Bosh sahifa</span>
          </button>

          <span className="text-slate-700">|</span>

          {/* Contract Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-cyan-500/30 hover:border-cyan-500/60 transition-all text-xs font-bold text-slate-200"
            >
              <span className="text-slate-400 font-normal hidden md:inline">Kontrakt:</span>
              <span className="font-mono text-cyan-300 font-extrabold">{currentContract.fileName}</span>
              <span
                className={`text-[10px] font-black px-1.5 py-0.2 rounded uppercase ${
                  currentContract.severity === 'CRITICAL'
                    ? 'bg-rose-500/20 text-rose-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                {currentContract.severity}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute left-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#090f1e] border border-slate-700 shadow-2xl p-2 z-50 animate-fadeIn">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5">
                    Tahlil uchun kontraktni tanlang:
                  </div>
                  <div className="space-y-1">
                    {contracts.map((c) => {
                      const isSel = c.id === selectedContractId;
                      return (
                        <button
                          key={c.id}
                          onClick={() => {
                            onSelectContract(c.id);
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-center justify-between ${
                            isSel
                              ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-200'
                              : 'hover:bg-slate-800/70 text-slate-300 border border-transparent'
                          }`}
                        >
                          <div>
                            <div className="font-mono font-bold flex items-center gap-2">
                              <span>{c.fileName}</span>
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-black uppercase ${
                                  c.severity === 'CRITICAL'
                                    ? 'bg-rose-500/20 text-rose-400'
                                    : 'bg-amber-500/20 text-amber-400'
                                }`}
                              >
                                {c.severity}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[220px]">
                              {c.title}
                            </div>
                          </div>
                          {isSel && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Active Step Name & Overall Progress */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400">
            <span>Progress:</span>
            <div className="w-20 bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-mono font-bold text-cyan-300">{completedCount}/7</span>
          </div>

          <div className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700/80 text-xs font-mono text-slate-300">
            Bosqich <span className="text-cyan-400 font-bold">{currentStep.stepNumber}</span> / 8
          </div>
        </div>
      </div>

      {/* Stepper Navigation Track */}
      <div className="px-4 sm:px-6 py-3 overflow-x-auto scrollbar-none">
        <div className="flex items-center justify-between min-w-[720px] gap-2">
          {AUDIT_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCurrent = step.id === activeTab;
            const isCompleted = step.taskId ? !!completedTasks[step.taskId] : false;

            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => {
                    setActiveTab(step.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  title={`Bosqichga o‘tish: ${step.label}`}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isCurrent
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_15px_rgba(0,240,255,0.15)] ring-1 ring-cyan-400/30'
                      : isCompleted
                      ? 'bg-emerald-950/20 hover:bg-emerald-950/30 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 ${
                      isCurrent
                        ? 'bg-cyan-500 text-[#070b14]'
                        : isCompleted
                        ? 'bg-emerald-500 text-[#070b14]'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.stepNumber}
                  </div>
                  <span className="whitespace-nowrap">{step.label}</span>
                </button>

                {idx < AUDIT_STEPS.length - 1 && (
                  <div
                    className={`h-[2px] flex-1 min-w-[12px] transition-colors ${
                      isCompleted ? 'bg-emerald-500/40' : 'bg-slate-800'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
