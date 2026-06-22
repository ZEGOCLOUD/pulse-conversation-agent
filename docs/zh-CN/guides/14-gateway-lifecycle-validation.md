# Gateway 托管 Lifecycle 验证

本页用于帮助开发者理解 gateway-owned lifecycle 模式下应该验证什么。它不是 GA/SLA 认证，也不是内部发布流程；客户试用前可以把它作为接入自检清单。

## 验证目标

- 客户可见唯一会话 ID 是 `agentInstanceId`。
- Gateway 负责 `RegisterAgent`、`CreateAgentInstance`、`DeleteAgentInstance`、主动 TTS、ZEGO event callback、LLM callback 和 workspace context 注入。
- Customer service 是 BFF：生成 RTC Token04，转发 Web/移动端 create/end/action/speak 请求，并提供 `/events`。
- Web 只对接 BFF 和 ZEGOCLOUD Express SDK，不持有 Gateway control token，不直连 Gateway 私有控制 API。
- 多 Gateway 场景需要 owner routing：LLM callback 和 ZEGO event callback 都必须路由到创建该 `agentInstanceId` 的 Gateway node。当前 preview 不默认承诺多 Gateway HA。
- 可靠性和性能建议按 latency、traffic、errors、saturation 四类信号记录。

## 本地自检

```bash
./bin/conversation-agent check --project ./pulse-project
./bin/conversation-agent start all --project ./pulse-project --daemon
./bin/conversation-agent status --project ./pulse-project
./bin/conversation-agent doctor --project ./pulse-project
```

## P0 阻断项

- Web 或移动端需要直接访问 Gateway control API 才能完成通话。
- `/voice/agent-instances*`、`/voice/agent/register`、`speak/end` 等私有生命周期 API 被公网直接暴露。
- `/config/runtime`、服务包、日志泄露 ServerSecret、Gateway control token、bridge secret 或 `.env` 原文。
- RTC Token04 生成职责迁入 Gateway，导致浏览器侧或 Gateway 侧职责混乱。
- 同一用户双开、不同 room、不同 workspace 下事件、action、perf、transcript 串 session。
- Unknown LLM callback 或 ZEGO event callback 进入业务处理、创建本地 session 或产生 AI 回复。

## 功能完整性

- `POST /voice/agent-instances` 必须要求 `roomId`，成功只返回 `agentInstanceId` 和必要公开字段。
- 缺失或空 `workspaceId` 使用配置中的默认 workspace；非空但未知的 `workspaceId` 必须返回清晰错误，且不得调用 ZEGO 创建实例。
- `action feedback` 必须绑定 `actionInstanceId`，重复 feedback、过期 feedback 和未知 action 都应可定位且不串会话。
- 主动说话应走服务端私有接口，再由 Gateway 调 ZEGO TTS，不应由浏览器直接调用 Gateway。
- Gateway callback、customer service SSE、Web UI 显示的 `agentInstanceId`、`roomId`、`workspaceId` 应一致。

## 性能与稳定性观察

- 记录 create/end/speak/callback/LLM/TTS 路径的 p50、p95、p99、错误率和资源占用。
- 关注 active AgentInstance 数量、RSS、CPU、fd、事件循环延迟、日志增长。
- 并发或长会话验证期间，不应出现进程崩溃、内存无界上涨、session/action/context 串线。

## 客户试用结论

客户试用前至少应完成：本地 check/doctor、Level 2.5 live smoke、公网 HTTPS Live E2E、ACTION KV + feedback、主动说话、多 workspace 隔离，以及服务包泄漏扫描。
