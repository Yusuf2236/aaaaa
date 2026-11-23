import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useWeb3 } from '../context/Web3Context';
import {
  ShieldCheck,
  X,
  CheckCircle2,
  Lock,
  Sparkles,
  User,
  Mail,
  Key,
  LogOut,
  Cpu,
  Wallet,
  ArrowRight,
  Eye,
  EyeOff
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
    loginWithMetaMaskCredentials,
    signAuditSession,
    logout
  } = useWeb3();

  // Auth Tabs: 'metamask-manual' (MetaMask Qo'lda Kiritish), 'metamask-ext' (MetaMask Extension), 'no-wallet' (MetaMasksiz)
  const [authTab, setAuthTab] = useState<'metamask-manual' | 'metamask-ext' | 'no-wallet'>('metamask-manual');

  // Form states - BARCHA STATIK MA'LUMOTLAR OLIB TASHLANGAN (BO'SH BOSHLANADI)
  const [manualAddress, setManualAddress] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('Talaba Auditor (A23/TN4)');

  const [signing, setSigning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. MetaMask Qo'lda Manzil va Parol/Kalit orqali kirish
  const handleMetaMaskManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    let inputVal = manualAddress.trim();
    if (!inputVal) {
      setErrorMsg('Iltimos, MetaMask hamyon manzilingizni (0x...), shaxsiy kalit yoki so‘zlarni kiriting');
      return;
    }

    try {
      // Backend orqali manzil, Private Key yoki Mnemonicni tahlil qilish
      const deriveRes = await fetch('/api/wallet/derive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: inputVal })
      });
      const deriveData = await deriveRes.json();

      let finalAddress = '';
      if (deriveData.success && deriveData.address) {
        finalAddress = deriveData.address;
      } else {
        if (!inputVal.startsWith('0x')) {
          inputVal = '0x' + inputVal;
        }
        if (/^0x[0-9a-fA-F]{40}$/.test(inputVal)) {
          finalAddress = inputVal;
        } else {
          setErrorMsg("Noto‘g‘ri format! Iltimos, 42 belgili MetaMask manzili (0x...), Private Key yoki Secret Phrase kiriting.");
          return;
        }
      }

      await loginWithMetaMaskCredentials({
        address: finalAddress,
        password: password.trim() || undefined,
        name: name.trim() || undefined,
        role: selectedRole
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'MetaMask akkauntini ulashda xatolik yuz berdi');
    }
  };

  // 2. MetaMask Brauzer Kengaytmasi orqali kirish
  const handleMetaMaskExtConnect = async () => {
    setErrorMsg(null);
    try {
      await connectMetaMask();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'MetaMask brauzer kengaytmasiga ulanishda xatolik yuz berdi');
    }
  };

  // 3. MetaMasksiz (Guest / Talaba) kirish
  const handleNoWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!name.trim()) {
      setErrorMsg('Iltimos, auditor ismingizni kiriting');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Iltimos, elektron pochtangizni kiriting');
      return;
    }
    try {
      await loginWithoutMetaMask(name.trim(), email.trim(), selectedRole);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Kirishda xatolik yuz berdi');
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

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/85 backdrop-blur-md p-3 sm:p-4 flex items-center justify-center animate-fade-in">
      <div className="bg-[#090f1e] border border-cyan-500/30 rounded-3xl max-w-lg w-full my-auto shadow-[0_0_50px_rgba(0,240,255,0.2)] relative text-slate-200 max-h-[92vh] flex flex-col">
        {/* Header with Close Button */}
        <div className="p-5 pb-2 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center">
            <div className="w-11 h-11 mx-auto rounded-2xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(0,240,255,0.25)] text-cyan-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              {isConnected ? 'Auditor Profili va Kripto Seans' : 'Audit Laboratoriyasiga Kirish'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-md mx-auto">
              {isConnected
                ? 'Kriptografik audit seansingiz faol. Real akkaunt balansi va manzili biriktirilgan.'
                : 'O‘zingizning real MetaMask akkauntingizni qo‘lda kiriting yoki brauzer orqali ulang.'}
            </p>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto px-5 pb-5 pt-1 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 text-xs text-rose-200">
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
                  <span className="text-slate-400">Real Hamyon Manzili (Address):</span>
                  <span className="font-mono font-bold text-cyan-300 bg-slate-900 px-2.5 py-0.5 rounded border border-slate-800">
                    {account ? `${account.slice(0, 10)}...${account.slice(-8)}` : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-400">On-Chain Balans:</span>
                  <span className="font-mono text-emerald-400 font-bold text-sm">
                    {balance} ETH
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-400">Tarmoq (Network):</span>
                  <span className="text-slate-200 font-semibold font-mono">
                    {networkName}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-400">Kirish Usuli:</span>
                  <span className="font-bold text-amber-400">
                    {authMethod === 'credentials'
                      ? 'MetaMask-siz (Email & ID)'
                      : 'Real MetaMask Akkaunti'}
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
                  Smart-kontraktlarni blokcheynga deploy qilish va hisobotga rasmiy auditor imzosini kiritish uchun seans tasdiqlangan.
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
                <span>Akkauntdan Chiqish (Disconnect / Logout)</span>
              </button>
            </div>
          ) : (
            /* STATE 2: NOT LOGGED IN - USER CHOOSES LOGIN METHOD */
            <div className="space-y-4">
              {/* Tab Selector Buttons */}
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('metamask-manual');
                    setErrorMsg(null);
                  }}
                  className={`py-2.5 px-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                    authTab === 'metamask-manual'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>MetaMask Qo‘lda</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('metamask-ext');
                    setErrorMsg(null);
                  }}
                  className={`py-2.5 px-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                    authTab === 'metamask-ext'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Extension</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('no-wallet');
                    setErrorMsg(null);
                  }}
                  className={`py-2.5 px-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                    authTab === 'no-wallet'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>MetaMasksiz</span>
                </button>
              </div>

              {/* TAB 1: METAMASK QO‘LDA KIRITISH (ASOSIY & REAL AKKAUNT) */}
              {authTab === 'metamask-manual' && (
                <form onSubmit={handleMetaMaskManualSubmit} className="space-y-3.5">
                  <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 leading-relaxed space-y-1">
                    <div className="flex items-center gap-2 font-bold text-amber-300">
                      <Wallet className="w-4 h-4 text-amber-400" />
                      <span>O‘zingizning Real MetaMask Akkauntingizni Kiriting:</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      MetaMask hamyon manzilingiz va parolingiz/kalitingizni kiriting. Tizim to‘g‘ridan-to‘g‘ri blokcheynga ulanib, real hisobingizni faollashtiradi.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      MetaMask Hamyon Manzili (Address: 0x...) <span className="text-rose-400">*</span>:
                    </label>
                    <input
                      type="text"
                      value={manualAddress}
                      onChange={(e) => setManualAddress(e.target.value)}
                      required
                      placeholder="0x... (O‘zingizning real MetaMask hamyon manzilingizni kiriting)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-amber-500 transition-colors"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      MetaMask ilovasidan "Account 1" manzilini nusxalab (0x...) shu yerga qo‘ying
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      MetaMask Paroli / Shaxsiy Kalit (Password / Key):
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="MetaMask parolingiz yoki kalitingizni kiriting..."
                        className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-900/90 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-amber-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Parol kiritilishi seansni xavfsiz himoyalash va tranzaksiyalarni tasdiqlash uchun xizmat qiladi
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Auditor Ismi (Ixtiyoriy):
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="O‘zingizning ismingizni kiriting..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Auditorlik Roli:
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
                    >
                      <option value="Talaba Auditor (A23/TN4)">Talaba Auditor (A23/TN4)</option>
                      <option value="Senior Smart-Contract Auditor">Senior Smart-Contract Auditor</option>
                      <option value="Kiberxavfsizlik Mutaxassisi">Kiberxavfsizlik Mutaxassisi</option>
                      <option value="Mustaqil Smart-Kontrakt Tekshiruvchi">Mustaqil Smart-Kontrakt Tekshiruvchi</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isConnecting}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-sm transition-all shadow-[0_0_20px_rgba(245,158,11,0.35)] flex items-center justify-center gap-2 mt-2"
                  >
                    {isConnecting ? (
                      <>
                        <Cpu className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Blokcheynga ulanmoqda...</span>
                      </>
                    ) : (
                      <>
                        <Wallet className="w-4 h-4" />
                        <span>MetaMask Akkauntimni Bog‘lash va Kirish</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* TAB 2: METAMASK BRAUZER KENGAYTMASI */}
              {authTab === 'metamask-ext' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 leading-relaxed flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                      <Wallet className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <span className="font-bold text-amber-300">MetaMask Web3 Kengaytmasi:</span>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        Brauzeringizdagi rasmiy MetaMask kengaytmasini ochish va akkaunt parolini kiritib bog‘lanish.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Auditorlik Roli:
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
                    >
                      <option value="Talaba Auditor (A23/TN4)">Talaba Auditor (A23/TN4)</option>
                      <option value="Senior Smart-Contract Auditor">Senior Smart-Contract Auditor</option>
                      <option value="Kiberxavfsizlik Mutaxassisi">Kiberxavfsizlik Mutaxassisi</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleMetaMaskExtConnect}
                    disabled={isConnecting}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-sm transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2"
                  >
                    {isConnecting ? (
                      <>
                        <Cpu className="w-4 h-4 animate-spin text-slate-950" />
                        <span>MetaMask kengaytmasi ochilmoqda...</span>
                      </>
                    ) : (
                      <>
                        <Wallet className="w-4 h-4" />
                        <span>MetaMask Kengaytmasini Ochish va Ulash</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* TAB 3: METAMASKSIZ KIRISH */}
              {authTab === 'no-wallet' && (
                <form onSubmit={handleNoWalletSubmit} className="space-y-3.5">
                  <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200 leading-relaxed flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 shrink-0 text-cyan-400" />
                    <span>
                      Brauzer kengaytmasisiz laboratoriyaga kirish. Auditor profili kiritilgan ma'lumotlaringiz asosida yaratiladi.
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Auditor Ismi / Guruh <span className="text-rose-400">*</span>:
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="O‘zingizning ismingiz va guruhingizni kiriting..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Elektron Pochta / Talaba ID <span className="text-rose-400">*</span>:
                    </label>
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Elektron pochtangizni kiriting..."
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
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isConnecting}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm transition-all shadow-[0_0_20px_rgba(0,240,255,0.35)] flex items-center justify-center gap-2"
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
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
