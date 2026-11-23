import React from 'react';
import { ContractLabCase } from '../types';
import { LoginGateBanner } from './LoginGateBanner';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Terminal,
  Cpu,
  Layers,
  ArrowRight,
  BookOpen,
  DollarSign,
  Activity,
  FileText,
  Lock,
  Zap,
  Award
} from 'lucide-react';

interface IntroOverviewTabProps {
  contracts: ContractLabCase[];
  onStartAudit: (tabId: string, contractId?: string) => void;
  completedTasksCount: number;
}

export const IntroOverviewTab: React.FC<IntroOverviewTabProps> = ({
  contracts,
  onStartAudit,
  completedTasksCount
}) => {
  const roadmapSteps = [
    {
      step: '01',
      id: 'manual',
      title: 'Qo‘lda Audit (Manual Review)',
      subtitle: 'Kod arxitekturasi va CEI qoidalarini tekshirish',
      desc: 'Checks-Effects-Interactions tamoyili buzilishlarini aniqlash, audit nazorat ro‘yxatlarini to‘ldirish va auditor izohlarini kiritish.',
      icon: Terminal,
      badge: 'Boshlang‘ich'
    },
    {
      step: '02',
      id: 'static',
      title: 'Slither Statik Tahlil',
      subtitle: 'CFG, AST va avtomatlashtirilgan tahlil',
      desc: 'Slither 0.10.x statik analizatorini ishga tushirib, kompilyatsiya qilingan EVM bytecode va sintaktik xatolarni avtomatik skanerlash.',
      icon: ShieldAlert,
      badge: 'Statik Vosita'
    },
    {
      step: '03',
      id: 'exploit',
      title: 'Ekspluatatsiya PoC (Foundry)',
      subtitle: 'Hujum skriptlari orqali xatoni isbotlash',
      desc: 'Forge test muhitida (Foundry) exploit shartnomalarini ishga tushirish, 100% mablag‘ o‘g‘irlanishini amalda ko‘rsatish.',
      icon: Flame,
      badge: 'Amaliy Isbot'
    },
    {
      step: '04',
      id: 'severity',
      title: 'Xatarlarni Tasniflash (CVSS)',
      subtitle: 'Xalqaro SWC va CVSS 3.1 standartlari',
      desc: 'Har bir zaiflikka ta’sir (Impact) va murakkablik (Exploitability) bo‘yicha Critical, High, Medium, Low darajalarini belgilash.',
      icon: Award,
      badge: 'Metrika'
    },
    {
      step: '05',
      id: 'fix',
      title: 'Xavfsiz Patch & Qayta Tekshiruv',
      subtitle: 'OpenZeppelin va CEI patternlari',
      desc: 'ReentrancyGuard, Ownable2Step, Chainlink Oracles va Solidity 0.8+ checked math qo‘llab, exploit testlarini qayta revert berishini ta’minlash.',
      icon: CheckCircle2,
      badge: 'Himoya'
    },
    {
      step: '06',
      id: 'ai-review',
      title: 'AI Benchmark & Qiyoslash',
      subtitle: 'LLM modellari va insoniy auditor taqqosi',
      desc: 'AI vositalarining gallyutsinatsiyalari (hallucinations), soxta ijobiy/salbiy (false positive/negative) xulosalarini tahlil qilish.',
      icon: Cpu,
      badge: 'Tahliliy'
    },
    {
      step: '07',
      id: 'deploy',
      title: 'Blokcheynga Joylash & Imzolash',
      subtitle: 'Testnet deploy va EIP-712 imzo',
      desc: 'Tuzatilgan xavfsiz kontraktlarni Sepolia yoki mahalliy Anvil EVM tarmog‘iga deploy qilish va audit sessiyasini kriptografik imzolash.',
      icon: Layers,
      badge: 'On-Chain'
    },
    {
      step: '08',
      id: 'report',
      title: 'Yakuniy Audit Hisoboti & Sertifikat',
      subtitle: 'Rasmiy professional audit hisoboti',
      desc: 'Barcha 7 ta bosqich xulosasi, topilmalar jadvali, tuzatilgan arxitektura va raqamli imzoli hisobotni yuklab olish hamda chop etish.',
      icon: FileText,
      badge: 'Hisobot'
    }
  ];

  const keyPrinciples = [
    {
      title: 'Checks-Effects-Interactions (CEI)',
      desc: 'Ichki holat (state) o‘zgarishlarini doimo tashqi chaqiruvlardan (external calls) oldin bajaring.',
      color: 'text-cyan-400',
      border: 'border-cyan-500/30'
    },
    {
      title: 'ReentrancyGuard Mutex',
      desc: 'Efir va token o‘tkazuvchi muhim funksiyalarga doimo nonReentrant modifikatorini o‘rnating.',
      color: 'text-emerald-400',
      border: 'border-emerald-500/30'
    },
    {
      title: 'Markazlashmagan Oracles',
      desc: 'Hech qachon DEX spot zaxiralariga tayanmang; doimo Chainlink Data Feeds yoki TWAP ishlating.',
      color: 'text-amber-400',
      border: 'border-amber-500/30'
    },
    {
      title: 'EIP-712 & Nonce Himoyasi',
      desc: 'Imzoli tranzaksiyalarda har bir manzil uchun yagona oshib boruvchi nonce va chainId majburiydir.',
      color: 'text-purple-400',
      border: 'border-purple-500/30'
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="cyber-card rounded-3xl p-6 sm:p-10 relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-[#0a1124] to-[#070b14] border border-cyan-500/30 shadow-[0_0_35px_rgba(0,240,255,0.1)]">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 -mb-10 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              Laboratoriya Kirish Qismi & Metodologiya
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-slate-800/80 text-slate-300 border border-slate-700">
              EVM Smart-Contract Security Audit Lab
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Progress: {completedTasksCount} / 7 bosqich yakunlangan
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-4">
            Smart-Kontraktlar Xavfsizlik Auditi Laboratoriyasiga Xush Kelibsiz!
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-4xl mb-6">
            Smart-kontraktlar blokcheynda joylashgach (deploy bo‘lgach), o‘zgarmas (immutable) holatga keladi.
            Oddiy dasturlardagi kabi xatoni tezda patch qilib bo‘lmaydi — koddagi bitta sintaktik yoki mantiqiy zaiflik
            foydalanuvchilarning barcha mablag‘lari o‘g‘irlanishiga olib kelishi mumkin. Mazkur laboratoriyada siz
            DeFi va Web3 tarixidagi eng mashhur 5 ta xakerlik hujumlarini tahlil qilasiz, zaifliklarni ekspluatatsiya
            qilib isbotlaysiz hamda xalqaro standartlar asosida xavfsiz patchlar ishlab chiqasiz.
          </p>

          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <button
              onClick={() => onStartAudit('manual')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <Zap className="w-4 h-4" />
              Auditni Boshlash (1-Bosqich: Qo‘lda Tahlil)
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onStartAudit('report')}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 flex items-center gap-2 transition-colors"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              Yakuniy Audit Hisobotini Ko‘rish
            </button>
          </div>
        </div>
      </div>

      {/* Web3 / Auditor Login Seansi */}
      <LoginGateBanner />

      {/* 5 Historical Attack Cases Grid */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              Laboratoriyada Tahlil Qilinadigan 5 Ta Real Keys (Smart-Kontraktlar):
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Har bir shartnoma tarixdagi real xakerlik hujumlari va yo‘qotishlarga asoslangan
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-slate-800/80 text-cyan-300 px-3 py-1.5 rounded-full border border-slate-700 self-start sm:self-auto">
            Jami zarar: $1.2B+
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contracts.map((c, idx) => (
            <div
              key={c.id}
              className="cyber-card rounded-2xl p-5 border border-slate-800/80 hover:border-cyan-500/40 bg-slate-900/60 transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-cyan-950/70 text-cyan-300 border border-cyan-800/40">
                    {c.fileName}
                  </span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                      c.severity === 'CRITICAL'
                        ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {c.severity}
                  </span>
                </div>

                <h4 className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors mb-2">
                  {idx + 1}. {c.title}
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 mb-4">
                  {c.summary}
                </p>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-4 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Tarixiy Voqea:</span>
                    <span className="font-semibold text-slate-200">{c.historicalIncident.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Yetkazilgan Zarar:</span>
                    <span className="font-mono font-bold text-rose-400">{c.historicalIncident.stolenAmount}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Standart / Kategoriya:</span>
                    <span className="font-mono text-cyan-400">{c.category.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onStartAudit('manual', c.id)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-cyan-600/30 hover:border-cyan-500/50 text-slate-200 hover:text-cyan-300 border border-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                Ushbu Keysni Tahlil Qilish
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Step Lab Workflow Roadmap */}
      <div className="cyber-card rounded-3xl p-6 sm:p-8 bg-slate-900/50 border border-slate-800">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4" />
            Audit Metodologiyasi
          </div>
          <h3 className="text-lg sm:text-2xl font-black text-white">
            Auditning 8 Ta Asosiy Bosqichi (Full-Cycle Security Pipeline)
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Laboratoriya doirasida quyidagi 8 ta ketma-ket qadamni bajarasiz:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {roadmapSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                onClick={() => onStartAudit(step.id)}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-cyan-500/50 hover:bg-slate-900 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-black font-mono text-cyan-400/40 group-hover:text-cyan-400 transition-colors">
                      {step.step}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {step.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors">
                      {step.title}
                    </h4>
                  </div>

                  <div className="text-[11px] font-medium text-cyan-300/80 mb-2">
                    {step.subtitle}
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {step.desc}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform pt-2 border-t border-slate-800/60">
                  <span>Bosqichga o‘tish</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security Best Practices & Rules Card */}
      <div className="cyber-card rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900/80 to-[#0b1222] border border-slate-800">
        <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs uppercase tracking-wider mb-2">
          <ShieldCheck className="w-4 h-4" />
          Xavfsizlik Standartlari & Tavsiyalar
        </div>
        <h3 className="text-lg sm:text-xl font-black text-white mb-4">
          Smart-Kontrakt Auditorining Asosiy Qoidalari (Best Practices)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {keyPrinciples.map((p, i) => (
            <div
              key={i}
              className={`p-4 rounded-2xl bg-slate-950/60 border ${p.border} flex flex-col justify-between`}
            >
              <div>
                <h5 className={`font-bold text-sm ${p.color} mb-2`}>{p.title}</h5>
                <p className="text-xs text-slate-300 leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
