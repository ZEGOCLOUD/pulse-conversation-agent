# Workspace And Stage Guidance

Workspaces define business behavior without changing Gateway runtime code. `modes/*.md` is the source of truth for each mode; `workspace.json` assembles the workspace with an initial mode, optional deterministic transitions, action contracts, Skills, local knowledge, heartbeat policy, and observability output.

## What To Configure

- Identity and behavior files describe who the Agent is and how it should speak.
- Mode guidance splits a long prompt into scenario-specific behavior blocks. Put each mode's `name`, `description`, `knowledge.required`, `knowledge.include`, and `knowledge.rag` in that mode's Markdown frontmatter.
- Local knowledge provides low-latency facts for the current scenario.
- Optional `workspace.json.modes.transitions` provides deterministic cross-mode routing. If no transition matches, the AI can still switch modes from mode descriptions and prompts.
- Action definitions describe UI or business events the Agent can request.
- Skills connect external systems without hard-coding business logic into the Gateway.

## Why Stages Matter

Realtime Agents often fail when one giant prompt tries to cover every phase of an interaction. Stage guidance keeps the active instruction set smaller and easier to follow, which helps latency, cost, and instruction adherence.

## Recommended Review

For each workspace, confirm:

- the default stage is correct;
- stage descriptions are mutually clear;
- required knowledge and RAG mounts are declared in mode frontmatter, not duplicated in `workspace.json`;
- optional transitions use JavaScript regex sources with `match` and `exclude` arrays;
- each stage exposes only the Actions and Skills it needs;
- fallback behavior is defined for unknown user intent or missing knowledge;
- stage switching is validated in text scenarios before Live E2E.

Example deterministic route:

```json
{
  "modes": {
    "initial": "small_talk",
    "transitions": [
      {
        "id": "route-support-to-cs-help",
        "from": ["small_talk", "play_warmup"],
        "to": "support",
        "priority": 100,
        "match": ["\\b(recharge|refund|account|login)\\b"],
        "exclude": ["play|game|watch movie"]
      }
    ]
  }
}
```

Regex patterns are JavaScript regex sources, not `/.../i` literals. Runtime matching trims input, applies NFKC normalization, collapses whitespace, and uses implicit `iu` flags.
