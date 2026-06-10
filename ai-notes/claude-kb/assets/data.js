/* ============================================================
 * Claude 知识库 · 全站数据配置
 * ------------------------------------------------------------
 * 这是唯一需要维护的数据文件。产品更新时只改这里，全站自动生效。
 * 每个区块都标了【来源】和【更新频率】，方便你定期核对。
 * 数据时点：2026 年 6 月。请以 platform.claude.com 官方为准。
 * ============================================================ */

const DATA = {
  // —— 全站元信息 ——
  meta: {
    dataDate: "2026 年 6 月",
    flagship: "Claude Opus 4.8",
    lastUpdated: "2026-06-08",      // 每次更新数据时改这里
    siteTitle: "Claude 产品知识库",
  },

  /* ========== 模型规格 ==========
   * 【来源】platform.claude.com/docs/about-claude/models/overview
   * 【更新频率】高 —— 新模型发布时更新（约每 1-2 月）
   * 价格单位：美元 / 每百万 token
   */
  models: [
    { id: "opus",   name: "Opus 4.8",   apiId: "claude-opus-4-8",          tier: "旗舰", in: 5, out: 25, ctx: "1M",   ctxNum: 1000000, maxOut: "128k", thinking: "自适应(默认high)", cutoff: "2026-01", intel: 61.4, color: "#c96442", note: "最强推理、长程 Agent 编码" },
    { id: "sonnet", name: "Sonnet 4.6", apiId: "claude-sonnet-4-6",        tier: "默认", in: 3, out: 15, ctx: "1M",   ctxNum: 1000000, maxOut: "64k",  thinking: "扩展+自适应",      cutoff: "2025-08", intel: 56.0, color: "#e0a06a", note: "速度与智能最佳平衡" },
    { id: "haiku",  name: "Haiku 4.5",  apiId: "claude-haiku-4-5-20251001", tier: "高速", in: 1, out: 5,  ctx: "200k", ctxNum: 200000,  maxOut: "64k",  thinking: "扩展思考",          cutoff: "2025-02", intel: 47.0, color: "#7fa8d4", note: "最快、高并发、低成本" },
  ],

  /* ========== 分层架构（用于首页架构图）==========
   * 【更新频率】低 —— 产品大改版时才动
   */
  architecture: [
    { n: 5, name: "终端应用层", en: "End-User Apps", desc: "Claude.ai · 订阅套餐 · 应用代理", color: "#e8a87c" },
    { n: 4, name: "开发者层",   en: "Developer",     desc: "API · Claude Code · Managed Agents", color: "#e0a06a" },
    { n: 3, name: "能力工具层", en: "Capabilities",  desc: "Artifacts · Projects · Memory · MCP", color: "#d4a574" },
    { n: 2, name: "模型层",     en: "Models",        desc: "Opus 4.8 · Sonnet 4.6 · Haiku 4.5", color: "#c4946a" },
    { n: 1, name: "算力基础层", en: "Infrastructure", desc: "训练/推理算力 · 四条分发渠道", color: "#a8896b" },
  ],

  /* ========== 成本优化系数 ==========
   * 【来源】官方定价页 + Batch / Caching 文档
   * 【更新频率】低 —— 计费政策变化时才改
   */
  costFactors: {
    cacheInputMult: 0.1,   // 缓存命中输入按 10% 计费
    batchMult: 0.5,        // 批处理全模型 5 折
    cacheMinTokens: 1024,  // Opus 4.8 最小可缓存 token
    agentMultNote: "3 代理 ≈ 7× token",
  },

  /* ========== 消费端套餐 ==========
   * 【来源】claude.ai/pricing + support.claude.com
   * 【更新频率】中 —— 套餐价格/额度调整时更新
   */
  plans: [
    { name: "Free",       price: "$0",          quota: "最低，滚动窗口重置",     for: "试用",        features: "基础对话+搜索+Artifacts；部分连接器" },
    { name: "Pro",        price: "$20/月",      quota: "约 5× Free",            for: "个人专业用户", features: "全模型 + Claude Code（标准额度）；连接器" },
    { name: "Max 5×",     price: "$100/月",     quota: "5× Pro + 优先",         for: "重度用户",     features: "长会话编码/研究" },
    { name: "Max 20×",    price: "$200/月",     quota: "20× Pro",               for: "全职开发者",   features: "全天 Claude Code 不撞限" },
    { name: "Team",       price: "$20–30/坐席", quota: "团队级（最低 5 席）",     for: "5–150 人组织", features: "SAML SSO、管理后台、共享 Projects、M365" },
    { name: "Enterprise", price: "定制",        quota: "定制",                  for: "大型组织",     features: "平台费与用量费分离；最高合规/审计；量价折扣" },
  ],

  /* ========== 限流维度 ==========
   * 【来源】platform.claude.com/docs rate-limits
   * 【更新频率】低
   */
  rateLimits: [
    { dim: "RPM",  full: "Requests / Min",      desc: "每分钟请求数" },
    { dim: "ITPM", full: "Input Tokens / Min",  desc: "每分钟输入 token（多数模型仅计未缓存部分）" },
    { dim: "OTPM", full: "Output Tokens / Min", desc: "实时按实际生成计；max_tokens 不计入" },
  ],

  /* ========== 竞品基准 ==========
   * 【来源】第三方测评（Artificial Analysis、Bind AI 等）
   * 【更新频率】高 —— 各家发新模型时更新；注意各家以自报设置发布
   */
  benchmarks: {
    note: "各家以自报设置发布，仅作方向性参考，非严格对齐。数据 2026 年 5 月。",
    competitors: ["Claude Opus 4.8", "GPT-5.5", "Gemini 3.5 Flash"],
    rows: [
      { metric: "SWE-bench Pro",      values: [69.2, 58.6, 55.1], winner: 0, desc: "最难真实软件工程任务" },
      { metric: "Terminal-Bench 2.1", values: [74.6, 82.7, 76.2], winner: 1, desc: "命令行任务" },
      { metric: "AA 智能指数",         values: [61.4, 58.0, 55.3], winner: 0, desc: "聚合指数" },
      { metric: "长文检索准确率",       values: [97.2, 92.0, 90.0], winner: 0, desc: "长文档/大代码库" },
      { metric: "FACTS 事实性",        values: [91.4, 89.7, 93.2], winner: 2, desc: "事实准确性" },
    ],
  },

  /* ========== 分发渠道 ==========
   * 【来源】官方 deployment 文档
   * 【更新频率】低
   */
  channels: [
    { name: "Anthropic 直连", value: "第一时间拿新模型/功能",      limit: "无硬限(413 保护)" },
    { name: "AWS Bedrock",   value: "并入 AWS 账单与 IAM",        limit: "20 MB" },
    { name: "Google Vertex AI", value: "并入 GCP 生态与计费",      limit: "30 MB" },
    { name: "Microsoft Foundry", value: "并入 Azure（Opus 上下文 200k）", limit: "—" },
  ],

  /* ========== 可下载文档（厚重 PDF 保留下载）==========
   * 把 PDF 放进 /docs 目录，这里登记即可
   */
  documents: [
    { type: "PDF · 18 页",  cat: "doc",  icon: "📘", title: "技术参考文档",   desc: "最深的一份。模型规格、API 技术文档、限流配置、缓存设置、竞品横向对比，含数据图表。", file: "docs/Claude技术参考文档.pdf", tags: ["模型规格","API","竞品对比"], color: "#c96442" },
    { type: "PDF · 产品视角", cat: "doc", icon: "📗", title: "产品线全解析",   desc: "每个产品按\"是什么/功能/优点/缺点\"拆解，绿红双栏对照，客观无销售立场。", file: "docs/Claude产品线全解析.pdf", tags: ["功能","优缺点"], color: "#e0a06a" },
    { type: "PDF · 销售视角", cat: "doc", icon: "📙", title: "全产品详解手册", desc: "SC 视角的产品教育材料。四层心智模型、选型决策树、常见客户异议应对。", file: "docs/Claude全产品详解手册.pdf", tags: ["SC 视角","选型","异议应对"], color: "#e8a87c" },
    { type: "交互网页",      cat: "arch", icon: "🍰", title: "分层蛋糕架构",   desc: "从底层算力到顶层应用五层堆叠，点击任意层展开产品细节。", file: "docs/Claude产品架构-分层蛋糕.html", tags: ["5 层","可展开"], color: "#e07a52" },
    { type: "交互网页 · 11 节", cat: "arch", icon: "⚙️", title: "开发者层完整手册", desc: "端点、参数、工具调用、流式 SSE、缓存、批处理、Claude Code，代码可直接跑。", file: "docs/Claude开发者层-完整手册.html", tags: ["API","代码示例","多语言"], color: "#e0a06a" },
  ],

  /* ========== 可搜索的核心知识条目 ==========
   * 这些是内联进网站、可被全站搜索命中的知识点。
   * 想让搜索能搜到更多内容，往这里加条目即可。
   */
  knowledge: [
    { cat: "模型", q: "Opus / Sonnet / Haiku 怎么选", a: "简单任务(分类/抽取/高并发)用 Haiku；多数生产负载用 Sonnet(默认)；复杂 Agent、长文写作、多文件代码重构用 Opus。输出价都是输入价的 5 倍。" },
    { cat: "模型", q: "模型 ID 会变吗", a: "从 4.6 代起 ID 采用无日期格式，但仍是固定快照而非常青指针——生产环境可放心 pin 版本，不会自动滚到下一版。" },
    { cat: "成本", q: "提示缓存能省多少", a: "缓存命中的输入按基础输入价 10% 计费(降 90%)，且不计入限流。Opus 4.8 最小可缓存 1024 token。适合系统提示、知识库、长文档等固定前缀。" },
    { cat: "成本", q: "批处理 Batch 怎么省", a: "异步批量，全模型立减 50%，24 小时内处理完成。可与提示缓存叠加。不适合实时场景。" },
    { cat: "成本", q: "成本优化的顺序", a: "第一位永远是选对模型族(先把负载分类)，再上提示缓存和批处理。缓存+批处理叠加最多可降 95% 成本。" },
    { cat: "API", q: "核心端点有哪些", a: "Messages(POST /v1/messages)核心生成；Message Batches 异步批量；Token Counting 发送前预估；Models 查询规格。" },
    { cat: "API", q: "工具调用怎么工作", a: "4 步：①传 tools 数组定义工具 ②模型返回 stop_reason=tool_use ③你执行后以 tool_result 回传 ④模型据结果生成最终回复。Claude 的工具编排是公认强项。" },
    { cat: "API", q: "流式输出注意什么", a: "stream:true 走 SSE。工具参数在 input_json_delta 是需累积的字符串增量；用户中途取消已生成 token 仍计费；200 开始不代表成功，可能中途 error。" },
    { cat: "API", q: "temperature 报 400", a: "Opus 4.7+ 对非默认 temperature/top_p/top_k 返回 400 错误，自适应思考已替代旧的扩展思考开关。" },
    { cat: "限流", q: "限流怎么算", a: "三维度 RPM/ITPM/OTPM，按模型独立计量(可同时跑多模型各自打满)。缓存命中的输入 token 不计入限流。用量陡增可能触发加速限制，需逐步放量。" },
    { cat: "Claude Code", q: "Claude Code 怎么省 token", a: "token 成本主要来自臃肿的上下文。收窄范围(单函数>单文件>整模块)、点名相关文件、用子代理隔离调研、要求简洁输出、配精简 CLAUDE.md(300-600 token)。会话间用 /compact 和 /clear。" },
    { cat: "Claude Code", q: "多代理成本", a: "Claude Code 可派生子代理，每个维护独立上下文。3 代理团队约用 7× 单代理 token——并行加速的代价是成本成倍上升。" },
    { cat: "合规", q: "数据驻留怎么办", a: "API 支持 EU 多区域处理(2025/08起)；合规敏感行业有 US-only 推理选项(约 1.1× 价格)；走 Bedrock/Vertex/Foundry 可并入既有云合规框架。消费端默认无 EU 驻留。" },
    { cat: "产品", q: "Claude 有什么短板", a: "无原生图像/音频/视频生成(与 GPT/Gemini 最大差距)；风格偏保守偏啰嗦；终端/CLI 自动化弱于 GPT-5.5；多项亮点功能仍 beta。" },
    { cat: "产品", q: "Artifacts 能做产品吗", a: "能快速做可跑原型(约到可用 app 的 70%)，但不能部署/托管、不能连后端、限单文件、无持久存储。定位是原型与演示工具，剩余 30% 需专业开发。" },
  ],
};

// 暴露给全站脚本
if (typeof module !== "undefined") module.exports = DATA;
