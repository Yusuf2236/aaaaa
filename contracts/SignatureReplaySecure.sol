// SPDX-License-Identifier: MIT
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
            abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash)
        );

        address signer = ecrecover(digest, v, r, s);
        require(signer != address(0) && signer == from, "Yaroqsiz imzo");
        require(balances[from] >= amount, "Mablag' yetarli emas");

        balances[from] -= amount;
        balances[to] += amount;

        emit Transfer(from, to, amount);
    }
}
