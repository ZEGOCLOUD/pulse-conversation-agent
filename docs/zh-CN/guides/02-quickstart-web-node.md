# 快速开始：Web + Node 服务

这是开发者接入Developer Preview 的最短路径：先启动编译后的 Pulse Conversation Agent，再按需启动客户 BFF reference 和浏览器 live-call 示例。

## 1. 初始化客户项目

在服务包根目录下：

```bash
./bin/conversation-agent setup --project ./pulse-project
./bin/conversation-agent check --project ./pulse-project
```

setup 向导会把客户运行文件写入 `./pulse-project`：

```text
pulse-project/
  ├── conversationAgent.json
  ├── .env.local
  ├── .conversation-agent/state.json
  └── workspaces/
```

密钥写入 `.env.local`，`conversationAgent.json` 只保存 `env:NAME` 引用。直接运行 `./bin/conversation-agent` 仍保留一键体验，等价于 setup、check 和前台启动。

npm 兼容入口：

```bash
npm run conversation-agent -- check --project ./pulse-project
```

## 2. 可选手动安装 runtime 依赖

在服务包根目录下：

```bash
npm --prefix runtime/packages/gateway ci --omit=dev
```

`./bin/conversation-agent start` 在缺少服务依赖时也会自动安装。当前 preview 制品需要能访问 npm registry 或客户自己的 npm mirror 来安装 runtime dependencies；它不是完整离线依赖包。

如果要本地验证 RTC，只安装客户 BFF reference 依赖：

```bash
cd examples/agent-service-zego-create-agent
npm install
```

## 3. 手动配置服务

复制根目录示例配置，并填入客户自己的值：

```bash
cp conversationAgent.example.json conversationAgent.json
cp .env.example .env.local
```

最小必填字段：

- `server.publicUrl`：ZEGO AI Agent LLM callback 可访问的公网 HTTPS URL。
- `server.callbackPath`：通常为 `/voice-gateway/chat/completions`。
- `defaultWorkspace`：通常为 `./workspaces/default-service-assistant`。如果使用自定义 workspace，请改成客户项目中的实际 workspace 路径。
- `llm.baseUrl` 和 `llm.apiKeyRef`。
- `security.controlTokenRef` 和 `security.callbackAuthTokenRef`。
- Gateway 负责 ZEGO Agent lifecycle 时，需要配置 `zego.lifecycleOwner`、`zego.appId` 和 `zego.serverSecretRef`。

Gateway 配置可以通过 secret ref 持有 ZEGO ServerSecret，用于 ZEGO Server API 签名。RTC Token04 仍由客户服务端/BFF 生成，不应迁入 Gateway。

## 4. 启动 Pulse Conversation Agent

推荐方式：

```bash
./bin/conversation-agent start gateway --project ./pulse-project --daemon
```

手动方式是在 `runtime/packages/gateway` 下：

```bash
CONVERSATION_AGENT_CONFIG=/absolute/path/to/conversationAgent.json npm start
```

验证基础接口：

```bash
curl http://127.0.0.1:3000/voice/status
curl http://127.0.0.1:3000/voice/mode-info
```

## 5. 启动客户 BFF reference

该服务不是 Pulse Conversation Agent runtime 必需项，但 Web/RTC Live E2E 参考路径需要它。

```bash
cd examples/agent-service-zego-create-agent
cp .env.example .env
npm start
```

在该服务的 `.env` 中配置：

- `ZEGO_APP_ID`
- `ZEGO_SERVER_SECRET`
- `CONVERSATION_AGENT_ZEGO_SERVER_SECRET`
- `SDK_GATEWAY_PUBLIC_URL`
- `SDK_GATEWAY_INTERNAL_BASE_URL`
- `AGENT_LIFECYCLE_OWNER=gateway`

也可以通过根目录脚本启动：

```bash
./bin/conversation-agent start zego-service --project ./pulse-project --daemon
```

## 6. 启动 Web Live 静态页

```bash
python3 -m http.server 5188 --directory examples/web-live-call/dist
```

打开 `http://127.0.0.1:5188`。页面会从客户服务端获取 RTC Token04，加入 ZEGO 房间，然后请求客户服务端创建 Agent 实例。如果 setup 中启用了 Web，`./bin/conversation-agent start web --project ./pulse-project --daemon` 也可以启动这个静态页。

## 7. 启动 setup 中选择的所有服务

```bash
./bin/conversation-agent start all --project ./pulse-project --daemon
./bin/conversation-agent status --project ./pulse-project
./bin/conversation-agent doctor --project ./pulse-project
```

## 8. 试用验收清单

验收交付 preview 制品前确认：

- `./bin/conversation-agent setup --project ./pulse-project` 会把客户配置写到服务包目录之外。
- `./bin/conversation-agent check --project ./pulse-project` 通过。
- `./bin/conversation-agent doctor --project ./pulse-project` 没有阻塞性部署问题。
- `curl http://127.0.0.1:3000/voice/status` 和 `curl http://127.0.0.1:3000/voice/mode-info` 返回 Gateway 状态。
- 客户 BFF reference 在填写 `.env` 后可以创建 Agent 实例。
- Web live-call 静态页可以加入 RTC、交付麦克风音频，并展示 ASR/LLM 字幕、mode、action 和状态。
- 服务包不包含 TypeScript 源码、source maps 或内部研发资产；包含可运行 JS 部署脚本和参考服务。
