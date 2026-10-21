CREATE TABLE IF NOT EXISTS talk_events (
  session TEXT NOT NULL,
  step INTEGER NOT NULL,
  event TEXT NOT NULL,
  post_id TEXT,
  received_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (session, step)
);
CREATE INDEX IF NOT EXISTS talk_events_received_at ON talk_events(received_at);
CREATE INDEX IF NOT EXISTS talk_events_post_id ON talk_events(post_id) WHERE post_id IS NOT NULL;
