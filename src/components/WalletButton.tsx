import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { AuthModal } from './AuthModal';
import {
  Wallet,
  CheckCircle2,
  ChevronDown,
  LogOut,
  ShieldCheck,
  Lock,
  User,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const WalletButton: React.FC = () => {
  const {
    user,
    account,
    balance,
    networkName,
    isConnected,
    isSigned,
    auditorRole,
    authMethod,
    logout
  } = useWeb3();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const truncatedAccount = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : '';

  return (
    <div className="relative">
      {!isConnected ? (
        <div className="flex items-center space-x-2">
          {/* Kirish Tugmasi (MetaMasksiz yoki MetaMask bilan) */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <Wallet className="w-4 h-4 shrink-0" />
            <span>Kirish</span>
            <span className="hidden sm:inline text-[10px] font-bold opacity-90">(MetaMask / Web3)</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          {/* Network tag */}
          <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-slate-900 text-slate-300 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {networkName}
          </span>

          {/* Account Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900/90 hover:bg-slate-800 transition-all text-xs font-semibold text-slate-200"
            >
              <div className="w-6 h-6 rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-800/50 flex items-center justify-center font-mono font-bold text-[10px]">
                {authMethod === 'credentials' ? 'ID' : 'Ξ'}
              </div>
              <div className="text-left font-mono">
                <div className="text-white font-bold leading-none text-xs flex items-center gap-1">
                  <span>{user?.name ? user.name.split(' ')[0] : truncatedAccount}</span>
                </div>
                <div className="text-[10px] text-cyan-400 font-semibold leading-tight mt-0.5">
                  {balance} ETH
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-[#090f1e] border border-cyan-500/30 rounded-2xl p-3 shadow-2xl z-50 animate-fade-in text-xs space-y-2 backdrop-blur-xl">
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <div className="text-[11px] text-slate-400 font-medium">Auditor Statusi:</div>
                  <div className="font-bold text-white flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    {auditorRole}
                  </div>
                  <div className="text-[10px] font-mono text-cyan-300 mt-1 truncate">
                    {account}
                  </div>
                  <div className="text-[10px] font-mono text-slate-300 mt-1.5 flex items-center justify-between">
                    <span>Imzo Holati:</span>
                    <span className={isSigned ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                      {isSigned ? 'Tasdiqlangan ✓' : 'Imzolanmagan'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    setIsModalOpen(true);
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 text-slate-300 font-medium transition-colors flex items-center gap-2"
                >
                  <Lock className="w-4 h-4 text-cyan-400" />
                  <span>Auditor Profili & Imzolash</span>
                </button>

                <div className="border-t border-slate-800 pt-1">
                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 font-bold transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Tizimdan Chiqish (Logout)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Visible Chiqish (Logout) button */}
          <button
            onClick={logout}
            title="Tizimdan chiqish"
            className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs font-bold transition-all hover:scale-105 active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Chiqish</span>
          </button>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
