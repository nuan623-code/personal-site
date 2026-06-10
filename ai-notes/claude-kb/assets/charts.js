/* ============ Claude 知识库 · 可视化图表模块 ============
 * 纯 SVG 手绘，无外部依赖，数据全部来自 DATA。
 * GitHub Pages 直接可跑。
 */
(function(){
  const NS="http://www.w3.org/2000/svg";
  const C={ink:"#f5f0e8",muted:"#a8a097",dim:"#6f6a62",grid:"rgba(245,240,232,0.08)",orange:"#e07a52",amber:"#e8a87c",green:"#7fb88a",blue:"#7fa8d4"};
  const el=(t,a={})=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);return e;};
  const fmtUSD=n=>n>=1?"$"+n.toFixed(0):"$"+n.toFixed(2);

  // ============ 1. 定价分组柱状图 ============
  function priceBar(host){
    const W=440,H=240,pad={t:24,r:16,b:42,l:40};
    const models=DATA.models;
    const maxV=Math.max(...models.map(m=>m.out));
    const svg=el("svg",{viewBox:`0 0 ${W} ${H}`,width:"100%"});
    const cw=(W-pad.l-pad.r)/models.length;
    // y网格
    for(let i=0;i<=5;i++){const y=pad.t+(H-pad.t-pad.b)*i/5;const v=maxV*(1-i/5);
      svg.appendChild(el("line",{x1:pad.l,y1:y,x2:W-pad.r,y2:y,stroke:C.grid,"stroke-width":1}));
      const tx=el("text",{x:pad.l-6,y:y+3,fill:C.dim,"font-size":9,"text-anchor":"end"});tx.textContent="$"+Math.round(v);svg.appendChild(tx);}
    models.forEach((m,i)=>{
      const cx=pad.l+cw*i+cw/2, bw=cw*0.28, gap=bw*0.6;
      const hIn=(H-pad.t-pad.b)*m.in/maxV, hOut=(H-pad.t-pad.b)*m.out/maxV;
      // 输入
      const r1=el("rect",{x:cx-bw-gap/2,y:H-pad.b,width:bw,height:0,rx:3,fill:m.color,opacity:.55});
      // 输出
      const r2=el("rect",{x:cx+gap/2,y:H-pad.b,width:bw,height:0,rx:3,fill:m.color});
      svg.appendChild(r1);svg.appendChild(r2);
      setTimeout(()=>{r1.setAttribute("y",H-pad.b-hIn);r1.setAttribute("height",hIn);r1.style.transition="all .7s cubic-bezier(.2,.8,.2,1)";
        r2.setAttribute("y",H-pad.b-hOut);r2.setAttribute("height",hOut);r2.style.transition="all .7s cubic-bezier(.2,.8,.2,1)";},50+i*90);
      // 数值
      const t1=el("text",{x:cx-bw/2-gap/2,y:H-pad.b-hIn-5,fill:C.muted,"font-size":9,"text-anchor":"middle"});t1.textContent="$"+m.in;svg.appendChild(t1);
      const t2=el("text",{x:cx+bw/2+gap/2,y:H-pad.b-hOut-5,fill:C.amber,"font-size":9.5,"text-anchor":"middle","font-weight":700});t2.textContent="$"+m.out;svg.appendChild(t2);
      // 名称
      const tn=el("text",{x:cx,y:H-pad.b+15,fill:C.ink,"font-size":11,"text-anchor":"middle","font-weight":600});tn.textContent=m.name;svg.appendChild(tn);
      const tt=el("text",{x:cx,y:H-pad.b+28,fill:C.dim,"font-size":8.5,"text-anchor":"middle"});tt.textContent=m.tier;svg.appendChild(tt);
    });
    host.appendChild(svg);
    host.insertAdjacentHTML("beforeend",`<div class="legend"><span><i style="background:${C.muted}99"></i>输入</span><span><i style="background:${C.amber}"></i>输出</span><span class="lg-note">每百万 token · 输出均为输入 5×</span></div>`);
  }

  // ============ 2. 竞品多维雷达图 ============
  function radar(host){
    const size=300,cx=size/2,cy=size/2+6,R=98;
    const b=DATA.benchmarks, axes=b.rows, n=axes.length;
    const colors=[C.orange,C.blue,C.green];
    const svg=el("svg",{viewBox:`0 0 ${size} ${size+30}`,width:"100%"});
    // 网格圈
    for(let g=1;g<=4;g++){
      const pts=[];for(let i=0;i<n;i++){const a=Math.PI*2*i/n-Math.PI/2;pts.push((cx+Math.cos(a)*R*g/4)+","+(cy+Math.sin(a)*R*g/4));}
      svg.appendChild(el("polygon",{points:pts.join(" "),fill:"none",stroke:C.grid,"stroke-width":1}));
    }
    // 轴线 + 标签
    axes.forEach((ax,i)=>{
      const a=Math.PI*2*i/n-Math.PI/2;
      svg.appendChild(el("line",{x1:cx,y1:cy,x2:cx+Math.cos(a)*R,y2:cy+Math.sin(a)*R,stroke:C.grid,"stroke-width":1}));
      const lx=cx+Math.cos(a)*(R+16),ly=cy+Math.sin(a)*(R+16);
      const t=el("text",{x:lx,y:ly+3,fill:C.muted,"font-size":8.5,"text-anchor":Math.abs(Math.cos(a))<0.3?"middle":(Math.cos(a)>0?"start":"end")});
      t.textContent=ax.metric.length>6?ax.metric.slice(0,6):ax.metric;svg.appendChild(t);
    });
    // 三个模型多边形
    b.competitors.forEach((comp,ci)=>{
      const pts=axes.map((ax,i)=>{const a=Math.PI*2*i/n-Math.PI/2;const v=ax.values[ci]/100;return [cx+Math.cos(a)*R*v, cy+Math.sin(a)*R*v];});
      const poly=el("polygon",{points:pts.map(p=>"0,0").join(" "),fill:colors[ci]+"22",stroke:colors[ci],"stroke-width":2,"stroke-linejoin":"round"});
      svg.appendChild(poly);
      setTimeout(()=>{poly.setAttribute("points",pts.map(p=>p[0]+","+p[1]).join(" "));poly.style.transition="all .8s cubic-bezier(.2,.8,.2,1)";},100+ci*120);
    });
    host.appendChild(svg);
    host.insertAdjacentHTML("beforeend",`<div class="legend">${b.competitors.map((c,i)=>`<span><i style="background:${colors[i]}"></i>${c}</span>`).join("")}</div>`);
  }

  // ============ 3. 性价比散点图（智能指数 vs 价格）============
  function scatter(host){
    const W=440,H=260,pad={t:20,r:20,b:42,l:46};
    const models=DATA.models;
    const maxP=Math.max(...models.map(m=>m.out))*1.1, maxI=70, minI=40;
    const svg=el("svg",{viewBox:`0 0 ${W} ${H}`,width:"100%"});
    // 网格
    for(let i=0;i<=4;i++){const y=pad.t+(H-pad.t-pad.b)*i/4;svg.appendChild(el("line",{x1:pad.l,y1:y,x2:W-pad.r,y2:y,stroke:C.grid}));
      const v=maxI-(maxI-minI)*i/4;const t=el("text",{x:pad.l-6,y:y+3,fill:C.dim,"font-size":9,"text-anchor":"end"});t.textContent=Math.round(v);svg.appendChild(t);}
    // 轴标
    const xl=el("text",{x:(pad.l+W-pad.r)/2,y:H-6,fill:C.muted,"font-size":9.5,"text-anchor":"middle"});xl.textContent="输出价 ($/MTok) →";svg.appendChild(xl);
    const yl=el("text",{x:12,y:(pad.t+H-pad.b)/2,fill:C.muted,"font-size":9.5,"text-anchor":"middle",transform:`rotate(-90 12 ${(pad.t+H-pad.b)/2})`});yl.textContent="智能指数 →";svg.appendChild(yl);
    // 点
    const px=p=>pad.l+(W-pad.l-pad.r)*p/maxP;
    const py=i=>pad.t+(H-pad.t-pad.b)*(1-(i-minI)/(maxI-minI));
    // 连线（性价比前沿）
    const sorted=[...models].sort((a,b)=>a.out-b.out);
    const path=sorted.map((m,i)=>(i?"L":"M")+px(m.out)+" "+py(m.intel)).join(" ");
    const pl=el("path",{d:path,fill:"none",stroke:C.orange,"stroke-width":1.5,"stroke-dasharray":"4 4",opacity:.4});svg.appendChild(pl);
    models.forEach((m,i)=>{
      const x=px(m.out),y=py(m.intel);
      const c=el("circle",{cx:x,cy:y,r:0,fill:m.color,stroke:"#0d0c0b","stroke-width":2});svg.appendChild(c);
      setTimeout(()=>{c.setAttribute("r",9);c.style.transition="r .5s cubic-bezier(.3,1.5,.5,1)";},150+i*120);
      const t=el("text",{x:x,y:y-14,fill:C.ink,"font-size":10,"text-anchor":"middle","font-weight":600});t.textContent=m.name;svg.appendChild(t);
    });
    host.appendChild(svg);
    host.insertAdjacentHTML("beforeend",`<div class="legend"><span class="lg-note">越靠左上 = 越高性价比（高智能 / 低价格）</span></div>`);
  }

  // ============ 4. 成本优化瀑布图 ============
  function waterfall(host){
    // 用一个示例负载：固定前缀20k+输入2k+输出1.5k ×1000次，Sonnet
    const M=DATA.models.find(m=>m.id==="sonnet");
    const cf=DATA.costFactors;
    const calls=1000, fixed=20000, vin=2000, out=1500;
    const baseIn=(fixed+vin)/1e6*M.in*calls, baseOut=out/1e6*M.out*calls;
    const base=baseIn+baseOut;
    // 缓存：前缀降到10%
    const cached=((fixed*cf.cacheInputMult+vin)/1e6*M.in*calls)+baseOut;
    const cacheSave=base-cached;
    // 批处理：在缓存基础上再5折
    const both=cached*cf.batchMult;
    const batchSave=cached-both;
    const steps=[
      {l:"基线",v:base,type:"total"},
      {l:"提示缓存",v:-cacheSave,type:"down"},
      {l:"批处理",v:-batchSave,type:"down"},
      {l:"最终",v:both,type:"total"},
    ];
    const W=440,H=240,pad={t:24,r:16,b:40,l:44};
    const maxV=base*1.05;
    const svg=el("svg",{viewBox:`0 0 ${W} ${H}`,width:"100%"});
    for(let i=0;i<=4;i++){const y=pad.t+(H-pad.t-pad.b)*i/4;svg.appendChild(el("line",{x1:pad.l,y1:y,x2:W-pad.r,y2:y,stroke:C.grid}));
      const v=maxV*(1-i/4);const t=el("text",{x:pad.l-6,y:y+3,fill:C.dim,"font-size":9,"text-anchor":"end"});t.textContent="$"+Math.round(v);svg.appendChild(t);}
    const cw=(W-pad.l-pad.r)/steps.length, bw=cw*0.5;
    const yOf=v=>pad.t+(H-pad.t-pad.b)*(1-v/maxV);
    let running=0;
    steps.forEach((s,i)=>{
      const cx=pad.l+cw*i+cw/2;
      let y0,y1,color;
      if(s.type==="total"){y0=yOf(0);y1=yOf(s.v);running=s.v;color=i===0?C.orange:C.green;}
      else{const start=running;running+=s.v;y0=yOf(start);y1=yOf(running);color=C.blue;}
      const top=Math.min(y0,y1),h=Math.abs(y1-y0);
      const r=el("rect",{x:cx-bw/2,y:top+h,width:bw,height:0,rx:3,fill:color,opacity:s.type==="down"?.7:1});svg.appendChild(r);
      setTimeout(()=>{r.setAttribute("y",top);r.setAttribute("height",Math.max(h,2));r.style.transition="all .6s cubic-bezier(.2,.8,.2,1)";},80+i*140);
      const val=el("text",{x:cx,y:top-5,fill:s.type==="down"?C.blue:C.amber,"font-size":9.5,"text-anchor":"middle","font-weight":700});
      val.textContent=(s.type==="down"?"−$"+Math.round(-s.v):"$"+Math.round(s.v));svg.appendChild(val);
      const lb=el("text",{x:cx,y:H-pad.b+15,fill:C.muted,"font-size":9.5,"text-anchor":"middle"});lb.textContent=s.l;svg.appendChild(lb);
    });
    host.appendChild(svg);
    const pct=((1-both/base)*100).toFixed(0);
    host.insertAdjacentHTML("beforeend",`<div class="legend"><span class="lg-note">示例：20k前缀+2k输入+1.5k输出 ×1000次（Sonnet）→ 累计省 <b style="color:${C.green}">${pct}%</b></span></div>`);
  }

  // ============ 5. 分层架构图（SVG 可交互）============
  function archStack(host){
    const layers=DATA.architecture;
    const wrap=document.createElement("div");wrap.className="arch-stack";
    layers.forEach((L,i)=>{
      const row=document.createElement("div");row.className="arch-layer";
      row.style.cssText=`--lc:${L.color};animation-delay:${i*0.08}s`;
      row.innerHTML=`<div class="arch-num">${L.n}</div><div class="arch-body"><div class="arch-name">${L.name} <span>${L.en}</span></div><div class="arch-desc">${L.desc}</div></div>`;
      wrap.appendChild(row);
    });
    host.appendChild(wrap);
    host.insertAdjacentHTML("beforeend",`<div class="legend"><span class="lg-note">同一批模型层层向上支撑整个产品族 · 越上层越贴近终端用户</span></div>`);
  }

  // ============ 6. 上下文窗口对比条 ============
  function contextBars(host){
    const models=DATA.models;
    const maxC=Math.max(...models.map(m=>m.ctxNum));
    const wrap=document.createElement("div");wrap.className="ctx-bars";
    models.forEach((m,i)=>{
      const row=document.createElement("div");row.className="ctx-row";
      row.innerHTML=`<div class="ctx-name">${m.name}</div><div class="ctx-track"><div class="ctx-fill" style="--w:${m.ctxNum/maxC*100}%;background:${m.color}"></div></div><div class="ctx-val">${m.ctx}</div>`;
      wrap.appendChild(row);
      setTimeout(()=>{const f=row.querySelector(".ctx-fill");f.style.width=f.style.getPropertyValue("--w");},100+i*120);
    });
    host.appendChild(wrap);
  }

  // 暴露
  window.CHARTS={priceBar,radar,scatter,waterfall,archStack,contextBars};
})();
