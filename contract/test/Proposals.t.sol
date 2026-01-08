// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {ProposalsContract} from "../src/Proposals.sol";

contract ProposalsTest is Test{
    ProposalsContract proposal;
    address john = address(0);

    function setUp() public {
        proposal = new ProposalsContract();
    }

    function testCreateProposal() public {
        vm.startPrank(john);
        proposal.CreateProposal("bafy....foldCid", 1);
        vm.stopPrank();

        assertEq(proposal.getProposalsByJobID(1)[0].proposalCID, "bafy....foldCid");
    }

    function testApproveProposal() public {
        vm.startPrank(john);
        proposal.CreateProposal("bafy....foldCid", 1);
        proposal.ApproveProposal(1);
        vm.stopPrank();

        assertEq(proposal.getProposalByProposalID(1).approved, true);
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
