/* 注音太空探險隊 — 📚 部首星系：一、二年級常用部首教學與測驗
 * 依十二年國教國語文課綱第一學習階段：Ab-Ⅰ-4 常用字部首的表義（分類）功能、4-Ⅰ-2 利用部件、部首或簡單造字原理輔助識字。
 * 部首、讀音：教育部《重編國語辭典修訂本》《國語辭典簡編本》逐字核對（build/RADICAL_VERIFY.md）。 */
(function(){
'use strict';
var API=null; // {S,save,h,hud,playAudio,toast,esc,starStr,back}
var D=window.ZY_RAD||{groups:[],rads:[]};
var $=function(id){return document.getElementById(id);};
var RBY={},CH={};D.rads.forEach(function(r){RBY[r.id]=r;r.ex.forEach(function(e){e.r=r;CH[e.c]=e;});});
function R(){var s=API.S();if(!s.rad)s.rad={learn:{},quiz:{},stats:{},tests:[]};var x=s.rad;['learn','quiz','stats'].forEach(function(k){x[k]=x[k]||{};});x.tests=x.tests||[];return x;}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function rnd(a){return a[Math.floor(Math.random()*a.length)];}
function esc(s){return API.esc(s);}
function chain(ids,texts,onend){var i=0;(function next(){if(i>=ids.length){if(onend)onend();return;}var k=i++;API.playAudio(ids[k],texts[k],function(){setTimeout(next,120);});})();}
function sayEx(e){API.playAudio(e.aud,e.w);}
function sayName(r){API.playAudio(r.an,r.name);}
function radsOf(g){return D.rads.filter(function(r){return r.g===g;});}
function grp(g){return D.groups.filter(function(x){return x.id===g;})[0];}
function rLabel(r){return '<span class="rform">'+esc(r.form)+'</span><span class="rname">'+esc(r.name)+'</span>';}
function zyV(z){return '<span class="zyv">'+esc(z)+'</span>';}

// ---------- 首頁（由下往上的闖關地圖） ----------
function rk(id){return 'rad:r:'+id;}function gk(g){return 'rad:g:'+g;}
function groupDone(g){return radsOf(g).every(function(r){return window.ZYP.done(rk(r.id));})&&window.ZYP.done(gk(g));}
function runPlain(key){var x=window.ZYP.peek(key);return (x.stars?'🌟×'+x.stars+'・':'')+'闖關 '+x.runs+'/3';}
function count(){var n=0,t=0;D.groups.forEach(function(g){radsOf(g.id).forEach(function(r){t++;if(window.ZYP.done(rk(r.id)))n++;});t++;if(window.ZYP.done(gk(g.id)))n++;});return [n,t];}
function hub(){API.hud();var x=R();
  var html='<div class="muted">📖 國語星系</div><div class="ship">📚</div><h1>部首星系</h1><p class="sub">認識字的「家族」，看到部首就猜得出意思！</p>';
  html+='<div class="card"><b>🤔 什麼是部首？</b><p style="margin:6px 0 0">很多字是由兩個部分組成的。像「河」有「氵」，「海」也有「氵」，它們都和<b>水</b>有關係。「氵」就是它們的<b>部首</b>，是字的家族名字。查字典的時候，也會用到部首喔！</p></div>';
  html+=window.ZYP.ruleHTML();
  var items=D.groups.map(function(g){var rs=radsOf(g.id);var nd=rs.filter(function(r){return window.ZYP.done(rk(r.id));}).length;
    return {g:g.id,done:groupDone(g.id),icon:'<b class="zs-mapch">'+rs.slice(0,2).map(function(r){return esc(r.form);}).join('')+'</b>',title:esc(g.name),sub:esc(g.desc)+'・部首 '+nd+'/'+rs.length+(window.ZYP.done(gk(g.id))?'・挑戰 ✅':''),color:g.color};});
  items.push({test:1,done:window.ZYP.done('rad:test'),icon:'🏆',title:'部首大考驗',sub:'全部部首抽 20 題・'+runPlain('rad:test'),color:'linear-gradient(135deg,#2d3436,#6c5ce7)'});
  var mp=window.ZYP.mapHTML(items);html+=mp.html;
  html+='<button class="btn ghost" id="back">⬅ 回國語星系</button>';
  API.h(html);
  window.ZYP.bindMap(document,items,mp.sts,function(it){if(it.test)startQuiz(D.rads,20,'🏆 部首大考驗','test',hub);else group(it.g);});
  $('back').onclick=API.back;}
function group(g){var G=grp(g);var x=R();var rs=radsOf(g);
  var html='<div class="muted">📚 部首星系</div><div class="card" style="background:'+G.color+'"><h2 class="center">'+esc(G.name)+'</h2><p class="center" style="margin:0">'+esc(G.desc)+'</p></div>';
  html+='<p class="muted center" style="margin:4px 0">每個部首：先看教學，再做小考（5 題），過關 3 次拿 1 顆星；全部部首都過了，就能挑戰最上面的「'+esc(G.name.replace(/^\S+\s/,''))+'挑戰」</p>';
  var items=rs.map(function(r){return {r:r.id,done:window.ZYP.done(rk(r.id)),icon:'<b class="zs-mapch">'+esc(r.form)+'</b>',title:esc(r.name)+(x.learn[r.id]?' <span class="muted">（看過教學 ✔）</span>':''),sub:'小考 5 題・'+runPlain(rk(r.id)),color:G.color};});
  items.push({gq:1,done:window.ZYP.done(gk(g)),icon:'🚀',title:esc(G.name.replace(/^\S+\s/,''))+'挑戰',sub:'10 題・'+runPlain(gk(g)),color:G.color});
  var mp=window.ZYP.mapHTML(items);html+=mp.html+'<button class="btn ghost" id="back">⬅ 回部首星系</button>';
  API.h(html);
  window.ZYP.bindMap(document,items,mp.sts,function(it){if(it.gq)startQuiz(rs,10,G.name+' 挑戰','g:'+g,function(){group(g);});else lesson(it.r);});
  $('back').onclick=hub;}

// ---------- 部首教學 ----------
function lesson(id){var r=RBY[id];var x=R();x.learn[id]=1;API.save();
  var G=grp(r.g);
  var html='<div class="muted">📚 部首星系 › '+esc(G.name)+'</div><div class="card rad-hero" style="background:'+G.color+'"><div class="rhero"><div class="rbig2">'+esc(r.form)+'</div>'+(r.form!==r.key?'<div class="rkey">原本是<br><b>'+esc(r.key)+'</b></div>':'')+'</div>'+
    '<h2 class="center" style="margin:4px 0">'+esc(r.name)+'</h2><p class="center" style="margin:0">「'+esc(r.key)+'」部　'+zyV(r.rd)+'　・常在字的<b>'+esc(r.pos)+'</b></p>'+
    '<div class="center"><button class="speak" id="say-n">🔊 '+esc(r.name)+'</button><button class="speak" id="say-r">🔊 '+esc(r.key)+'</button></div></div>';
  html+='<div class="card"><div class="pic"><span class="pemo">'+r.emoji+'</span><div><b>'+esc(r.key)+' 的故事</b><p style="margin:4px 0 0">'+esc(r.pic)+'</p></div></div><p class="mean">👉 有「'+esc(r.form)+'」的字，大多<b>'+esc(r.mean)+'</b></p></div>';
  html+='<div class="card"><h2 style="margin-top:0">🧩 部首拼拼樂</h2><p class="muted" style="margin:0 0 8px">點一下卡片，看字是怎麼拼起來的，也會唸給你聽</p><div class="excards">';
  r.ex.forEach(function(e,i){html+='<button class="excard" data-i="'+i+'"><div class="exc">'+(e.parts?'<span class="pa">'+esc(e.parts[0])+'</span><span class="plus">＋</span><span class="pb">'+esc(e.parts[1])+'</span>':'<span class="pa solo">'+esc(e.c)+'</span>')+'</div><div class="exr"><span class="exch">'+esc(e.c)+'</span>'+zyV(e.z)+'</div><div class="exw">'+esc(e.w)+'</div></button>';});
  html+='</div></div><div class="center">'+window.ZYP.runStr(rk(id),true)+window.ZYP.badgeStr(rk(id))+'</div><button class="btn" id="rq">✏️ 小考 5 題（闖關）</button><button class="btn ghost" id="back">⬅ 回'+esc(G.name)+'</button>';
  API.h(html);
  $('say-n').onclick=function(){sayName(r);};$('say-r').onclick=function(){API.playAudio(r.ar,r.key);};
  document.querySelectorAll('.excard').forEach(function(b){b.onclick=function(){var e=r.ex[+b.getAttribute('data-i')];b.classList.remove('built');void b.offsetWidth;b.classList.add('built');sayEx(e);};});
  // 進場：一張一張拼起來
  var cards=document.querySelectorAll('.excard');cards.forEach(function(c,i){setTimeout(function(){c.classList.add('built');},500+i*350);});
  setTimeout(function(){sayName(r);},300);
  $('rq').onclick=function(){startQuiz([r],5,r.form+' '+r.name+' 小考','r:'+r.id,function(){lesson(id);});};
  $('back').onclick=function(){group(r.g);};}

// ---------- 出題 ----------
function otherRads(r,avoidKeys){return D.rads.filter(function(o){return o!==r&&avoidKeys.indexOf(o.key)<0;});}
function qPick(e){ // 這個字的部首是？
  var r=e.r;var ds=shuffle(otherRads(r,e.contains)).slice(0,2);
  return {type:'pick',e:e,prompt:'「'+e.c+'」的部首是哪一個？',pa:'rq_pick',answer:r.id,opts:shuffle([r].concat(ds)).map(function(o){return {id:o.id,html:rLabel(o)};})};}
function qFind(r,pool){ // 哪一個字有這個部首？
  var e=rnd(r.ex);var others=shuffle(pool.filter(function(x){return x.r!==r&&x.contains.indexOf(r.key)<0;})).slice(0,2);
  return {type:'find',r:r,e:e,prompt:'哪一個字的部首是「'+r.form+'」'+r.name+'？',pa:'rq_find',answer:e.c,opts:shuffle([e].concat(others)).map(function(o){return {id:o.c,html:'<span class="ochar">'+esc(o.c)+'</span>'+zyV(o.z)};})};}
var CONFLICT=[['足','辵'],['口','言'],['日','月'],['人','女'],['水','雨'],['土','山'],['衣','糸'],['木','竹','艸'],['犬','鳥','虫']];
function clash(a,b){return CONFLICT.some(function(g){return g.indexOf(a.key)>=0&&g.indexOf(b.key)>=0;});}
function qMean(r){var ds=[];shuffle(D.rads.filter(function(o){return o!==r&&!clash(o,r);})).forEach(function(o){if(ds.length<2&&ds.every(function(d){return !clash(d,o);}))ds.push(o);});
  return {type:'mean',r:r,prompt:'有「'+r.form+'」（'+r.name+'）的字，大多和什麼有關？',pa:'rq_mean',answer:r.id,opts:shuffle([r].concat(ds)).map(function(o){return {id:o.id,html:'<span class="oemo">'+o.emoji+'</span>'+esc(o.mean.replace(/^和/,'').replace(/有關$/,''))};})};}
function qOdd(r,pool){var two=shuffle(r.ex).slice(0,2);
  var cand=shuffle(pool.filter(function(x){return x.r!==r&&x.contains.indexOf(r.key)<0&&two.every(function(t){return t.contains.indexOf(x.r.key)<0;});}));
  if(!cand.length)return qFind(r,pool);var odd=cand[0];
  return {type:'odd',r:r,e:odd,prompt:'哪一個字的部首和別人<b>不一樣</b>？',pa:'rq_odd',answer:odd.c,explain:two[0].c+'、'+two[1].c+' 的部首是「'+r.form+'」'+r.name+'；'+odd.c+' 的部首是「'+odd.r.form+'」'+odd.r.name,
    opts:shuffle(two.concat([odd])).map(function(o){return {id:o.c,html:'<span class="ochar">'+esc(o.c)+'</span>'+zyV(o.z)};})};}
function sigOf(q){if(q.type==='pick')return 'p:'+q.e.c;if(q.type==='find')return 'f:'+q.answer;if(q.type==='mean')return 'm:'+q.r.id;return 'o:'+q.opts.map(function(o){return o.id;}).sort().join('');}
function makeOne(t,r,pool,used){var q;if(t==='pick'){var es=shuffle(r.ex.filter(function(e){return !used['p:'+e.c];}));var e=es[0]||rnd(r.ex);q=qPick(e);}
  else if(t==='find'){var fs=shuffle(r.ex.filter(function(e){return !used['f:'+e.c];}));q=qFind(r,pool);if(fs.length&&used[sigOf(q)]){var e2=fs[0];var others=shuffle(pool.filter(function(x){return x.r!==r&&x.contains.indexOf(r.key)<0;})).slice(0,2);q.e=e2;q.answer=e2.c;q.opts=shuffle([e2].concat(others)).map(function(o){return {id:o.c,html:'<span class="ochar">'+esc(o.c)+'</span>'+zyV(o.z)};});}}
  else if(t==='mean')q=qMean(r);else q=qOdd(r,pool);
  q.sig=sigOf(q);return q;}
function buildQuiz(rads,n,avoid){var pool=[];D.rads.forEach(function(r){pool=pool.concat(r.ex);});avoid=avoid||{};
  var qs=[],used={};for(var k in avoid)used[k]=1;var order=[];while(order.length<n)order=order.concat(shuffle(rads));order=order.slice(0,n);
  var types=['pick','find','pick','mean','odd'];
  order.forEach(function(r,i){var t0=types[i%types.length];if(rads.length===1&&t0==='mean'&&i>2)t0='pick';
    var tries=[t0].concat(shuffle(['pick','find','odd','mean'].filter(function(t){return t!==t0;})));var q=null;
    for(var a=0;a<tries.length*6&&!q;a++){var c=makeOne(tries[Math.floor(a/6)],r,pool,used);if(!used[c.sig])q=c;}
    if(!q)q=makeOne(t0,r,pool,used); // 題目真的用完了才重複
    used[q.sig]=1;qs.push(q);});
  return shuffle(qs);}
var quiz=null;
function startQuiz(rads,n,title,key,back){var lk='rad:'+key;var qs=buildQuiz(rads,n,window.ZYP.used(lk));quiz={qs:qs,idx:0,first:0,title:title,key:key,lk:lk,back:back,wrong:[],sigs:qs.map(function(q){return q.sig;})};showQ();}
function showQ(){var q=quiz.qs[quiz.idx];var total=quiz.qs.length;
  var html='<div class="muted">'+esc(quiz.title)+'</div><div class="progress"><i style="width:'+(quiz.idx/total*100)+'%"></i></div><div id="qtimer"></div>'+(q.retried?'<p class="center"><span class="retry-tag">🔁 剛剛錯的，再試一次</span></p>':'')+'<p class="q-prompt">'+(q.type==='odd'?q.prompt:esc(q.prompt))+'</p>';
  if(q.type==='pick')html+='<div class="q-word">'+esc(q.e.c)+'</div><p class="center" style="margin:0">'+zyV(q.e.z)+'　<span class="muted">'+esc(q.e.w)+'</span></p><button class="speak" id="say">🔊 聽一聽</button>';
  else if(q.type==='find'||q.type==='mean')html+='<div class="q-word rq">'+esc(q.r.form)+'</div><button class="speak" id="say">🔊 '+esc(q.r.name)+'</button>';
  else html+='<div style="height:6px"></div>';
  html+='<div class="opts '+(q.opts.length===3?'three':'two')+' radopts '+q.type+'">'+q.opts.map(function(o,k){return '<button class="opt small" data-k="'+k+'">'+o.html+'</button>';}).join('')+'</div><div class="feedback" id="fb"></div><div id="next-wrap"></div>';
  API.h(html);
  var sb=$('say');if(sb)sb.onclick=function(){if(q.type==='pick')sayEx(q.e);else sayName(q.r);};
  var done=false;
  var tm=window.ZYP.timer('choice',$('qtimer'),function(){answer(null);});
  setTimeout(function(){var go=function(){if(!done)tm.start();};if(q.type==='pick')chain([q.pa,q.e.aud],[q.prompt,q.e.c],go);else if(q.type==='odd')API.playAudio(q.pa,'哪一個字的部首和別人不一樣',go);else chain([q.pa,q.r.an],[q.prompt,q.r.name],go);tm.soon(7000);},250);
  function answer(b){if(done)return;done=true;tm.stop();var o=b?q.opts[+b.getAttribute('data-k')]:null;var ok=!!o&&o.id===q.answer;var fb=$('fb');
    var e=q.type==='pick'?q.e:q.type==='find'?CH[q.answer]:q.type==='odd'?q.e:null;
    if(e&&!q.retried){var st=R().stats[e.c]||(R().stats[e.c]={a:0,c:0});st.a++;if(ok)st.c++;}
    var expl=q.type==='pick'?'「'+q.e.c+'」的部首是「'+q.e.r.form+'」'+q.e.r.name+'，'+q.e.r.mean:q.type==='find'?'「'+q.answer+'」的部首是「'+q.r.form+'」'+q.r.name:q.type==='mean'?'「'+q.r.form+'」的字大多'+q.r.mean+'，例如 '+q.r.ex.slice(0,3).map(function(x){return x.c;}).join('、'):q.explain;
    if(ok){b.classList.add('ok');if(!q.retried)quiz.first++;API.S().fuel++;fb.className='feedback ok';fb.innerHTML=rnd(['答對了！⭐','好厲害！🌟','部首小博士！📚'])+'<small>'+esc(expl)+'</small>';API.save();API.hud();
      API.playAudio('rp_ok','答對了');setTimeout(nextQ,1500);}
    else{if(b)b.classList.add('bad');document.querySelectorAll('.opt').forEach(function(x){if(q.opts[+x.getAttribute('data-k')].id===q.answer)x.classList.add('ok');});
      fb.className='feedback bad';fb.innerHTML=(b?'再想想看 💪':'⏰ 超過 '+tm.sec+' 秒，這題先算「不會」')+'<small>'+esc(expl)+'</small>';API.playAudio('rp_try','再想想看');
      if(!q.retried){quiz.wrong.push({c:e?e.c:q.r.form,t:q.type,ans:expl});var r2=JSON.parse(JSON.stringify(q,function(k,v){return k==='r'&&v&&v.ex?undefined:v;}));r2.r=q.r;r2.e=q.e;r2.opts=shuffle(q.opts);r2.retried=true;quiz.qs.push(r2);}
      API.save();$('next-wrap').innerHTML='<button class="btn" id="next">下一題 ➡</button>';$('next').onclick=nextQ;}}
  document.querySelectorAll('.opt').forEach(function(b){b.onclick=function(){answer(b);};});}
function nextQ(){quiz.idx++;if(quiz.idx>=quiz.qs.length)finish();else showQ();}
function finish(){var base=quiz.qs.filter(function(q){return !q.retried;}).length,c=quiz.first;var pass=c>=window.ZYP.passNeed(base);
  var x=R();var stars=c===base?3:pass?2:c>=Math.ceil(base*0.5)?1:0;if(stars>(x.quiz[quiz.key]||0))x.quiz[quiz.key]=stars;
  x.tests.push({date:new Date().toISOString(),key:quiz.key,title:quiz.title,score:c,total:base,wrong:quiz.wrong});if(x.tests.length>60)x.tests=x.tests.slice(-60);API.save();API.hud();
  var html='<div class="big-result">'+(c===base?'🏆':pass?'🌟':'🚀')+'</div><h1>'+(c===base?'全部答對，部首小博士！':pass?'過關！':'完成練習，再挑戰一次會更好！')+'</h1><p class="sub" style="font-size:22px">第一次就答對 '+c+' / '+base+' 題</p><div id="runres"></div>';
  if(quiz.wrong.length)html+='<div class="card"><h2>🔧 要再複習的</h2><ul class="list">'+quiz.wrong.map(function(w){return '<li><div>'+esc(w.ans)+'</div></li>';}).join('')+'</ul></div>';
  html+='<button class="btn" id="again">🚀 再闖一次（換新題）</button><button class="btn blue" id="back">⬅ 回去</button>';
  API.h(html);API.playAudio('rp_done','完成挑戰，好棒');var qq=quiz;
  var res=window.ZYP.clear(quiz.lk,{first:c,base:base,perfect:c===base,used:quiz.sigs,title:quiz.title,src:'部首',into:$('runres')});
  $('runres').insertAdjacentHTML('afterbegin',window.ZYP.resultHTML(res,{kind:'choice'}));
  $('again').onclick=function(){var rs=qq.key==='test'?D.rads:qq.key.indexOf('g:')===0?radsOf(qq.key.slice(2)):[RBY[qq.key.slice(2)]];startQuiz(rs,qq.qs.filter(function(q){return !q.retried;}).length,qq.title,qq.key,qq.back);};
  $('back').onclick=qq.back;}

// ---------- 家長專區 ----------
function parentsCard(){var x=R();
  var html='<div class="card"><h2>📚 部首學習紀錄</h2>';
  D.groups.forEach(function(g){var rs=radsOf(g.id);var a=0,c=0;rs.forEach(function(r){r.ex.forEach(function(e){var st=x.stats[e.c];if(st){a+=st.a;c+=st.c;}});});var pct=a?Math.round(c/a*100):null;
    html+='<div class="bar"><span class="lbl" style="width:auto;min-width:60px;font-size:15px">'+esc(g.name.split(' ')[1]||g.name)+'</span><span class="track"><i style="width:'+(pct||0)+'%;background:'+(pct>=80?'#64e39b':pct>=60?'#ffd166':'#ff6b81')+'"></i></span><span class="num">'+(pct===null?'—':pct+'%')+'<br>學過 '+rs.filter(function(r){return x.learn[r.id];}).length+'/'+rs.length+'</span></div>';});
  var miss=Object.keys(x.stats).map(function(c){var st=x.stats[c];return {c:c,m:st.a-st.c,a:st.a};}).filter(function(o){return o.m>0&&CH[o.c];}).sort(function(a,b){return b.m-a.m;}).slice(0,10);
  html+='<h3 style="margin:10px 0 4px">❗ 最常認錯部首的字</h3>'+(miss.length?'<ul class="list">'+miss.map(function(o){var e=CH[o.c];return '<li><div><b>'+esc(o.c)+'</b> '+esc(e.z)+'　部首「'+esc(e.r.form)+'」'+esc(e.r.name)+'</div><span>錯 '+o.m+' / '+o.a+' <button class="mini" data-rsay="'+esc(o.c)+'">🔊</button></span></li>';}).join('')+'</ul>':'<p class="muted">還沒有錯題紀錄 🎉</p>');
  var ts=x.tests.slice().reverse().slice(0,12);
  html+='<h3 style="margin:10px 0 4px">📝 測驗紀錄</h3>'+(ts.length?'<ul class="list">'+ts.map(function(t){var d=new Date(t.date);var ds=(d.getMonth()+1)+'/'+d.getDate()+' '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);return '<li style="display:block"><div style="display:flex;justify-content:space-between"><span>'+ds+'　'+esc(t.title)+'</span><b>'+t.score+' / '+t.total+'</b></div>'+(t.wrong.length?'<div class="muted">'+t.wrong.map(function(w){return esc(w.ans);}).join('；')+'</div>':'')+'</li>';}).join('')+'</ul>':'<p class="muted">還沒有測驗紀錄</p>');
  html+='<details><summary style="padding:6px 0">📖 全部 '+D.rads.length+' 個部首與例字</summary><p style="line-height:1.9">'+D.rads.map(function(r){return '<b>'+esc(r.form)+'</b> '+esc(r.name)+'（'+esc(r.key)+' '+esc(r.rd)+'）：'+r.ex.map(function(e){return esc(e.c);}).join('、');}).join('<br>')+'</p></details>';
  html+='<button class="btn blue" id="test-voice-r" style="font-size:18px">🔊 測試部首語音（應唸「三點水、提手旁、草字頭、河流」）</button></div>';
  return html;}
function bindParents(){document.querySelectorAll('[data-rsay]').forEach(function(b){b.onclick=function(){sayEx(CH[b.getAttribute('data-rsay')]);};});
  var t=$('test-voice-r');if(t)t.onclick=function(){var w=D.rads.filter(function(r){return r.key==='水'||r.key==='手'||r.key==='艸';});chain(w.map(function(r){return r.an;}).concat([CH['河'].aud]),w.map(function(r){return r.name;}).concat(['河流']));};}
function totalStars(){var x=R(),n=0;for(var k in x.quiz)n+=x.quiz[k];return n;}
window.ZYRad={init:function(api){API=api;},open:hub,lesson:lesson,group:group,parentsCard:parentsCard,bindParents:bindParents,totalStars:totalStars,
  badges:function(){return D.groups.filter(function(g){return groupDone(g.id);}).length+(window.ZYP.done('rad:test')?1:0);},count:count,
  _t:{buildQuiz:buildQuiz,D:D,CH:CH,startQuiz:startQuiz,get quiz(){return quiz;}}};
})();
