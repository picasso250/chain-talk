// Single source of truth for the public chain-specific frontend configuration.
export const CHAINS = Object.freeze({
  ethereum: Object.freeze({
    CHAIN_ID: 1,
    CHAIN_NAME: "Ethereum",
    EXPLORER_URL: "https://etherscan.io",
    CONTRACT_ADDRESS: "0xec3639B4CC756d39e996447dE1787B09EF646b6F",
    SUBGRAPH_URL: "https://api.studio.thegraph.com/query/1723159/chain-talk/mainnet-v1",
    OTHER_VERSION_URL: "https://talka.io99.xyz/",
    OTHER_VERSION_LABEL: "Arbitrum version"
  }),
  arbitrum: Object.freeze({
    CHAIN_ID: 42161,
    CHAIN_NAME: "Arbitrum One",
    EXPLORER_URL: "https://arbiscan.io",
    CONTRACT_ADDRESS: "0x6Cb266BB285BA5F6591e449543d259277d57C700",
    SUBGRAPH_URL: "https://api.studio.thegraph.com/query/1723159/chain-talk-arbitrum/v0.0.1",
    OTHER_VERSION_URL: "https://talk.io99.xyz/",
    OTHER_VERSION_LABEL: "Ethereum version"
  })
});
