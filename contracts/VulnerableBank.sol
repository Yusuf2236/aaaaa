// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VulnerableBank
 * @notice DIQQAT: Ushbu kontrakt ataylab xavfsizlik kamchiliklari bilan yozilgan.
 * Faqat test, o'rganish va xavfsizlik auditi (Slither, Foundry, Hardhat) uchun foydalaning!
 */
contract VulnerableBank {
    address public owner;
    mapping(address => uint256) public balances;

    constructor() {
        owner = msg.sender;
    }

    // Kontraktga mablag' kiritish
    function deposit() external payable {
        require(msg.value > 0, "Summa 0 dan katta bo'lishi kerak");
        balances[msg.sender] += msg.value;
    }

    // 1-ZAIFLIK: Reentrancy (Qayta kirish hujumi)
    // Balans nolga tushirilishidan oldin mablag' yuborilmoqda (CEI qoidasi buzilgan)
    function withdraw() external {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "Balans yetarli emas");

        // XAVFLI: Tashqi kontraktga murojaat state o'zgarishidan oldin qilinmoqda
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "O'tkazma amalga oshmadi");

        // Hujumchi receive()/fallback() orqali shu qatorga yetmasdan withdraw() ni qayta chaqira oladi
        balances[msg.sender] = 0;
    }

    // 2-ZAIFLIK: tx.origin orqali autentifikatsiya (Phishing hujumiga ochiq)
    // msg.sender o'rniga tx.origin ishlatilgan
    function transferOwnership(address newOwner) external {
        require(tx.origin == owner, "Faqat egasi o'zgartira oladi");
        owner = newOwner;
    }

    // 3-ZAIFLIK: Broken Access Control (Kirish huquqi tekshirilmagan)
    // onlyOwner cheklovi qo'yilmagan — istalgan foydalanuvchi barcha mablag'ni yechib ola oladi
    function emergencyWithdraw(address payable to) external {
        uint256 contractBalance = address(this).balance;
        to.transfer(contractBalance);
    }

    // 4-ZAIFLIK: Unchecked Low-Level Call (Qaytgan natija tekshirilmagan)
    // Agar o'tkazma muvaffaqiyatsiz tugasa ham, tranzaksiya revert bo'lmaydi
    function sendReward(address payable recipient, uint256 amount) external {
        require(msg.sender == owner, "Faqat egasi");
        recipient.call{value: amount}(""); // bool success tekshirilmagan
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}