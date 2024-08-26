// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleVoting {
    
    struct Proposal {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    Proposal[] public proposals;
    uint256 public proposalCount;

    function addProposal(string memory _name) public {
        proposals.push(Proposal({
            id: proposalCount + 1,
            name: _name,
            voteCount: 0
        }));
        proposalCount++;
    }

    function vote(uint256 _proposalId) public {
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal ID");
        Proposal storage proposal = proposals[_proposalId - 1];
        proposal.voteCount++;
    }

    function voteWithContract(uint256 _proposalId, address _votingContract) public {
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal ID");
        // Implement logic to interact with the voting contract
    }

    function deleteVote(uint256 _proposalId) public {
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal ID");
        Proposal storage proposal = proposals[_proposalId - 1];
        require(proposal.voteCount > 0, "No votes to delete");
        proposal.voteCount--;
    }

    function addMoreVotes(uint256 _proposalId, uint256 _amount) public {
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal ID");
        Proposal storage proposal = proposals[_proposalId - 1];
        proposal.voteCount += _amount;
    }

    function getTotalVotes() public view returns (uint256 totalVotes) {
        for (uint i = 0; i < proposals.length; i++) {
            totalVotes += proposals[i].voteCount;
        }
    }

    function removeVote(uint256 _proposalId) public {
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal ID");
        Proposal storage proposal = proposals[_proposalId - 1];
        require(proposal.voteCount > 0, "No votes to remove");
        proposal.voteCount--;
    }
}
