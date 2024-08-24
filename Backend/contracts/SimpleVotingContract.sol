// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleVoting {
    address public owner;
    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;
    mapping(address => bool) public hasVoted;

    struct Proposal {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    event ProposalAdded(uint256 id, string name);
    event Voted(address indexed voter, uint256 proposalId);
    event VotedByContract(address indexed voter, address contractAddress, uint256 proposalId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Function to add a new proposal
    function addProposal(string memory name) external onlyOwner {
        require(bytes(name).length > 0, "Proposal name cannot be empty");

        proposalCount++;
        proposals[proposalCount] = Proposal(proposalCount, name, 0);

        emit ProposalAdded(proposalCount, name);
    }

    // Function to vote for a proposal
    function vote(uint256 proposalId) external {
        require(proposalId > 0 && proposalId <= proposalCount, "Invalid proposal ID");
        require(!hasVoted[msg.sender], "You have already voted");

        Proposal storage proposal = proposals[proposalId];
        proposal.voteCount++;
        hasVoted[msg.sender] = true;

        emit Voted(msg.sender, proposalId);
    }

    // Function to vote for a proposal via another contract
    function voteWithContract(uint256 proposalId, address votingContract) external {
        require(proposalId > 0 && proposalId <= proposalCount, "Invalid proposal ID");
        require(!hasVoted[msg.sender], "You have already voted");
        require(votingContract != address(0), "Invalid contract address");

        // Check if the contract can vote
        (bool success, bytes memory data) = votingContract.call(
            abi.encodeWithSignature("canVote(address)", msg.sender)
        );

        require(success && abi.decode(data, (bool)), "Voting not allowed by the contract");

        Proposal storage proposal = proposals[proposalId];
        proposal.voteCount++;
        hasVoted[msg.sender] = true;

        emit VotedByContract(msg.sender, votingContract, proposalId);
    }

    // Function to assert the integrity of the voting process
    function assertValidProposal(uint256 proposalId) external view {
        assert(proposalId > 0 && proposalId <= proposalCount);
    }

    // Function to revert voting in case of an emergency
    function revertVoting(uint256 proposalId) external onlyOwner {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id > 0, "Proposal does not exist");

        proposal.voteCount = 0;
        revert("Voting has been reverted");
    }
}
