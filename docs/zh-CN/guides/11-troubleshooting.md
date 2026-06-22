# 故障排查

常见问题类别：

- 无音频或无 TTS
- 回调地址不可达
- ASR 文本未到达 Gateway
- Skill 超时或 SkillResult 格式错误
- 事件流断开
- mode 切换不符合预期
- 调试协议文本泄露
- 活跃 agent instance 未清理

每类问题都应包含预期日志、快速检查项和升级排查所需数据。

## 公网环境 Live E2E 常见坑

| 现象 | 优先检查 |
| --- | --- |
| Web 页面显示 `runtime config failed` | nginx 是否把 `/config/` 反代到 customer service `8080`；customer service `/config/runtime` 是否可访问。 |
| customer service 启动或请求报 `HOST` 相关错误 | `HOST` 必须是 `0.0.0.0` 或 `127.0.0.1`，不能是 `http://127.0.0.1:8080`。 |
| `/rtc/token` 报 `ZEGO_SERVER_SECRET must be 32 bytes` | 使用 ZEGO RTC 控制台里的 32 字节 ServerSecret，不要填 64 字符值。 |
| ASR/LLM 已通但没有 AI 声音 | 优先检查 TTS model/voice 是否匹配。Minimax 快速验证值：`speech-2.8-turbo / Arrogant_Miss`；备用官方示例：`speech-02-turbo-preview / female-shaonv`。 |
| Web 等待 `publisherStateUpdate=PUBLISHING` 超时 | 确认浏览器麦克风权限、用户已经 `loginRoom`、`startPublishingStream` 带 `{ roomID }`，并检查页面输出的 roomId/streamId。 |
| `conversation-agent status` 显示 pid 但页面不可用 | 以端口和 HTTP health 为准，运行 `./bin/conversation-agent doctor --project ./pulse-project`。 |
| 浏览器仍加载旧 JS | 使用带 query 的新 URL，或清理缓存；服务包的 `index.html` 会给构建资源加版本 query。 |

不要为了“更像 OpenAI”修改 Gateway 给 ZEGO 的 SSE chunk 形态；当前线上验证通过的是服务包现有简化 SSE。
