# Deployment

This file is inside an unpacked Pulse Conversation Agent runtime package. Use the packaged CLI directly.

```bash
./bin/conversation-agent setup --project ./pulse-project
./bin/conversation-agent check --project ./pulse-project
./bin/conversation-agent start all --project ./pulse-project --daemon
./bin/conversation-agent status --project ./pulse-project
./bin/conversation-agent doctor --project ./pulse-project
```

Keep the runtime package and generated project directory separate. `pulse-project` is not a workspace id; workspaces live under the generated project after setup.

For latest-install from GitHub, use the repository-level `scripts/install-latest.mjs` in https://github.com/ZEGOCLOUD/pulse-conversation-agent. That installer is not included inside this runtime package.

## Upgrade and Rollback

If this package is installed through a managed layout such as `./pulse/current`, use:

```bash
./bin/conversation-agent upgrade --check --json --project ./pulse-project
./bin/conversation-agent upgrade --project ./pulse-project
./bin/conversation-agent rollback --project ./pulse-project
```

The upgrade command preserves `.env.local`, `conversationAgent.json`, workspace edits, logs, memory, and runtime state in the customer project directory.
