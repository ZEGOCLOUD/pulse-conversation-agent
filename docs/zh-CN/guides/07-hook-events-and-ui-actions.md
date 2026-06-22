# Hook Events 与 UI Actions

客户端应响应类型化事件，而不是解析语音文本。

事件类别：

- 文本增量
- 最终回复
- mode 更新
- UI action
- 异步通知
- 性能报告
- 错误

语音 TTS 和机器可读的 UI action 必须保持分离。

## Action 标签语法

当 workspace 要求 AI 输出 ACTION 时，使用当前已支持的 key-value 参数格式：

```text
我帮你打开这个面板。 [ACTION:OPEN_PANEL panel="billing" source="assistant"]
```

不要在 ACTION 标签里写 JSON 对象。Gateway 会用 `workspace.json.actions.definitions` 中的 JSON Schema 校验参数，但 AI 文本里的 ACTION 标签仍按 `[ACTION:...]` 内部的 `key="value"` 参数来解析。

## Action Result

Gateway 会给每个 `action_signal` 增加 `actionInstanceId`。默认 action 只是展示或执行，不需要反馈。如果客户 UI 需要让 AI 知道用户操作结果，提交：

```json
{
  "actionInstanceId": "gw_act_...",
  "resultDescription": "用户接受了加入房间邀请。",
  "responsePolicy": "after_current",
  "payload": {}
}
```

Gateway 会校验该 ID 是否属于最近一次 action。默认只有 `resultDescription` 对 AI 可见，形式为 `[action: invite_modal]结果：用户接受了加入房间邀请。`。`payload` 只保留给 Gateway/客户业务侧使用，不默认进入模型上下文。

`responsePolicy` 默认是 `after_current`：当前 ZEGO LLM SSE 还打开时续写到同一条 SSE；若已经结束，则排队做一次主动补播。`silent` 只记录 observation 不主动说话，`interrupt` 做尽力打断。

Workspace automation 使用 `workspace.json` 中的 `automation` 字段：

- `automation.heartbeat`：周期性、上下文感知的主动说话判断。
- `automation.hooks`：外部事件回调。
- `automation.hooks.idle`：用户和 Agent 都静默后的 idle 回调。

beta 公开配置不使用 `proactive` 作为配置名。
