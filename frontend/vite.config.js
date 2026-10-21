import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { CHAINS } from './config/chains.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  if (mode !== 'ethereum' && mode !== 'arbitrum') throw new Error(`Explicit chain build mode required; received: ${mode}`);
  const chain = CHAINS[mode];
  return {
    plugins: [
      tailwindcss(),
      svelte(),
      {
        name: 'chain-metadata',
        transformIndexHtml() {
          const rpc = chain.CHAIN_ID === 1 ? 'https://ethereum-rpc.publicnode.com' : 'https://arb1.arbitrum.io/rpc';
          const metadata = {
            'chain-talk:network': `${chain.CHAIN_NAME} (chainId ${chain.CHAIN_ID})`,
            'chain-talk:contract': chain.CONTRACT_ADDRESS,
            'chain-talk:subgraph': chain.SUBGRAPH_URL,
            'chain-talk:query-example': `POST ${chain.SUBGRAPH_URL} Body: {"query":"{ posts { id replyTo author content timestamp transactionHash } }"}`,
            'chain-talk:post-example': `Sign with your wallet and call post(string content, uint256 replyTo) on ${chain.CONTRACT_ADDRESS}; replyTo=0 creates a topic. RPC: ${rpc}`
          };
          return Object.entries(metadata).map(([name, content]) => ({ tag: 'meta', attrs: { name, content }, injectTo: 'head' }));
        }
      }
    ],
    define: { __DEPLOYMENT__: JSON.stringify(chain) }
  };
})
