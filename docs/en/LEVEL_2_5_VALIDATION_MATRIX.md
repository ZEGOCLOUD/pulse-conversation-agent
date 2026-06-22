# Level 2.5 Validation Matrix

Use this matrix when validating Pulse Conversation Agent through a local Cloudflare Tunnel with real realtime backend credentials. It separates the already proven normal voice path from the features that still need explicit evidence: ACTION feedback, proactive speech, and multi-workspace behavior.

Level 2.5 is a developer integration smoke. It does not replace production acceptance or managed cloud validation.

## Preconditions

| Item | Requirement |
| --- | --- |
| Artifact | Use the exact released `.tgz` and record its version, artifact name, and sha256. Do not run from a source checkout. |
| Browser | Use a real browser session with a confirmed physical microphone. CDP/headless replay is not enough if microphone permission or device state blocks capture. |
| Public URL | Use Cloudflare Quick Tunnel or a named HTTPS tunnel that ZEGO callbacks can reach. |
| Credentials | Use approved realtime backend, LLM, ASR, and TTS credentials. Do not paste or capture secrets in evidence. |
| Workspace | Start with workspace id `default`; its generated directory is `workspaces/default-service-assistant`. Add extra test workspaces only for multi-workspace validation. |
| Logs | Keep screenshots and short sanitized log snippets. Do not include full secrets, tokens, or raw private prompts. |

## Validation Matrix

| Area | Case | Steps | Pass Criteria | Evidence |
| --- | --- | --- | --- | --- |
| Normal voice | Room and microphone | Open the tunnel URL, select a physical microphone, click Start. | Room joins, microphone publishes, and no virtual silent device is selected. | Screenshot of active session plus sanitized Web signal lines for room and publishing. |
| Normal voice | ASR to LLM to TTS | Speak a short sentence and wait for AI response. | User speech appears as ASR subtitle; Gateway receives LLM callback; AI subtitle appears; AI voice is audible. | Screenshot of transcript plus operator note that audio was heard. |
| ACTION | Action emission | Ask a prompt that should trigger one supported UI Action. | Exactly one action is shown for the turn; no protocol JSON or raw `[ACTION:...]` text is spoken. | Screenshot of ACTION panel and transcript. |
| ACTION | Feedback accepted | Submit accepted feedback for the action. | ACTION_RESULT is submitted; observation/result appears; AI uses the result in the next response. | Screenshot of action observation and follow-up AI response. |
| ACTION | Feedback rejected | Trigger the action again in a fresh session and submit rejected feedback. | AI does not repeat the same prompt immediately; rejection is reflected in context or follow-up response. | Screenshot of rejected feedback and follow-up response. |
| ACTION | No duplicate action | Continue the same conversation after feedback. | The same action is not repeatedly emitted unless the user explicitly asks for it again. | Transcript excerpt across two turns. |
| Proactive speech | Manual Speak button | After Start, click Speak with the default text. | ZEGO TTS plays the manual speech; Web transcript/status reflects the speech path without leaking debug protocol. | Screenshot of signal line plus operator note that audio was heard. |
| Proactive speech | Heartbeat-triggered speech | Configure or enable a heartbeat-capable workspace and wait for the idle decision window. | Heartbeat decision emits speech only when policy allows; no repeated nuisance speech. | Sanitized heartbeat decision log plus transcript/audio note. |
| Proactive speech | Recovery after user interruption | Speak while AI is talking or immediately after proactive speech. | Realtime interaction remains usable; user ASR resumes; subsequent AI response is coherent. | Transcript and status evidence. |
| Multi-workspace | Workspace listing | Open the Web page and refresh workspace choices. | `/agent/workspaces` returns every intended test workspace; UI labels and default state are correct. | Screenshot of workspace dropdown and sanitized `/agent/workspaces` response. |
| Multi-workspace | Workspace-specific call | Start one call per workspace. | Session label shows the selected workspace; AgentInstance is created with that workspace. | Screenshot per workspace plus sanitized create response. |
| Multi-workspace | Isolation | Ask workspace-specific questions or trigger workspace-specific actions. | Persona, knowledge, action contract, and mode behavior do not cross between workspaces. | Side-by-side transcript excerpts. |
| Multi-workspace | Unknown workspace fail closed | Call the customer service or Gateway with an unknown workspace id. | Request fails closed with a clear error and does not fall back to another workspace. | HTTP status/body snippet without tokens. |

## Evidence Template

Copy this block into the validation notes for the tested release.

```text
Release:
- version:
- artifact:
- sha256:
- source:

Environment:
- date/time:
- tester:
- browser:
- tunnel type: Quick Tunnel / Named Tunnel
- tunnel URL:
- physical microphone confirmed: yes/no

Results:
- normal voice: pass/fail
- ACTION emission: pass/fail/not-run
- ACTION feedback accepted: pass/fail/not-run
- ACTION feedback rejected: pass/fail/not-run
- no duplicate ACTION: pass/fail/not-run
- manual proactive speak: pass/fail/not-run
- heartbeat-triggered speech: pass/fail/not-run
- proactive interruption/recovery: pass/fail/not-run
- workspace listing: pass/fail/not-run
- workspace-specific call: pass/fail/not-run
- workspace isolation: pass/fail/not-run
- unknown workspace fail-closed: pass/fail/not-run

Known gaps:
-

Decision:
- candidate status: pass / risk / fail
- reason:
```

## Reporting Rules

- Do not mark ACTION readiness unless action emission, accepted feedback, rejected feedback, and duplicate-prevention cases pass.
- Do not mark proactive speech readiness unless manual Speak and heartbeat-triggered speech pass.
- Do not mark multi-workspace readiness unless listing, per-workspace call creation, isolation, and unknown-workspace fail-closed pass.
- If only normal voice passed, say exactly that: normal voice path passed; ACTION, proactive speech, and multi-workspace remain unverified.
