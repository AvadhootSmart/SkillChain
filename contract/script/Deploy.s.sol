// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
// import "../src/Profile.sol";
import "../src/Jobs.sol";

contract DeployScript is Script {
    function run() external {
        vm.startBroadcast();
        // new UserProfile();
        new JobsContract();
        vm.stopBroadcast();
    }
}
