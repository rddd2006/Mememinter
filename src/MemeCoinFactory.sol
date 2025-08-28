// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {BondingCurve} from "./BondingCurve.sol";
import {MemeCoin} from "./MemeCoin.sol";

contract MemeCoinFactory {
    // Sepolia Uniswap V2 Router address
    address public constant UNISWAP_V2_ROUTER = 0xC532a74256D3dB42d0bf7a0400F43286f909EC45;
    
    // Array to store addresses of all created bonding curves
    address[] public allCoins;

    // Event emitted when a new coin is created
    event CoinCreated(
        string name,
        string symbol,
        address tokenAddress,
        address bondingCurveAddress,
        address creator
    );

    /**
     * @notice Creates a new meme coin and its associated bonding curve.
     * @param name The name of the new token.
     * @param symbol The symbol of the new token.
     * @param tokenURI A URI for the token's metadata (e.g., an image).
     */
    function createCoin(string memory name, string memory symbol, string memory tokenURI) public {
        // 1. Deploy the ERC-20 token contract
        MemeCoin newMemeCoin = new MemeCoin(name, symbol);
        
        // 2. Deploy the BondingCurve contract for the new token
        // The factory is the initial owner to set things up.
        BondingCurve newBondingCurve = new BondingCurve(
            address(newMemeCoin),
            tokenURI,
            UNISWAP_V2_ROUTER
        );

        // 3. Transfer the total supply of the new token to the bonding curve contract
        newMemeCoin.transfer(address(newBondingCurve), newMemeCoin.totalSupply());

        // 4. Transfer ownership of the token contract to the bonding curve
        newMemeCoin.transferOwnership(address(newBondingCurve));
        
        // 5. Store the new bonding curve address
        allCoins.push(address(newBondingCurve));

        // 6. Emit an event
        emit CoinCreated(name, symbol, address(newMemeCoin), address(newBondingCurve), msg.sender);
    }

    function getAllCoins() public view returns (address[] memory) {
        return allCoins;
    }

    function getCoinCount() public view returns (uint256) {
        return allCoins.length;
    }
}