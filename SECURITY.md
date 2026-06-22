# Security

This Developer Preview is customer-deployed. Customers are responsible for their own deployment security, network exposure, secret storage, log retention, and compliance validation.

## Data Boundary

- Customer App/Web should talk to the customer service and ZEGOCLOUD realtime client SDKs only.
- Customer service should mint RTC Token04, enforce user authorization, and call Gateway private APIs from a trusted server environment.
- Gateway control tokens, callback tokens, backend server secrets, LLM keys, and customer service tokens must never be shipped to browsers or mobile apps.
- Full conversation audit logs should stay disabled by default. Enable them only during an approved troubleshooting window.

## Binary Preview Trust

This repository distributes a compiled runtime artifact, not source code. Before evaluation or pilot use:

- verify the artifact checksum against the published `.sha256` file;
- inspect `artifact-manifest.json` for release channel, source disclosure, and support boundary;
- inspect `validation-evidence.json` for exact-artifact validation status;
- keep a copy of the artifact, checksum, and manifest used for any pilot acceptance.

Planned trust improvements include SBOM publication, artifact signature or GitHub artifact attestation, and vulnerability scan summaries. They are not included in the current preview unless explicitly attached to a release.

## Production Review

Before production use, validate:

- public callback authentication;
- Gateway control API exposure and reverse-proxy deny rules;
- CORS allowlist;
- log redaction and retention;
- artifact provenance, checksum verification, and future container image provenance when images become available;
- rollback and incident response process.

GitHub Issues are best-effort for public preview feedback. Production support requires a separate agreement with the maintainers or backend provider.
