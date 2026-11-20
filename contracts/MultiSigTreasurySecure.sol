// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

abstract contract Ownable2Step {
    address private _owner;
    address private _pendingOwner;

    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor(address initialOwner) {
        require(initialOwner != address(0), "Ownable: initial owner is the zero address");
        _owner = initialOwner;
        emit OwnershipTransferred(address(0), initialOwner);
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }

    function pendingOwner() public view virtual returns (address) {
        return _pendingOwner;
    }

    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    function _checkOwner() internal view virtual {
        require(owner() == msg.sender, "Ownable: caller is not the owner");
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        _pendingOwner = newOwner;
        emit OwnershipTransferStarted(owner(), newOwner);
    }

    function acceptOwnership() public virtual {
        require(msg.sender == pendingOwner(), "Ownable2Step: caller is not the new owner");
        _transferOwnership(msg.sender);
    }

    function _transferOwnership(address newOwner) internal virtual {
        delete _pendingOwner;
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

/**
 * @title MultiSigTreasurySecure (TUZATILGAN XAVFSIZ VERSIYA)
 * @notice Ownable2Step va qat'iy konstruktor initsializatsiyasi
 */
contract MultiSigTreasurySecure is Ownable2Step {
    mapping(address => bool) public isOperator;

    event FundsSent(address indexed to, uint256 amount);

    constructor(address _initialOwner) Ownable2Step(_initialOwner) {
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
}
