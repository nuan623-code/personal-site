/* ============ Claude 知识库 · 主应用脚本 ============
 * 所有内容从 DATA（data.js）动态渲染。改 data.js 全站生效。
 */
(function(){
  const $ = (s,r=document)=>r.querySelector(s);
  const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  // ---------- 顶部 meta ----------
  $('#meta-bar').innerHTML = `
    <span><b>${DATA.documents.length + 2}</b> 份产出</span>
    <span><b>3</b> 类：文档 · 架构 · 工具</span>
    <span>数据时点 <b>${DATA.meta.dataDate}</b></span>
    <span>旗舰 <b>${DATA.meta.flagship}</b></span>
    <span>更新于 <b>${DATA.meta.lastUpdated}</b></span>`;

  // ================= 首页：文档/架构卡片 =================
  function renderHome(){
    const docs = DATA.documents.filter(d=>d.cat==='doc');
    const archs = DATA.documents.filter(d=>d.cat==='arch');
    const cardHTML = d => `
      <a class="card" style="--cc:${d.color}" href="${d.file}" target="_blank">
        <div class="card-icon">${d.icon}</div>
        <div class="card-type">${d.type}</div>
        <div class="card-title">${d.title}</div>
        <div class="card-desc">${d.desc}</div>
        <div class="card-tags">${d.tags.map(t=>`<span class="ctag">${t}</span>`).join('')}</div>
        <div class="card-foot">打开 →</div>
      </a>`;
    const toolCard = (cc,icon,title,desc,tags,v) => `
      <div class="card" style="--cc:${cc}" data-goto="${v}">
        <div class="card-icon">${icon}</div>
        <div class="card-type">实时计算工具</div>
        <div class="card-title">${title}</div>
        <div class="card-desc">${desc}</div>
        <div class="card-tags">${tags.map(t=>`<span class="ctag">${t}</span>`).join('')}</div>
        <div class="card-foot">在此打开 →</div>
      </div>`;
    $('#view-home').innerHTML = `
      <div class="sec-label">产品文档</div>
      <div class="cards">${docs.map(cardHTML).join('')}</div>
      <div class="sec-label">产品架构</div>
      <div class="cards">${archs.map(cardHTML).join('')}</div>
      <div class="sec-label">交互工具</div>
      <div class="cards">
        ${toolCard('#7fb88a','🧮','Token 预算估算器','事前算出任务消耗多少 token、花多少钱。对比模型与工具组合，找最省方案。',['成本测算','方案对比','智能建议'],'estimator')}
        ${toolCard('#7fa8d4','⌨️','Claude Code 指令生成器','填任务要素，生成省 token 的指令，估算比随意指令省多少。',['指令优化','节省估算'],'ccprompt')}
      </div>`;
    $('#view-home').querySelectorAll('[data-goto]').forEach(el=>el.addEventListener('click',()=>switchView(el.dataset.goto)));
  }

  // ================= 参考数据（从 data.js 渲染表格）=================
  function renderReference(){
    const m = DATA.models;
    const modelRows = m.map(x=>`<tr>
      <td><b>${x.name}</b><span class="tier-tag" style="background:${x.color}">${x.tier}</span></td>
      <td><code>${x.apiId}</code></td>
      <td>$${x.in}</td><td>$${x.out}</td><td>${x.ctx}</td><td>${x.maxOut}</td>
      <td>${x.thinking}</td><td>${x.cutoff}</td></tr>`).join('');
    const planRows = DATA.plans.map(p=>`<tr><td><b>${p.name}</b></td><td>${p.price}</td><td>${p.quota}</td><td>${p.for}</td><td>${p.features}</td></tr>`).join('');
    const rlRows = DATA.rateLimits.map(r=>`<tr><td><code>${r.dim}</code></td><td>${r.full}</td><td>${r.desc}</td></tr>`).join('');
    const chRows = DATA.channels.map(c=>`<tr><td><b>${c.name}</b></td><td>${c.value}</td><td>${c.limit}</td></tr>`).join('');
    // 竞品
    const b = DATA.benchmarks;
    const benchHead = `<tr><th>基准</th>${b.competitors.map(c=>`<th>${c}</th>`).join('')}<th>说明</th></tr>`;
    const benchRows = b.rows.map(r=>`<tr><td><b>${r.metric}</b></td>${r.values.map((v,i)=>`<td class="${i===r.winner?'win':''}">${v}%</td>`).join('')}<td style="color:var(--dim)">${r.desc}</td></tr>`).join('');

    $('#view-reference').innerHTML = `
      <div class="sec-label">模型规格</div>
      <table class="dtable">
        <tr><th>模型</th><th>API ID</th><th>输入</th><th>输出</th><th>上下文</th><th>最大输出</th><th>思考</th><th>知识截止</th></tr>
        ${modelRows}
      </table>
      <div class="note tip"><span class="nt">成本要点</span>输出价均为输入价 5 倍。缓存命中输入按 ${DATA.costFactors.cacheInputMult*100}% 计费、批处理全模型降 ${(1-DATA.costFactors.batchMult)*100}%、最小可缓存 ${DATA.costFactors.cacheMinTokens} token、${DATA.costFactors.agentMultNote}。</div>

      <div class="sec-label">消费端套餐</div>
      <table class="dtable">
        <tr><th>套餐</th><th>价格</th><th>额度</th><th>适合</th><th>关键功能</th></tr>
        ${planRows}
      </table>

      <div class="sec-label">限流维度</div>
      <table class="dtable"><tr><th>维度</th><th>全称</th><th>说明</th></tr>${rlRows}</table>

      <div class="sec-label">分发渠道</div>
      <table class="dtable"><tr><th>渠道</th><th>核心价值</th><th>请求体上限</th></tr>${chRows}</table>

      <div class="sec-label">竞品横向对比</div>
      <table class="dtable">${benchHead}${benchRows}</table>
      <div class="note warn"><span class="nt">注意</span>${b.note}</div>`;
  }

  // ================= 搜索 =================
  function highlight(text, q){
    if(!q) return esc(text);
    const re = new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','ig');
    return esc(text).replace(re,'<mark>$1</mark>');
  }
  function doSearch(q){
    const box = $('#search-results');
    const clr = $('#search-clear');
    q = q.trim();
    clr.style.display = q ? 'block' : 'none';
    if(!q){ box.innerHTML=''; return; }
    const ql = q.toLowerCase();
    // 搜知识条目
    const kHits = DATA.knowledge.filter(k=>(k.q+k.a+k.cat).toLowerCase().includes(ql));
    // 搜文档
    const dHits = DATA.documents.filter(d=>(d.title+d.desc+d.tags.join('')).toLowerCase().includes(ql));
    if(!kHits.length && !dHits.length){
      box.innerHTML = `<div class="sr-empty">没有找到与"${esc(q)}"相关的内容。试试：缓存、限流、工具调用、Claude Code、套餐……</div>`;
      return;
    }
    let html = '';
    if(dHits.length){
      html += dHits.map(d=>`<div class="sr-item"><div class="sr-cat">文档 · ${d.type}</div>
        <div class="sr-doc"><span class="di">${d.icon}</span><a href="${d.file}" target="_blank">${highlight(d.title,q)} →</a></div>
        <div class="sr-a">${highlight(d.desc,q)}</div></div>`).join('');
    }
    if(kHits.length){
      html += kHits.map(k=>`<div class="sr-item"><div class="sr-cat">${k.cat}</div>
        <div class="sr-q">${highlight(k.q,q)}</div>
        <div class="sr-a">${highlight(k.a,q)}</div></div>`).join('');
    }
    box.innerHTML = html;
  }
  $('#search-input').addEventListener('input', e=>doSearch(e.target.value));
  $('#search-clear').addEventListener('click', ()=>{ $('#search-input').value=''; doSearch(''); $('#search-input').focus(); });

  // ================= 视图切换 =================
  window.switchView = function(v){
    document.querySelectorAll('.view').forEach(el=>el.classList.remove('active'));
    document.querySelectorAll('.toptab').forEach(el=>el.classList.remove('active'));
    $('#view-'+v).classList.add('active');
    document.querySelector(`.toptab[data-v="${v}"]`)?.classList.add('active');
    window.scrollTo({top:0,behavior:'smooth'});
  };
  document.querySelectorAll('.toptab').forEach(t=>t.addEventListener('click',()=>switchView(t.dataset.v)));

  // ================= 可视化仪表盘（新首页）=================
  let dashboardRendered = false;
  function renderDashboard(){
    if(dashboardRendered) return;  // 图表只渲染一次（带动画）
    const v = $('#view-dashboard');
    v.innerHTML = `
      <div class="dash-grid">
        <div class="dash-card span2">
          <div class="dash-title">📊 三档模型定价对比</div>
          <div class="dash-chart" id="ch-price"></div>
        </div>
        <div class="dash-card">
          <div class="dash-title">🎯 竞品多维能力</div>
          <div class="dash-chart" id="ch-radar"></div>
        </div>
        <div class="dash-card">
          <div class="dash-title">💎 性价比定位</div>
          <div class="dash-chart" id="ch-scatter"></div>
        </div>
        <div class="dash-card">
          <div class="dash-title">💧 成本优化瀑布</div>
          <div class="dash-chart" id="ch-waterfall"></div>
        </div>
        <div class="dash-card">
          <div class="dash-title">🍰 产品分层架构</div>
          <div class="dash-chart" id="ch-arch"></div>
        </div>
        <div class="dash-card span2">
          <div class="dash-title">📏 上下文窗口对比</div>
          <div class="dash-chart" id="ch-context"></div>
        </div>
      </div>`;
    CHARTS.priceBar($('#ch-price'));
    CHARTS.radar($('#ch-radar'));
    CHARTS.scatter($('#ch-scatter'));
    CHARTS.waterfall($('#ch-waterfall'));
    CHARTS.archStack($('#ch-arch'));
    CHARTS.contextBars($('#ch-context'));
    dashboardRendered = true;
  }
  window._renderDashboard = renderDashboard;

  // ---------- init ----------
  renderDashboard();
  renderHome();
  renderReference();
  // 工具由 tools.js 渲染
  if(window._renderEstimator) window._renderEstimator();
  if(window._renderCCPrompt) window._renderCCPrompt();
})();
