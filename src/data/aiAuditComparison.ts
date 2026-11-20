export interface AIAuditComparisonCase {
  contractId: string;
  contractName: string;
  aiToolTested: string;
  model: string;
  promptMethod: string;
  humanAuditorVerdict: string;
  aiAuditorVerdict: string;
  metrics: {
    precision: number;
    recall: number;
    falsePositiveRate: number;
    falseNegativeRate: number;
    hallucinationScore: number;
  };
  discrepancies: {
    type: 'False Positive' | 'False Negative (Missed)' | 'Hallucinated Logic' | 'Correct Detection';
    title: string;
    description: string;
    impactOnReport: string;
  }[];
  criticalAnalysis: string;
}

export const AI_AUDIT_DATA: AIAuditComparisonCase[] = [
  {
    contractId: 'case-reentrancy-dao',
    contractName: 'EtherVault.sol',
    aiToolTested: 'GPT-4o / Claude 3.5 Sonnet Security Audit Prompt',
    model: 'LLM Multi-Agent Audit Framework',
    promptMethod: 'Zero-shot with Smart Contract Security Guidelines & AST injection',
    humanAuditorVerdict: 'Kritik Reentrancy zaifligi (SWC-107). Balans yangilanishidan oldin low-level call chaqirilgan. CEI va ReentrancyGuard talab etiladi.',
    aiAuditorVerdict: 'Reentrancy aniqlandi. Biroq AI transfer() tavsiya qildi (gaz chegarasi 2300 endi yaroqsiz) va read-only reentrancy asoratini e’tibordan qoldirdi.',
    metrics: {
      precision: 75,
      recall: 80,
      falsePositiveRate: 15,
      falseNegativeRate: 20,
      hallucinationScore: 10
    },
    discrepancies: [
      {
        type: 'Correct Detection',
        title: 'Reentrancy in withdraw()',
        description: 'AI model withdraw funksiyasidagi xavfli chaqiriqni to‘g‘ri topdi.',
        impactOnReport: 'To‘g‘ri aniqlandi.'
      },
      {
        type: 'Hallucinated Logic',
        title: 'Deprecated msg.sender.transfer() recommendation',
        description: 'AI msg.sender.call{value:...} o‘rniga eski msg.sender.transfer() ishlatishni tavsiya qildi. Bu EIP-1884 dan keyin (gaz qiymatlari o‘zgarishi) tranzaksiyalarning to‘xtab qolishiga olib keladi!',
        impactOnReport: 'Zararli tavsiya (Bad Practice).'
      },
      {
        type: 'False Negative (Missed)',
        title: 'Cross-contract reentrancy & DeFi Composability',
        description: 'Agar boshqa protokol EtherVault balansini view orqali o‘qisa (read-only reentrancy), boshqa protokollar ham o‘g‘irlanishi mumkinligini AI tushunmadi.',
        impactOnReport: 'Muhim tizimli arxitektura xatosi e’tibordan chetda qoldi.'
      }
    ],
    criticalAnalysis: 'AI vositalari oddiy sintaktik reentrancy patternlarini (call balances[...]=0 dan oldin) tez topadi, lekin modern gas dynamicasi va tizimli DeFi kompozitsiyasi xatolarida chalg‘iydi.'
  },
  {
    contractId: 'case-access-control-parity',
    contractName: 'MultiSigTreasury.sol',
    aiToolTested: 'Slither AI Engine + Claude 3.7 Code Reviewer',
    model: 'Hybrid Static Analyzer + LLM',
    promptMethod: 'Chain-of-Thought with Access Control SWC-105/106 checks',
    humanAuditorVerdict: 'Initsializatsiya funksiyasi himoyasiz. Istalgan foydalanuvchi owner bo‘lib olib butun mablag‘ni olib qo‘yishi mumkin. Konstruktor yoki Ownable2Step kerak.',
    aiAuditorVerdict: 'initWallet ochiq ekanini aniqladi. Lekin proxy storage collision va front-running deployment xavfini to‘liq izohlay olmadi.',
    metrics: {
      precision: 90,
      recall: 85,
      falsePositiveRate: 8,
      falseNegativeRate: 15,
      hallucinationScore: 5
    },
    discrepancies: [
      {
        type: 'Correct Detection',
        title: 'Missing onlyOwner on initWallet()',
        description: 'AI model initWallet funksiyasi egasiz qolganini va xavfliligini to‘g‘ri tasnifladi.',
        impactOnReport: 'Jiddiyligi Critical deb to‘g‘ri baholandi.'
      },
      {
        type: 'False Negative (Missed)',
        title: 'Mempool Front-running Risk during Deployment',
        description: 'AI agar deployer tranzaksiyani alohida yuborsa, bot mempoolda initWallet() ni ilib ketishi mumkinligini aytmadi.',
        impactOnReport: 'Tavsiya faqat modifier bilan cheklandi, konstruktor initsializatsiyasi tavsiya etilmadi.'
      }
    ],
    criticalAnalysis: 'Statik tahlil bilan birlashtirilgan AI oddiy access control buzilishlarini 90% aniqlik bilan topadi, biroq mempool front-running ssenariylarini tushunish uchun insoniy auditor tajribasi shart.'
  },
  {
    contractId: 'case-oracle-manipulation',
    contractName: 'LendingPoolOracle.sol',
    aiToolTested: 'GPT-4o DeFi Audit Specialist',
    model: 'Large Language Model with DeFi protocol context',
    promptMethod: 'Role: Senior Smart Contract Auditor, Task: Find economic and flash loan vectors',
    humanAuditorVerdict: 'AMM getReserves() spot narxiga tayanish — qulashga mahkum. Flash loan bilan narx buziladi. Chainlink Data Feeds yoki TWAP shart.',
    aiAuditorVerdict: 'AI bu yerda flash loan hujumi borligini aytdi, lekin formuladagi LTV va decimal moslashuvida arifmetik xatoliklar qildi.',
    metrics: {
      precision: 70,
      recall: 65,
      falsePositiveRate: 25,
      falseNegativeRate: 35,
      hallucinationScore: 20
    },
    discrepancies: [
      {
        type: 'Correct Detection',
        title: 'Spot Price Vulnerability',
        description: 'AI AMM spot narxini o‘qish manipulyatsiyaga moyil ekanini to‘g‘ri aytdi.',
        impactOnReport: 'To‘g‘ri'
      },
      {
        type: 'Hallucinated Logic',
        title: 'Incorrect Decimal Normalization Formula',
        description: 'AI Chainlink 8-decimal va USDC 6-decimal moslashuvida formulani noto‘g‘ri yozib, 100x likvidlik farqi xatosini yaratdi.',
        impactOnReport: 'Agar AI tavsiyasi to‘g‘ridan-to‘g‘ri kodga ko‘chirilsa, yangi CRITICAL zaiflik yuzaga keladi!'
      },
      {
        type: 'False Negative (Missed)',
        title: 'Sequencer Uptime Feed in L2',
        description: 'Arbitrum/Optimism kabi L2 tarmoqlarida Chainlink ishlatilganda Sequencer Uptime Feed tekshirilishi shartligini ko‘rsatmadi.',
        impactOnReport: 'L2 ga joylanganda garovlarni noto‘g‘ri likvidatsiya qilish xavfi qoladi.'
      }
    ],
    criticalAnalysis: 'Iqtisodiy va DeFi manipulatsiyalarida AI eng ko‘p adashadi. Ayniqsa token decimallari, L2 sequencer downtime va multi-pool sandwich hujumlarini faqat tajribali auditor to‘g‘ri tekshira oladi.'
  },
  {
    contractId: 'case-integer-overflow',
    contractName: 'BatchTokenTransfer.sol',
    aiToolTested: 'Slither + AI Code Verifier',
    model: 'Hybrid Static Analyzer + LLM',
    promptMethod: 'Solidity version compatibility analysis',
    humanAuditorVerdict: 'Solidity 0.7.6 da cnt * _value toshadi va 0 ga tenglashadi. 0.8+ ga o‘tish yoki SafeMath qo‘llash kerak.',
    aiAuditorVerdict: 'To‘liq to‘g‘ri topildi. BEC token o‘xshashligi va SafeMath zarurati aniq ko‘rsatildi.',
    metrics: {
      precision: 95,
      recall: 95,
      falsePositiveRate: 5,
      falseNegativeRate: 5,
      hallucinationScore: 2
    },
    discrepancies: [
      {
        type: 'Correct Detection',
        title: 'Integer Overflow in batchTransfer',
        description: 'AI 2^255 * 2 = 0 toshish holatini va BEC token keysini benuqson keltirib berdi.',
        impactOnReport: 'Mukammal tahlil.'
      }
    ],
    criticalAnalysis: 'Eski Solidity versiyalaridagi aniq matematik qoidalar (overflow/underflow) bo‘yicha AI juda yuqori samaradorlik ko‘rsatadi (95%+).'
  }
];
