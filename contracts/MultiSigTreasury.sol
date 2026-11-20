// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

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

    // [XATO]: Initsializatsiya himoyasiz qolgan
    function initWallet(address _newOwner) public {
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
}
