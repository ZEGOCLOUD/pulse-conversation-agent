# Skills 与 Capabilities

Skill 描述 Agent 什么时候应该使用外部能力。Capability 描述 Gateway 如何调用该外部系统。

最小 beta 契约：

- Skill 输入用 JSON Schema 描述。
- Capability runtime 必须显式声明：HTTP、MCP、script 或受限 CLI。
- Skill 输出统一归一化为 `SkillResult.v1`。
- 长耗时 Skill 可以先给出快速语音回应，再异步交付结果。

## RAG Knowledge Skill

RAG 按 workspace Skill 建模，不作为 Gateway 内置向量库。客户负责知识库产品选型、embedding、索引构建、权限、排序和检索参数。服务契约只定义 Agent 如何调用 Skill，以及如何消费 `SkillResult.v1`。

Mode 文件可以通过 `knowledge.rag` 挂载 RAG Skill：

```yaml
knowledge:
  include:
    - local_faq
  rag:
    - skill: rag_query
      description: 当本地 workspace knowledge 不足时，查询客户自有产品文档。
```

`knowledge.include` 仍表示来自 `knowledge/*.json` 的低延迟本地字典匹配。`knowledge.rag` 只控制当前 Mode 下哪些 RAG 查询 Skill 可见。

推荐的 RAG `SkillResult.v1` 字段：

- `direct_response`：适合语音播报的短结论。
- `extended_context`：可供用户追问时复用的扩展资料。
- `evidence`：文档标题、URL、片段、来源和 chunk metadata。
- `AWAITING_CONFIRMATION`：缺少查询范围或客户侧必要约束。

Gateway 会把成功的 RAG 查询结果作为当前通话的短期 active knowledge，供 SLC 回答“为什么”“展开讲讲”等连续追问。它不会把 RAG 结果写入长期 memory，也不会自动沉淀到本地字典 knowledge。

### 厂商无关的 RAG 适配

服务标准制品不按 RAG 厂商内置适配。百炼、火山、RAGFlow、自建检索服务或其他知识库产品，都应由客户自己的 workspace Skill、HTTP capability 或 MCP capability 调用，并把结果转换成 `SkillResult.v1`。

标准服务契约只稳定以下边界：

- Mode 通过 `knowledge.rag` 挂载哪些 RAG Skill。
- SLC/SLE 只看到当前 Mode 允许的 RAG Skill。
- RAG Skill 的返回值按 `SkillResult.v1` 消费。
- 成功查询后的 `direct_response`、`extended_context` 和 `evidence` 进入短期 active knowledge context。

具体知识库 ID、collection、dataset、pipeline、topK、filters、rerank、embedding、索引构建、鉴权和权限控制都属于客户侧 Skill/capability 的实现细节。只有当现有 `SkillResult.v1`、Mode 挂载或 active knowledge 生命周期无法表达通用需求时，才需要扩展服务标准契约。
