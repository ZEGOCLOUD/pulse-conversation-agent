# Pulse Conversation Agent

语言：简体中文 | [English](README.md)

`pulse-conversation-agent` 是一个用于构建实时互动 Conversation Agent 的 Developer Preview Gateway。它以编译后的运行制品和客户接入示例的形式分发，不是开源源码项目，也不是托管服务或生产 SLA 产品。

它用于帮助客户自部署一个实时 Agent 编排服务：处理 LLM callback、workspace、阶段人设指引、UI Action、Skill、Hook、动态上下文和观测。当前 preview 对接 ZEGOCLOUD AI Agent APIs，由其负责 RTC、ASR、TTS、打断和 AgentInstance 执行。

本仓库是 runtime 制品的对外 preview 入口，和内部源码仓、Codex/Cursor/Claude Code 等 AI 编程工具使用的 developer-assistant 仓库保持分离。

## 包含内容

- 编译后的 Conversation Agent Gateway runtime。
- 可编辑的默认 workspace。
- 参考客户服务端，用于 RTC Token、AgentInstance 生命周期、事件和 action feedback。
- Web 验证页面，用于 RTC 进房、字幕、mode/status 展示和 Action UI 测试。
- 面向 public preview 的架构、部署、安全和生产评估文档。

## Preview 边界

本项目用于评估和集成验证。生产使用前，客户需要自行完成稳定性、安全和合规验证。该 preview 仓库默认不包含 SLA。生产支持、冻结版本、回滚策略和故障响应需要通过单独商务或试点协议确认。

不要把客户密钥放进本仓库或服务包目录。请把密钥放在客户自己的部署密钥系统，或由 setup 生成的项目 `.env.local` 文件中。

## 仓库关系

| 仓库 / 制品 | 角色 |
| --- | --- |
| `pulse-conversation-agent` | 所有人可看的 preview 仓库，包含文档、manifest、checksum 和编译后的 preview 制品。 |
| `conversation-agent-dev-assistant` | 面向 AI 编程工具的辅助仓库，指导安装、验收、prompt 优化和排障，但不包含 runtime 制品或闭源源码。 |
| 内部源码仓 | 闭源源码和 release governance 仓库，负责生成本 preview 制品，不随 preview 发布。 |
| 客户专属 `.tgz` 制品 | 私有客户交付包，可包含客户 workspace 和文档，明确排除在 Pulse 之外。 |

## 最快体验

```bash
tar -xzf artifacts/pulse-conversation-agent-gateway-v0.1.0-preview.21.tgz
cd pulse-conversation-agent-gateway-v0.1.0-preview.21
./bin/conversation-agent setup --project ./ca3-project
./bin/conversation-agent check --project ./ca3-project
./bin/conversation-agent start all --project ./ca3-project --daemon
./bin/conversation-agent doctor --project ./ca3-project
```

容器镜像已规划，但不包含在当前 preview 中。当前 private review build 请使用上面的 artifact-first CLI 路径。

## 运行边界

| 模块 | 负责内容 |
| --- | --- |
| ZEGOCLOUD AI Agent API / Server | RTC 音频、ASR、TTS 播放、打断事件、AgentInstance 执行。 |
| Pulse Conversation Agent Gateway | LLM callback、workspace 运行、阶段人设指引、Action 与 Skill 编排、会话上下文、观测、可选的 Gateway 托管 AgentInstance 生命周期。 |
| 客户服务端 | 用户鉴权、RTC Token04、App/Web API、运行配置、事件转发、Gateway 私有生命周期调用、action feedback 转发。 |
| 客户 App/Web | ZEGOCLOUD Express SDK、进房、麦克风发布、字幕/状态/action UI 展示，并通过客户服务端回传 action 结果。 |

浏览器或移动端不应直接持有 Gateway control token，也不应直接调用 Gateway 私有控制 API。

## 文档

- [架构说明](docs/ARCHITECTURE.md)
- [部署说明](docs/DEPLOYMENT.md)
- [客户交付说明](docs/CUSTOMER_HANDOFF.md)
- [生产评估清单](docs/PRODUCTION_CHECKLIST.md)
- [安全说明](SECURITY.md)

## AI 编程助手

Codex、Cursor、Claude Code 等工具建议配合下面的辅助仓库使用：

```text
https://github.com/Cogit-oergo-sum/conversation-agent-dev-assistant
```

让 AI 工具阅读 `AI_INSTALL.md` 和 `AGENTS.md`，再安装本 preview 制品；遇到密钥输入时，不要把密钥粘贴到聊天里。

## 版本

- Preview version：`0.1.0-preview.21`
- Artifact：`pulse-conversation-agent-gateway-v0.1.0-preview.21.tgz`
- Container image：已规划，当前 preview 不包含
