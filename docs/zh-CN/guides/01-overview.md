# 概览

Pulse Conversation Agent 是面向实时 AI Agent 的可部署对话编排服务。

Preview 制品是compiled-runtime-only Developer Preview，以可运行服务包形式交付，不是开源仓库，也不是 npm package。它不是：

- 只服务于某个兼容 adapter 的插件
- 纯前端 SDK 或 npm library
- 替代 ZEGO AI Agent 服务端的完整媒体引擎
- benchmark 脚本集合

ZEGO AI Agent 服务端负责实时媒体和实例层：RTC 音频、ASR、TTS、打断和 AgentInstance 生命周期。Pulse Conversation Agent 负责文字侧智能层：ZEGO LLM callback、workspace/mode/skill 逻辑、动态会话上下文、action 信令和结构化日志。

主要客户部署边界是：

```text
客户 Web 或移动 Web 应用
  -> 客户自有 BFF 和 ZEGOCLOUD Express SDK
  -> 客户 BFF 申请 RTC Token04 并管理 AgentInstance lifecycle
  -> ZEGO AI Agent 服务端处理 RTC/ASR/TTS/打断
  -> ZEGO AI Agent 服务端调用 Pulse Conversation Agent 获取 LLM 文本
  -> Pulse Conversation Agent 返回 ZEGO TTS 可播报文本，并通过 HTTP、MCP 或 adapter 连接客户 Skill 系统
```

## Runtime 边界

- **Pulse Conversation Agent Gateway 服务** 接收 ZEGO AI Agent LLM 回调，运行 workspace/mode/skill/automation 逻辑，输出 ZEGO TTS 可播报文本，并交付 mode/action/perf/agent 事件。
- **ZEGO AI Agent 服务端** 继续负责 RTC、ASR、TTS、打断语义和 AgentInstance 执行。
- **客户自有 BFF 契约** 负责生成 RTC Token04，向 Web/移动端提供 AgentInstance 创建/结束/主动说话/action/events/runtime config 接口，并通过 loopback/服务端私有网络调用 Gateway private lifecycle API。
- **客户 ZEGO BFF example** 是该 BFF 契约的参考实现。gateway-owned 模式下它不拥有 Agent lifecycle，而是把创建/结束/主动说话转发给 Gateway，同时保留客户侧 RTC/TTS/ASR 配置职责。
- **Web live-call example** 是浏览器验证页。它只访问客户 BFF 和 ZEGOCLOUD Express SDK，加入 RTC，交付用户麦克风流，请求客户 BFF 创建 Agent 实例，并展示字幕、状态和信令。
- **Workspace** 承载业务行为：身份设定、mode prompt、skills、heartbeat 规则、knowledge 和运行日志。业务场景行为应该放在 workspace，不应该硬编码进 Gateway core。

## 当前 preview 验证状态

当前包线已经通过公网环境 Live E2E 验证：公网 HTTPS、Web RTC、ASR、Gateway LLM callback、LLM 回复、ZEGO TTS 播放、Web 字幕和状态展示均已跑通。具体测试机器、域名、证书路径和凭证都属于部署现场信息，不写入默认制品。

后续服务包验收也应该采用同样形态：在公网 HTTPS 环境上部署生成后的 tarball 并验证。localhost 或临时 tunnel 检查只适合作为 smoke test，不能作为最终就绪信号。

公网部署需要反代或等价路由：

- 公网 deny `/voice/agent/register`、`/voice/agent-instances` 和 `/voice/agent-instances/*`
- 其余 `/voice*` -> Pulse Conversation Agent Gateway
- `/agent*`、`/rtc*`、`/config*`、`/health` -> 客户 ZEGO 服务端
- `/` -> Web live-call 页面

Web 页面会读取 `/config/runtime` 来发现公网 Gateway/customer-service 配置。若 `/config/` 未正确反代，页面无法完成 runtime config 加载。

## Web Live Example 信号展示

Web live-call example 是试用验收界面：

- ASR 字幕遵循 ZEGO 语义：同一 round 是全量更新。
- LLM 字幕遵循 ZEGO 语义：同一 round 是增量拼接。
- 顶部状态栏展示当前 mode、当前 action、Agent 状态和最新延迟。
- AI 消息卡片可展示 TTFT、首句耗时、总耗时和 action 标签。
- 主动/手动说话命令通过客户 BFF 发送，展示应来自 ZEGO 房间/callback 语义；本地命令信号只作为调试信息。
- Raw signals 只作为调试区，必须保持边界，不影响主字幕和 recent action 布局。

## 服务包洁净度

开发者拿到的是编译可运行服务制品。解压后应通过以下命令验收：

```bash
./bin/conversation-agent check --project ./pulse-project
./bin/conversation-agent doctor --project ./pulse-project
```

服务包不能包含 TypeScript 源码、source maps、本地 `.env`、运行日志/状态、`node_modules`、内部 dev 路径、secret 或公网环境临时 IP/域名/路径。
