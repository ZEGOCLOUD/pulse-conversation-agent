# Pulse Conversation Agent

语言：简体中文 | [English](README.md)

`pulse-conversation-agent` 是一个用于构建实时互动 Conversation Agent 的 Developer Preview Gateway。它以编译后的运行制品和客户可读文档的形式分发，不是开源源码项目，也不是托管服务或生产 SLA 产品。

它用于帮助客户自部署一个实时 Agent 编排服务：处理 LLM callback、workspace、阶段人设指引、UI Action、Skill、Hook、动态上下文和观测。当前 preview 对接 ZEGOCLOUD AI Agent APIs，由其负责 RTC、ASR、TTS、打断和 AgentInstance 执行。

本仓库是 runtime 制品的对外 preview 入口。源码不包含在本 preview 中；Codex/Cursor/Claude Code 等 AI 编程工具使用的 developer-assistant 仓库也保持独立。

## 包含内容

- 编译后的 Conversation Agent Gateway runtime。
- 可编辑的默认 workspace。
- 参考客户服务端，用于 RTC Token、AgentInstance 生命周期、事件和 action feedback。
- Web 验证页面，用于 RTC 进房、字幕、mode/status 展示和 Action UI 测试。
- 面向 public preview 的架构、部署、安全和生产评估文档。

## 仓库结构

本仓库保持较小的可浏览面。运行入口、setup 辅助脚本、workspace 模板、契约和配置示例不在仓库一级目录展开，而是放在 GitHub Release artifact 中。

| 路径 | 用途 |
| --- | --- |
| `docs/` | 部署、客户交付、Level 2.5 验证、架构和生产评估说明。 |
| `artifacts/` | preview `.tgz` 与 checksum 镜像；客户下载仍建议优先使用 GitHub Release 页面。 |
| `artifact-manifest.json`, `validation-evidence.json` | 版本、checksum、支持边界和验证证据状态。 |

下载后的 `.tgz` 才包含可运行服务包：`bin/`、`setup/`、`workspaces/`、`contract.json`、`openapi.yaml`、`conversationAgent.example.json`、验证示例、docs 和编译后的 runtime。仓库根目录不会展开这些目录，避免评审方把仓库浏览页误解为完整生成项目。

## Preview 边界

本项目用于评估和集成验证。生产使用前，客户需要自行完成稳定性、安全和合规验证。该 preview 仓库默认不包含 SLA。生产支持、冻结版本、回滚策略和故障响应需要通过单独商务或试点协议确认。

不要把客户密钥放进本仓库或服务包目录。请把密钥放在客户自己的部署密钥系统，或由 setup 生成的项目 `.env.local` 文件中。

## 仓库关系

| 仓库 / 制品 | 角色 |
| --- | --- |
| `pulse-conversation-agent` | 所有人可看的 preview 仓库，包含文档、manifest、checksum 和编译后的 preview 制品。 |
| `conversation-agent-dev-assistant` | 面向 AI 编程工具的辅助仓库，指导安装、验收、prompt 优化和排障，但不包含 runtime 制品或闭源源码。 |

## 最快体验

从 GitHub Release 安装最新 Developer Preview：

```bash
node scripts/install-latest.mjs --channel preview --install-dir ./pulse
```

然后从 managed `current` 服务包运行本地检查流程：

```bash
./pulse/current/bin/conversation-agent setup --project ./pulse-project
./pulse/current/bin/conversation-agent check --project ./pulse-project
./pulse/current/bin/conversation-agent start all --project ./pulse-project --daemon
./pulse/current/bin/conversation-agent doctor --project ./pulse-project
```

容器镜像已规划，但不包含在当前 preview 中。当前 developer preview 请使用上面的 GitHub Release artifact-first CLI 路径。

如果需要锁定某个版本用于回滚或排障，可以手动下载指定 GitHub Release artifact，并先校验 `.sha256` 再解压。

## 运行边界

| 模块 | 负责内容 |
| --- | --- |
| ZEGOCLOUD AI Agent API / Server | RTC 音频、ASR、TTS 播放、打断事件、AgentInstance 执行。 |
| Pulse Conversation Agent Gateway | LLM callback、workspace 运行、阶段人设指引、Action 与 Skill 编排、会话上下文、观测、可选的 Gateway 托管 AgentInstance 生命周期。 |
| 客户服务端 | 用户鉴权、RTC Token04、App/Web API、运行配置、事件转发、Gateway 私有生命周期调用、action feedback 转发。 |
| 客户 App/Web | ZEGOCLOUD Express SDK、进房、麦克风发布、字幕/状态/action UI 展示，并通过客户服务端回传 action 结果。 |

浏览器或移动端不应直接持有 Gateway control token，也不应直接调用 Gateway 私有控制 API。

## 文档

- [架构说明](docs/zh-CN/ARCHITECTURE.md)
- [部署说明](docs/zh-CN/DEPLOYMENT.md)
- [客户交付说明](docs/zh-CN/CUSTOMER_HANDOFF.md)
- [Level 2.5 验证矩阵](docs/zh-CN/LEVEL_2_5_VALIDATION_MATRIX.md)
- [生产评估清单](docs/zh-CN/PRODUCTION_CHECKLIST.md)
- [中文开发者指南（01-14 清洗版）](docs/zh-CN/guides/README.md)
- [验证证据状态](validation-evidence.json)
- [英文架构说明](docs/en/ARCHITECTURE.md)
- [英文部署说明](docs/en/DEPLOYMENT.md)
- [安全说明](SECURITY.md)

## AI 编程助手

Codex、Cursor、Claude Code 等工具建议配合下面的辅助仓库使用：

```text
https://github.com/ZEGOCLOUD/conversation-agent-dev-assistant
```

让 AI 工具阅读 `AI_INSTALL.md` 和 `AGENTS.md`，再安装本 preview 制品；遇到密钥输入时，不要把密钥粘贴到聊天里。

建议的第一条 prompt：

```text
请使用 conversation-agent-dev-assistant 仓库，从 GitHub Release artifact 安装最新版 Pulse Conversation Agent Developer Preview。不要让我把密钥粘贴到聊天里；请完成 setup/check/doctor，并指导 Level 2.5 live smoke 验证。如果本地已经安装过服务包，请先运行 conversation-agent upgrade --check，并遵循 artifact-manifest.json 里的 upgradePolicy。
```

## 版本

- Preview channel：默认使用最新 prerelease
- 当前仓库镜像 artifact：`pulse-conversation-agent-gateway-v0.1.0-preview.19.tgz`
- Container image：已规划，当前 preview 不包含
