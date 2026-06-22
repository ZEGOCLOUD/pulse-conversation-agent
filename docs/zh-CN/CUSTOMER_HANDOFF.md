# 客户交付说明

本运行包是 compiled-runtime-only Developer Preview 制品。它不包含源码、source map、客户专属 workspace、容器镜像、生产 SLA 条款或托管服务。

## 快速部署

```bash
./bin/conversation-agent setup --project ./pulse-project
./bin/conversation-agent check --project ./pulse-project
./bin/conversation-agent start all --project ./pulse-project --daemon
./bin/conversation-agent status --project ./pulse-project
./bin/conversation-agent doctor --project ./pulse-project
```

`./pulse-project` 是客户拥有的配置、密钥、日志、workspace 和运行状态目录。

## 验证边界

Level 1/2 用于本地可用性检查；Level 2.5 用于本地 Cloudflare Tunnel live smoke；Level 3 用于从同一个 release artifact 部署到公网 HTTPS 环境后的真实链路验收。当前 Developer Preview 的生产稳定性、容量、安全、合规、回滚和支持验收仍需要客户侧完成。
