# Customer Handoff

This runtime package is a compiled-runtime-only Developer Preview artifact. It does not contain source code, source maps, customer-specific workspaces, container images, production SLA terms, or a hosted service.

## Quick Deployment

```bash
./bin/conversation-agent setup --project ./pulse-project
./bin/conversation-agent check --project ./pulse-project
./bin/conversation-agent start all --project ./pulse-project --daemon
./bin/conversation-agent status --project ./pulse-project
./bin/conversation-agent doctor --project ./pulse-project
```

`./pulse-project` is the customer-owned configuration, secrets, logs, workspace, and runtime state directory.

## Validation Boundary

Use Level 1 and Level 2 for local readiness. Use Level 2.5 for local Cloudflare Tunnel live smoke. Use Level 3 for a public HTTPS deployment from the exact release artifact. Production stability, capacity, security, compliance, rollback, and support acceptance remain customer-side responsibilities for this Developer Preview.
