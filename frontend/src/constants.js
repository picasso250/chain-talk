// Arbitrum One deployment.
export const CONTRACT_ADDRESS = "0x6Cb266BB285BA5F6591e449543d259277d57C700";
export const SUBGRAPH_URL = "https://api.studio.thegraph.com/query/1723159/chain-talk-arbitrum/v0.0.1";

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
