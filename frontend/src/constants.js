// Network configurations
export const NETWORKS = {
  "0xaa36a7": {
    name: "Sepolia",
    chainId: 11155111,
    contractAddress: "0x759723E3869181616D6567458b59bCbA365FEcEe",
    rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
    deployBlock: 11835312,
    etherscanPrefix: "sepolia.etherscan.io",
    color: "#7b61ff",
  },
  "0x1": {
    name: "Ethereum",
    chainId: 1,
    contractAddress: "0xec3639B4CC756d39e996447dE1787B09EF646b6F",
    rpcUrl: "https://ethereum-rpc.publicnode.com",
    deployBlock: 26111445,
    etherscanPrefix: "etherscan.io",
    color: "#627eea",
  },
};

export const DEFAULT_CHAIN_ID = "0x1"; // Ethereum Mainnet

export function getNetworkConfig(chainId) {
  return NETWORKS[chainId] || NETWORKS[DEFAULT_CHAIN_ID];
}

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
