import React, { useState } from 'react';
import { Copy, Check, AlertOctagon, Code2, ShieldAlert, Sparkles } from 'lucide-react';

interface CodeViewerProps {
  code: string;
  language?: string;
  title?: string;
  highlightLines?: number[];
  badge?: string;
  badgeType?: 'danger' | 'success' | 'info';
  onOpenRemix?: () => void;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  language = 'solidity',
  title = 'Source Code',
  highlightLines = [],
  badge,
  badgeType = 'info',
  onOpenRemix
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
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

  const lines = code.trim().split('\n');

  const badgeColor =
    badgeType === 'danger'
      ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
      : badgeType === 'success'
      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
      : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';

  // Realistic Solidity syntax highlighter for dark mode
  const renderSyntaxHighlightedLine = (text: string) => {
    // Comments
    if (text.trim().startsWith('//') || text.trim().startsWith('/*') || text.trim().startsWith('*')) {
      return <span className="text-slate-500 italic font-mono">{text}</span>;
    }

    // Split words by space / symbols to apply highlighting tokens
    const parts = text.split(/(\s+|[(),;{}[\]])/);

    return parts.map((part, i) => {
      const p = part.trim();
      // Keywords
      if (
        ['pragma', 'solidity', 'contract', 'interface', 'library', 'is', 'function', 'external', 'public', 'private', 'internal', 'view', 'pure', 'payable', 'returns', 'return', 'modifier', 'event', 'emit', 'mapping', 'require', 'assert', 'revert', 'if', 'else', 'for', 'constructor', 'import', 'abstract'].includes(p)
      ) {
        return <span key={i} className="text-purple-400 font-bold">{part}</span>;
      }
      // Types
      if (
        ['address', 'uint256', 'uint112', 'uint32', 'uint80', 'uint8', 'int256', 'bool', 'string', 'bytes32', 'bytes'].includes(p)
      ) {
        return <span key={i} className="text-cyan-400 font-semibold">{part}</span>;
      }
      // Built-ins & Globals
      if (['msg', 'sender', 'value', 'this', 'balance', 'block', 'timestamp'].includes(p)) {
        return <span key={i} className="text-amber-300 font-semibold">{part}</span>;
      }
      // String literals
      if (part.startsWith('"') || part.endsWith('"')) {
        return <span key={i} className="text-emerald-400">{part}</span>;
      }
      // Numbers
      if (/^\d+(\.\d+)?(e\d+|ether)?$/.test(p)) {
        return <span key={i} className="text-rose-400 font-bold">{part}</span>;
      }

      return <span key={i} className="text-slate-300">{part}</span>;
    });
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#070b16] overflow-hidden flex flex-col h-full shadow-2xl">
      {/* IDE Header bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0a1020]/90 border-b border-slate-800/80 text-xs backdrop-blur-md">
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
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRemix}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/80 hover:border-cyan-500/50 hover:bg-cyan-950/30 text-slate-300 hover:text-cyan-300 transition-all font-semibold text-[11px]"
            title="Remix IDE da sinash"
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Remix IDE</span>
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

      {/* Code Table */}
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
                      ? 'bg-rose-950/40 border-l-4 border-rose-500 shadow-[inset_0_0_12px_rgba(244,63,94,0.15)] font-semibold'
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
    </div>
  );
};
