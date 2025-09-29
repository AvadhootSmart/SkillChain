// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

contract JobsContract {
    uint256 private jobID_counter;

    struct Job{
        uint256 jobID; //contract managed job id
        string jobCID; //title, description, duration, budget, category
        bool completed; //status
        address client; // client address
        address freelancer; // freelancer address
        uint256 amount; //amount budget for job
        bool clientApproved; //client approval status
        bool freelancerApproved; //freelancer approval status
    }


    mapping (uint256 jobID => Job) private _jobs;
    mapping(address clientAddress => Job[]) private _clientJobs;
    mapping(uint256 jobID => address) private _jobOwner;

    event JobCreated(address indexed clientAddress, uint256 jobID, string jobCID, uint256 amount);
    event FreelancerHired(address indexed freelancerAddress, uint256 jobID);
    event JobCompleted(address indexed freelancerAddress, uint256 jobID);

    function CreateJob(string calldata jobCID) external payable {
        require(msg.value > 0, "Funds required to create job");
        jobID_counter++;
        uint256 jobID = jobID_counter;

        Job memory job = Job({
            jobID: jobID,
            jobCID: jobCID,
            completed: false,
            clientApproved: false,
            freelancerApproved: false,
            client: msg.sender,
            freelancer: address(0),
            amount: msg.value
        });

        _jobs[jobID] = job;
        _clientJobs[msg.sender].push(job);
        _jobOwner[jobID] = msg.sender;

        emit JobCreated(msg.sender, jobID, jobCID, msg.value);
    }

    function HireFreelancer(address freelancerAddress, uint256 jobID) external {
        Job storage job = _jobs[jobID];
        require(job.client == msg.sender, "Only client can hire freelancer");
        require(!job.completed, "Job already completed");

        job.freelancer = freelancerAddress;

        emit FreelancerHired(freelancerAddress, jobID);
    }

    function MarkJobCompleted(uint256 jobID) external {
        Job storage job = _jobs[jobID];
        require(!job.completed, "Job already completed"); 
        require(msg.sender == job.client || msg.sender == job.freelancer, "Only client or freelancer can mark job completed");

        if(msg.sender == job.client){
            job.clientApproved = true;
        }else if (msg.sender == job.freelancer){
            job.freelancerApproved = true;
        }

        if(job.freelancerApproved && job.clientApproved){
            job.completed = true;
            uint256 payment = job.amount;
            job.amount = 0;

            (bool sent, ) = job.freelancer.call{value:payment}("");
            require(sent, "Failed to transfer funds to freelancer");

            emit JobCompleted(msg.sender, jobID);
        }
    }


    //VIEWS------
    function getJobByJobID(uint256  jobID) external view  returns (Job memory job){
        return _jobs[jobID];
    }

    
    function getJobsByClientAddress(address clientAddress) external view returns (Job[] memory jobs){
        return _clientJobs[clientAddress];
    }

    function getJobOwner(uint256 jobID) external view returns (address client){
        return _jobOwner[jobID];
    }
}

