# D1 exact journey events

One shared Cloudflare D1 database `talka-journey` (ID `2bd18c7b-93c4-40c4-b653-8e7e2d074050`) contains **separate tables** for two products:
- talka: `talka_events` (`post_id` on topic clicks and opens/closes)
- DayCoin: `daycoin_events` (`page` on each event)

Both Workers bind this database as `JOURNEY_DB`. Their existing Analytics Engine datasets remain separate (`talka_journey` for this app). No wallet addresses, message text, IP fields or referrers are added.

## Remote schema setup (one-time, before deployment)
From the directory containing this site's `wrangler.jsonc`, run:

```powershell
npx wrangler d1 execute talka-journey --remote --file=./journey-schema.sql
```

The schema uses `CREATE TABLE IF NOT EXISTS`, with `(session, step)` as the unique key within each site's table. The D1 write is awaited before the response; Analytics Engine remains best-effort. D1 stores every *server-received and successfully written* event; browser delivery is still best-effort.

## Queries

```sql
SELECT * FROM talka_events ORDER BY received_at DESC LIMIT 100;
```

```sql
SELECT * FROM talka_events WHERE session = 'SESSION_ID' ORDER BY step;
```

Posts ranked by click count:

```sql
SELECT post_id, COUNT(*) AS clicks FROM talka_events
WHERE event = 'topic_click'
GROUP BY post_id ORDER BY clicks DESC;
```

Topic IDs are preserved as strings (uint256-safe).

Optional 14-day retention (not scheduled automatically):

```sql
DELETE FROM talka_events WHERE received_at < strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-14 days');
```
