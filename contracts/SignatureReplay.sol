// SPDX-License-Identifier: MIT
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
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );

        address signer = ecrecover(ethSignedMessageHash, v, r, s);
        require(signer == from, "Yaroqsiz imzo");
        require(balances[from] >= amount, "Mablag' yetarli emas");

        balances[from] -= amount;
        balances[to] += amount;

        emit Transfer(from, to, amount);
    }
}
