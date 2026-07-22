# Web 客户端接入

beta Web example helper 使用两条通道：

- ZEGO Express AI Agent optimized callback 负责 RTC 字幕和说话状态。
- 客户服务端 SSE 负责 mode 更新、action 信令、性能报告和业务 UI action。

客户端辅助能力：

- `startCall()` 通过客户服务端/BFF 创建 AgentInstance，并接收 RTC Token04 和 AgentInstance 信息。gateway lifecycle 模式下，BFF 会调用 Gateway `/voice/agent-instances`。
- `listWorkspaces()` 通过客户服务端/BFF 读取可展示的 workspace 选项。
- `updateSessionContext()` 在 AgentInstance 创建后，通过客户服务端/BFF 更新动态 session context。
- `endCall()` 通过客户服务端结束 Agent 实例。
- `speak()` 通过客户服务端/BFF 请求 Gateway 主动 TTS；浏览器不直接调用 Gateway lifecycle control API。
- `consumeZegoExperimentalApi()` 解析 `onRecvExperimentalAPI` 或 `onRecvRoomChannelMessage`。
- `submitActionResult()` 通过客户服务端 action-result 代理，使用 `actionInstanceId` 和开发者撰写的 `resultDescription` 上报前端 action 结果。
- `onTranscript()` 接收按 `SeqId` 排序的 `Cmd=3` ASR 文本和 `Cmd=4` LLM 增量文本。
- `onStatus()` 接收 `Cmd=6` 智能体状态：idle、listening、thinking、speaking。
- `onMode()`、`onAction()`、`onPerf()` 消费客户服务端 SSE 信令。

ZEGO Conversational Agent Service 不应要求接入方理解兼容 adapter 概念，也不能在浏览器端创建 ZEGO 凭证。
Web/移动端只应访问客户 BFF 和 ZEGOCLOUD Express SDK：

| 浏览器/移动端需要 | example 展示的客户 BFF API 形态 |
| --- | --- |
| Runtime config | `GET /config/runtime` |
| Workspace 选项 | `GET /agent/workspaces` |
| RTC Token04 | `POST /rtc/token` |
| 创建 AgentInstance | `POST /agent/instances` |
| 更新 session context | `PUT /agent/instances/{agentInstanceId}/context` |
| 结束 AgentInstance | `POST /agent/instances/{agentInstanceId}/end` |
| 主动/手动说话 | `POST /agent/instances/{agentInstanceId}/speak` |
| Action feedback | `POST /agent/action-result` |
| mode/action/perf/status 事件 | `GET /events` |

这些都是客户自有 BFF 路由。`examples/agent-service-zego-create-agent` 提供参考实现，生产客户可以保留自己的路由名，但职责必须仍在 BFF 侧。RTC Token04 留在 BFF，Gateway private lifecycle 路由只用于服务端到服务端调用。
AI 字幕气泡应来自 ZEGO 房间/callback 语义（`Cmd=3` ASR、`Cmd=4` LLM），不能从 bridge command 事件合成。

Web live-call 示例支持 Start 前选择 workspace、Start 前后编辑动态业务 context，并展示当前浏览器会话的完整 transcript。收到任意 `action_signal` 都会打开通用 action result 对话框。可以选择默认结果描述、按需编辑后点击“完成”提交反馈；展示型 action 点击“不需要反馈”即可。提交后的结果会和 Gateway 返回的 observation 一起展示在 Actions & Observations 面板中。
