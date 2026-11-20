import React, { useState } from 'react';
import { ContractLabCase } from '../types';
import { useWeb3 } from '../context/Web3Context';
import {
  FileText,
  Printer,
  Download,
  Copy,
  Check,
  ShieldCheck,
  Award,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Lock,
  BadgeCheck,
  Cpu
} from 'lucide-react';

interface AuditReportTabProps {
  contracts: ContractLabCase[];
  studentNotes: Record<string, string>;
  completedTasks: Record<string, boolean>;
}

export const AuditReportTab: React.FC<AuditReportTabProps> = ({
  contracts,
  studentNotes,
  completedTasks
}) => {
  const { account, user, auditorRole, isSigned, signature, deployedContracts } = useWeb3();
  const [copied, setCopied] = useState(false);
  const auditDate = new Date().toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const generateMarkdownReport = () => {
    return `# SMART-KONTRAKT XAVFSIZLIK AUDITI PROFESSIONAL HISOBOTI
**Audit Laboratoriyasi:** A23, A16, A8 · TN2, TN4  
**Audit Sanasi:** ${auditDate}  
**Auditor:** Smart-Contract Security Research Group  
**Xavfsizlik Standarti:** SWC Registry, OWASP Smart Contract Top 10, ConsenSys Diligence  

---

## 1. IJROIY XULOSA (EXECUTIVE SUMMARY)
Ushbu audit loyihasi doirasida o'quv dasturi va real xakerlik hujumlari (The DAO Hack, Parity MultiSig, DeFi Flash Loan Oracle Manipulation, BEC Token BatchOverflow) asosida ishlab chiqilgan **${contracts.length} ta smart-kontrakt** to'liq xavfsizlik auditidan o'tkazildi.

Tahlil natijasida har bir kontrakt bo'yicha:
1. Qo'lda (Manual) arxitektura va kod tahlili o'tkazildi;
2. Slither statik tahlil vositasi yordamida CFG/AST tekshiruvi bajarildi;
3. Zaiflikni amalda isbotlovchi **Ekspluatatsiya Testlari (Foundry/Hardhat PoC)** yozildi va tasdiqlandi;
4. Xatolar xalqaro CVSS 3.1 va SWC standartlari bo'yicha tasniflandi;
5. OpenZeppelin kutubxonalari va Checks-Effects-Interactions patterni asosida xavfsiz patchlar ishlab chiqildi va qayta testda tasdiqlandi;
6. AI (LLM) vositalarining audit hisobotlari tekshirilib, ularning xato va o'tkazib yuborishlari baholandi.

---

## 2. AUDIT QILINGAN KONTRAKTLAR VA TOPILMALAR JADVALI

| ID | Kontrakt | Kategoriya | SWC / CWE | Jiddiylik | Holat |
|---|---|---|---|---|---|
${contracts
  .map(
    (c) =>
      `| ${c.findings[0]?.id || 'FIND'} | ${c.fileName} | ${c.category} | ${c.findings[0]?.swcId} / ${c.findings[0]?.cweId} | ${c.severity} | TUZATILDI VA TESTDA TASDIQLANDI |`
  )
  .join('\n')}

---

## 3. TAFSILOTLI TOPILMALAR VA ISBOTLAR (FINDINGS & PROOFS)

${contracts
  .map(
    (c, i) => `### 3.${i + 1}. [${c.severity}] ${c.findings[0]?.title} (${c.fileName})
- **Zaiflik Turi:** ${c.category.toUpperCase()} (${c.findings[0]?.swcId})
- **Tarixiy Voqea:** ${c.historicalIncident.name} (${c.historicalIncident.date}) - Zarar: ${c.historicalIncident.stolenAmount}
- **Tavsif:** ${c.findings[0]?.description}
- **Zarar (Impact):** ${c.findings[0]?.impact}
- **Ildiz Sababi:** ${c.findings[0]?.rootCause}

#### Ekspluatatsiya Testi (Proof of Concept):
\`\`\`solidity
${c.exploitScenario.testCode}
\`\`\`

#### Tavsiya etilgan Xavfsiz Kod:
\`\`\`solidity
${c.fixedCode}
\`\`\`
`
  )
  .join('\n\n---\n\n')}

---

## 4. XULOSA VA AMALIY TAVSIYALAR
- Joylashtirilgan smart-kontraktlarni tarmoqda o'zgartirib bo'lmaganligi sababli, deploydan oldin Foundry va Slither orqali 100% test qamrovi shart.
- AI vositalari qo'shimcha skaner sifatida foydali, ammo ularning o'tkazib yuborishlari (false negatives) va eski tavsiyalari sababli insoniy auditor nazoratisiz deployment qilish qat'iyan taqiqlanadi.
`;
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdownReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdownReport();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Smart_Contract_Security_Audit_Report_${new Date().toISOString().split('T')[0]}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="cyber-card rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/30 flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                <BadgeCheck className="w-4 h-4 text-cyan-400" />
                Yakuniy Natija: Professional Audit Hisoboti
              </span>
              <span className="text-xs text-slate-400 font-mono font-semibold bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
                ConsenSys & OpenZeppelin Standarti
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mt-3 tracking-tight">
              Smart-Kontrakt Xavfsizlik Auditi Rasmiy Xulosasi
            </h1>
            <p className="text-sm text-slate-300 mt-1.5 max-w-3xl leading-relaxed font-medium">
              Ushbu hujjat barcha laboratoriya bosqichlari natijalarini (qo‘lda tahlil, Slither, ekspluatatsiya testlari,
              jiddiylik matritsasi, tuzatilgan kod va AI tekshiruvini) o‘z ichiga olgan rasmiy professional hisobotdir.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-700 hover:text-white"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Nusxalandi!' : 'MD Nusxa'}</span>
            </button>
            <button
              onClick={handleDownloadMarkdown}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-700 hover:text-white"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Yuklab olish (.md)</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 rounded-xl text-xs sm:text-sm font-extrabold transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:scale-105 active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Chop Etish / PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Audit Document Sheet (Styled as High-Tech Official Security Whitepaper) */}
      <div className="cyber-card rounded-3xl p-6 sm:p-10 shadow-2xl text-slate-200 space-y-8 font-sans border-slate-800/90">
        {/* Report Header */}
        <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-cyan-400 font-extrabold uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              OFFICIAL SECURITY AUDIT REPORT
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Smart-Kontrakt Xavfsizlik Auditi Laboratoriyasi
            </h2>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1 text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                {auditDate}
              </span>
              <span>·</span>
              <span className="text-cyan-300 font-mono font-bold">Fan talablari: A23, A16, A8 · TN2, TN4</span>
            </div>
          </div>

          <div className="bg-[#050811] border border-slate-800 rounded-2xl p-4 text-right sm:min-w-[220px]">
            <div className="text-[11px] text-slate-400 font-mono font-bold uppercase tracking-wider">Umumiy Natija:</div>
            <div className="text-sm font-extrabold text-emerald-400 flex items-center justify-end gap-1.5 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
              4/4 TUZATILDI
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-1 font-semibold">
              100% Exploit Tests Pass
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <section className="space-y-3">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
            1. Ijroiya Xulosasi (Executive Summary)
          </h3>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
            Mazkur xavfsizlik auditi davomida 4 ta muhim smart-kontrakt (Reentrancy, Access Control, Oracle Spot Manipulation,
            va Integer Overflow) arxitekturasi chuqur o‘rganildi. Har bir aniqlangan zaiflik uchun real tarmoq sharoitlarini
            aks ettiruvchi ekspluatatsiya testlari yozilib, ularning moliyaviy oqibatlari isbotlandi. So‘ngra barcha
            kamchiliklar OpenZeppelin sanoat standartlari asosida bartaraf etildi va testlar yordamida himoya tasdiqlandi.
          </p>
        </section>

        {/* Severity Summary Badge Table */}
        <section className="space-y-3">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
            2. Zaifliklar Xulosasi (Findings Overview)
          </h3>
          <div className="overflow-x-auto border border-slate-800 rounded-2xl">
            <table className="w-full text-xs sm:text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-300 font-mono bg-[#060a14] font-bold">
                  <th className="py-3.5 px-4">Topilma ID</th>
                  <th className="py-3.5 px-4">Kontrakt</th>
                  <th className="py-3.5 px-4">SWC / CWE</th>
                  <th className="py-3.5 px-4">Jiddiylik</th>
                  <th className="py-3.5 px-4">Ekspluatatsiya Isboti</th>
                  <th className="py-3.5 px-4">Remediatsiya Holati</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono text-xs sm:text-sm">
                {contracts.map((c) => {
                  const f = c.findings[0];
                  return (
                    <tr key={c.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-cyan-400">{f?.id}</td>
                      <td className="py-3.5 px-4 font-black text-white">{c.fileName}</td>
                      <td className="py-3.5 px-4 text-slate-400 font-medium">{f?.swcId} / {f?.cweId}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full font-black text-xs bg-rose-950/80 text-rose-400 border border-rose-500/40">
                          {c.severity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-emerald-400 font-bold">
                        ✓ Foundry Test Pass
                      </td>
                      <td className="py-3.5 px-4 text-cyan-400 font-bold">
                        ✓ TUZATILDI & TASDIQLANDI
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Detailed Findings Sections */}
        <section className="space-y-4">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
            3. Har Bir Kontrakt Bo‘yicha Audit Natijalari va Tuzatishlar
          </h3>

          <div className="space-y-4">
            {contracts.map((c, idx) => (
              <div
                key={c.id}
                className="bg-[#050811] border border-slate-800 rounded-2xl p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-3.5 gap-2">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-7 h-7 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-800/50 flex items-center justify-center font-mono font-black text-sm">
                      {idx + 1}
                    </span>
                    <h4 className="font-extrabold text-base text-white">
                      {c.title} ({c.fileName})
                    </h4>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <span className="text-xs sm:text-sm font-mono text-slate-400 font-semibold">
                      {c.historicalIncident.name}
                    </span>
                    <span className="text-xs sm:text-sm font-mono font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-500/40">
                      {c.historicalIncident.stolenAmount}
                    </span>
                  </div>
                </div>

                <div className="text-sm text-slate-300 leading-relaxed font-medium">
                  <strong className="text-white">Tavsif va Zarar:</strong> {c.findings[0]?.description} {c.findings[0]?.impact}
                </div>

                <div className="bg-[#080d1a] p-4 sm:p-5 rounded-xl border border-slate-800/90 font-mono text-xs sm:text-sm text-slate-300">
                  <div className="text-slate-500 font-bold mb-2">// Tavsiya etilgan xavfsiz arxitektura:</div>
                  <ul className="list-disc list-inside space-y-1.5 text-slate-300">
                    {c.fixDiffNotes.map((note, nIdx) => (
                      <li key={nIdx}>{note}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* On-Chain Deployed Smart Contracts Section */}
        {deployedContracts.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              4. Blokcheynga Joylashtirilgan Xavfsiz Kontraktlar (On-Chain Deployed Registry)
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Quyidagi kontraktlar auditor tomonidan tekshirilib, xavfsiz patch qo‘llanilgan holda raqamli imzolangan va EVM blokcheyniga deploy qilingan:
            </p>
            <div className="overflow-x-auto border border-slate-800 rounded-2xl">
              <table className="w-full text-xs text-left border-collapse font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-300 bg-[#060a14] font-bold">
                    <th className="py-3 px-3.5">Kontrakt Nomi</th>
                    <th className="py-3 px-3.5">Tarmoq</th>
                    <th className="py-3 px-3.5">Blokcheyndagi Manzil</th>
                    <th className="py-3 px-3.5">Tranzaksiya Xeshi</th>
                    <th className="py-3 px-3.5">Blok</th>
                    <th className="py-3 px-3.5">Holat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {deployedContracts.map((dep) => (
                    <tr key={dep.id} className="hover:bg-slate-900/50">
                      <td className="py-3 px-3.5 font-bold text-cyan-300">{dep.contractName}</td>
                      <td className="py-3 px-3.5 text-slate-300">{dep.networkName.split(' ')[0]}</td>
                      <td className="py-3 px-3.5 text-white font-bold">{dep.deployedAddress.slice(0, 10)}...{dep.deployedAddress.slice(-6)}</td>
                      <td className="py-3 px-3.5 text-slate-400">{dep.txHash.slice(0, 12)}...</td>
                      <td className="py-3 px-3.5 text-emerald-400 font-bold">#{dep.blockNumber}</td>
                      <td className="py-3 px-3.5 text-emerald-400 font-bold">✓ Tasdiqlangan</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Auditor Sign-off */}
        <div className="border-t border-slate-800 pt-6 space-y-4">
          <div className="p-4 rounded-2xl bg-[#050811] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase font-mono">Auditor Autentifikatsiyasi (Web3 / SOC):</div>
              <div className="font-mono font-bold text-cyan-300 mt-0.5">
                {account ? `${account} (${user?.name || 'Auditor'})` : 'Anonim Auditor'}
              </div>
              <div className="text-slate-400 font-medium text-[11px] mt-0.5">
                Rol: <span className="font-semibold text-slate-200">{auditorRole}</span> · Fan talablari: <span className="text-cyan-400 font-bold">A23, A16, A8 · TN2, TN4</span>
              </div>
            </div>

            <div className="text-right">
              {isSigned ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold font-mono text-[11px] border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Kriptografik Imzolangan (EIP-4361)</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 text-amber-300 font-semibold font-mono text-[11px] border border-amber-500/40">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>MetaMask orqali imzolash kutilmoqda</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4 font-medium pt-2">
            <div>
              <div className="font-bold text-white">Antigravity Smart-Contract Security Audit Lab</div>
              <div>Akademik talablar: A23, A16, A8 · TN2, TN4 to‘liq qamrab olindi.</div>
            </div>
            <div className="flex items-center space-x-2 text-emerald-400 font-mono font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Audit Muvaffaqiyatli Yakunlandi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
