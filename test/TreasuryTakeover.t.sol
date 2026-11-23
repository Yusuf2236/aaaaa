// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/MultiSigTreasury.sol";
import "../contracts/MultiSigTreasurySecure.sol";

contract TreasuryTakeoverTest is Test {
    MultiSigTreasury treasury;
    address legitOwner = address(0x1111);
    address attacker = address(0xBEEF);

    function setUp() public {
        vm.prank(legitOwner);
        treasury = new MultiSigTreasury();
        treasury.initWallet(legitOwner);

        // Kompaniya 50 ETH xazinaga soladi
        vm.deal(address(treasury), 50 ether);
    }

    function testUnauthorizedTakeoverAndDrain() public {
        assertEq(treasury.owner(), legitOwner);

        // Hujumchi o'zini owner qilib e'lon qiladi
        vm.prank(attacker);
        treasury.initWallet(attacker);

        assertEq(treasury.owner(), attacker, "Haker egalikni ololmadi!");

        // Haker barcha xazinani o'g'irlaydi
        vm.prank(attacker);
        treasury.emergencyDrain();

        assertEq(address(treasury).balance, 0, "Xazina bo'shamadi!");
        assertEq(attacker.balance, 50 ether, "Haker 50 ETH ololmadi!");
    }

    function testSecureContractBlocksUnauthorizedInit() public {
        MultiSigTreasurySecure secureTreasury = new MultiSigTreasurySecure(legitOwner);
        assertEq(secureTreasury.owner(), legitOwner);

        vm.deal(address(secureTreasury), 50 ether);

        // Hujumchi ruxsatsiz xazinani bo'shatishga urinadi va revert oladi
        vm.prank(attacker);
        vm.expectRevert("Ownable: caller is not the owner");
        secureTreasury.transferTreasury(payable(attacker), 50 ether);

        assertEq(address(secureTreasury).balance, 50 ether);
        assertEq(attacker.balance, 0);
    }
}
