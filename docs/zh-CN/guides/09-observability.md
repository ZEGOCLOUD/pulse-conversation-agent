# 可观测性

Gateway 输出三类结构化 JSONL 日志：

- `conversation.jsonl`：详细对话审计，包含请求 messages、LLM 回复、action、model、scenario、`agentInstanceId` 或 session ID 和请求耗时。它由 `observability.logs.info` 控制，生产默认关闭，开发和验收排障时再开启。
- `perf.jsonl`：性能数据，包含 token 消耗、TTFT、首句耗时、Gateway 路由耗时，以及可用的模块/任务耗时。
- `error.jsonl`：只记录失败的 LLM 或 callback 请求，并包含是否可重试的提示。

生产默认建议只开启 `perf.jsonl` 和 `error.jsonl`。`conversation.jsonl` 可能包含用户输入、workspace prompt、业务上下文、action 和 LLM 输出，应被视为敏感日志。

在 `conversationAgent.json` 中配置：

```json
{
  "observability": {
    "logLevel": "info",
    "redactSecrets": true,
    "logs": {
      "enabled": true,
      "dir": "./workspaces/default-service-assistant/logs/gateway",
      "info": false,
      "perf": true,
      "error": true
    }
  }
}
```

开发或验收时，如果需要复盘完整 messages，可以通过 CLI 参数临时覆盖 JSON 配置：

```bash
npm start -- --log-level info --log-dir ./logs/gateway --log-info true --log-perf true --log-error true
```

## 日志级别

`logs.info` 写入 `conversation.jsonl`，`logs.perf` 写入 `perf.jsonl`，`logs.error` 写入 `error.jsonl`；`logLevel` 决定单条日志和控制台输出的详细程度。

- `debug`：开发排障级别，可记录更细的阶段信息、prompt 组装摘要、skill 输入输出摘要。
- `info`：标准运行级别，记录运行摘要、性能和错误。
- `warn`：只关注慢请求、降级路径和可恢复异常。
- `error`：只关注失败请求。

## 建议字段

排障和 benchmark 经验表明，除了基础 LLM 请求信息，还应尽量保留以下结构化字段：

- `requestId` / `roundId` / `agentInstanceId`：定位单次请求、一轮对话和 ZEGO AgentInstance 会话。
- `sessionId` / `userId`：按会话或用户排查，生产中建议匿名化用户标识。
- `workspaceId` / `workspaceRoot`：定位生效的 workspace。
- `source`：例如 `zego_callback`、`text_chat`、`heartbeat`、`idle_hook` 或 `dev_test`。
- `modeBefore` / `modeAfter` / `modeChanged`：定位 mode 切换问题。
- `actions`：本轮触发的 action 标签。
- `statusReason`：例如 `chat_status_error`，用于定位状态异常。
- `ttftMs` / `firstSentenceMs` / `totalMs`：首 token、首句和总耗时。
- `inputTokens` / `outputTokens` / `totalTokens`：token 消耗。
- `cachedTokens` / `cacheCreationInputTokens` / `cacheMode` / `cacheMarkers`：定位上下文缓存和 TTFT。
- `skillTimings` / `taskTimings`：Skill、action 或任务处理耗时。
- `bridgeCommand`：主动说话时输出的 `speak.tts` / `speak.llm` 命令和发送结果。
- `error.retryable` / `error.status` / `error.providerCode`：错误归因和重试判断。

Benchmark 的 pass/fail gate 结果应保留在 benchmark report 中，不建议直接写入 Gateway runtime 日志。Gateway 日志负责提供可复盘的原始运行信号。

生产环境应保持 `redactSecrets` 开启；日志属于运行产物，不进入干净服务包。
