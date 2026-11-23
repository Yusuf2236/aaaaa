import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { AuthModal } from './AuthModal';
import { ShieldCheck, Sparkles, Lock, ArrowRight, User, LogOut, Wallet } from 'lucide-react';

export const LoginGateBanner: React.FC = () => {
  const { isConnected, account, user, auditorRole, isSigned, logout } = useWeb3();
  const [modalOpen, setModalOpen] = useState(false);

  if (isConnected) {
    return (
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/40 rounded-3xl p-5 mb-6 shadow-[0_0_25px_rgba(0,240,255,0.1)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center space-x-4">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,240,255,0.25)]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-extrabold text-white flex flex-wrap items-center gap-2">
              <span>Auditor Seansi Faol:</span>
              <span className="text-white font-bold bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-700 text-xs">
                {user?.name || 'Auditor'}
              </span>
              <span className="font-mono text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded-lg border border-cyan-500/40 font-bold text-xs sm:text-sm">
                {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : ''}
              </span>
              <span className="text-xs font-bold text-cyan-300 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800">
                {auditorRole}
              </span>
            </div>
            <div className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
              {isSigned
                ? 'Kriptografik EIP-4361 imzosi tasdiqlangan. Audit xulosalari va tuzatilgan kontraktlar blokcheynga yozishga tayyor.'
                : 'Diqqat: Audit xulosasini to‘liq tasdiqlash uchun kriptografik seansni imzolash tavsiya etiladi.'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
          {!isSigned && (
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs sm:text-sm font-extrabold transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Seansni Imzolash</span>
            </button>
          )}

          <button
            onClick={logout}
            className="px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Chiqish</span>
          </button>
        </div>

        <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className="cyber-card border border-cyan-500/40 rounded-3xl p-6 mb-6 shadow-[0_0_20px_rgba(0,240,255,0.1)] flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,240,255,0.2)] text-cyan-400">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
            <span>Laboratoriyaga Kirish: MetaMask-siz yoki Web3 Hamyon bilan</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Kirish / Chiqish
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed font-medium">
            Smart-kontraktlar xavfsizligini tekshirish, tuzatilgan kodni tasdiqlash va rasmiy auditor imzosi bilan 
            <strong> blokcheynga qo‘shish (deploy qilish)</strong> uchun profilingiz bilan kiring. MetaMask o‘rnatilishi shart emas!
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <button
          onClick={() => setModalOpen(true)}
          className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all hover:scale-105 active:scale-95 shrink-0"
        >
          <Wallet className="w-4 h-4" />
          <span>MetaMask Akkauntini Bog‘lash</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => setModalOpen(true)}
          className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-all hover:scale-105 active:scale-95 shrink-0"
        >
          <User className="w-4 h-4 text-cyan-400" />
          <span>MetaMasksiz Kirish</span>
        </button>
      </div>

      <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};
