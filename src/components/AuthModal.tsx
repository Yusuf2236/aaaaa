import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import {
  ShieldCheck,
  X,
  ExternalLink,
  CheckCircle2,
  Lock,
  Sparkles,
  User,
  Mail,
  Key,
  LogOut,
  Cpu,
  Wallet,
  ArrowRight
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    user,
    account,
    isConnected,
    isConnecting,
    isSigned,
    auditorRole,
    authMethod,
    balance,
    networkName,
    connectMetaMask,
    loginWithoutMetaMask,
    loginWithPrivateKey,
    connectDemoWallet,
    signAuditSession,
    logout
  } = useWeb3();

  // Auth Tabs: 'no-wallet' (MetaMasksiz), 'metamask', 'private-key'
  const [authTab, setAuthTab] = useState<'no-wallet' | 'metamask' | 'private-key'>('no-wallet');

  // Form states for MetaMask-siz kirish
  const [name, setName] = useState('Abdurahmon Xakimov');
  const [email, setEmail] = useState('auditor.student@tuit.uz');
  const [selectedRole, setSelectedRole] = useState('Talaba Auditor (A23/TN4)');

  // Form states for Private Key
  const [privateKey, setPrivateKey] = useState('');

  const [signing, setSigning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleNoWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await loginWithoutMetaMask(name, email, selectedRole);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Kirishda xatolik yuz berdi');
    }
  };

  const handlePrivateKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!privateKey.trim()) {
      setErrorMsg('Iltimos, shaxsiy kalitni (Private Key) kiriting');
      return;
    }
    try {
      await loginWithPrivateKey(privateKey, name || 'Kripto Auditor', selectedRole);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Kalit bilan kirishda xatolik yuz berdi');
    }
  };

  const handleMetaMaskConnect = async () => {
    setErrorMsg(null);
    try {
      await connectMetaMask();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'MetaMask ulanishida xatolik');
    }
  };

  const handleSign = async () => {
    setSigning(true);
    await signAuditSession();
    setSigning(false);
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#090f1e] border border-cyan-500/30 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-[0_0_50px_rgba(0,240,255,0.15)] relative text-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(0,240,255,0.25)] text-cyan-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {isConnected ? 'Auditor Profili va Kripto Seans' : 'Audit Laboratoriyasiga Kirish'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
            {isConnected
              ? 'Kriptografik audit seansingiz faol. Audit xulosalarini imzolash va boshqarish imkoniyati.'
              : 'MetaMask talab qilinmaydi! O‘zingizga qulay usulda tizimga kiring.'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300">
            {errorMsg}
          </div>
        )}

        {/* STATE 1: ALREADY LOGGED IN */}
        {isConnected ? (
          <div className="space-y-4">
            <div className="bg-[#050811] rounded-2xl p-4 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-400">Foydalanuvchi:</span>
                <span className="font-bold text-white flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  {user?.name || 'Auditor'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-400">Auditorlik Roli:</span>
                <span className="font-semibold text-cyan-300 bg-cyan-950/60 px-2.5 py-0.5 rounded-lg border border-cyan-800/40">
                  {auditorRole}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-400">Kripto Manzil (Address):</span>
                <span className="font-mono font-bold text-slate-200 bg-slate-900 px-2.5 py-0.5 rounded border border-slate-800">
                  {account ? `${account.slice(0, 8)}...${account.slice(-6)}` : ''}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-400">Ulangan Tarmoq / Balans:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {networkName} ({balance} ETH)
                </span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-400">Kirish Usuli:</span>
                <span className="font-bold text-amber-400 capitalize">
                  {authMethod === 'credentials'
                    ? 'MetaMask-siz (Email & ID)'
                    : authMethod === 'metamask'
                    ? 'MetaMask Hamyoni'
                    : authMethod === 'private_key'
                    ? 'Shaxsiy Kalit (Private Key)'
                    : 'Simulyatsiya Hamyoni'}
                </span>
              </div>
            </div>

            {/* Cryptographic Session Sign */}
            <div className="bg-[#050811] border border-cyan-500/30 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-cyan-400" />
                  Kriptografik EIP-4361 Seans Imzosi:
                </span>
                {isSigned ? (
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Tasdiqlangan ✓
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                    Imzo Kutilmoqda
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Smart-kontraktlarni blokcheynga deploy qilish va hisobotga rasmiy imzo kiritish uchun seansni tasdiqlang.
              </p>

              {!isSigned && (
                <button
                  onClick={handleSign}
                  disabled={signing}
                  className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-extrabold text-xs transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>{signing ? 'Imzolanmoqda...' : 'Audit Seansini Imzolash'}</span>
                </button>
              )}
            </div>

            {/* Logout / Disconnect Button */}
            <button
              onClick={handleLogout}
              className="w-full py-3 rounded-2xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 hover:text-white border border-rose-500/40 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <LogOut className="w-4 h-4" />
              <span>Tizimdan Chiqish (Logout)</span>
            </button>
          </div>
        ) : (
          /* STATE 2: NOT LOGGED IN - CHOOSE LOGIN METHOD */
          <div className="space-y-5">
            {/* Nav Switcher */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800">
              <button
                type="button"
                onClick={() => setAuthTab('no-wallet')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  authTab === 'no-wallet'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>MetaMasksiz</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthTab('metamask')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  authTab === 'metamask'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>MetaMask</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthTab('private-key')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  authTab === 'private-key'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>Shaxsiy Kalit</span>
              </button>
            </div>

            {/* TAB 1: METAMASKSIZ KIRISH (RECOMMENDED & INSTANT) */}
            {authTab === 'no-wallet' && (
              <form onSubmit={handleNoWalletSubmit} className="space-y-4">
                <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200 leading-relaxed flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5 shrink-0 text-cyan-400" />
                  <span>
                    Hech qanday brauzer kengaytmasi (extension) kerak emas. Avtomatik ravishda auditor profili va kripto kaliti biriktiriladi.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Auditor Ismi / Guruh:
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Masalan: Abdurahmon Xakimov (A23)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Elektron Pochta / Talaba ID:
                  </label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="auditor@universitet.uz"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Auditorlik Roli:
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    <option value="Talaba Auditor (A23/TN4)">Talaba Auditor (A23/TN4)</option>
                    <option value="Senior Smart-Contract Auditor">Senior Smart-Contract Auditor</option>
                    <option value="Kiberxavfsizlik Mutaxassisi">Kiberxavfsizlik Mutaxassisi</option>
                    <option value="O‘qituvchi / Kafedra Tekshiruvchisi">O‘qituvchi / Kafedra Tekshiruvchisi</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isConnecting}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm transition-all shadow-[0_0_20px_rgba(0,240,255,0.35)] flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
                >
                  {isConnecting ? (
                    <>
                      <Cpu className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Kripto profil yaratilmoqda...</span>
                    </>
                  ) : (
                    <>
                      <span>MetaMasksiz Tizimga Kirish</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 2: METAMASK ORQALI KIRISH */}
            {authTab === 'metamask' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 leading-relaxed flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                    <Wallet className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <span className="font-bold text-amber-300">MetaMask Web3 Hamyoni:</span> Brauzer kengaytmasi orqali shaxsiy manzilingizni ulang va real tranzaksiyalarni imzolang.
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Auditorlik Roli:
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    <option value="Talaba Auditor (A23/TN4)">Talaba Auditor (A23/TN4)</option>
                    <option value="Senior Smart-Contract Auditor">Senior Smart-Contract Auditor</option>
                    <option value="Kiberxavfsizlik Mutaxassisi">Kiberxavfsizlik Mutaxassisi</option>
                    <option value="O‘qituvchi / Kafedra Tekshiruvchisi">O‘qituvchi / Kafedra Tekshiruvchisi</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleMetaMaskConnect}
                  disabled={isConnecting}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-sm transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2"
                >
                  {isConnecting ? (
                    <>
                      <Cpu className="w-4 h-4 animate-spin text-slate-950" />
                      <span>MetaMask bilan ulanmoqda...</span>
                    </>
                  ) : (
                    <>
                      <span>MetaMask Hamyonini Ulash</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      connectDemoWallet(selectedRole);
                      onClose();
                    }}
                    className="text-xs text-slate-400 hover:text-cyan-300 transition-colors underline"
                  >
                    MetaMask yo‘qmi? Foundry/Anvil Test Hamyoni bilan kiring
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: SHAXSIY KALIT (PRIVATE KEY) */}
            {authTab === 'private-key' && (
              <form onSubmit={handlePrivateKeySubmit} className="space-y-4">
                <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200 leading-relaxed flex items-center gap-2.5">
                  <Key className="w-5 h-5 shrink-0 text-indigo-400" />
                  <span>
                    EVM mos shaxsiy kalit (Private Key) yoki Anvil lokal test kalitini kiriting.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Shaxsiy Kalit (Hex Private Key):
                  </label>
                  <input
                    type="password"
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    placeholder="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setPrivateKey('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80')}
                    className="mt-1.5 text-[11px] text-cyan-400 hover:underline block"
                  >
                    + Standart Anvil #1 kalitini to‘ldirish
                  </button>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Auditor Ismi:
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Auditor Ismi"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isConnecting}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-sm transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  <span>Kalit Bilan Kirish</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
