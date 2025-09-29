// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Profile.sol";

contract DeployScript is Script {
    function run() external {
        vm.startBroadcast();
        new UserProfile();
        vm.stopBroadcast();
    }
}
