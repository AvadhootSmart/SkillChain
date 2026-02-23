// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Profile.sol";
import "../src/Jobs.sol";
import "../src/Proposals.sol";

contract DeployScript is Script {
    function run() external {
        vm.startBroadcast();
        new UserProfile();
        JobsContract jobs = new JobsContract();
        ProposalsContract proposals = new ProposalsContract();

        // Link the contracts
        jobs.setProposalsContractAddress(address(proposals));
        proposals.setJobsContractAddress(address(jobs));
        vm.stopBroadcast();
    }
}
