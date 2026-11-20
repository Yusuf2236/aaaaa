// SPDX-License-Identifier: MIT
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

        uint256 totalAmount = cnt * _value;

        require(balances[msg.sender] >= totalAmount, "Balans yetarli emas");

        balances[msg.sender] -= totalAmount;
        for (uint256 i = 0; i < cnt; i++) {
            require(_receivers[i] != address(0), "Nol manzilga jo'natib bo'lmaydi");
            balances[_receivers[i]] += _value;
        }
        return true;
    }
}
