# Workspace And Stage Guidance

Workspaces define business behavior without changing Gateway runtime code. A workspace can hold identity, user context, stage guidance, action contracts, Skills, local knowledge, heartbeat policy, and observability output.

## What To Configure

- Identity and behavior files describe who the Agent is and how it should speak.
- Stage guidance splits a long prompt into scenario-specific behavior blocks.
- Local knowledge provides low-latency facts for the current scenario.
- Action definitions describe UI or business events the Agent can request.
- Skills connect external systems without hard-coding business logic into the Gateway.

## Why Stages Matter

Realtime Agents often fail when one giant prompt tries to cover every phase of an interaction. Stage guidance keeps the active instruction set smaller and easier to follow, which helps latency, cost, and instruction adherence.

## Recommended Review

For each workspace, confirm:

- the default stage is correct;
- stage descriptions are mutually clear;
- each stage exposes only the Actions and Skills it needs;
- fallback behavior is defined for unknown user intent or missing knowledge;
- stage switching is validated in text scenarios before Live E2E.
