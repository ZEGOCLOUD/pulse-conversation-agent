# Deployment

This file is inside an unpacked ZEGO Conversational Agent Service runtime package. Use the packaged CLI directly.

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

Always run `upgrade --check --json` before switching runtime packages. The command reads the candidate `artifact-manifest.json` and reports whether `upgradePolicy.requiresDevAssistantUpgrade` blocks the runtime upgrade. If it does, update `ZEGOCLOUD/conversation-agent-dev-assistant`, reread `AI_INSTALL.md`, rerun the relevant assistant checklist, then rerun the runtime upgrade with `--confirm-dev-assistant-updated`.

The upgrade preflight preserves `.env.local`, `conversationAgent.json`, workspace edits, logs, memory, and runtime state in the customer project directory. It does not silently update the developer-assistant repository.
