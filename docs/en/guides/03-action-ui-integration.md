# Action UI Integration

Actions let the Agent coordinate with product UI and customer business systems. The browser or mobile app displays the Action, the customer service receives user or business feedback, and the Gateway injects the result back into Agent context.

## Integration Boundary

- Customer App/Web renders Action UI and submits action results through the customer service.
- Customer service authenticates the user and relays action feedback to the Gateway.
- Pulse Gateway keeps Action protocol and Agent context aligned.
- Browser and mobile clients must not hold Gateway control tokens.

## Action Result Guidance

Use concise, human-readable result descriptions. The result description is what the Agent can use in later responses; private payloads should stay in the customer service unless they are safe to expose to the model.

## Validation Checklist

- The intended prompt produces one Action, not repeated Actions.
- Raw protocol text is not spoken by TTS.
- User feedback changes the next Agent response.
- A rejected or failed Action has a safe conversational fallback.
