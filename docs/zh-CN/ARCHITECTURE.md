# 架构说明

`pulse-conversation-agent` 是客户自部署的实时 Conversation Agent Gateway，负责实时 AI Agent 的文本侧智能编排。

```text
客户 App/Web
  |  ZEGOCLOUD realtime SDK、字幕、状态、Action UI
  v
客户服务端
  |  鉴权、RTC Token04、运行配置、事件、action feedback
  v
Conversation Agent Gateway
  |  LLM callback、workspace、阶段指引、Skill、Hook、Action、上下文、观测
  v
ZEGOCLOUD AI Agent API / Server
  |  RTC、ASR、TTS、打断、AgentInstance 执行
```

## 责任边界

| 模块 | 责任 |
| --- | --- |
| ZEGOCLOUD AI Agent API / Server | RTC 音频、ASR、TTS 播放、打断事件、AgentInstance 执行。 |
| Pulse Conversation Agent Gateway | LLM callback、workspace runtime、阶段指引、Action/Skill 编排、动态上下文、观测。 |
| 客户服务端 | 用户鉴权、RTC Token04、Gateway 私有调用、事件转发、action feedback 转发。 |
| 客户 App/Web | ZEGOCLOUD Express SDK 集成、进房、麦克风发布、字幕/状态/action UI 展示。 |

## 设计边界

Gateway 的目标是减少客户在实时 Agent 场景中的重复建设：

- 用 workspace 文件和阶段指引拆分过长的 Agent 行为；
- 让 UI Action 协议和 LLM 上下文保持一致；
- 提供 Skill 和 Hook 机制，避免每个客户都重复搭建编排层；
- 提供延迟、action、mode、状态和错误等观测能力。

内部 prompt 组装、compact 策略、benchmark harness 和客户专属 workspace 不属于 public preview 仓库内容。

## 仓库边界

Pulse 是编译制品的对外 preview 入口。源码不包含在本 preview 中，AI 编程工具相关材料由独立的 developer-assistant 仓库维护。

| 入口 | 用途 |
| --- | --- |
| Pulse 仓库 | 评估文档、release manifest、checksum 和编译后的 preview artifact。 |
| Developer assistant 仓库 | AI 编程工具引导、skills、plugin metadata、prompt 优化和排障流程。 |
