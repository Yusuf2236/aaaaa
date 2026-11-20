// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface AggregatorV3Interface {
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 price,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
}

/**
 * @title LendingPoolSecure (TUZATILGAN XAVFSIZ VERSIYA)
 * @notice Decentralized Chainlink Data Feeds + Staleness & Zero-price guards
 */
contract LendingPoolSecure {
    AggregatorV3Interface internal immutable priceFeed;
    uint256 public constant MAX_STALENESS_SECONDS = 3600; // 1 soat

    mapping(address => uint256) public collateralETH;
    mapping(address => uint256) public borrowedUSDC;

    constructor(address _chainlinkFeed) {
        require(_chainlinkFeed != address(0), "Feed 0 bo'lmasin");
        priceFeed = AggregatorV3Interface(_chainlinkFeed);
    }

    function getETHPriceInUSDC() public view returns (uint256) {
        (
            uint80 roundId,
            int256 price,
            ,
            uint256 updatedAt,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();

        require(price > 0, "Yaroqsiz narx signali");
        require(updatedAt > 0 && block.timestamp - updatedAt <= MAX_STALENESS_SECONDS, "Eskirgan narx");
        require(answeredInRound >= roundId, "Tugallanmagan round");

        return uint256(price);
    }

    function depositCollateral() external payable {
        collateralETH[msg.sender] += msg.value;
    }

    function borrowMaxUSDC() external returns (uint256) {
        uint256 ethBal = collateralETH[msg.sender];
        require(ethBal > 0, "Garov yo'q");

        uint256 price = getETHPriceInUSDC();
        uint256 maxBorrow = (ethBal * price * 80) / (100 * 1e8);

        borrowedUSDC[msg.sender] += maxBorrow;
        return maxBorrow;
    }
}
