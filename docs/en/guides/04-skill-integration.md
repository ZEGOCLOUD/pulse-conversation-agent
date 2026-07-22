# Skill Integration

Skills connect ZEGO Conversational Agent to external tools, retrieval systems, business APIs, or other Agent runtimes. The goal is to keep business capability integration outside the Gateway core while giving the Agent a stable way to request and consume results.

## Recommended Pattern

- Define the Skill purpose in the workspace.
- Expose the backing system through HTTP, MCP, or a customer-owned adapter.
- Normalize the result into a concise response the Agent can use.
- Keep credentials and business records inside the customer environment.

## Realtime Considerations

Long-running Skills should not block the first spoken response. Use stage guidance and fallback copy so the Agent can acknowledge the request quickly, then summarize the Skill result when it arrives.

## Failure Handling

Plan for timeout, empty result, partial result, permission failure, and provider errors. The Agent should be able to explain the limitation without leaking raw exceptions or internal payloads.
