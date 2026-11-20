// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title EtherVault (ZAIF VERSIYA)
 * @dev SWC-107 Reentrancy Vulnerability
 */
contract EtherVault {
    mapping(address => uint256) public balances;

    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);

    function deposit() external payable {
        require(msg.value > 0, "Zero ETH deposit");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw() external {
        uint256 bal = balances[msg.sender];
        require(bal > 0, "No balance");

        // Vulnerable external call before state update:
        (bool success, ) = msg.sender.call{value: bal}("");
        require(success, "Transfer failed");

        balances[msg.sender] = 0;
        emit Withdrawal(msg.sender, bal);
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
