(function(){
'use strict';
// ---------- data ----------
var INITS=['ㄓ','ㄗ','ㄔ','ㄘ','ㄕ','ㄙ'];
var FINS=['ㄣ','ㄥ','ㄢ','ㄤ','ㄟ','ㄝ','ㄡ','ㄛ'].filter(function(f){return window.ZY_RAW_F&&window.ZY_RAW_F[f];});
var SOUNDS=INITS.concat(FINS);
var ISFIN={};FINS.forEach(function(f){ISFIN[f]=1;});
var PAIR={'ㄓ':'ㄗ','ㄗ':'ㄓ','ㄔ':'ㄘ','ㄘ':'ㄔ','ㄕ':'ㄙ','ㄙ':'ㄕ','ㄣ':'ㄥ','ㄥ':'ㄣ','ㄢ':'ㄤ','ㄤ':'ㄢ','ㄟ':'ㄝ','ㄝ':'ㄟ','ㄡ':'ㄛ','ㄛ':'ㄡ'};
var GROUP3={'ㄓ':['ㄓ','ㄗ','ㄔ'],'ㄗ':['ㄗ','ㄓ','ㄘ'],'ㄔ':['ㄔ','ㄘ','ㄕ'],'ㄘ':['ㄘ','ㄔ','ㄙ'],'ㄕ':['ㄕ','ㄙ','ㄓ'],'ㄙ':['ㄙ','ㄕ','ㄗ'],
 'ㄣ':['ㄣ','ㄥ','ㄢ'],'ㄥ':['ㄥ','ㄣ','ㄤ'],'ㄢ':['ㄢ','ㄤ','ㄣ'],'ㄤ':['ㄤ','ㄢ','ㄥ'],'ㄟ':['ㄟ','ㄝ','ㄞ'],'ㄝ':['ㄝ','ㄟ','ㄚ'],'ㄡ':['ㄡ','ㄛ','ㄠ'],'ㄛ':['ㄛ','ㄡ','ㄜ']};
var EXAMPLE={'ㄓ':'蜘蛛的蜘','ㄗ':'自己的自','ㄔ':'吃飯的吃','ㄘ':'刺蝟的刺','ㄕ':'老師的師','ㄙ':'松鼠的松',
 'ㄣ':'大門','ㄥ':'電燈','ㄢ':'雞蛋','ㄤ':'糖果','ㄟ':'飛機','ㄝ':'蝴蝶','ㄡ':'小狗','ㄛ':'婆婆'};
var EXSHORT={'ㄓ':'蜘','ㄗ':'自','ㄔ':'吃','ㄘ':'刺','ㄕ':'師','ㄙ':'松','ㄣ':'門','ㄥ':'燈','ㄢ':'蛋','ㄤ':'糖','ㄟ':'飛','ㄝ':'蝶','ㄡ':'狗','ㄛ':'婆','ㄞ':'愛','ㄚ':'啊','ㄠ':'貓','ㄜ':'鵝'};
var SKEY={'ㄓ':'zh','ㄗ':'z','ㄔ':'ch','ㄘ':'c','ㄕ':'sh','ㄙ':'s'};
// 韻母的符號讀音用教育部《國語注音符號手冊》錄音（audio/bpmf_XX.mp3）
var BPMF={'ㄛ':'bpmf_23','ㄝ':'bpmf_25','ㄟ':'bpmf_27','ㄡ':'bpmf_29','ㄢ':'bpmf_30','ㄣ':'bpmf_31','ㄤ':'bpmf_32','ㄥ':'bpmf_33'};
function soundKey(s){return ISFIN[s]?BPMF[s]:'sy_'+SKEY[s];}
var QPER=10;
var PLANET={
 'ㄓ':{name:'蜘蛛星',color:'linear-gradient(135deg,#ff9f43,#ee5253)',icon:'🕷️',tip:'捲舌音：舌尖往上翹，碰到上牙齦後面'},
 'ㄗ':{name:'自己星',color:'linear-gradient(135deg,#48dbfb,#0abde3)',icon:'🙋',tip:'平舌音：舌頭平平的，舌尖頂在下門牙後面'},
 'ㄔ':{name:'吃飯星',color:'linear-gradient(135deg,#feca57,#ff9f43)',icon:'🍚',tip:'捲舌音：舌尖翹起來，再用力送一口氣'},
 'ㄘ':{name:'刺蝟星',color:'linear-gradient(135deg,#1dd1a1,#10ac84)',icon:'🦔',tip:'平舌音：舌頭平平的，送出一口氣'},
 'ㄕ':{name:'獅子星',color:'linear-gradient(135deg,#ff6b6b,#c44569)',icon:'🦁',tip:'捲舌音：舌尖翹起來，讓氣從縫裡慢慢出來'},
 'ㄙ':{name:'松鼠星',color:'linear-gradient(135deg,#a29bfe,#6c5ce7)',icon:'🐿️',tip:'平舌音：舌頭平平的，像蛇一樣「ㄙ～」'},
 'ㄣ':{name:'大門星',color:'linear-gradient(135deg,#f78fb3,#e66767)',icon:'🚪',tip:'前鼻音：最後舌尖頂住上牙齦，嘴巴不要張大，「ㄣ」收得短短的'},
 'ㄥ':{name:'燈籠星',color:'linear-gradient(135deg,#f8a5c2,#c44569)',icon:'🏮',tip:'後鼻音：最後舌頭往後縮、舌根抬高，聲音在鼻子裡嗡嗡響「ㄥ～」'},
 'ㄢ':{name:'雞蛋星',color:'linear-gradient(135deg,#63cdda,#3dc1d3)',icon:'🥚',tip:'前鼻音：嘴巴先張開唸「ㄚ」，最後舌尖頂到上牙齦'},
 'ㄤ':{name:'糖果星',color:'linear-gradient(135deg,#778beb,#546de5)',icon:'🍬',tip:'後鼻音：嘴巴張大唸「ㄚ」，最後舌根往後抬，聲音從鼻子出來'},
 'ㄟ':{name:'飛機星',color:'linear-gradient(135deg,#f7d794,#f19066)',icon:'✈️',tip:'從「ㄝ」滑到「ㄧ」，嘴角慢慢往兩邊拉開「ㄟ～」'},
 'ㄝ':{name:'蝴蝶星',color:'linear-gradient(135deg,#cf6a87,#786fa6)',icon:'🦋',tip:'嘴巴半開、不要動，常跟ㄧ、ㄩ一起出現，像「葉」「月」的尾巴'},
 'ㄡ':{name:'狗狗星',color:'linear-gradient(135deg,#e15f41,#c44569)',icon:'🐶',tip:'從「ㄛ」滑到「ㄨ」，嘴巴最後收成小小的圓'},
 'ㄛ':{name:'菠蘿星',color:'linear-gradient(135deg,#f5cd79,#e77f67)',icon:'🍍',tip:'嘴巴圓圓的、從頭到尾不要動，像「喔」'}
};
var MIXES=[['ㄓ','ㄗ','ㄓㄗ雙子星','linear-gradient(135deg,#ff9f43,#0abde3)'],['ㄔ','ㄘ','ㄔㄘ雙子星','linear-gradient(135deg,#feca57,#10ac84)'],['ㄕ','ㄙ','ㄕㄙ雙子星','linear-gradient(135deg,#ff6b6b,#6c5ce7)']];
var MIXES_F=[['ㄣ','ㄥ','ㄣㄥ雙子星','linear-gradient(135deg,#e66767,#c44569)'],['ㄢ','ㄤ','ㄢㄤ雙子星','linear-gradient(135deg,#3dc1d3,#546de5)'],['ㄟ','ㄝ','ㄟㄝ雙子星','linear-gradient(135deg,#f19066,#786fa6)'],['ㄡ','ㄛ','ㄡㄛ雙子星','linear-gradient(135deg,#c44569,#e77f67)']].filter(function(m){return ISFIN[m[0]]&&ISFIN[m[1]];});
var MIXES_I=MIXES;MIXES=MIXES_I.concat(MIXES_F);
var WORDS={},ALL=[];
SOUNDS.forEach(function(s){
  WORDS[s]=(ISFIN[s]?window.ZY_RAW_F[s]:window.ZY_RAW[s]).trim().split('\n').map(function(line,i){
    var p=line.trim().split('|');
    var w={id:p[0],sound:s,word:p[0],zy:p[1].split(' '),emoji:p[2],t:parseInt(p[3],10),alts:p[4]?p[4].split(';').map(function(a){return a.split(' ');}):[],aud:p[5],src:p[6]||'',where:p[7]||'',line:p[8]||''};
    ALL.push(w);return w;
  });
});
var BYID={};ALL.forEach(function(w){BYID[w.id]=w;});
var NEWID={};SOUNDS.forEach(function(s){WORDS[s].slice(80).forEach(function(w){NEWID[w.id]=1;});});
function idsOf(s){return WORDS[s].map(function(w){return w.id;});}
// 最小對比詞（只差一個韻母的兩個真詞），雙子星用
var MINPAIRS=(window.ZY_MINPAIRS||[]).filter(function(p){return BYID[p[0]]&&BYID[p[1]];});
// 取出音節中要練習的符號：聲母星取聲母，韻母星取韻母
var SYLRE=/^(˙)?([ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙ])?([ㄧㄨㄩ])?([ㄚㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥㄦ])?([ˊˇˋ])?$/;
function unitOf(syl,fin){var m=SYLRE.exec(syl);if(!m)return '';return fin?(m[4]||''):(m[2]||'');}
function swapUnit(syl,fin,to){if(!fin)return swapInit(syl,to);var m=SYLRE.exec(syl);if(!m||!m[4])return syl;return (m[1]||'')+(m[2]||'')+(m[3]||'')+to+(m[5]||'');}

// ---------- storage ----------
var KEY='zhuyinSpace.v1';
var DEF={ver:2,fuel:0,missions:{},mix:{},stats:{},tests:[],q:{},stroke:{},settings:{showHanzi:false,showEmoji:false,speed:1}};
var S;
function load(){try{S=JSON.parse(localStorage.getItem(KEY))||{};}catch(e){S={};}
  var fresh=!S.ver&&!S.stats&&!S.missions;var oldVer=fresh?2:(S.ver||1);
  for(var k in DEF){if(S[k]===undefined)S[k]=JSON.parse(JSON.stringify(DEF[k]));}
  for(var k2 in DEF.settings){if(S.settings[k2]===undefined)S.settings[k2]=DEF.settings[k2];}
  S.ver=oldVer;
  if(S.ver<2){ // v1 → v2：統計改用「詞」當 key
    var old=window.ZY_OLD_IDS||{},ns={};
    for(var oid in S.stats){var w=old[oid]||oid;if(BYID[w])ns[w]=S.stats[oid];}
    S.stats=ns;(S.tests||[]).forEach(function(t){(t.wrong||[]).forEach(function(x){if(old[x.id])x.id=old[x.id];});});
    if(S.settings.rate!==undefined){S.settings.speed=S.settings.rate<=0.6?0.8:S.settings.rate>=1?1.15:1;delete S.settings.rate;}
    S.ver=2;}
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
load();
// ---------- no-repeat queues（抽完整輪才重洗） ----------
function qState(key,ids){var q=S.q[key];
  if(!q||!q.rem){q=S.q[key]={rem:shuffle(ids),round:1,seen:0,recent:[],v9:1};}
  if(!q.v9){q.v9=1;var inR={};q.rem.forEach(function(i){inR[i]=1;}); // 詞庫擴充：新詞直接混進這一輪
    ids.forEach(function(i){if(NEWID[i]&&!inR[i])q.rem.splice(Math.floor(Math.random()*(q.rem.length+1)),0,i);});}
  var valid={};ids.forEach(function(i){valid[i]=1;});
  q.rem=q.rem.filter(function(i){return valid[i];});
  return q;}
function qPeek(key,ids,n){var q=qState(key,ids);
  if(q.rem.length<n){ // 本輪剩不夠：接上下一輪（新一輪會把最近出過的詞放到最後）
    var inRem={};q.rem.forEach(function(i){inRem[i]=1;});var rec={};(q.recent||[]).forEach(function(i){rec[i]=1;});
    var others=ids.filter(function(i){return !inRem[i];});
    var fresh=shuffle(others.filter(function(i){return !rec[i];})).concat(shuffle(others.filter(function(i){return rec[i];})));
    q.rem=q.rem.concat(fresh);save();}
  return q.rem.slice(0,n);}
function qConsume(key,ids,id){var q=qState(key,ids);var k=q.rem.indexOf(id);if(k<0)return;q.rem.splice(k,1);
  q.seen=(q.seen||0)+1;if(q.seen>=ids.length){q.seen-=ids.length;q.round=(q.round||1)+1;}
  q.recent=(q.recent||[]).concat([id]).slice(-30);save();}
function qProgress(key,ids){var q=qState(key,ids);return {seen:q.seen||0,total:ids.length,round:q.round||1};}
function record(w,ok,src){var st=S.stats[w.id]||(S.stats[w.id]={a:0,c:0,ta:0,tc:0});
  if(src==='test'){st.ta++;if(ok)st.tc++;}else{st.a++;if(ok)st.c++;}}

// ---------- audio（預先錄好的音檔；載入失敗才退回瀏覽器語音） ----------
var voice=null;
function pickVoice(){if(!('speechSynthesis' in window))return;var vs=speechSynthesis.getVoices();
  var norm=function(l){return (l||'').replace('_','-').toLowerCase();};
  voice=vs.filter(function(v){return norm(v.lang)==='zh-tw';})[0]||vs.filter(function(v){return /zh-hant|cmn-hant-tw/.test(norm(v.lang));})[0]||vs.filter(function(v){return norm(v.lang).indexOf('zh')===0||norm(v.lang).indexOf('cmn')===0;})[0]||null;}
if('speechSynthesis' in window){pickVoice();speechSynthesis.onvoiceschanged=pickVoice;}
function speakTTS(text){
  if(!text||!('speechSynthesis' in window))return;
  try{speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(text);u.lang='zh-TW';if(voice)u.voice=voice;u.rate=0.8*(S.settings.speed||1);u.pitch=1.05;speechSynthesis.speak(u);}catch(e){}
}
var AUD=new Audio();AUD.preload='auto';var audioStats={ok:0,fail:0,last:''};var playSeq=0;
function audioSrc(id){return (window.ZY_AUDIO&&window.ZY_AUDIO[id])||('audio/'+id+'.mp3'+(/^(n|h|t|z|q|m|r\d\d|rx|rq|rp)_/.test(id)?'?v=5':''));}
function playAudio(id,fallbackText,onend){
  var my=++playSeq;var done=false;
  function fallback(){if(done||my!==playSeq)return;done=true;audioStats.fail++;audioStats.last='fallback:'+id;speakTTS(fallbackText);if(onend)setTimeout(onend,1200);}
  try{if('speechSynthesis' in window)speechSynthesis.cancel();}catch(e){}
  try{AUD.pause();}catch(e){}
  AUD.onerror=fallback;
  AUD.onended=function(){if(my===playSeq&&onend)onend();};
  AUD.oncanplaythrough=function(){if(my===playSeq){audioStats.ok++;audioStats.last='ok:'+id;}AUD.oncanplaythrough=null;};
  AUD.src=audioSrc(id);
  try{AUD.playbackRate=S.settings.speed||1;AUD.defaultPlaybackRate=S.settings.speed||1;AUD.preservesPitch=true;AUD.webkitPreservesPitch=true;}catch(e){}
  var p;try{p=AUD.play();}catch(e){fallback();return;}
  if(p&&p.catch)p.catch(function(e){if(e&&e.name==='NotAllowedError')return; /* 需要先點一下畫面，按 🔊 就會播 */ if(e&&e.name==='AbortError')return;fallback();});
}
function sayWord(w){playAudio(w.aud,w.word);}
function sayKey(key,text,onend){playAudio(key,text,onend);}
// iOS：第一次觸碰時解鎖音訊
var SILENT='data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=';
function unlockAudio(){document.removeEventListener('pointerdown',unlockAudio,true);document.removeEventListener('touchstart',unlockAudio,true);
  if(AUD.src)return;try{AUD.src=SILENT;var p=AUD.play();if(p&&p.catch)p.catch(function(){});}catch(e){}}
document.addEventListener('pointerdown',unlockAudio,true);document.addEventListener('touchstart',unlockAudio,true);

// ---------- utils ----------
var $app=document.getElementById('app');
function h(html){$app.innerHTML=html;window.scrollTo(0,0);}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function toast(msg){var t=document.getElementById('toast');t.textContent=msg;t.classList.add('toast-show');clearTimeout(toast._t);toast._t=setTimeout(function(){t.classList.remove('toast-show');},1800);}
function zyStr(arr){return arr.join('\u3000');}
function wordHL(w){return w.word.split('').map(function(c,i){return i===w.t?'<span class="hl">'+esc(c)+'</span>':esc(c);}).join('');}
function swapInit(syl,to){var neutral=syl.charAt(0)==='˙';var body=neutral?syl.slice(1):syl;return (neutral?'˙':'')+to+body.slice(1);}
var PRAISE=['太棒了！🚀','答對了！⭐','好厲害！🌟','完美降落！🛸','燃料+1 ⛽','你是注音太空人！👨‍🚀'];
var CHEER=['沒關係，再聽一次 💪','差一點點！加油 🌈','太空人也會練習的 🚀'];
function rnd(a){return a[Math.floor(Math.random()*a.length)];}
function missionStars(key){return S.missions[key]||0;}
function totalStars(){var n=0,p=S.lvp||{};for(var k in p){if(k.indexOf('L:')===0)continue;n+=p[k].stars||0;}return n;}
function badgeCount(){var n=SOUNDS.filter(planetDone).length;n+=MIXES.filter(function(m){return window.ZYP.done(mixKey(m[0]+m[1]));}).length;if(window.ZYP.done('zy:boss'))n++;if(window.ZYStroke&&window.ZYStroke.allDone())n++;if(window.ZYRad)n+=window.ZYRad.badges();if(window.ZYMath)n+=window.ZYMath.badges();return n;}
function hud(){if(window.ZYReward)try{window.ZYReward.hudBank();}catch(e){}document.getElementById('hud-fuel').textContent=S.fuel;document.getElementById('hud-stars').textContent=totalStars();document.getElementById('hud-badges').textContent=badgeCount();}
function starStr(n,max){max=max||3;var s='';for(var i=0;i<max;i++)s+=i<n?'⭐':'☆';return s;}

// ---------- home（注音符號練習：由下往上的闖關地圖） ----------
var NLV=5;
function lvKey(s,i){return 'zy:'+s+':'+i;}
function mixKey(k){return 'zy:mix:'+k;}
function planetLvDone(s){var n=0;for(var i=0;i<NLV;i++)if(window.ZYP.done(lvKey(s,i)))n++;return n;}
function planetDone(s){return planetLvDone(s)===NLV;}
function planetStars(s){var n=0;for(var i=0;i<NLV;i++)n+=window.ZYP.peek(lvKey(s,i)).stars;return n;}
function runPlain(key){var x=window.ZYP.peek(key);return (x.stars?'🌟×'+x.stars+'・':'')+'闖關 '+x.runs+'/3';}
// 容易搞混的音放在一起：每一組 = 兩顆練習星＋一顆雙子星
var ZGROUPS=[
 {t:'👅 翹舌音 vs 平舌音',d:'舌頭翹起來（ㄓㄔㄕ）還是平平的（ㄗㄘㄙ）？',pairs:[['ㄓ','ㄗ'],['ㄔ','ㄘ'],['ㄕ','ㄙ']]},
 {t:'👃 前鼻音 vs 後鼻音',d:'最後聲音停在舌尖（ㄣㄢ）還是鼻子後面（ㄥㄤ）？',pairs:[['ㄣ','ㄥ'],['ㄢ','ㄤ']]},
 {t:'👄 長得像、聽起來也像的韻母',d:'ㄟ和ㄝ、ㄡ和ㄛ，嘴巴動不動、怎麼收尾？',pairs:[['ㄟ','ㄝ'],['ㄡ','ㄛ']]}
];
function mixOf(a,b){return MIXES.filter(function(m){return m[0]===a&&m[1]===b;})[0];}
function zyChain(){var items=[];
  ZGROUPS.forEach(function(g){g.pairs.forEach(function(p){if(!(WORDS[p[0]]&&WORDS[p[1]]))return;
    [p[0],p[1]].forEach(function(s){var pl=PLANET[s];items.push({kind:'planet',s:s,done:planetDone(s),icon:pl.icon,title:s+' '+pl.name,sub:NLV+' 關・完成 '+planetLvDone(s)+' / '+NLV,color:pl.color});});
    var m=mixOf(p[0],p[1]);if(m){var k=m[0]+m[1];items.push({kind:'mix',k:k,m:m,done:window.ZYP.done(mixKey(k)),icon:'🪐',title:m[2],sub:m[0]+' VS '+m[1]+' 混合挑戰・'+runPlain(mixKey(k)),color:m[3]});}});});
  items.push({kind:'boss',done:window.ZYP.done('zy:boss'),icon:'👾',title:'最終測試：聽音寫注音',sub:'20 題・'+runPlain('zy:boss'),color:'linear-gradient(135deg,#2d3436,#6c5ce7)'});
  return items;}
function zyDone(){return zyChain().filter(function(it){return it.kind!=='boss';}).every(function(it){return it.done;});}
function zyCount(){var it=zyChain().filter(function(x){return x.kind!=='boss';});return [it.filter(function(x){return x.done;}).length,it.length];}
function home(){
  hud();
  var items=zyChain();
  var html='<div class="muted">🏠 太空基地 › 📖 國語星系</div><div class="ship">🔤</div><h1>注音符號練習</h1><p class="sub">由下往上，一關一關飛上去！</p>';
  html+=window.ZYP.ruleHTML();
  var mp=window.ZYP.mapHTML(items);html+=mp.html;
  html+='<p class="muted center" style="margin-top:16px">🔊 每一題都可以按喇叭聽發音・每個音 '+WORDS[SOUNDS[0]].length+' 個詞（含 📜 三字經、論語、唐詩短句），練完一整輪才會重複・進度只存在這台裝置</p>';
  html+='<button class="btn ghost" id="zy-back">⬅ 回國語星系</button>';
  h(html);
  window.ZYP.bindMap($app,items,mp.sts,function(it){if(it.kind==='planet')planet(it.s);else if(it.kind==='mix')mixPage(it.k);else bossIntro();});
  document.getElementById('zy-back').onclick=chinese;
}
// ---------- 太空基地（最上層：國語、數學） ----------
function base(){
  hud();try{if(window.ZYMath)window.ZYMath._stop&&window.ZYMath._stop();}catch(e){}
  var html='<div class="ship">🚀</div><h1>律恩的太空學習基地</h1><p class="sub">艦長，今天要飛去哪一個星系？</p><div class="planet-grid">';
  html+='<button class="planet galaxy-btn wide" id="go-zh" style="background:linear-gradient(135deg,#ff9f43,#ee5253)"><div class="orb" style="font-size:40px">國</div><div class="pname" style="font-size:26px">📖 國語星系</div><div class="pstars">筆順 → 注音 → 部首</div></button>';
  html+='<button class="planet galaxy-btn wide" id="go-math" style="background:linear-gradient(135deg,#48dbfb,#6c5ce7)"><div class="orb" style="font-size:40px">＋</div><div class="pname" style="font-size:26px">🔢 數學星系</div><div class="pstars">加法・減法・進位退位・心算</div></button></div>';
  if(window.ZYReward)html+='<div class="planet-grid" style="margin-top:12px">'+window.ZYReward.homeCard()+'</div>';
  html+='<p class="muted center" style="margin-top:16px">內容依教育部十二年國教課綱（國小一、二年級）設計・兩個星系可以自由選・進度只存在這台裝置（'+esc(window.ZYP.device().name||'')+'）・右上角 👨‍👦 是家長專區</p>';
  h(html);
  document.getElementById('go-zh').onclick=chinese;
  document.getElementById('go-math').onclick=function(){window.ZYMath.open();};
  if(window.ZYReward)window.ZYReward.bindHome();
}
function strokeCount(){var Z=window.ZYStroke;if(!Z)return [0,0];return [Z.order.filter(function(c){return Z.symDone(c);}).length,Z.order.length];}
function chinese(){
  hud();
  var sc=strokeCount(),zc=zyCount(),rc=window.ZYRad?window.ZYRad.count():[0,0];
  var items=[
    {key:'stroke',done:sc[0]>=sc[1],icon:'✍️',title:'筆順訓練基地',sub:'第 1 站・ㄅ→ㄦ 37 個注音・完成 '+sc[0]+' / '+sc[1],color:'linear-gradient(135deg,#a29bfe,#6c5ce7)'},
    {key:'zy',done:zc[0]>=zc[1],icon:'🔤',title:'注音符號練習',sub:'第 2 站・翹舌平舌・前鼻後鼻・相似韻母・完成 '+zc[0]+' / '+zc[1],color:'linear-gradient(135deg,#ff9f43,#ee5253)'},
    {key:'rad',done:rc[1]>0&&rc[0]>=rc[1],icon:'📚',title:'部首星系',sub:'第 3 站・'+(window.ZY_RAD?window.ZY_RAD.rads.length:0)+' 個常用部首・完成 '+rc[0]+' / '+rc[1],color:'linear-gradient(135deg,#1dd1a1,#10ac84)'}];
  var html='<div class="muted">🏠 太空基地</div><div class="ship">📖</div><h1>國語星系</h1><p class="sub">先練筆順，再練注音，最後學部首！由下往上解鎖</p>';
  var mp=window.ZYP.mapHTML(items,{cls:'zones'});html+=mp.html;
  html+='<button class="btn ghost" id="back">⬅ 回太空基地</button>';
  h(html);
  window.ZYP.bindMap($app,items,mp.sts,function(it){if(it.key==='stroke')window.ZYStroke.open();else if(it.key==='zy')home();else window.ZYRad.open();});
  document.getElementById('back').onclick=base;
}

// ---------- planet：5 關，每關闖 3 次 ----------
function planet(s){
  var p=PLANET[s];var pr=qProgress('p:'+s,idsOf(s));
  var html='<div class="muted">📖 國語星系 › 🔤 注音符號練習</div><div class="card" style="background:'+p.color+'"><div class="center" style="font-size:60px;font-weight:900">'+s+'</div><h2 class="center">'+p.icon+' '+p.name+'</h2><p class="center" style="margin:4px 0">'+p.tip+'</p>'+
   '<button class="speak" id="sy-say">🔊 '+s+' 的聲音</button><button class="speak" id="ex-say">🔊 '+EXAMPLE[s]+'</button></div>';
  html+='<div class="card"><b>📦 題庫：已練 '+pr.seen+' / '+pr.total+' 詞</b>'+(pr.round>1?'（第 '+pr.round+' 輪）':'')+'<div class="progress" style="margin-top:6px"><i style="width:'+(pr.seen/pr.total*100)+'%"></i></div><div class="muted">'+NLV+' 關 × 闖關 3 次 × 10 題 ＝ '+(NLV*30)+' 個詞，同一關 3 次的詞都不一樣。</div></div>';
  var items=[];for(var i=0;i<NLV;i++){var k=lvKey(s,i);items.push({i:i,done:window.ZYP.done(k),icon:'',title:'第 '+(i+1)+' 關',sub:'10 題・'+runPlain(k),color:p.color});}
  var mp=window.ZYP.mapHTML(items);html+=mp.html;
  html+='<button class="btn ghost" id="back">⬅ 回注音練習</button>';
  h(html);
  document.getElementById('sy-say').onclick=function(){sayKey(soundKey(s),s);};
  document.getElementById('ex-say').onclick=function(){if(ISFIN[s]&&BYID[EXAMPLE[s]])sayWord(BYID[EXAMPLE[s]]);else sayKey('ex_'+SKEY[s],EXAMPLE[s]);};
  window.ZYP.bindMap($app,items,mp.sts,function(it){startMission(s,it.i);});
  document.getElementById('back').onclick=home;
}
function mixPage(k){var m=MIXES.filter(function(x){return x[0]+x[1]===k;})[0];var key=mixKey(k);
  var html='<div class="muted">📖 國語星系 › 🔤 注音符號練習</div><div class="card center" style="background:'+m[3]+'"><div style="font-size:48px;font-weight:900">'+m[0]+' VS '+m[1]+'</div><h2>🪐 '+m[2]+'</h2><p style="margin:0">兩個音混在一起考，聽清楚是哪一個！</p></div>'+
    '<div class="card center"><div style="font-size:22px">'+window.ZYP.runStr(key,true)+'</div>'+window.ZYP.badgeStr(key)+'<div class="muted">每次 10 題，過關 3 次（題目都不一樣）拿 1 顆星</div></div>'+
    window.ZYP.ruleHTML()+'<button class="btn" id="go">出發 🚀</button><button class="btn ghost" id="back">⬅ 回注音練習</button>';
  h(html);document.getElementById('go').onclick=function(){startMix(m[0],m[1]);};document.getElementById('back').onclick=home;}

// ---------- question building ----------
function makeQ(w,type){
  var target=w.zy[w.t];var fin=!!ISFIN[w.sound];var init=unitOf(target,fin)||w.sound;
  var q={w:w,type:type};
  if(type==='listen'){
    q.prompt=fin?'聽一聽，<b>黃色的字</b>的韻母是哪一個？':'聽一聽，<b>黃色的字</b>是哪個聲音？';q.answer=init;q.options=shuffle([init,PAIR[init]]);q.layout='two';q.isInit=true;
  }else if(type==='fill'){
    q.prompt='注音少了一個，選出來補上！';q.answer=init;q.options=shuffle(GROUP3[init]);q.layout='three';q.isInit=true;
  }else{ // pick
    q.prompt='哪一個是正確的注音？';q.answer=zyStr(w.zy);
    var opts=[q.answer];
    var d1=w.zy.slice();d1[w.t]=swapUnit(target,fin,PAIR[init]);opts.push(zyStr(d1));
    var d2=null;
    for(var i=0;i<w.zy.length;i++){if(i===w.t)continue;var b=unitOf(w.zy[i],fin);if(PAIR[b]&&(!!ISFIN[b])===fin){var x=w.zy.slice();x[i]=swapUnit(w.zy[i],fin,PAIR[b]);d2=zyStr(x);break;}}
    if(!d2){var tones=['','ˊ','ˇ','ˋ'];var y=w.zy.slice();var syl=y[w.t];if(syl.charAt(0)==='˙'){y[w.t]=syl.slice(1);}else{var base=syl.replace(/[ˊˇˋ]$/,'');var cur=syl.slice(base.length);var alt=tones.filter(function(t){return t!==cur;});y[w.t]=base+alt[Math.floor(Math.random()*alt.length)];}d2=zyStr(y);}
    var altStrs=w.alts.map(zyStr);
    if(opts.indexOf(d2)<0&&altStrs.indexOf(d2)<0)opts.push(d2);
    q.options=shuffle(opts);q.layout='single';
  }
  return q;
}
function makeMP(w,o){return {w:w,other:o,type:'mp',prompt:'🎧 仔細聽，是哪一個詞？<br><span class="muted">兩個詞只差在韻母喔</span>',answer:zyStr(w.zy),options:shuffle([zyStr(w.zy),zyStr(o.zy)]),layout:'single'};}
var TYPES=['listen','pick','fill'];
var session=null;
// 從不重複佇列裡挑：避開這一關本輪（3 次闖關）已經出過的詞
function pickFresh(qkey,ids,n,avoid,filter){var all=qPeek(qkey,ids,ids.length);var out=[];
  for(var i=0;i<all.length&&out.length<n;i++){var id=all[i];if(avoid[id])continue;if(filter&&!filter(BYID[id]))continue;out.push(id);}
  if(out.length<n){for(var j=0;j<all.length&&out.length<n;j++){if(out.indexOf(all[j])<0&&(!filter||filter(BYID[all[j]])))out.push(all[j]);}}
  return out;}
function startMission(s,i){
  var key='p:'+s,ids=idsOf(s),lk=lvKey(s,i);
  var ws=pickFresh(key,ids,QPER,window.ZYP.used(lk)).map(function(id){return BYID[id];});
  var qs=ws.map(function(w,k){var q=makeQ(w,TYPES[(k+i)%3]);q.qkey=key;return q;});
  session={kind:'mission',key:s+i,lk:lk,mi:i,sound:s,qs:qs,idx:0,firstTry:0,sigs:ws.map(function(w){return w.id;}),title:PLANET[s].icon+' '+PLANET[s].name+' 第 '+(i+1)+' 關'};
  showQ();
}
function startMix(a,b){
  var k=a+b;var qs=[];var lk=mixKey(k);var av=window.ZYP.used(lk);var sigs=[];
  [a,b].forEach(function(s){var key='m:'+k+':'+s;pickFresh(key,idsOf(s),5,av).forEach(function(id){qs.push({w:BYID[id],qkey:key});sigs.push(id);});});
  qs=shuffle(qs).map(function(x,j){var q=makeQ(x.w,j%2?'fill':'listen');q.qkey=x.qkey;if(q.type==='fill'){q.options=shuffle([a,b]);q.layout='two';}return q;});
  // 韻母雙子星：放進最多 3 題「最小對比詞」（例如 金魚／鯨魚），也不和前幾次重複
  var mps=shuffle(MINPAIRS.filter(function(p){var s0=BYID[p[0]].sound,s1=BYID[p[1]].sound;return ((s0===a&&s1===b)||(s0===b&&s1===a))&&!av['mp:'+p[0]+'/'+p[1]];})).slice(0,3);
  mps.forEach(function(p,j){var pair=shuffle([BYID[p[0]],BYID[p[1]]]);qs[qs.length-1-j*3]=makeMP(pair[0],pair[1]);sigs.push('mp:'+p[0]+'/'+p[1]);});
  session={kind:'mix',key:k,lk:lk,qs:qs,idx:0,firstTry:0,sigs:sigs,title:'🪐 '+a+' VS '+b+' 雙子星'};
  showQ();
}
function consumeQ(q){if(q.qkey&&!q.retried&&!q.consumed){q.consumed=true;qConsume(q.qkey,idsOf(q.w.sound),q.w.id);}}
function classicNote(w){if(!w.src)return '';return '<div class="classic"><span class="ctag">📜 '+esc(w.where||w.src)+'</span>'+(w.line?'<div class="cline">'+esc(w.line)+'</div>':'')+'</div>';}
function showQ(){
  var q=session.qs[session.idx];var w=q.w;var total=session.qs.length;
  var html='<div class="muted">'+session.title+'</div><div class="progress"><i style="width:'+(session.idx/total*100)+'%"></i></div><div id="qtimer"></div>';
  html+='<p class="q-prompt">'+(q.retried?'<span class="retry-tag">🔁 剛剛錯的，再試一次</span><br>':'')+q.prompt+'</p>';
  if(q.type==='mp'){html+='<div class="q-emoji">🎧</div><div class="q-word" id="mpword">'+w.word.split('').map(function(){return '❓';}).join('')+'</div>';}
  else{html+='<div class="q-emoji">'+w.emoji+'</div>';
  html+='<div class="q-word'+(w.word.length>=5?' long':'')+'">'+(q.type==='listen'?wordHL(w):esc(w.word))+'</div>'+(w.src?'<div class="center"><span class="ctag">📜 '+esc(w.src)+'</span></div>':'');}
  html+='<button class="speak" id="say">🔊 聽發音</button>';
  if(q.type==='fill'){html+='<div class="zy-line">'+w.zy.map(function(z,i){if(i!==w.t)return '<span class="syl">'+z+'</span>';if(ISFIN[w.sound]){var m=SYLRE.exec(z)||[];return '<span class="syl">'+(m[1]||'')+(m[2]||'')+(m[3]||'')+'<span class="blank">□</span>'+(m[5]||'')+'</span>';}var neutral=z.charAt(0)==='˙';var body=neutral?z.slice(1):z;return '<span class="syl">'+(neutral?'˙':'')+'<span class="blank">□</span>'+body.slice(1)+'</span>';}).join('')+'</div>';}
  html+='<div class="opts '+q.layout+'">'+q.options.map(function(o,k){return '<button class="opt'+(q.isInit?'':' small')+(w.zy.length>=5&&!q.isInit?' xs':'')+'" data-k="'+k+'">'+o+(q.isInit?'<span class="ex">'+EXSHORT[o]+'</span>':'')+'</button>';}).join('')+'</div>';
  html+='<div class="feedback" id="fb"></div><div id="next-wrap"></div>';
  h(html);
  var answered=false;
  var tm=window.ZYP.timer('choice',document.getElementById('qtimer'),function(){answer(null);});
  document.getElementById('say').onclick=function(){sayWord(w);};
  setTimeout(function(){if(!answered)playAudio(w.aud,w.word,function(){if(!answered)tm.start();});tm.soon(6000);},300);
  function answer(b){
    if(answered)return;answered=true;tm.stop();
    var o=b?q.options[+b.getAttribute('data-k')]:null;var ok=o===q.answer;var fb=document.getElementById('fb');
    if(!q.retried)record(w,ok,'practice');
    consumeQ(q);
    if(ok){b.classList.add('ok');if(!q.retried){session.firstTry++;S.fuel++;}fb.className='feedback ok';fb.innerHTML=rnd(PRAISE)+'<small>'+esc(w.word)+'：'+zyStr(w.zy)+mpNote(q)+'</small>'+classicNote(w);revealMP(q);save();hud();
      setTimeout(nextQ,w.src?2200:1100);}
    else{if(b)b.classList.add('bad');$app.querySelectorAll('.opt').forEach(function(x){if(q.options[+x.getAttribute('data-k')]===q.answer)x.classList.add('ok');});
      fb.className='feedback bad';fb.innerHTML=(b?rnd(CHEER):'⏰ 超過 '+tm.sec+' 秒，這題先算「不會」')+'<small>正確答案：<b>'+q.answer+'</b>　'+esc(w.word)+'：'+zyStr(w.zy)+mpNote(q)+'</small>'+classicNote(w);revealMP(q);
      if(!q.retried){var r=q.type==='mp'?makeMP(w,q.other):makeQ(w,q.type);if(session.kind==='mix'&&r.type!=='mp'&&r.type==='fill'){r.options=shuffle([session.key.charAt(0),session.key.charAt(1)]);r.layout='two';}r.retried=true;r.qkey=q.qkey;session.qs.push(r);}
      setTimeout(function(){sayWord(w);},300);save();
      document.getElementById('next-wrap').innerHTML='<button class="btn blue" id="again">🔊 再聽一次</button><button class="btn" id="next">下一題 ➡</button>';
      document.getElementById('again').onclick=function(){sayWord(w);};
      document.getElementById('next').onclick=nextQ;}
  }
  $app.querySelectorAll('.opt').forEach(function(b){b.onclick=function(){answer(b);};});
}
function mpNote(q){return q.type==='mp'?'<br>另一個是「'+esc(q.other.word)+'」：'+zyStr(q.other.zy):'';}
function revealMP(q){if(q.type!=='mp')return;var e=document.getElementById('mpword');if(e)e.innerHTML=q.w.emoji+' '+esc(q.w.word);}
function nextQ(){session.idx++;if(session.idx>=session.qs.length)finishSession();else showQ();}
function finishSession(){
  var base=session.qs.filter(function(q){return !q.retried;}).length;var c=session.firstTry;
  var hadBadge=badgeCount();var sess=session;
  var title=sess.kind==='mission'?(sess.sound+' '+PLANET[sess.sound].name+' 第 '+(sess.mi+1)+' 關'):(sess.key.charAt(0)+' VS '+sess.key.charAt(1)+' 雙子星');
  var html='<div class="big-result">'+(c===base?'🏆':c>=window.ZYP.passNeed(base)?'🌟':'🚀')+'</div><h1>'+(c===base?'全部答對，太神了！':c>=window.ZYP.passNeed(base)?'過關！':'完成練習，再挑戰一次會更好！')+'</h1>'+
   '<p class="sub" style="font-size:22px">第一次就答對 '+c+' / '+base+' 題</p><div id="runres"></div>';
  if(sess.kind==='mission'){var pr=qProgress('p:'+sess.sound,idsOf(sess.sound));html+='<p class="center muted">本輪已練 '+pr.seen+' / '+pr.total+' 詞，下一次會出新的詞</p>';}
  html+='<div id="res-btns"></div>';
  h(html);
  var res=window.ZYP.clear(sess.lk,{first:c,base:base,perfect:c===base,used:sess.sigs,title:title,src:'注音',into:document.getElementById('runres')});
  document.getElementById('runres').insertAdjacentHTML('afterbegin',window.ZYP.resultHTML(res,{kind:'choice'}));
  save();hud();var newBadge=badgeCount()>hadBadge;
  if(newBadge)document.getElementById('runres').insertAdjacentHTML('beforeend','<div class="card center" style="font-size:22px">🏅 獲得新徽章！</div>');
  sayKey(res.ok?'p_done_good':'p_done_try',res.ok?'任務完成，好棒':'完成練習，加油');
  var bh='';var nextLv=sess.kind==='mission'&&res.got&&sess.mi<NLV-1;
  if(nextLv)bh+='<button class="btn green" id="nextlv">下一關：第 '+(sess.mi+2)+' 關 ➡</button>';
  bh+='<button class="btn" id="again">'+(res.got?'🔁 再闖一輪（換新題）':'🚀 再闖一次（換新題）')+'</button><button class="btn blue" id="back">⬅ '+(sess.kind==='mission'?'回行星':'回注音練習')+'</button>';
  document.getElementById('res-btns').innerHTML=bh;
  if(nextLv)document.getElementById('nextlv').onclick=function(){startMission(sess.sound,sess.mi+1);};
  document.getElementById('again').onclick=function(){if(sess.kind==='mission')startMission(sess.sound,sess.mi);else startMix(sess.key.charAt(0),sess.key.charAt(1));};
  document.getElementById('back').onclick=function(){if(sess.kind==='mission')planet(sess.sound);else home();};
}

// ---------- boss test ----------
var KB_ROWS=['ㄅㄆㄇㄈㄉㄊㄋㄌ','ㄍㄎㄏㄐㄑㄒㄓㄔ','ㄕㄖㄗㄘㄙㄧㄨㄩ','ㄚㄛㄜㄝㄞㄟㄠㄡ','ㄢㄣㄤㄥㄦ'];
function normSyl(s){s=s.replace(/ˉ/g,'');var n=s.indexOf('˙')>=0;s=s.replace(/˙/g,'');return (n?'˙':'')+s;}
function splitInput(str,expected){
  var parts=str.trim().split(/\s+/).filter(Boolean);
  if(parts.length<expected){
    var more=[];parts.forEach(function(p){var cur='';for(var i=0;i<p.length;i++){var ch=p[i];if(ch==='˙'&&cur&&i>0&&!/[ˊˇˋ]$/.test(cur)&&i<p.length-1){more.push(cur);cur='';}cur+=ch;if(/[ˊˇˋ]/.test(ch)){more.push(cur);cur='';}}if(cur)more.push(cur);});
    if(more.length===expected)parts=more;
  }
  return parts.map(normSyl);
}
function gradeWord(w,input){
  var cands=[w.zy].concat(w.alts);var best=null;
  cands.forEach(function(c){var parts=splitInput(input,c.length);var marks=c.map(function(syl,i){return parts[i]===normSyl(syl);});
    var extra=parts.length>c.length;var n=marks.filter(Boolean).length-(extra?1:0);
    if(!best||n>best.n)best={n:n,marks:marks,ok:!extra&&marks.every(Boolean),parts:parts,cand:c};});
  return best;
}
var BOSSN=20;
function bossIntro(){
  var hist=S.tests.slice(-1)[0];var t=window.ZYP.secs('input');
  h('<div class="big-result">👾</div><h1>最終測試</h1><p class="sub">太空怪獸會唸 '+BOSSN+' 個詞，<br>請你用注音鍵盤把注音<b>拼出來</b>！</p>'+
   '<div class="card center">'+window.ZYP.runStr('zy:boss',true)+window.ZYP.badgeStr('zy:boss')+'<div class="muted">答對 '+window.ZYP.passNeed(BOSSN)+' 題以上算過關，過關 3 次（詞都不一樣）拿 1 顆星</div></div>'+
   '<div class="card"><p style="margin:0 0 6px">✏️ 範例：聽到「蜘蛛」→ 寫 <b>ㄓ ㄓㄨ</b></p><p class="muted" style="margin:0">・一個字拼完按「空格」再拼下一個字<br>・一聲不用加符號；輕聲「˙」放前面或後面都可以<br>・可以按 🔊 重聽（不會重新計時）<br>'+(t?'・⏱ 每題 <b>'+t+' 秒</b>（唸完才開始算），時間到就自動交卷，算「不會」<br>':'')+'・每次考的詞都不一樣，'+scopeSounds().reduce(function(n,s){return n+WORDS[s].filter(bossOK).length;},0)+' 個詞輪流考（📜 古文長句不考聽寫）</p></div>'+
   '<p class="center" style="margin:6px 0">📋 測試範圍：<b>'+SCOPE_NAME[bossScope()]+'</b><br><span class="muted">（家長可在 👨‍👦 家長專區更改）</span></p>'+
   (hist?'<p class="center muted">上次成績：'+hist.score+' / '+hist.total+'</p>':'')+
   '<button class="btn" id="start">開始挑戰 ⚔️</button><button class="btn ghost" id="back">⬅ 回注音練習</button>');
  document.getElementById('start').onclick=startBoss;document.getElementById('back').onclick=home;
}
var boss=null;
var SCOPE_NAME={all:'全部（聲母＋韻母）',init:'聲母 ㄓㄗㄔㄘㄕㄙ',fin:'韻母 ㄣㄥㄢㄤㄟㄝㄡㄛ'};
function bossScope(){var v=S.settings.bossScope||'all';if(!FINS.length)return 'init';return SCOPE_NAME[v]?v:'all';}
function scopeSounds(){var v=bossScope();return v==='init'?INITS:v==='fin'?FINS:SOUNDS;}
function bossOK(w){return !w.src;}
function pickBossWords(n){ // 每個音輪流抽，跨次測試不重複；同一輪 3 次闖關也不重複
  var SS=scopeSounds();var order=shuffle(SS);var cnt={};SS.forEach(function(s){cnt[s]=0;});
  for(var k=0;k<n;k++)cnt[order[k%SS.length]]++;
  var av=window.ZYP.used('zy:boss');
  var out=[];SS.forEach(function(s){pickFresh('t:'+s,idsOf(s),cnt[s],av,bossOK).forEach(function(id){out.push(BYID[id]);});});
  return shuffle(out);}
function startBoss(){boss={words:pickBossWords(BOSSN),idx:0,answers:[],timeouts:[]};bossQ();}
function bossQ(){
  var w=boss.words[boss.idx];var input='';var sent=false;
  var html='<div class="muted">👾 最終測試　第 '+(boss.idx+1)+' / '+boss.words.length+' 題</div><div class="progress"><i style="width:'+(boss.idx/boss.words.length*100)+'%"></i></div><div id="qtimer"></div>'+
   (S.settings.showEmoji?'<div class="q-emoji">'+w.emoji+'</div>':'')+
   (S.settings.showHanzi?'<div class="q-word">'+esc(w.word)+'</div>':'<div class="q-word" style="font-size:40px">'+w.word.split('').map(function(){return '❓';}).join('')+'</div>')+
   '<p class="center muted" style="margin:0">（共 '+w.word.length+' 個字）</p>'+
   '<button class="speak" id="say">🔊 再聽一次</button>'+
   '<div class="answer-box" id="ans"></div><div class="kbd" id="kbd"></div>'+
   '<button class="btn green" id="submit">✅ 寫好了，下一題</button>';
  h(html);
  var kb='';KB_ROWS.forEach(function(r){r.split('').forEach(function(c){kb+='<button class="key" data-c="'+c+'">'+c+'</button>';});});
  kb+='<button class="key tone" data-c="ˊ">ˊ</button><button class="key tone" data-c="ˇ">ˇ</button><button class="key tone" data-c="ˋ">ˋ</button>';
  kb+='<button class="key tone" data-c="˙">˙</button><button class="key fn span4" data-c=" ">空格（下一個字）</button><button class="key fn" data-c="clear" style="font-size:15px">清除</button><button class="key del span2" data-c="back">⌫</button>';
  document.getElementById('kbd').innerHTML=kb;
  function render(){var a=document.getElementById('ans');var parts=input.split(' ');a.innerHTML=parts.map(function(p,i){return '<span>'+esc(p)+(i===parts.length-1?'<span class="cur"></span>':'')+'</span>';}).join('<span class="sp"></span>');}
  render();
  var tm=window.ZYP.timer('input',document.getElementById('qtimer'),function(){submit(true);});
  document.getElementById('kbd').onclick=function(e){if(sent)return;var b=e.target.closest('.key');if(!b)return;var c=b.getAttribute('data-c');
    if(c==='back')input=input.slice(0,-1);else if(c==='clear')input='';else if(c===' '){if(input&&!/ $/.test(input))input+=' ';}else input+=c;render();};
  document.getElementById('say').onclick=function(){sayWord(w);};
  setTimeout(function(){if(!sent)playAudio(w.aud,w.word,function(){if(!sent)tm.start();});tm.soon(6000);},350);
  function submit(timeout){if(sent)return;
    if(!timeout&&!input.trim()){toast('先用鍵盤拼注音喔 ✏️');return;}
    sent=true;tm.stop();
    boss.answers.push(input.trim());boss.timeouts.push(!!timeout);qConsume('t:'+w.sound,idsOf(w.sound),w.id);
    var go=function(){boss.idx++;if(boss.idx>=boss.words.length)bossResult();else bossQ();};
    if(timeout){toast('⏰ 時間到！這題算「不會」');setTimeout(go,900);}else go();}
  document.getElementById('submit').onclick=function(){submit(false);};
}
function bossResult(){
  var results=boss.words.map(function(w,i){var g=gradeWord(w,boss.answers[i]||'');if(boss.timeouts[i])g.ok=false;record(w,g.ok,'test');return {w:w,input:boss.answers[i]||'',g:g,to:boss.timeouts[i]};});
  var score=results.filter(function(r){return r.g.ok;}).length;var total=results.length;
  var wrong=results.filter(function(r){return !r.g.ok;});
  S.tests.push({date:new Date().toISOString(),score:score,total:total,words:results.map(function(r){return r.w.id;}),wrong:wrong.map(function(r){return {id:r.w.id,word:r.w.word,zy:zyStr(r.w.zy),input:(r.to?'⏰超時 ':'')+r.input};})});
  if(S.tests.length>50)S.tests=S.tests.slice(-50);
  S.fuel+=score;save();hud();
  var pct=score/total;
  var html='<div class="big-result">'+(pct===1?'🏆':pct>=0.8?'🥇':pct>=0.6?'🌟':'🚀')+'</div><h1>'+score+' / '+total+'</h1><p class="sub">'+(pct===1?'全對！你打敗了太空怪獸！':pct>=0.8?'超厲害！':pct>=0.6?'很不錯！再練一下就更強了':'每練一次都會更進步，加油！')+'</p><div id="runres"></div>';
  if(wrong.length){html+='<div class="card"><h2>🔧 要再練習的詞</h2><ul class="list">'+wrong.map(function(r){
    var mine=r.g.parts.map(function(p,i){var good=r.g.marks[i];return '<span class="'+(good?'ok-t':'bad-t')+'">'+esc(p)+'</span>';}).join(' ');
    return '<li><div><b style="font-size:22px">'+esc(r.w.word)+'</b>　正確：<b class="ok-t">'+zyStr(r.w.zy)+'</b><div class="muted">你寫：'+(r.to?'⏰ 超過時間 ':'')+(mine||'（沒寫）')+'</div></div><button class="mini" data-say="'+esc(r.w.id)+'">🔊</button></li>';}).join('')+'</ul></div>';}
  html+='<div class="card"><h2>✅ 答對的詞</h2><p style="font-size:18px;line-height:1.8">'+results.filter(function(r){return r.g.ok;}).map(function(r){return esc(r.w.word)+' <span class="muted">'+zyStr(r.w.zy)+'</span>';}).join('<br>')+'</p></div>';
  html+='<button class="btn" id="again">🔁 再挑戰一次（換新詞）</button><button class="btn ghost" id="back">⬅ 回注音練習</button>';
  h(html);sayKey(pct>=0.8?'p_boss_great':'p_boss_ok',pct>=0.8?'太厲害了':'加油，你很棒');
  var res=window.ZYP.clear('zy:boss',{first:score,base:total,perfect:score===total,used:boss.words.map(function(w){return w.id;}),title:'最終測試',src:'注音',into:document.getElementById('runres')});
  document.getElementById('runres').insertAdjacentHTML('afterbegin',window.ZYP.resultHTML(res,{kind:'input'}));
  $app.querySelectorAll('[data-say]').forEach(function(b){b.onclick=function(){sayWord(BYID[b.getAttribute('data-say')]);};});
  document.getElementById('again').onclick=startBoss;document.getElementById('back').onclick=home;
}
// ---------- parents ----------
function parents(){
  var html='<h1>👨‍👦 家長專區</h1>';
  if(window.ZYReward)html+=window.ZYReward.parentsCard();
  html+=window.ZYP.deviceCard();
  html+='<div class="card"><h2>⚙️ 設定</h2>'+
   '<label class="toggle">最終測試顯示國字（預設隱藏，只聽聲音）<input type="checkbox" id="set-hanzi"'+(S.settings.showHanzi?' checked':'')+'></label>'+
   '<label class="toggle">最終測試顯示圖案提示<input type="checkbox" id="set-emoji"'+(S.settings.showEmoji?' checked':'')+'></label>'+
   (FINS.length?'<label class="toggle">最終測試範圍　<select id="set-scope" style="font-size:17px"><option value="all">全部（聲母＋韻母）</option><option value="init">只考聲母 ㄓㄗㄔㄘㄕㄙ</option><option value="fin">只考韻母 ㄣㄥㄢㄤㄟㄝㄡㄛ</option></select></label>':'')+
   '<label class="toggle">語速　<select id="set-rate" style="font-size:18px"><option value="0.8">慢</option><option value="1">適中</option><option value="1.15">快</option></select></label>'+
   '<button class="btn blue" id="test-voice" style="font-size:18px">🔊 測試語音（應唸「蜘蛛、自己、吃飯、炸雞、老師、松鼠」）</button>'+
   (FINS.length?'<button class="btn blue" id="test-voice-f" style="font-size:18px">🔊 測試韻母語音（應唸「金魚、鯨魚、開飯、開放、擔心、當心」）</button>':'')+
   '<p class="muted" id="voice-info">發音使用預先錄好的音檔（台灣國語女聲），讀音依教育部辭典校對，不受手機語音設定影響。韻母星的「符號聲音」用教育部《國語注音符號手冊》錄音。</p></div>';
  html+='<div class="card"><h2>📦 題庫進度（不重複出題）</h2>';
  SOUNDS.forEach(function(s){var a=qProgress('p:'+s,idsOf(s)),t=qProgress('t:'+s,idsOf(s));
    html+=(FINS.length&&s===INITS[0]?'<div class="grp">聲母星系</div>':'')+(s===FINS[0]?'<div class="grp">韻母星系</div>':'')+'<div class="bar"><span class="lbl">'+s+'</span><span class="track"><i style="width:'+(a.seen/a.total*100)+'%;background:#74b9ff"></i></span><span class="num">練習 '+a.seen+'/'+a.total+(a.round>1?' 第'+a.round+'輪':'')+'<br>測試 '+t.seen+'/'+t.total+'</span></div>';});
  html+='</div>';
  html+='<div class="card"><h2>📊 各音正確率</h2><p class="muted" style="margin:0">練習＝闖關選擇題（第一次作答）；測試＝聽寫</p>';
  SOUNDS.forEach(function(s){var a=0,c=0,ta=0,tc=0;WORDS[s].forEach(function(w){var st=S.stats[w.id];if(st){a+=st.a;c+=st.c;ta+=st.ta;tc+=st.tc;}});
    var pct=a?Math.round(c/a*100):0;var tp=ta?Math.round(tc/ta*100):null;
    html+=(FINS.length&&s===INITS[0]?'<div class="grp">聲母星系</div>':'')+(s===FINS[0]?'<div class="grp">韻母星系</div>':'')+'<div class="bar"><span class="lbl">'+s+'</span><span class="track"><i style="width:'+pct+'%;background:'+(pct>=80?'#64e39b':pct>=60?'#ffd166':'#ff6b81')+'"></i></span><span class="num">練習 '+(a?pct+'%':'—')+'<br>測試 '+(tp===null?'—':tp+'%')+'</span></div>';});
  html+='</div>';
  if(window.ZYStroke)html+=window.ZYStroke.parentsCard();
  var missed=ALL.map(function(w){var st=S.stats[w.id]||{a:0,c:0,ta:0,tc:0};return {w:w,miss:(st.a-st.c)+(st.ta-st.tc),tries:st.a+st.ta};}).filter(function(x){return x.miss>0;}).sort(function(a,b){return b.miss-a.miss;}).slice(0,12);
  html+='<div class="card"><h2>❗ 最常錯的詞</h2>'+(missed.length?'<ul class="list">'+missed.map(function(x){return '<li><div><b>'+esc(x.w.word)+'</b>　'+zyStr(x.w.zy)+' <span class="muted">（'+x.w.sound+'）</span></div><span>錯 '+x.miss+' / '+x.tries+' 次 <button class="mini" data-say="'+esc(x.w.id)+'">🔊</button></span></li>';}).join('')+'</ul>':'<p class="muted">還沒有錯題紀錄 🎉</p>')+'</div>';
  var tests=S.tests.slice().reverse();
  html+='<div class="card"><h2>📝 聽寫測試紀錄</h2>'+(tests.length?'<ul class="list">'+tests.slice(0,20).map(function(t){var d=new Date(t.date);var ds=(d.getMonth()+1)+'/'+d.getDate()+' '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);
    return '<li style="display:block"><div style="display:flex;justify-content:space-between"><span>'+ds+'</span><b>'+t.score+' / '+t.total+'</b></div>'+(t.wrong.length?'<div class="muted">錯：'+t.wrong.map(function(x){return esc(x.word)+'（寫成 '+esc(x.input)+'，應為 '+x.zy+'）';}).join('；')+'</div>':'<div class="ok-t">全對！</div>')+'</li>';}).join('')+'</ul>':'<p class="muted">還沒有測試紀錄</p>')+'</div>';
  html+='<div class="card"><h2>📚 題庫</h2><p class="muted">每個音 '+WORDS[SOUNDS[0]].length+' 個詞（含 📜 三字經、論語、唐詩三百首短句 '+ALL.filter(function(w){return w.src;}).length+' 則），共 '+ALL.length+' 個詞。古文字句依維基文庫版本並與教育部辭典書證核對，讀音只收教育部辭典能確認的。注音依教育部《國語辭典簡編本》與《重編國語辭典修訂本》校對（一聲不標、輕聲「˙」標在前）；聽寫時教育部列出的其他讀音（例如輕聲的又讀）也算對。</p>'+
    SOUNDS.map(function(s){return '<details><summary style="font-size:18px;padding:6px 0">'+s+'（'+WORDS[s].length+' 詞）</summary><p style="line-height:1.9">'+WORDS[s].map(function(w){return (w.src?'📜 ':'')+esc(w.word)+' '+zyStr(w.zy)+(w.src?' <span class="muted">（'+esc(w.where)+'：'+esc(w.line)+'）</span>':'');}).join('<br>')+'</p></details>';}).join('')+'</div>';
  if(window.ZYRad)html+=window.ZYRad.parentsCard();
  if(window.ZYMath)html+=window.ZYMath.parentsCard();
  html+='<button class="btn ghost" id="reset" style="color:#ff9aa8">🗑️ 清除所有進度</button><button class="btn" id="back">⬅ 回太空基地</button>';
  h(html);
  var r=document.getElementById('set-rate');r.value=String(S.settings.speed||1);
  var sc=document.getElementById('set-scope');if(sc){sc.value=bossScope();sc.onchange=function(){S.settings.bossScope=sc.value;save();toast('最終測試範圍：'+SCOPE_NAME[sc.value]);};}
  r.onchange=function(){S.settings.speed=parseFloat(r.value);save();};
  document.getElementById('set-hanzi').onchange=function(e){S.settings.showHanzi=e.target.checked;save();};
  document.getElementById('set-emoji').onchange=function(e){S.settings.showEmoji=e.target.checked;save();};
  var tvf=document.getElementById('test-voice-f');if(tvf)tvf.onclick=function(){var seq=['金魚','鯨魚','開飯','開放','擔心','當心'].map(function(x){return BYID[x];}).filter(Boolean);var i=0;
    (function next(){if(i>=seq.length)return;var w=seq[i++];playAudio(w.aud,w.word,function(){setTimeout(next,350);});})();};
  document.getElementById('test-voice').onclick=function(){var seq=['蜘蛛','自己','吃飯','炸雞','老師','松鼠'].map(function(x){return BYID[x];}).filter(Boolean);var i=0;
    (function next(){if(i>=seq.length)return;var w=seq[i++];playAudio(w.aud,w.word,function(){setTimeout(next,250);});})();};
  $app.querySelectorAll('[data-say]').forEach(function(b){b.onclick=function(){sayWord(BYID[b.getAttribute('data-say')]);};});
  if(window.ZYStroke)window.ZYStroke.bindParents($app);
  if(window.ZYRad)window.ZYRad.bindParents();
  if(window.ZYMath)window.ZYMath.bindParents();
  if(window.ZYReward)window.ZYReward.bindParents();
  window.ZYP.bindDevice(parents);
  document.getElementById('reset').onclick=function(){if(confirm('確定要清除所有星星、徽章和紀錄嗎？')){localStorage.removeItem(KEY);load();hud();parents();}};
  document.getElementById('back').onclick=base;
}
document.getElementById('btn-home').onclick=base;
document.getElementById('btn-parent').onclick=parents;
if(document.getElementById('hud-bank-btn'))document.getElementById('hud-bank-btn').onclick=function(){if(window.ZYReward)window.ZYReward.bank();};
// expose for tests
window.ZY={planet:planet,startMission:startMission,startMix:startMix,mixPage:mixPage,bossIntro:bossIntro,startBoss:startBoss,zyChain:zyChain,home:home,base:base,chinese:chinese,parents:parents,gradeWord:gradeWord,FINS:FINS,MINPAIRS:MINPAIRS,unitOf:unitOf,swapUnit:swapUnit,bossScope:bossScope,pickBossWords:pickBossWords,splitInput:splitInput,ALL:ALL,WORDS:WORDS,BYID:BYID,makeQ:makeQ,state:function(){return S;},qPeek:qPeek,qProgress:qProgress,audioStats:audioStats,
  get session(){return session;},get boss(){return boss;}};
if(window.ZYStroke)window.ZYStroke.init({S:function(){return S;},save:save,h:h,home:chinese,hud:hud,playAudio:playAudio,toast:toast,esc:esc,starStr:starStr});
var API2={S:function(){return S;},save:save,h:h,hud:hud,playAudio:playAudio,toast:toast,esc:esc,starStr:starStr};
window.ZYP.init(API2);
if(window.ZYRad)window.ZYRad.init(Object.assign({back:chinese},API2));
if(window.ZYMath)window.ZYMath.init(Object.assign({back:base},API2));
if(window.ZYReward)window.ZYReward.init(Object.assign({base:base},API2));
base();
})();
