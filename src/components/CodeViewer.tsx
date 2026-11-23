import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  AlertOctagon,
  Code2,
  Edit3,
  Eye,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Play
} from 'lucide-react';

interface CodeViewerProps {
  code: string;
  language?: string;
  title?: string;
  highlightLines?: number[];
  badge?: string;
  badgeType?: 'danger' | 'success' | 'info';
  editable?: boolean;
  onOpenRemix?: () => void;
  onCodeSaved?: (newCode: string) => void;
  onAuditRun?: (newVulnerableLines: number[], issues: any[]) => void;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  language = 'solidity',
  title = 'Source Code',
  highlightLines = [],
  badge,
  badgeType = 'info',
  editable = true,
  onOpenRemix,
  onCodeSaved,
  onAuditRun
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editorCode, setEditorCode] = useState(code);
  const [isSaving, setIsSaving] = useState(false);
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // Update editorCode when incoming code changes (e.g. contract switch)
  useEffect(() => {
    setEditorCode(code);
    setIsEditing(false);
    setSaveStatus({ type: null, message: '' });
  }, [code, title]);

  const handleCopy = () => {
    navigator.clipboard.writeText(isEditing ? editorCode : code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemix = () => {
    if (onOpenRemix) {
      onOpenRemix();
    } else {
      window.open('https://remix.ethereum.org', '_blank');
    }
  };

  const handleSaveAndCompile = async () => {
    setIsSaving(true);
    setSaveStatus({ type: null, message: '' });

    try {
      const cleanFileName = title.replace(' (Zaif)', '').replace(' (Secure)', '').trim();
      const res = await fetch('/api/contracts/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: cleanFileName,
          code: editorCode
        })
      });

      const data = await res.json();
      if (data.success) {
        setSaveStatus({
          type: 'success',
          message: data.message || 'Kompilyatsiya muvaffaqiyatli! Kod saqlandi.'
        });
        if (onCodeSaved) {
          onCodeSaved(editorCode);
        }
      } else {
        setSaveStatus({
          type: 'error',
          message: data.error || 'Kompilyatsiyada xatolik yuz berdi.'
        });
      }
    } catch (err: any) {
      setSaveStatus({
        type: 'error',
        message: err?.message || 'Tarmoq xatosi.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunAudit = async () => {
    setIsRunningAudit(true);
    setSaveStatus({ type: null, message: '' });

    try {
      const cleanFileName = title.replace(' (Zaif)', '').replace(' (Secure)', '').trim();
      const res = await fetch('/api/audit/scan-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: cleanFileName,
          code: isEditing ? editorCode : code
        })
      });

      const data = await res.json();
      if (data.success) {
        setSaveStatus({
          type: 'success',
          message: `✓ Run tahlili yakunlandi: ${data.totalIssues} ta zaiflik aniqlandi va quyida qizil bilan belgilandi!`
        });
        setIsEditing(false); // Switch to view mode so highlighted lines are clearly shown
        if (onAuditRun) {
          onAuditRun(data.vulnerableLines || [], data.issues || []);
        }
        if (onCodeSaved && isEditing) {
          onCodeSaved(editorCode);
        }
      } else {
        setSaveStatus({
          type: 'error',
          message: data.error || 'Audit skanerida xatolik yuz berdi.'
        });
      }
    } catch (err: any) {
      setSaveStatus({
        type: 'error',
        message: err?.message || 'Server bilan bog‘lanishda xatolik.'
      });
    } finally {
      setIsRunningAudit(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Tab key inserts 4 spaces instead of defocusing
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      const newCode = editorCode.substring(0, start) + '    ' + editorCode.substring(end);
      setEditorCode(newCode);

      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      }, 0);
    }

    // Ctrl+S or Cmd+S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSaveAndCompile();
    }
  };

  const lines = (isEditing ? editorCode : code).trim().split('\n');

  const badgeColor =
    badgeType === 'danger'
      ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
      : badgeType === 'success'
      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
      : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';

  // Realistic Solidity syntax highlighter for dark mode
  const renderSyntaxHighlightedLine = (text: string) => {
    if (text.trim().startsWith('//') || text.trim().startsWith('/*') || text.trim().startsWith('*')) {
      return <span className="text-slate-500 italic font-mono">{text}</span>;
    }

    const parts = text.split(/(\s+|[(),;{}[\]])/);

    return parts.map((part, i) => {
      const p = part.trim();
      if (
        ['pragma', 'solidity', 'contract', 'interface', 'library', 'is', 'function', 'external', 'public', 'private', 'internal', 'view', 'pure', 'payable', 'returns', 'return', 'modifier', 'event', 'emit', 'mapping', 'require', 'assert', 'revert', 'if', 'else', 'for', 'constructor', 'import', 'abstract'].includes(p)
      ) {
        return <span key={i} className="text-purple-400 font-bold">{part}</span>;
      }
      if (
        ['address', 'uint256', 'uint112', 'uint32', 'uint80', 'uint8', 'int256', 'bool', 'string', 'bytes32', 'bytes'].includes(p)
      ) {
        return <span key={i} className="text-cyan-400 font-semibold">{part}</span>;
      }
      if (['msg', 'tx', 'block', 'abi', 'this'].includes(p)) {
        return <span key={i} className="text-amber-400 font-semibold">{part}</span>;
      }
      if (['sender', 'value', 'origin', 'timestamp', 'number', 'balance'].includes(p)) {
        return <span key={i} className="text-amber-300 font-medium">{part}</span>;
      }
      if (p.startsWith('"') || p.startsWith("'")) {
        return <span key={i} className="text-emerald-400">{part}</span>;
      }
      if (/^\d+(\.\d+)?(e\d+|ether)?$/.test(p)) {
        return <span key={i} className="text-rose-400 font-bold">{part}</span>;
      }

      return <span key={i} className="text-slate-300">{part}</span>;
    });
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#070b16] overflow-hidden flex flex-col h-full shadow-2xl">
      {/* IDE Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-[#0a1020]/90 border-b border-slate-800/80 text-xs backdrop-blur-md">
        <div className="flex items-center space-x-2.5">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          </div>
          <span className="font-mono text-slate-200 font-bold pl-2 flex items-center gap-1.5">
            <span className="text-cyan-400">◇</span> {title}
          </span>
          {badge && (
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border uppercase tracking-wider ${badgeColor}`}>
              {badge}
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* RUN / AUDIT BUTTON */}
          <button
            onClick={handleRunAudit}
            disabled={isRunningAudit || isSaving}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-black text-[11px] shadow-[0_0_15px_rgba(244,63,94,0.35)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            title="Kodni run qilib, barcha zaifliklarni qizil rang bilan aniqlash"
          >
            {isRunningAudit ? (
              <>
                <Cpu className="w-3.5 h-3.5 animate-spin" />
                <span>Run qilinmoqda...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>▶ Run / Audit</span>
              </>
            )}
          </button>

          {editable && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border transition-all font-semibold text-[11px] ${
                isEditing
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                  : 'bg-slate-900/80 border-slate-700/80 hover:border-cyan-500/50 hover:bg-cyan-950/30 text-slate-300 hover:text-cyan-300'
              }`}
              title={isEditing ? "Ko'rish rejimiga qaytish" : "Kodni qo'lda yozish va tahrirlash"}
            >
              {isEditing ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ko‘rish</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Qo‘lda Yozish</span>
                </>
              )}
            </button>
          )}

          {isEditing && (
            <>
              <button
                onClick={handleSaveAndCompile}
                disabled={isSaving || isRunningAudit}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-[11px] shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50"
                title="Kodni saqlash va Foundry orqali kompilyatsiya qilish (Ctrl+S)"
              >
                {isSaving ? (
                  <>
                    <Cpu className="w-3.5 h-3.5 animate-spin" />
                    <span>Saqlanmoqda...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Saqlash</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setEditorCode(code);
                  setSaveStatus({ type: null, message: '' });
                }}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-[11px] transition-colors"
                title="Kodni asliga qaytarish"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Asliga</span>
              </button>
            </>
          )}

          <button
            onClick={handleRemix}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/80 hover:border-cyan-500/50 hover:bg-cyan-950/30 text-slate-300 hover:text-cyan-300 transition-all font-semibold text-[11px]"
            title="Remix IDE da ochish"
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Remix</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/80 hover:border-cyan-500/50 hover:bg-cyan-950/30 text-slate-300 hover:text-cyan-300 transition-all font-semibold text-[11px]"
            title="Kodni nusxalash"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Nusxalandi' : 'Nusxa'}</span>
          </button>
        </div>
      </div>

      {/* Save / Compiler Feedback Banner */}
      {saveStatus.type && (
        <div
          className={`px-4 py-2.5 text-xs font-mono flex items-start gap-2.5 border-b animate-fade-in ${
            saveStatus.type === 'success'
              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
              : 'bg-rose-950/60 text-rose-300 border-rose-500/40'
          }`}
        >
          {saveStatus.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {saveStatus.message}
          </div>
        </div>
      )}

      {/* Editor or Viewer Body */}
      {isEditing ? (
        <div className="relative flex-1 bg-[#050811] flex flex-col font-mono text-sm min-h-[400px]">
          <div className="px-4 py-1.5 bg-[#090f1f] text-[11px] text-cyan-300 border-b border-slate-800 flex items-center justify-between">
            <span>✏️ Qo‘lda yozish va tahrirlash faol (Tab = 4 bo‘sh joy, Ctrl+S = Saqlash)</span>
            <span className="text-slate-400">{lines.length} qator</span>
          </div>
          <textarea
            value={editorCode}
            onChange={(e) => setEditorCode(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            className="w-full flex-1 p-4 bg-transparent text-slate-200 font-mono text-xs sm:text-sm leading-6 resize-y focus:outline-none focus:ring-1 focus:ring-cyan-500/50 min-h-[380px] scrollbar-thin"
            placeholder="// Solidity kodini shu yerga yozing yoki nusxalang..."
          />
        </div>
      ) : (
        <div className="p-4 sm:p-5 overflow-x-auto font-mono text-sm leading-6 select-text bg-[#070b16]">
          <table className="w-full border-collapse">
            <tbody>
              {lines.map((line, idx) => {
                const lineNum = idx + 1;
                const isHighlighted = highlightLines.includes(lineNum);
                return (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      isHighlighted
                        ? 'bg-rose-950/60 border-l-4 border-rose-500 shadow-[inset_0_0_15px_rgba(244,63,94,0.25)] font-semibold text-rose-100'
                        : 'hover:bg-slate-900/40'
                    }`}
                  >
                    <td className="w-12 select-none text-right pr-4 text-slate-600 font-mono text-xs align-top">
                      {lineNum}
                    </td>
                    <td className="whitespace-pre font-mono">
                      {isHighlighted && (
                        <span className="inline-block mr-2 text-rose-400 font-bold" title="Zaif nuqta">
                          <AlertOctagon className="w-4 h-4 inline pb-0.5 text-rose-500 animate-pulse" />
                        </span>
                      )}
                      {renderSyntaxHighlightedLine(line)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
