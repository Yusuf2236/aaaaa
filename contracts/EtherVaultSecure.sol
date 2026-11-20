// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EtherVaultSecure (TUZATILGAN XAVFSIZ VERSIYA)
 * @dev ReentrancyGuard va Checks-Effects-Interactions (CEI) pattern
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

contract EtherVaultSecure is ReentrancyGuard {
    mapping(address => uint256) public balances;

    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);

    function deposit() external payable {
        require(msg.value > 0, "Zero ETH deposit");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw() external nonReentrant {
        uint256 bal = balances[msg.sender];
        require(bal > 0, "No balance");

        // 1. CHECKS: bal > 0
        // 2. EFFECTS: Tashqi chaqiruvdan oldin balans nolga tenglashtiriladi
        balances[msg.sender] = 0;

        // 3. INTERACTIONS: Shundan keyingina tashqi call yuboriladi
        (bool success, ) = msg.sender.call{value: bal}("");
        require(success, "Transfer failed");

        emit Withdrawal(msg.sender, bal);
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
