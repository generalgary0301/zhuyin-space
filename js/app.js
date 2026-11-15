(function(){
'use strict';
// ---------- data ----------
var SOUNDS=['ㄓ','ㄗ','ㄔ','ㄘ','ㄕ','ㄙ'];
var PAIR={'ㄓ':'ㄗ','ㄗ':'ㄓ','ㄔ':'ㄘ','ㄘ':'ㄔ','ㄕ':'ㄙ','ㄙ':'ㄕ'};
var GROUP3={'ㄓ':['ㄓ','ㄗ','ㄔ'],'ㄗ':['ㄗ','ㄓ','ㄘ'],'ㄔ':['ㄔ','ㄘ','ㄕ'],'ㄘ':['ㄘ','ㄔ','ㄙ'],'ㄕ':['ㄕ','ㄙ','ㄓ'],'ㄙ':['ㄙ','ㄕ','ㄗ']};
var EXAMPLE={'ㄓ':'蜘蛛的蜘','ㄗ':'自己的自','ㄔ':'吃飯的吃','ㄘ':'刺蝟的刺','ㄕ':'老師的師','ㄙ':'四個的四'};
var EXSHORT={'ㄓ':'蜘','ㄗ':'自','ㄔ':'吃','ㄘ':'刺','ㄕ':'師','ㄙ':'四'};
var PLANET={
 'ㄓ':{name:'蜘蛛星',color:'linear-gradient(135deg,#ff9f43,#ee5253)',icon:'🕷️',tip:'捲舌音：舌尖往上翹，碰到上牙齦後面'},
 'ㄗ':{name:'自己星',color:'linear-gradient(135deg,#48dbfb,#0abde3)',icon:'🙋',tip:'平舌音：舌頭平平的，舌尖頂在下門牙後面'},
 'ㄔ':{name:'吃飯星',color:'linear-gradient(135deg,#feca57,#ff9f43)',icon:'🍚',tip:'捲舌音：舌尖翹起來，再用力送一口氣'},
 'ㄘ':{name:'刺蝟星',color:'linear-gradient(135deg,#1dd1a1,#10ac84)',icon:'🦔',tip:'平舌音：舌頭平平的，送出一口氣'},
 'ㄕ':{name:'獅子星',color:'linear-gradient(135deg,#ff6b6b,#c44569)',icon:'🦁',tip:'捲舌音：舌尖翹起來，讓氣從縫裡慢慢出來'},
 'ㄙ':{name:'松鼠星',color:'linear-gradient(135deg,#a29bfe,#6c5ce7)',icon:'🐿️',tip:'平舌音：舌頭平平的，像蛇一樣「ㄙ～」'}
};
var MIXES=[['ㄓ','ㄗ','ㄓㄗ雙子星','linear-gradient(135deg,#ff9f43,#0abde3)'],['ㄔ','ㄘ','ㄔㄘ雙子星','linear-gradient(135deg,#feca57,#10ac84)'],['ㄕ','ㄙ','ㄕㄙ雙子星','linear-gradient(135deg,#ff6b6b,#6c5ce7)']];
var WORDS={},ALL=[];
SOUNDS.forEach(function(s){
  WORDS[s]=window.ZY_RAW[s].trim().split('\n').map(function(line,i){
    var p=line.trim().split('|');
    var w={id:s+i,sound:s,word:p[0],zy:p[1].split(' '),emoji:p[2],t:parseInt(p[3],10),alts:p[4]?p[4].split(';').map(function(a){return a.split(' ');}):[]};
    ALL.push(w);return w;
  });
});
var BYID={};ALL.forEach(function(w){BYID[w.id]=w;});

// ---------- storage ----------
var KEY='zhuyinSpace.v1';
var DEF={fuel:0,missions:{},mix:{},stats:{},tests:[],settings:{showHanzi:false,showEmoji:false,rate:0.8}};
var S;
function load(){try{S=JSON.parse(localStorage.getItem(KEY))||{};}catch(e){S={};}
  for(var k in DEF){if(S[k]===undefined)S[k]=JSON.parse(JSON.stringify(DEF[k]));}
  for(var k2 in DEF.settings){if(S.settings[k2]===undefined)S.settings[k2]=DEF.settings[k2];}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
load();
function record(w,ok,src){var st=S.stats[w.id]||(S.stats[w.id]={a:0,c:0,ta:0,tc:0});
  if(src==='test'){st.ta++;if(ok)st.tc++;}else{st.a++;if(ok)st.c++;}}

// ---------- speech ----------
var voice=null;
function pickVoice(){if(!('speechSynthesis' in window))return;var vs=speechSynthesis.getVoices();
  var norm=function(l){return (l||'').replace('_','-').toLowerCase();};
  voice=vs.filter(function(v){return norm(v.lang)==='zh-tw';})[0]||vs.filter(function(v){return /zh-hant|cmn-hant-tw/.test(norm(v.lang));})[0]||vs.filter(function(v){return norm(v.lang).indexOf('zh')===0||norm(v.lang).indexOf('cmn')===0;})[0]||null;}
if('speechSynthesis' in window){pickVoice();speechSynthesis.onvoiceschanged=pickVoice;}
function speak(text){
  if(!('speechSynthesis' in window)){toast('這台裝置不支援語音 🙏');return;}
  try{speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(text);u.lang='zh-TW';if(voice)u.voice=voice;u.rate=S.settings.rate||0.8;u.pitch=1.05;speechSynthesis.speak(u);}catch(e){}
}

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
function totalStars(){var n=0;for(var k in S.missions)n+=S.missions[k];for(var m in S.mix)n+=S.mix[m];return n;}
function planetDone(s){return [0,1,2].every(function(i){return missionStars(s+i)>0;});}
function badgeCount(){var n=SOUNDS.filter(planetDone).length;n+=MIXES.filter(function(m){return (S.mix[m[0]+m[1]]||0)>0;}).length;if(S.tests.some(function(t){return t.score/t.total>=0.8;}))n++;return n;}
function hud(){document.getElementById('hud-fuel').textContent=S.fuel;document.getElementById('hud-stars').textContent=totalStars();document.getElementById('hud-badges').textContent=badgeCount();}
function starStr(n,max){max=max||3;var s='';for(var i=0;i<max;i++)s+=i<n?'⭐':'☆';return s;}

// ---------- home ----------
function home(){
  hud();
  var html='<div class="ship">🚀</div><h1>注音太空探險隊</h1><p class="sub">律恩艦長，選一顆行星出發吧！</p><div class="planet-grid">';
  SOUNDS.forEach(function(s){var p=PLANET[s];var st=missionStars(s+0)+missionStars(s+1)+missionStars(s+2);
    html+='<button class="planet" data-planet="'+s+'" style="background:'+p.color+'">'+(planetDone(s)?'<span class="badge">🏅</span>':'')+'<div class="orb">'+s+'</div><div class="pname">'+p.icon+' '+p.name+'</div><div class="pstars">'+starStr(st,9)+'</div></button>';});
  MIXES.forEach(function(m){var k=m[0]+m[1];
    html+='<button class="planet mix wide" data-mix="'+k+'" style="background:'+m[3]+';min-height:96px">'+((S.mix[k]||0)>0?'<span class="badge">🏅</span>':'')+'<div class="orb">'+m[0]+' VS '+m[1]+'</div><div class="pname">🪐 '+m[2]+'（混合挑戰）</div><div class="pstars">'+starStr(S.mix[k]||0)+'</div></button>';});
  html+='<button class="planet boss wide" id="go-boss">👾 最終測試：聽音寫注音<div class="pstars" style="font-size:15px">聽發音，自己把注音拼出來！</div></button></div>';
  html+='<p class="muted center" style="margin-top:16px">🔊 每一題都可以按喇叭聽發音・進度會自動存在這支手機</p>';
  h(html);
  $app.querySelectorAll('[data-planet]').forEach(function(b){b.onclick=function(){planet(b.getAttribute('data-planet'));};});
  $app.querySelectorAll('[data-mix]').forEach(function(b){b.onclick=function(){var k=b.getAttribute('data-mix');startMix(k.charAt(0),k.charAt(1));};});
  document.getElementById('go-boss').onclick=bossIntro;
}

// ---------- planet ----------
function planet(s){
  var p=PLANET[s];var ws=WORDS[s];
  var html='<div class="card" style="background:'+p.color+'"><div class="center" style="font-size:60px;font-weight:900">'+s+'</div><h2 class="center">'+p.icon+' '+p.name+'</h2><p class="center" style="margin:4px 0">'+p.tip+'</p>'+
   '<button class="speak" id="ex-say">🔊 '+EXAMPLE[s]+'</button></div>';
  [0,1,2].forEach(function(i){var sub=ws.slice(i*10,i*10+10);
    html+='<div class="card mission"><div><b>任務 '+(i+1)+'</b>　'+starStr(missionStars(s+i))+'<div class="muted">'+sub.slice(0,4).map(function(w){return w.word;}).join('、')+'… 共 10 題</div></div><button class="btn" data-m="'+i+'">出發 🚀</button></div>';});
  html+='<button class="btn ghost" id="back">⬅ 回星圖</button>';
  h(html);
  document.getElementById('ex-say').onclick=function(){speak(EXAMPLE[s]);};
  $app.querySelectorAll('[data-m]').forEach(function(b){b.onclick=function(){var i=+b.getAttribute('data-m');startMission(s,i);};});
  document.getElementById('back').onclick=home;
}

// ---------- question building ----------
function makeQ(w,type,mixPair){
  var target=w.zy[w.t];var tbody=target.replace('˙','');var init=tbody.charAt(0);
  var q={w:w,type:type};
  if(type==='listen'){
    q.prompt='聽一聽，<b>黃色的字</b>是哪個聲音？';q.answer=init;q.options=shuffle([init,PAIR[init]]);q.layout='two';q.isInit=true;
  }else if(type==='fill'){
    q.prompt='注音少了一個，選出來補上！';q.answer=init;q.options=shuffle(GROUP3[init]);q.layout='three';q.isInit=true;
  }else{ // pick
    q.prompt='哪一個是正確的注音？';q.answer=zyStr(w.zy);
    var opts=[q.answer];
    var d1=w.zy.slice();d1[w.t]=swapInit(target,PAIR[init]);opts.push(zyStr(d1));
    // second distractor: change another sibilant, else change the tone
    var d2=null;
    for(var i=0;i<w.zy.length;i++){if(i===w.t)continue;var b=w.zy[i].replace('˙','').charAt(0);if(PAIR[b]){var x=w.zy.slice();x[i]=swapInit(w.zy[i],PAIR[b]);d2=zyStr(x);break;}}
    if(!d2){var tones=['','ˊ','ˇ','ˋ'];var y=w.zy.slice();var syl=y[w.t];if(syl.charAt(0)==='˙'){y[w.t]=syl.slice(1);}else{var base=syl.replace(/[ˊˇˋ]$/,'');var cur=syl.slice(base.length);var alt=tones.filter(function(t){return t!==cur;});y[w.t]=base+alt[Math.floor(Math.random()*alt.length)];}d2=zyStr(y);}
    if(opts.indexOf(d2)<0)opts.push(d2);
    q.options=shuffle(opts);q.layout='single';
  }
  return q;
}
var TYPES=['listen','pick','fill'];
var session=null;
function startMission(s,i){
  var ws=shuffle(WORDS[s].slice(i*10,i*10+10));
  var qs=ws.map(function(w,k){return makeQ(w,TYPES[(k+i)%3]);});
  session={kind:'mission',key:s+i,sound:s,qs:qs,idx:0,firstTry:0,retry:[],title:PLANET[s].icon+' '+PLANET[s].name+' 任務 '+(i+1)};
  showQ();
}
function startMix(a,b){
  var ws=shuffle(WORDS[a]).slice(0,5).concat(shuffle(WORDS[b]).slice(0,5));
  var qs=shuffle(ws).map(function(w,k){return makeQ(w,k%2?'fill':'listen');});
  qs.forEach(function(q){if(q.type==='fill'){q.options=shuffle([a,b]);q.layout='two';}});
  session={kind:'mix',key:a+b,qs:qs,idx:0,firstTry:0,retry:[],title:'🪐 '+a+' VS '+b+' 雙子星'};
  showQ();
}
function showQ(){
  var q=session.qs[session.idx];var w=q.w;var total=session.qs.length;
  var html='<div class="muted">'+session.title+'</div><div class="progress"><i style="width:'+(session.idx/total*100)+'%"></i></div>';
  html+='<p class="q-prompt">'+q.prompt+'</p>';
  html+='<div class="q-emoji">'+w.emoji+'</div>';
  html+='<div class="q-word">'+(q.type==='listen'?wordHL(w):esc(w.word))+'</div>';
  html+='<button class="speak" id="say">🔊 聽發音</button>';
  if(q.type==='fill'){html+='<div class="zy-line">'+w.zy.map(function(z,i){if(i!==w.t)return '<span class="syl">'+z+'</span>';var neutral=z.charAt(0)==='˙';var body=neutral?z.slice(1):z;return '<span class="syl">'+(neutral?'˙':'')+'<span class="blank">□</span>'+body.slice(1)+'</span>';}).join('')+'</div>';}
  html+='<div class="opts '+q.layout+'">'+q.options.map(function(o,k){return '<button class="opt'+(q.isInit?'':' small')+'" data-k="'+k+'">'+o+(q.isInit?'<span class="ex">'+EXSHORT[o]+'</span>':'')+'</button>';}).join('')+'</div>';
  html+='<div class="feedback" id="fb"></div><div id="next-wrap"></div>';
  h(html);
  document.getElementById('say').onclick=function(){speak(w.word);};
  setTimeout(function(){speak(w.word);},350);
  var answered=false;
  $app.querySelectorAll('.opt').forEach(function(b){b.onclick=function(){
    if(answered)return;answered=true;
    var o=q.options[+b.getAttribute('data-k')];var ok=o===q.answer;var fb=document.getElementById('fb');
    if(!q.retried)record(w,ok,'practice');
    if(ok){b.classList.add('ok');if(!q.retried){session.firstTry++;S.fuel++;}fb.className='feedback ok';fb.innerHTML=rnd(PRAISE)+'<small>'+esc(w.word)+'：'+zyStr(w.zy)+'</small>';save();hud();
      setTimeout(nextQ,1100);}
    else{b.classList.add('bad');$app.querySelectorAll('.opt').forEach(function(x){if(q.options[+x.getAttribute('data-k')]===q.answer)x.classList.add('ok');});
      fb.className='feedback bad';fb.innerHTML=rnd(CHEER)+'<small>正確答案：<b>'+q.answer+'</b>　'+esc(w.word)+'：'+zyStr(w.zy)+'</small>';
      if(!q.retried){var r=makeQ(w,q.type);if(session.kind==='mix'&&r.type==='fill'){r.options=shuffle([session.key.charAt(0),session.key.charAt(1)]);r.layout='two';}r.retried=true;session.qs.push(r);}
      setTimeout(function(){speak(w.word);},300);save();
      document.getElementById('next-wrap').innerHTML='<button class="btn blue" id="again">🔊 再聽一次</button><button class="btn" id="next">下一題 ➡</button>';
      document.getElementById('again').onclick=function(){speak(w.word);};
      document.getElementById('next').onclick=nextQ;}
  };});
}
function nextQ(){session.idx++;if(session.idx>=session.qs.length)finishSession();else showQ();}
function finishSession(){
  var base=session.qs.filter(function(q){return !q.retried;}).length;var c=session.firstTry;
  var stars=c===base?3:c>=Math.ceil(base*0.8)?2:c>=Math.ceil(base*0.5)?1:0;
  var store=session.kind==='mission'?S.missions:S.mix;var prev=store[session.key]||0;var hadBadge=badgeCount();
  if(stars>prev)store[session.key]=stars;save();hud();
  var newBadge=badgeCount()>hadBadge;
  var html='<div class="big-result">'+(stars===3?'🏆':stars>0?'🌟':'🚀')+'</div><h1>'+(stars===3?'全部答對，太神了！':stars>0?'任務完成！':'完成練習，再挑戰一次會更好！')+'</h1>'+
   '<p class="sub" style="font-size:22px">第一次就答對 '+c+' / '+base+' 題<br>'+starStr(stars)+'</p>'+(newBadge?'<div class="card center" style="font-size:22px">🏅 獲得新徽章！</div>':'');
  html+='<button class="btn" id="again">🔁 再玩一次</button><button class="btn blue" id="back">⬅ '+(session.kind==='mission'?'回行星':'回星圖')+'</button>';
  h(html);speak(stars>0?'任務完成，好棒':'完成練習，加油');
  var sess=session;
  document.getElementById('again').onclick=function(){if(sess.kind==='mission')startMission(sess.sound,+sess.key.charAt(1));else startMix(sess.key.charAt(0),sess.key.charAt(1));};
  document.getElementById('back').onclick=function(){if(sess.kind==='mission')planet(sess.sound);else home();};
}

// ---------- boss test ----------
var KB_ROWS=['ㄅㄆㄇㄈㄉㄊㄋㄌ','ㄍㄎㄏㄐㄑㄒㄓㄔ','ㄕㄖㄗㄘㄙㄧㄨㄩ','ㄚㄛㄜㄝㄞㄟㄠㄡ','ㄢㄣㄤㄥㄦ'];
function normSyl(s){s=s.replace(/ˉ/g,'');var n=s.indexOf('˙')>=0;s=s.replace(/˙/g,'');return (n?'˙':'')+s;}
function splitInput(str,expected){
  var parts=str.trim().split(/\s+/).filter(Boolean);
  if(parts.length<expected){ // try splitting after tone marks
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
function bossIntro(){
  var hist=S.tests.slice(-1)[0];
  h('<div class="big-result">👾</div><h1>最終測試</h1><p class="sub">太空怪獸會唸 20 個詞，<br>請你用注音鍵盤把注音<b>拼出來</b>！</p>'+
   '<div class="card"><p style="margin:0 0 6px">✏️ 範例：聽到「蜘蛛」→ 寫 <b>ㄓ ㄓㄨ</b></p><p class="muted" style="margin:0">・一個字拼完按「空格」再拼下一個字<br>・一聲不用加符號；輕聲「˙」放前面或後面都可以<br>・可以一直按 🔊 重聽</p></div>'+
   (hist?'<p class="center muted">上次成績：'+hist.score+' / '+hist.total+'</p>':'')+
   '<button class="btn" id="start">開始挑戰 ⚔️</button><button class="btn ghost" id="back">⬅ 回星圖</button>');
  document.getElementById('start').onclick=startBoss;document.getElementById('back').onclick=home;
}
var boss=null;
function pickBossWords(n){var per={};SOUNDS.forEach(function(s){per[s]=shuffle(WORDS[s]);});var out=[];var k=0;
  var order=shuffle(SOUNDS);while(out.length<n){var s=order[k%6];out.push(per[s].pop());k++;}return shuffle(out);}
function startBoss(){boss={words:pickBossWords(20),idx:0,answers:[]};bossQ();}
function bossQ(){
  var w=boss.words[boss.idx];var input='';
  var html='<div class="muted">👾 最終測試　第 '+(boss.idx+1)+' / '+boss.words.length+' 題</div><div class="progress"><i style="width:'+(boss.idx/boss.words.length*100)+'%"></i></div>'+
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
  document.getElementById('kbd').onclick=function(e){var b=e.target.closest('.key');if(!b)return;var c=b.getAttribute('data-c');
    if(c==='back')input=input.slice(0,-1);else if(c==='clear')input='';else if(c===' '){if(input&&!/ $/.test(input))input+=' ';}else input+=c;render();};
  document.getElementById('say').onclick=function(){speak(w.word);};
  setTimeout(function(){speak(w.word);},400);
  document.getElementById('submit').onclick=function(){
    if(!input.trim()){toast('先用鍵盤拼注音喔 ✏️');return;}
    boss.answers.push(input.trim());boss.idx++;
    if(boss.idx>=boss.words.length)bossResult();else bossQ();};
}
function bossResult(){
  var results=boss.words.map(function(w,i){var g=gradeWord(w,boss.answers[i]);record(w,g.ok,'test');return {w:w,input:boss.answers[i],g:g};});
  var score=results.filter(function(r){return r.g.ok;}).length;var total=results.length;
  var wrong=results.filter(function(r){return !r.g.ok;});
  S.tests.push({date:new Date().toISOString(),score:score,total:total,wrong:wrong.map(function(r){return {id:r.w.id,word:r.w.word,zy:zyStr(r.w.zy),input:r.input};})});
  if(S.tests.length>50)S.tests=S.tests.slice(-50);
  S.fuel+=score;save();hud();
  var pct=score/total;
  var html='<div class="big-result">'+(pct===1?'🏆':pct>=0.8?'🥇':pct>=0.6?'🌟':'🚀')+'</div><h1>'+score+' / '+total+'</h1><p class="sub">'+(pct===1?'全對！你打敗了太空怪獸！':pct>=0.8?'超厲害！獲得勇者徽章 🏅':pct>=0.6?'很不錯！再練一下就更強了':'每練一次都會更進步，加油！')+'</p>';
  if(wrong.length){html+='<div class="card"><h2>🔧 要再練習的詞</h2><ul class="list">'+wrong.map(function(r){
    var mine=r.g.parts.map(function(p,i){var good=r.g.marks[i];return '<span class="'+(good?'ok-t':'bad-t')+'">'+esc(p)+'</span>';}).join(' ');
    return '<li><div><b style="font-size:22px">'+esc(r.w.word)+'</b>　正確：<b class="ok-t">'+zyStr(r.w.zy)+'</b><div class="muted">你寫：'+mine+'</div></div><button class="mini" data-say="'+esc(r.w.word)+'">🔊</button></li>';}).join('')+'</ul></div>';}
  html+='<div class="card"><h2>✅ 答對的詞</h2><p style="font-size:18px;line-height:1.8">'+results.filter(function(r){return r.g.ok;}).map(function(r){return esc(r.w.word)+' <span class="muted">'+zyStr(r.w.zy)+'</span>';}).join('<br>')+'</p></div>';
  html+='<button class="btn" id="again">🔁 再挑戰一次</button><button class="btn ghost" id="back">⬅ 回星圖</button>';
  h(html);speak(pct>=0.8?'太厲害了':'加油，你很棒');
  $app.querySelectorAll('[data-say]').forEach(function(b){b.onclick=function(){speak(b.getAttribute('data-say'));};});
  document.getElementById('again').onclick=startBoss;document.getElementById('back').onclick=home;
}

// ---------- parents ----------
function parents(){
  var html='<h1>👨‍👦 家長專區</h1>';
  html+='<div class="card"><h2>⚙️ 設定</h2>'+
   '<label class="toggle">最終測試顯示國字（預設隱藏，只聽聲音）<input type="checkbox" id="set-hanzi"'+(S.settings.showHanzi?' checked':'')+'></label>'+
   '<label class="toggle">最終測試顯示圖案提示<input type="checkbox" id="set-emoji"'+(S.settings.showEmoji?' checked':'')+'></label>'+
   '<label class="toggle">語速　<select id="set-rate" style="font-size:18px"><option value="0.6">慢</option><option value="0.8">適中</option><option value="1">正常</option></select></label>'+
   '<button class="btn blue" id="test-voice" style="font-size:18px">🔊 測試語音（應唸「蜘蛛、自己、吃飯、刺蝟、老師、四個」）</button>'+
   '<p class="muted" id="voice-info"></p></div>';
  // per-sound accuracy
  html+='<div class="card"><h2>📊 各音正確率</h2><p class="muted" style="margin:0">練習＝闖關選擇題（第一次作答）；測試＝聽寫</p>';
  SOUNDS.forEach(function(s){var a=0,c=0,ta=0,tc=0;WORDS[s].forEach(function(w){var st=S.stats[w.id];if(st){a+=st.a;c+=st.c;ta+=st.ta;tc+=st.tc;}});
    var pct=a?Math.round(c/a*100):0;var tp=ta?Math.round(tc/ta*100):null;
    html+='<div class="bar"><span class="lbl">'+s+'</span><span class="track"><i style="width:'+pct+'%;background:'+(pct>=80?'#64e39b':pct>=60?'#ffd166':'#ff6b81')+'"></i></span><span class="num">練習 '+(a?pct+'%':'—')+'<br>測試 '+(tp===null?'—':tp+'%')+'</span></div>';});
  html+='</div>';
  // most missed
  var missed=ALL.map(function(w){var st=S.stats[w.id]||{a:0,c:0,ta:0,tc:0};return {w:w,miss:(st.a-st.c)+(st.ta-st.tc),tries:st.a+st.ta};}).filter(function(x){return x.miss>0;}).sort(function(a,b){return b.miss-a.miss;}).slice(0,12);
  html+='<div class="card"><h2>❗ 最常錯的詞</h2>'+(missed.length?'<ul class="list">'+missed.map(function(x){return '<li><div><b>'+esc(x.w.word)+'</b>　'+zyStr(x.w.zy)+' <span class="muted">（'+x.w.sound+'）</span></div><span>錯 '+x.miss+' / '+x.tries+' 次 <button class="mini" data-say="'+esc(x.w.word)+'">🔊</button></span></li>';}).join('')+'</ul>':'<p class="muted">還沒有錯題紀錄 🎉</p>')+'</div>';
  // test history
  var tests=S.tests.slice().reverse();
  html+='<div class="card"><h2>📝 聽寫測試紀錄</h2>'+(tests.length?'<ul class="list">'+tests.slice(0,20).map(function(t){var d=new Date(t.date);var ds=(d.getMonth()+1)+'/'+d.getDate()+' '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);
    return '<li style="display:block"><div style="display:flex;justify-content:space-between"><span>'+ds+'</span><b>'+t.score+' / '+t.total+'</b></div>'+(t.wrong.length?'<div class="muted">錯：'+t.wrong.map(function(x){return esc(x.word)+'（寫成 '+esc(x.input)+'，應為 '+x.zy+'）';}).join('；')+'</div>':'<div class="ok-t">全對！</div>')+'</li>';}).join('')+'</ul>':'<p class="muted">還沒有測試紀錄</p>')+'</div>';
  html+='<div class="card"><h2>📚 題庫</h2><p class="muted">每個音 30 個詞，共 '+ALL.length+' 個詞；注音依教育部標準（一聲不標、輕聲「˙」標在前）。</p>'+
    SOUNDS.map(function(s){return '<details><summary style="font-size:18px;padding:6px 0">'+s+'（'+WORDS[s].length+' 詞）</summary><p style="line-height:1.9">'+WORDS[s].map(function(w){return esc(w.word)+' '+zyStr(w.zy);}).join('<br>')+'</p></details>';}).join('')+'</div>';
  html+='<button class="btn ghost" id="reset" style="color:#ff9aa8">🗑️ 清除所有進度</button><button class="btn" id="back">⬅ 回星圖</button>';
  h(html);
  var r=document.getElementById('set-rate');r.value=String(S.settings.rate);
  r.onchange=function(){S.settings.rate=parseFloat(r.value);save();};
  document.getElementById('set-hanzi').onchange=function(e){S.settings.showHanzi=e.target.checked;save();};
  document.getElementById('set-emoji').onchange=function(e){S.settings.showEmoji=e.target.checked;save();};
  document.getElementById('test-voice').onclick=function(){speak('蜘蛛、自己、吃飯、刺蝟、老師、四個');};
  document.getElementById('voice-info').textContent=voice?('目前語音：'+voice.name+'（'+voice.lang+'）'):'找不到中文（台灣）語音，請在手機「設定 > 語言」安裝中文語音。';
  $app.querySelectorAll('[data-say]').forEach(function(b){b.onclick=function(){speak(b.getAttribute('data-say'));};});
  document.getElementById('reset').onclick=function(){if(confirm('確定要清除所有星星、徽章和紀錄嗎？')){localStorage.removeItem(KEY);load();hud();parents();}};
  document.getElementById('back').onclick=home;
}
document.getElementById('btn-home').onclick=home;
document.getElementById('btn-parent').onclick=parents;
// expose for tests
window.ZY={gradeWord:gradeWord,splitInput:splitInput,ALL:ALL,WORDS:WORDS,makeQ:makeQ};
home();
})();
