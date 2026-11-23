import React, { useState } from 'react';
import { ContractLabCase, DeployedContractRecord } from '../types';
import { useWeb3, SUPPORTED_NETWORKS } from '../context/Web3Context';
import { DeployToBlockchainModal } from './DeployToBlockchainModal';
import {
  Layers,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Zap,
  Globe,
  Lock,
  Cpu,
  ArrowUpRight,
  Terminal,
  Code2,
  Play
} from 'lucide-react';

interface BlockchainDeployTabProps {
  contract: ContractLabCase;
  onDeploySuccess?: (record: DeployedContractRecord) => void;
}

export const BlockchainDeployTab: React.FC<BlockchainDeployTabProps> = ({
  contract,
  onDeploySuccess
}) => {
  const {
    account,
    isConnected,
    deployedContracts,
    chainId,
    networkName,
    deployContractToBlockchain,
    loginWithoutMetaMask
  } = useWeb3();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Custom contract deployment input
  const [customContractName, setCustomContractName] = useState('SecurityVaultV2');
  const [customSource, setCustomSource] = useState(`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SecurityVaultV2 is Ownable, ReentrancyGuard {
    mapping(address => uint256) public deposits;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    constructor() Ownable(msg.sender) {}

    function deposit() external payable {
        require(msg.value > 0, "Nol ETH kiritib bo'lmaydi");
        deposits[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    function withdraw() external nonReentrant {
        uint256 amount = deposits[msg.sender];
        require(amount > 0, "Yetarli depozit yo'q");
        deposits[msg.sender] = 0;
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "O'tkazish muvaffaqiyatsiz");
        emit Withdrawn(msg.sender, amount);
    }
}`);
  const [isCustomDeploying, setIsCustomDeploying] = useState(false);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCustomDeploy = async () => {
    if (!account) {
      alert("Kontraktni deploy qilish uchun avval MetaMask profilingiz bilan tizimga kiring!");
      return;
    }
    setIsCustomDeploying(true);
    setTimeout(async () => {
      try {
        const rec = await deployContractToBlockchain({
          contractId: `custom-${Date.now()}`,
          contractName: customContractName,
          sourceCode: customSource,
          networkId: chainId || '0xaa36a7'
        });
        setIsCustomDeploying(false);
        if (onDeploySuccess) onDeploySuccess(rec);
      } catch (err: any) {
        setIsCustomDeploying(false);
        alert(err?.message || "Deploy qilishda xatolik yuz berdi");
      }
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="cyber-card rounded-3xl p-6 sm:p-7 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 font-mono text-xs sm:text-sm font-bold border border-cyan-500/30 flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                <Layers className="w-4 h-4 text-cyan-400" />
                7-Bosqich: Smart-Kontraktlarni Blokcheynga Qo‘shish & Imzolash
              </span>
              <span className="text-xs sm:text-sm text-slate-400 font-mono font-semibold bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
                On-Chain Deployment & Verification
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mt-3 tracking-tight">
              Tekshirilgan Kontraktlarni Blokcheynga Muhrlash
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-1.5 max-w-3xl leading-relaxed font-medium">
              Auditor tomonidan zaifliklari tuzatilgan va sinovdan o‘tgan barcha smart-kontraktlar
              kriptografik imzo bilan tasdiqlanib, to‘g‘ridan-to‘g‘ri blokcheyn tarmog‘iga joylashtiriladi.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm sm:text-base font-black bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 shadow-[0_0_25px_rgba(0,240,255,0.35)] transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <Lock className="w-4 h-4" />
            <span>Tanlangan Kontraktni Deploy Qilish</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Contract Quick Deployment Card */}
      <div className="cyber-card rounded-3xl p-6 border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
              Hozirgi Tanlangan Xavfsiz Kontrakt:
            </div>
            <h3 className="text-lg font-black text-white mt-1 flex items-center gap-2">
              <span>{contract.fileName.replace('.sol', 'Secure.sol')}</span>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                TUZATILGAN VA TESTLANGAN ✓
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">
              Joriy Tarmoq: <strong className="text-white">{networkName}</strong>
            </span>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Imzolash Oynasini Ochish</span>
            </button>
          </div>
        </div>

        {/* Diff & Security summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400 block font-medium">Zaiflik Turi:</span>
            <span className="text-white font-bold font-mono mt-0.5 block">{contract.category.toUpperCase()}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400 block font-medium">Xavfsizlik Standarti:</span>
            <span className="text-emerald-400 font-bold font-mono mt-0.5 block">Checks-Effects-Interactions (CEI)</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400 block font-medium">Deployment Holati:</span>
            <span className="text-cyan-300 font-bold font-mono mt-0.5 block">EVM Tayyor (Bytecode generatsiya qilingan)</span>
          </div>
        </div>
      </div>

      {/* Deployed Contracts On-Chain List */}
      <div className="cyber-card rounded-3xl p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Blokcheynga Qo‘shilgan Smart-Kontraktlar Ro‘yxati (On-Chain Registry)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Quyidagi barcha kontraktlar auditor tomonidan kriptografik imzolanib, EVM tarmog‘iga muvaffaqiyatli kiritilgan.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-cyan-300 self-start sm:self-auto">
            Jami: {deployedContracts.length} ta kontrakt
          </span>
        </div>

        <div className="space-y-4">
          {deployedContracts.map((dep) => (
            <div
              key={dep.id}
              className="p-5 rounded-2xl bg-[#050811] border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold text-sm">
                    {dep.contractName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-white flex items-center gap-2">
                      <span>{dep.contractName}</span>
                      <span className="text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/40">
                        {dep.status === 'confirmed' ? 'Tasdiqlangan ✓' : 'Kutilmoqda'}
                      </span>
                      {dep.isRealOnChain ? (
                        <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40">
                          On-Chain (Sepolia)
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/40">
                          Kriptografik Muhr
                        </span>
                      )}
                      <span className="text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/40">
                        Ball: {dep.securityScore}/100
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Tarmoq: <span className="text-slate-300 font-semibold">{dep.networkName}</span> · Blok: <a
                        href={`${SUPPORTED_NETWORKS[dep.networkId]?.explorer || 'https://sepolia.etherscan.io'}/block/${dep.blockNumber}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline font-mono font-bold inline-flex items-center gap-0.5"
                      >
                        #{dep.blockNumber}
                        <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`${SUPPORTED_NETWORKS[dep.networkId]?.explorer || 'https://sepolia.etherscan.io'}/address/${dep.deployedAddress}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 text-xs font-bold transition-colors border border-slate-700 flex items-center gap-1.5"
                  >
                    <span>{SUPPORTED_NETWORKS[dep.networkId]?.name.split(' ')[0] || 'Etherscan'} Skaneri</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Hashes and Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono pt-1">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="text-[11px] text-slate-400 font-sans flex items-center justify-between mb-1">
                    <span>Kontrakt Manzili:</span>
                    <button
                      onClick={() => handleCopy(dep.deployedAddress, `addr-${dep.id}`)}
                      className="text-cyan-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedId === `addr-${dep.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === `addr-${dep.id}` ? 'Nusxalandi' : 'Nusxa'}</span>
                    </button>
                  </div>
                  <div className="text-cyan-300 font-bold truncate">{dep.deployedAddress}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="text-[11px] text-slate-400 font-sans flex items-center justify-between mb-1">
                    <span>Tranzaksiya Xeshi (Tx Hash):</span>
                    <div className="flex items-center gap-2">
                      <a
                        href={`${SUPPORTED_NETWORKS[dep.networkId]?.explorer || 'https://sepolia.etherscan.io'}/tx/${dep.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:text-white flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Skaner</span>
                      </a>
                      <button
                        onClick={() => handleCopy(dep.txHash, `tx-${dep.id}`)}
                        className="text-cyan-400 hover:text-white flex items-center gap-1"
                      >
                        {copiedId === `tx-${dep.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === `tx-${dep.id}` ? 'Nusxalandi' : 'Nusxa'}</span>
                      </button>
                    </div>
                  </div>
                  <div className="text-slate-300 truncate">{dep.txHash}</div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 font-mono flex flex-wrap items-center justify-between gap-2 border-t border-slate-900 pt-2">
                <div>Auditor Imzosi: <span className="text-slate-300 truncate inline-block max-w-[200px] sm:max-w-xs align-bottom">{dep.signature.slice(0, 24)}...</span></div>
                <div>Sarflangan Gaz: <span className="text-emerald-400 font-bold">{dep.gasUsed}</span></div>
                <div>Sana: <span className="text-slate-300">{dep.timestamp}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Smart-Contract Deployer & Signer */}
      <div className="cyber-card rounded-3xl p-6 sm:p-7 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">
              Yangi Smart-Kontraktni Kiritib, Imzolab Blokcheynga Qo‘shish
            </h3>
            <p className="text-xs text-slate-400">
              O‘zingiz yozgan ixtiyoriy Solidity kontraktini kiritib, uni raqamli imzo bilan EVM blokcheyniga deploy qiling.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Kontrakt Nomi (Contract Name):
            </label>
            <input
              type="text"
              value={customContractName}
              onChange={(e) => setCustomContractName(e.target.value)}
              className="w-full sm:w-80 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Solidity Kod (Source Code):
            </label>
            <textarea
              rows={8}
              value={customSource}
              onChange={(e) => setCustomSource(e.target.value)}
              className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={handleCustomDeploy}
            disabled={isCustomDeploying}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-xs sm:text-sm transition-all shadow-lg flex items-center gap-2"
          >
            {isCustomDeploying ? (
              <>
                <Cpu className="w-4 h-4 animate-spin" />
                <span>Imzolash va Blokcheynga yozish jarayoni...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Ushbu Kontraktni Imzolab Blokcheynga Qo‘shish</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal */}
      <DeployToBlockchainModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contract={contract}
        onDeploySuccess={onDeploySuccess}
      />
    </div>
  );
};
