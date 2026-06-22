# Production Evaluation Checklist

This Developer Preview is not a SLA-backed production product. Before using it in production, validate the following items in your own environment.

## Functional Gates

- Customer App/Web joins RTC, publishes microphone audio, and displays subtitles/status/action UI.
- Customer service creates, speaks through, and ends AgentInstance through private Gateway APIs.
- Action feedback returns to Gateway and is reflected in the next agent response.
- Workspace action examples use `[ACTION:NAME key="value"]` labels, not JSON objects inside the ACTION label.
- Multiple workspaces route by AgentInstance and do not share prompt, action schema, logs, canvas state, or action feedback.
- Proactive speak returns through the owning workspace.
- Workspace stage guidance switches correctly for the target scenario.
- Knowledge or Skill failures have safe fallback responses.

## Stability Gates

- Gateway can pass your expected concurrency and soak test.
- Process restart does not leave customer rooms or AgentInstance lifecycle in an unrecoverable state.
- Downstream realtime backend, LLM, Skill, and customer service failures are observable and bounded.
- Rollback to the previous immutable package or image digest is tested.

## Security Gates

- Gateway control APIs are not exposed to browsers or mobile apps.
- Callback and control tokens are configured and rotated.
- ZEGO lifecycle credentials follow the lifecycle owner: Gateway `zego.appId/serverSecretRef` is required only when `lifecycleOwner=gateway`; customer service `ZEGO_APP_ID/ZEGO_SERVER_SECRET` remains required when it generates RTC Token04 or owns ZEGO lifecycle.
- Full conversation logs are disabled unless explicitly approved for troubleshooting.
- Logs redact user identifiers, tokens, model keys, and customer business data.

## Support Boundary

GitHub Issues are best-effort for preview feedback. Production support, incident response, frozen versions, and rollback assistance require a separate agreement with the maintainers or backend provider.
