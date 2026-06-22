# Level 2.5 验证矩阵

当你通过本地 Cloudflare Tunnel 和真实 realtime backend 凭据验证 Pulse Conversation Agent 时，使用本矩阵记录结果。它把普通语音链路、ACTION feedback、主动说话和多 workspace 行为拆开，避免把“能正常说话”误认为全部能力都已验证。

Level 2.5 是开发者集成 smoke，不替代生产验收或托管云端验收。

## 前置条件

| 项目 | 要求 |
| --- | --- |
| Artifact | 使用准确的 release `.tgz`，记录版本、artifact 名称和 sha256。不要从源码目录运行。 |
| Browser | 使用真实浏览器会话和确认可用的物理麦克风。若麦克风权限或设备状态会阻断采集，CDP/headless 回放不够。 |
| Public URL | 使用 Cloudflare Quick Tunnel 或 ZEGO callback 可访问的固定 HTTPS tunnel。 |
| Credentials | 使用批准的 realtime backend、LLM、ASR、TTS 凭据。证据中不要粘贴或截取密钥。 |
| Workspace | 先验证 workspace id `default`；其生成目录是 `workspaces/default-service-assistant`。多 workspace 验证时再增加测试 workspace。 |
| Logs | 保留截图和少量脱敏日志片段。不要包含完整密钥、token 或私有 prompt。 |

## 验证矩阵

| 范围 | 用例 | 步骤 | 通过标准 | 证据 |
| --- | --- | --- | --- | --- |
| 普通语音 | 进房和麦克风 | 打开 tunnel URL，选择物理麦克风，点击 Start。 | 成功进房、麦克风发布，且没有选择虚拟静音设备。 | 活跃会话截图，脱敏 room/publishing 信号。 |
| 普通语音 | ASR 到 LLM 到 TTS | 说一句短话，等待 AI 回复。 | 用户语音显示为 ASR 字幕；Gateway 收到 LLM callback；AI 字幕出现；能听到 AI 声音。 | transcript 截图和人工听到声音的记录。 |
| ACTION | Action 输出 | 说一个应该触发 UI Action 的请求。 | 该轮只出现一个 action；不会把协议 JSON 或原始 `[ACTION:...]` 口播出来。 | ACTION 面板和 transcript 截图。 |
| ACTION | Feedback accepted | 对 action 提交 accepted feedback。 | 提交 ACTION_RESULT；observation/result 出现；AI 下一轮能使用结果。 | action observation 和后续 AI 回复截图。 |
| ACTION | Feedback rejected | 新会话再次触发 action，并提交 rejected feedback。 | AI 不会立即重复同一引导；拒绝结果体现在上下文或后续回复中。 | rejected feedback 与后续回复截图。 |
| ACTION | 不重复 action | feedback 后继续对话。 | 除非用户明确再次要求，否则不重复输出同一个 action。 | 跨两轮 transcript 片段。 |
| 主动说话 | Manual Speak | Start 后点击 Speak 使用默认文本。 | ZEGO TTS 播放主动说话；Web transcript/status 能反映该链路，不泄露 debug 协议。 | 信号截图和人工听到声音的记录。 |
| 主动说话 | Heartbeat 触发 | 启用 heartbeat 能力的 workspace，等待 idle decision window。 | 只有策略允许时才主动说话，不形成重复打扰。 | 脱敏 heartbeat decision 日志和 transcript/audio 记录。 |
| 主动说话 | 用户打断后恢复 | AI 说话时或主动说话后立即说话。 | 交互仍可用；用户 ASR 恢复；后续 AI 回复连贯。 | transcript 和状态证据。 |
| 多 workspace | Workspace 列表 | 打开 Web 页面并刷新 workspace 选择。 | `/agent/workspaces` 返回预期测试 workspace；UI label 和默认状态正确。 | workspace 下拉截图和脱敏 `/agent/workspaces` 响应。 |
| 多 workspace | 指定 workspace 通话 | 每个 workspace 启动一条通话。 | Session label 显示所选 workspace；AgentInstance 使用该 workspace 创建。 | 每个 workspace 截图和脱敏 create 响应。 |
| 多 workspace | 隔离 | 询问 workspace 专属问题或触发专属 action。 | persona、knowledge、action contract、mode 行为不跨 workspace 串用。 | 并排 transcript 片段。 |
| 多 workspace | 未知 workspace fail closed | 使用未知 workspace id 调用客户服务端或 Gateway。 | 请求明确失败，不 fallback 到其他 workspace。 | 不含 token 的 HTTP status/body 片段。 |

## 证据模板

```text
Release:
- version:
- artifact:
- sha256:
- source:

Environment:
- date/time:
- tester:
- browser:
- tunnel type: Quick Tunnel / Named Tunnel
- tunnel URL:
- physical microphone confirmed: yes/no

Results:
- normal voice: pass/fail
- ACTION emission: pass/fail/not-run
- ACTION feedback accepted: pass/fail/not-run
- ACTION feedback rejected: pass/fail/not-run
- no duplicate ACTION: pass/fail/not-run
- manual proactive speak: pass/fail/not-run
- heartbeat-triggered speech: pass/fail/not-run
- proactive interruption/recovery: pass/fail/not-run
- workspace listing: pass/fail/not-run
- workspace-specific call: pass/fail/not-run
- workspace isolation: pass/fail/not-run
- unknown workspace fail-closed: pass/fail/not-run

Known gaps:
-

Decision:
- candidate status: pass / risk / fail
- reason:
```

## 汇报规则

- 不要只因为普通语音通过，就标记 ACTION 已就绪；必须通过 action emission、accepted feedback、rejected feedback 和 duplicate-prevention。
- 不要只因为手动 Speak 通过，就标记主动说话已就绪；还需要覆盖 heartbeat 触发。
- 不要只因为单 workspace 通过，就标记多 workspace 已就绪；还需要覆盖列表、指定 workspace 创建、隔离和未知 workspace fail-closed。
- 如果只验证了普通语音，请明确写：普通语音链路通过；ACTION、主动说话和多 workspace 仍未验证。
