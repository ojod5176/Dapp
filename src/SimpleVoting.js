import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import SimpleVotingABI from './SimpleVotingABI.json';

const contractABI = SimpleVotingABI;
const contractAddress = "0x2f5810664270e7C20E2eCC2eA543e2002B306Bf5";

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
