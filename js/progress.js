/* 律恩的太空學習基地 — 🔐 闖關規則、解鎖順序、每題計時、本機進度備份
 * ・每一關要「過關 3 次」才拿到 1 顆星：每次過關＝第一次作答答對 8 成以上（每題要在時間內作答）；3 次之間題目不重複。
 * ・每題計時（預設 6 秒，家長專區可改）：題目唸完才開始算；超過時間＝「不會」，會顯示答案、稍後再考一次，但不算第一次答對。
 * ・關卡依順序解鎖（由下往上的闖關地圖）；家長密碼可「全部解鎖」或「重設闖關進度」。
 * ・進度只存在這台裝置（localStorage），每台手機／平板各自獨立；可匯出／匯入備份。 */
(function(){
'use strict';
var API=null;
var NEED=3,PASS=0.8;
function S(){return API.S();}
function P(){var s=S();if(!s.lvp)s.lvp={};return s.lvp;}
function L(key){var p=P();var x=p[key];if(!x)x=p[key]={runs:0,used:[],perf:0,rg:0,stars:0,tries:0};return x;}
function peek(key){var p=P();return p[key]||{runs:0,used:[],perf:0,rg:0,stars:0,tries:0};}
function done(key){return peek(key).stars>0;}
function used(key){var u={};peek(key).used.forEach(function(k){u[k]=1;});return u;}
function passNeed(n){return Math.ceil(n*PASS);}
/* o:{ok?,first,base,perfect,used:[sig],title,src,regroup,into} → {ok,runs,stars,got} */
function clear(key,o){var x=L(key);x.tries++;
  var ok=o.ok!==undefined?o.ok:(o.first>=passNeed(o.base));
  var res={ok:ok,runs:x.runs,stars:x.stars,got:false,need:passNeed(o.base||10)};
  if(!ok){API.save();return res;}
  x.runs++;x.used=x.used.concat(o.used||[]);if(o.perfect)x.perf++;if(o.regroup)x.rg=1;
  if(x.runs>=NEED){x.stars++;var perf=x.perf>=NEED,rg=!!x.rg;x.runs=0;x.used=[];x.perf=0;x.rg=0;res.got=true;res.runs=NEED;res.stars=x.stars;API.save();
    if(window.ZYReward)window.ZYReward.earn({src:o.src,key:key,title:o.title,perfect:perf,regroup:rg,into:o.into,star:true});}
  else{res.runs=x.runs;API.save();}
  return res;}
function award(key,o){var x=L(key);x.stars++;x.runs=0;x.used=[];API.save();if(window.ZYReward)window.ZYReward.earn({src:o.src,key:key,title:o.title,perfect:!!o.perfect,regroup:!!o.regroup,into:o.into,star:true});}
function mark(key){var x=L(key);if(!x.stars){x.stars=1;API.save();}}
function runStr(key,big){var x=peek(key);var n=x.runs;var s='';for(var i=0;i<NEED;i++)s+=i<n?'⭐':'☆';
  return '<span class="runstr'+(big?' big':'')+'">'+s+' <b>'+n+'/'+NEED+'</b></span>';}
function badgeStr(key){var x=peek(key);return x.stars>0?'<span class="lvstar">🌟×'+x.stars+'</span>':'';}
/* 結果頁的說明卡 */
function resultHTML(res,o){var t=secs(o.kind||'choice');
  var h='<div class="card center runcard'+(res.ok?' ok':'')+'">';
  if(res.got)h+='<div class="runbig">🌟 闖關 3 / 3，拿到星星！</div><div class="runrow">⭐⭐⭐</div>';
  else if(res.ok)h+='<div class="runbig">✅ 過關！闖關 '+res.runs+' / 3</div><div class="runrow">'+stars3(res.runs)+'</div><div class="muted">再過關 '+(NEED-res.runs)+' 次（題目會換新的）就能拿到 1 顆星</div>';
  else h+='<div class="runbig">💪 這次還沒過關（闖關 '+res.runs+' / 3）</div><div class="runrow">'+stars3(res.runs)+'</div><div class="muted">要第一次就答對 '+res.need+' 題以上'+(t?'，每題 '+t+' 秒內作答':'')+'才算過關</div>';
  return h+'</div>';}
function stars3(n){var s='';for(var i=0;i<NEED;i++)s+=i<n?'⭐':'☆';return s;}

// ---------- 每題計時 ----------
function secs(kind){var st=S().settings||{};var v=kind==='input'?st.isec:st.qsec;if(v===undefined||v===null||v==='')v=6;return +v;}
function Timer(kind,host,onTimeout){this.sec=secs(kind);this.cb=onTimeout;this.host=host;this.started=false;this.over=false;this.iv=0;this.fb=0;this.t0=0;
  if(host&&this.sec>0){host.className='qtimer wait';host.innerHTML='<i></i><span>⏱ 聽完題目後開始計時（'+this.sec+' 秒）</span>';}
  else if(host){host.className='qtimer off';host.innerHTML='';}}
Timer.prototype.start=function(){var me=this;if(me.started||me.over||!(me.sec>0))return;if(me.host&&!me.host.isConnected){me.stop();return;}
  me.started=true;clearTimeout(me.fb);me.t0=Date.now();var bar=me.host&&me.host.querySelector('i'),lab=me.host&&me.host.querySelector('span');if(me.host)me.host.className='qtimer run';
  function tick(){if(me.over)return;if(me.host&&!me.host.isConnected){me.stop();return;}var el=(Date.now()-me.t0)/1000;var left=Math.max(0,me.sec-el);
    if(bar)bar.style.width=(left/me.sec*100)+'%';if(lab)lab.textContent='⏱ '+Math.ceil(left)+' 秒';if(me.host)me.host.classList.toggle('low',left<=2);
    if(left<=0){me.stop();if(me.host){me.host.className='qtimer out';if(lab)lab.textContent='⏰ 時間到';}if(me.cb)me.cb();}}
  tick();me.iv=setInterval(tick,100);};
Timer.prototype.soon=function(ms){var me=this;clearTimeout(me.fb);me.fb=setTimeout(function(){me.start();},ms||5000);return me;};
Timer.prototype.stop=function(){this.over=true;clearInterval(this.iv);clearTimeout(this.fb);if(this.host&&this.host.classList.contains('run'))this.host.classList.add('stop');};
Timer.prototype.elapsed=function(){return this.started?(Date.now()-this.t0)/1000:0;};
function timer(kind,host,cb){return new Timer(kind,host,cb);}
function ruleHTML(){var a=secs('choice'),b=secs('input');
  return '<div class="card rulecard"><b>📏 闖關規則</b><ul>'+
   '<li>每一關要<b>過關 3 次</b>才拿到 1 顆星 🌟，3 次的題目都不一樣</li>'+
   '<li>過關：第一次作答就答對 <b>8 成</b>以上</li>'+
   (a||b?'<li>⏱ 每一題要在 <b>'+(a===b?a:'選擇題 '+a+'、輸入題 '+b)+' 秒</b>內作答（題目唸完才開始算）；超過時間算「不會」，會再考一次，但不算答對</li>':'<li>⏱ 家長已關閉每題計時</li>')+
   '<li>🔒 要先完成下面的關卡，上面的才會打開</li></ul></div>';}

// ---------- 解鎖鏈與闖關地圖（由下往上） ----------
function unlockedAll(){return !!((window.ZYDad&&window.ZYDad.on())||(S().unlock&&S().unlock.all));}
function chain(items){var free=unlockedAll();var nextSet=false;
  return items.map(function(it){var st;if(it.done)st='done';else if(!nextSet){st='next';nextSet=true;}else st=free?'open':'locked';return st;});}
function mapHTML(items,opt){opt=opt||{};var sts=chain(items);
  var h='<div class="lvmap'+(opt.cls?' '+opt.cls:'')+'"><div class="lvstart">🚀 從這裡出發 ⬆</div>';
  items.forEach(function(it,i){var st=sts[i];
    h+='<button class="lvnode st-'+st+(i%2?' r':' l')+'" data-node="'+i+'"'+(it.color?' style="--c:'+it.color+'"':'')+'>'+
      '<span class="lvnum">'+(st==='locked'?'🔒':st==='done'?'✅':(i+1))+'</span>'+
      '<span class="lvbody"><span class="lvicon">'+(it.icon||'')+'</span><span class="lvt">'+it.title+'</span>'+(it.sub?'<span class="lvsub">'+it.sub+'</span>':'')+'</span>'+
      (st==='next'?'<span class="lvnext">👉 下一關</span>':'')+'</button>';});
  h+='</div>';return {html:h,sts:sts};}
function bindMap(root,items,sts,onOpen){root.querySelectorAll('[data-node]').forEach(function(b){b.onclick=function(){var i=+b.getAttribute('data-node');
  if(sts[i]==='locked'){API.toast('🔒 先完成下面的關卡才能打開喔');b.classList.remove('shake');void b.offsetWidth;b.classList.add('shake');return;}onOpen(items[i],i);};});
  var nx=root.querySelector('.lvnode.st-next');if(nx&&nx.scrollIntoView)setTimeout(function(){try{nx.scrollIntoView({block:'center'});}catch(e){}},60);}
function isOpen(items,i){return chain(items)[i]!=='locked';}

// ---------- 裝置與備份 ----------
var KEY='zhuyinSpace.v1';
function rid(n){var c='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',s='';var a=new Uint8Array(n);try{crypto.getRandomValues(a);}catch(e){for(var i=0;i<n;i++)a[i]=Math.floor(Math.random()*256);}for(var k=0;k<n;k++)s+=c[a[k]%c.length];return s;}
function guessName(){var u=navigator.userAgent||'';if(/iPad|Macintosh/.test(u)&&'ontouchend' in document)return 'iPad';if(/iPhone/.test(u))return 'iPhone';if(/Android/.test(u))return /Mobile/.test(u)?'Android 手機':'Android 平板';return '電腦';}
function device(){var s=S();if(!s.device||!s.device.id){s.device={id:rid(4)+'-'+rid(4),name:guessName(),created:new Date().toISOString()};API.save();}return s.device;}
var persistState='未知';
function persist(){try{if(navigator.storage&&navigator.storage.persist){navigator.storage.persisted().then(function(p){if(p){persistState='已開啟';return;}return navigator.storage.persist().then(function(g){persistState=g?'已開啟':'瀏覽器未同意（仍會存，但空間不足時可能被清掉）';});}).catch(function(){persistState='不支援';});}else persistState='這個瀏覽器不支援';}catch(e){persistState='不支援';}}
function storageOK(){try{var k='__zy_t';localStorage.setItem(k,'1');localStorage.removeItem(k);return true;}catch(e){return false;}}
function exportObj(){var d=device();return {app:'律恩的太空學習基地',fmt:1,exported:new Date().toISOString(),device:{id:d.id,name:d.name},data:S()};}
function toCode(o){return 'ZY1:'+btoa(unescape(encodeURIComponent(JSON.stringify(o))));}
function fromText(t){t=String(t||'').trim();var o;if(/^ZY1:/.test(t))o=JSON.parse(decodeURIComponent(escape(atob(t.slice(4).replace(/\s+/g,'')))));else o=JSON.parse(t);
  if(!o||!o.data||typeof o.data!=='object')throw new Error('不是這個網站的備份');return o;}
function fmtT(iso){var d=new Date(iso);if(isNaN(d))return iso||'';return d.getFullYear()+'/'+(d.getMonth()+1)+'/'+d.getDate()+' '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);}
function deviceCard(){var d=device();var ok=storageOK();
  return '<div class="card" id="dev-card"><h2>📱 這台裝置的進度</h2>'+
   (ok?'':'<div class="warnbox">⚠️ 這個瀏覽器現在<b>無法儲存進度</b>（可能是無痕／私密瀏覽）。關掉頁面後進度會消失！</div>')+
   '<div class="bar" style="display:block"><div>裝置名稱：<b id="dev-name">'+API.esc(d.name||'')+'</b> <button class="mini" id="dev-rename">✏️ 改名</button></div><div class="muted">裝置編號：<b>'+d.id+'</b>・建立於 '+fmtT(d.created)+(d.restored?'<br>曾從備份還原：'+API.esc(d.restored):'')+'</div><div class="muted">長期保存：<span id="dev-persist">'+persistState+'</span></div></div>'+
   '<p class="muted" style="margin:6px 0">每台手機／平板的成績都是<b>分開</b>的，不會互相帶過去。進度存在這台裝置的瀏覽器裡：<br>⚠️ 用<b>無痕／私密瀏覽</b>、或在設定裡<b>清除 Safari（瀏覽器）歷史紀錄與網站資料</b>，進度會被清掉。建議定期按「匯出備份」存一份。</p>'+
   '<button class="btn blue" id="dev-export">💾 匯出備份（需家長密碼）</button><button class="btn ghost" id="dev-import">📥 匯入備份（需家長密碼）</button>'+
   '<h3 style="margin:12px 0 4px">🔐 闖關解鎖</h3><p class="muted" style="margin:0 0 6px">目前：'+(unlockedAll()?'<b>已全部解鎖</b>（可以跳著玩）':'依順序解鎖')+'</p>'+
   '<button class="btn ghost" id="lv-unlock">'+(unlockedAll()?'🔒 恢復依順序解鎖':'🔓 全部解鎖')+'（需家長密碼）</button><button class="btn ghost" id="lv-reset" style="color:#ff9aa8">♻️ 重設闖關進度（需家長密碼）</button>'+
   '<h3 style="margin:12px 0 4px">⏱ 每題作答時間</h3>'+
   '<label class="toggle">選擇題　<select id="set-qsec" style="font-size:17px">'+secOpts(secs('choice'))+'</select></label>'+
   '<label class="toggle">輸入題（數學、聽寫拼注音）　<select id="set-isec" style="font-size:17px">'+secOpts(secs('input'))+'</select></label>'+
   '<p class="muted" style="margin:4px 0 0">題目唸完才開始計時；超過時間算「不會」（會再考一次，但不算第一次答對）。三位數直式計算、聽寫拼注音要按好幾個鍵，6 秒可能很趕，可以視情況調長。</p></div>';}
function secOpts(v){return [0,4,5,6,8,10,12,15,20,30].map(function(n){return '<option value="'+n+'"'+(n===v?' selected':'')+'>'+(n?n+' 秒':'不計時')+'</option>';}).join('');}
function pin(title,fn){if(window.ZYReward&&window.ZYReward._pin)window.ZYReward._pin(title,fn);else if(prompt('家長密碼')===(S().reward||{}).pin)fn();}
function bindDevice(reload){var $=function(id){return document.getElementById(id);};
  var rn=$('dev-rename');if(rn)rn.onclick=function(){var d=device();var n=prompt('幫這台裝置取個名字（例如：媽媽的 iPhone）',d.name||'');if(n!==null){d.name=n.trim().slice(0,30)||d.name;API.save();reload();}};
  var q=$('set-qsec');if(q)q.onchange=function(){S().settings.qsec=+q.value;API.save();API.toast('選擇題：'+(+q.value?q.value+' 秒':'不計時'));};
  var i=$('set-isec');if(i)i.onchange=function(){S().settings.isec=+i.value;API.save();API.toast('輸入題：'+(+i.value?i.value+' 秒':'不計時'));};
  var ex=$('dev-export');if(ex)ex.onclick=function(){pin('匯出備份',function(){var o=exportObj();var txt=JSON.stringify(o);var code=toCode(o);
    var name='太空基地備份-'+(o.device.name||'')+'-'+o.device.id+'-'+o.exported.slice(0,10)+'.json';
    try{var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:'application/json'}));a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},2000);}catch(e){}
    showBox('💾 備份已建立','已下載備份檔「'+API.esc(name)+'」。<br>也可以複製下面這段<b>備份碼</b>，貼到備忘錄或傳給自己：','<textarea id="bk-code" readonly style="width:100%;height:120px;font-size:12px">'+API.esc(code)+'</textarea><button class="btn blue" id="bk-copy">📋 複製備份碼</button>',function(){
      var c=$('bk-copy');c.onclick=function(){var ta=$('bk-code');ta.select();try{(navigator.clipboard?navigator.clipboard.writeText(code):Promise.reject()).then(function(){API.toast('已複製 ✅');},function(){document.execCommand('copy');API.toast('已複製 ✅');});}catch(e){document.execCommand('copy');}};});});};
  var im=$('dev-import');if(im)im.onclick=function(){pin('匯入備份',function(){
    showBox('📥 匯入備份','選擇備份檔，或貼上備份碼。<br><b>⚠️ 匯入後，這台裝置現在的進度會被備份內容取代。</b>','<input type="file" id="bk-file" accept=".json,application/json,text/plain" style="font-size:16px;margin:6px 0"><textarea id="bk-text" placeholder="或把備份碼貼在這裡（ZY1: 開頭）" style="width:100%;height:110px;font-size:13px"></textarea><button class="btn green" id="bk-go">✅ 匯入</button>',function(){
      var txt='';$('bk-file').onchange=function(e){var f=e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(){txt=String(r.result);API.toast('已讀取檔案');};r.readAsText(f);};
      $('bk-go').onclick=function(){var t=$('bk-text').value.trim()||txt;var o;try{o=fromText(t);}catch(e){alert('讀不到備份：'+e.message);return;}
        if(!confirm('要用「'+(o.device&&o.device.name||'')+'（'+(o.device&&o.device.id||'')+'）」在 '+fmtT(o.exported)+' 的備份，取代這台裝置的進度嗎？'))return;
        var me=device();var d=o.data;d.device={id:me.id,name:me.name,created:me.created,restored:(o.device?(o.device.name||'')+' '+(o.device.id||''):'')+' @ '+fmtT(o.exported)};
        try{localStorage.setItem(KEY,JSON.stringify(d));}catch(e){alert('存不進去：'+e.message);return;}location.reload();};});});};
  var ul=$('lv-unlock');if(ul)ul.onclick=function(){pin(unlockedAll()?'恢復依順序解鎖':'全部解鎖',function(){var s=S();s.unlock=s.unlock||{};s.unlock.all=!s.unlock.all;API.save();API.toast(s.unlock.all?'🔓 已全部解鎖':'🔒 已恢復依順序解鎖');reload();});};
  var rs=$('lv-reset');if(rs)rs.onclick=function(){pin('重設闖關進度',function(){if(!confirm('確定要重設所有關卡的闖關次數、星星與解鎖進度嗎？\n（筆順練習的完成紀錄、數學動畫觀看紀錄也會清掉；錯題、測驗紀錄和星星存摺會保留）'))return;
    var s=S();s.lvp={};s.stroke={};if(s.math)s.math.lesson={};s.unlock={all:false};API.save();API.toast('♻️ 闖關進度已重設');reload();});};}
function showBox(title,msg,body,bind){var d=document.createElement('div');d.className='rw-pop';d.id='bk-box';
  d.innerHTML='<div class="rw-pop-box" style="max-width:520px;text-align:left"><h2 style="margin-top:0">'+title+'</h2><p>'+msg+'</p>'+body+'<button class="btn ghost" id="bk-close">關閉</button></div>';
  document.body.appendChild(d);document.getElementById('bk-close').onclick=function(){d.remove();};if(bind)bind();}

window.ZYP={init:function(api){API=api;device();persist();},clear:clear,award:award,mark:mark,done:done,peek:peek,used:used,runStr:runStr,badgeStr:badgeStr,resultHTML:resultHTML,passNeed:passNeed,
  timer:timer,secs:secs,ruleHTML:ruleHTML,chain:chain,mapHTML:mapHTML,bindMap:bindMap,isOpen:isOpen,unlockedAll:unlockedAll,device:device,deviceCard:deviceCard,bindDevice:bindDevice,
  _code:{toCode:toCode,fromText:fromText,exportObj:exportObj},NEED:NEED};
})();
