// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BatchTokenTransfer (ZAIF VERSIYA)
 * @notice Bir nechta manzillarga bir vaqtda token ulashuvchi funksiya
 * @dev ZAIFLIK: SWC-101 (Integer Overflow). Unchecked arithmetic ishlatilgan.
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
        uint256 amount;
        unchecked {
            amount = cnt * _value;
        }

        require(cnt > 0 && cnt <= 20, "Noto'g'ri qabul qiluvchilar soni");
        require(_value > 0, "Qiymat 0 dan katta bo'lsin");
        require(balances[msg.sender] >= amount, "Balans yetarli emas");

        unchecked {
            balances[msg.sender] = balances[msg.sender] - amount;
            for (uint256 i = 0; i < cnt; i++) {
                balances[_receivers[i]] = balances[_receivers[i]] + _value;
            }
        }
        return true;
    }
}
