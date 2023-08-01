const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const contractABI =  [
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_unlockTime",
          "type": "uint256"
        }
      ],
      "stateMutability": "payable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "when",
          "type": "uint256"
        }
      ],
      "name": "Withdrawal",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address payable",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "unlockTime",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "withdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

const web3 = new Web3(Web3.givenProvider);
const contract = new web3.eth.Contract(contractABI, contractAddress);

async function getCandidates() {
    const candidateList = document.getElementById('candidateList');
    candidateList.innerHTML = '';

    const candidatesCount = await contract.methods.candidatesLength().call();

    for (let i = 0; i < candidatesCount; i++) {
        const candidate = await contract.methods.candidates(i).call();
        const option = document.createElement('li');
        option.textContent = candidate.name;
        candidateList.appendChild(option);
    }
}

async function populateVotingDropdowns() {
    const candidatesCount = await contract.methods.candidatesLength().call();
    const firstChoice = document.getElementById('firstChoice');
    const secondChoice = document.getElementById('secondChoice');
    const thirdChoice = document.getElementById('thirdChoice');

    for (let i = 0; i < candidatesCount; i++) {
        const candidate = await contract.methods.candidates(i).call();
        const option1 = document.createElement('option');
        const option2 = document.createElement('option');
        const option3 = document.createElement('option');

        option1.textContent = option2.textContent = option3.textContent = candidate.name;
        option1.value = option2.value = option3.value = i;

        firstChoice.appendChild(option1);
        secondChoice.appendChild(option2);
        thirdChoice.appendChild(option3);
    }
}

async function handleVote(event) {
    event.preventDefault();

    const firstChoice = document.getElementById('firstChoice').value;
    const secondChoice = document.getElementById('secondChoice').value;
    const thirdChoice = document.getElementById('thirdChoice').value;

    const accounts = await web3.eth.getAccounts();
    const voterAddress = accounts[0];

    try {
        await contract.methods.castVote([firstChoice, secondChoice, thirdChoice]).send({ from: voterAddress });
        alert('Vote cast successfully!');
        location.reload();
    } catch (error) {
        console.error('Error while casting vote:', error);
        alert('Error while casting vote. Please try again.');
    }
}

async function displayWinner() {
    try {
        const winnerName = await contract.methods.winningCandidate().call();
        const winnerElement = document.getElementById('winner');
        winnerElement.textContent = `Winner: ${winnerName}`;
    } catch (error) {
        console.error('Error while fetching winner:', error);
    }
}

async function init() {
    await web3.eth.requestAccounts();

    getCandidates();
    populateVotingDropdowns();
    displayWinner();

    const votingForm = document.getElementById('votingForm');
    votingForm.addEventListener('submit', handleVote);
}

window.addEventListener('DOMContentLoaded', init);
