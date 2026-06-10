/* ============ Claude 知识库 · 交互工具 ============
 * 价格与系数从 DATA 读取，改 data.js 工具自动跟着变。
 */

// 从 DATA 构建模型价格表
const _M = {};
DATA.models.forEach(m => { _M[m.id] = { name: m.name, in: m.in, out: m.out, color: m.color }; });
const _CF = DATA.costFactors;

// =================================================================
// 工具 1：Token 预算估算器
// =================================================================
(function(){
  const CACHE=_CF.cacheInputMult, BATCH=_CF.batchMult;
  const agentMult=n=>n<=1?1:1+(n-1)*3;
  const fmtTok=n=>n>=1e6?(n/1e6).toFixed(2)+"M":n>=1e3?(n/1e3).toFixed(1)+"k":Math.round(n)+"";
  const fmtUSD=n=>n>=1?"$"+n.toFixed(2):"$"+n.toFixed(4);
  const st={model:"sonnet",fixedPrefix:20000,varInput:2000,output:1500,calls:1000,toolRounds:1,agents:1,cache:false,batch:false};

  function compute(o){
    let rawIn=0,cachedIn=0,out=0;
    for(let r=1;r<=o.toolRounds;r++){
      const acc=(r-1)*(o.output+o.varInput*0.3);
      const ri=o.fixedPrefix+o.varInput+acc;
      if(o.cache){cachedIn+=o.fixedPrefix;rawIn+=ri-o.fixedPrefix;}else rawIn+=ri;
      out+=o.output;
    }
    const aM=agentMult(o.agents);rawIn*=aM;cachedIn*=aM;out*=aM;
    const bM=o.batch?BATCH:1,m=_M[o.model];
    const cpc=(rawIn/1e6)*m.in*bM+(cachedIn/1e6)*m.in*CACHE*bM+(out/1e6)*m.out*bM;
    return{rawIn,cachedIn,out,aM,tokensPerCall:rawIn+cachedIn+out,costPerCall:cpc,totalCost:cpc*o.calls,totalTokens:(rawIn+cachedIn+out)*o.calls};
  }
  function render(){
    const host=document.getElementById('estimator-host'); if(!host)return;
    const calc=compute({...st});
    const scen=[
      {l:"基线无优化",c:compute({...st,cache:false,batch:false}).totalCost},
      {l:"+缓存",c:compute({...st,cache:true,batch:false}).totalCost},
      {l:"+批处理",c:compute({...st,cache:false,batch:true}).totalCost},
      {l:"缓存+批",c:compute({...st,cache:true,batch:true}).totalCost},
      {l:"Sonnet全优化",c:compute({...st,model:"sonnet",cache:true,batch:true}).totalCost},
      {l:"Haiku全优化",c:compute({...st,model:"haiku",cache:true,batch:true}).totalCost},
    ];
    const baseline=scen[0].c,cheapest=Math.min(...scen.map(s=>s.c));
    const saving=baseline>0?(1-calc.totalCost/baseline)*100:0;
    const maxC=Math.max(...scen.map(s=>s.c)),M=_M[st.model];
    const tips=[];
    if(!st.cache&&st.fixedPrefix>=_CF.cacheMinTokens&&st.calls>10)tips.push({k:"win",x:`有 ${fmtTok(st.fixedPrefix)} 固定前缀 × ${st.calls} 次——开缓存约省 ${fmtUSD((st.fixedPrefix*0.9*M.in/1e6)*st.calls*st.toolRounds)}（输入侧）。`});
    if(!st.batch&&st.toolRounds<=1)tips.push({k:"win",x:`单轮、可异步任务——走批处理直接砍 ${(1-BATCH)*100}% 成本。`});
    if(st.toolRounds>=4)tips.push({k:"warn",x:`工具往返 ${st.toolRounds} 轮，上下文每轮重复发送，输入成本随轮数累积。考虑合并工具、裁剪中间结果。`});
    if(st.agents>=3)tips.push({k:"warn",x:`${st.agents} 个并行代理使 token 放大 ${calc.aM.toFixed(1)}×。确认并行确实缩短总时长，否则串行更省。`});
    if(st.model==="opus"&&st.toolRounds<=2&&st.output<2000)tips.push({k:"tip",x:"任务不算复杂却用 Opus——先用 Sonnet 跑样本对比质量，多数生产负载够用。"});
    if(st.fixedPrefix<_CF.cacheMinTokens&&st.cache)tips.push({k:"warn",x:`固定前缀不足 ${_CF.cacheMinTokens} token，达不到最小可缓存阈值，缓存可能不生效。`});
    if(!tips.length)tips.push({k:"tip",x:"当前配置较精简。继续监控 Console 缓存命中率与实际用量微调。"});

    const slider=(label,key,min,max,step,unit)=>`<div class="t-field"><div class="t-label"><span>${label}</span><span class="v">${unit==="tok"?fmtTok(st[key]):st[key]+(unit||"")}</span></div><input type="range" min="${min}" max="${max}" step="${step}" value="${st[key]}" data-key="${key}"></div>`;
    const tog=(label,desc,key)=>`<div class="tog ${st[key]?'on':''}" data-tog="${key}"><div><div class="tn">${label}</div><div class="td">${desc}</div></div><span class="tpill">${st[key]?'ON':'OFF'}</span></div>`;
    const mbtns=Object.entries(_M).map(([k,m])=>`<button class="mbtn ${st.model===k?'on':''}" data-model="${k}">${m.name}<br><small>$${m.in}/$${m.out}</small></button>`).join('');

    host.innerHTML=`
      <div class="t-head"><div class="t-kicker">Token Budget Estimator</div>
        <div class="t-title">任务 Token <span class="accent">预算估算器</span></div>
        <div class="t-lede">事前就知道任务消耗多少 token、花多少钱，对比不同模型与工具组合。拖动参数实时计算。</div></div>
      <div class="t-grid two">
        <div><div class="t-panel">
          <div class="t-ptitle">① 选模型</div><div class="mrow">${mbtns}</div>
          <div class="t-ptitle" style="margin-top:20px">② 任务特征</div>
          ${slider("固定前缀(系统提示+知识库)","fixedPrefix",0,200000,1000,"tok")}
          ${slider("每次可变输入","varInput",100,50000,100,"tok")}
          ${slider("每次输出","output",100,20000,100,"tok")}
          ${slider("任务总调用次数","calls",1,100000,1,"tok")}
          ${slider("工具调用往返轮数","toolRounds",1,10,1," 轮")}
          ${slider("并行代理数","agents",1,6,1," 个")}
          <div class="t-ptitle" style="margin-top:20px">③ 优化方案</div>
          ${tog("提示缓存",`固定前缀按 ${CACHE*100}% 计费(降 90%)`,"cache")}
          ${tog("批处理 Batch",`异步，全模型降 ${(1-BATCH)*100}%`,"batch")}
        </div></div>
        <div>
          <div class="stats">
            <div class="stat hl"><div class="sl">预估总成本</div><div class="sv" style="color:#e07a52">${fmtUSD(calc.totalCost)}</div><div class="ss">${saving>0.5?'较基线省 '+saving.toFixed(0)+'%':'未启用优化'}</div></div>
            <div class="stat"><div class="sl">总 Token</div><div class="sv">${fmtTok(calc.totalTokens)}</div><div class="ss">每次 ${fmtTok(calc.tokensPerCall)}</div></div>
            <div class="stat"><div class="sl">单次成本</div><div class="sv">${fmtUSD(calc.costPerCall)}</div><div class="ss">${st.calls.toLocaleString()} 次</div></div>
          </div>
          <div class="bd">
            <div class="bdi" style="border-top:2px solid #c96442"><div class="l">未缓存输入</div><div class="n">${fmtTok(calc.rawIn)}</div></div>
            <div class="bdi" style="border-top:2px solid #7fa8d4"><div class="l">缓存输入</div><div class="n">${fmtTok(calc.cachedIn)}</div></div>
            <div class="bdi" style="border-top:2px solid #e8a87c"><div class="l">输出</div><div class="n">${fmtTok(calc.out)}</div></div>
          </div>
          <div class="t-panel"><div class="t-ptitle">方案对比 · 同任务不同组合总成本</div>
            <div class="chartwrap">${scen.map(s=>{const h=maxC>0?Math.max(s.c/maxC*130,2):2;const cheap=Math.abs(s.c-cheapest)<1e-6;return `<div class="barcol"><div class="barval">${fmtUSD(s.c)}</div><div class="bar" style="height:${h}px;background:${cheap?'#7fb88a':'#c96442'}"></div><div class="barlbl">${s.l}</div></div>`;}).join('')}</div>
            <div style="font-size:11px;color:#6f6a62;margin-top:8px"><span style="color:#7fb88a">■</span> 绿色为最省方案</div>
          </div>
          <div style="margin-top:16px"><div class="t-ptitle">智能优化建议</div>
            ${tips.map(t=>`<div class="tip-row ${t.k}"><b style="color:${t.k==='win'?'#7fb88a':t.k==='warn'?'#e07a52':'#7fa8d4'}">${t.k==='win'?'可省':t.k==='warn'?'注意':'建议'} ·</b> ${t.x}</div>`).join('')}
          </div>
        </div>
      </div>`;
    host.querySelectorAll('input[type=range]').forEach(el=>el.addEventListener('input',e=>{st[e.target.dataset.key]=Number(e.target.value);render();}));
    host.querySelectorAll('[data-model]').forEach(el=>el.addEventListener('click',()=>{st.model=el.dataset.model;render();}));
    host.querySelectorAll('[data-tog]').forEach(el=>el.addEventListener('click',()=>{st[el.dataset.tog]=!st[el.dataset.tog];render();}));
  }
  window._renderEstimator=render;
})();

// =================================================================
// 工具 2：Claude Code 指令生成器
// =================================================================
(function(){
  const BASE=45000;
  const F={scope:{none:1,file:0.55,func:0.38},files:{no:1,yes:0.7},subagent:{no:1,yes:0.65},concise:{no:1,yes:0.85},plan:{no:1,yes:0.92},claudemd:{no:1,yes:0.9}};
  const PRICE={opus:{in:_M.opus.in,out:_M.opus.out},sonnet:{in:_M.sonnet.in,out:_M.sonnet.out}};
  const fmtTok=n=>n>=1000?(n/1000).toFixed(1)+"k":Math.round(n)+"";
  const fmtUSD=n=>"$"+n.toFixed(2);
  const st={model:"sonnet",goal:"",target:"",scope:"func",namedFiles:true,subagent:false,concise:true,plan:true,claudemd:false,constraints:"",done:""};

  function est(){
    const mult=F.scope[st.scope]*F.files[st.namedFiles?"yes":"no"]*F.subagent[st.subagent?"yes":"no"]*F.concise[st.concise?"yes":"no"]*F.plan[st.plan?"yes":"no"]*F.claudemd[st.claudemd?"yes":"no"];
    const opt=BASE*mult,saved=BASE-opt,pct=(1-mult)*100;
    const cost=t=>(t*0.7/1e6)*PRICE[st.model].in+(t*0.3/1e6)*PRICE[st.model].out;
    return{naive:BASE,opt,saved,pct,naiveCost:cost(BASE),optCost:cost(opt)};
  }
  function buildPrompt(){
    const L=[];const sw=st.scope==="func"?"仅修改":st.scope==="file"?"在文件内":"在模块内";
    if(st.goal){let g=st.goal.trim();if(st.target)g+=`（${sw} ${st.target}）`;L.push(g);}
    else L.push("[填写目标，越具体越好，例如：修复 login() 在 token 过期时不刷新的 bug]");
    if(st.namedFiles&&st.target)L.push(`\n相关文件：${st.target}。不要扫描其它目录，如需更多上下文先问我。`);
    if(st.subagent)L.push(`\n如需了解现有实现，用子代理调研并只回报摘要，不要把整个调研过程留在主上下文里。`);
    if(st.plan)L.push(`\n先给出简短改动计划（改哪些文件、为什么），等我确认再动手。`);
    if(st.constraints)L.push(`\n约束：${st.constraints.trim()}`);
    if(st.done)L.push(`\n完成标准：${st.done.trim()}`);
    if(st.concise)L.push(`\n回复保持简洁：只说改了什么、为什么，不要逐步解说或寒暄。`);
    return L.join("\n");
  }
  function render(){
    const host=document.getElementById('ccprompt-host'); if(!host)return;
    const e=est(),p=buildPrompt();
    const inp=(label,sub,key,ph)=>`<div class="t-field"><div class="t-label"><span>${label} <span class="sub">${sub}</span></span></div><input class="t-input" data-in="${key}" value="${String(st[key]).replace(/"/g,'&quot;')}" placeholder="${ph}"></div>`;
    const tog=(label,desc,key)=>`<div class="tog ${st[key]?'on':''}" data-tog="${key}"><div><div class="tn">${label}</div><div class="td">${desc}</div></div><span class="tpill">${st[key]?'ON':'OFF'}</span></div>`;
    host.innerHTML=`
      <div class="t-head"><div class="t-kicker">Claude Code · Prompt Optimizer</div>
        <div class="t-title">Claude Code <span class="accent">指令生成器</span></div>
        <div class="t-lede">怎么沟通直接决定 token 消耗——Claude Code 是 Agent，会读文件、跑命令、多轮迭代。填好要素，生成省 token 的指令。</div></div>
      <div class="t-grid two">
        <div class="t-panel">
          <div class="t-ptitle">① 任务要素</div>
          ${inp("目标","动词开头，具体到行为","goal","修复 login() 在 token 过期时不自动刷新的 bug")}
          ${inp("目标文件/函数","点名，避免全库扫描","target","src/auth.ts 的 login 函数")}
          <div class="t-field"><div class="t-label"><span>改动范围 <span class="sub">越窄越省</span></span></div>
            <div class="seg"><button class="segb ${st.scope==='none'?'on':''}" data-scope="none">整模块</button><button class="segb ${st.scope==='file'?'on':''}" data-scope="file">单文件</button><button class="segb ${st.scope==='func'?'on':''}" data-scope="func">单函数</button></div></div>
          ${inp("约束","选填，别动什么、用什么库","constraints","不改公共 API；沿用现有 axios 封装")}
          ${inp("完成标准","选填，让它知道何时停","done","现有测试全过，无新增依赖")}
          <div class="t-ptitle" style="margin-top:20px">② 沟通策略</div>
          ${tog("点名相关文件","省去探索性全库读取(最大单项节省之一)","namedFiles")}
          ${tog("用子代理隔离调研","调研在独立上下文跑，只回报摘要","subagent")}
          ${tog("先计划后动手","先确认方案，减少改错返工","plan")}
          ${tog("要求简洁输出","去掉逐步解说与寒暄，省输出 token","concise")}
          ${tog("已配精简 CLAUDE.md","项目级规则前置(300–600 token 最佳)","claudemd")}
          <div class="t-ptitle" style="margin-top:20px">③ 模型</div>
          <div class="mrow"><button class="mbtn ${st.model==='sonnet'?'on':''}" data-model="sonnet">${_M.sonnet.name} <small>$${_M.sonnet.in}/$${_M.sonnet.out}</small></button><button class="mbtn ${st.model==='opus'?'on':''}" data-model="opus">${_M.opus.name} <small>$${_M.opus.in}/$${_M.opus.out}</small></button></div>
        </div>
        <div>
          <div class="stats">
            <div class="stat"><div class="sl">随意指令</div><div class="sv" style="color:#e07a52">${fmtTok(e.naive)}</div><div class="ss">≈ ${fmtUSD(e.naiveCost)}/任务</div></div>
            <div class="stat hi"><div class="sl">优化指令</div><div class="sv" style="color:#7fb88a">${fmtTok(e.opt)}</div><div class="ss">≈ ${fmtUSD(e.optCost)}/任务</div></div>
            <div class="stat"><div class="sl">节省</div><div class="sv" style="color:#e8a87c">${e.pct.toFixed(0)}%</div><div class="ss">省 ${fmtTok(e.saved)} token</div></div>
          </div>
          <div class="sl" style="font-size:11px;color:#a8a097;margin-bottom:0">上下文消耗对比</div>
          <div class="progbar"><div class="progfill" style="width:100%;background:#e07a52"></div></div>
          <div style="font-size:10.5px;color:#6f6a62;margin:3px 0 6px">随意指令（基线）</div>
          <div class="progbar"><div class="progfill" style="width:${(e.opt/e.naive*100).toFixed(0)}%;background:#7fb88a"></div></div>
          <div style="font-size:10.5px;color:#6f6a62;margin-top:3px">优化指令</div>
          <div class="t-ptitle" style="margin-top:22px">生成的指令（复制到 Claude Code）</div>
          <div class="promptbox"><button class="copybtn" id="cc-copy">复制</button>${p.replace(/</g,'&lt;')}</div>
          <div style="font-size:11.5px;color:#a8a097;margin-top:14px;line-height:1.7;font-weight:300">
            <b style="color:#e8a87c">会话期间还能做：</b><br>· 工作阶段间用 <code>/compact</code>，不相关任务间用 <code>/clear</code><br>· 快速提问用 <code>/btw</code>（不进上下文历史）<br>· 一个会话只做一类任务<br>· 加 <code>.claudeignore</code> 排除 node_modules / 构建产物</div>
        </div>
      </div>`;
    host.querySelectorAll('[data-in]').forEach(el=>el.addEventListener('input',e=>{st[e.target.dataset.in]=e.target.value;const k=e.target.dataset.in,pos=e.target.selectionStart;render();const n=document.querySelector(`#ccprompt-host [data-in="${k}"]`);if(n){n.focus();try{n.setSelectionRange(pos,pos);}catch(x){}}}));
    host.querySelectorAll('[data-scope]').forEach(el=>el.addEventListener('click',()=>{st.scope=el.dataset.scope;render();}));
    host.querySelectorAll('[data-model]').forEach(el=>el.addEventListener('click',()=>{st.model=el.dataset.model;render();}));
    host.querySelectorAll('[data-tog]').forEach(el=>el.addEventListener('click',()=>{st[el.dataset.tog]=!st[el.dataset.tog];render();}));
    const cp=host.querySelector('#cc-copy');
    if(cp)cp.addEventListener('click',()=>{navigator.clipboard?.writeText(buildPrompt());cp.textContent='✓ 已复制';cp.classList.add('done');setTimeout(()=>{cp.textContent='复制';cp.classList.remove('done');},1500);});
  }
  window._renderCCPrompt=render;
})();
