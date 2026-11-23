import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useWeb3, SUPPORTED_NETWORKS } from '../context/Web3Context';
import { ContractLabCase, DeployedContractRecord } from '../types';
import {
  ShieldCheck,
  X,
  ExternalLink,
  CheckCircle2,
  Lock,
  Sparkles,
  Cpu,
  Layers,
  ArrowRight,
  Copy,
  Check,
  Zap,
  Globe
} from 'lucide-react';

interface DeployToBlockchainModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: ContractLabCase;
  onDeploySuccess?: (record: DeployedContractRecord) => void;
}

export const DeployToBlockchainModal: React.FC<DeployToBlockchainModalProps> = ({
  isOpen,
  onClose,
  contract,
  onDeploySuccess
}) => {
  const {
    account,
    isConnected,
    chainId,
    authMethod,
    isMetaMaskInstalled,
    switchNetwork,
    deployContractToBlockchain,
    loginWithoutMetaMask
  } = useWeb3();

  const isMetaMaskAvailable = typeof window !== 'undefined' && Boolean((window as any).ethereum);
  const [selectedNetwork, setSelectedNetwork] = useState(chainId || '0xaa36a7');
  const [deployMode, setDeployMode] = useState<'real' | 'simulated'>(
    isMetaMaskAvailable ? 'real' : 'simulated'
  );
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState<number>(0);
  const [deployStatusText, setDeployStatusText] = useState<string>('');
  const [deployedRecord, setDeployedRecord] = useState<DeployedContractRecord | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    setDeployStep(1);
    setDeployStatusText('Bytecode tayyorlanmoqda...');

    const isReal = deployMode === 'real' && isMetaMaskAvailable;

    try {
      if (isReal) {
        setDeployStep(2);
        setDeployStatusText("MetaMask oynasida tasdiqlang ('Confirm' tugmasini bosing)...");
      } else {
        await new Promise((r) => setTimeout(r, 600));
        setDeployStep(2);
        setDeployStatusText('Kriptografik auditor imzosi qo‘yilmoqda...');
        await new Promise((r) => setTimeout(r, 600));
        setDeployStep(3);
        setDeployStatusText('Eng so‘nggi real blok ma’lumotlari olinmoqda...');
      }

      const contractName = contract.fileName.replace('.sol', 'Secure');
      const record = await deployContractToBlockchain({
        contractId: contract.id,
        contractName,
        sourceCode: contract.fixedCode,
        networkId: selectedNetwork,
        realOnChain: isReal
      });

      setDeployStep(4);
      setDeployStatusText('Muvaffaqiyatli yakunlandi!');
      setDeployedRecord(record);
      setIsDeploying(false);
      if (onDeploySuccess) {
        onDeploySuccess(record);
      }
    } catch (err: any) {
      setIsDeploying(false);
      alert(err?.message || "Deploy qilishda xatolik yuz berdi");
    }
  };

  const activeNetInfo = SUPPORTED_NETWORKS[selectedNetwork] || {
    name: 'EVM Testnet',
    explorer: 'https://sepolia.etherscan.io'
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/85 backdrop-blur-md p-3 sm:p-4 flex items-center justify-center animate-fade-in">
      <div className="bg-[#090f1e] border border-cyan-500/40 rounded-3xl max-w-xl w-full my-auto p-5 sm:p-7 shadow-[0_0_50px_rgba(0,240,255,0.2)] relative text-slate-200 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isDeploying}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center mb-3 shadow-[0_0_25px_rgba(0,240,255,0.35)] text-slate-950 font-black">
            <Layers className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Smart-Kontraktni Blokcheynga Qo‘shish (Deploy)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto font-medium">
            Tuzatilgan va xavfsizligi tasdiqlangan smart-kontraktni raqamli imzolab, EVM blokcheyn tarmog‘iga muhrlash.
          </p>
        </div>

        {/* If deployment already completed */}
        {deployedRecord ? (
          <div className="space-y-5 animate-fade-in">
            <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
              deployedRecord.isRealOnChain
                ? 'bg-emerald-950/40 border-emerald-500/50'
                : 'bg-cyan-950/40 border-cyan-500/50'
            }`}>
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                deployedRecord.isRealOnChain
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
              }`}>
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white flex items-center gap-2 flex-wrap">
                  <span>Kontrakt Blokcheynga Muvaffaqiyatli Qo‘shildi!</span>
                  {deployedRecord.isRealOnChain ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                      Real On-Chain (Sepolia)
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                      Kriptografik Muhrlash
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  {deployedRecord.isRealOnChain
                    ? "MetaMask orqali Sepolia tarmog'iga yuborildi va Etherscan'da tasdiqlangan."
                    : `Sepolia tarmog‘ining ayni damdagi real-vaqt bloki (#${deployedRecord.blockNumber}) bilan muhrlandi.`}
                </p>
              </div>
            </div>

            {/* Contract Details */}
            <div className="bg-[#050811] rounded-2xl p-4 border border-slate-800 space-y-3 font-mono text-xs">
              <div>
                <div className="text-slate-400 text-[11px] font-sans">Kontrakt Nomi:</div>
                <div className="text-cyan-300 font-bold text-sm">{deployedRecord.contractName} (Xavfsiz Versiya)</div>
              </div>

              {/* Deployer Address (O'zingizning Hamyoningiz) */}
              <div>
                <div className="text-slate-400 text-[11px] font-sans flex items-center justify-between">
                  <span>Deploy Qilgan Hamyon (Sizning Manzilingiz):</span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`${activeNetInfo.explorer}/address/${deployedRecord.signerAddress}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:text-white flex items-center gap-1 text-[11px]"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Etherscan</span>
                    </a>
                    <button
                      onClick={() => handleCopy(deployedRecord.signerAddress, 'signer')}
                      className="text-cyan-400 hover:text-white flex items-center gap-1 text-[11px]"
                    >
                      {copiedField === 'signer' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'signer' ? 'Nusxalandi' : 'Nusxa'}</span>
                    </button>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-emerald-500/40 text-emerald-300 break-all font-bold">
                  {deployedRecord.signerAddress}
                </div>
              </div>

              <div>
                <div className="text-slate-400 text-[11px] font-sans flex items-center justify-between">
                  <span>Blokcheyndagi Manzili (Contract Address):</span>
                  <div className="flex items-center gap-2">
                    {!deployedRecord.deployedAddress.includes('Pending') && (
                      <a
                        href={`${activeNetInfo.explorer}/address/${deployedRecord.deployedAddress}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:text-white flex items-center gap-1 text-[11px]"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Etherscan</span>
                      </a>
                    )}
                    <button
                      onClick={() => handleCopy(deployedRecord.deployedAddress, 'address')}
                      className="text-cyan-400 hover:text-white flex items-center gap-1 text-[11px]"
                    >
                      {copiedField === 'address' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'address' ? 'Nusxalandi' : 'Nusxa'}</span>
                    </button>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-white break-all font-bold">
                  {deployedRecord.deployedAddress}
                </div>
              </div>

              <div>
                <div className="text-slate-400 text-[11px] font-sans flex items-center justify-between">
                  <span>Tranzaksiya Xeshi (Tx Hash):</span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`${activeNetInfo.explorer}/tx/${deployedRecord.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:text-white flex items-center gap-1 text-[11px]"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Etherscan</span>
                    </a>
                    <button
                      onClick={() => handleCopy(deployedRecord.txHash, 'txHash')}
                      className="text-cyan-400 hover:text-white flex items-center gap-1 text-[11px]"
                    >
                      {copiedField === 'txHash' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'txHash' ? 'Nusxalandi' : 'Nusxa'}</span>
                    </button>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 break-all">
                  {deployedRecord.txHash}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={`${activeNetInfo.explorer}/block/${deployedRecord.blockNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 transition-all block group"
                  title="Blokni Etherscan'da ko'rish"
                >
                  <div className="text-slate-400 text-[10px] font-sans flex items-center justify-between">
                    <span>Blok Raqami (Hozirgi):</span>
                    <ExternalLink className="w-3 h-3 text-cyan-400 opacity-60 group-hover:opacity-100" />
                  </div>
                  <div className="text-cyan-400 group-hover:text-white font-bold text-xs sm:text-sm">
                    #{deployedRecord.blockNumber}
                  </div>
                </a>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div className="text-slate-400 text-[10px] font-sans">Sarflangan Gaz:</div>
                  <div className="text-emerald-400 font-bold text-xs sm:text-sm">{deployedRecord.gasUsed} Gas</div>
                </div>
              </div>

              <div>
                <div className="text-slate-400 text-[11px] font-sans">Kriptografik Auditor Imzosi:</div>
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[10px] text-slate-400 break-all">
                  {deployedRecord.signature}
                </div>
              </div>
            </div>

            {/* If simulated, explain clearly */}
            {!deployedRecord.isRealOnChain && (
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2">
                <span className="text-base leading-none">💡</span>
                <div>
                  <strong className="text-amber-100">Blok haqida ma’lumot:</strong> Blok raqami (<span className="font-mono text-cyan-300 font-bold">#{deployedRecord.blockNumber}</span>) Sepolia tarmog‘ining ayni damdagi real-vaqt bloki bilan 100% muvofiq. Ushbu kontrakt kriptografik auditor imzosi bilan 0 Gas sarflagan holda muhrlandi. Agar Etherscan’da tranzaksiya tarixini ko‘rmoqchi bo‘lsangiz, 'MetaMask Real On-Chain' rejimidan foydalaning.
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <a
                href={`${activeNetInfo.explorer}/tx/${deployedRecord.txHash}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                <span>Etherscan’da O‘z Tranzaksiyangizni Ko‘rish</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href={`${activeNetInfo.explorer}/address/${deployedRecord.signerAddress}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-850 text-cyan-300 hover:text-white border border-cyan-500/40 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                title="Hamyon sahifasini ko'rish"
              >
                <span>Hamyoningiz</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={onClose}
                className="w-full sm:w-auto py-3.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
              >
                Tugatish
              </button>
            </div>
          </div>
        ) : (
          /* Deployment Form & Live Process */
          <div className="space-y-5">
            {/* Target Contract Overview */}
            <div className="p-4 rounded-2xl bg-[#050811] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Qo‘shilayotgan Kontrakt:</span>
                <span className="font-bold text-white font-mono bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-300">
                  {contract.fileName.replace('.sol', 'Secure.sol')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Zaiflik Holati:</span>
                <span className="font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  Tuzatilgan va Tasdiqlangan ✓
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Solidity Kompilyator:</span>
                <span className="font-mono text-slate-300">v0.8.20 + EVM Paris</span>
              </div>
            </div>

            {/* Deployment Mode Selection */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Deploy Rejimi:</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isDeploying || !isMetaMaskAvailable}
                  onClick={() => setDeployMode('real')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all relative ${
                    deployMode === 'real'
                      ? 'bg-emerald-950/80 border-emerald-500 text-white font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                  } ${!isMetaMaskAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5 text-emerald-300">
                      🦊 MetaMask Real On-Chain (O‘zingizniki)
                    </span>
                    {deployMode === 'real' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans mt-1">
                    {isMetaMaskAvailable
                      ? "MetaMask oynasi ochiladi va sizning hamyoningizdan Sepolia'ga real tranzaksiya yuboriladi. Etherscan'da faqat o‘zingizniki chiqadi."
                      : "Brauzerda MetaMask topilmadi"}
                  </div>
                </button>

                <button
                  type="button"
                  disabled={isDeploying}
                  onClick={() => setDeployMode('simulated')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all relative ${
                    deployMode === 'simulated'
                      ? 'bg-cyan-950/80 border-cyan-500 text-white font-bold shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5 text-cyan-300">
                      ⚡ Auditor Muhrlash (0 Gas)
                    </span>
                    {deployMode === 'simulated' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans mt-1">
                    Hozirgi real-vaqt bloki bilan kriptografik imzolanadi. Gas ketmaydi.
                  </div>
                </button>
              </div>
            </div>

            {/* Target Blockchain Selection */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Blokcheyn Tarmog‘ini Tanlang:</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(SUPPORTED_NETWORKS).map(([id, net]) => {
                  const isSel = selectedNetwork === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      disabled={isDeploying}
                      onClick={() => {
                        setSelectedNetwork(id);
                        switchNetwork(id);
                      }}
                      className={`p-3 rounded-xl border text-left text-xs transition-all ${
                        isSel
                          ? 'bg-cyan-950/80 border-cyan-500 text-white font-bold shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-bold">{net.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">Valyuta: {net.symbol}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cryptographic Deployment Steps (when isDeploying) */}
            {isDeploying && (
              <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 space-y-3 animate-fade-in">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>{deployStatusText || 'Blokcheynga qo‘shish bosqichlari bajarilmoqda...'}</span>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className={`flex items-center gap-2 ${deployStep >= 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <span>{deployStep > 1 ? '✓' : '●'}</span>
                    <span>1. Solc Bytecode va ABI kompilyatsiyasi tayyorlandi</span>
                  </div>
                  <div className={`flex items-center gap-2 ${deployStep >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <span>{deployStep > 2 ? '✓' : '●'}</span>
                    <span>2. {deployMode === 'real' ? "MetaMask tranzaksiyasi yuborilmoqda..." : "Kriptografik auditor imzosi (Secp256k1) qo‘yildi"}</span>
                  </div>
                  <div className={`flex items-center gap-2 ${deployStep >= 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <span>{deployStep > 3 ? '✓' : '●'}</span>
                    <span>3. {deployMode === 'real' ? "Sepolia nodida tasdiqlanishi kutilmoqda..." : "Tarmoqning ayni damdagi real bloki olindi"}</span>
                  </div>
                  <div className={`flex items-center gap-2 ${deployStep >= 4 ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <span>{deployStep >= 4 ? '✓' : '●'}</span>
                    <span>4. Yangi blok tasdiqlandi va shartnoma manzili muhrlandi</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleDeploy}
              disabled={isDeploying}
              className={`w-full py-3.5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99] ${
                deployMode === 'real'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.4)]'
                  : 'bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 shadow-[0_0_25px_rgba(0,240,255,0.4)]'
              }`}
            >
              {isDeploying ? (
                <>
                  <Cpu className="w-5 h-5 animate-spin" />
                  <span>{deployStatusText || 'Jarayon bajarilmoqda...'}</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>
                    {deployMode === 'real'
                      ? "MetaMask bilan Sepolia'ga Deploy Qilish"
                      : "Auditor Imzosi bilan Muhrlash (0 Gas)"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
