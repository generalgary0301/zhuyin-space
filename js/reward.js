/* 注音太空探險隊 — 🏦 星星存摺（獎勵機制）
 * 同一關闖關 3 次（題目不重複、每次答對 8 成以上、每題限時）+1、3 次都全對 +1、有答對進位／退位題 +1。同一關每天最多存 2 次。
 * 2026-11 規則改版時存摺歸零一次（r.reset9），設定、密碼、兌換紀錄保留。
 * 存滿就能兌換獎勵（需家長密碼），兌換券＋倒數計時，時間到會響鈴提醒。資料存在 localStorage。 */
(function(){
'use strict';
var API=null,$=function(id){return document.getElementById(id);};
var YT_SEARCH='https://www.youtube.com/results?search_query='+encodeURIComponent('哆啦A夢');
var PER_KEY_DAY=2;
function S(){return API.S();}
function today(d){d=d?new Date(d):new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
function R(){var s=S();var r=s.reward;if(!r)r=s.reward={};
  if(r.bal===undefined)r.bal=0;if(r.earned===undefined)r.earned=0;if(!r.pin)r.pin='0000';if(r.pinChanged===undefined)r.pinChanged=false;
  if(!r.cost)r.cost=5;if(!r.min)r.min=15;if(!r.cap)r.cap=2;r.hist=r.hist||[];r.log=r.log||[];r.day=r.day||{};
  if(!r.alts)r.alts=[{id:'a1',emoji:'🎲',name:'跟爸爸玩桌遊',cost:5},{id:'a2',emoji:'📖',name:'多聽一個睡前故事',cost:5},{id:'a3',emoji:'🍽️',name:'週末選晚餐',cost:5}];
  if(!r.reset9){r.bal=0;r.earned=0;r.log=[];r.day={};r.reset9=new Date().toISOString();try{API.save();}catch(e){}} // 2026-11 新規則上線：存摺歸零一次（設定與密碼保留）
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
  parts.push([(o.star?'闖關 3 次過關「':'完成「')+o.title+'」',1]);if(o.perfect)parts.push([o.star?'3 次都全部答對':'全部答對',1]);if(o.regroup)parts.push(['進位／退位題答對',1]);
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
  html+='</div><div class="card"><h2>⭐ 怎麼存星星？</h2><ul class="list"><li><div>同一關<b>過關 3 次</b>（3 次題目都不一樣；每次第一次作答答對 8 成以上，每題要在時間內作答）</div><b>+1</b></li><li><div>3 次都全部答對</div><b>+1</b></li><li><div>數學：有答對進位或退位的題目</div><b>+1</b></li><li><div>筆順：一個符號 3 關（描一描、虛線寫、自己寫）都過</div><b>+1</b></li></ul></div>';
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
// 預設影片：Muse木棉花（台灣代理）官方頻道的國語版《新哆啦A夢》，已確認可嵌入播放、標示為闔家觀賞
var DEF_VIDS=[
 ['BI5qDyVqEjA','哆啦A夢 小單元01：太空探險・後山星'],
 ['3jK-2NxExJY','哆啦A夢 小單元02：大雄的漫長離家出走'],
 ['A9lwXGw7cc0','新哆啦A夢 第488話'],
 ['RgZ7rxUaabc','新哆啦A夢 第487話'],
 ['zX-qljK5fqk','新哆啦A夢 第486話'],
 ['49e2jQDdiYE','新哆啦A夢 第485話'],
 ['t4gUFlGBGjE','新哆啦A夢 第484話'],
 ['yx_wVhEWdIs','新哆啦A夢 第483話'],
 ['3KhM4ZuwgNY','新哆啦A夢 第482話'],
 ['lUh77YJFqxk','新哆啦A夢 第481話'],
 ['vPRknJAtXD8','新哆啦A夢 第480話'],
 ['_2SHJMLFDnc','新哆啦A夢 第479話'],
 ['xKj9v6tQTHQ','新哆啦A夢 第478話'],
 ['GbdroceYdOk','新哆啦A夢 第477話'],
 ['TXv9e0wLm-U','新哆啦A夢 第475話'],
 ['6FJWOt8SjMk','新哆啦A夢 第471話'],
 ['2jiI5lnnEPg','新哆啦A夢 第470話'],
 ['7sQeFF1xQPQ','新哆啦A夢 第469話'],
 ['NGk6bO64Gm0','新哆啦A夢 第468話'],
 ['cO9j3q0kNCs','新哆啦A夢 第330話'],
 ['G1aV8J6QSfI','新哆啦A夢 第320話'],
 ['xeDmUlATQ2c','新哆啦A夢 第303話'],
 ['L-kaAHODrII','新哆啦A夢 第285話'],
 ['USezAUegm5Q','新哆啦A夢 第279話'],
 ['Ma22cvEc51c','新哆啦A夢 第258話'],
 ['o_8McH0tsfc','新哆啦A夢 第250話'],
 ['ix-XHaZOlSw','新哆啦A夢 第249話'],
 ['SlXHocexW2w','新哆啦A夢 第238話'],
 ['Lss5eXjGexg','新哆啦A夢 第234話']
].map(function(v){return {id:v[0],t:v[1]};});
function V(){var r=R();if(!r.vids)r.vids=DEF_VIDS.slice();if(!r.vbad)r.vbad={};if(!r.vpos)r.vpos={i:0,t:0};return r;}
function goodVids(){var r=V();return r.vids.filter(function(v){return !r.vbad[v.id];});}
function parseVid(s){s=String(s||'').trim();var m=/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{11})/.exec(s);if(m)return m[1];return /^[A-Za-z0-9_-]{11}$/.test(s)?s:null;}
function findH(no){return R().hist.filter(function(h){return h.no===no;})[0];}
function ticket(no){var h=findH(no);if(!h)return bank();var r=R();var tm=r.timer&&r.timer.hid===no?r.timer:null;
  var html='<div class="muted">🏦 星星存摺 › 🎟️ 兌換券</div>'+
   '<div class="rw-ticket"><div class="rw-ticket-top">🎟️ 兌換券　<span>No.'+('000'+h.no).slice(-4)+'</span></div><div class="rw-ticket-emo">'+h.emoji+'</div><div class="rw-ticket-name">'+esc(h.name)+'</div>'+
   '<div class="rw-ticket-meta">律恩・'+fmt(h.t)+'・用了 ⭐ '+h.cost+'</div><div class="rw-ticket-ok">✅ 家長已確認</div></div>';
  if(!r.pinChanged)html+='<p class="feedback bad center" style="font-size:15px">⚠️ 家長密碼還是預設的 0000，請到「家長專區 › 星星存摺設定」改成自己的密碼</p>';
  if(h.min){
    if(tm){html+='<div class="card center"><div class="muted">⏱️ 剩下時間</div><div class="rw-time" id="rw-time">'+mmss(remain(tm))+'</div><div class="progress"><i id="rw-tbar" style="width:'+(100-remain(tm)/tm.total*100)+'%"></i></div>'+
      '<p class="muted">'+(h.yt?'在放映室裡看才會開始計時；離開放映室就暫停。時間到會自動停止影片。':(tm.endAt?'計時中…':'按開始計時'))+'</p>'+
      (h.yt?'<button class="btn gold" id="rw-theater">▶ '+(tm.used?'回到':'進入')+'哆啦A夢放映室</button>':'<button class="btn gold" id="rw-start">'+(tm.endAt?'⏸ 暫停':'▶ 開始計時')+'</button>')+
      '<button class="btn ghost" id="rw-stop">⏹ 提早結束</button></div>';
      if(h.yt)html+='<p class="center"><button class="rw-link" id="rw-ytapp">在 YouTube App 開啟（需家長密碼，不會有時間到提醒）</button></p>';}
    else html+='<div class="card center"><div style="font-size:30px">✅</div><b>這張兌換券的時間已經用完了</b></div>';
  }
  html+='<button class="btn ghost" id="back">⬅ 回星星存摺</button>';
  API.h(html);$('back').onclick=bank;
  if($('rw-theater'))$('rw-theater').onclick=function(){theater(no);};
  if($('rw-ytapp'))$('rw-ytapp').onclick=function(){pinPad('用 YouTube App 看',function(){
    if(!confirm('在 YouTube App 看的時候，這個網站沒辦法在時間到時提醒或停止影片。確定要開啟嗎？'))return;window.open(YT_SEARCH,'_blank','noopener');});};
  if($('rw-start'))$('rw-start').onclick=function(){var t=R().timer;if(!t)return;if(t.endAt){t.remain=Math.max(0,t.endAt-Date.now());t.endAt=null;}else{t.endAt=Date.now()+t.remain;}API.save();ticket(no);};
  if($('rw-stop'))$('rw-stop').onclick=function(){if(confirm('確定要提早結束嗎？'))finishTimer(false);};}
function remain(t){return t.endAt?Math.max(0,t.endAt-Date.now()):t.remain;}
function mmss(ms){var s=Math.ceil(ms/1000);return Math.floor(s/60)+':'+('0'+s%60).slice(-2);}
function pauseTimer(){var t=R().timer;if(t&&t.endAt){t.remain=Math.max(0,t.endAt-Date.now());t.endAt=null;API.save();}}
function resumeTimer(){var t=R().timer;if(t&&!t.endAt){t.endAt=Date.now()+t.remain;t.used=true;API.save();}}

// ---------- 📺 放映室（YouTube IFrame Player API，計時器控制播放） ----------
var player=null,ytReady=false,ytWait=[],TH=null;
function loadYT(cb){if(ytReady&&window.YT&&window.YT.Player)return cb();ytWait.push(cb);
  if(!document.getElementById('yt-api')){var s=document.createElement('script');s.id='yt-api';s.src='https://www.youtube.com/iframe_api';s.onerror=function(){var e=$('th-msg');if(e)e.textContent='連不上 YouTube，請確認網路';};document.head.appendChild(s);
    var prev=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=function(){ytReady=true;if(prev)try{prev();}catch(e){}var q=ytWait;ytWait=[];q.forEach(function(f){f();});};}}
function theater(no){var r=V();var t=r.timer;if(!t||t.hid!==no)return ticket(no);if(r.timeup)return showTimeup();
  var vids=goodVids();
  var d=document.createElement('div');d.id='rw-th';d.className='rw-th';
  d.innerHTML='<div class="th-bar"><button class="th-btn" id="th-close">⏸ 休息一下</button><div class="th-title" id="th-title">哆啦A夢放映室</div><button class="th-btn" id="th-list">📋 選集</button><button class="th-btn" id="th-next">⏭</button><button class="th-btn" id="th-fs">⛶</button></div>'+
    '<div class="th-stage"><div id="th-player"></div><div class="th-block tl"></div><div class="th-block br"></div><div class="th-time" id="th-time">⏱️ '+mmss(remain(t))+'</div><div class="th-msg" id="th-msg">載入中…</div></div><div class="th-listbox" id="th-listbox" hidden></div>';
  document.body.appendChild(d);document.body.classList.add('th-open');TH={no:no,errs:0};
  if(!vids.length){$('th-msg').textContent='影片清單是空的，請爸媽到家長專區加入影片';}
  $('th-close').onclick=closeTheater;
  $('th-next').onclick=function(){nextVid(1);};
  $('th-fs').onclick=function(){var el=d;try{if(document.fullscreenElement||document.webkitFullscreenElement){(document.exitFullscreen||document.webkitExitFullscreen).call(document);}else{(el.requestFullscreen||el.webkitRequestFullscreen).call(el);}}catch(e){API.toast('這台裝置不支援全螢幕，已用放大畫面');}};
  $('th-list').onclick=function(){var lb=$('th-listbox');if(!lb.hidden){lb.hidden=true;return;}var vs=goodVids();
    lb.innerHTML='<div class="th-list-h">選一集 <button class="th-btn" id="th-lclose">✖</button></div>'+vs.map(function(v,i){return '<button class="th-item'+(i===V().vpos.i?' on':'')+'" data-vi="'+i+'"><img src="https://i.ytimg.com/vi/'+v.id+'/mqdefault.jpg" alt=""><span>'+esc(v.t||v.id)+'</span></button>';}).join('');
    lb.hidden=false;$('th-lclose').onclick=function(){lb.hidden=true;};
    lb.querySelectorAll('[data-vi]').forEach(function(b){b.onclick=function(){lb.hidden=true;var r=V();r.vpos={i:+b.getAttribute('data-vi'),t:0};API.save();playCur();};});};
  if(!vids.length)return;
  loadYT(function(){if(!$('rw-th'))return;
    var cur=curVid();
    player=new YT.Player('th-player',{width:'100%',height:'100%',videoId:cur.id,host:'https://www.youtube.com',
      playerVars:{playsinline:1,rel:0,fs:0,modestbranding:1,iv_load_policy:3,hl:'zh-TW',start:Math.floor(V().vpos.t||0),autoplay:1,origin:location.protocol==='file:'?undefined:location.origin},
      events:{onReady:function(e){$('th-msg').textContent='';setTitle();try{e.target.playVideo();}catch(x){}resumeTimer();tick();},
        onStateChange:function(e){if(e.data===1){$('th-msg').textContent='';TH.errs=0;resumeTimer();}if(e.data===0){var r=V();r.vpos={i:r.vpos.i+1,t:0};API.save();playCur();}},
        onError:function(e){var c=curVid();var r=V();r.vbad[c.id]=e.data;API.save();TH.errs++;
          $('th-msg').textContent='這一集不能在這裡播放（代碼 '+e.data+'），自動換下一集…';
          if(TH.errs>Math.max(3,goodVids().length+1)){$('th-msg').textContent='影片都不能播放，請爸媽到家長專區檢查影片清單';return;}
          setTimeout(function(){var r=V();if(r.vpos.i>=goodVids().length)r.vpos.i=0;r.vpos.t=0;API.save();playCur();},1500);}}});});}
function curVid(){var vs=goodVids();var r=V();if(!vs.length)return {id:'',t:''};if(r.vpos.i>=vs.length||r.vpos.i<0)r.vpos.i=0;return vs[r.vpos.i];}
function setTitle(){var e=$('th-title');if(e)e.textContent='📺 '+(curVid().t||'哆啦A夢');}
function playCur(){var c=curVid();if(!player||!c.id)return;setTitle();try{player.loadVideoById({videoId:c.id,startSeconds:Math.floor(V().vpos.t||0)});}catch(e){}}
function nextVid(k){var r=V();r.vpos={i:(r.vpos.i+k)%Math.max(1,goodVids().length),t:0};API.save();playCur();}
function savePos(){try{if(player&&player.getCurrentTime){var r=V();r.vpos.t=Math.max(0,player.getCurrentTime()-3);API.save();}}catch(e){}}
function exitFS(){try{if(document.fullscreenElement||document.webkitFullscreenElement)(document.exitFullscreen||document.webkitExitFullscreen).call(document);}catch(e){}}
function destroyTheater(){savePos();try{if(player){player.stopVideo&&player.stopVideo();player.destroy();}}catch(e){}player=null;exitFS();var d=$('rw-th');if(d)d.remove();document.body.classList.remove('th-open');var no=TH&&TH.no;TH=null;return no;}
function closeTheater(){pauseTimer();var no=destroyTheater();if(no)ticket(no);}

// ---------- 時間到：停止影片、全螢幕遮罩、要家長密碼才能關 ----------
function finishTimer(ring){var r=R();var t=r.timer;if(!t)return;var h=findH(t.hid);
  if(ring){try{if(player&&player.pauseVideo)player.pauseVideo();}catch(e){}savePos();exitFS();
    if(h){h.done=true;h.end=new Date().toISOString();h.early=false;}r.timer=null;r.timeup={hid:t.hid,name:h?h.name:'',at:Date.now()};API.save();
    destroyTheater();var mt=$('rw-mini');if(mt)mt.remove();showTimeup();return;}
  if(h){h.done=true;h.end=new Date().toISOString();h.early=true;}r.timer=null;API.save();destroyTheater();var mt2=$('rw-mini');if(mt2)mt2.remove();bank();}
var tuRing=null;
function showTimeup(){var r=R();var tu=r.timeup;if(!tu||$('rw-end'))return;
  var d=document.createElement('div');d.className='rw-pop rw-timeup';d.id='rw-end';
  d.innerHTML='<div class="rw-pop-box"><div class="rw-burst">⏰</div><h1>時間到囉！</h1><p class="sub">'+esc(tu.name)+' 結束了<br>讓眼睛休息一下，看看遠方 👀</p><p class="muted">請爸爸或媽媽輸入家長密碼</p><button class="btn gold" id="rw-end-ok">🔒 家長密碼</button></div>';
  document.body.appendChild(d);chime(3);clearInterval(tuRing);tuRing=setInterval(function(){if(!d.isConnected){clearInterval(tuRing);return;}chime(1);},20000);
  $('rw-end-ok').onclick=function(){pinPad('時間到・家長確認',function(){var box=d.querySelector('.rw-pop-box');
    box.innerHTML='<div class="rw-burst">👍</div><h2>家長已確認</h2><button class="btn gold" id="rw-tu-end">✅ 結束，去休息</button><button class="btn blue" id="rw-tu-more">➕ 再看 5 分鐘（不扣星星）</button>';
    $('rw-tu-end').onclick=function(){clearInterval(tuRing);var r=R();r.timeup=null;API.save();d.remove();bank();};
    $('rw-tu-more').onclick=function(){clearInterval(tuRing);var r=R();var hid=r.timeup.hid;r.timeup=null;var h=findH(hid);if(h){h.done=false;h.ext=(h.ext||0)+5;}
      r.timer={hid:hid,total:5*60000,remain:5*60000,endAt:null,warned:true,used:true};API.save();d.remove();theater(hid);};});};}
function timerBanner(){var t=R().timer;if(!t)return '';var h=findH(t.hid);
  return '<button class="card rw-banner" data-rw-ticket="'+t.hid+'">⏱️ '+(h?esc(h.name):'計時')+'：<b class="rw-tleft">'+mmss(remain(t))+'</b> '+(t.endAt?'計時中':'（暫停中）')+' ›</button>';}
function bindBanner(){document.querySelectorAll('[data-rw-ticket]').forEach(function(b){b.onclick=function(){ticket(+b.getAttribute('data-rw-ticket'));};});}
function tick(){var r;try{r=R();}catch(e){return;}if(r.timeup&&!$('rw-end'))showTimeup();var t=r.timer;
  var mini=$('rw-mini');
  if(!t||!t.endAt){if(mini)mini.remove();if(t&&$('rw-time'))$('rw-time').textContent=mmss(t.remain);return;}
  var ms=remain(t);
  var e=$('rw-time');if(e){e.textContent=mmss(ms);var b=$('rw-tbar');if(b)b.style.width=(100-ms/t.total*100)+'%';}
  var tt=$('th-time');if(tt){tt.textContent='⏱️ '+mmss(ms);tt.classList.toggle('warn',ms<=60000);}
  document.querySelectorAll('.rw-tleft').forEach(function(x){x.textContent=mmss(ms);});
  if(!e&&!tt){if(!mini){mini=document.createElement('button');mini.id='rw-mini';mini.className='rw-mini';mini.onclick=function(){ticket(R().timer.hid);};document.body.appendChild(mini);}mini.textContent='⏱️ '+mmss(ms);}
  else if(mini)mini.remove();
  if(ms<=60000&&!t.warned&&t.total>60000){t.warned=true;API.save();chime(1);API.toast('⏰ 還剩 1 分鐘');}
  if(ms<=0)finishTimer(true);
  else if(!tt&&findH(t.hid)&&findH(t.hid).yt){pauseTimer();} // 影片獎勵：不在放映室就不計時
}
setInterval(tick,1000);document.addEventListener('visibilitychange',function(){if(!document.hidden)tick();else savePos();});
window.addEventListener('pagehide',savePos);

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
   '<p class="muted">規則：同一關過關 3 次（題目不重複、每次答對 8 成以上、每題限時）+1、3 次都全對 +1、數學有答對進位／退位題 +1、筆順一個符號 3 關都過 +1；同一關每天最多存 '+PER_KEY_DAY+' 次。2026/11 新規則上線時，存摺已歸零一次（設定、密碼、兌換紀錄保留）。</p>';
  if(!unlocked)html+='<button class="btn" id="rw-unlock">🔒 輸入家長密碼，修改設定</button>';
  else{html+='<div class="rw-form"><label>📺 哆啦A夢需要幾顆星 <input type="number" min="1" max="50" id="rw-cost" value="'+r.cost+'"></label>'+
    '<label>⏱️ 每次看幾分鐘 <input type="number" min="1" max="120" id="rw-min" value="'+r.min+'"></label>'+
    '<label>📅 每天最多兌換幾次 <input type="number" min="0" max="10" id="rw-cap" value="'+r.cap+'"></label>'+
    '<h3>🎁 其他獎勵</h3><div id="rw-alts">'+r.alts.map(function(a,i){return '<div class="rw-alt" data-i="'+i+'"><input class="emo" value="'+esc(a.emoji||'🎁')+'" maxlength="4"><input class="nm" value="'+esc(a.name)+'" maxlength="30"><input class="ct" type="number" min="1" max="50" value="'+(a.cost||r.cost)+'"><span>⭐</span><button class="mini" data-del="'+i+'">🗑</button></div>';}).join('')+'</div>'+
    '<button class="btn ghost" id="rw-add">➕ 新增獎勵</button><button class="btn gold" id="rw-save">💾 儲存設定</button>'+
    '<h3>🔑 更改家長密碼</h3><label>新密碼（4 位數字） <input type="password" inputmode="numeric" maxlength="4" id="rw-p1"></label><label>再輸入一次 <input type="password" inputmode="numeric" maxlength="4" id="rw-p2"></label><button class="btn" id="rw-pin">更改密碼</button>'+
    vidsHTML()+
    '<h3>🛠️ 手動調整星星</h3><div class="rw-adj"><button class="mini" data-adj="-1">－1</button><button class="mini" data-adj="1">＋1</button></div></div>';}
  html+='<h3 style="margin:12px 0 4px">🎟️ 兌換紀錄</h3>'+(r.hist.length?'<ul class="list">'+r.hist.slice().reverse().slice(0,20).map(function(h){return '<li><div>'+h.emoji+' '+esc(h.name)+'<div class="muted">'+fmt(h.t)+'・No.'+('000'+h.no).slice(-4)+(h.min?(h.done?(h.early?'・提早結束':'・時間到'):'・計時中/未開始'):'')+'</div></div><b>－'+h.cost+' ⭐</b></li>';}).join('')+'</ul>':'<p class="muted">還沒有兌換紀錄</p>');
  var lg=r.log.slice(-10).reverse();
  html+='<h3 style="margin:12px 0 4px">📒 最近存入</h3>'+(lg.length?'<ul class="list">'+lg.map(function(l){return '<li><div>'+esc(l.src)+'・'+esc(l.title)+'<div class="muted">'+fmt(l.t)+'</div></div><b>+'+l.n+'</b></li>';}).join('')+'</ul>':'<p class="muted">還沒有存入紀錄</p>');
  return html+'</div>';}
function vidsHTML(){var r=V();
  return '<h3>📺 哆啦A夢影片清單（在網站裡播放）</h3><p class="muted" style="font-size:14px">預設是 Muse木棉花 官方頻道的國語版《新哆啦A夢》。可以貼上 YouTube 網址或影片 ID 新增；不能嵌入播放的影片會自動跳過並標示 ⚠️。</p>'+
   '<div id="rw-vids">'+r.vids.map(function(v,i){return '<div class="rw-vid"><img src="https://i.ytimg.com/vi/'+v.id+'/default.jpg" alt=""><div class="rw-vid-t">'+esc(v.t||v.id)+'<div class="muted">'+v.id+(r.vbad[v.id]?' ⚠️ 無法嵌入（'+r.vbad[v.id]+'）':'')+'</div></div><button class="mini" data-vdel="'+i+'">🗑</button></div>';}).join('')+'</div>'+
   '<div class="rw-vadd"><input id="rw-vurl" placeholder="貼上 YouTube 網址或影片 ID"><button class="mini" id="rw-vaddb">➕ 加入</button></div>'+
   '<div class="rw-adj"><button class="mini" id="rw-vclr">清除 ⚠️ 標記</button><button class="mini" id="rw-vdef">恢復預設清單</button></div>';}
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
  document.querySelectorAll('[data-vdel]').forEach(function(b){b.onclick=function(){var r=V();r.vids.splice(+b.getAttribute('data-vdel'),1);r.vpos={i:0,t:0};API.save();rerender();};});
  var va=$('rw-vaddb');if(va)va.onclick=function(){var id=parseVid($('rw-vurl').value);if(!id){API.toast('看不懂這個網址，請貼 YouTube 影片網址');return;}var r=V();if(r.vids.some(function(v){return v.id===id;})){API.toast('清單裡已經有了');return;}
    var add=function(t){r.vids.push({id:id,t:t||id});delete r.vbad[id];API.save();rerender();API.toast('✅ 已加入');};
    fetch('https://www.youtube.com/oembed?format=json&url='+encodeURIComponent('https://www.youtube.com/watch?v='+id)).then(function(x){if(x.status===401||x.status===403){r.vbad[id]='不允許嵌入';}return x.ok?x.json():null;}).then(function(j){add(j&&j.title?j.title.replace(/｜.*$/,'').replace(/^【國語】/,''):id);}).catch(function(){add(id);});};
  var vc=$('rw-vclr');if(vc)vc.onclick=function(){V().vbad={};API.save();rerender();};
  var vd=$('rw-vdef');if(vd)vd.onclick=function(){if(!confirm('恢復成預設的影片清單？'))return;var r=V();r.vids=DEF_VIDS.slice();r.vbad={};r.vpos={i:0,t:0};API.save();rerender();};
  document.querySelectorAll('[data-adj]').forEach(function(b){b.onclick=function(){r.bal=Math.max(0,r.bal+parseInt(b.getAttribute('data-adj'),10));API.save();hudBank();rerender();};});}

window.ZYReward={_pin:function(t,f){pinPad(t,f);},init:function(api){API=api;V();hudBank();setTimeout(tick,500);},theater:theater,_p:function(){return player;},_vids:goodVids,earn:earn,bank:bank,ticket:ticket,homeCard:homeCard,bindHome:bindHome,parentsCard:parentsCard,bindParents:bindParents,hudBank:hudBank,R:R,_finish:finishTimer,_today:today};
})();
