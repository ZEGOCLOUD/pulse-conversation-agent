# 部署说明

本文位于已解压的 Pulse Conversation Agent 运行包内。进入本目录后，请直接使用随包 CLI。

```bash
./bin/conversation-agent setup --project ./pulse-project
./bin/conversation-agent check --project ./pulse-project
./bin/conversation-agent start all --project ./pulse-project --daemon
./bin/conversation-agent status --project ./pulse-project
./bin/conversation-agent doctor --project ./pulse-project
```

请保持运行包目录和 setup 生成的项目目录分离。`pulse-project` 不是 workspace 名；workspace 会在 setup 后位于项目目录内。

如果要从 GitHub 安装最新 preview，请使用 https://github.com/ZEGOCLOUD/pulse-conversation-agent 仓库级 `scripts/install-latest.mjs`。该安装脚本不包含在本运行包内。

## 升级和回滚

如果本包通过 `./pulse/current` 这类 managed layout 安装，使用：

```bash
./bin/conversation-agent upgrade --check --json --project ./pulse-project
./bin/conversation-agent upgrade --project ./pulse-project
./bin/conversation-agent rollback --project ./pulse-project
```

升级命令会保留客户项目目录内的 `.env.local`、`conversationAgent.json`、workspace 编辑、日志、memory 和运行状态。
