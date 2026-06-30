# Quickstart

Pulse Conversation Agent is installed from a GitHub Release artifact. Keep the immutable runtime package separate from the customer-owned project directory.

## Install

```bash
node scripts/install-latest.mjs --channel preview --install-dir ./pulse
./pulse/current/bin/conversation-agent setup --project ./pulse-project
./pulse/current/bin/conversation-agent check --project ./pulse-project
./pulse/current/bin/conversation-agent start all --project ./pulse-project --daemon
./pulse/current/bin/conversation-agent doctor --project ./pulse-project
```

## Directory Model

```text
pulse/current/     # immutable runtime package selected by the installer
pulse-project/     # customer-owned config, secrets, workspaces, logs, and state
```

Do not store customer secrets in the repository or runtime package. Use `.env.local`, host environment variables, or a customer-owned secret manager.

## Validation Levels

- Level 1: local Gateway starts and passes check/status/doctor.
- Level 2: customer service and Web validation page are available.
- Level 2.5: local tunnel Live Smoke with real ZEGOCLOUD callbacks.
- Level 3: public HTTPS deployment from the exact release artifact.

The current preview has static artifact and repository validation only. Level 3 exact-artifact public HTTPS live validation has not been completed for this sha.
