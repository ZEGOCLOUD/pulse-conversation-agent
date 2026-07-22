# Observability

ZEGO Conversational Agent emits structured signals so teams can debug realtime Agent behavior without exposing secrets or full private transcripts by default.

## What To Watch

- Latency: TTFT, first sentence latency, total response time, model timing, and downstream timing.
- Conversation state: selected workspace, active stage, Agent status, and proactive speech decisions.
- Actions: action name, action instance, feedback status, and next-turn effect.
- Skills: invocation, timeout, result state, and failure reason.
- Errors: model failure, callback failure, customer service failure, and routing issues.

## Logging Defaults

Keep full conversation audit logs disabled by default. During troubleshooting windows, enable only the logs needed for the issue and redact tokens, PII, business records, and model keys before sharing anything in GitHub Issues or chat.

The public preview artifact enables `observability.auditEncryption` by default. If `logs.info` is temporarily enabled, `conversation.jsonl` stores encrypted audit envelopes. Only index fields such as request ID, AgentInstance ID, workspace, source, scenario, and model stay plaintext.

Customers who need temporary local access can generate their own audit key pair, add the public key to `auditEncryption.recipients`, and decrypt locally:

```bash
./bin/conversation-agent audit keys generate --out ./audit-keys
./bin/conversation-agent audit tail --file ./workspaces/default-service-assistant/logs/gateway/conversation.jsonl --private-key ./audit-keys/audit-private.pem --tail 40
./bin/conversation-agent audit decrypt --file ./workspaces/default-service-assistant/logs/gateway/conversation.jsonl --private-key ./audit-keys/audit-private.pem --out ./audit-plain.jsonl
```

## Evidence

Use `validation-evidence.json` to understand what was validated for the mirrored artifact. It is evidence, not a production acceptance certificate.
