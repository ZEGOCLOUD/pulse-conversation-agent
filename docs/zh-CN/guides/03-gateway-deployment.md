# ZEGO Conversational Agent Service 部署

默认 beta 形态下，ZEGO Conversational Agent Service 运行在客户服务器上。Node.js Gateway 进程是服务包内的可运行入口。

部署要求：

- 面向 ZEGO AI Agent 的公网 HTTPS 回调地址
- 稳定的进程管理器或服务守护机制
- 已配置的 `conversationAgent.json`
- 已配置并包含 `workspace.json` 的默认 workspace
- 已配置的控制 token 策略
- 日志保留和脱敏策略

ZEGO AI Agent 服务端负责 RTC 音频、ASR、TTS、打断和 AgentInstance 执行。ZEGO Conversational Agent Service 负责文字侧编排层；在推荐模式下，也由它代调 ZEGO Server API 完成 Agent 注册、AgentInstance 创建/删除、在 `/voice-gateway/zego/events` 直收 ZEGO event callback，并代发主动 TTS。客户服务端保留 BFF 职责，仍然为 Web/移动端生成 RTC Token04。

## Lifecycle 模式

服务支持两种 lifecycle 模式：

- `gateway`：推荐模式。Gateway 负责 `RegisterAgent`、`UpdateAgent`、`CreateAgentInstance`、`DeleteAgentInstance`、ZEGO event callback 和主动 `SendAgentInstanceTTS`。
- `external`：兼容模式。客户服务端继续直调 ZEGO Server API，并把标准化事件转发到 Gateway `/voice-gateway/agent-events`。

`conversationAgent.zego.serverSecretRef` 只用于 gateway-owned 模式下的 ZEGO Server API 签名。不要把 Web RTC Token04 的生成迁入 Gateway。

ZEGO callback item 应包含：`ASRResult`、`LLMResult`、`Interrupted`、`UserSpeakAction`、`AgentInstanceStatus`。主动说话验收依赖 `UserSpeakAction Begin/End`，不要把 ASR 文本或 Web 本地状态当作用户是否还在说话的依据。

## AgentInstance 创建保护

Gateway-owned lifecycle 模式内置一层轻量保护：`conversationAgent.zego.lifecycleCreate` 会限制单个 Gateway 进程同时发起的 `CreateAgentInstance` 数量，并且只对明确的 ZEGO 瞬时错误码做重试。beta 默认值如下：

```json
{
  "maxConcurrent": 8,
  "retryMaxAttempts": 5,
  "retryBaseDelayMs": 300,
  "retryMaxDelayMs": 1800,
  "retryErrorCodes": [410004014]
}
```

这用于避免短时间批量进房时，把下游 AgentInstance 服务的瞬时波动直接放大成客户侧创建失败。当前 preview 示例 语音链路不启用 ZIM IM 历史同步，也不在 `CreateAgentInstance` 中传入 `MessageHistory.ZIM`。该保护不能替代 ZEGO 配额评审、多 Gateway owner routing 或客户侧流量整形。重试错误码列表应保持收窄；除非 ZEGO 明确确认操作具备幂等性，不要对超时类不确定结果做盲目重试。

## 客户 BFF 契约

浏览器/移动端只应访问客户自有 BFF 和 ZEGOCLOUD Express SDK。生产 BFF 应提供以下能力，具体路由名可按客户自己的 API 风格调整：

| 能力 | 客户 BFF 职责 | gateway-owned 模式下的 Gateway 服务端私有网络 API |
| --- | --- | --- |
| RTC token | 生成 ZEGO RTC Token04，例如 `POST /rtc/token`。 | 无 |
| 创建 AgentInstance | 校验用户/会话输入，分配 room/user/stream ID；如需按通话覆盖 ASR/TTS/VAD 等 ZEGO 参数，由服务端生成 `zegoOverrides`；调用 Gateway 服务端私有网络 API，并返回 `agentInstanceId`。 | `POST /voice/agent-instances` |
| AgentInstance 主动说话 | 按 `agentInstanceId` 鉴权并转发 speak 文本/选项。 | `POST /voice/agent-instances/{agentInstanceId}/speak` |
| 结束 AgentInstance | 按 `agentInstanceId` 鉴权并结束实例。 | `POST /voice/agent-instances/{agentInstanceId}/end` |
| 事件/信令 | 提供 customer-service SSE 或等价能力，用于 mode/action/perf/status。 | Gateway 交付runtime signals，浏览器不直接订阅。 |
| Action feedback | 接收前端 action result，并带客户侧鉴权转发给 Gateway。 | `POST /voice/action-result` |

随包的 `examples/agent-service-zego-create-agent` 是这个契约的参考 BFF 实现，不是 ZEGO Conversational Agent Service runtime 的必需组件。

preview 示例 当前 preview 推荐并仅验收单 Gateway。客户服务端可以多实例部署，但所有 AgentInstance 创建、主动说话、结束、action feedback 和 ZEGO callback 都应回到这台 Gateway。多 Gateway owner routing 不属于当前 preview 交付承诺；如果客户强需求，需要 ZEGO 单独评审、开发、压测和验收。

## ASR 热词

Gateway-owned 模式下，workspace 可以在 `asrEvidence.hotwords` 中声明高置信热词。Gateway 会在 `RegisterAgent` / `UpdateAgent` 和 `CreateAgentInstance` 时把支持的热词编译进 ZEGO `ASR.Params`。

第一版只支持腾讯 ASR 直接热词。ZEGO 的 `HotWord` 参数已废弃，腾讯热词使用 `Params.hotword_list`，格式为 `热词|权重`，多个热词用英文逗号分隔。不同 ASR 厂商的热词能力不同：火山使用外部词表 ID，阿里部分模型不支持直接热词；这些厂商在本版本中不会静默降级为腾讯格式。

`asrEvidence.hotwords` 与 ZEGO 原始 `ASR` 参数透传相互独立。`workspace.json.zegoAgent.asr`、`workspace.json.zegoAgent.createAgentInstance.ASR` 和创建通话请求里的 `zegoOverrides.ASR` 负责描述 ZEGO 原始 ASR 参数；热词策略会在这些参数合并完成后再编译到最终 `ASR.Params`。如果最终 `ASR.Vendor` 与热词策略不兼容，Gateway 会在调用 ZEGO 前失败。

## ZEGO CreateAgentInstance 覆盖参数

Gateway-owned 模式下，`workspace.json.zegoAgent.createAgentInstance` 可以声明默认 `CreateAgentInstance` payload overlay；客户 BFF 在发起通话时可以通过 `POST /voice/agent-instances` 的 `zegoOverrides` 覆盖本次通话的任意 ZEGO 字段，例如 ASR vendor、语种、TTS vendor、音色和供应商鉴权参数。合并顺序为 Gateway 基础 payload < workspace overlay < 请求级 `zegoOverrides`。字符串叶子节点支持 `env:NAME` / `secret:NAME` 引用，未解析到会返回错误且不会调用 ZEGO。

`zegoOverrides` 是服务端私有网络 BFF 能力，不能直接暴露给浏览器/移动端。浏览器/移动端只传业务选择；客户 BFF 负责把业务选择映射成受控的 ZEGO 参数。

## 公网反代

ZEGO Live E2E 至少需要以下公网 HTTPS 反代：

- 公网反代先 deny `/voice/agent/register`、`/voice/agent-instances` 和 `/voice/agent-instances/*`
- 其余 `/voice*` -> Gateway `3000`
- `/agent*`、`/rtc*`、`/config*`、`/health` -> 客户 ZEGO service `8080`
- `/` -> Web 验证页 `5188`

不要把 `/voice/agent-instances`、`/voice/agent-instances/{agentInstanceId}/speak`、`/voice/agent-instances/{agentInstanceId}/end`、`/voice/agent/register` 这类内部 lifecycle control API 当作公网浏览器接口暴露。它们只面向 loopback/服务端私有网络 BFF 或 CLI。如果公网 nginx 把全部 `/voice*` 反代给 Gateway，Gateway 会看到来自本机的请求，因此必须保留 `docs/deployment/nginx.conversation-agent.conf.template` 里的 deny 规则。

`/config/` 是 Web 页面读取 runtime config 的入口，漏配后页面会显示 `runtime config failed`。参考模板见 `docs/deployment/nginx.conversation-agent.conf.template`，公网环境步骤见 `13-cloud-live-e2e-deployment.md`。

## Runtime 配置

Runtime 配置以 JSON 为主：

- `CONVERSATION_AGENT_CONFIG` 指向 `conversationAgent.json`；默认是 `./conversationAgent.json`。
- `conversationAgent.json` 管 Gateway 监听地址、公网回调地址、LLM endpoint、模型名、安全、观测和 runtime 策略。
- `workspace.json` 管初始 mode、Skills、memory 阈值、heartbeat 和 hooks。
- 旧 env 只保留一个版本的 fallback；Gateway 使用旧 env 时会打印 deprecated warning。

常见迁移映射：

| 旧 env | 新位置 |
| --- | --- |
| `BAILIAN_BASE_URL` | `conversationAgent.llm.baseUrl` |
| `BAILIAN_API_KEY` | `conversationAgent.llm.apiKeyRef` |
| `SLC_MODEL` | `conversationAgent.llm.models.slc` |
| `SLE_MODEL`, `BAILIAN_MODEL` | `conversationAgent.llm.models.sle` |
| `VOICE_GATEWAY_MODE` | `conversationAgent.runtime.mode` |
| `VOICE_GATEWAY_ARCH_INTENT` | `conversationAgent.runtime.arch.intent` |
| `VOICE_GATEWAY_ARCH_FUNC` | `conversationAgent.runtime.arch.functionInvocation` |
| `VOICE_GATEWAY_SLC_API_MODE` | `conversationAgent.runtime.slc.apiMode` |
| `VOICE_GATEWAY_CONTEXT_CACHE_MODE` | `conversationAgent.runtime.slc.contextCacheMode` |
| 客户服务端 bridge URL | `conversationAgent.runtime.customerService.baseUrl` |
| `DISABLED_SKILLS` | `workspace.skills.disabled` |
| `VOICE_GATEWAY_HEARTBEAT_*` | `workspace.automation.heartbeat.*` |
| `VOICE_GATEWAY_PROACTIVE_*_HOOK_*` | `workspace.automation.hooks.*` |

从旧环境变量迁移时，请按上表手动更新 `conversationAgent.json` 和当前选择的 `workspace.json`。

容器、Kubernetes、systemd 等基础设施清单与试用环境强相关，preview 服务包不再单独交付独立部署清单目录。
