## Talka: anonymous user journeys and GitHub deploy

The `arbitrum` branch publishes **talka.io99.xyz**, not the Ethereum mainnet site `talk.io99.xyz` (which is on `main`).

Cloudflare Workers Git integration settings:
- Git repository: `picasso250/chain-talk`
- Production branch: `arbitrum`
- Root directory: `frontend`
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Preview builds: optional (disable initially).

The site-local `frontend/wrangler.jsonc` binds `JOURNEY` to the Cloudflare Workers Analytics Engine dataset `talka_journey`. The dataset is created upon first successful write after a successful deployment. You must first enable Analytics Engine for the Cloudflare account. **Do not replace the existing live Worker or change its custom domain during Git connection without confirming which deployment it will update.**

Journey tracking is best-effort per browser tab, with a 30-minute idle reset. It tracks page visits, topic opening, Connect intent and success, topic and reply attempts/results. No wallet address, post content, transaction hash, IP field, or persistent user identifier is transmitted. Do Not Track/Global Privacy Control disable the telemetry. Requests are limited to `POST /api/journey`; analytics failure does not block the forum.

To examine an anonymous journey with Analytics Engine Studio:

```sql
SELECT timestamp, blob1 AS session, blob2 AS event, double1 AS step
FROM talka_journey
ORDER BY timestamp DESC
LIMIT 100
```

Reorder rows by `step` within each `session`. This is anonymous session-level data, not a count of unique people; blocked/lost requests are not recorded. Review local consent/notice requirements before using it more widely.
