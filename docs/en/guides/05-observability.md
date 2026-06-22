# Observability

Pulse emits structured signals so teams can debug realtime Agent behavior without exposing secrets or full private transcripts by default.

## What To Watch

- Latency: TTFT, first sentence latency, total response time, model timing, and downstream timing.
- Conversation state: selected workspace, active stage, Agent status, and proactive speech decisions.
- Actions: action name, action instance, feedback status, and next-turn effect.
- Skills: invocation, timeout, result state, and failure reason.
- Errors: model failure, callback failure, customer service failure, and routing issues.

## Logging Defaults

Keep full conversation audit logs disabled by default. During troubleshooting windows, enable only the logs needed for the issue and redact tokens, PII, business records, and model keys before sharing anything in GitHub Issues or chat.

## Evidence

Use `validation-evidence.json` to understand what was validated for the mirrored artifact. It is evidence, not a production acceptance certificate.
