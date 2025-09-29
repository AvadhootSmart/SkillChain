// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {JobsContract} from "../src/Jobs.sol";

contract JobsTest is Test{
    JobsContract jobs;
    address john = address(0); //client
    address jane = address(1); //freelancer

    function setUp() public {
        jobs = new JobsContract();
        vm.deal(john, 10 ether);
    }

    function testCreateJob() public {
        vm.startPrank(john);

        jobs.CreateJob{value: 1 ether}("bafy....foldCid");

        assertEq(jobs.getJobByJobID(1).jobCID, "bafy....foldCid");
        assertEq(jobs.getJobByJobID(1).client, john);
        assertEq(jobs.getJobOwner(1), john);
    }

    function testHireFreelancer() public {
        vm.startPrank(john);
        jobs.HireFreelancer(jane, 1);

        assertEq(jobs.getJobByJobID(1).freelancer, jane);
    }

    function testMarkAsCompleted() public {
        vm.startPrank(john);
        jobs.CreateJob{value: 5 ether}("bafy....foldCid");
        jobs.HireFreelancer(jane, 1);
        jobs.MarkJobCompleted(1);
        vm.stopPrank();

        vm.startPrank(jane);
        jobs.MarkJobCompleted(1);
        vm.stopPrank();

        assertEq(jobs.getJobByJobID(1).clientApproved, true);
        assertEq(jobs.getJobByJobID(1).freelancerApproved, true);
        assertEq(jobs.getJobByJobID(1).completed, true);
        assertEq(jobs.getJobByJobID(1).amount, 0);
        assertEq(jane.balance, 5 ether);
    }
}
