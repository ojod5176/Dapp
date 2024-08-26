import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import SimpleVotingABI from './SimpleVotingABI.json';

const contractABI = SimpleVotingABI;
const contractAddress = "0x048DC24fD4841B471aFfD490287F088BEe26219e";

function SimpleVoting() {
    const [web3, setWeb3] = useState(null);
    const [account, setAccount] = useState('');
    const [contract, setContract] = useState(null);
    const [proposals, setProposals] = useState([]);
    const [proposalName, setProposalName] = useState('');
    const [proposalId, setProposalId] = useState('');
    const [votingContract, setVotingContract] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

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

                try {
                    const proposalCount = await contractInstance.methods.proposalCount().call();
                    let proposalsArray = [];
                    for (let i = 1; i <= proposalCount; i++) {
                        const proposal = await contractInstance.methods.proposals(i).call();
                        proposalsArray.push(proposal);
                    }
                    setProposals(proposalsArray);
                } catch (error) {
                    console.error("Error fetching proposals:", error);
                    alert(`Error fetching proposals: ${error.message || error}`);
                }
            } else {
                alert('Please install MetaMask to use this dApp!');
            }
        }
        loadWeb3();
    }, []);

    const handleAddProposal = async () => {
        if (proposalName && contract) {
            try {
                await contract.methods.addProposal(proposalName).send({ from: account });
                setSuccessMessage('Proposal added successfully!');
                setTimeout(() => setSuccessMessage(''), 5000); // Clear message after 5 seconds
                loadProposals(); // Refresh proposals
            } catch (error) {
                console.error("Error adding proposal:", error);
                alert(`Error adding proposal: ${error.message || error}`);
            }
        } else {
            alert("Proposal name cannot be empty!");
        }
    };

    const handleVote = async () => {
        if (proposalId && contract) {
            try {
                await contract.methods.vote(proposalId).send({ from: account });
                setSuccessMessage('Vote cast successfully!');
                setTimeout(() => setSuccessMessage(''), 5000); // Clear message after 5 seconds
                loadProposals(); // Refresh proposals
            } catch (error) {
                console.error("Error voting:", error);
                alert(`Error voting: ${error.message || error}`);
            }
        } else {
            alert("Proposal ID cannot be empty!");
        }
    };

    const handleVoteWithContract = async () => {
        if (proposalId && votingContract && contract) {
            try {
                await contract.methods.voteWithContract(proposalId, votingContract).send({ from: account });
                setSuccessMessage('Vote cast via contract successfully!');
                setTimeout(() => setSuccessMessage(''), 5000); // Clear message after 5 seconds
                loadProposals(); // Refresh proposals
            } catch (error) {
                console.error("Error voting with contract:", error);
                alert(`Error voting with contract: ${error.message || error}`);
            }
        } else {
            alert("Proposal ID and Voting Contract Address cannot be empty!");
        }
    };

    const handleDeleteVote = async () => {
        if (proposalId && contract) {
            try {
                await contract.methods.deleteVote(proposalId).send({ from: account });
                setSuccessMessage('Vote deleted successfully!');
                setTimeout(() => setSuccessMessage(''), 5000); // Clear message after 5 seconds
                loadProposals(); // Refresh proposals
            } catch (error) {
                console.error("Error deleting vote:", error);
                alert(`Error deleting vote: ${error.message || error}`);
            }
        } else {
            alert("Proposal ID cannot be empty!");
        }
    };

    const handleAddMoreVotes = async () => {
        if (proposalId && contract) {
            const amount = prompt('Enter the amount of votes to add:');
            if (amount) {
                try {
                    await contract.methods.addMoreVotes(proposalId, amount).send({ from: account });
                    setSuccessMessage(`${amount} votes added successfully!`);
                    setTimeout(() => setSuccessMessage(''), 5000); // Clear message after 5 seconds
                    loadProposals(); // Refresh proposals
                } catch (error) {
                    console.error("Error adding more votes:", error);
                    alert(`Error adding more votes: ${error.message || error}`);
                }
            } else {
                alert('Amount cannot be empty!');
            }
        } else {
            alert("Proposal ID cannot be empty!");
        }
    };

    const handleGetTotalVotes = async () => {
        if (contract) {
            try {
                const totalVotes = await contract.methods.getTotalVotes().call();
                alert(`Total Votes: ${totalVotes}`);
            } catch (error) {
                console.error("Error getting total votes:", error);
                alert(`Error getting total votes: ${error.message || error}`);
            }
        }
    };

    const handleRemoveVote = async () => {
        if (proposalId && contract) {
            try {
                await contract.methods.removeVote(proposalId).send({ from: account });
                setSuccessMessage('Vote removed successfully!');
                setTimeout(() => setSuccessMessage(''), 5000); // Clear message after 5 seconds
                loadProposals(); // Refresh proposals
            } catch (error) {
                console.error("Error removing vote:", error);
                alert(`Error removing vote: ${error.message || error}`);
            }
        } else {
            alert("Proposal ID cannot be empty!");
        }
    };

    const loadProposals = async () => {
        try {
            const proposalCount = await contract.methods.proposalCount().call();
            let proposalsArray = [];
            for (let i = 1; i <= proposalCount; i++) {
                const proposal = await contract.methods.proposals(i).call();
                proposalsArray.push(proposal);
            }
            setProposals(proposalsArray);
        } catch (error) {
            console.error("Error fetching proposals:", error);
            alert(`Error fetching proposals: ${error.message || error}`);
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

            <h2>Add Vote ParticiPants</h2>
            <input 
                type="text" 
                placeholder="Voting Contract Address" 
                value={votingContract} 
                onChange={(e) => setVotingContract(e.target.value)} 
            />
            <button onClick={handleVoteWithContract}>Vote via Contract</button>

            <h2>Delete Vote ParticiPants</h2>
            <button onClick={handleDeleteVote}>Delete Vote</button>

            <h2>Add More Votes</h2>
            <button onClick={handleAddMoreVotes}>Add More Votes</button>

            <h2>Total Votes For A ParticiPants</h2>
            <button onClick={handleGetTotalVotes}>Get Total Votes</button>

            <h2>Remove Vote</h2>
            <button onClick={handleRemoveVote}>Remove Vote</button>

            {successMessage && <p>{successMessage}</p>}
        </div>
    );
}

export default SimpleVoting;
