# 生产评估清单

当前 Developer Preview 不是标准 SLA 产品。进入生产前，请在客户自己的环境完成下面验证。

## 功能门禁

- 客户 App/Web 可以进入 RTC 房间、发布麦克风音频，并显示字幕、状态和 Action UI。
- 客户服务端可以通过私有 Gateway API 创建、主动说话和结束 AgentInstance。
- Action feedback 可以返回 Gateway，并影响下一轮 Agent 回复。
- Workspace Action 示例使用 `[ACTION:NAME key="value"]` 标签，不在 ACTION 标签里输出 JSON 对象。
- 多 workspace 按 AgentInstance 路由，prompt、action schema、日志、canvas state 和 action feedback 不串。
- 主动说话会回到所属 workspace。
- 目标场景的阶段人设指引切换正确。
- Knowledge 或 Skill 失败时有安全兜底。

## 稳定性门禁

- Gateway 通过客户预期的并发和长稳测试。
- 进程重启不会让房间或 AgentInstance lifecycle 进入不可恢复状态。
- 实时后端、LLM、Skill、客户服务端故障可观测、可恢复、影响有边界。
- 已验证可以回滚到上一版不可变 package 或镜像 digest。

## 安全门禁

- Gateway control API 不暴露给浏览器或移动端。
- Callback token 和 control token 已配置并可轮换。
- ZEGO lifecycle 凭据遵循 owner 分层：只有 `lifecycleOwner=gateway` 时 Gateway 才需要 `zego.appId/serverSecretRef`；客户服务端生成 RTC Token04 或自管 ZEGO lifecycle 时仍需要 `ZEGO_APP_ID/ZEGO_SERVER_SECRET`。
- 完整对话日志默认关闭，只有排障窗口明确批准后才开启。
- 日志会脱敏用户标识、token、model key 和客户业务数据。

## 支持边界

GitHub Issues 只用于 preview feedback，默认 best-effort。生产支持、事故响应、冻结版本和回滚协助需要与维护方或后端服务提供方单独约定。
