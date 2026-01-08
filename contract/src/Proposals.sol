// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

contract ProposalsContract {
    uint256 private proposalID_counter;

    struct Proposal{
        uint256 proposalID; //contract managed proposal id
        string proposalCID; //title, description, duration, budget, category
        uint256 jobID; //reference job id
        bool approved; //status
        address freelancer; // freelancer address
    }


    mapping (address freelancerAddress => Proposal[]) private _freelancerProposals;//all proposals by freelancer(address)
    mapping (uint256 jobID => Proposal[]) private _jobProposals; //all proposals by jobID
    mapping(uint256 proposalID => Proposal) private _proposals;
    
    event ProposalCreated(address indexed freelancerAddress, uint256 proposalID, string proposalCID, uint256 jobID);
    event ProposalApproved(address indexed freelancerAddress, uint256 proposalID);

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

        _freelancerProposals[msg.sender].push(proposal);
        _jobProposals[jobID].push(proposal);
        _proposals[proposalID] = proposal;


        emit ProposalCreated(msg.sender, proposalID, proposalCID, jobID);
    }

    function ApproveProposal(uint256 proposalID) external {
        Proposal storage p = _proposals[proposalID];
        require(!p.approved, "Proposal already approved");

        p.approved = true;
        emit ProposalApproved(msg.sender, proposalID);
    }

    //VIEWS------
    function getFreelancersProposals(address freelancerAddress) view external returns(Proposal[] memory proposals){
        return _freelancerProposals[freelancerAddress];
    }

    function getProposalsByJobID(uint256 jobID) view external returns(Proposal[] memory proposals){
        return _jobProposals[jobID];
    }

    function getProposalByProposalID(uint256 proposalID) view external returns (Proposal memory proposal){
        return _proposals[proposalID];
    }
}

