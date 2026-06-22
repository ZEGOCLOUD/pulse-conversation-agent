# Agent Workspace

Workspace 文件用于定义 Agent 的业务行为，不需要修改 Gateway 代码。`workspace.json` 是 beta 公开契约中的项目级配置入口。

核心文件：

- `workspace.json`：workspace 名称、初始 mode、前端 ACTION 契约、Skill 启停、memory 阈值和 automation 策略
- `IDENTITY.md`：Agent 是谁，以及如何说话
- `SOUL.md`：全局目标、行为和安全边界
- `USER.md`：可选用户上下文
- `HEARTBEAT.md`：上下文感知 heartbeat automation 的策略文本
- `modes/`：分阶段行为和 mode 切换条件
- `skills/`：外部业务能力
- `knowledge/`：项目知识文件
- `logs/`：Gateway 生成的运行数据。`logs/gateway/` 是可观测日志；`logs/state/` 是可恢复运行状态。
- `memory/`：会影响后续对话的记忆数据。

preview 服务包不暴露这些文件和目录的路径配置。请保持默认命名，以便模板、文档和后续 runtime loader 对齐。

`workspace.json` 公开字段：

- `modes.initial`：初始 mode。详细规则和切换条件仍放在 `modes/*.md`。
- `modes.definitions.<mode>.knowledge.required`：是否要求该 mode 的事实类知识回答必须基于本地 knowledge 或已挂载 RAG Skill 结果。默认 `false`。
- `actions.definitions`：机器可读的前端 ACTION 契约。这里定义 action 名称、参数 schema、必填参数、枚举值和 `ttsPolicy`。Mode prompt 只描述什么时候触发 action，不重新定义机器契约。
- `skills.enabled` / `skills.disabled`：workspace 级 Skill 启停控制。
- `memory.recentTurns` / `memory.compactTriggerTokens`：prompt history 和压缩阈值。
- `asrEvidence.hotwords`：gateway-owned lifecycle 下的 ASR 热词策略。它是独立策略层，不是 ZEGO 原始 `ASR` 透传字段。第一版只把腾讯高置信热词编译为 `ASR.Params.hotword_list`，并可选择作用于 `RegisterAgent`、`CreateAgentInstance` 或两者。
- `zegoAgent`：gateway-owned lifecycle 下的 ZEGO Agent profile。`asr`、`tts`、`vad`、`callbackConfig` 使用 ZEGO Server API 原始对象结构；`createAgentInstance` 是默认透传到 `CreateAgentInstance` 的原始 payload overlay。
- `automation.heartbeat`：定时的上下文感知主动说话决策。
- `automation.hooks.idle` 和 `automation.hooks.events`：automation 事件的外部 hook 回调。

ZEGO AppID、ZEGO ServerSecret 和 Web RTC Token04 不属于 `workspace.json`。在 gateway-owned lifecycle 模式下，`workspace.json.zegoAgent` 可以声明 Agent profile，`asrEvidence.hotwords` 可以声明高置信 ASR 热词；Gateway 会在调用 ZEGO Server API 时编译这些配置。

## ZEGO 原始参数透传

`zegoAgent.asr`、`zegoAgent.tts`、`zegoAgent.vad`、`zegoAgent.callbackConfig` 和 `zegoAgent.createAgentInstance` 都尽量沿用 ZEGO Server API 原始字段名，便于跟随 ZEGO `RegisterAgent` / `CreateAgentInstance` 文档升级。字符串叶子节点可以写 `env:NAME` 或 `secret:NAME`，Gateway 会在调用 ZEGO 前从环境变量解析，避免把 TTS/ASR/LLM 供应商 key 明文写进 workspace。

发起通话时，客户 BFF 可以通过 Gateway 服务端私有网络 API `POST /voice/agent-instances` 的 `zegoOverrides` 覆盖本次通话的任意 ZEGO `CreateAgentInstance` 字段。合并顺序是：Gateway 生成的基础 payload < `workspace.json` 的 `zegoAgent.createAgentInstance` < 请求体 `zegoOverrides`。`zegoOverrides` 只应由客户服务端生成，不应直接暴露给浏览器或移动端。

注意：`asrEvidence.hotwords` 仍然是独立策略层。Gateway 会先完成 ZEGO 原始 `ASR` 的 workspace/request 透传合并，再按 `applyTo` 把支持的热词编译进最终 `ASR.Params`。如果本次通话把 `ASR.Vendor` 覆盖为非腾讯，而热词策略仍要求注入腾讯热词，Gateway 会明确报 vendor mismatch，避免静默生成错误参数。

腾讯 ASR 热词示例：

```json
{
  "asrEvidence": {
    "enabled": true,
    "mode": "shadow",
    "hotwords": {
      "enabled": true,
      "vendor": "Tencent",
      "applyTo": ["register_agent", "create_agent_instance"],
      "minConfidence": 0.98,
      "tencent": {
        "engineModelType": "16k_zh",
        "maxTerms": 128,
        "defaultWeight": 8
      },
      "terms": [
        { "word": "preview 示例", "weight": 8, "confidence": 1, "source": "manual" },
        { "word": "麦位", "weight": 8, "confidence": 1, "source": "manual" },
        { "word": "示例玩法", "weight": 8, "confidence": 0.98, "source": "asr_evidence_approved" }
      ]
    }
  }
}
```

Mode frontmatter 可以按模式限定知识访问：

```yaml
---
name: support
description: 客服支持模式
knowledge:
  include:
    - support_faq
  rag:
    - skill: rag_query
      description: 当本地 knowledge 不足时，查询客户自有客服文档。
---
```

`include` 引用本地 `knowledge/*.json` 文件。`rag` 引用 workspace Skill；底层 RAG 服务如何选择和查询知识库，由客户自己决定。

如果某个 mode 在 `workspace.json` 中配置了 `knowledge.required: true`，本地 knowledge 没命中且没有可复用的 active RAG 时，Gateway 会走标准 Skill 流程查询该 mode 挂载的 RAG Skill。RAG Skill 仍只接收 `{ "query": "..." }`，不要求 workspace 暴露知识库 ID 或检索参数。

## 会话用户上下文

`USER.md` 是 workspace 的静态默认用户画像。会话上下文是可选能力，默认不注入。针对不同用户、不同会话的个性化信息和业务状态，不需要生成多份 `USER.md`，而是在客户服务端创建 ZEGO Agent 实例或更新 Gateway session context 时显式传入客户自己渲染好的 Markdown。

参考客户服务端的 `POST /agent/instances` 继续支持兼容字段 `userContextMarkdown`，并新增结构化上下文字段：

```json
{
  "userId": "u_10086",
  "roomId": "room_abc",
  "sessionProfileMarkdown": "## 用户画像\n- 称呼：小陈\n- 用户类型：VIP\n- 偏好：喜欢直接、轻松的表达",
  "runtimeStateMarkdown": "- room=pk_01\n- mic=on\n- gift_panel=closed",
  "recentObservationsMarkdown": "- ACTION POPUP_TAKE_MIC completed at 12:01",
  "decisionStateMarkdown": "- satisfied_requests: take_mic\n- final_action_policy=NO_ACTION_THIS_TURN"
}
```

gateway lifecycle 模式下，客户 BFF 会在创建 AgentInstance 时把这些 Markdown 传给 Gateway `/voice/agent-instances`。Gateway 只绑定当前 `agentInstanceId` 会话。`sessionProfileMarkdown` 会放在 mode prompt 前的稳定上下文区，`runtimeStateMarkdown`、`recentObservationsMarkdown`、`decisionStateMarkdown` 会放在靠近当前用户输入的位置。external lifecycle 兼容模式下，客户服务端仍可在 `CreateAgentInstance` 成功后通过 Gateway session context control API 写入同样字段。Gateway 不做模板替换，也不会修改 `USER.md`。

这些字段应由客户服务端生成和传入，不建议让浏览器用户直接提交原始 prompt 文本。单字段上限为 8192 字符，Gateway 也会限制动态上下文总量；传空字符串表示清空对应层。如果 `decisionStateMarkdown` 包含 `final_action_policy=NO_ACTION_THIS_TURN`，Gateway 会在该轮压制 `[ACTION:...]` 标签，但保留正常回复文本。

## 运行数据目录

运行数据默认放在 workspace 内部：

```text
workspaces/<workspace>/
├── logs/
│   ├── gateway/
│   │   ├── conversation.jsonl
│   │   ├── perf.jsonl
│   │   └── error.jsonl
│   └── state/
│       ├── canvas/
│       ├── modes/
│       ├── sessions/
│       └── skills/
└── memory/
    ├── conversations/
    └── compact-summaries.jsonl
```

生命周期：

| 目录 | 是否影响后续对话 | 生产是否持久化 | 是否可安全清理 |
| --- | --- | --- | --- |
| `logs/gateway/` | 否 | 可选，按保留期策略 | 可以，超过保留期后清理 |
| `logs/state/canvas/` | 是，影响活跃任务和恢复 | 建议 | 清理会丢失 task/canvas 恢复能力 |
| `logs/state/modes/` | 是，影响当前 mode 和切换历史 | 建议 | 清理会重置 mode 状态 |
| `logs/state/sessions/` | 是，影响活跃会话状态 | 语音会话建议持久化 | 清理会丢失会话/说话状态 |
| `logs/state/skills/` | 是，影响异步 Skill 结果状态 | 启用异步 Skill 时建议 | 清理会丢失 pending Skill 状态 |
| `memory/` | 是 | 启用记忆时必须 | 只能按明确的数据保留策略清理 |

`logs/gateway/conversation.jsonl` 由 `observability.logs.info` 和 `--log-info` 控制。它包含详细对话记录和 action，生产默认关闭。

preview 服务包不把 ASR evidence/hotword 存储或 artifacts 存储作为公开 workspace 目录。客户 Skill 生成的业务文件建议保存在客户自有系统中，Gateway 只记录结果 ID、URL 或摘要。
