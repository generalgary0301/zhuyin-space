/* 注音太空探險隊 — 🏦 星星存摺（獎勵機制）
 * 完成一關 +1、全部答對 +1、該關有答對進位／退位題 +1（每關最多 +1）。同一關每天最多存 2 次。
 * 存滿就能兌換獎勵（需家長密碼），兌換券＋倒數計時，時間到會響鈴提醒。資料存在 localStorage。 */
(function(){
'use strict';
var API=null,$=function(id){return document.getElementById(id);};
var YT='https://www.youtube.com/results?search_query='+encodeURIComponent('哆啦A夢');
var PER_KEY_DAY=2;
function S(){return API.S();}
function today(d){d=d?new Date(d):new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
function R(){var s=S();var r=s.reward;if(!r)r=s.reward={};
  if(r.bal===undefined)r.bal=0;if(r.earned===undefined)r.earned=0;if(!r.pin)r.pin='0000';if(r.pinChanged===undefined)r.pinChanged=false;
  if(!r.cost)r.cost=5;if(!r.min)r.min=15;if(!r.cap)r.cap=2;r.hist=r.hist||[];r.log=r.log||[];r.day=r.day||{};
  if(!r.alts)r.alts=[{id:'a1',emoji:'🎲',name:'跟爸爸玩桌遊',cost:5},{id:'a2',emoji:'📖',name:'多聽一個睡前故事',cost:5},{id:'a3',emoji:'🍽️',name:'週末選晚餐',cost:5}];
  return r;}
function esc(s){return API.esc(s);}
function rewards(){var r=R();return [{id:'dora',emoji:'📺',name:'看哆啦A夢 '+r.min+' 分鐘',cost:r.cost,min:r.min,yt:true}].concat(r.alts.map(function(a){return {id:a.id,emoji:a.emoji||'🎁',name:a.name,cost:Math.max(1,+a.cost||r.cost),min:0};}));}
function usedToday(){var t=today();return R().hist.filter(function(x){return today(x.t)===t;}).length;}
function minCost(){return Math.min.apply(null,rewards().map(function(x){return x.cost;}));}

// ---------- 音效（WebAudio，免音檔） ----------
var AC=null;
function ac(){try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();}catch(e){}return AC;}
document.addEventListener('pointerdown',function(){ac();},true);
function tone(f,t0,dur,vol,type){var c=ac();if(!c)return;var o=c.createOscillator(),g=c.createGain();o.type=type||'sine';o.frequency.value=f;
  var t=c.currentTime+t0;g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol||0.25,t+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+dur+0.05);}
function sparkle(){[1046,1319,1568,2093].forEach(function(f,i){tone(f,i*0.09,0.35,0.18,'triangle');});}
function chime(times){for(var k=0;k<(times||3);k++){[784,988,1175,1568].forEach(function(f,i){tone(f,k*1.3+i*0.16,0.9,0.3,'sine');});}try{navigator.vibrate&&navigator.vibrate([400,200,400,200,600]);}catch(e){}}

// ---------- 存星星 ----------
function earn(o){var r=R();var key=o.key||o.title;var t=today();
  if(r.day.d!==t)r.day={d:t,k:{}};var cnt=r.day.k[key]||0;
  var parts=[];
  if(cnt>=PER_KEY_DAY){API.save();insertCard(0,[],o.into,'這一關今天已經存過 '+PER_KEY_DAY+' 次星星囉，換別的關卡練習吧！');return 0;}
  r.day.k[key]=cnt+1;
  parts.push(['完成「'+o.title+'」',1]);if(o.perfect)parts.push(['全部答對',1]);if(o.regroup)parts.push(['進位／退位題答對',1]);
  var n=parts.reduce(function(a,p){return a+p[1];},0);
  r.bal+=n;r.earned+=n;r.log.push({t:new Date().toISOString(),src:o.src,title:o.title,n:n});if(r.log.length>80)r.log=r.log.slice(-80);
  API.save();hudBank();insertCard(n,parts,o.into);pop(n,parts);return n;}
function insertCard(n,parts,into,msg){var app=$('app');if(!app)return;var r=R();var c=document.createElement('div');c.className='card rw-earned center';
  c.innerHTML=msg?'<div>🏦 '+esc(msg)+'</div><div class="muted">存摺裡有 ⭐ '+r.bal+' 顆</div>':'<div class="rw-earned-n">🏦 星星存摺 +'+n+' ⭐</div><div class="muted">'+parts.map(function(p){return esc(p[0])+' +'+p[1];}).join('・')+'</div>'+progressHTML()+'<button class="btn gold" data-rw-bank>🎁 打開星星存摺</button>';
  if(into)into.appendChild(c);else{var b=app.querySelector('.btn');if(b)b.parentNode.insertBefore(c,b);else app.appendChild(c);}
  var bb=c.querySelector('[data-rw-bank]');if(bb)bb.onclick=bank;}
function progressHTML(){var r=R();var need=r.cost;var have=r.bal%need,full=Math.floor(r.bal/need);
  var ok=r.bal>=need;
  return '<div class="rw-prog"><div class="rw-dots">'+Array.from({length:need},function(_,i){return '<span class="'+(i<(ok?need:have)?'on':'')+'">⭐</span>';}).join('')+'</div><div class="muted">'+(ok?'🎉 可以兌換 '+full+' 次「'+esc(rewards()[0].name)+'」了！':'再 '+(need-have)+' 顆星星就能兌換「'+esc(rewards()[0].name)+'」')+'</div></div>';}
function pop(n,parts){var old=$('rw-pop');if(old)old.remove();var r=R();
  var d=document.createElement('div');d.id='rw-pop';d.className='rw-pop';
  var fly='';for(var i=0;i<n;i++)fly+='<span class="rw-fly" style="animation-delay:'+(0.5+i*0.25)+'s;left:'+(40+i*10)+'%">⭐</span>';
  d.innerHTML='<div class="rw-pop-box"><div class="rw-burst">✨</div><div class="rw-big">+'+n+' ⭐</div><div class="rw-txt">'+parts.map(function(p){return esc(p[0])+' <b>+'+p[1]+'</b>';}).join('<br>')+'</div><div class="rw-bal">🏦 存摺裡有 <b id="rw-pop-bal">'+(r.bal-n)+'</b> 顆星星</div><button class="btn gold" id="rw-pop-ok">好耶！</button></div>'+fly;
  document.body.appendChild(d);sparkle();
  var cur=r.bal-n;var iv=setInterval(function(){cur++;var e=$('rw-pop-bal');if(e)e.textContent=cur;tone(1568,0,0.15,0.12,'triangle');if(cur>=r.bal)clearInterval(iv);},350);
  var close=function(){clearInterval(iv);d.classList.add('out');setTimeout(function(){d.remove();},300);};
  $('rw-pop-ok').onclick=close;d.onclick=function(e){if(e.target===d)close();};setTimeout(function(){if(d.isConnected)close();},7000);}
function hudBank(){var e=$('hud-bank');if(e)e.textContent=R().bal;}

// ---------- 家長密碼 ----------
function pinPad(title,onOk,onCancel){var d=document.createElement('div');d.className='rw-pop';d.id='rw-pin';var v='';
  var keys=['1','2','3','4','5','6','7','8','9','✖','0','⌫'];
  d.innerHTML='<div class="rw-pop-box"><div style="font-size:40px">🔒</div><h2>'+esc(title)+'</h2><p class="muted">請爸爸或媽媽輸入 4 位數家長密碼</p><div class="rw-pin-dots" id="rw-dots"></div><div class="feedback" id="rw-pin-fb"></div><div class="rw-pin-keys">'+keys.map(function(k){return '<button class="key'+(k==='✖'||k==='⌫'?' fn':'')+'" data-k="'+k+'">'+k+'</button>';}).join('')+'</div></div>';
  document.body.appendChild(d);
  function draw(){$('rw-dots').innerHTML=[0,1,2,3].map(function(i){return '<span class="'+(i<v.length?'on':'')+'"></span>';}).join('');}
  draw();
  d.querySelectorAll('[data-k]').forEach(function(b){b.onclick=function(){var k=b.getAttribute('data-k');
    if(k==='✖'){d.remove();if(onCancel)onCancel();return;}
    if(k==='⌫'){v=v.slice(0,-1);draw();return;}
    if(v.length<4)v+=k;draw();
    if(v.length===4){if(v===R().pin){d.remove();onOk();}else{var fb=$('rw-pin-fb');fb.className='feedback bad';fb.textContent='密碼不對，再試一次';d.querySelector('.rw-pop-box').classList.add('shake');setTimeout(function(){var bx=d.querySelector('.rw-pop-box');if(bx)bx.classList.remove('shake');},500);v='';setTimeout(draw,250);}}};});}

// ---------- 存摺頁 ----------
function bank(){var p=$('rw-pop');if(p)p.remove();API.hud();var r=R();var used=usedToday();var left=Math.max(0,r.cap-used);
  var html='<div class="muted">🏠 太空基地 › 🏦 星星存摺</div><div class="ship">🏦</div><h1>律恩的星星存摺</h1>'+
   '<div class="card center rw-balance"><div class="muted">存摺裡有</div><div class="rw-big">⭐ '+r.bal+'</div><div class="muted">累計存了 '+r.earned+' 顆・已兌換 '+r.hist.length+' 次</div>'+progressHTML()+'</div>'+
   timerBanner()+
   '<h2 class="galaxy">🎁 兌換獎勵</h2><p class="muted" style="margin:-4px 0 8px">今天還可以兌換 <b>'+left+'</b> 次（每天最多 '+r.cap+' 次）・兌換時要請爸爸媽媽輸入家長密碼</p><div class="rw-list">';
  rewards().forEach(function(x){var can=r.bal>=x.cost&&left>0;
    html+='<div class="rw-item'+(x.id==='dora'?' main':'')+'"><span class="rw-emo">'+x.emoji+'</span><div class="rw-info"><b>'+esc(x.name)+'</b><div class="muted">需要 ⭐ '+x.cost+(x.min?'・計時 '+x.min+' 分鐘':'')+'</div></div><button class="btn '+(can?'gold':'ghost')+' rw-go" data-rw="'+x.id+'"'+(can?'':' disabled')+'>'+(can?'兌換':left<=0?'今天已滿':'還差 '+(x.cost-r.bal))+'</button></div>';});
  html+='</div><div class="card"><h2>⭐ 怎麼存星星？</h2><ul class="list"><li><div>完成一個關卡或測驗（注音、部首、數學、筆順都可以）</div><b>+1</b></li><li><div>全部第一次就答對</div><b>+1</b></li><li><div>那一關有答對進位或退位的題目</div><b>+1</b></li></ul><p class="muted">同一關每天最多存 '+PER_KEY_DAY+' 次，多練不同的關卡吧！</p></div>';
  var lg=r.log.slice(-6).reverse();
  if(lg.length)html+='<div class="card"><h2>📒 最近存入</h2><ul class="list">'+lg.map(function(l){return '<li><div>'+esc(l.src)+'・'+esc(l.title)+'<div class="muted">'+fmt(l.t)+'</div></div><b>+'+l.n+' ⭐</b></li>';}).join('')+'</ul></div>';
  html+='<button class="btn ghost" id="back">⬅ 回太空基地</button>';
  API.h(html);
  document.querySelectorAll('[data-rw]').forEach(function(b){b.onclick=function(){redeem(b.getAttribute('data-rw'));};});
  bindBanner();$('back').onclick=API.base;}
function fmt(t){var d=new Date(t);return (d.getMonth()+1)+'/'+d.getDate()+' '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);}
function redeem(id){var x=rewards().filter(function(z){return z.id===id;})[0];if(!x)return;
  pinPad('兌換「'+x.name+'」',function(){var r=R();
    if(usedToday()>=r.cap){API.toast('今天已經兌換 '+r.cap+' 次囉，明天再來！');return bank();}
    if(r.bal<x.cost){API.toast('星星不夠喔');return bank();}
    if(x.min&&r.timer){API.toast('還有一張計時中的兌換券');return ticket(r.timer.hid);}
    r.bal-=x.cost;var no=(r.seq=(r.seq||0)+1);
    var h={no:no,t:new Date().toISOString(),id:x.id,emoji:x.emoji,name:x.name,cost:x.cost,min:x.min||0,yt:!!x.yt,done:!x.min};
    r.hist.push(h);if(r.hist.length>200)r.hist=r.hist.slice(-200);
    if(x.min)r.timer={hid:no,total:x.min*60000,remain:x.min*60000,endAt:null,warned:false};
    API.save();hudBank();sparkle();ticket(no);});}

// ---------- 兌換券＋計時 ----------
function findH(no){return R().hist.filter(function(h){return h.no===no;})[0];}
function ticket(no){var h=findH(no);if(!h)return bank();var r=R();var tm=r.timer&&r.timer.hid===no?r.timer:null;
  var html='<div class="muted">🏦 星星存摺 › 🎟️ 兌換券</div>'+
   '<div class="rw-ticket"><div class="rw-ticket-top">🎟️ 兌換券　<span>No.'+('000'+h.no).slice(-4)+'</span></div><div class="rw-ticket-emo">'+h.emoji+'</div><div class="rw-ticket-name">'+esc(h.name)+'</div>'+
   '<div class="rw-ticket-meta">律恩・'+fmt(h.t)+'・用了 ⭐ '+h.cost+'</div><div class="rw-ticket-ok">✅ 家長已確認</div></div>';
  if(!r.pinChanged)html+='<p class="feedback bad center" style="font-size:15px">⚠️ 家長密碼還是預設的 0000，請到「家長專區 › 星星存摺設定」改成自己的密碼</p>';
  if(h.min){
    if(tm)html+='<div class="card center"><div class="muted">⏱️ 剩下時間</div><div class="rw-time" id="rw-time">'+mmss(remain(tm))+'</div><div class="progress"><i id="rw-tbar" style="width:'+(100-remain(tm)/tm.total*100)+'%"></i></div><p class="muted" id="rw-tstate">'+(tm.endAt?'計時中…時間到會響鈴提醒':'按「開始計時」再開始看喔')+'</p>'+
      '<button class="btn gold" id="rw-start">'+(tm.endAt?'⏸ 暫停':'▶ 開始計時')+'</button><button class="btn ghost" id="rw-stop">⏹ 提早結束</button></div>';
    else html+='<div class="card center"><div style="font-size:30px">✅</div><b>這張兌換券的時間已經用完了</b></div>';
    if(h.yt&&tm)html+='<a class="btn blue" id="rw-yt" href="'+YT+'" target="_blank" rel="noopener">📺 打開 YouTube 搜尋哆啦A夢</a><p class="muted center" style="font-size:14px">先按「開始計時」再打開 YouTube。看完記得回到這個頁面；手機或平板切到別的 App 時，鈴聲可能要回到這頁才會響。</p>';
  }
  html+='<button class="btn ghost" id="back">⬅ 回星星存摺</button>';
  API.h(html);$('back').onclick=bank;
  if($('rw-start'))$('rw-start').onclick=function(){var t=R().timer;if(!t)return;if(t.endAt){t.remain=Math.max(0,t.endAt-Date.now());t.endAt=null;}else{t.endAt=Date.now()+t.remain;}API.save();ticket(no);};
  if($('rw-stop'))$('rw-stop').onclick=function(){if(confirm('確定要提早結束嗎？'))finishTimer(false);};}
function remain(t){return t.endAt?Math.max(0,t.endAt-Date.now()):t.remain;}
function mmss(ms){var s=Math.ceil(ms/1000);return Math.floor(s/60)+':'+('0'+s%60).slice(-2);}
function finishTimer(ring){var r=R();var t=r.timer;if(!t)return;var h=findH(t.hid);if(h){h.done=true;h.end=new Date().toISOString();h.early=!ring;}r.timer=null;API.save();
  var mt=$('rw-mini');if(mt)mt.remove();
  if(ring){chime(3);var d=document.createElement('div');d.className='rw-pop';d.id='rw-end';
    d.innerHTML='<div class="rw-pop-box"><div class="rw-burst">⏰</div><h1>時間到囉！</h1><p class="sub">'+esc(h?h.name:'')+' 結束了<br>讓眼睛休息一下，看看遠方 👀</p><button class="btn gold" id="rw-end-ok">知道了</button></div>';
    document.body.appendChild(d);var again=setInterval(function(){if(!d.isConnected){clearInterval(again);return;}chime(1);},20000);
    $('rw-end-ok').onclick=function(){clearInterval(again);d.remove();bank();};}
  else bank();}
function timerBanner(){var t=R().timer;if(!t)return '';var h=findH(t.hid);
  return '<button class="card rw-banner" data-rw-ticket="'+t.hid+'">⏱️ '+(h?esc(h.name):'計時')+'：<b class="rw-tleft">'+mmss(remain(t))+'</b> '+(t.endAt?'計時中':'（還沒開始）')+' ›</button>';}
function bindBanner(){document.querySelectorAll('[data-rw-ticket]').forEach(function(b){b.onclick=function(){ticket(+b.getAttribute('data-rw-ticket'));};});}
function tick(){var r;try{r=R();}catch(e){return;}var t=r.timer;
  var mini=$('rw-mini');
  if(!t||!t.endAt){if(mini)mini.remove();if(t&&$('rw-time'))$('rw-time').textContent=mmss(t.remain);return;}
  var ms=remain(t);
  var e=$('rw-time');if(e){e.textContent=mmss(ms);var b=$('rw-tbar');if(b)b.style.width=(100-ms/t.total*100)+'%';}
  document.querySelectorAll('.rw-tleft').forEach(function(x){x.textContent=mmss(ms);});
  if(!e){if(!mini){mini=document.createElement('button');mini.id='rw-mini';mini.className='rw-mini';mini.onclick=function(){ticket(R().timer.hid);};document.body.appendChild(mini);}mini.textContent='⏱️ '+mmss(ms);}
  else if(mini)mini.remove();
  if(ms<=60000&&!t.warned&&t.total>60000){t.warned=true;API.save();chime(1);API.toast('⏰ 還剩 1 分鐘');}
  if(ms<=0)finishTimer(true);}
setInterval(tick,1000);document.addEventListener('visibilitychange',function(){if(!document.hidden)tick();});

// ---------- 首頁卡片 ----------
function homeCard(){var r=R();
  return '<button class="planet wide rw-home" id="go-bank"><div class="rw-home-row"><span class="rw-emo">🏦</span><div style="flex:1;text-align:left"><div class="pname" style="font-size:22px">星星存摺　⭐ <b>'+r.bal+'</b></div>'+progressHTML()+'</div></div></button>'+timerBanner();}
function bindHome(){var b=$('go-bank');if(b)b.onclick=bank;bindBanner();}

// ---------- 家長專區 ----------
var unlockUntil=0;
function parentsCard(){var r=R();var unlocked=Date.now()<unlockUntil;
  var html='<div class="card" id="rw-parents"><h2>🏦 星星存摺（獎勵機制）</h2>';
  if(!r.pinChanged)html+='<p class="feedback bad" style="font-size:15px">⚠️ 家長密碼目前是預設的 <b>0000</b>，請按下面的按鈕改成只有爸媽知道的密碼。</p>';
  html+='<p>目前存摺：⭐ <b>'+r.bal+'</b>　累計存入 '+r.earned+'　今天已兌換 '+usedToday()+' / '+r.cap+' 次</p>'+
   '<p class="muted">規則：完成一關 +1、全部答對 +1、答對進位／退位題 +1（每關最多 +1）；同一關每天最多存 '+PER_KEY_DAY+' 次。</p>';
  if(!unlocked)html+='<button class="btn" id="rw-unlock">🔒 輸入家長密碼，修改設定</button>';
  else{html+='<div class="rw-form"><label>📺 哆啦A夢需要幾顆星 <input type="number" min="1" max="50" id="rw-cost" value="'+r.cost+'"></label>'+
    '<label>⏱️ 每次看幾分鐘 <input type="number" min="1" max="120" id="rw-min" value="'+r.min+'"></label>'+
    '<label>📅 每天最多兌換幾次 <input type="number" min="0" max="10" id="rw-cap" value="'+r.cap+'"></label>'+
    '<h3>🎁 其他獎勵</h3><div id="rw-alts">'+r.alts.map(function(a,i){return '<div class="rw-alt" data-i="'+i+'"><input class="emo" value="'+esc(a.emoji||'🎁')+'" maxlength="4"><input class="nm" value="'+esc(a.name)+'" maxlength="30"><input class="ct" type="number" min="1" max="50" value="'+(a.cost||r.cost)+'"><span>⭐</span><button class="mini" data-del="'+i+'">🗑</button></div>';}).join('')+'</div>'+
    '<button class="btn ghost" id="rw-add">➕ 新增獎勵</button><button class="btn gold" id="rw-save">💾 儲存設定</button>'+
    '<h3>🔑 更改家長密碼</h3><label>新密碼（4 位數字） <input type="password" inputmode="numeric" maxlength="4" id="rw-p1"></label><label>再輸入一次 <input type="password" inputmode="numeric" maxlength="4" id="rw-p2"></label><button class="btn" id="rw-pin">更改密碼</button>'+
    '<h3>🛠️ 手動調整星星</h3><div class="rw-adj"><button class="mini" data-adj="-1">－1</button><button class="mini" data-adj="1">＋1</button></div></div>';}
  html+='<h3 style="margin:12px 0 4px">🎟️ 兌換紀錄</h3>'+(r.hist.length?'<ul class="list">'+r.hist.slice().reverse().slice(0,20).map(function(h){return '<li><div>'+h.emoji+' '+esc(h.name)+'<div class="muted">'+fmt(h.t)+'・No.'+('000'+h.no).slice(-4)+(h.min?(h.done?(h.early?'・提早結束':'・時間到'):'・計時中/未開始'):'')+'</div></div><b>－'+h.cost+' ⭐</b></li>';}).join('')+'</ul>':'<p class="muted">還沒有兌換紀錄</p>');
  var lg=r.log.slice(-10).reverse();
  html+='<h3 style="margin:12px 0 4px">📒 最近存入</h3>'+(lg.length?'<ul class="list">'+lg.map(function(l){return '<li><div>'+esc(l.src)+'・'+esc(l.title)+'<div class="muted">'+fmt(l.t)+'</div></div><b>+'+l.n+'</b></li>';}).join('')+'</ul>':'<p class="muted">還沒有存入紀錄</p>');
  return html+'</div>';}
function rerender(){var c=$('rw-parents');if(!c)return;var d=document.createElement('div');d.innerHTML=parentsCard();c.replaceWith(d.firstChild);bindParents();}
function bindParents(){var r=R();
  var u=$('rw-unlock');if(u)u.onclick=function(){pinPad('修改星星存摺設定',function(){unlockUntil=Date.now()+10*60000;rerender();});};
  var sv=$('rw-save');if(sv)sv.onclick=function(){var n=function(id,lo,hi,def){var v=parseInt($(id).value,10);return isNaN(v)?def:Math.max(lo,Math.min(hi,v));};
    r.cost=n('rw-cost',1,50,5);r.min=n('rw-min',1,120,15);r.cap=n('rw-cap',0,10,2);
    var alts=[];document.querySelectorAll('.rw-alt').forEach(function(row,i){var nm=row.querySelector('.nm').value.trim();if(!nm)return;var ct=parseInt(row.querySelector('.ct').value,10);alts.push({id:'a'+Date.now().toString(36)+i,emoji:row.querySelector('.emo').value.trim()||'🎁',name:nm,cost:isNaN(ct)?r.cost:Math.max(1,Math.min(50,ct))});});
    r.alts=alts;API.save();API.toast('✅ 已儲存');rerender();};
  var ad=$('rw-add');if(ad)ad.onclick=function(){var w=$('rw-alts');var d=document.createElement('div');d.className='rw-alt';d.innerHTML='<input class="emo" value="🎁" maxlength="4"><input class="nm" placeholder="獎勵名稱" maxlength="30"><input class="ct" type="number" min="1" max="50" value="'+r.cost+'"><span>⭐</span><button class="mini" data-del="x">🗑</button>';w.appendChild(d);d.querySelector('[data-del]').onclick=function(){d.remove();};d.querySelector('.nm').focus();};
  document.querySelectorAll('#rw-alts [data-del]').forEach(function(b){b.onclick=function(){b.parentNode.remove();};});
  var pn=$('rw-pin');if(pn)pn.onclick=function(){var a=$('rw-p1').value,b=$('rw-p2').value;if(!/^\d{4}$/.test(a)){API.toast('請輸入 4 位數字');return;}if(a!==b){API.toast('兩次輸入不一樣');return;}r.pin=a;r.pinChanged=true;API.save();API.toast('🔑 密碼已更改');rerender();};
  document.querySelectorAll('[data-adj]').forEach(function(b){b.onclick=function(){r.bal=Math.max(0,r.bal+parseInt(b.getAttribute('data-adj'),10));API.save();hudBank();rerender();};});}

window.ZYReward={init:function(api){API=api;R();hudBank();setTimeout(tick,500);},earn:earn,bank:bank,ticket:ticket,homeCard:homeCard,bindHome:bindHome,parentsCard:parentsCard,bindParents:bindParents,hudBank:hudBank,R:R,_finish:finishTimer,_today:today};
})();
