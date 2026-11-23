// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VulnerableBankSecure (TUZATILGAN VA XAVFSIZLIGI TASDIQLANGAN VERSIYA)
 * @notice Barcha 4 ta xavfsizlik zaifliklari bartaraf etilgan:
 * 1. Reentrancy: ReentrancyGuard va Checks-Effects-Interactions (CEI) joriy etildi.
 * 2. Phishing: tx.origin o'rniga qat'iy msg.sender autentifikatsiyasi o'rnatildi.
 * 3. Access Control: emergencyWithdraw faqat onlyOwner huquqiga ega qilindi.
 * 4. Low-Level Call: sendReward da qaytgan bool success tekshiruvi majburiy qilindi.
 */
abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status = _NOT_ENTERED;

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}

contract VulnerableBankSecure is ReentrancyGuard {
    address public owner;
    mapping(address => uint256) public balances;

    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    event OwnershipTransferred(address indexed oldOwner, address indexed newOwner);
    event EmergencyDrain(address indexed to, uint256 amount);
    event RewardSent(address indexed recipient, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Faqat egasi (onlyOwner)");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function deposit() external payable {
        require(msg.value > 0, "Summa 0 dan katta bo'lishi kerak");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    // 1-TUZATISH: ReentrancyGuard (nonReentrant) va CEI (avval balans = 0, keyin call)
    function withdraw() external nonReentrant {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "Balans yetarli emas");

        // 1. CHECKS: amount > 0
        // 2. EFFECTS: Tashqi chaqiruvdan oldin balans 0 qilinadi
        balances[msg.sender] = 0;

        // 3. INTERACTIONS: Shundan so'ng tashqi call yuboriladi
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "O'tkazma amalga oshmadi");

        emit Withdrawal(msg.sender, amount);
    }

    // 2-TUZATISH: tx.origin o'rniga xavfsiz msg.sender
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Yaroqsiz yangi egasi");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    // 3-TUZATISH: Kirish huquqi (onlyOwner) majburiy qilindi
    function emergencyWithdraw(address payable to) external onlyOwner {
        require(to != address(0), "Yaroqsiz qabul qiluvchi");
        uint256 contractBalance = address(this).balance;
        emit EmergencyDrain(to, contractBalance);
        (bool success, ) = to.call{value: contractBalance}("");
        require(success, "Favqulodda yechish muvaffaqiyatsiz");
    }

    // 4-TUZATISH: Unchecked call qaytgan bool natijasi qat'iy tekshiriladi
    function sendReward(address payable recipient, uint256 amount) external onlyOwner {
        require(recipient != address(0), "Yaroqsiz qabul qiluvchi");
        require(address(this).balance >= amount, "Kontraktda yetarli ETH yo'q");

        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Mukofot o'tkazmasi muvaffaqiyatsiz");

        emit RewardSent(recipient, amount);
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
