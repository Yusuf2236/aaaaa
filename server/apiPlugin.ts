import { Plugin } from 'vite';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

interface ContractConfig {
  id: string;
  title: string;
  fileName: string;
  secureFileName: string;
  testFile: string;
  testContract: string;
  category: 'reentrancy' | 'access_control' | 'oracle_manipulation' | 'integer_overflow' | 'signature_replay';
  severity: 'CRITICAL' | 'HIGH';
  swcId: string;
  cweId: string;
  historicalIncident: {
    name: string;
    date: string;
    stolenAmount: string;
    victim: string;
    summary: string;
  };
  summary: string;
  fuzzTest?: string;
  checklistTasks: { id: string; task: string; hint: string }[];
  fixDiffNotes?: string[];
}

const CONTRACT_CONFIGS: ContractConfig[] = [
  {
    id: 'case-reentrancy-dao',
    title: 'The DAO Reentrancy (Vault & Drain)',
    fileName: 'EtherVault.sol',
    secureFileName: 'EtherVaultSecure.sol',
    testFile: 'test/EtherVaultExploit.t.sol',
    testContract: 'EtherVaultExploitTest',
    category: 'reentrancy',
    severity: 'CRITICAL',
    swcId: 'SWC-107',
    cweId: 'CWE-841',
    historicalIncident: {
      name: 'The DAO Hack (Ethereum Hardfork)',
      date: 'Iyun 2016',
      stolenAmount: '$60M (3.6M ETH)',
      victim: 'The DAO Smart Contract',
      summary: 'Tarixdagi eng mashhur reentrancy hujumi bo‘lib, Ethereum va Ethereum Classic (ETC) tarmog‘ining bo‘linishiga sabab bo‘lgan.'
    },
    summary: 'Mablag‘ni foydalanuvchiga jo‘natishdan oldin balans yangilanmaganligi (Checks-Effects-Interactions buzilishi) oqibatida rekursiv hujumchi hamyonni butkul bo‘shatishi.',
    fuzzTest: 'testFuzz_VaultDepositWithdraw',
    checklistTasks: [
      {
        id: 'chk-1',
        task: 'Tashqi chaqiriq (external call) msg.sender.call{value: ...}("") qayerda amalga oshirilganini tekshiring.',
        hint: 'withdraw() funksiyasining tashqi chaqiruv qatoriga qarang.'
      },
      {
        id: 'chk-2',
        task: 'Balans (state variable balances[msg.sender]) qachon nolga tenglashtirilishini tekshiring.',
        hint: 'Tashqi chaqiriqdan keyin bajarilmoqda! Bu CEI (Checks-Effects-Interactions) qoidasining qo‘pol buzilishi.'
      },
      {
        id: 'chk-3',
        task: 'Qayta kirishga qarshi (ReentrancyGuard / mutex lock) himoya bor-yo‘qligini baholang.',
        hint: 'Kontraktda nonReentrant modifikatori mavjud emas.'
      }
    ],
    fixDiffNotes: [
      'OpenZeppelin ReentrancyGuard kutubxonasi meros olindi va nonReentrant modifikatori o‘rnatildi.',
      'Checks-Effects-Interactions (CEI) patterni: balances[msg.sender] = 0 qatori tashqi call chaqirig‘idan oldinga olib o‘tildi.',
      'Solidity versiyasi 0.8.20 ga ko‘tarildi va xavfsiz kompilyatsiya kafolatlandi.'
    ]
  },
  {
    id: 'case-access-control-parity',
    title: 'Parity MultiSig (Unprotected Initialization)',
    fileName: 'MultiSigTreasury.sol',
    secureFileName: 'MultiSigTreasurySecure.sol',
    testFile: 'test/TreasuryTakeover.t.sol',
    testContract: 'TreasuryTakeoverTest',
    category: 'access_control',
    severity: 'CRITICAL',
    swcId: 'SWC-106',
    cweId: 'CWE-284',
    historicalIncident: {
      name: 'Parity MultiSig Wallet Hack #2',
      date: 'Noyabr 2017',
      stolenAmount: '$180M (513,774 ETH)',
      victim: 'Parity Multi-sig Library',
      summary: 'Hujumchi kutubxonaning init funksiyasini chaqirib egasiga aylangan va suiciding qilib barcha mablag‘larni abadiy muzlatib qo‘ygan.'
    },
    summary: 'Initsializatsiya funksiyasida (initWallet) ruxsat tekshiruvi (Access Control) yo‘qligi sababli istalgan foydalanuvchi o‘zini kontrakt egasi deb e’lon qilishi va barcha xazinani o‘g‘irlashi.',
    checklistTasks: [
      {
        id: 'chk-1',
        task: 'initWallet funksiyasining ko‘rinish sohasini (visibility) tekshiring.',
        hint: 'Funksiya public qilib e’lon qilingan va unga kirish cheklanmagan.'
      },
      {
        id: 'chk-2',
        task: 'Funksiyada qandaydir isInitialized bayrog‘i yoki tekshiruv mavjudligini aniqlang.',
        hint: 'Hech qanday require(!initialized) tekshiruvi yo‘q.'
      },
      {
        id: 'chk-3',
        task: 'Xazina mablag‘larini bo‘shatish huquqiga ega emergencyDrain funksiyasini tekshiring.',
        hint: 'onlyOwner modifikatori bor, ammo ownerlikni istalgan paytda initWallet orqali tortib olish mumkin!'
      }
    ],
    fixDiffNotes: [
      'Xavfli ochiq `initWallet()` funksiyasi butunlay olib tashlandi.',
      'OpenZeppelin `Ownable2Step` qo‘llandi (tasodifiy xato manzillarga egalik topshirilishini oldini oladi).',
      'Egalik huquqi faqat bir marta deployment vaqtida `constructor` orqali taqdim etiladi.',
      'Xavfsiz low-level call va zero-address tekshiruvlari joriy qilindi.'
    ]
  },
  {
    id: 'case-oracle-manipulation',
    title: 'DeFi Flash Loan Spot Oracle Manipulation',
    fileName: 'LendingPoolOracle.sol',
    secureFileName: 'LendingPoolSecure.sol',
    testFile: 'test/OracleExploit.t.sol',
    testContract: 'OracleExploitTest',
    category: 'oracle_manipulation',
    severity: 'CRITICAL',
    swcId: 'SWC-114',
    cweId: 'CWE-682',
    historicalIncident: {
      name: 'bZx, Harvest Finance & Mango Markets Hacks',
      date: '2020 - 2022',
      stolenAmount: '$130M+ (Jami DeFi bo‘yicha)',
      victim: 'DeFi Kredit Protokollari',
      summary: 'Flash loan orqali DEX AMM spot zaxiralari bir blokda manipulyatsiya qilinib, garov narxi sun’iy oshirilgan va protokol barcha mablag‘laridan mahrum qilingan.'
    },
    summary: 'Protokol narxni hisoblashda Uniswap/Pancake spot zaxiralariga (getReserves) tayanishi oqibatida flash-loan yordamida garov narxini sun’iy oshirib, butun likvidlikni o‘g‘irlash.',
    checklistTasks: [
      {
        id: 'chk-1',
        task: 'getAssetPrice() funksiyasida narx qanday manbadan olinayotganini tahlil qiling.',
        hint: 'AMM juftligining getReserves() spot qiymatlariga bo‘linmoqda.'
      },
      {
        id: 'chk-2',
        task: 'Katta miqdordagi token almashinuvi spot narxga qanday ta’sir qilishini baholang.',
        hint: 'Bitta blok ichida katta swap narxni 10x-50x ga o‘zgartirishi mumkin.'
      },
      {
        id: 'chk-3',
        task: 'Protokol Time-Weighted Average Price (TWAP) yoki Chainlink orakllaridan foydalanayotganini tekshiring.',
        hint: 'Kontraktda na TWAP, na Chainlink AggregatorV3 mavjud.'
      }
    ],
    fixDiffNotes: [
      'AMM spot zaxiralariga qaramlik olib tashlandi.',
      'Sanoat standarti bo‘lgan Chainlink Decentralized Oracle Data Feeds o‘rnatildi.',
      'Orakul eskirishi (staleness) va nol narx anomaliyalariga qarshi 3 bosqichli validatsiya qo‘shildi.',
      'Flesh-kreditlar bitta blokda Chainlink aggregatsiyalangan narxiga ta’sir o‘tkaza olmaydi.'
    ]
  },
  {
    id: 'case-integer-overflow',
    title: 'BEC Token BatchOverflow (Integer Overflow)',
    fileName: 'BatchTokenTransfer.sol',
    secureFileName: 'BatchTokenTransferSecure.sol',
    testFile: 'test/BatchOverflow.t.sol',
    testContract: 'BatchOverflowTest',
    category: 'integer_overflow',
    severity: 'HIGH',
    swcId: 'SWC-101',
    cweId: 'CWE-190',
    historicalIncident: {
      name: 'BeautyChain (BEC) Token BatchOverflow Attack',
      date: 'Aprel 2018',
      stolenAmount: '$900M+ (Token kapitallashuvi nolga tenglashgan)',
      victim: 'BeautyChain ERC-20 Smart Contract',
      summary: 'Attacker batchTransfer orqali uint256 toshishidan foydalanib, 2 ta manzilga 2^255 token yuborgan va cheksiz tokenlarni generatsiya qilgan.'
    },
    summary: 'Solidity 0.7.6 da SafeMath ishlatilmasdan uint256 ko‘paytirilganda toshish sodir bo‘lib qiymat nolga tenglashishi va hisobdagi token tekshiruvini aldash.',
    fuzzTest: 'testFuzz_BatchTransferChecked',
    checklistTasks: [
      {
        id: 'chk-1',
        task: 'Solidity kompilyator versiyasiga (pragma solidity) e’tibor bering.',
        hint: '0.8.0 dan oldingi versiyalarda arifmetik amallar avtomatik tekshirilmaydi!'
      },
      {
        id: 'chk-2',
        task: 'batchTransfer funksiyasidagi amount = cnt * _value amalini ko‘ring.',
        hint: 'Agar cnt = 2 va _value = 2^255 bo‘lsa, amount = 0 bo‘ladi!'
      },
      {
        id: 'chk-3',
        task: 'balances[msg.sender] >= amount tekshiruvi toshganda qanday ishlashini baholang.',
        hint: 'amount = 0 bo‘lgani uchun balansda 0 token bo‘lsa ham shart bajariladi!'
      }
    ],
    fixDiffNotes: [
      'Solidity versiyasi zamonaviy 0.8.20 ga ko‘tarildi, bunda barcha arifmetik amallar avtomatik overflow/underflow uchun tekshiriladi.',
      'Agar cnt * _value toshsa, EVM Panic(0x11) tashlab butun tranzaksiyani revert qiladi.',
      'Zero-address (_receivers[i] != address(0)) va bo‘sh massiv tekshiruvlari joriy etildi.'
    ]
  },
  {
    id: 'case-signature-replay',
    title: 'Wintermute Signature Replay (Missing Nonce/EIP-712)',
    fileName: 'SignatureReplay.sol',
    secureFileName: 'SignatureReplaySecure.sol',
    testFile: 'test/SignatureReplayExploit.t.sol',
    testContract: 'SignatureReplayExploitTest',
    category: 'signature_replay',
    severity: 'HIGH',
    swcId: 'SWC-121',
    cweId: 'CWE-347',
    historicalIncident: {
      name: 'Wintermute / AnySwap Cross-Chain Replay Attack',
      date: 'Iyun 2022',
      stolenAmount: '$8M+ (20M OP Tokens)',
      victim: 'Wintermute Multi-sig & Bridge contracts',
      summary: 'Nonce yoki chainId himoyasi yo‘qligi sababli bir marotaba imzolangan tranzaksiya boshqa tarmoqda yoki takroran 10 marta yuborilib barcha mablag‘lar o‘g‘irlangan.'
    },
    summary: 'transferWithSig funksiyasida bir martalik nonce hisoblagichi va chainId mavjud emasligi tufayli bir marotaba berilgan qonuniy imzo qayta-qayta chaqirilib jamg‘armaning bo‘shatilishi.',
    checklistTasks: [
      {
        id: 'chk-1',
        task: 'transferWithSig() imzo parametrlari ichida nonce mavjudligini tekshiring.',
        hint: 'Faqat to, amount, v, r, s qabul qilinmoqda, nonce yo‘q!'
      },
      {
        id: 'chk-2',
        task: 'Kontraktda EIP-712 Domain Separator va chainid tekshiruvi bor-yo‘qligini tekshiring.',
        hint: 'Domain Separator yo‘q, imzo boshqa tarmoqlarda ham qayta ishlatilishi mumkin.'
      },
      {
        id: 'chk-3',
        task: 'Imzo ishlatilgach biror mappingda executedSignatures[hash] belgilanishini tekshiring.',
        hint: 'Hech qanday holat o‘zgarishi qayd etilmayapti!'
      }
    ],
    fixDiffNotes: [
      'EIP-712 standartiga muvofiq DOMAIN_SEPARATOR joriy etildi (chainId va verifyingContract kiritildi).',
      'Inkremental `nonces[from]++` hisoblagichi kiritilib, imzo bir martalik qilindi.',
      'Deadline (amal qilish muddati) parametri qo‘shildi.',
      'Malleability xujumlariga qarshi `s` qiymatining pastki yarmida bo‘lishi majburiy qilindi.'
    ]
  },
  {
    id: 'case-vulnerable-bank',
    title: 'VulnerableBank (Reentrancy, Phishing, Access Control & Unchecked Call)',
    fileName: 'VulnerableBank.sol',
    secureFileName: 'VulnerableBankSecure.sol',
    testFile: 'test/VulnerableBankExploit.t.sol',
    testContract: 'VulnerableBankTest',
    category: 'reentrancy',
    severity: 'CRITICAL',
    swcId: 'SWC-107',
    cweId: 'CWE-841',
    historicalIncident: {
      name: 'VulnerableBank Student Audit Laboratory',
      date: '2024 - Real-vaqt Laboratoriyasi',
      stolenAmount: '$100M+ (Kombinatsiyalangan 4 ta zaiflik)',
      victim: 'VulnerableBank DeFi Smart Contract',
      summary: 'Reentrancy, tx.origin orqali aldash, ruxsatsiz emergencyWithdraw va unchecked call zaifliklari bitta bank kontraktida birlashtirilgan.'
    },
    summary: 'VulnerableBank bir vaqtning o‘zida 4 ta jiddiy kamchilikni o‘z ichiga oladi: withdraw() dagi reentrancy, transferOwnership() dagi tx.origin phishing, emergencyWithdraw() dagi ruxsat nazorati yo‘qligi va sendReward() dagi unchecked call.',
    checklistTasks: [
      {
        id: 'chk-1',
        task: 'withdraw() funksiyasida tashqi chaqiruvdan oldin balans nolga tenglashtirilishini tekshiring.',
        hint: 'CEI qoidasi buzilgan — balans tashqi chaqiruvdan keyin yangilanmoqda!'
      },
      {
        id: 'chk-2',
        task: 'transferOwnership() funksiyasidagi tx.origin tekshiruvini tahlil qiling.',
        hint: 'tx.origin o‘rniga msg.sender va onlyOwner ishlatilishi shart.'
      },
      {
        id: 'chk-3',
        task: 'emergencyWithdraw() va sendReward() funksiyalaridagi ruxsat va bool tekshiruvlarini baholang.',
        hint: 'emergencyWithdraw ga onlyOwner, sendReward ga require(success) qo‘shilishi lozim.'
      }
    ],
    fixDiffNotes: [
      'ReentrancyGuard (nonReentrant) modifikatori qo‘shildi va CEI qoidasiga ko‘ra balances[msg.sender] = 0 avval bajarildi.',
      'tx.origin o‘rniga msg.sender va qat’iy onlyOwner modifikatori o‘rnatildi.',
      'emergencyWithdraw() funksiyasi faqat onlyOwner uchun cheklandi.',
      'sendReward() funksiyasida call ning (bool success, ) natijasi require(success) orqali tekshirilishi majburiy qilindi.'
    ]
  }
];

const SCENARIOS_BY_ID: Record<string, any> = {
  'case-vulnerable-bank': {
    initialState: { contractBalance: '10.0 ETH', attackerBalance: '1.0 ETH', victimDeposit: '10.0 ETH' },
    exploitTrace: [
      { step: 1, actor: 'AttackerContract', action: 'deposit 1 ETH & call withdraw()', gasUsed: '167,238', stateDelta: '+1 ETH', status: 'success' },
      { step: 2, actor: 'VulnerableBank', action: 'msg.sender.call{value: 1 ETH} before balance update', gasUsed: '111,311', stateDelta: '-1 ETH', status: 'success' },
      { step: 3, actor: 'AttackerContract', action: 'receive() recursive reenter withdraw() x10', gasUsed: '472,350', stateDelta: '-10 ETH (Drained)', status: 'hijacked' }
    ],
    finalStateVulnerable: { contractBalance: '0.0 ETH', attackerBalance: '11.0 ETH', lossPct: '100%' },
    finalStatePatched: { contractBalance: '10.0 ETH', attackerBalance: '1.0 ETH', result: 'Reverted with ReentrancyGuard va onlyOwner himoyasi faol' },
    vulnerableLines: [22, 25, 28, 34, 41, 48]
  },
  'case-reentrancy-dao': {
    initialState: { contractBalance: '10.0 ETH', attackerBalance: '1.0 ETH', victimDeposit: '10.0 ETH' },
    exploitTrace: [
      { step: 1, actor: 'AttackerContract', action: 'attack() deposit 1 ETH', gasUsed: '24,151', stateDelta: '+1 ETH', status: 'success' },
      { step: 2, actor: 'EtherVault', action: 'withdraw() external call', gasUsed: '136,620', stateDelta: '-1 ETH', status: 'success' },
      { step: 3, actor: 'AttackerContract', action: 'receive() recursive reenter withdraw()', gasUsed: '127,382', stateDelta: '-10 ETH (Drained)', status: 'hijacked' }
    ],
    finalStateVulnerable: { contractBalance: '0.0 ETH', attackerBalance: '11.0 ETH', lossPct: '100%' },
    finalStatePatched: { contractBalance: '10.0 ETH', attackerBalance: '1.0 ETH', result: 'Reverted with ReentrancyGuard: reentrant call' },
    vulnerableLines: [18, 25, 28]
  },
  'case-access-control-parity': {
    initialState: { contractBalance: '50.0 ETH', attackerBalance: '0.0 ETH', victimDeposit: '50.0 ETH' },
    exploitTrace: [
      { step: 1, actor: 'Attacker (0xBEEF)', action: 'initWallet(0xBEEF) chaqirish', gasUsed: '42,109', stateDelta: 'owner = attacker', status: 'success' },
      { step: 2, actor: 'Attacker (0xBEEF)', action: 'emergencyDrain() orqali 50 ETH yechib olish', gasUsed: '74,074', stateDelta: '-50 ETH (Xazina bo‘shatildi)', status: 'hijacked' }
    ],
    finalStateVulnerable: { contractBalance: '0.0 ETH', attackerBalance: '50.0 ETH', lossPct: '100%' },
    finalStatePatched: { contractBalance: '50.0 ETH', attackerBalance: '0.0 ETH', result: 'Reverted with Ownable: caller is not the owner' },
    vulnerableLines: [22, 27]
  },
  'case-oracle-manipulation': {
    initialState: { contractBalance: 'Garov: 1 ETH', attackerBalance: '1.0 ETH', victimDeposit: 'AMM: 3,000 USDC/ETH' },
    exploitTrace: [
      { step: 1, actor: 'Attacker', action: 'Flash loan orqali DEX AMM spot zaxirasini 10x buzish', gasUsed: '85,410', stateDelta: 'Spot narx: 30,000 USDC', status: 'success' },
      { step: 2, actor: 'Attacker', action: '1 ETH garov qo‘yib 24,000 USDC qarz olish (80% LTV)', gasUsed: '92,442', stateDelta: '+24,000 USDC olingan', status: 'hijacked' }
    ],
    finalStateVulnerable: { contractBalance: '1.0 ETH', attackerBalance: '24,000 USDC', lossPct: '800% Overborrow' },
    finalStatePatched: { contractBalance: '1.0 ETH', attackerBalance: '2,400 USDC (Normal LTV)', result: 'Chainlink Data Feed bo‘yicha to‘g‘ri baholandi' },
    vulnerableLines: [24, 30]
  },
  'case-integer-overflow': {
    initialState: { contractBalance: '1,000,000 BEC', attackerBalance: '0 BEC', victimDeposit: '2 ta manzil' },
    exploitTrace: [
      { step: 1, actor: 'Attacker', action: 'batchTransfer([A, B], 2^255) yuborish', gasUsed: '108,131', stateDelta: 'cnt * value = 0 (Overflow)', status: 'success' },
      { step: 2, actor: 'BEC Contract', action: 'balances[msg.sender] >= 0 tekshiruvidan o‘tish', gasUsed: '45,210', stateDelta: '+2^255 tokens har biriga', status: 'hijacked' }
    ],
    finalStateVulnerable: { contractBalance: '0 BEC qiymat', attackerBalance: 'Cheksiz (Inflyatsiya)', lossPct: '100% Kapital yo‘qotildi' },
    finalStatePatched: { contractBalance: '1,000,000 BEC', attackerBalance: '0 BEC', result: 'Reverted with Panic(0x11): Arithmetic overflow' },
    vulnerableLines: [23, 26]
  },
  'case-signature-replay': {
    initialState: { contractBalance: '8,000,000 OP', attackerBalance: '0 OP', victimDeposit: '8M OP Bridge' },
    exploitTrace: [
      { step: 1, actor: 'Signer', action: 'transferWithSig() qonuniy 1-marotaba imzolash', gasUsed: '110,420', stateDelta: '+800,000 OP o‘tkazildi', status: 'success' },
      { step: 2, actor: 'Attacker', action: 'Xuddi shu v, r, s imzoni takroran 9 marta chaqirish', gasUsed: '394,629', stateDelta: '-7.2M OP (Replay Drain)', status: 'hijacked' }
    ],
    finalStateVulnerable: { contractBalance: '0 OP', attackerBalance: '8,000,000 OP', lossPct: '100%' },
    finalStatePatched: { contractBalance: '7,200,000 OP', attackerBalance: '800,000 OP', result: 'Reverted with NonceAlreadyUsedOrInvalid' },
    vulnerableLines: [30, 36]
  }
};

function readBody(req: any): Promise<any> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk: any) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function runCommandStream(
  command: string,
  args: string[],
  cwd: string,
  res: any
): Promise<{ exitCode: number; fullOutput: string }> {
  return new Promise((resolve) => {
    let fullOutput = '';
    const child = spawn(command, args, { cwd, shell: true });

    const handleChunk = (chunk: Buffer) => {
      const text = chunk.toString();
      fullOutput += text;
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.trim()) {
          res.write(`data: ${JSON.stringify({ type: 'output', text: line })}\n\n`);
        }
      }
    };

    child.stdout.on('data', handleChunk);
    child.stderr.on('data', handleChunk);

    child.on('close', (code) => {
      const exitCode = code ?? 0;
      res.write(`data: ${JSON.stringify({ type: 'done', exitCode })}\n\n`);
      res.end();
      resolve({ exitCode, fullOutput });
    });

    child.on('error', (err) => {
      res.write(`data: ${JSON.stringify({ type: 'error', error: err.message })}\n\n`);
      res.end();
      resolve({ exitCode: 1, fullOutput: err.message });
    });
  });
}

function runSlitherJson(contractPath: string, cwd: string): Promise<any[]> {
  return new Promise((resolve) => {
    const child = spawn(
      'slither',
      [contractPath, '--compile-force-framework', 'foundry', '--json', '-'],
      { cwd, shell: true }
    );
    let output = '';
    child.stdout.on('data', (d) => (output += d.toString()));
    child.on('close', () => {
      try {
        const parsed = JSON.parse(output);
        const detectors = parsed?.results?.detectors || [];
        const issues = detectors.map((d: any, index: number) => {
          const lines: number[] = [];
          if (Array.isArray(d.elements)) {
            for (const el of d.elements) {
              if (el?.source_mapping?.lines) {
                lines.push(...el.source_mapping.lines);
              }
            }
          }
          const uniqueLines = Array.from(new Set(lines)).sort((a: number, b: number) => a - b);
          return {
            id: `slither-${d.check}-${index}`,
            check: d.check,
            impact: d.impact ? d.impact.toUpperCase() : 'INFORMATIONAL',
            confidence: d.confidence || 'Medium',
            description: d.description || d.check,
            lines: uniqueLines,
            recommendation: `Slither tavsiyasi: ${d.check} zaifligini bartaraf eting.`
          };
        });
        resolve(issues);
      } catch {
        resolve([]);
      }
    });
    child.on('error', () => resolve([]));
  });
}

function analyzeCodeVulnerabilities(code: string): { vulnerableLines: number[]; issues: any[] } {
  const lines = code.split('\n');
  const issues: any[] = [];
  const vulnLineSet = new Set<number>();

  let insideFunction = false;
  let currentFunctionName = '';
  let functionHasNonReentrant = false;
  let functionHasOnlyOwner = false;
  let externalCallLine: number | null = null;

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const line = lines[i];
    const trimmed = line.trim();

    // 1. tx.origin Phishing zaifligi
    if (line.includes('tx.origin')) {
      vulnLineSet.add(lineNum);
      issues.push({
        id: `tx-origin-${lineNum}`,
        check: 'tx-origin',
        severity: 'HIGH',
        title: 'tx.origin Phishing Zaifligi (SWC-115)',
        lines: [lineNum],
        description: 'Autentifikatsiyada tx.origin ishlatilgan. Hujumchi fishing orqali shartnoma egasini aldab egalikni tortib olishi mumkin.',
        recommendation: 'tx.origin o‘rniga msg.sender tekshiruvidan foydalaning.'
      });
    }

    // 2. Unchecked Low-Level Call
    if (
      line.includes('.call{value:') &&
      !line.includes('(bool') &&
      !line.includes('require(') &&
      !line.includes('if (!')
    ) {
      vulnLineSet.add(lineNum);
      issues.push({
        id: `unchecked-call-${lineNum}`,
        check: 'unchecked-lowlevel',
        severity: 'MEDIUM',
        title: 'Unchecked Low-Level Call (SWC-104)',
        lines: [lineNum],
        description: 'Past darajadagi call o‘tkazmasi muvaffaqiyati (bool success) tekshirilmagan. Mablag‘ jo‘natilmasa ham tranzaksiya revert bo‘lmaydi.',
        recommendation: '(bool success, ) = ...; require(success, "Failed"); qilib tekshiring.'
      });
    }

    // Track function boundaries
    const fnMatch = line.match(/function\s+([a-zA-Z0-9_]+)/);
    if (fnMatch) {
      insideFunction = true;
      currentFunctionName = fnMatch[1];
      functionHasNonReentrant = line.includes('nonReentrant');
      functionHasOnlyOwner = line.includes('onlyOwner') || line.includes('onlyAdmin');
      externalCallLine = null;
    }

    if (insideFunction) {
      if (line.includes('nonReentrant')) functionHasNonReentrant = true;
      if (line.includes('onlyOwner')) functionHasOnlyOwner = true;

      // Check external calls
      if (line.includes('.call{value:') || line.includes('.call{') || line.includes('.transfer(') || line.includes('.send(')) {
        if (!functionHasNonReentrant) {
          externalCallLine = lineNum;
        }
      }

      // Reentrancy: State change AFTER external call
      if (externalCallLine && (line.includes('balances[') || line.includes('balance[') || line.includes(' = 0') || line.includes(' -= '))) {
        vulnLineSet.add(externalCallLine);
        vulnLineSet.add(lineNum);
        issues.push({
          id: `reentrancy-${externalCallLine}`,
          check: 'reentrancy-eth',
          severity: 'CRITICAL',
          title: 'Reentrancy Zaifligi (SWC-107 / CEI Buzilishi)',
          lines: [externalCallLine, lineNum],
          description: `${currentFunctionName} funksiyasida ${externalCallLine}-qatordagi tashqi chaqiruvdan keyin ${lineNum}-qatorda balans yangilanmoqda. CEI qoidasi buzilgan.`,
          recommendation: 'Checks-Effects-Interactions (avval balansni 0 qilish) yoki ReentrancyGuard ishlating.'
        });
        externalCallLine = null;
      }

      // Broken Access Control on emergency/drain functions
      if (
        (currentFunctionName.toLowerCase().includes('emergency') || currentFunctionName.toLowerCase().includes('drain')) &&
        (line.includes('.transfer(') || line.includes('.call{value:')) &&
        !functionHasOnlyOwner
      ) {
        vulnLineSet.add(lineNum);
        issues.push({
          id: `access-control-${lineNum}`,
          check: 'arbitrary-send-eth',
          severity: 'CRITICAL',
          title: 'Broken Access Control (Ruxsatsiz Mablag‘ Yechish)',
          lines: [lineNum],
          description: `${currentFunctionName} funksiyasida kirish cheklovi (onlyOwner) mavjud emas. Istalgan foydalanuvchi butun kontrakt balansini o‘ziga yechib oladi.`,
          recommendation: 'Funksiyaga onlyOwner modifikatorini o‘rnating.'
        });
      }

      if (trimmed === '}') {
        insideFunction = false;
        externalCallLine = null;
      }
    }
  }

  return {
    vulnerableLines: Array.from(vulnLineSet).sort((a, b) => a - b),
    issues
  };
}

export function auditApiPlugin(): Plugin {
  return {
    name: 'audit-lab-realtime-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        const projectRoot = process.cwd();
        const notesFile = path.join(projectRoot, '.audit_notes.json');
        const progressFile = path.join(projectRoot, '.audit_progress.json');

        // 1. GET /api/system/status
        if (url === '/api/system/status' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          const checkTool = (cmd: string): Promise<string> =>
            new Promise((resolve) => {
              const child = spawn(cmd, ['--version'], { shell: true });
              let out = '';
              child.stdout.on('data', (d) => (out += d.toString()));
              child.stderr.on('data', (d) => (out += d.toString()));
              child.on('close', () => resolve(out.trim().split('\n')[0] || 'Available'));
              child.on('error', () => resolve('Not found'));
            });

          const [forgeVer, slitherVer, anvilVer] = await Promise.all([
            checkTool('forge'),
            checkTool('slither'),
            checkTool('anvil')
          ]);

          res.end(
            JSON.stringify({
              status: 'online',
              forge: { available: !forgeVer.includes('Not found'), version: forgeVer },
              slither: { available: !slitherVer.includes('Not found'), version: slitherVer },
              anvil: { available: !anvilVer.includes('Not found'), version: anvilVer },
              nodeVersion: process.version,
              realtimeActive: true
            })
          );
          return;
        }

        // 1b. POST /api/wallet/derive (MetaMask manzil, Private Key yoki Mnemonic dan manzilni hisoblash)
        if (url === '/api/wallet/derive' && req.method === 'POST') {
          res.setHeader('Content-Type', 'application/json');
          const body = await readBody(req);
          const raw = (body.input || '').trim();

          // A. Agar 42 belgili 0x manzil bo'lsa
          if (/^0x[0-9a-fA-F]{40}$/.test(raw)) {
            res.end(JSON.stringify({ success: true, address: raw, type: 'address' }));
            return;
          }

          // B. Agar 64 yoki 66 belgili Private Key bo'lsa
          const hexOnly = raw.startsWith('0x') ? raw.slice(2) : raw;
          if (/^[0-9a-fA-F]{64}$/.test(hexOnly)) {
            const child = spawn('cast', ['wallet', 'address', '--private-key', '0x' + hexOnly], { shell: true });
            let out = '';
            child.stdout.on('data', (d) => (out += d.toString()));
            child.on('close', (code) => {
              const addr = out.trim();
              if (code === 0 && /^0x[0-9a-fA-F]{40}$/.test(addr)) {
                res.end(JSON.stringify({ success: true, address: addr, type: 'private_key' }));
              } else {
                res.end(JSON.stringify({ success: false, error: 'Private Key orqali manzil topilmadi' }));
              }
            });
            return;
          }

          // C. Agar 12 yoki 24 so'zli Mnemonic Phrase bo'lsa
          const words = raw.split(/\s+/);
          if (words.length >= 12 && words.length <= 24) {
            const child = spawn('cast', ['wallet', 'address', '--mnemonic', `"${raw}"`], { shell: true });
            let out = '';
            child.stdout.on('data', (d) => (out += d.toString()));
            child.on('close', (code) => {
              const addr = out.trim();
              if (code === 0 && /^0x[0-9a-fA-F]{40}$/.test(addr)) {
                res.end(JSON.stringify({ success: true, address: addr, type: 'mnemonic' }));
              } else {
                res.end(JSON.stringify({ success: false, error: 'Secret recovery phrase noto‘g‘ri' }));
              }
            });
            return;
          }

          res.end(JSON.stringify({ success: false, error: 'Kiritilgan format noto‘g‘ri' }));
          return;
        }

        // 2. GET /api/contracts (DYNAMIQ: Diskdagi haqiqiy fayllardan o'qiydi!)
        if (url === '/api/contracts' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          try {
            const contractsData = CONTRACT_CONFIGS.map((cfg) => {
              const vulnPath = path.join(projectRoot, 'contracts', cfg.fileName);
              const securePath = path.join(projectRoot, 'contracts', cfg.secureFileName);
              const testPath = path.join(projectRoot, cfg.testFile);

              const vulnerableCode = fs.existsSync(vulnPath)
                ? fs.readFileSync(vulnPath, 'utf-8')
                : '// Fayl topilmadi';
              const fixedCode = fs.existsSync(securePath)
                ? fs.readFileSync(securePath, 'utf-8')
                : '// Fayl topilmadi';
              const testCode = fs.existsSync(testPath)
                ? fs.readFileSync(testPath, 'utf-8')
                : '// Test topilmadi';

              const scenarioData = SCENARIOS_BY_ID[cfg.id] || SCENARIOS_BY_ID['case-reentrancy-dao'];

              return {
                id: cfg.id,
                title: cfg.title,
                fileName: cfg.fileName,
                secureFileName: cfg.secureFileName,
                historicalIncident: cfg.historicalIncident,
                category: cfg.category,
                severity: cfg.severity,
                summary: cfg.summary,
                vulnerableCode,
                fixedCode,
                fixDiffNotes: cfg.fixDiffNotes || [],
                manualAuditChecklist: cfg.checklistTasks.map((t) => ({ ...t, completed: false })),
                findings: [
                  {
                    id: `FIND-${cfg.swcId}`,
                    title: cfg.title,
                    severity: cfg.severity,
                    category: cfg.category,
                    swcId: cfg.swcId,
                    cweId: cfg.cweId,
                    vulnerableLines: scenarioData.vulnerableLines || [18, 25, 28],
                    description: cfg.summary,
                    impact: `${cfg.severity} darajadagi yo‘qotish va mablag‘ o‘g‘irlanishi.`,
                    rootCause: 'Xavfsiz dasturlash patternlariga rioya etilmagan.',
                    recommendation: 'Checks-Effects-Interactions, OpenZeppelin yoki Chainlink oracledan foydalaning.'
                  }
                ],
                slitherReport: {
                  summary: `${cfg.fileName} bo‘yicha Slither statik detektorlari real-vaqtda tekshirilishi mumkin.`,
                  issues: []
                },
                exploitScenario: {
                  testFramework: 'Foundry',
                  testFileName: path.basename(cfg.testFile),
                  testCode,
                  initialState: scenarioData.initialState,
                  exploitTrace: scenarioData.exploitTrace,
                  finalStateVulnerable: scenarioData.finalStateVulnerable,
                  finalStatePatched: scenarioData.finalStatePatched
                }
              };
            });

            res.end(JSON.stringify({ success: true, contracts: contractsData }));
          } catch (e: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: e.message }));
          }
          return;
        }

        // 2b. POST /api/contracts/save (DYNAMIQ: Kodni qo'lda yozish va saqlab kompilyatsiya qilish)
        if (url === '/api/contracts/save' && req.method === 'POST') {
          res.setHeader('Content-Type', 'application/json');
          try {
            const body = await readBody(req);
            let fileName = path.basename(body.fileName || 'VulnerableBank.sol');
            if (!fileName.endsWith('.sol')) fileName += '.sol';
            const code = body.code || '';
            const filePath = path.join(projectRoot, 'contracts', fileName);

            fs.writeFileSync(filePath, code, 'utf-8');

            // forge build orqali sintaksis va kompilyatsiyani tekshirish
            const buildProcess = spawn('forge', ['build'], { cwd: projectRoot });
            let stderr = '';
            let stdout = '';
            buildProcess.stdout.on('data', (d) => { stdout += d.toString(); });
            buildProcess.stderr.on('data', (d) => { stderr += d.toString(); });
            buildProcess.on('close', (exitCode) => {
              if (exitCode === 0) {
                res.end(JSON.stringify({ success: true, message: 'Kompilyatsiya muvaffaqiyatli o‘tdi! Kod saqlandi.' }));
              } else {
                res.end(JSON.stringify({ success: false, error: stderr || stdout || 'Kompilyatsiya xatosi yuz berdi' }));
              }
            });
          } catch (e: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: e.message }));
          }
          return;
        }

        // 2c-1. GET /api/contracts/bytecode?name=... (Kompilyatsiya qilingan baytkodni olish)
        if (url.startsWith('/api/contracts/bytecode') && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          try {
            const parsedUrl = new URL(url, 'http://localhost');
            let contractName = parsedUrl.searchParams.get('name') || 'VulnerableBankSecure';
            contractName = contractName.replace('.sol', '');

            // 1. To'g'ridan-to'g'ri out/ papkasidan qidirish
            const directPath = path.join(projectRoot, 'out', `${contractName}.sol`, `${contractName}.json`);
            if (fs.existsSync(directPath)) {
              const data = JSON.parse(fs.readFileSync(directPath, 'utf-8'));
              const bytecode = data?.bytecode?.object || '';
              res.end(JSON.stringify({ success: true, contractName, bytecode, abi: data?.abi || [] }));
              return;
            }

            // 2. out papkasidagi barcha sub-folderlardan qidirish
            const outDirs = fs.readdirSync(path.join(projectRoot, 'out'), { withFileTypes: true });
            for (const d of outDirs) {
              if (d.isDirectory()) {
                const subPath = path.join(projectRoot, 'out', d.name, `${contractName}.json`);
                if (fs.existsSync(subPath)) {
                  const data = JSON.parse(fs.readFileSync(subPath, 'utf-8'));
                  const bytecode = data?.bytecode?.object || '';
                  res.end(JSON.stringify({ success: true, contractName, bytecode, abi: data?.abi || [] }));
                  return;
                }
              }
            }

            res.end(JSON.stringify({ success: false, error: `Bytecode topilmadi: ${contractName}` }));
          } catch (e: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: e.message }));
          }
          return;
        }

        // 2c-2. GET /api/blockchain/block-number?networkId=... (Real-vaqtdagi eng so'nggi blok raqamini olish)
        if (url.startsWith('/api/blockchain/block-number') && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          try {
            const parsedUrl = new URL(url, 'http://localhost');
            const netId = parsedUrl.searchParams.get('networkId') || '0xaa36a7';
            let rpc = 'https://ethereum-sepolia-rpc.publicnode.com';
            if (netId === '0x1') rpc = 'https://ethereum-rpc.publicnode.com';
            else if (netId === '0x89') rpc = 'https://polygon-rpc.com';
            else if (netId === '0xa4b1') rpc = 'https://arb1.arbitrum.io/rpc';
            else if (netId === '0x7a69') rpc = 'http://127.0.0.1:8545';

            const resp = await fetch(rpc, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_blockNumber', params: [] })
            });
            const data = await resp.json();
            if (data && data.result) {
              const blockNum = parseInt(data.result, 16);
              res.end(JSON.stringify({ success: true, blockNumber: blockNum, hex: data.result }));
              return;
            }
            res.end(JSON.stringify({ success: true, blockNumber: 12195625 }));
          } catch (e: any) {
            res.end(JSON.stringify({ success: true, blockNumber: 12195625 }));
          }
          return;
        }

        // 2c. POST /api/audit/scan-code (DYNAMIQ: Kodni run qilib zaiflik qatorlarini aniqlash)
        if (url === '/api/audit/scan-code' && req.method === 'POST') {
          res.setHeader('Content-Type', 'application/json');
          try {
            const body = await readBody(req);
            let fileName = path.basename(body.fileName || 'VulnerableBank.sol');
            if (!fileName.endsWith('.sol')) fileName += '.sol';
            const code = body.code || '';
            const filePath = path.join(projectRoot, 'contracts', fileName);

            // Kodni diskka yozish
            fs.writeFileSync(filePath, code, 'utf-8');

            // 1. Statik pattern tahlilchisi (darhol qatorlarni aniqlaydi)
            const patternResults = analyzeCodeVulnerabilities(code);

            // 2. Slither AST tahlilchisi
            let slitherIssues: any[] = [];
            try {
              slitherIssues = await runSlitherJson(path.join('contracts', fileName), projectRoot);
            } catch (e) {
              slitherIssues = [];
            }

            // Qatorlarni birlashtirish
            const combinedLines = new Set<number>(patternResults.vulnerableLines);
            for (const s of slitherIssues) {
              if (['HIGH', 'CRITICAL', 'MEDIUM'].includes(s.impact)) {
                for (const l of s.lines || []) {
                  if (l > 1) combinedLines.add(l);
                }
              }
            }

            // Muammolarni birlashtirish
            const allIssues = [...patternResults.issues];
            for (const s of slitherIssues) {
              if (!allIssues.some((it) => it.check === s.check)) {
                allIssues.push({
                  id: s.id,
                  check: s.check,
                  severity: s.impact || 'MEDIUM',
                  title: `Slither: ${s.check}`,
                  lines: s.lines || [],
                  description: s.description,
                  recommendation: s.recommendation
                });
              }
            }

            res.end(
              JSON.stringify({
                success: true,
                fileName,
                vulnerableLines: Array.from(combinedLines).sort((a, b) => a - b),
                issues: allIssues,
                totalIssues: allIssues.length
              })
            );
          } catch (e: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: e.message, vulnerableLines: [], issues: [] }));
          }
          return;
        }

        // 3. GET /api/slither/detectors?file=... (DYNAMIQ: Slither JSON tahlili!)
        if (url.startsWith('/api/slither/detectors') && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          const parsedUrl = new URL(url, 'http://localhost');
          const file = parsedUrl.searchParams.get('file') || 'EtherVault.sol';
          const contractPath = path.join('contracts', file);

          try {
            const issues = await runSlitherJson(contractPath, projectRoot);
            res.end(JSON.stringify({ success: true, file, issues }));
          } catch (e: any) {
            res.end(JSON.stringify({ success: false, issues: [] }));
          }
          return;
        }

        // 4. GET /api/notes va POST /api/notes (DYNAMIQ: Auditor izohlarini diskda saqlash!)
        if (url === '/api/notes') {
          if (req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json');
            if (fs.existsSync(notesFile)) {
              res.end(fs.readFileSync(notesFile, 'utf-8'));
            } else {
              res.end(JSON.stringify({}));
            }
            return;
          }
          if (req.method === 'POST') {
            const body = await readBody(req);
            fs.writeFileSync(notesFile, JSON.stringify(body, null, 2), 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
            return;
          }
        }

        // 5. GET /api/progress va POST /api/progress (DYNAMIQ: Topshiriqlar bajarilishini saqlash!)
        if (url === '/api/progress') {
          if (req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json');
            if (fs.existsSync(progressFile)) {
              res.end(fs.readFileSync(progressFile, 'utf-8'));
            } else {
              res.end(JSON.stringify({ 'task-1': true }));
            }
            return;
          }
          if (req.method === 'POST') {
            const body = await readBody(req);
            fs.writeFileSync(progressFile, JSON.stringify(body, null, 2), 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
            return;
          }
        }

        // 6. POST /api/forge/run-exploit (SSE Stream)
        if (url === '/api/forge/run-exploit' && req.method === 'POST') {
          const body = await readBody(req);
          const contractId = body.contractId || 'case-reentrancy-dao';
          const verbosity = body.verbosity || '-vvvv';
          const info = CONTRACT_CONFIGS.find((c) => c.id === contractId) || CONTRACT_CONFIGS[0];

          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive'
          });

          res.write(
            `data: ${JSON.stringify({
              type: 'start',
              target: info.testContract,
              command: `forge test --match-contract ${info.testContract} ${verbosity}`
            })}\n\n`
          );

          await runCommandStream(
            'forge',
            ['test', '--match-contract', info.testContract, verbosity],
            projectRoot,
            res
          );
          return;
        }

        // 7. POST /api/forge/verify-fix (SSE Stream)
        if (url === '/api/forge/verify-fix' && req.method === 'POST') {
          const body = await readBody(req);
          const contractId = body.contractId || 'case-reentrancy-dao';
          const info = CONTRACT_CONFIGS.find((c) => c.id === contractId) || CONTRACT_CONFIGS[0];

          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive'
          });

          let testArgs: string[] = [];
          if (contractId === 'case-signature-replay') {
            testArgs = ['test', '--match-test', 'testSecureContractBlocksReplay', '-vvvv'];
          } else if (contractId === 'case-access-control-parity') {
            testArgs = ['test', '--match-test', 'testSecureContractBlocksUnauthorizedInit', '-vvvv'];
          } else if (contractId === 'case-oracle-manipulation') {
            testArgs = ['test', '--match-test', 'testSecureContractUsesChainlinkFeed', '-vvvv'];
          } else if (contractId === 'case-vulnerable-bank') {
            testArgs = ['test', '--match-contract', 'VulnerableBankTest', '--match-test', 'testSecureBank', '-vvvv'];
          } else if (info.fuzzTest) {
            testArgs = ['test', '--match-test', info.fuzzTest, '-vvvv'];
          } else {
            testArgs = ['test', '--match-contract', info.testContract, '-vvv'];
          }

          res.write(
            `data: ${JSON.stringify({
              type: 'start',
              command: `forge ${testArgs.join(' ')}`
            })}\n\n`
          );

          await runCommandStream('forge', testArgs, projectRoot, res);
          return;
        }

        // 8. POST /api/slither/scan (SSE Stream)
        if (url === '/api/slither/scan' && req.method === 'POST') {
          const body = await readBody(req);
          const contractFile = body.contractFile || 'EtherVault.sol';
          const contractPath = path.join('contracts', contractFile);

          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive'
          });

          res.write(
            `data: ${JSON.stringify({
              type: 'start',
              target: contractPath,
              command: `slither ${contractPath} --solc-remaps '@openzeppelin/=lib/openzeppelin-contracts/'`
            })}\n\n`
          );

          await runCommandStream(
            'slither',
            [
              contractPath,
              '--solc-remaps',
              '@openzeppelin/=lib/openzeppelin-contracts/',
              '--compile-force-framework',
              'foundry'
            ],
            projectRoot,
            res
          );
          return;
        }

        next();
      });
    }
  };
}
