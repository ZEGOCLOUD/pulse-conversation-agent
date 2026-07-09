# Release Notes

## v0.1.0-preview.23

Customer candidate Developer Preview for Pulse Conversation Agent.

- Provides a compiled realtime conversation-agent Gateway artifact.
- Includes the `default-service-assistant` workspace, reference customer service, and Web validation assets.
- Includes public preview docs for architecture, deployment, customer handoff, production evaluation, English developer guides, and security.
- Adds `conversation-agent upgrade --check` so customers can inspect `artifact-manifest.json.upgradePolicy` before switching runtime packages.
- Keeps runtime upgrades linked with `conversation-agent-dev-assistant` through the required dev-assistant sync gate and upgrade preflight.
- Adds session owner routing so one Gateway process can host multiple workspaces while routing each `agentInstanceId` / `callId` back to its bound workspace runtime.
- Moves mode knowledge policy to `modes/*.md` frontmatter and supports optional `workspace.json.modes.transitions` for deterministic regex-based cross-mode routing.
- Keeps legacy `modes.definitions` compatibility while documenting it as deprecated for new workspaces.
- Integrates with ZEGOCLOUD AI Agent APIs for RTC, ASR, TTS, interruption, and AgentInstance execution.
- Excludes private customer workspaces; customers keep their own workspace/config during upgrade.
- Does not include runtime log or memory data inside the artifact; only empty placeholder directories may be present for first-run layout.

Validation summary:

- Static package gate and public artifact leakage scan passed before publication.
- GitHub Release download-back checksum verification should be recorded when this candidate is published.
- Managed cloud Level 3 smoke must be recorded in `validation-evidence.json` for this exact artifact sha before it is used as release acceptance evidence.
- Level 3 smoke should cover check/doctor, public route checks, callback routing, manual proactive speak, human-observed microphone voice, heartbeat auto-speech, and workspace registration evidence.

Not covered in this preview handoff:

- 5/10/20 short concurrency validation.
- 24h soak validation.
- Production SLA, managed hosting, container images, and multi-Gateway HA.

Preview boundary:

- Binary preview only; source code is not included.
- No default production SLA.
- Container images are planned, but not included in this preview.
- Production use requires customer-side stability, security, compliance, rollback, and observability validation.
