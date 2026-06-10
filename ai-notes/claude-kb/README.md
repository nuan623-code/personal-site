# Claude 产品知识库 · 部署与维护指南

一个纯静态网站，无需服务器、无需构建工具，可直接部署到 GitHub Pages 并绑定自己的域名。

---

## 一、目录结构

```
site/
├── index.html              # 主页（入口）
├── assets/
│   ├── data.js             # ⭐ 唯一需要维护的数据文件
│   ├── styles.css          # 样式
│   ├── tools.js            # 两个交互工具
│   └── app.js              # 渲染逻辑与搜索
├── docs/                   # 可下载的文档
│   ├── Claude技术参考文档.pdf
│   ├── Claude产品线全解析.pdf
│   ├── Claude全产品详解手册.pdf
│   ├── Claude产品架构-分层蛋糕.html
│   └── Claude开发者层-完整手册.html
└── README.md               # 本文件
```

---

## 二、部署到 GitHub Pages（约 5 分钟）

1. **建仓库**：在 GitHub 新建一个仓库，例如 `claude-kb`（设为 Public）。

2. **上传文件**：把 `site/` 里的全部内容（注意是里面的内容，不是 site 文件夹本身）上传到仓库根目录。
   - 网页操作：仓库页面 → Add file → Upload files → 拖入所有文件
   - 命令行操作：
     ```bash
     cd site
     git init
     git add .
     git commit -m "init knowledge base"
     git branch -M main
     git remote add origin https://github.com/你的用户名/claude-kb.git
     git push -u origin main
     ```

3. **开启 Pages**：仓库 → Settings → Pages → Source 选 `Deploy from a branch` → Branch 选 `main` / `/ (root)` → Save。

4. **访问**：等 1-2 分钟，地址是 `https://你的用户名.github.io/claude-kb/`。

---

## 三、绑定自己的域名

1. **买域名**：在 Namecheap / Cloudflare / 阿里云等买一个域名（如 `claude-kb.com`）。

2. **加 CNAME 文件**：在仓库根目录新建一个名为 `CNAME`（无扩展名）的文件，内容就一行你的域名：
   ```
   claude-kb.com
   ```

3. **配置 DNS**（在域名服务商后台）：
   - 用 **apex 域名**（`claude-kb.com`）：加 4 条 A 记录指向 GitHub：
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```
   - 用 **www 子域名**（`www.claude-kb.com`）：加 1 条 CNAME 记录指向 `你的用户名.github.io`

4. **回 GitHub**：Settings → Pages → Custom domain 填入域名 → Save → 勾选 `Enforce HTTPS`（DNS 生效后才能勾，可能要等几小时）。

---

## 四、⭐ 怎么更新数据（最重要）

**所有易变数据都集中在 `assets/data.js` 一个文件里。改它，全站自动生效——包括两个工具的计算。**

打开 `assets/data.js`，每个区块都标了 `【来源】` 和 `【更新频率】`。常见更新场景：

| 想改什么 | 改 data.js 里的哪块 |
|---|---|
| 模型价格 / 新模型发布 | `models` 数组 |
| 套餐价格 / 额度 | `plans` 数组 |
| 竞品基准分数 | `benchmarks.rows` |
| 缓存/批处理折扣 | `costFactors` |
| 搜索能搜到的知识点 | `knowledge` 数组（往里加条目即可） |
| 可下载的文档 | `documents` 数组 |

改完别忘了把顶部的 `meta.lastUpdated` 日期也更新一下，页面会显示"更新于 XXXX-XX-XX"。

**改完怎么上线**：把改过的 `data.js` 重新上传到 GitHub（或 `git push`），1-2 分钟后网站自动更新。不需要重新构建。

### 示例：Opus 出了新版本，价格变了

在 `data.js` 找到 `models` 数组里的 opus 那行，改 `in` / `out` / `apiId` / `cutoff` 即可：
```js
{ id: "opus", name: "Opus 5.0", apiId: "claude-opus-5-0", tier: "旗舰",
  in: 6, out: 30, ctx: "1M", maxOut: "128k", thinking: "自适应", cutoff: "2026-06", color: "#c96442", note: "..." },
```
保存、上传，完成。参考数据表、两个工具的计算会全部自动跟着变。

---

## 五、本地预览

因为用了多个 JS 文件，直接双击 `index.html` 可能因浏览器安全策略加载不出数据。本地预览请用一个简易服务器：

```bash
cd site
python3 -m http.server 8000
# 然后浏览器打开 http://localhost:8000
```

部署到 GitHub Pages 后就没这个问题了（它本身就是服务器）。

---

## 六、维护建议

- **每月**核对一次 `models` 和 `benchmarks`（更新最频繁）。
- 新增知识点直接往 `knowledge` 数组加，搜索立刻能搜到。
- 厚重文档（PDF）放进 `docs/`，在 `documents` 数组登记一条即可出现在首页卡片。
- 数据来源请认准官方：`platform.claude.com`、`claude.ai/pricing`、`support.claude.com`。
```
