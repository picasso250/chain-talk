# Chain Talk — one source, two deployments

Unified front-end source lives in `frontend/src`. The main branch is the canonical branch after migration. These production deployments share frontend code, not contracts or chain indexes.

| | Ethereum | Arbitrum |
|---|---|---|
| Site | talk.io99.xyz | talka.io99.xyz |
| Worker | chain-talk | chain-talk-arbitrum |
| Chain ID | 1 | 42161 |
| Vite | `npm run build:ethereum` | `npm run build:arbitrum` |
| Wrangler | `npx wrangler deploy -c wrangler.ethereum.jsonc` | `npx wrangler deploy -c wrangler.arbitrum.jsonc` |
| Analytics Engine | talk_journey | talka_journey |
| D1 table | talk_events | talka_events |

Both sites use the same D1 database `talka-journey`, each writing to its **own** table. Run `npx wrangler d1 execute talka-journey --remote --file=./journey-ethereum-schema.sql` once before deploying Ethereum's new Worker. No code generation of duplicate source trees is necessary.

## Cloudflare Git integration — both Workers

For **each existing Worker**, set GitHub repo `picasso250/chain-talk`, production branch `main`, and root directory `frontend`. In Cloudflare Builds, set the commands **independently**:

- **chain-talk (Ethereum)** — Build: `npm run build:ethereum`; Deploy: `npx wrangler deploy -c wrangler.ethereum.jsonc`
- **chain-talk-arbitrum (Arbitrum)** — Build: `npm run build:arbitrum`; Deploy: `npx wrangler deploy -c wrangler.arbitrum.jsonc`

Do not use a common deploy command or select the wrong Wrangler file. The root `frontend/wrangler.jsonc` and `npm run build` default to Ethereum only for backwards compatibility.

**Migration handoff:** Local changes can be committed safely; hold the Git `push` until *both* Cloudflare Workers have the exact settings above. Then one push to `main` triggers two independent Git builds. Do not manually deploy as part of this handoff.

**Rollout warning:** Do not point the Arbitrum Worker at `main` before main contains the unified code and the build/deploy commands are set to Arbitrum. Do not point Ethereum's deploy at the Arbitrum Wrangler file.

Before first dual-production rollout: review current settings in both Workers; initialize `talk_events`; verify both builds, network addresses and chain matching logic; switch the Git integrations in a controlled order. All existing chain contracts remain untouched.

## Test

```powershell
cd frontend
npm run build:ethereum
npm run build:arbitrum
node --test tests/*.test.mjs src/forum.test.js
```

Only the last build output remains in `frontend/dist`. Cloudflare builds each Worker independently, in its own checkout.

## Anonymous analytics

The same front-end session event names work on both sites; the session storage key is namespaced by chain ID. Each Worker validates event fields and writes only to its chain's dedicated D1 table. Existing historical `talka_events` records remain intact. Ethereum's `talk_events` will start recording only when its new Worker is deployed.
