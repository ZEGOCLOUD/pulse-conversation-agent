# 外部 Agent / 工具适配

外部 Agent 或工具系统应该作为 Skill、Capability 或 MCP/HTTP adapter 接入，而不是改变 Pulse Conversation Agent 的核心回调契约。

推荐原则：

- 把长耗时或复杂任务封装成 Skill，由 mode prompt 决定何时调用。
- 保持 Gateway 的 LLM callback、Action、workspace 和 lifecycle 契约稳定。
- 外部系统不可用时返回结构化失败结果，让 Agent 用自然语言兜底。
- 移除某个外部 adapter 后，不应影响 standalone、HTTP Skill 或 MCP 部署。
