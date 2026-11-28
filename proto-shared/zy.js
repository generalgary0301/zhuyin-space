/* 互動式介面原型共用工具：詞庫（沿用正式網站 js/data.js，教育部讀音）、錄音（沿用 audio/）、拖曳、飛星星。
   原型不寫入正式網站的進度（不碰 localStorage 的 zhuyinSpace.v1）。 */
window.ZYP2=(function(){
var BASE='../';
function init(z){return z.replace('˙','').charAt(0);}
function parse(s){var raw=(window.ZY_RAW&&window.ZY_RAW[s])||(window.ZY_RAW_F&&window.ZY_RAW_F[s])||'';
  return raw.trim().split('\n').map(function(l){var p=l.split('|');return {word:p[0],zy:p[1].split(' '),emoji:p[2],t:+p[3],aud:p[5],src:p[6]||'',sound:s};});}
// 翹舌／平舌分辨：只取「目標字是 s、而且整個詞只有一個 ㄓ 或 ㄗ 音節」的兩字詞，避免題目模糊
function pairWords(s){return parse(s).filter(function(w){
  return !w.src&&w.word.length===2&&['💬','🔤','📜'].indexOf(w.emoji)<0&&init(w.zy[w.t])===s&&
    w.zy.filter(function(z){var c=init(z);return c==='ㄓ'||c==='ㄗ';}).length===1;});}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function pick(a,n){return shuffle(a).slice(0,n);}
var A=new Audio();A.preload='auto';var seq=0;
function src(id){return BASE+'audio/'+id+'.mp3'+(/^(n|h|t|z|q|m|r\d\d|rx|rq|rp)_/.test(id)?'?v=5':'');}
function play(ids,cb){ids=[].concat(ids);var my=++seq,i=0;
  function nx(){if(my!==seq)return;if(i>=ids.length){if(cb)cb();return;}A.src=src(ids[i++]);A.onended=nx;A.onerror=nx;try{var p=A.play();if(p&&p.catch)p.catch(function(){setTimeout(nx,300);});}catch(e){setTimeout(nx,300);}}
  nx();}
function stop(){seq++;try{A.pause();}catch(e){}}
function unlock(){try{A.src=src('m_ok');A.volume=0;var p=A.play();var back=function(){try{A.pause();}catch(e){}A.volume=1;};if(p&&p.then)p.then(back,back);else back();}catch(e){}}
function hit(t,x,y){var r=t.getBoundingClientRect();return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;}
/* 拖曳（手指或滑鼠）；沒有移動就當成「點一下」 */
function drag(el,targets,onDrop,onTap){var sx=0,sy=0,moved=false,pid=null;el.style.touchAction='none';
  el.addEventListener('pointerdown',function(e){if(el.classList.contains('done'))return;pid=e.pointerId;try{el.setPointerCapture(pid);}catch(_){}sx=e.clientX;sy=e.clientY;moved=false;el.classList.add('dragging');});
  el.addEventListener('pointermove',function(e){if(e.pointerId!==pid)return;var dx=e.clientX-sx,dy=e.clientY-sy;if(Math.abs(dx)+Math.abs(dy)>10)moved=true;
    if(moved){el.style.transform='translate('+dx+'px,'+dy+'px) scale(1.1)';targets().forEach(function(t){t.classList.toggle('over',hit(t,e.clientX,e.clientY));});}});
  function end(e,cancel){if(e.pointerId!==pid)return;pid=null;el.classList.remove('dragging');
    var tg=(!cancel&&moved)?targets().filter(function(t){return hit(t,e.clientX,e.clientY);})[0]:null;targets().forEach(function(t){t.classList.remove('over');});
    if(!moved&&!cancel){el.style.transform='';if(onTap)onTap();return;}
    var ok=tg?onDrop(tg):false;if(!ok){el.style.transition='transform .3s';el.style.transform='';setTimeout(function(){el.style.transition='';},320);}}
  el.addEventListener('pointerup',function(e){end(e,false);});el.addEventListener('pointercancel',function(e){end(e,true);});}
function fly(from,to,txt,cb){var a=from.getBoundingClientRect(),b=to.getBoundingClientRect();var d=document.createElement('div');d.className='flyer';d.textContent=txt||'⭐';
  d.style.left=(a.left+a.width/2-20)+'px';d.style.top=(a.top+a.height/2-20)+'px';document.body.appendChild(d);
  requestAnimationFrame(function(){requestAnimationFrame(function(){d.style.transform='translate('+(b.left+b.width/2-a.left-a.width/2)+'px,'+(b.top+b.height/2-a.top-a.height/2)+'px) scale(.6)';d.style.opacity='.4';});});
  setTimeout(function(){d.remove();to.classList.add('pop');setTimeout(function(){to.classList.remove('pop');},400);if(cb)cb();},750);}
function confetti(n){for(var i=0;i<(n||24);i++){var c=document.createElement('div');c.className='confetti';c.textContent=['⭐','✨','🌟','💫'][i%4];c.style.left=(Math.random()*100)+'vw';c.style.animationDelay=(Math.random()*.4)+'s';document.body.appendChild(c);setTimeout(function(x){return function(){x.remove();};}(c),2200);}}
function hl(w){return w.word.split('').map(function(c,i){return i===w.t?'<span class="hl">'+c+'</span>':c;}).join('');}
function mathQ(n,lo,hi){var out=[],seen={};while(out.length<n){var a=lo+Math.floor(Math.random()*(hi-lo+1)),b=2+Math.floor(Math.random()*8);
  if((a%10)+b<10)continue;var k=a+'+'+b;if(seen[k])continue;seen[k]=1;out.push({a:a,b:b,s:a+b});}return out;}
function numIds(n){return ['n_'+n];}
return {pairWords:pairWords,shuffle:shuffle,pick:pick,play:play,stop:stop,unlock:unlock,drag:drag,fly:fly,confetti:confetti,hl:hl,mathQ:mathQ,numIds:numIds,init:init};
})();
