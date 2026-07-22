# Architecture

`pulse-conversation-agent` is a customer-deployed Gateway that runs the text-side intelligence layer for realtime AI agents.

```text
Customer App/Web
  |  ZEGOCLOUD realtime SDK, subtitles, status, Action UI
  v
Customer Service
  |  auth, RTC Token04, runtime config, events, action feedback
  v
ZEGO Conversational Agent Gateway
  |  LLM callback, workspace, stage guidance, Skill, Hook, Action, context, observability
  v
ZEGOCLOUD AI Agent API / Server
  |  RTC, ASR, TTS, interruption, AgentInstance execution
```

## Ownership

| Surface | Responsibility |
| --- | --- |
| ZEGOCLOUD AI Agent API / Server | RTC audio, ASR, TTS playback, interruption events, and AgentInstance execution. |
| ZEGO Conversational Agent Gateway | LLM callbacks, workspace runtime, stage guidance, Action/Skill orchestration, dynamic context, and observability. |
| Customer Service | User authorization, RTC Token04, private Gateway calls, event relay, and action feedback relay. |
| Customer App/Web | Express SDK integration, room entry, microphone publishing, subtitles/status/action UI display. |

## Design Boundary

The Gateway is designed to reduce repeated customer work in realtime agent scenarios:

- split long agent behavior into workspace files and stage guidance;
- keep UI Action protocol and LLM context aligned;
- allow Skills and Hooks without forcing every customer to build the same orchestration layer;
- expose observability for latency, action, mode, status, and error tracking.

Implementation details such as internal prompt assembly, compact strategy, benchmark harnesses, and customer-specific workspaces are not part of this public preview repository.

## Repository Boundary

ZEGO Conversational Agent is the external preview surface for compiled artifacts. Source code is not included in this preview, and developer-assistant materials are maintained separately.

| Surface | Purpose |
| --- | --- |
| ZEGO Conversational Agent repository | Evaluation docs, release manifest, checksum, and compiled preview artifact. |
| Developer assistant repository | AI coding tool guidance, skills, plugin metadata, prompt optimization, and troubleshooting workflows. |
| Source code | Not included in this preview. |
