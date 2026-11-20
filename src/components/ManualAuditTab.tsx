import React, { useState } from 'react';
import { ContractLabCase } from '../types';
import { CodeViewer } from './CodeViewer';
import {
  Search,
  CheckCircle,
  HelpCircle,
  History,
  FileCheck2,
  DollarSign,
  AlertTriangle,
  Lightbulb,
  Save,
  ShieldCheck,
  Zap,
  Terminal
} from 'lucide-react';

interface ManualAuditTabProps {
  contract: ContractLabCase;
  onCompleteChecklist: (contractId: string, checkId: string) => void;
  studentNotes: Record<string, string>;
  onSaveNotes: (contractId: string, notes: string) => void;
}

export const ManualAuditTab: React.FC<ManualAuditTabProps> = ({
  contract,
  onCompleteChecklist,
  studentNotes,
  onSaveNotes
}) => {
  const [selectedFindingLines, setSelectedFindingLines] = useState<number[]>(
    contract.findings[0]?.vulnerableLines || []
  );
  const [currentNote, setCurrentNote] = useState(studentNotes[contract.id] || '');
  const [noteSavedAlert, setNoteSavedAlert] = useState(false);

  const handleSaveNote = () => {
    onSaveNotes(contract.id, currentNote);
    setNoteSavedAlert(true);
    setTimeout(() => setNoteSavedAlert(false), 2000);
  };

  const completedChecksCount = contract.manualAuditChecklist.filter((c) => c.completed).length;

  return (
    <div className="space-y-6">
      {/* Top Banner: Task 1 Context */}
      <div className="cyber-card rounded-3xl p-6 sm:p-7 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 font-mono text-xs sm:text-sm font-bold border border-cyan-500/30 flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                1-Topshiriq: Qo‘lda Tahlil (Manual Code Review)
              </span>
              <span className="text-xs sm:text-sm text-slate-400 font-mono font-semibold bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
                SWC Registry & CWE Standarti
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mt-3 tracking-tight">
              {contract.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-3xl leading-relaxed font-medium">
              {contract.summary}
            </p>
          </div>

          {/* Historical exploit pill */}
          <div className="bg-slate-900/90 border border-rose-500/30 rounded-2xl p-4 sm:min-w-[320px] shadow-[0_0_20px_rgba(244,63,94,0.15)] relative overflow-hidden shrink-0">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-rose-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center space-x-2 text-rose-400 text-xs sm:text-sm font-bold mb-1.5">
              <History className="w-4 h-4 animate-spin-slow" />
              <span>Tarixiy Hujum (Real Incident):</span>
            </div>
            <div className="text-sm sm:text-base font-extrabold text-white">
              {contract.historicalIncident.name}
            </div>
            <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-slate-800 text-xs sm:text-sm text-slate-400 font-medium">
              <span>Sana: {contract.historicalIncident.date}</span>
              <span className="text-rose-400 font-mono font-black flex items-center gap-0.5 text-sm bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.2)]">
                <DollarSign className="w-4 h-4" />
                {contract.historicalIncident.stolenAmount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Code + Audit Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Code Viewer */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="flex items-center justify-between text-xs sm:text-sm px-1 font-semibold">
            <span className="flex items-center gap-2 text-slate-300">
              <Search className="w-4 h-4 text-cyan-400" />
              Qizil chiziqlar — audit tekshiruvida aniqlangan nozik nuqtalar
            </span>
            <span className="font-mono text-cyan-300 font-bold bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-500/40 text-xs shadow-[0_0_8px_rgba(0,240,255,0.2)]">
              Zaif qatorlar: {selectedFindingLines.join(', ')}
            </span>
          </div>

          <CodeViewer
            code={contract.vulnerableCode}
            title={contract.fileName}
            language="solidity"
            highlightLines={selectedFindingLines}
            badge="Zaif Versiya"
            badgeType="danger"
          />

          {/* Root Cause Card */}
          <div className="bg-gradient-to-r from-rose-950/40 via-slate-900/90 to-rose-950/40 border border-rose-500/40 rounded-2xl p-5 text-sm shadow-[0_0_20px_rgba(244,63,94,0.12)]">
            <h4 className="font-extrabold text-rose-400 flex items-center gap-2 mb-2 text-base">
              <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />
              Ildiz Sababi (Vulnerability Root Cause):
            </h4>
            <p className="text-slate-200 font-medium leading-relaxed">
              {contract.findings[0]?.rootCause}
            </p>
          </div>
        </div>

        {/* Right: Manual Audit Checklist & Student Findings */}
        <div className="lg:col-span-5 flex flex-col space-y-5">
          {/* Audit Steps Checklist */}
          <div className="cyber-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-cyan-400" />
                Auditor Tekshiruv Ro‘yxati
              </h3>
              <span className="text-xs sm:text-sm text-cyan-300 font-mono font-bold bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-500/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                {completedChecksCount} / {contract.manualAuditChecklist.length} tasdiqlandi
              </span>
            </div>

            <div className="space-y-3">
              {contract.manualAuditChecklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onCompleteChecklist(contract.id, item.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 group ${
                    item.completed
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-100 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start space-x-3.5">
                    <button
                      type="button"
                      className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                        item.completed
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                          : 'border border-slate-700 bg-slate-800 text-transparent group-hover:border-cyan-400'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <div className="flex-1">
                      <div className="text-sm font-bold leading-snug text-slate-100">
                        {item.task}
                      </div>
                      <div className="mt-2.5 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex items-start gap-2 leading-relaxed">
                        <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>{item.hint}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Finding Details */}
          <div className="cyber-card rounded-3xl p-6">
            <h3 className="text-base font-extrabold text-white mb-3.5 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Aniqlangan Zaiflik Tafsilotlari (Finding):
            </h3>
            {contract.findings.map((f) => (
              <div
                key={f.id}
                className="bg-slate-900/80 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-2.5 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-base">{f.title}</span>
                  <span className="font-mono text-rose-400 font-black bg-rose-950/60 px-2.5 py-0.5 rounded border border-rose-500/40 text-xs">
                    {f.severity}
                  </span>
                </div>
                <div className="flex gap-2 font-mono text-xs">
                  <span className="px-2.5 py-0.5 bg-cyan-950/80 text-cyan-300 font-bold rounded border border-cyan-800/50">
                    {f.swcId}
                  </span>
                  <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 font-semibold rounded border border-slate-700">
                    {f.cweId}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed font-medium">
                  {f.description}
                </p>
                <div className="pt-2.5 border-t border-slate-800 text-xs sm:text-sm text-amber-300 font-semibold">
                  <span className="font-black text-slate-200">Zarar (Impact):</span> {f.impact}
                </div>
              </div>
            ))}
          </div>

          {/* Auditor Notes Field */}
          <div className="cyber-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                Auditor Xulosasi & Eslatmalar:
              </h3>
              {noteSavedAlert && (
                <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)] animate-pulse">
                  Saqlandi ✓
                </span>
              )}
            </div>
            <textarea
              rows={3}
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              placeholder="Qo‘lda o‘tkazilgan tahlil natijalarini bu yerga yozing..."
              className="w-full bg-[#080d1a] border border-slate-800 rounded-2xl p-3.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 font-mono resize-none leading-relaxed transition-all"
            />
            <div className="flex justify-end mt-2.5">
              <button
                onClick={handleSaveNote}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 rounded-xl text-xs sm:text-sm font-extrabold transition-all shadow-[0_0_15px_rgba(0,240,255,0.25)] hover:scale-105 active:scale-95"
              >
                <Save className="w-4 h-4" />
                Eslatmani Saqlash
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
