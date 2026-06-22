# Pulse Conversation Agent

Language: English | [简体中文](README.zh-CN.md)

**Build self-hosted realtime AI agents for voice/video apps with ZEGOCLOUD AI Agent APIs.**

`pulse-conversation-agent` is a Developer Preview Gateway for building realtime conversation agents inside apps. It is distributed as a compiled runtime artifact with customer-facing documentation. It is not an open-source source distribution, and it is not a hosted service or production SLA product.

Use it to evaluate a customer-deployed realtime agent Gateway that handles LLM callbacks, workspace behavior, stage guidance, UI Actions, Skills, Hooks, dynamic context, and observability. The current preview integrates with ZEGOCLOUD AI Agent APIs for RTC, ASR, TTS, interruption, and AgentInstance execution.

This repository is the external preview surface for the runtime artifact. Source code is not included in this preview; the developer-assistant repository for Codex, Cursor, Claude Code, and similar tools is kept separate.

## Who This Is For

- Developers building in-app realtime AI assistants for voice, video, chat, social rooms, education, support, or game-like experiences.
- Teams that want a self-hosted Gateway while keeping business auth, user data, workspace files, and deployment controls in their own environment.
- Product and engineering teams evaluating whether a realtime Agent workflow can move beyond a demo into a pilot.

## What You Can Build

- AI onboarding assistants that guide new users in a live room or app session.
- AI support agents that answer questions, trigger UI Actions, and consume customer-side action results.
- Social room, education, or game NPC agents that need realtime speech, stage guidance, Skills, and observable state.

## What You Get

- A compiled Pulse Conversation Agent Gateway runtime.
- A default editable workspace for quick evaluation.
- A reference customer service for RTC token, AgentInstance lifecycle, events, and action feedback.
- A Web validation page for live RTC, subtitles, stage/status display, and Action UI testing.
- Public preview docs for architecture, deployment, security, validation, and production evaluation.

## Repository Layout

This repository keeps the browsable surface small. Runtime entrypoints, setup helpers, workspace templates, contracts, and config examples are packaged inside the GitHub Release artifact instead of being expanded at the repository root.

| Path | Purpose |
| --- | --- |
| `docs/` | Deployment, customer handoff, validation, architecture, guides, and production-readiness notes. |
| `artifacts/` | Preview `.tgz` and checksum mirror. Prefer the GitHub Release page for customer download. |
| `artifact-manifest.json`, `validation-evidence.json` | Version, checksum, support boundary, and validation evidence status. |

The downloaded `.tgz` contains the runnable package: `bin/`, `setup/`, `workspaces/`, `contract.json`, `openapi.yaml`, `conversationAgent.example.json`, validation examples, docs, and compiled runtime. The repository does not expand those directories at the root, so evaluators do not confuse the repository browser with a complete generated project.

## Get Started With ZEGOCLOUD

1. Create or sign in to a ZEGOCLOUD account: https://www.zegocloud.com/
2. Create an app in the ZEGOCLOUD Console and prepare the AppID and ServerSecret in your own secret store.
3. Enable or configure the ZEGOCLOUD AI Agent APIs required for RTC, ASR, TTS, interruption, and AgentInstance execution.
4. Install Pulse from the GitHub Release artifact and run local setup/check/doctor.
5. Use the packaged Web validation page or your own app to run a live validation path.

## Fastest Path

Install the latest Developer Preview from GitHub Release:

```bash
node scripts/install-latest.mjs --channel preview --install-dir ./pulse
```

Then run the local check flow from the managed `current` package:

```bash
./pulse/current/bin/conversation-agent setup --project ./pulse-project
./pulse/current/bin/conversation-agent check --project ./pulse-project
./pulse/current/bin/conversation-agent start all --project ./pulse-project --daemon
./pulse/current/bin/conversation-agent doctor --project ./pulse-project
```

Container images are planned, but not included in this preview. Use the GitHub Release artifact-first CLI path above for the current Developer Preview.

To pin a specific version for rollback or troubleshooting, download that GitHub Release artifact manually and verify the `.sha256` file before unpacking.

## Runtime Boundary

| Surface | Owns |
| --- | --- |
| ZEGOCLOUD AI Agent APIs / Server | RTC audio, ASR, TTS playback, interruption events, and AgentInstance execution. |
| Pulse Conversation Agent Gateway | LLM callbacks, workspace runtime, stage guidance, Action and Skill orchestration, session context, observability, and optional Gateway-owned AgentInstance lifecycle. |
| Customer service | User auth, RTC Token04, browser/mobile APIs, runtime config, event relay, private Gateway lifecycle calls, and action feedback relay. |
| Customer App/Web | ZEGOCLOUD Express SDK, room entry, microphone publishing, subtitles/status/action UI display, and action result submission through the customer service. |

Browser and mobile clients must not hold Gateway control tokens or call Gateway private control APIs directly.

## Binary Distribution

Pulse is a compiled-runtime-only Developer Preview. The repository intentionally exposes docs, checksums, manifests, validation evidence, and issue templates while keeping runtime source code out of the public preview. No source-code license is granted by this repository.

This shape is meant for evaluation and pilot integration, not for repackaging Pulse as a hosted service or presenting it as a production SLA product.

## Trust And Verification

- Verify the release artifact with the published `.sha256` checksum.
- Inspect `artifact-manifest.json` for version, release channel, delivery type, source disclosure, and support boundary.
- Inspect `validation-evidence.json` for the highest validation level reached by this exact artifact.
- Review `SECURITY.md` and `docs/en/PRODUCTION_CHECKLIST.md` before any production pilot.

Current preview evidence includes Level 3 managed cloud live smoke for the mirrored artifact, but this is not a production acceptance certificate. Production use still requires customer-side stability, capacity, security, compliance, rollback, and support acceptance.

## Documentation

- [English developer guides](docs/en/guides/README.md)
- [Architecture](docs/en/ARCHITECTURE.md)
- [Deployment](docs/en/DEPLOYMENT.md)
- [Customer handoff](docs/en/CUSTOMER_HANDOFF.md)
- [Level 2.5 validation matrix](docs/en/LEVEL_2_5_VALIDATION_MATRIX.md)
- [Production checklist](docs/en/PRODUCTION_CHECKLIST.md)
- [Validation evidence](validation-evidence.json)
- [Security](SECURITY.md)
- [中文开发者指南](docs/zh-CN/guides/README.md)
- [架构说明（中文）](docs/zh-CN/ARCHITECTURE.md)
- [部署说明（中文）](docs/zh-CN/DEPLOYMENT.md)

## AI Coding Assistant

For Codex, Cursor, Claude Code, and similar tools, use the companion repository:

```text
https://github.com/ZEGOCLOUD/conversation-agent-dev-assistant
```

Ask the tool to read `AI_INSTALL.md` and `AGENTS.md`, then install this preview artifact without asking you to paste secrets into chat.

Suggested first prompt:

```text
Use the conversation-agent-dev-assistant repository to install the latest Pulse Conversation Agent Developer Preview from the GitHub Release artifact. Keep secrets out of chat, run setup/check/doctor, then guide Level 2.5 live smoke validation. If an installed package already exists, use conversation-agent upgrade --check first and follow artifact-manifest.json upgradePolicy.
```

## Planned Next

- Demo video and public playable experience.
- Docker Compose quickstart.
- Short concurrency validation such as 5/10/20 sessions.
- 24h soak validation.
- Production capacity, security, compliance, and incident-response acceptance.

## Version

- Preview channel: latest prerelease by default
- Current mirrored artifact: `pulse-conversation-agent-gateway-v0.1.0-preview.19.tgz`
- Container image: planned, not included in this preview
