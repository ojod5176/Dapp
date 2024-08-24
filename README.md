# Simple Voting DApp

This project is a simple decentralized application (DApp) built with React and Web3.js. It interacts with an Ethereum smart contract to allow users to add proposals, vote on them, and even vote through another contract.

## Project Structure

- **React**: Frontend framework used to build the user interface.
- **Web3.js**: JavaScript library to interact with the Ethereum blockchain.
- **MetaMask**: Ethereum wallet required to interact with the DApp.

## Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js**: [Download Node.js](https://nodejs.org/)
- **MetaMask**: [Install MetaMask](https://metamask.io/)
- **Ethereum Smart Contract**: A deployed Ethereum smart contract with the necessary ABI.

## Setup

1. **Clone the repository**:

    ```bash
    git clone https://github.com/your-repo/simple-voting-dapp.git
    cd simple-voting-dapp
    ```

2. **Install dependencies**:

    ```bash
    npm install
    ```

3. **Configure the contract ABI and address**:

    - Replace the placeholder `contractABI` in the `App.js` file with your contract's ABI.
    - Replace `contractAddress` with your deployed contract's address.

    ```javascript
    const contractABI = [ /* Your contract ABI here */ ];
    const contractAddress = '0xYourContractAddressHere';
    ```

4. **Run the application**:

    ```bash
    npm start
    ```

5. **Access the DApp**:

    - Open your browser and go to `http://localhost:3000/`.
    - Ensure MetaMask is installed and connected to the correct potentially test Ethereum network.

## Usage

### Adding a Proposal

1. In the "Add Proposal" section, enter a proposal name in the input field.
2. Click the "Add Proposal" button to submit the proposal.
3. The proposal will be added to the list after the transaction is confirmed.

### Viewing Proposals

1. The "Proposals" section displays all current proposals.
2. Each proposal shows its ID, name, and the number of votes it has received.

### Voting Directly

1. In the "Vote" section, enter the ID of the proposal you want to vote for.
2. Click the "Vote Directly" button to cast your vote.
3. The vote count for the proposal will increase after the transaction is confirmed.

### Voting via Another Contract

1. In the "Vote with Contract" section, enter the ID of the proposal you want to vote for.
2. Enter the address of the contract you wish to vote through.
3. Click the "Vote via Contract" button to cast your vote.
4. The vote count for the proposal will increase after the transaction is confirmed.

## Code Overview

### `App.js`

- **State Variables**:
  - `web3`: Instance of Web3.
  - `account`: The currently connected Ethereum account.
  - `contract`: The smart contract instance.
  - `proposals`: An array of proposals fetched from the contract.
  - `proposalName`: Stores the name of the new proposal to be added.
  - `proposalId`: Stores the ID of the proposal to vote on.
  - `votingContract`: Stores the address of another contract to vote through.

- **Functions**:
  - `loadWeb3()`: Initializes Web3, connects to MetaMask, and loads contract data.
  - `handleAddProposal()`: Adds a new proposal to the contract.
  - `handleVote()`: Votes directly on a proposal.
  - `handleVoteWithContract()`: Votes on a proposal through another contract.

## Notes

- Ensure that your MetaMask is connected to the same Ethereum network where your contract is deployed.
- The DApp will not function without a valid contract ABI and address.

## License

This project is licensed under the MIT License.

```js
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';

// Replace with your contract's ABI and address
const contractABI = [ /* Your contract ABI here */ ];
const contractAddress = '0xYourContractAddressHere';

function SimpleVoting() {
    const [web3, setWeb3] = useState(null);
    const [account, setAccount] = useState('');
    const [contract, setContract] = useState(null);
    const [proposals, setProposals] = useState([]);
    const [proposalName, setProposalName] = useState('');
    const [proposalId, setProposalId] = useState('');
    const [votingContract, setVotingContract] = useState('');

    useEffect(() => {
        async function loadWeb3() {
            if (window.ethereum) {
                const web3Instance = new Web3(window.ethereum);
                setWeb3(web3Instance);
                await window.ethereum.enable();

                const accounts = await web3Instance.eth.getAccounts();
                setAccount(accounts[0]);

                const contractInstance = new web3Instance.eth.Contract(contractABI, contractAddress);
                setContract(contractInstance);

                const proposalCount = await contractInstance.methods.proposalCount().call();
                let proposalsArray = [];
                for (let i = 1; i <= proposalCount; i++) {
                    const proposal = await contractInstance.methods.proposals(i).call();
                    proposalsArray.push(proposal);
                }
                setProposals(proposalsArray);
            } else {
                alert('Please install MetaMask to use this dApp!');
            }
        }
        loadWeb3();
    }, []);

    const handleAddProposal = async () => {
        if (proposalName && contract) {
            await contract.methods.addProposal(proposalName).send({ from: account });
            window.location.reload();
        }
    };

    const handleVote = async () => {
        if (proposalId && contract) {
            await contract.methods.vote(proposalId).send({ from: account });
            window.location.reload();
        }
    };

    const handleVoteWithContract = async () => {
        if (proposalId && votingContract && contract) {
            await contract.methods.voteWithContract(proposalId, votingContract).send({ from: account });
            window.location.reload();
        }
    };

    return (
        <div>
            <h1>Simple Voting DApp</h1>
            <p>Connected Account: {account}</p>

            <h2>Add Proposal</h2>
            <input 
                type="text" 
                placeholder="Proposal Name" 
                value={proposalName} 
                onChange={(e) => setProposalName(e.target.value)} 
            />
            <button onClick={handleAddProposal}>Add Proposal</button>

            <h2>Proposals</h2>
            <ul>
                {proposals.map((proposal) => (
                    <li key={proposal.id}>
                        {proposal.id}. {proposal.name} - {proposal.voteCount} votes
                    </li>
                ))}
            </ul>

            <h2>Vote</h2>
            <input 
                type="number" 
                placeholder="Proposal ID" 
                value={proposalId} 
                onChange={(e) => setProposalId(e.target.value)} 
            />
            <button onClick={handleVote}>Vote Directly</button>

            <h2>Vote with Contract</h2>
            <input 
                type="text" 
                placeholder="Voting Contract Address" 
                value={votingContract} 
                onChange={(e) => setVotingContract(e.target.value)} 
            />
            <button onClick={handleVoteWithContract}>Vote via Contract</button>
        </div>
    );
}

export default SimpleVoting;
