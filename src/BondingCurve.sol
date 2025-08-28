// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Interface for the Uniswap V2 Router
interface IUniswapV2Router {
    function addLiquidityETH(
        address token,
        uint256 amountTokenDesired,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    ) external payable returns (uint256 amountToken, uint256 amountETH, uint256 liquidity);
}

contract BondingCurve is Ownable {
    IERC20 public immutable token;
    string public tokenURI;
    IUniswapV2Router public immutable uniswapRouter;

    // --- Bonding Curve State ---
    uint256 public constant TOTAL_SUPPLY_ON_CURVE = 500_000_000 * 1e18; // 50% of 1B
    uint256 public constant LIQUIDITY_SUPPLY = 400_000_000 * 1e18; // 40% of 1B for LP
    uint256 public constant PRICE_SLOPE = 1e6; // Determines how fast price increases
    uint256 public constant VESTING_TARGET_ETH = 5 ether; // Target to launch on Uniswap

    bool public isLaunchedOnUniswap = false;
    uint256 public tokenSoldOnCurve; // How many tokens have been bought by users

    event TokensBought(address indexed buyer, uint256 ethSpent, uint256 tokensReceived);
    event UniswapLaunch(address indexed lpTokenAddress, uint256 ethAmount, uint256 tokenAmount);

    constructor(address _tokenAddress, string memory _tokenURI, address _routerAddress) Ownable(msg.sender) {
        token = IERC20(_tokenAddress);
        tokenURI = _tokenURI;
        uniswapRouter = IUniswapV2Router(_routerAddress);
    }

    /**
     * @notice Calculate the ETH cost to buy a certain number of tokens.
     * Integral of the price function: P(x) = slope * x
     * Cost(n) = Integral from current_supply to current_supply + n of P(x) dx
     */
    function getCostForTokens(uint256 numTokens) public view returns (uint256) {
        uint256 n = tokenSoldOnCurve;
        // Using fixed-point math with a scaling factor
        // (slope * (n + numTokens)^2 / 2) - (slope * n^2 / 2)
        uint256 term1 = PRICE_SLOPE * (n + numTokens) * (n + numTokens) / (2 * 1e18);
        uint256 term2 = PRICE_SLOPE * n * n / (2 * 1e18);
        return term1 - term2;
    }

    /**
     * @notice Calculate how many tokens can be bought with a given amount of ETH.
     * This is the inverse of the cost function, solving for numTokens.
     */
    function getTokensForEth(uint256 ethAmount) public view returns (uint256) {
        uint256 n = tokenSoldOnCurve;
        // Simplified inverse calculation
        // numTokens = sqrt( (2 * ethAmount / slope) + n^2 ) - n
        // This is complex in Solidity without a library, so we'll approximate or use it off-chain.
        // For on-chain buy, we'll take the user's desired ETH amount.
        // The UI will show an estimate. Let's calculate price at current supply for a swap-like feel.
        uint256 currentPrice = PRICE_SLOPE * n; // Price for the *next* token
        if (currentPrice == 0) return 1_000_000 * 1e18; // Initial chunk for first buyer
        return (ethAmount * 1e18) / currentPrice;
    }

    function buy() public payable {
        require(!isLaunchedOnUniswap, "Trading is live on Uniswap");
        require(msg.value > 0, "Must send ETH");
        
        // This is a simplification for the example. A real implementation would solve the integral.
        uint256 numTokensToBuy = getTokensForEth(msg.value);
        
        require(tokenSoldOnCurve + numTokensToBuy <= TOTAL_SUPPLY_ON_CURVE, "Curve sold out");

        tokenSoldOnCurve += numTokensToBuy;
        
        token.transfer(msg.sender, numTokensToBuy);
        emit TokensBought(msg.sender, msg.value, numTokensToBuy);

        // Check if the vesting target is reached
        if (address(this).balance >= VESTING_TARGET_ETH) {
            launchOnUniswap();
        }
    }

    function launchOnUniswap() private {
        require(!isLaunchedOnUniswap, "Already launched");
        isLaunchedOnUniswap = true;

        uint256 ethForLiquidity = address(this).balance; // Use all ETH in the contract
        uint256 tokensForLiquidity = LIQUIDITY_SUPPLY;
        
        // Approve the Uniswap Router to spend our tokens
        token.approve(address(uniswapRouter), tokensForLiquidity);

        // Add liquidity to Uniswap
        uniswapRouter.addLiquidityETH{value: ethForLiquidity}(
            address(token),
            tokensForLiquidity,
            0, // We don't care about slippage for the initial launch
            0,
            owner(), // The creator gets the LP tokens
            block.timestamp
        );
        
        emit UniswapLaunch(address(token), ethForLiquidity, tokensForLiquidity);
    }
}