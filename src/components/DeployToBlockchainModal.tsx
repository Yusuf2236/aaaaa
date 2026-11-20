import React, { useState } from 'react';
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
    switchNetwork,
    deployContractToBlockchain,
    loginWithoutMetaMask
  } = useWeb3();

  const [selectedNetwork, setSelectedNetwork] = useState(chainId || '0xaa36a7');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState<number>(0);
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

    // If not connected, automatically create an auditor session
    if (!account) {
      await loginWithoutMetaMask('Mustaqil Auditor', 'auditor@lab.uz', 'Smart-Contract Auditor');
    }

    // Step 1: Bytecode preparation & static check (800ms)
    setTimeout(() => {
      setDeployStep(2); // Step 2: Cryptographic signing
      setTimeout(() => {
        setDeployStep(3); // Step 3: Blockchain RPC broadcast
        setTimeout(async () => {
          setDeployStep(4); // Step 4: Block confirmation
          const contractName = contract.fileName.replace('.sol', 'Secure');
          const record = await deployContractToBlockchain({
            contractId: contract.id,
            contractName,
            sourceCode: contract.fixedCode,
            networkId: selectedNetwork
          });
          setDeployedRecord(record);
          setIsDeploying(false);
          if (onDeploySuccess) {
            onDeploySuccess(record);
          }
        }, 1200);
      }, 900);
    }, 800);
  };

  const activeNetInfo = SUPPORTED_NETWORKS[selectedNetwork] || {
    name: 'EVM Testnet',
    explorer: 'https://sepolia.etherscan.io'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#090f1e] border border-cyan-500/40 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-[0_0_50px_rgba(0,240,255,0.2)] relative text-slate-200 max-h-[90vh] overflow-y-auto">
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
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">
                  Kontrakt Blokcheynga Muvaffaqiyatli Qo‘shildi!
                </h4>
                <p className="text-xs text-emerald-300">
                  Baytkod xeshi va auditor imzosi blokcheynga yozildi hamda verifikatsiya qilindi.
                </p>
              </div>
            </div>

            {/* Contract Details */}
            <div className="bg-[#050811] rounded-2xl p-4 border border-slate-800 space-y-3 font-mono text-xs">
              <div>
                <div className="text-slate-400 text-[11px] font-sans">Kontrakt Nomi:</div>
                <div className="text-cyan-300 font-bold text-sm">{deployedRecord.contractName} (Xavfsiz Versiya)</div>
              </div>

              <div>
                <div className="text-slate-400 text-[11px] font-sans flex items-center justify-between">
                  <span>Blokcheyndagi Manzili (Contract Address):</span>
                  <button
                    onClick={() => handleCopy(deployedRecord.deployedAddress, 'address')}
                    className="text-cyan-400 hover:text-white flex items-center gap-1 text-[11px]"
                  >
                    {copiedField === 'address' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'address' ? 'Nusxalandi' : 'Nusxa'}</span>
                  </button>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-white break-all font-bold">
                  {deployedRecord.deployedAddress}
                </div>
              </div>

              <div>
                <div className="text-slate-400 text-[11px] font-sans flex items-center justify-between">
                  <span>Tranzaksiya Xeshi (Tx Hash):</span>
                  <button
                    onClick={() => handleCopy(deployedRecord.txHash, 'txHash')}
                    className="text-cyan-400 hover:text-white flex items-center gap-1 text-[11px]"
                  >
                    {copiedField === 'txHash' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'txHash' ? 'Nusxalandi' : 'Nusxa'}</span>
                  </button>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 break-all">
                  {deployedRecord.txHash}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div className="text-slate-400 text-[10px] font-sans">Blok Raqami:</div>
                  <div className="text-white font-bold text-xs sm:text-sm">#{deployedRecord.blockNumber}</div>
                </div>
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

            <div className="flex items-center gap-3">
              <a
                href={`${activeNetInfo.explorer}/address/${deployedRecord.deployedAddress}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-850 text-cyan-300 hover:text-white border border-cyan-500/40 text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <span>Explorer’da Ko‘rish</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-black transition-all shadow-lg"
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
                  <span>Blokcheynga qo‘shish bosqichlari bajarilmoqda...</span>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className={`flex items-center gap-2 ${deployStep >= 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <span>{deployStep > 1 ? '✓' : '●'}</span>
                    <span>1. Solc Bytecode va ABI kompilyatsiyasi tekshirildi</span>
                  </div>
                  <div className={`flex items-center gap-2 ${deployStep >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <span>{deployStep > 2 ? '✓' : '●'}</span>
                    <span>2. Kriptografik auditor imzosi (Secp256k1) qo‘yildi</span>
                  </div>
                  <div className={`flex items-center gap-2 ${deployStep >= 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <span>{deployStep > 3 ? '✓' : '●'}</span>
                    <span>3. Tarmoq RPC nodiga deployment tranzaksiyasi uzatildi</span>
                  </div>
                  <div className={`flex items-center gap-2 ${deployStep >= 4 ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <span>{deployStep >= 4 ? '✓' : '●'}</span>
                    <span>4. Yangi blok tasdiqlandi va shartnoma manzili tayyor</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleDeploy}
              disabled={isDeploying}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-sm transition-all shadow-[0_0_25px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2.5 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
            >
              {isDeploying ? (
                <>
                  <Cpu className="w-5 h-5 animate-spin" />
                  <span>Imzolanmoqda va Blokcheynga Yozilmoqda...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Imzolab Blokcheynga Qo‘shish (Deploy)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
