import React from 'react';
import { AUDIT_STEPS } from './AuditStepperHeader';
import { ArrowLeft, ArrowRight, CheckCircle2, FileText, ChevronRight } from 'lucide-react';

interface AuditStepperFooterProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  contractName: string;
}

export const AuditStepperFooter: React.FC<AuditStepperFooterProps> = ({
  activeTab,
  setActiveTab,
  contractName
}) => {
  const currentIndex = AUDIT_STEPS.findIndex((s) => s.id === activeTab);
  if (currentIndex === -1) return null;

  const prevStep = currentIndex > 0 ? AUDIT_STEPS[currentIndex - 1] : null;
  const nextStep = currentIndex < AUDIT_STEPS.length - 1 ? AUDIT_STEPS[currentIndex + 1] : null;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoTo = (tabId: string) => {
    setActiveTab(tabId);
    scrollToTop();
  };

  return (
    <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Previous Step Button */}
      {prevStep ? (
        <button
          onClick={() => handleGoTo(prevStep.id)}
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-bold flex items-center justify-center gap-2 transition-all group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Oldingi bosqich: <strong className="text-white">{prevStep.label}</strong></span>
        </button>
      ) : (
        <button
          onClick={() => handleGoTo('intro')}
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kirish sahifasiga qaytish</span>
        </button>
      )}

      {/* Center info */}
      <div className="text-center text-xs text-slate-500 font-medium hidden md:block">
        Tahlil qilinmoqda: <span className="font-mono text-cyan-400 font-bold">{contractName}</span>
      </div>

      {/* Next Step Button */}
      {nextStep ? (
        <button
          onClick={() => handleGoTo(nextStep.id)}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all group"
        >
          <span>Keyingi bosqich: <strong className="text-white">{nextStep.label}</strong></span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      ) : (
        <button
          onClick={() => handleGoTo('intro')}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Laboratoriyani Yakunlash</span>
        </button>
      )}
    </div>
  );
};
