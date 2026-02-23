// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

interface IJobsContract {
    function getJobOwner(uint256 jobID) external view returns (address);
    function HireFreelancer(address freelancerAddress, uint256 jobID) external;
}

contract ProposalsContract {
    uint256 private proposalID_counter;
    address public jobsContractAddress;

    struct Proposal{
        uint256 proposalID; //contract managed proposal id
        string proposalCID; //title, description, duration, budget, category
        uint256 jobID; //reference job id
        bool approved; //status
        address freelancer; // freelancer address
    }

    mapping (address freelancerAddress => uint256[]) private _freelancerProposalIDs;
    mapping (uint256 jobID => uint256[]) private _jobProposalIDs;
    mapping(uint256 proposalID => Proposal) private _proposals;
    
    event ProposalCreated(address indexed freelancerAddress, uint256 proposalID, string proposalCID, uint256 jobID);
    event ProposalApproved(address indexed freelancerAddress, uint256 proposalID);

    function setJobsContractAddress(address _address) external {
        jobsContractAddress = _address;
    }

    function CreateProposal(string calldata proposalCID, uint256 jobID) external {
        proposalID_counter++;
        uint256 proposalID = proposalID_counter;

        Proposal memory proposal = Proposal({
            proposalID: proposalID,
            proposalCID: proposalCID,
            jobID: jobID,
            approved: false,
            freelancer: msg.sender
        });

        _freelancerProposalIDs[msg.sender].push(proposalID);
        _jobProposalIDs[jobID].push(proposalID);
        _proposals[proposalID] = proposal;


        emit ProposalCreated(msg.sender, proposalID, proposalCID, jobID);
    }

    function ApproveProposal(uint256 proposalID) external {
        Proposal storage p = _proposals[proposalID];
        require(!p.approved, "Proposal already approved");
        
        // Verify job ownership
        address jobOwner = IJobsContract(jobsContractAddress).getJobOwner(p.jobID);
        require(msg.sender == jobOwner, "Only job owner can approve proposal");

        p.approved = true;
        
        // Auto-hire freelancer
        IJobsContract(jobsContractAddress).HireFreelancer(p.freelancer, p.jobID);
        
        emit ProposalApproved(msg.sender, proposalID);
    }

    //VIEWS------
    function getFreelancersProposals(address freelancerAddress) view external returns(Proposal[] memory){
        uint256[] memory ids = _freelancerProposalIDs[freelancerAddress];
        Proposal[] memory proposals = new Proposal[](ids.length);
        for(uint256 i = 0; i < ids.length; i++){
            proposals[i] = _proposals[ids[i]];
        }
        return proposals;
    }

    function getProposalsByJobID(uint256 jobID) view external returns(Proposal[] memory){
        uint256[] memory ids = _jobProposalIDs[jobID];
        Proposal[] memory proposals = new Proposal[](ids.length);
        for(uint256 i = 0; i < ids.length; i++){
            proposals[i] = _proposals[ids[i]];
        }
        return proposals;
    }

    function getProposalByProposalID(uint256 proposalID) view external returns (Proposal memory proposal){
        return _proposals[proposalID];
    }
}

