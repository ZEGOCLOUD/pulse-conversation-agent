# 公网 Live E2E 部署 Runbook

本文用于把服务包部署到一台公网 Linux 服务器，并完成 ZEGO RTC、ASR、LLM、TTS、Web 验证页的端到端验收。

对于服务包交付就绪判断，公网环境 Live E2E 是最终验收路径。本地 build、text-chat smoke、localhost Web 检查和临时 tunnel 都只适合开发阶段排查，不能替代公网 HTTPS、ZEGO 回调和 RTC 媒体链路。

客户部署流程：

```text
收到 ZEGO Conversational Agent Service tarball
  -> 上传 tarball 到 Linux 服务器
  -> 解压服务包
  -> 初始化客户项目目录
  -> 配置 nginx 或等价反代
  -> 运行 check/status/doctor
  -> 验证Web RTC -> ASR -> Gateway LLM -> ZEGO TTS
```

不要从源码目录 运行试用验收。试用验收应该使用解压后的服务包，并把客户项目配置放到独立目录。

## 1. 准备

解压收到的 tarball：

```bash
tar -xzf pulse-conversation-agent-gateway-v0.1.0-preview.23.tgz
cd pulse-conversation-agent-gateway-v0.1.0-preview.23
export PATH=$HOME/.local/node/bin:$PATH
./bin/conversation-agent setup --project ./pulse-project --lang zh
```

Node 必须是 20 或以上。若服务器的 `node` 不在 PATH 中，所有启动命令前都要先 `export PATH=...`。

当前 preview 制品是在线依赖安装包。首次启动 Gateway 时可能执行 `npm ci --omit=dev`，因此服务器需要能访问 npm registry 或客户自己的 npm mirror。

## 2. 必填配置

初始化时启用 ZEGO RTC Live Example，并填写：

- LLM base URL、model、API Key。
- `ZEGO_APP_ID`。
- `ZEGO_SERVER_SECRET`：必须是 ZEGO RTC 控制台里的 32 字节/32 字符 ServerSecret。
- `SDK_GATEWAY_PUBLIC_URL`：公网 HTTPS Gateway 地址。
- `HOST=0.0.0.0`：服务器部署默认值。不要写成 `http://...`。

TTS 快速验证默认使用：

```bash
TTS_VENDOR=Minimax
MINIMAX_TTS_API_KEY=zego_test
TTS_RESOURCE_ID=speech-2.8-turbo
TTS_VOICE_TYPE=Arrogant_Miss
```

备用官方示例值：`speech-02-turbo-preview / female-shaonv`。

## 3. 反代要求

nginx 必须至少包含三组路由：

```text
/voice/agent/register           -> deny public access
/voice/agent-instances 和
/voice/agent-instances/*        -> deny public access
其余 /voice*                     -> Gateway 3000
/agent* /rtc* /config* /health  -> customer service 8080
/                               -> Web 5188
```

漏掉 `/config/` 时，Web 页面可以打开，但无法读取 runtime config，常见表现是 `runtime config failed`。

参考模板：`docs/deployment/nginx.conversation-agent.conf.template`。

## 4. HTTPS 证书

ZEGO 回调必须使用公网 HTTPS。常见方式：

- 使用已有负载均衡或网关终止 TLS。
- 使用 Let’s Encrypt webroot 签发证书。
- 使用 `acme.sh` 用户态签证书，再让 nginx 引用生成的 `fullchain.cer` 和 key。

证书路径、域名和 webroot 与试用环境强相关，服务包只提供参考，不写入机器路径。

## 5. 启动与检查

```bash
./bin/conversation-agent check --project ./pulse-project
./bin/conversation-agent start all --project ./pulse-project --daemon
./bin/conversation-agent status --project ./pulse-project
./bin/conversation-agent doctor --project ./pulse-project
```

`status` 同时显示 pid、端口和 HTTP health；`doctor` 会额外检查 Node PATH、public URL、customer service `/config/runtime`、TTS 示例值和 ZEGO ServerSecret 长度。

如需重启：

```bash
./bin/conversation-agent restart all --project ./pulse-project
```

## 6. 验收

打开公网 Web 地址，点击开始：

1. 浏览器获得麦克风权限并进入 RTC 房间。
2. Web 交付用户音频流，等待 `publisherStateUpdate=PUBLISHING`。
3. customer service 创建 ZEGO AI Agent instance。
4. ZEGO ASR 文本进入 Gateway。
5. Gateway 返回 LLM 文本。
6. ZEGO TTS 播放 AI 回复。
7. Web 展示用户字幕、AI 字幕、mode、action、TTFT 和 agent 状态。
8. 不同 workspace 创建不同 AgentInstance，prompt、action schema、action feedback、主动说话、日志和 canvas 状态不串。
9. `mode-info?workspaceId=...` 返回对应 workspace 的 modes。
10. 将 callback 打到非 owner Gateway node，或使用未知 `agentInstanceId`，应返回 `409 CALLBACK_OWNER_NOT_FOUND`。
11. 负向 callback 验证不得复活本地 session，也不得产生 AI 回复。

如果 ASR/LLM 已通但无声音，优先检查 TTS model/voice 是否匹配。
