# Release Notes

## v0.1.0-preview.19

Customer candidate Developer Preview for Pulse Conversation Agent.

- Provides a compiled realtime conversation-agent Gateway artifact.
- Gateway runtime is shipped as a compiled binary; JavaScript source, system prompts, and internal architecture are not included in the artifact.
- Adds layered audit visibility: plaintext dialog layer (user message, AI response, user context) without a key, plus an encrypted context layer (system prompt, mode guidance, technical context) that requires a customer-managed key pair.
- Includes the `default-service-assistant` workspace, public multi-workspace validation workspaces, reference customer service, and Web validation assets.
- Includes public preview docs for architecture, deployment, customer handoff, production evaluation, bilingual developer guides, and security.
- Integrates with ZEGOCLOUD AI Agent APIs for RTC, ASR, TTS, interruption, and AgentInstance execution.
- Does not pre-create runtime `logs/` or `memory/` directories inside the artifact; runtime data should be generated only in the evaluator's local or cloud environment.

Validation summary:

- Static package gate, public artifact leakage scan, and adversarial security scan passed before publication.
- Compiled binary verified free of embedded source maps, TypeScript source, and internal cloud details.
- GitHub Release download-back checksum verification passed for `v0.1.0-preview.19`.
- Managed cloud Level 3 smoke was run on `release-check` from the exact artifact sha `1e2ce8761de0370e0061b66d0361420bccaa4fc36863a7fa8809569342e9e307`.
- The Level 3 smoke covered check/doctor, public route checks, callback routing, manual proactive speak, human-observed microphone voice, heartbeat auto-speech, and multi-workspace registration evidence.

Not covered in this preview handoff:

- 5/10/20 short concurrency validation.
- 24h soak validation.
- Production SLA, managed hosting, container images, and multi-Gateway HA.

Preview boundary:

- Compiled binary preview only; source code is not included.
- No default production SLA.
- Container images are planned, but not included in this preview.
- Production use requires customer-side stability, security, compliance, rollback, and observability validation.
