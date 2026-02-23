// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {ProposalsContract} from "../src/Proposals.sol";
import {JobsContract} from "../src/Jobs.sol";

contract ProposalsTest is Test{
    ProposalsContract proposal;
    JobsContract jobs;
    address john = address(0x123); // freelancer
    address jane = address(0x456); // client

    function setUp() public {
        jobs = new JobsContract();
        proposal = new ProposalsContract();
        
        jobs.setProposalsContractAddress(address(proposal));
        proposal.setJobsContractAddress(address(jobs));
        
        vm.deal(jane, 10 ether);
    }

    function testCreateProposal() public {
        vm.startPrank(john);
        proposal.CreateProposal("bafy....foldCid", 1);
        vm.stopPrank();

        assertEq(proposal.getProposalsByJobID(1)[0].proposalCID, "bafy....foldCid");
    }

    function testApproveProposal() public {
        // 1. Create Job as Jane
        vm.startPrank(jane);
        jobs.CreateJob{value: 1 ether}("jobCid");
        vm.stopPrank();

        // 2. Create Proposal as John
        vm.startPrank(john);
        proposal.CreateProposal("bafy....foldCid", 1);
        vm.stopPrank();
        
        // 3. Approve Proposal as Jane (Job Owner)
        vm.startPrank(jane);
        proposal.ApproveProposal(1);
        vm.stopPrank();

        assertEq(proposal.getProposalByProposalID(1).approved, true);
        assertEq(jobs.getJobByJobID(1).freelancer, john);
    }

    function testGetProposalByJobID() public {
        vm.startPrank(john);
        proposal.CreateProposal("bafy....foldCid", 1);
        vm.stopPrank();

        assertEq(proposal.getProposalsByJobID(1)[0].proposalCID, "bafy....foldCid");
    }

    function testGetFreelancersProposals() public {
        vm.startPrank(john);
        proposal.CreateProposal("bafy....foldCid", 1);
        vm.stopPrank();

        ProposalsContract.Proposal[] memory proposals = proposal.getFreelancersProposals(john);
        assertEq(proposals[0].proposalID, 1);
        assertEq(proposals[0].proposalCID, "bafy....foldCid");
        assertEq(proposals[0].jobID, 1);
        assertEq(proposals[0].approved,false);
        assertEq(proposals[0].freelancer,john);
    }

}
