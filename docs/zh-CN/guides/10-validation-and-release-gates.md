# 试用验收清单

在试用环境验收交付 preview 制品时使用本清单。

Gateway-owned ZEGO Agent lifecycle 的交付前 gate 需要在打包前执行 `npm run verify:contracts`。服务包公网环境验收按 `13-cloud-live-e2e-deployment.md` 执行。

## 包边界

- 服务包不包含 TypeScript 源码、source maps 或内部研发资产。
- 服务包包含可运行 JS 部署脚本和参考服务。
- 启用 Web 验证时，`examples/web-live-call/dist/` 已存在。
- 服务包不包含运行日志、本地状态、benchmark 输出、历史报告、本地 `.env` 文件或 `node_modules/`。
- 根 `package.json` 只暴露客户 setup、install、start、service 和 CLI 命令。

## Runtime Smoke

```bash
./bin/conversation-agent check --project ./pulse-project
./bin/conversation-agent start gateway --project ./pulse-project --daemon
./bin/conversation-agent status --project ./pulse-project
./bin/conversation-agent doctor --project ./pulse-project
curl http://127.0.0.1:3000/voice/status
curl http://127.0.0.1:3000/voice/mode-info
```

预期结果：Gateway 从编译后的 JavaScript 启动，读取 `conversationAgent.json`，并返回状态和 mode 信息。

## RTC Smoke

- 填写 `examples/agent-service-zego-create-agent/.env` 中的 ZEGO 凭证，以及 customer service 到 Gateway 的服务端配置。
- 启动客户 ZEGO 服务端 reference。
- 将 `examples/web-live-call/dist/` 作为静态文件服务。
- 加入房间、交付麦克风音频，并创建 Agent 实例。
- 确认 Web 页面展示 ASR/LLM 字幕、mode、action、Agent 状态、TTFT、首句耗时和主动说话文本。
- 确认 Raw signals 被限制在调试面板中，不会挤压 recent actions 或主字幕区域。

## 运维 Smoke

- 性能和错误日志写入配置的 workspace `logs/gateway/` 目录。
- 完整对话审计日志默认关闭，只在批准的排障窗口临时开启。
- 控制 API 和 ZEGO 回调都使用配置的 token 鉴权。
