// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IUniswapV2Pair {
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
}

/**
 * @title LendingPoolOracle (ZAIF VERSIYA)
 * @notice Garov evaziga stabilkoin (USDC) qarz beruvchi protokol
 * @dev ZAIFLIK: SWC-114 & CWE-682. Spot narx orakuli flesh-kredit bilan manipulyatsiya qilinadi.
 */
contract LendingPoolOracle {
    IUniswapV2Pair public ammPair;
    mapping(address => uint256) public collateralETH;
    mapping(address => uint256) public borrowedUSDC;

    constructor(address _pair) {
        ammPair = IUniswapV2Pair(_pair);
    }

    function getETHPriceInUSDC() public view returns (uint256) {
        (uint112 reserve0, uint112 reserve1, ) = ammPair.getReserves();
        return (uint256(reserve0) * 1e18) / uint256(reserve1);
    }

    function depositCollateral() external payable {
        collateralETH[msg.sender] += msg.value;
    }

    function borrowMaxUSDC() external returns (uint256) {
        uint256 ethBal = collateralETH[msg.sender];
        require(ethBal > 0, "Garov yo'q");

        uint256 price = getETHPriceInUSDC();
        uint256 maxBorrow = (ethBal * price * 80) / (100 * 1e18);

        borrowedUSDC[msg.sender] += maxBorrow;
        return maxBorrow;
    }
}
