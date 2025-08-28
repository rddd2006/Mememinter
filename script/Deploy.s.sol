// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {MemeCoinFactory} from "../src/MemeCoinFactory.sol";

contract Deploy is Script {
    function run() external returns (MemeCoinFactory) {
        vm.startBroadcast();
        MemeCoinFactory factory = new MemeCoinFactory();
        vm.stopBroadcast();
        return factory;
    }
}