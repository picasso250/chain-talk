// Fixed Ethereum mainnet deployment.
export const CONTRACT_ADDRESS = "0xec3639B4CC756d39e996447dE1787B09EF646b6F";
export const SUBGRAPH_URL = "https://api.studio.thegraph.com/query/1723159/chain-talk/mainnet-v1";

export const CONTRACT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "replyTo",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "author",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "content",
        "type": "string"
      }
    ],
    "name": "Posted",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "content",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "replyTo",
        "type": "uint256"
      }
    ],
    "name": "post",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
