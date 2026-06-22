# Troubleshooting

Start with the validation level that failed. Do not jump to Live E2E debugging before local setup, check, status, and doctor are clean.

## Common Issues

- Installation cannot find a release artifact: check GitHub access and the release channel.
- Gateway starts but Live E2E fails: verify the public HTTPS callback URL and ZEGOCLOUD AI Agent configuration.
- Web page loads but no audio is published: check browser microphone permission and room publish state.
- Action appears but feedback has no effect: confirm the customer service relays action results to the owning Gateway session.
- Stage behavior is wrong: run text scenario evaluation and inspect workspace stage guidance before changing runtime configuration.

## What To Include In Issues

Include preview version, artifact name, validation level, redacted logs, and reproduction steps. Do not include secrets, tokens, user PII, customer records, or full private transcripts.
