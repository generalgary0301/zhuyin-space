/* 注音太空探險隊 — ✍️ 筆順訓練基地
 * 筆畫外框與筆順：教育部《國語注音符號手冊》開放部件（CC BY 4.0），見 js/strokes.js。
 * 讀音：同一份開放部件的教育部錄音（audio/bpmf_XX.mp3）。 */
(function(){
'use strict';
var API=null; // 由 app.js 注入：{S,save,h,home,hud,playAudio,toast,esc,starStr}
var D=window.ZY_STROKES||{}, ORDER=window.ZY_STROKE_ORDER||[];
var NS='http://www.w3.org/2000/svg';
var GROUPS=[['聲母',ORDER.slice(0,21)],['介音',ORDER.slice(21,24)],['韻母',ORDER.slice(24)]];
// 教育部手冊「說明」欄（原文；ㄓㄖ 的省寫另註）
var NOTES={'ㄆ':'末筆不捺。','ㄇ':'末筆不鉤。','ㄈ':'第二筆與第一筆起筆相接。','ㄊ':'中筆斜貫而下。','ㄏ':'第一筆與第二筆起筆相接。','ㄐ':'第一筆豎挑不過第二筆。',
 'ㄓ':'標準寫法四畫（手冊另註：可省作三畫）。','ㄕ':'第三筆與第二筆起筆相接。','ㄖ':'中為一點。標準寫法四畫（手冊另註：可省作三畫）。','ㄘ':'末筆不鉤。',
 'ㄝ':'末筆不鉤。','ㄞ':'右下不鉤。','ㄡ':'末筆不捺，左上不封口。','ㄢ':'末筆不鉤。','ㄤ':'末筆不鉤。','ㄦ':'末筆不鉤。','ㄨ':'第二筆不捺。'};
var STAGES=[{n:'描一描',icon:'✏️',tip:'照著灰色的字，一筆一筆描'},{n:'虛線寫',icon:'〰️',tip:'只剩虛線，照著寫'},{n:'自己寫',icon:'🌟',tip:'空白格子，自己寫出來'}];
var COLORS=['#ff6b6b','#4dabf7','#51cf66','#cc5de8'];
var TOL=[{shape:95,end:200},{shape:105,end:215},{shape:125,end:240}];

// ---------- geometry ----------
function dist(a,b){var dx=a[0]-b[0],dy=a[1]-b[1];return Math.sqrt(dx*dx+dy*dy);}
function plen(p){var L=0;for(var i=1;i<p.length;i++)L+=dist(p[i-1],p[i]);return L;}
function resample(p,n){if(p.length<2)return [p[0],p[0]];var L=plen(p);if(L===0){var r=[];for(var k=0;k<n;k++)r.push(p[0]);return r;}
  var step=L/(n-1),out=[p[0]],acc=0,i=1,prev=p[0];
  while(out.length<n-1&&i<p.length){var d=dist(prev,p[i]);if(acc+d>=step){var t=(step-acc)/d;var q=[prev[0]+t*(p[i][0]-prev[0]),prev[1]+t*(p[i][1]-prev[1])];out.push(q);prev=q;acc=0;}else{acc+=d;prev=p[i];i++;}}
  while(out.length<n)out.push(p[p.length-1]);return out;}
function segDist(q,a,b){var dx=b[0]-a[0],dy=b[1]-a[1],l=dx*dx+dy*dy;var t=l?((q[0]-a[0])*dx+(q[1]-a[1])*dy)/l:0;t=Math.max(0,Math.min(1,t));return dist(q,[a[0]+t*dx,a[1]+t*dy]);}
function polyDist(q,p){var m=Infinity;if(p.length===1)return dist(q,p[0]);for(var i=1;i<p.length;i++){var d=segDist(q,p[i-1],p[i]);if(d<m)m=d;}return m;}
function chamfer(u,t){var U=resample(u,32),T=resample(t,32),a=0,b=0;U.forEach(function(q){a+=polyDist(q,t);});T.forEach(function(q){b+=polyDist(q,u);});return (a/U.length+b/T.length)/2;}
// 比對一筆：回傳 {ok, dir(方向反), shape, se}
function compare(u,track,stage){var tol=TOL[stage],tl=plen(track);
  var endTol=Math.min(tol.end,Math.max(120,tl*0.75));
  var sh=chamfer(u,track);var s0=dist(u[0],track[0]),e0=dist(u[u.length-1],track[track.length-1]);
  var s1=dist(u[0],track[track.length-1]),e1=dist(u[u.length-1],track[0]);
  var shapeOk=sh<=tol.shape;var fwdOk=s0<=endTol&&e0<=endTol;var revOk=s1<=endTol&&e1<=endTol;
  var dirWrong=shapeOk&&revOk&&(s1+e1)<(s0+e0)*0.6;
  return {ok:shapeOk&&fwdOk&&!dirWrong,dir:dirWrong,shape:sh,se:s0+e0,shapeOk:shapeOk};}
// 判斷整筆：ok / order / dir / shape / redo / short
function judge(ch,idx,u,stage){var S=D[ch].s;var tr=S[idx].t;var tl=plen(tr);
  if(plen(u)<Math.min(30,tl*0.3))return {kind:'short'};
  var c=compare(u,tr,stage);
  var best=null;for(var j=0;j<S.length;j++){if(j===idx)continue;var cj=compare(u,S[j].t,stage);if(cj.ok&&(!best||cj.shape<best.c.shape))best={j:j,c:cj};}
  if(c.ok){if(best&&best.j>idx&&best.c.shape<c.shape*0.6)return {kind:'order',j:best.j};return {kind:'ok',score:c.shape};}
  if(best)return {kind:best.j>idx?'order':'redo',j:best.j};
  if(c.dir)return {kind:'dir'};
  return {kind:'shape'};}

// ---------- storage ----------
function rec(ch){var S=API.S();if(!S.stroke)S.stroke={};var r=S.stroke[ch];if(!r)r=S.stroke[ch]={st:[0,0,0],att:0,err:0,eo:0,ed:0,es:0,best:[null,null,null],last:0};return r;}
function peek(ch){var S=API.S();return (S.stroke&&S.stroke[ch])||null;}
function stars(ch){var r=peek(ch);if(!r)return 0;return r.st.filter(function(x){return x>0;}).length;}
function totalStars(){var n=0;ORDER.forEach(function(c){n+=stars(c);});return n;}
function allDone(){return ORDER.every(function(c){return stars(c)===3;});}

// ---------- svg helpers ----------
function el(tag,attrs,parent){var e=document.createElementNS(NS,tag);for(var k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e;}
function gridSVG(paper){ // 田字格
  var s='<rect x="6" y="6" width="1012" height="1012" rx="40" fill="'+(paper?'#fffdf5':'rgba(255,255,255,.06)')+'" stroke="'+(paper?'#e8a0a0':'rgba(255,255,255,.35)')+'" stroke-width="10"/>';
  s+='<line x1="512" y1="20" x2="512" y2="1004" stroke="'+(paper?'#f1b8b8':'rgba(255,255,255,.22)')+'" stroke-width="6" stroke-dasharray="26 22"/><line x1="20" y1="512" x2="1004" y2="512" stroke="'+(paper?'#f1b8b8':'rgba(255,255,255,.22)')+'" stroke-width="6" stroke-dasharray="26 22"/>';
  return s;}
function ptsAttr(t){return t.map(function(p){return p[0]+','+p[1];}).join(' ');}
function extTrack(t){ // 前後各延伸一點，讓動畫的平頭筆刷蓋滿外框
  var a=t[0],b=t[1],y=t[t.length-1],z=t[t.length-2];
  function ext(p,q){var d=dist(p,q)||1;return [p[0]+(p[0]-q[0])/d*70,p[1]+(p[1]-q[1])/d*70];}
  return [ext(a,b)].concat(t,[ext(y,z)]);}
var uid=0;
// 在 svg 中畫一筆的動畫（外框裁切＋粗線描出）；回傳 Promise
function animStroke(svg,st,color,dur){
  return new Promise(function(res){
    var id='zc'+(++uid);var defs=el('defs',{},svg);var cp=el('clipPath',{id:id},defs);el('path',{d:st.d},cp);
    var tt=extTrack(st.t);var L=plen(tt);
    var pl=el('polyline',{points:ptsAttr(tt),fill:'none',stroke:color,'stroke-width':150,'stroke-linecap':'butt','stroke-linejoin':'round','clip-path':'url(#'+id+')','stroke-dasharray':L+' '+L,'stroke-dashoffset':L},svg);
    var t0=null;dur=dur||Math.max(450,Math.min(1300,L*1.1));
    function f(ts){if(!svg.isConnected){res();return;}if(t0===null)t0=ts;var k=Math.min(1,(ts-t0)/dur);pl.setAttribute('stroke-dashoffset',L*(1-k));
      if(k<1)requestAnimationFrame(f);else{var p=el('path',{d:st.d,fill:color},svg);pl.remove();defs.remove();res(p);}}
    requestAnimationFrame(f);});}
function numBadge(svg,st,i,color){var a=st.t[0];var g=el('g',{'class':'zs-num'},svg);el('circle',{cx:a[0],cy:a[1],r:52,fill:color,stroke:'#fff','stroke-width':8},g);var tx=el('text',{x:a[0],y:a[1]+24,'text-anchor':'middle','font-size':68,'font-weight':900,fill:'#fff'},g);tx.textContent=String(i+1);return g;}
function arrowFor(svg,st,color){ // 起筆方向小箭頭
  var t=st.t,a=t[0],b=t[1];var d=dist(a,b)||1;var len=Math.min(170,d*0.8);var ux=(b[0]-a[0])/d,uy=(b[1]-a[1])/d;
  var sx=a[0]+ux*62,sy=a[1]+uy*62,ex=a[0]+ux*(62+len),ey=a[1]+uy*(62+len);
  var g=el('g',{'class':'zs-arrow'},svg);el('line',{x1:sx,y1:sy,x2:ex,y2:ey,stroke:color,'stroke-width':18,'stroke-linecap':'round'},g);
  var px=-uy,py=ux;el('polygon',{points:ex+ux*30+','+(ey+uy*30)+' '+(ex+px*28)+','+(ey+py*28)+' '+(ex-px*28)+','+(ey-py*28),fill:color},g);return g;}
var demoToken=0;
function playDemo(svg,ch,opt){opt=opt||{};var tok=++demoToken;svg.__tok=tok;
  while(svg.childNodes.length>(svg.__base||0))svg.removeChild(svg.lastChild);
  var S=D[ch].s;var i=0;
  (function next(){if(svg.__tok!==tok||!svg.isConnected)return;if(i>=S.length){if(opt.done)opt.done();return;}
    var k=i++;var col=opt.mono||COLORS[k%COLORS.length];
    animStroke(svg,S[k],col).then(function(){if(svg.__tok!==tok)return;if(opt.numbers!==false)numBadge(svg,S[k],k,col);if(opt.onStroke)opt.onStroke(k);setTimeout(next,280);});})();}

// ---------- screens ----------
function sayBpmf(ch){var d=D[ch];if(d&&d.aud)API.playAudio(d.aud,ch);}
function grid(){
  API.hud();var tot=totalStars();
  var html='<div class="ship">✍️</div><h1>筆順訓練基地</h1><p class="sub">ㄅ 到 ㄦ 37 個注音，看筆順、跟著寫！</p>';
  html+='<div class="card"><b>⭐ 筆順星星：'+tot+' / '+(ORDER.length*3)+'</b><div class="progress" style="margin-top:6px"><i style="width:'+(tot/(ORDER.length*3)*100)+'%"></i></div><div class="muted">每個符號 3 關：①描一描 ②虛線寫 ③自己寫，每過一關得 1 顆星。筆順依教育部《國語注音符號手冊》。</div></div>';
  GROUPS.forEach(function(g){html+='<h2 class="zs-gh">'+g[0]+'</h2><div class="zs-grid">';
    g[1].forEach(function(c){var n=stars(c);html+='<button class="zs-tile'+(n===3?' done':'')+'" data-zs="'+c+'"><span class="zs-ch">'+c+'</span><span class="zs-st">'+API.starStr(n)+'</span><span class="zs-cnt">'+D[c].n+' 畫</span></button>';});
    html+='</div>';});
  html+='<button class="btn ghost" id="zs-back">⬅ 回國語星系</button>';
  API.h(html);
  document.querySelectorAll('[data-zs]').forEach(function(b){b.onclick=function(){symbol(b.getAttribute('data-zs'));};});
  document.getElementById('zs-back').onclick=API.home;
}
function stepsSVG(ch){ // 筆順分解：1、1+2、1+2+3…
  var S=D[ch].s;var out='';
  for(var k=0;k<S.length;k++){var s='<svg viewBox="0 0 1024 1024" class="zs-step">'+gridSVG(false);
    for(var j=0;j<=k;j++)s+='<path d="'+S[j].d+'" fill="'+(j===k?'#ffd166':'rgba(255,255,255,.85)')+'"/>';
    s+='</svg>';out+='<div class="zs-stepw">'+s+'<div>第 '+(k+1)+' 筆</div></div>';}
  return out;}
function symbol(ch){
  var d=D[ch],r=peek(ch);var idx=ORDER.indexOf(ch);
  var html='<div class="card zs-head"><div class="zs-big">'+ch+'</div><div><div style="font-size:22px;font-weight:800">共 '+d.n+' 畫</div><div class="zs-st" style="font-size:20px">'+API.starStr(stars(ch))+'</div>'+
    '<button class="speak" id="zs-say" style="font-size:20px;margin:6px 0">🔊 聽讀音</button></div></div>';
  html+='<div class="card center"><b>🎬 筆順動畫</b><svg viewBox="0 0 1024 1024" class="zs-demo" id="zs-demo">'+gridSVG(false)+'</svg>'+
    '<button class="btn blue" id="zs-replay" style="font-size:20px;padding:12px">▶ 再看一次</button>'+
    (NOTES[ch]?'<p class="muted" style="margin:4px 0">📘 教育部手冊：'+NOTES[ch]+'</p>':'')+
    '<div class="zs-steps">'+stepsSVG(ch)+'</div></div>';
  html+='<div class="card"><b>🚀 寫字練習（可以一直重複練）</b>';
  STAGES.forEach(function(s,i){var done=r&&r.st[i]>0;html+='<div class="mission" style="margin-top:10px"><div><b>'+(i+1)+'. '+s.icon+' '+s.n+'</b> '+(done?'⭐':'☆')+'<div class="muted">'+s.tip+(r&&r.st[i]?'・已完成 '+r.st[i]+' 次':'')+'</div></div><button class="btn'+(i===2?' green':'')+'" data-stage="'+i+'">開始</button></div>';});
  html+='</div><div class="zs-nav"><button class="btn ghost" id="zs-prev"'+(idx<=0?' disabled':'')+'>⬅ '+(ORDER[idx-1]||'')+'</button><button class="btn ghost" id="zs-grid">🔠 全部</button><button class="btn ghost" id="zs-next"'+(idx>=ORDER.length-1?' disabled':'')+'>'+(ORDER[idx+1]||'')+' ➡</button></div>';
  API.h(html);
  var svg=document.getElementById('zs-demo');svg.__base=svg.childNodes.length;
  playDemo(svg,ch);
  document.getElementById('zs-replay').onclick=function(){playDemo(svg,ch);};
  document.getElementById('zs-say').onclick=function(){sayBpmf(ch);};
  document.querySelectorAll('[data-stage]').forEach(function(b){b.onclick=function(){practice(ch,+b.getAttribute('data-stage'));};});
  document.getElementById('zs-grid').onclick=grid;
  document.getElementById('zs-prev').onclick=function(){if(idx>0)symbol(ORDER[idx-1]);};
  document.getElementById('zs-next').onclick=function(){if(idx<ORDER.length-1)symbol(ORDER[idx+1]);};
  setTimeout(function(){sayBpmf(ch);},150);
}

var P=null; // 目前練習狀態（測試用也會讀）
function practice(ch,stage){
  var d=D[ch];
  var html='<div class="zs-ptop"><span class="zs-pch">'+ch+'</span><span class="retry-tag">'+STAGES[stage].icon+' 第 '+(stage+1)+' 關：'+STAGES[stage].n+'</span><span id="zs-count" class="zs-count"></span></div>'+
    '<div class="zs-padw"><svg viewBox="0 0 1024 1024" class="zs-pad" id="zs-pad"></svg></div>'+
    '<div class="feedback" id="zs-fb"></div>'+
    '<div class="zs-tools"><button class="key fn" id="zs-hint">💡 提示</button><button class="key fn" id="zs-watch">🎬 看筆順</button><button class="key del" id="zs-clear">🔄 重寫</button><button class="key" id="zs-say2">🔊</button></div>'+
    '<button class="btn ghost" id="zs-back2">⬅ 回 '+ch+'</button>';
  API.h(html);
  var svg=document.getElementById('zs-pad');
  P={ch:ch,stage:stage,idx:0,mist:0,errs:0,streak:0,busy:false,done:false};
  svg.innerHTML=gridSVG(true);
  var gGuide=el('g',{},svg),gDone=el('g',{},svg),gHint=el('g',{},svg),gInk=el('g',{},svg);
  function drawGuide(){gGuide.innerHTML='';
    d.s.forEach(function(st){if(stage===0)el('path',{d:st.d,fill:'#d9dbe6'},gGuide);else if(stage===1)el('path',{d:st.d,fill:'none',stroke:'#9aa3c7','stroke-width':7,'stroke-dasharray':'22 18'},gGuide);});}
  drawGuide();
  function count(){document.getElementById('zs-count').textContent=P.done?'完成！':'第 '+(P.idx+1)+' / '+d.n+' 筆';}
  function fb(msg,cls,small){var f=document.getElementById('zs-fb');f.className='feedback '+(cls||'');f.innerHTML=msg+(small?'<small>'+small+'</small>':'');}
  function showNextHint(strong){gHint.innerHTML='';if(P.done)return;var st=d.s[P.idx];var col=COLORS[P.idx%COLORS.length];
    if(stage===0||strong){el('path',{d:st.d,fill:col,'fill-opacity':stage===0?.28:.22},gHint);}
    if(stage===0||strong){arrowFor(gHint,st,col);var b=numBadge(gHint,st,P.idx,col);b.classList.add('zs-pulse');}}
  function hintAnim(){if(P.done||P.busy)return;P.busy=true;gHint.innerHTML='';var st=d.s[P.idx];var col=COLORS[P.idx%COLORS.length];
    var g=el('g',{opacity:.55},gHint);animStroke(g,st,col,900).then(function(){numBadge(gHint,st,P.idx,col);arrowFor(gHint,st,col);P.busy=false;
      setTimeout(function(){if(svg.isConnected&&!P.done)showNextHint(true);},700);});}
  function reset(){P.idx=0;P.mist=0;P.done=false;P.busy=false;P.streak=0;gDone.innerHTML='';gInk.innerHTML='';drawGuide();count();showNextHint(false);
    fb(stage===2?'從第 1 筆開始，自己寫寫看！':'從有數字 1 的地方開始寫','', STAGES[stage].tip);}
  reset();
  // ---- 寫字（pointer events）----
  var cur=null,pts=null,pid=null;
  function toBox(e){var r=svg.getBoundingClientRect();return [(e.clientX-r.left)/r.width*1024,(e.clientY-r.top)/r.height*1024];}
  function inkD(p){if(p.length===1)return 'M'+p[0][0]+' '+p[0][1]+'l0.1 0';var s='M'+p[0][0].toFixed(1)+' '+p[0][1].toFixed(1);
    for(var i=1;i<p.length-1;i++){var mx=(p[i][0]+p[i+1][0])/2,my=(p[i][1]+p[i+1][1])/2;s+='Q'+p[i][0].toFixed(1)+' '+p[i][1].toFixed(1)+' '+mx.toFixed(1)+' '+my.toFixed(1);}
    var l=p[p.length-1];return s+'L'+l[0].toFixed(1)+' '+l[1].toFixed(1);}
  svg.addEventListener('pointerdown',function(e){if(pid!==null||P.done||P.busy)return;e.preventDefault();pid=e.pointerId;try{svg.setPointerCapture(pid);}catch(_){}
    pts=[toBox(e)];cur=el('path',{d:inkD(pts),fill:'none',stroke:'#1f3c88','stroke-width':40,'stroke-linecap':'round','stroke-linejoin':'round'},gInk);});
  svg.addEventListener('pointermove',function(e){if(e.pointerId!==pid||!pts)return;e.preventDefault();
    var evs=e.getCoalescedEvents?e.getCoalescedEvents():[e];if(!evs.length)evs=[e];
    evs.forEach(function(ev){var q=toBox(ev);if(dist(q,pts[pts.length-1])>=4)pts.push(q);});cur.setAttribute('d',inkD(pts));});
  function up(e){if(e.pointerId!==pid)return;pid=null;if(!pts)return;var p=pts,path=cur;pts=null;cur=null;finishStroke(p,path);}
  svg.addEventListener('pointerup',up);svg.addEventListener('pointercancel',up);
  svg.addEventListener('touchmove',function(e){e.preventDefault();},{passive:false});
  svg.addEventListener('touchstart',function(e){e.preventDefault();},{passive:false});
  function finishStroke(p,path){
    var j=judge(ch,P.idx,p,stage);var r=rec(ch);
    if(j.kind==='short'){path.remove();fb('要按住、一筆畫下去喔 ✋','bad');return;}
    r.att++;
    if(j.kind==='ok'){P.streak=0;var col=COLORS[P.idx%COLORS.length];
      path.setAttribute('stroke','#1f3c88');
      if(stage<2){el('path',{d:d.s[P.idx].d,fill:col,'fill-opacity':.35},gDone);}
      P.idx++;gHint.innerHTML='';
      if(P.idx>=d.n){complete();}else{fb(rnd(['很好！','漂亮！','對了！','好棒！'])+' 👍','ok','接下來寫第 '+(P.idx+1)+' 筆');count();showNextHint(false);}
      API.save();return;}
    // 錯誤
    P.mist++;P.streak++;r.err++;
    var msg,small;
    if(j.kind==='order'){r.eo++;msg='順序不對喔 🙂';small='你寫的是第 '+(j.j+1)+' 筆，要先寫第 '+(P.idx+1)+' 筆';}
    else if(j.kind==='redo'){r.eo++;msg='這一筆寫過了喔';small='接下來寫第 '+(P.idx+1)+' 筆';}
    else if(j.kind==='dir'){r.ed++;msg='方向反了喔 🔁';small='要從數字 '+(P.idx+1)+' 的圓點開始，照箭頭方向寫';}
    else {r.es++;msg='再試一次 💪';small='照著提示，把第 '+(P.idx+1)+' 筆寫完整';}
    API.save();
    fb(msg,'bad',small);
    path.setAttribute('stroke','#ff4d6d');path.style.transition='opacity .6s';
    setTimeout(function(){path.style.opacity='0';},350);setTimeout(function(){path.remove();},1000);
    if(stage===0||P.streak>=1)hintAnim();
  }
  function complete(){P.done=true;count();var r=rec(ch);var first=!(r.st[stage]>0);r.st[stage]++;r.last=Date.now();
    if(r.best[stage]===null||P.mist<r.best[stage])r.best[stage]=P.mist;
    if(first)API.S().fuel+=3;API.save();API.hud();
    var perfect=P.mist===0;
    fb(perfect?'🎉 全部寫對，一次就成功！':'🎉 寫完了！','ok',perfect?'筆順完全正確':'這次有 '+P.mist+' 次要重寫，再練一次會更棒');
    sayBpmf(ch);
    var box=document.createElement('div');box.className='card center zs-done';
    var nextCh=ORDER[ORDER.indexOf(ch)+1];
    box.innerHTML='<div style="font-size:34px">'+API.starStr(stars(ch))+'</div>'+
      (stage<2?'<button class="btn green" id="zs-nextstage">下一關：'+STAGES[stage+1].n+' ➡</button>':(nextCh?'<button class="btn green" id="zs-nextch">下一個符號：'+nextCh+' ➡</button>':'<button class="btn green" id="zs-gridend">🏁 回到全部符號</button>'))+
      '<button class="btn" id="zs-again">🔁 再寫一次</button>';
    var fbEl=document.getElementById('zs-fb');fbEl.parentNode.insertBefore(box,fbEl.nextSibling);
    var b;if((b=document.getElementById('zs-nextstage')))b.onclick=function(){practice(ch,stage+1);};
    if((b=document.getElementById('zs-nextch')))b.onclick=function(){symbol(nextCh);};
    if((b=document.getElementById('zs-gridend')))b.onclick=grid;
    document.getElementById('zs-again').onclick=function(){practice(ch,stage);};
    if(allDone())API.toast('🏅 37 個注音筆順全部完成！');
  }
  document.getElementById('zs-hint').onclick=hintAnim;
  document.getElementById('zs-clear').onclick=function(){var b=document.querySelector('.zs-done');if(b)b.remove();reset();};
  document.getElementById('zs-say2').onclick=function(){sayBpmf(ch);};
  document.getElementById('zs-watch').onclick=function(){if(P.busy)return;P.busy=true;var g=el('g',{},svg);var save=gInk.style.opacity;gInk.style.opacity='.15';gDone.style.opacity='.15';
    playDemo(g,ch,{done:function(){setTimeout(function(){g.remove();gInk.style.opacity=save||'';gDone.style.opacity='';P.busy=false;},700);}});};
  document.getElementById('zs-back2').onclick=function(){symbol(ch);};
}
function rnd(a){return a[Math.floor(Math.random()*a.length)];}

// ---------- 家長專區卡片 ----------
function parentsCard(){
  var esc=API.esc;var rows=ORDER.map(function(c){var r=peek(c)||{st:[0,0,0],att:0,err:0,eo:0,ed:0,es:0,best:[null,null,null]};return {c:c,r:r};});
  var practiced=rows.filter(function(x){return x.r.att>0;});
  var full=rows.filter(function(x){return stars(x.c)===3;}).length;
  var att=0,err=0;practiced.forEach(function(x){att+=x.r.att;err+=x.r.err;});
  var html='<div class="card"><h2>✍️ 筆順練習紀錄</h2><p class="muted" style="margin:0 0 6px">筆順依教育部《國語注音符號手冊》。三關都過＝3 顆星。錯誤分成：順序錯、方向反、筆形不對。</p>';
  html+='<div class="bar"><span class="lbl" style="font-size:18px;width:auto">完成</span><span class="track"><i style="width:'+(full/ORDER.length*100)+'%"></i></span><span class="num">'+full+' / '+ORDER.length+' 個</span></div>';
  html+='<p style="margin:4px 0">共寫了 '+att+' 筆，其中 '+err+' 筆需要重寫'+(att?'（正確率 '+Math.round((att-err)/att*100)+'%）':'')+'。</p>';
  var worst=practiced.filter(function(x){return x.r.err>0;}).sort(function(a,b){return (b.r.eo*2+b.r.err)-(a.r.eo*2+a.r.err);}).slice(0,10);
  html+='<h3 style="margin:10px 0 4px">❗ 最需要加強的筆順</h3>'+(worst.length?'<ul class="list">'+worst.map(function(x){var r=x.r;
    return '<li><div><b style="font-size:26px">'+esc(x.c)+'</b> <span class="muted">'+D[x.c].n+' 畫</span><div class="muted">順序錯 '+r.eo+'・方向反 '+r.ed+'・筆形 '+r.es+'</div></div><span>錯 '+r.err+' / '+r.att+' 筆 <button class="mini" data-zsgo="'+esc(x.c)+'">✍️</button></span></li>';}).join('')+'</ul>':'<p class="muted">還沒有筆順錯誤紀錄 🎉</p>');
  html+='<details><summary style="font-size:18px;padding:6px 0">37 個符號一覽</summary><div class="zs-pgrid">'+rows.map(function(x){var n=stars(x.c);
    return '<div class="zs-pcell'+(x.r.eo>0?' warn':'')+'"><b>'+esc(x.c)+'</b><span>'+(n?'⭐'+n:'—')+'</span><span>'+(x.r.att?'錯'+x.r.err:'')+'</span></div>';}).join('')+'</div></details>';
  html+='<p class="muted" style="margin-top:8px">資料來源：2017 © 教育部，國語注音符號手冊-開放部件（CC BY 4.0）；筆畫圖形、筆順與符號讀音皆取自該資料。</p></div>';
  return html;}
function bindParents(root){(root||document).querySelectorAll('[data-zsgo]').forEach(function(b){b.onclick=function(){symbol(b.getAttribute('data-zsgo'));};});}

window.ZYStroke={init:function(api){API=api;},open:grid,symbol:symbol,practice:practice,parentsCard:parentsCard,bindParents:bindParents,
  totalStars:totalStars,allDone:allDone,judge:judge,data:D,order:ORDER,get P(){return P;}};
})();
