# 安全与鉴权

Developer Preview 前，Gateway 必须定义以下安全默认值：

- 公网 ZEGO 回调路由
- 客户端控制 API
- 事件流
- Skill 和 adapter 调用
- CORS origins
- token 刷新
- 日志脱敏

Callback 鉴权：

- 在 `conversationAgent.json` 中设置 `security.callbackAuthTokenRef`，通常为 `env:CONVERSATION_AGENT_CALLBACK_TOKEN`。
- ZEGO 客户服务端示例会把相同值写入 `LLM_API_KEY_FOR_ZEGO_CALLBACK`。
- Gateway 支持从 `Authorization: Bearer <token>`、`x-api-key`、`api-key`、`x-callback-token` 或 `x-conversation-agent-callback-token` 读取 token。
- 如果 token 引用解析为空，Gateway 会输出 warning，callback endpoint 只在本地测试场景下无鉴权运行。

任何生产样例都不应使用无鉴权 callback，也不应在提交文件中包含凭证。
