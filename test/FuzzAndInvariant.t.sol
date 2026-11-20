// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/EtherVault.sol";
import "../contracts/EtherVaultSecure.sol";
import "../contracts/BatchTokenTransfer.sol";
import "../contracts/BatchTokenTransferSecure.sol";

contract FuzzAndInvariantTest is Test {
    EtherVault vault;
    EtherVaultSecure secureVault;
    BatchTokenTransfer token;
    BatchTokenTransferSecure secureToken;

    address user = address(0x42);

    function setUp() public {
        vault = new EtherVault();
        secureVault = new EtherVaultSecure();
        token = new BatchTokenTransfer(1_000_000);
        secureToken = new BatchTokenTransferSecure(1_000_000);
    }

    /// @notice Fuzz test: EtherVault depozit va withdraw balansi tekshiruvi
    function testFuzz_VaultDepositWithdraw(uint96 depositAmount) public {
        vm.assume(depositAmount > 0);
        vm.deal(user, depositAmount);

        vm.prank(user);
        secureVault.deposit{value: depositAmount}();
        assertEq(secureVault.balances(user), depositAmount);

        vm.prank(user);
        secureVault.withdraw();
        assertEq(secureVault.balances(user), 0);
        assertEq(address(secureVault).balance, 0);
    }

    /// @notice Fuzz test: BatchTokenTransferSecure har qanday toshishga chidamli
    function testFuzz_BatchTransferChecked(uint256 value, uint8 receiverCount) public {
        vm.assume(receiverCount > 0 && receiverCount <= 20);
        vm.assume(value > 0);

        address[] memory receivers = new address[](receiverCount);
        for (uint256 i = 0; i < receiverCount; i++) {
            receivers[i] = address(uint160(i + 100));
        }

        // Agar value juda katta bo'lib, value * receiverCount toshsa yoki 1_000_000 dan katta bo'lsa revert qilishi shart
        uint256 totalAmount;
        bool willOverflow = false;
        unchecked {
            totalAmount = uint256(receiverCount) * value;
            if (value != 0 && totalAmount / value != uint256(receiverCount)) {
                willOverflow = true;
            }
        }

        if (willOverflow || totalAmount > 1_000_000) {
            vm.expectRevert();
            secureToken.batchTransfer(receivers, value);
        } else {
            bool success = secureToken.batchTransfer(receivers, value);
            assertTrue(success);
        }
    }
}
