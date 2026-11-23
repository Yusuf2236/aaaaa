import React, { useState } from 'react';
import { ContractLabCase } from '../types';
import { AIAuditComparisonCase, AI_AUDIT_DATA } from '../data/aiAuditComparison';
import {
  Cpu,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BarChart3,
  ThumbsDown,
  Sparkles,
  Save,
  Radio,
  BrainCircuit
} from 'lucide-react';

interface AIAuditReviewTabProps {
  contract: ContractLabCase;
  onReviewCompleted: (contractId: string) => void;
  isReviewed: boolean;
}

export const AIAuditReviewTab: React.FC<AIAuditReviewTabProps> = ({
  contract,
  onReviewCompleted,
  isReviewed
}) => {
  const comparisonData =
    AI_AUDIT_DATA.find((c) => c.contractId === contract.id) || AI_AUDIT_DATA[0];

  const [studentScore, setStudentScore] = useState<number>(3);
  const [studentCritique, setStudentCritique] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load existing saved critique on contract change
  React.useEffect(() => {
    fetch('/api/notes')
      .then((res) => res.json())
      .then((data) => {
        if (data && data[`ai_critique_${contract.id}`]) {
          setStudentCritique(data[`ai_critique_${contract.id}`]);
        }
      })
      .catch(() => {});
  }, [contract.id]);

  const handleSaveReview = () => {
    setSavedSuccess(true);
    // Persist critique to backend
    fetch('/api/notes')
      .then((res) => res.json())
      .then((existing) => {
        const updated = {
          ...existing,
          [`ai_critique_${contract.id}`]: studentCritique,
          [`ai_score_${contract.id}`]: studentScore
        };
        fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
      })
      .catch(() => {});

    onReviewCompleted(contract.id);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="cyber-card rounded-3xl p-6 sm:p-7 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-purple-500/15 text-purple-300 font-mono text-xs sm:text-sm font-bold border border-purple-500/30 flex items-center gap-1.5 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                <BrainCircuit className="w-4 h-4 text-purple-400" />
                6-Topshiriq: AI Vositasining Auditini Baholash & Taqqoslash
              </span>
              <span className="text-xs sm:text-sm text-slate-400 font-mono font-semibold bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
                LLM vs Human Auditor Benchmark
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mt-3 tracking-tight">
              AI Auditorining Xato va O‘tkazib Yuborishlarini Tahlil Qilish
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-1.5 max-w-3xl leading-relaxed font-medium">
              Sun’iy intellekt modellari smart-kontrakt auditida tezkor bo‘lsada, gallyutsinatsiyalar,
              eski tavsiyalar (deprecated patterns) va kontekstual DeFi xatolarini o‘tkazib yuborishga moyil.
            </p>
          </div>

          <button
            onClick={handleSaveReview}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm sm:text-base font-extrabold bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-105 active:scale-95 shrink-0"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>AI Baholashini Tasdiqlash</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="cyber-card rounded-2xl p-4 text-center">
          <div className="text-[11px] font-mono font-bold text-slate-400 mb-1 uppercase tracking-wider">Precision (Aniqlik)</div>
          <div className="text-3xl font-black font-mono text-cyan-400 drop-shadow-[0_0_10px_rgba(0,240,255,0.4)]">
            {comparisonData.metrics.precision}%
          </div>
        </div>
        <div className="cyber-card rounded-2xl p-4 text-center">
          <div className="text-[11px] font-mono font-bold text-slate-400 mb-1 uppercase tracking-wider">Recall (Qamrov)</div>
          <div className="text-3xl font-black font-mono text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]">
            {comparisonData.metrics.recall}%
          </div>
        </div>
        <div className="cyber-card rounded-2xl p-4 text-center">
          <div className="text-[11px] font-mono font-bold text-slate-400 mb-1 uppercase tracking-wider">False Positives</div>
          <div className="text-3xl font-black font-mono text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]">
            {comparisonData.metrics.falsePositiveRate}%
          </div>
        </div>
        <div className="cyber-card rounded-2xl p-4 text-center">
          <div className="text-[11px] font-mono font-bold text-slate-400 mb-1 uppercase tracking-wider">O‘tkazib Yuborish</div>
          <div className="text-3xl font-black font-mono text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.4)]">
            {comparisonData.metrics.falseNegativeRate}%
          </div>
        </div>
        <div className="cyber-card rounded-2xl p-4 text-center col-span-2 sm:col-span-1">
          <div className="text-[11px] font-mono font-bold text-slate-400 mb-1 uppercase tracking-wider">Gallyutsinatsiya</div>
          <div className="text-3xl font-black font-mono text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]">
            {comparisonData.metrics.hallucinationScore}%
          </div>
        </div>
      </div>

      {/* Side-by-side Human vs AI Verdict */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Human Auditor */}
        <div className="cyber-card rounded-3xl p-6 sm:p-7 space-y-3.5 border-cyan-500/30">
          <div className="flex items-center space-x-2.5 text-cyan-400">
            <UserCheck className="w-6 h-6" />
            <h3 className="font-black text-base text-white">
              Professional Inson Auditor Xulosasi (Human Auditor)
            </h3>
          </div>
          <div className="bg-[#060a14] rounded-2xl p-4 sm:p-5 text-sm font-mono text-slate-200 leading-relaxed border border-slate-800 font-medium">
            {comparisonData.humanAuditorVerdict}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
            Insoniy auditor kodning nafaqat sintaktik qismini, balki biznes-logikasi, L2 gaz qoidalari va
            kompozabillik xavfini to‘liq hisobga oladi.
          </p>
        </div>

        {/* AI Auditor */}
        <div className="cyber-card rounded-3xl p-6 sm:p-7 space-y-3.5 border-purple-500/30">
          <div className="flex items-center space-x-2.5 text-purple-400">
            <Cpu className="w-6 h-6" />
            <h3 className="font-black text-base text-white">
              AI Modeli Xulosasi ({comparisonData.aiToolTested})
            </h3>
          </div>
          <div className="bg-[#060a14] rounded-2xl p-4 sm:p-5 text-sm font-mono text-slate-200 leading-relaxed border border-slate-800 font-medium">
            {comparisonData.aiAuditorVerdict}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
            Test qilingan model: <span className="font-mono font-bold text-purple-300">{comparisonData.model}</span> (Prompt: {comparisonData.promptMethod})
          </p>
        </div>
      </div>

      {/* Discrepancy Breakdown Cards */}
      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          AI Auditining Xatoliklari va O‘tkazib Yuborilgan Nuqtalar:
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {comparisonData.discrepancies.map((d, index) => {
            const isDanger = d.type === 'Hallucinated Logic' || d.type === 'False Negative (Missed)';
            const isSuccess = d.type === 'Correct Detection';
            return (
              <div
                key={index}
                className={`p-5 rounded-2xl border text-sm leading-relaxed space-y-2.5 shadow-lg ${
                  isSuccess
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-200'
                    : isDanger
                    ? 'bg-rose-950/30 border-rose-500/40 text-slate-200'
                    : 'bg-amber-950/20 border-amber-500/40 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono font-black border ${
                      isSuccess
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : isDanger
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {d.type}
                  </span>
                </div>
                <div className="font-extrabold text-white text-base">{d.title}</div>
                <p className="text-slate-300 leading-relaxed font-medium text-xs sm:text-sm">{d.description}</p>
                <div className="pt-2.5 border-t border-slate-800 text-xs text-slate-400 font-medium">
                  <strong className="text-slate-200 font-bold">Oqibat:</strong> {d.impactOnReport}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Student AI Evaluation Matrix */}
      <div className="cyber-card rounded-3xl p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Talabaning AI Auditini Baholash Xulosasi
          </h3>
          {savedSuccess && (
            <span className="text-xs sm:text-sm text-emerald-400 font-mono font-bold bg-emerald-950/80 px-3 py-1.5 rounded-full border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)] animate-pulse">
              Baholash saqlandi va topshiriq bajarildi ✓
            </span>
          )}
        </div>

        <div>
          <label className="text-xs sm:text-sm font-bold text-slate-300 block mb-2">
            AI Auditoriga Ball Bering (1 dan 5 gacha yulduz):
          </label>
          <div className="flex space-x-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setStudentScore(star)}
                className={`w-12 h-12 rounded-2xl font-bold font-mono transition-all text-base ${
                  studentScore >= star
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.35)] scale-105'
                    : 'bg-slate-900 text-slate-500 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {star} ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs sm:text-sm font-bold text-slate-300 block mb-2">
            Auditorlik Mulohazasi (AI nimalarni o‘tkazib yubordi va xulosangiz):
          </label>
          <textarea
            rows={3}
            value={studentCritique}
            onChange={(e) => setStudentCritique(e.target.value)}
            placeholder="Masalan: AI oddiy reentrancy holatini to'g'ri topdi, biroq transfer() tavsiyasi eskirgan edi va uni to'g'irlash lozim bo'ldi..."
            className="w-full bg-[#060a14] border border-slate-800 rounded-2xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 font-mono resize-none font-medium leading-relaxed"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSaveReview}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white rounded-2xl text-sm font-extrabold transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-105 active:scale-95"
          >
            <Save className="w-4 h-4" />
            Baholashni Qayd Qilish
          </button>
        </div>
      </div>
    </div>
  );
};
