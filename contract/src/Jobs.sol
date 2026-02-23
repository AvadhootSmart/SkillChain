// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

contract JobsContract {
    uint256 private jobID_counter;

    struct Job{
        uint256 jobID; //contract managed job id
        string jobCID; //title, description, duration, budget, category
        string deliverableCID;
        bool completed; //status
        address client; // client address
        address freelancer; // freelancer address
        uint256 amount; //amount budget for job
        bool clientApproved; //client approval status
        bool freelancerApproved; //freelancer approval status

    }


    mapping (uint256 jobID => Job) private _jobs;
    mapping(address clientAddress => uint256[]) private _clientJobIDs;

    event JobCreated(address indexed clientAddress, uint256 jobID, string jobCID, uint256 amount);
    event FreelancerHired(address indexed freelancerAddress, uint256 jobID);
    event JobCompleted(address indexed freelancerAddress, uint256 jobID);
    event FLJobCompleted(address indexed freelancerAddress, uint256 jobID, string deliverableCID);
    event ClientJobCompleted(address indexed clientAddress, uint256 jobID);

    function CreateJob(string calldata jobCID) external payable {
        require(msg.value > 0, "Funds required to create job");
        jobID_counter++;
        uint256 jobID = jobID_counter;

        Job memory job = Job({
            jobID: jobID,
            jobCID: jobCID,
            deliverableCID: "",
            completed: false,
            clientApproved: false,
            freelancerApproved: false,
            client: msg.sender,
            freelancer: address(0),
            amount: msg.value
        });

        _jobs[jobID] = job;
        _clientJobIDs[msg.sender].push(jobID);
        
        emit JobCreated(msg.sender, jobID, jobCID, msg.value);
    }

    address public proposalsContractAddress;

    function setProposalsContractAddress(address _address) external {
        proposalsContractAddress = _address;
    }

    //hires freelancer and adds it to job.freelancer
    function HireFreelancer(address freelancerAddress, uint256 jobID) external {
        Job storage job = _jobs[jobID];
        require(job.client == msg.sender || msg.sender == proposalsContractAddress, "Only client or Proposals contract can hire freelancer");
        require(!job.completed, "Job already completed");

        job.freelancer = freelancerAddress;

        emit FreelancerHired(freelancerAddress, jobID);
    }

    function _releaseFunds(uint256 jobID) private {
        Job storage job = _jobs[jobID];
        if(job.freelancerApproved && job.clientApproved && !job.completed){
            job.completed = true;
            uint256 payment = job.amount;
            job.amount = 0;

            (bool sent, ) = job.freelancer.call{value:payment}("");
            require(sent, "Failed to transfer funds to freelancer");

            emit JobCompleted(msg.sender, jobID);
        }
    }

    //freelancer marks job as completed
    function MarkFLJobCompleted(uint256 jobID, string calldata deliverableCID) external {
        Job storage job = _jobs[jobID];
        require(job.freelancer == msg.sender, "Only freelancer can mark job completed");
        require(!job.completed, "Job already completed");
        
        job.freelancerApproved = true;
        job.deliverableCID = deliverableCID;

        emit FLJobCompleted(msg.sender, jobID, deliverableCID);
        
        // Try to release funds if client has already approved
        if (job.clientApproved) {
            _releaseFunds(jobID);
        }
    }


    //client marks job as completed
    function MarkClientJobCompleted(uint256 jobID) external {
        Job storage job = _jobs[jobID];
        require(!job.completed, "Job already completed");
        require(msg.sender == job.client, "Only client can mark job completed");
        
        job.clientApproved = true;

        emit ClientJobCompleted(msg.sender, jobID);
        
        // Try to release funds if freelancer has already approved
        if (job.freelancerApproved) {
            _releaseFunds(jobID);
        }
    }


    //VIEWS------
    function getJobByJobID(uint256  jobID) external view  returns (Job memory job){
        return _jobs[jobID];
    }

    
    function getJobsByClientAddress(address clientAddress) external view returns (Job[] memory){
        uint256[] memory ids = _clientJobIDs[clientAddress];
        Job[] memory jobs = new Job[](ids.length);
        for(uint256 i = 0; i < ids.length; i++){
            jobs[i] = _jobs[ids[i]];
        }
        return jobs;
    }

    function getJobOwner(uint256 jobID) external view returns (address client){
        return _jobs[jobID].client;
    }
}

