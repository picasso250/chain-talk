// Arbitrum One Deployment
export const CONTRACT_ADDRESS = "0x09e8c43372CB00eC109D029e321dC7FFf0bb1e28"; 

// Arbitrum One Chain ID (Hex)
export const TARGET_CHAIN_ID = "0xa4b1"; // 42161

export const CONTRACT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "content",
        "type": "string"
      }
    ],
    "name": "EntryCreated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_content",
        "type": "string"
      }
    ],
    "name": "writeEntry",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
