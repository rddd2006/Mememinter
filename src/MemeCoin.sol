// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MemeCoin is ERC20, Ownable {
    constructor(string memory name, string memory symbol) 
        ERC20(name, symbol) 
        Ownable(msg.sender) // Initially owned by the factory
    {
        // Mint a fixed total supply of 1 billion tokens
        _mint(msg.sender, 1_000_000_000 * (10**decimals()));
    }
}