# SimpleVoting Smart Contract

This repository contains the `SimpleVoting` smart contract written in Solidity. The contract allows users to create proposals and vote on them. Additionally, it includes functionality for voting through another contract address.

## Features

- **Proposal Creation:** The contract owner can create new proposals.
- **Direct Voting:** Users can vote directly for a proposal.
- **Contract Voting:** Users can delegate their vote to another contract, which can vote on their behalf.
- **Event Logging:** Events are emitted for proposal creation, direct voting, and voting via a contract.
- **Emergency Revert:** The contract owner can revert voting in case of an emergency.

## Contract Details

### State Variables

- `address public owner`: The address of the contract owner.
- `uint256 public proposalCount`: The total number of proposals created.
- `mapping(uint256 => Proposal) public proposals`: A mapping of proposal IDs to their corresponding proposals.
- `mapping(address => bool) public hasVoted`: A mapping to track whether an address has already voted.

### Structs

- `struct Proposal`: Represents a proposal with the following fields:
  - `uint256 id`: The ID of the proposal.
  - `string name`: The name of the proposal.
  - `uint256 voteCount`: The number of votes the proposal has received.

### Events

- `event ProposalAdded(uint256 id, string name)`: Emitted when a new proposal is added.
- `event Voted(address indexed voter, uint256 proposalId)`: Emitted when a user votes directly for a proposal.
- `event VotedByContract(address indexed voter, address contractAddress, uint256 proposalId)`: Emitted when a user votes via another contract.

### Modifiers

- `modifier onlyOwner()`: Restricts function execution to the contract owner.

### Functions

- `constructor()`: Sets the contract deployer as the owner.
  
- `function addProposal(string memory name) external onlyOwner`: Allows the contract owner to add a new proposal. It increments the `proposalCount` and stores the proposal in the `proposals` mapping.

- `function vote(uint256 proposalId) external`: Allows a user to vote for a proposal. The function checks if the proposal ID is valid and whether the user has already voted.

- `function voteWithContract(uint256 proposalId, address votingContract) external`: Allows a user to vote for a proposal via another contract. The function checks if the user has already voted and if the external contract permits the user to vote on their behalf.

- `function assertValidProposal(uint256 proposalId) external view`: Asserts that a given proposal ID is valid.

- `function revertVoting(uint256 proposalId) external onlyOwner`: Allows the contract owner to revert voting for a specific proposal by setting its vote count to zero. This function is intended for emergency use.

## Usage

### Deployment

1. Deploy the contract using Remix, Truffle, Hardhat, or any other Ethereum development framework.
2. The deploying address will be set as the contract owner.

### Interacting with the Contract

#### Adding a Proposal

Only the contract owner can add new proposals.

addProposal(string memory name)

```js
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
