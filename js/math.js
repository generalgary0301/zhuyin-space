/* 注音太空探險隊 — 🔢 數學星系：加法、減法教學（動畫）、進位退位特訓營、心算練習場
 * 依十二年國教數學領域課綱：N-1-2 加法和減法、N-1-3 基本加減法（合十、拆十）、N-2-2 加減直式計算（加法含二次進位、減法限一次退位、含 0 的題型）。
 * 語音：預先錄好的音檔（audio/m_*.mp3、audio/n_*.mp3＝0–1000 整數、audio/q_*.mp3），語速約 +15%。 */
(function(){
'use strict';
var API=null; // {S,save,h,hud,playAudio,toast,esc,starStr,back}
var $=function(id){return document.getElementById(id);};
function S(){return API.S();}
function M(){var s=S();if(!s.math)s.math={lv:{},log:[],lesson:{},camp:{}};var m=s.math;m.lv=m.lv||{};m.log=m.log||[];m.lesson=m.lesson||{};m.camp=m.camp||{};return m;}
function rint(a,b){return a+Math.floor(Math.random()*(b-a+1));}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function rnd(a){return a[Math.floor(Math.random()*a.length)];}

// ---------- 語音：數字讀法 ----------
var CN=['零','一','二','三','四','五','六','七','八','九'];
function cn(n){ // 0–1000 的國語讀法
  if(n===1000)return '一千';
  if(n<10)return CN[n];
  if(n<20)return '十'+(n%10?CN[n%10]:'');
  if(n<100)return CN[Math.floor(n/10)]+'十'+(n%10?CN[n%10]:'');
  var h=Math.floor(n/100),r=n%100;var s=(h===2?'兩':CN[h])+'百';
  if(!r)return s;if(r<10)return s+'零'+CN[r];if(r<20)return s+'一十'+(r%10?CN[r%10]:'');return s+cn(r);}
function numIds(n){ // 0–1000 每個數都有整段錄音（不再拼接，聽起來較順）
  if(n<=1000)return ['n_'+n];
  var h=Math.floor(n/100),r=n%100,out=['h_'+h];
  if(!r)return out;if(r<10)out.push('z_'+r);else if(r<20)out.push('t_'+r);else out.push('n_'+r);return out;}
var TXT={m_plus:'加',m_minus:'減',m_eq:'等於',m_eqq:'等於多少？',m_gen:'跟',m_heq10:'跟幾合起來是十？',m_zaijia:'再加',m_jiushi:'就是',m_ba:'把',m_chaicheng:'拆成',m_cou10:'湊成十！',m_heqilai:'合起來是',
  m_ones:'個位',m_tens:'十位',m_hund:'百位',m_carry:'滿十，進一！',m_borrow:'不夠減，向前一位借一個十',m_break10:'拆開一個十，變成十個一',m_bundle:'十個一，換成一個十',m_take:'拿走',m_left:'剩下',
  m_ok:'答對了！',m_ok2:'好厲害！',m_ok3:'你是心算小太空人！',m_try:'再想想看',m_look:'我們一起看看怎麼算',m_done:'完成練習，好棒！',m_done2:'完成練習，再加油！',m_ans:'答案是',m_write:'寫',m_first10:'先用十減',m_tensadd:'幾個十加幾個十',m_frame:'格子裡有'};
function wordsOf(ids){return ids.map(function(i){if(TXT[i])return TXT[i];var m=/^(n|h|t|z)_(\d+)$/.exec(i);if(!m)return '';var k=+m[2];return m[1]==='n'?cn(k):m[1]==='h'?(k===2?'兩':CN[k])+'百':m[1]==='t'?'一十'+(k%10?CN[k%10]:''):'零'+CN[k];}).join('');}
var seqTok=0;
function say(ids,onend){ // 依序播放多段音檔
  ids=ids.filter(Boolean);var my=++seqTok,i=0;
  (function next(){if(my!==seqTok)return;if(i>=ids.length){if(onend)onend();return;}var id=ids[i++];API.playAudio(id,wordsOf([id]),function(){if(my===seqTok)setTimeout(next,10);});})();}
function stopSay(){seqTok++;}
function sayQ(a,op,b){ // 題目：20 以內有整句錄音（語調自然），其他用數字接著唸
  if((op==='+'&&a<=10&&b<=10)||(op==='-'&&a<=19&&b<=10&&b<=a))return say(['q_'+(op==='+'?'a':'s')+'_'+a+'_'+b]);
  say(numIds(a).concat([op==='+'?'m_plus':'m_minus']).concat(numIds(b)).concat(['m_eqq']));}
function sayEq(a,op,b,c,onend){say(numIds(a).concat([op==='+'?'m_plus':'m_minus']).concat(numIds(b)).concat(['m_eq']).concat(numIds(c)),onend);}

// ---------- 動畫舞台 ----------
// 舞台座標：寬 100 單位；高度由 aspect 決定（unit = 寬的 1%）
function Stage(el,ratio){this.el=el;this.r=ratio;el.className='mbox mstage';el.style.aspectRatio='100 / '+ratio;el.innerHTML='';this.items={};}
Stage.prototype.add=function(id,cls,x,y,w,h,html){var d=document.createElement('div');d.className='mi '+cls;d.style.left=x+'%';d.style.top=(y/this.r*100)+'%';d.style.width=w+'%';if(h!=null)d.style.height=(h/this.r*100)+'%';if(html!=null)d.innerHTML=html;this.el.appendChild(d);this.items[id]=d;return d;};
Stage.prototype.move=function(id,x,y){var d=this.items[id];if(!d)return;d.style.left=x+'%';d.style.top=(y/this.r*100)+'%';};
Stage.prototype.cls=function(id,c,on){var d=this.items[id];if(d)d.classList.toggle(c,on!==false);};
Stage.prototype.get=function(id){return this.items[id];};
// 十格框：5×2，左上角 (x,y)，格子 8.6 單位
var CELL=8.6;
function frameXY(fx,fy,i){return [fx+(i%5)*CELL+0.9,fy+Math.floor(i/5)*CELL+0.9];}
function drawFrame(st,id,fx,fy){st.add(id,'frame',fx,fy,CELL*5,CELL*2);for(var i=0;i<10;i++){st.add(id+'c'+i,'cell',fx+(i%5)*CELL,fy+Math.floor(i/5)*CELL,CELL,CELL);}}
function dot(st,id,cls,x,y){return st.add(id,'dot '+cls,x,y,6.8,6.8);}

// 位值積木：一條（十）高 26、寬 3.2；一個（一）3.4×3.4
function rodHTML(){var s='';for(var i=0;i<10;i++)s+='<i></i>';return s;}
function cubeXY(zx,zy,i){return [zx+(i%5)*4.3,zy+Math.floor(i/5)*4.3];}
function rodXY(zx,zy,i){return [zx+i*4.4,zy];}

// ---------- 場景（每一步：cap 文字、say 語音、ask 問題、run 動畫） ----------
// 1) 十以內加法：合起來
function sceneAdd(a,b){
  return {ratio:44,title:a+' ＋ '+b,eq:[a+' ＋ '+b+' ＝ ？'],
   build:function(st){drawFrame(st,'F',6,4);for(var i=0;i<a;i++){var p=frameXY(6,4,i);dot(st,'a'+i,'red',p[0],p[1]);}
     for(var j=0;j<b;j++){dot(st,'b'+j,'blue',6+j*9.2,30);}},
   steps:[
    {cap:'先看紅色的 '+a+' 個，再看藍色的 '+b+' 個',say:numIds(a).concat(['m_plus']).concat(numIds(b)).concat(['m_eqq'])},
    {cap:'把藍色的 '+b+' 個放進格子，合起來！',say:['m_heqilai'],run:function(st){for(var j=0;j<b;j++){var p=frameXY(6,4,a+j);st.move('b'+j,p[0],p[1]);}}},
    {cap:a+' 和 '+b+' 合起來是 '+(a+b),ask:{q:a+' ＋ '+b+' ＝ ？',a:a+b},eq:a+' ＋ '+b+' ＝ '+(a+b),say:numIds(a).concat(['m_plus']).concat(numIds(b)).concat(['m_eq']).concat(numIds(a+b)),run:function(st){st.cls('F','glow');}}
   ]};}
// 2) 合十：幾和幾合起來是 10
function sceneTen(a){
  return {ratio:30,title:a+' 和幾合起來是 10',eq:[a+' ＋ □ ＝ 10'],
   build:function(st){drawFrame(st,'F',6,4);for(var i=0;i<a;i++){var p=frameXY(6,4,i);dot(st,'a'+i,'red',p[0],p[1]);}},
   steps:[
    {cap:'格子裡有 '+a+' 個，空格有幾個？',say:['m_frame'].concat(numIds(a))},
    {cap:'空格有 '+(10-a)+' 個，'+a+' 和 '+(10-a)+' 合起來是 10',ask:{q:a+' 和幾合起來是 10？',a:10-a},eq:a+' ＋ '+(10-a)+' ＝ 10',say:numIds(a).concat(['m_gen']).concat(numIds(10-a)).concat(['m_heqilai','n_10']),
     run:function(st){for(var i=a;i<10;i++){var p=frameXY(6,4,i);dot(st,'b'+i,'blue pop',p[0],p[1]);}st.cls('F','glow');}}
   ]};}
// 3) 十以內減法：拿走
function sceneSub(a,b){
  return {ratio:30,title:a+' － '+b,eq:[a+' － '+b+' ＝ ？'],
   build:function(st){drawFrame(st,'F',6,4);for(var i=0;i<a;i++){var p=frameXY(6,4,i);dot(st,'a'+i,'yellow',p[0],p[1]);}},
   steps:[
    {cap:'格子裡有 '+a+' 個',say:['m_frame'].concat(numIds(a))},
    {cap:'拿走 '+b+' 個',say:['m_take'].concat(numIds(b)),run:function(st){for(var i=a-b;i<a;i++){st.cls('a'+i,'gone');}}},
    {cap:'剩下 '+(a-b)+' 個',ask:{q:a+' － '+b+' ＝ ？',a:a-b},eq:a+' － '+b+' ＝ '+(a-b),say:numIds(a).concat(['m_minus']).concat(numIds(b)).concat(['m_eq']).concat(numIds(a-b))}
   ]};}
// 4) ★ 湊十法：進位加法 a+b（a+b>10）
function sceneMakeTen(a,b){
  var need=10-a,rest=b-need;
  return {ratio:50,title:'湊十法　'+a+' ＋ '+b,eq:[a+' ＋ '+b],
   build:function(st){drawFrame(st,'F',4,4);drawFrame(st,'G',51,4);st.cls('G','faint');
     for(var i=0;i<a;i++){var p=frameXY(4,4,i);dot(st,'a'+i,'red',p[0],p[1]);}
     for(var j=0;j<b;j++){dot(st,'b'+j,'blue',4+j*9.6,31);}
     st.add('split','splitlab',4,40,92,4,'');},
   steps:[
    {cap:a+' ＋ '+b+' ＝ ？　先看 '+a+'，格子還有 '+need+' 個空位',say:numIds(a).concat(['m_plus']).concat(numIds(b)).concat(['m_eqq']),run:function(st){for(var i=a;i<10;i++)st.cls('Fc'+i,'hole');}},
    {cap:a+' 再加 '+need+' 就是 10',ask:{q:a+' 再加幾就是 10？',a:need},say:numIds(a).concat(['m_zaijia']).concat(numIds(need)).concat(['m_jiushi','n_10'])},
    {cap:'把 '+b+' 拆成 '+need+' 和 '+rest,ask:{q:b+' 拆成 '+need+' 和幾？',a:rest},eq:'＝ '+a+' ＋ '+need+' ＋ '+rest,say:['m_ba'].concat(numIds(b)).concat(['m_chaicheng']).concat(numIds(need)).concat(['m_gen']).concat(numIds(rest)),
     run:function(st){for(var j=0;j<b;j++){if(j>=need)st.move('b'+j,4+j*9.6+4,31);else st.cls('b'+j,'ring');}
       st.get('split').innerHTML='<span class="sl-a" style="left:'+(need*9.6/2-1)+'%">'+need+'</span><span class="sl-b" style="left:'+((need+rest/2)*9.6+2)+'%">'+rest+'</span>';}},
    {cap:'把 '+need+' 個放進格子，湊成 10！',eq:'＝ 10 ＋ '+rest,say:['m_cou10'],run:function(st){for(var j=0;j<need;j++){var p=frameXY(4,4,a+j);st.move('b'+j,p[0],p[1]);st.cls('b'+j,'ring',false);}for(var i=a;i<10;i++)st.cls('Fc'+i,'hole',false);st.cls('F','glow');st.get('split').innerHTML='<span class="sl-a" style="left:22%">10</span>';}},
    {cap:'10 和 '+rest+' 合起來是 '+(10+rest),ask:{q:'10 ＋ '+rest+' ＝ ？',a:10+rest},eq:'＝ '+(10+rest),say:numIds(a).concat(['m_plus']).concat(numIds(b)).concat(['m_eq']).concat(numIds(a+b)),
     run:function(st){st.cls('G','faint',false);for(var j=need;j<b;j++){var p=frameXY(51,4,j-need);st.move('b'+j,p[0],p[1]);}st.get('split').innerHTML='<span class="sl-a" style="left:22%">10</span><span class="sl-b" style="left:'+(68)+'%">'+rest+'</span>';}}
   ]};}
// 5) ★ 破十法：退位減法 m−b（m 是十幾、個位不夠減）
function sceneBreakTen(m,b){
  var x=m-10,r=10-b;
  return {ratio:36,title:'破十法　'+m+' － '+b,eq:[m+' － '+b],
   build:function(st){drawFrame(st,'F',4,4);drawFrame(st,'G',51,4);
     for(var i=0;i<10;i++){var p=frameXY(4,4,i);dot(st,'a'+i,'yellow',p[0],p[1]);}
     for(var j=0;j<x;j++){var q=frameXY(51,4,j);dot(st,'c'+j,'yellow',q[0],q[1]);}
     st.add('lab1','flab',4,24,43,6,'10');st.add('lab2','flab',51,24,43,6,String(x));},
   steps:[
    {cap:m+' － '+b+' ＝ ？　'+m+' 是 10 和 '+x,say:numIds(m).concat(['m_minus']).concat(numIds(b)).concat(['m_eqq'])},
    {cap:x+' 不夠拿走 '+b+'，先用 10 減 '+b,ask:{q:'10 － '+b+' ＝ ？',a:r},eq:'10 － '+b+' ＝ '+r,say:['m_first10'].concat(numIds(b)),
     run:function(st){for(var i=10-b;i<10;i++)st.cls('a'+i,'gone');st.get('lab1').textContent='10 － '+b+' ＝ '+r;}},
    {cap:r+' 和 '+x+' 合起來是 '+(r+x),ask:{q:r+' ＋ '+x+' ＝ ？',a:r+x},eq:'＝ '+r+' ＋ '+x+' ＝ '+(r+x),say:numIds(m).concat(['m_minus']).concat(numIds(b)).concat(['m_eq']).concat(numIds(m-b)),
     run:function(st){st.cls('F','glow');st.cls('G','glow');}}
   ]};}
// 6) 位值積木：二位數加法（可進位）
function placeZones(st,ratio){st.add('zt','zone',1,1,48,ratio-2,'<b>十位</b>');st.add('zo','zone',51,1,48,ratio-2,'<b>個位</b>');}
function sceneBlocksAdd(a,b){
  var ta=Math.floor(a/10),oa=a%10,tb=Math.floor(b/10),ob=b%10,os=oa+ob,carry=os>=10?1:0,res=a+b;
  var R=104;
  function build(st){placeZones(st,R);
    st.add('la','rowlab',1,6,10,6,String(a));st.add('lb','rowlab',1,38,10,6,'＋'+b);
    for(var i=0;i<ta;i++){var p=rodXY(12,6,i);st.add('ta'+i,'rod',p[0],p[1],3.2,26,rodHTML());}
    for(var j=0;j<oa;j++){var q=cubeXY(55,6,j);st.add('oa'+j,'cube',q[0],q[1],3.4,3.4);}
    for(var i2=0;i2<tb;i2++){var p2=rodXY(12,38,i2);st.add('tb'+i2,'rod b',p2[0],p2[1],3.2,26,rodHTML());}
    for(var j2=0;j2<ob;j2++){var q2=cubeXY(55,38,j2);st.add('ob'+j2,'cube b',q2[0],q2[1],3.4,3.4);}
    st.add('line','hline',1,70,98,0.6,'');st.add('newrod','rod new hide',55,72,3.2,26,rodHTML());}
  var steps=[{cap:a+' ＋ '+b+' ＝ ？　先算個位',say:numIds(a).concat(['m_plus']).concat(numIds(b)).concat(['m_eqq'])}];
  steps.push({cap:'個位：'+oa+' ＋ '+ob+' ＝ '+os,ask:{q:'個位：'+oa+' ＋ '+ob+' ＝ ？',a:os},say:['m_ones'].concat(numIds(oa)).concat(['m_plus']).concat(numIds(ob)).concat(['m_eq']).concat(numIds(os)),
    run:function(st){var k=0;for(var j=0;j<oa;j++){var q=cubeXY(55,74,k++);st.move('oa'+j,q[0],q[1]);}for(var j2=0;j2<ob;j2++){var q2=cubeXY(55,74,k++);st.move('ob'+j2,q2[0],q2[1]);}}});
  if(carry)steps.push({cap:'滿 10 個一，換成 1 個十，進位到十位！',say:['m_bundle','m_carry'],eq:'個位寫 '+(os-10)+'，進 1 到十位',
    run:function(st){var all=[];for(var j=0;j<oa;j++)all.push('oa'+j);for(var j2=0;j2<ob;j2++)all.push('ob'+j2);
      for(var k=0;k<10;k++){st.move(all[k],55,72+(9-k)*2.6);st.cls(all[k],'bundle');}
      setTimeout(function(){for(var k=0;k<10;k++)st.cls(all[k],'vanish');var nr=st.get('newrod');if(nr){nr.classList.remove('hide');st.move('newrod',12+(ta+tb)*4.4,72);st.cls('newrod','carryfly');}
        for(var k2=10;k2<all.length;k2++){var q=cubeXY(55,74,k2-10);st.move(all[k2],q[0],q[1]);}},st._instant?0:900);}});
  steps.push({cap:'十位：'+ta+' ＋ '+tb+(carry?' ＋ 進位 1':'')+' ＝ '+(ta+tb+carry)+' 個十',ask:{q:'十位：'+ta+' ＋ '+tb+(carry?' ＋ 1':'')+' ＝ ？',a:ta+tb+carry},say:['m_tens'],
    run:function(st){for(var i=0;i<ta;i++){var p=rodXY(12,72,i);st.move('ta'+i,p[0],p[1]);}for(var i2=0;i2<tb;i2++){var p2=rodXY(12,72,ta+i2);st.move('tb'+i2,p2[0],p2[1]);}}});
  steps.push({cap:a+' ＋ '+b+' ＝ '+res,ask:{q:a+' ＋ '+b+' ＝ ？',a:res},eq:a+' ＋ '+b+' ＝ '+res,say:numIds(a).concat(['m_plus']).concat(numIds(b)).concat(['m_eq']).concat(numIds(res)),run:function(st){st.cls('zt','glow');st.cls('zo','glow');}});
  return {ratio:R,title:'位值積木　'+a+' ＋ '+b,eq:[a+' ＋ '+b],build:build,steps:steps};}
// 7) 位值積木：二位數減法（可退位）
function sceneBlocksSub(a,b){
  var ta=Math.floor(a/10),oa=a%10,tb=Math.floor(b/10),ob=b%10,borrow=oa<ob?1:0,res=a-b;var R=72;
  function build(st){placeZones(st,R);st.add('la','rowlab',1,6,10,6,String(a));st.add('lb','rowlab',1,40,14,6,'－'+b);
    for(var i=0;i<ta;i++){var p=rodXY(12,6,i);st.add('t'+i,'rod',p[0],p[1],3.2,26,rodHTML());}
    for(var j=0;j<oa;j++){var q=cubeXY(55,6,j);st.add('o'+j,'cube',q[0],q[1],3.4,3.4);}
    for(var k=0;k<10;k++){var q2=cubeXY(55,6,oa+k);st.add('x'+k,'cube y hide',q2[0],q2[1],3.4,3.4);}}
  var steps=[{cap:a+' － '+b+' ＝ ？　先算個位',say:numIds(a).concat(['m_minus']).concat(numIds(b)).concat(['m_eqq'])}];
  if(borrow)steps.push({cap:'個位 '+oa+' 不夠減 '+ob+'，拆開 1 個十，變成 10 個一（退位）',say:['m_borrow'],eq:'十位剩 '+(ta-1)+'，個位變成 '+(oa+10),
    run:function(st){var last='t'+(ta-1);st.move(last,48,6);st.cls(last,'breaking');
      setTimeout(function(){st.cls(last,'vanish');for(var k=0;k<10;k++){st.cls('x'+k,'hide',false);st.cls('x'+k,'pop');}},st._instant?0:800);}});
  var on=oa+10*borrow;
  steps.push({cap:'個位：'+on+' － '+ob+' ＝ '+(on-ob),ask:{q:'個位：'+on+' － '+ob+' ＝ ？',a:on-ob},say:['m_ones'].concat(numIds(on)).concat(['m_minus']).concat(numIds(ob)).concat(['m_eq']).concat(numIds(on-ob)),
    run:function(st){var ids=[];for(var j=0;j<oa;j++)ids.push('o'+j);if(borrow)for(var k=0;k<10;k++)ids.push('x'+k);for(var r=0;r<ob;r++){var id=ids[ids.length-1-r];st.cls(id,'gone');}}});
  var tn=ta-borrow;
  steps.push({cap:'十位：'+tn+' － '+tb+' ＝ '+(tn-tb)+' 個十',ask:{q:'十位：'+tn+' － '+tb+' ＝ ？',a:tn-tb},say:['m_tens'],
    run:function(st){for(var i=0;i<tb;i++){st.cls('t'+(tn-1-i),'gone');}}});
  steps.push({cap:a+' － '+b+' ＝ '+res,ask:{q:a+' － '+b+' ＝ ？',a:res},eq:a+' － '+b+' ＝ '+res,say:numIds(a).concat(['m_minus']).concat(numIds(b)).concat(['m_eq']).concat(numIds(res)),run:function(st){st.cls('zt','glow');st.cls('zo','glow');}});
  return {ratio:R,title:'位值積木　'+a+' － '+b,eq:[a+' － '+b],build:build,steps:steps};}
// 8) 整十數：幾個十加減幾個十
function sceneTens(a,op,b){
  var ta=a/10,tb=b/10,res=op==='+'?a+b:a-b;var R=40;
  function build(st){st.add('zt','zone',1,1,98,R-2,'<b>十位（一條是 10）</b>');for(var i=0;i<ta;i++){var p=rodXY(4,9,i);st.add('t'+i,'rod',p[0],p[1],3.2,26,rodHTML());}
    if(op==='+')for(var j=0;j<tb;j++){var q=rodXY(4+(ta+1)*4.4,9,j);st.add('u'+j,'rod b',q[0],q[1],3.2,26,rodHTML());}}
  var steps=[{cap:a+' 是 '+ta+' 個十，'+b+' 是 '+tb+' 個十',say:numIds(a).concat([op==='+'?'m_plus':'m_minus']).concat(numIds(b)).concat(['m_eqq'])},
    {cap:ta+' 個十 '+(op==='+'?'加':'減')+' '+tb+' 個十 ＝ '+(res/10)+' 個十',ask:{q:ta+(op==='+'?' ＋ ':' － ')+tb+' ＝ ？（幾個十）',a:res/10},
     run:function(st){if(op==='+'){for(var j=0;j<tb;j++){var q=rodXY(4+(ta+j)*4.4,9,0);st.move('u'+j,q[0],q[1]);}}else{for(var i=0;i<tb;i++)st.cls('t'+(ta-1-i),'gone');}}},
    {cap:(res/10)+' 個十就是 '+res,ask:{q:a+(op==='+'?' ＋ ':' － ')+b+' ＝ ？',a:res},eq:a+(op==='+'?' ＋ ':' － ')+b+' ＝ '+res,say:numIds(a).concat([op==='+'?'m_plus':'m_minus']).concat(numIds(b)).concat(['m_eq']).concat(numIds(res)),run:function(st){st.cls('zt','glow');}}];
  return {ratio:R,title:'整十數　'+a+(op==='+'?' ＋ ':' － ')+b,eq:[a+(op==='+'?' ＋ ':' － ')+b],build:build,steps:steps};}
// 9) ★ 直式加法（含二次進位）
function digits(n,len){var s=String(n);while(s.length<len)s=' '+s;return s.split('');}
var PLN=['個位','十位','百位','千位'];var PLID=['m_ones','m_tens','m_hund','m_hund'];
function colHTML(a,b,op,len){
  var hd='<div class="cg-row hd"><span></span>'+PLN.slice(0,len).reverse().map(function(p){return '<span>'+p.charAt(0)+'</span>';}).join('')+'</div>';
  var cr='<div class="cg-row carry"><span></span>';for(var i=len-1;i>=0;i--)cr+='<span id="cc'+i+'"></span>';cr+='</div>';
  var ra='<div class="cg-row"><span></span>';digits(a,len).forEach(function(d,k){ra+='<span id="ca'+(len-1-k)+'">'+(d===' '?'':d)+'</span>';});ra+='</div>';
  var rb='<div class="cg-row"><span class="op">'+(op==='+'?'＋':'－')+'</span>';digits(b,len).forEach(function(d,k){rb+='<span id="cb'+(len-1-k)+'">'+(d===' '?'':d)+'</span>';});rb+='</div>';
  var rr='<div class="cg-row res"><span></span>';for(var i2=len-1;i2>=0;i2--)rr+='<span id="cr'+i2+'"></span>';rr+='</div>';
  return '<div class="colgrid c'+len+'">'+hd+cr+ra+rb+'<div class="cg-line"></div>'+rr+'</div>';}
function colHL(root,len,i){for(var k=0;k<len;k++){['ca','cb','cr','cc'].forEach(function(p){var e=root.querySelector('#'+p+k);if(e)e.classList.toggle('hl',k===i);});}}
function sceneColAdd(a,b){
  var res=a+b,len=String(res).length;var A=digits(a,len),B=digits(b,len);
  function dg(arr,i){var c=arr[arr.length-1-i];return c===' '?0:+c;}
  var steps=[{cap:'直式加法：從個位開始算，一位一位對齊',say:numIds(a).concat(['m_plus']).concat(numIds(b)).concat(['m_eqq'])}];
  var carry=0;
  for(var i=0;i<len;i++){(function(i,cin){var da=dg(A,i),db=dg(B,i);var s=da+db+cin;if(i===len-1&&da===0&&db===0&&cin){ // 最高位只有進位
        steps.push({cap:PLN[i]+'：只有進位的 1，寫 1',run:function(st,root){colHL(root,len,i);root.querySelector('#cr'+i).textContent='1';root.querySelector('#cr'+i).classList.add('pop');}});return;}
      var out=s%10,co=s>=10?1:0;
      steps.push({cap:PLN[i]+'：'+da+' ＋ '+db+(cin?' ＋ 進位 1':'')+' ＝ '+s+(co?'，寫 '+out+'，進 1 到'+PLN[i+1]+'！':'，寫 '+out),
        ask:{q:PLN[i]+'：'+da+' ＋ '+db+(cin?' ＋ 1':'')+' ＝ ？',a:s},say:[PLID[i]].concat(co?['m_carry']:[]),
        run:function(st,root){colHL(root,len,i);var r=root.querySelector('#cr'+i);r.textContent=String(out);r.classList.add('pop');
          if(co){var c=root.querySelector('#cc'+(i+1));if(c){c.textContent='1';c.classList.remove('fly');void c.offsetWidth;c.classList.add('fly');}}}});
      carry=co;})(i,carry);}
  steps.push({cap:a+' ＋ '+b+' ＝ '+res,ask:{q:a+' ＋ '+b+' ＝ ？',a:res},eq:a+' ＋ '+b+' ＝ '+res,say:numIds(a).concat(['m_plus']).concat(numIds(b)).concat(['m_eq']).concat(numIds(res)),run:function(st,root){colHL(root,len,-1);root.querySelector('.colgrid').classList.add('glow');}});
  return {col:true,html:colHTML(a,b,'+',len),title:'直式加法　'+a+' ＋ '+b,eq:[a+' ＋ '+b],steps:steps};}
// 10) ★ 直式減法（一次退位）
function sceneColSub(a,b){
  var res=a-b,len=String(a).length;var A=digits(a,len),B=digits(b,len);
  function dg(arr,i){var c=arr[arr.length-1-i];return c===' '?0:+c;}
  var steps=[{cap:'直式減法：從個位開始算，不夠減就向前一位借 1 個十',say:numIds(a).concat(['m_minus']).concat(numIds(b)).concat(['m_eqq'])}];
  var top=[];for(var i=0;i<len;i++)top.push(dg(A,i));
  for(var i2=0;i2<len;i2++){(function(i){var db=dg(B,i);
      if(top[i]<db){var from=i+1;top[from]-=1;var newTop=top[i]+10;
        steps.push({cap:PLN[i]+' '+top[i]+' 不夠減 '+db+'，向'+PLN[from]+'借 1（'+PLN[from]+'變成 '+top[from]+'），'+PLN[i]+'變成 '+newTop,say:['m_borrow'],
          run:(function(tf,nt){return function(st,root){colHL(root,len,i);var e=root.querySelector('#ca'+from);e.classList.add('strike');var c=root.querySelector('#cc'+from);c.textContent=String(tf);c.classList.add('pop','small');
            var c2=root.querySelector('#cc'+i);c2.textContent=String(nt);c2.classList.add('pop','small');root.querySelector('#ca'+i).classList.add('strike');};})(top[from],newTop)});
        top[i]=newTop;}
      var t=top[i],out=t-db;
      if(i===len-1&&out===0&&len>1){steps.push({cap:PLN[i]+'：'+t+' － '+db+' ＝ 0，最前面的 0 不用寫',run:function(st,root){colHL(root,len,i);}});return;}
      steps.push({cap:PLN[i]+'：'+t+' － '+db+' ＝ '+out,ask:{q:PLN[i]+'：'+t+' － '+db+' ＝ ？',a:out},say:[PLID[i]],
        run:function(st,root){colHL(root,len,i);var r=root.querySelector('#cr'+i);r.textContent=String(out);r.classList.add('pop');}});})(i2);}
  steps.push({cap:a+' － '+b+' ＝ '+res,ask:{q:a+' － '+b+' ＝ ？',a:res},eq:a+' － '+b+' ＝ '+res,say:numIds(a).concat(['m_minus']).concat(numIds(b)).concat(['m_eq']).concat(numIds(res)),run:function(st,root){colHL(root,len,-1);root.querySelector('.colgrid').classList.add('glow');}});
  return {col:true,html:colHTML(a,b,'-',len),title:'直式減法　'+a+' － '+b,eq:[a+' － '+b],steps:steps};}

// 依題目挑選最適合的講解方法
function sceneFor(q){var a=q.a,b=q.b;
  if(q.kind==='ten')return sceneTen(a);
  if(q.op==='+'){
    if(q.col)return sceneColAdd(a,b);
    if(a<10&&b<10&&a+b>10)return sceneMakeTen(a,b);
    if(a+b<=10)return sceneAdd(a,b);
    if(a%10===0&&b%10===0)return sceneTens(a,'+',b);
    return sceneBlocksAdd(a,b);}
  if(q.col)return sceneColSub(a,b);
  if(a>10&&a<20&&b<10&&a%10<b)return sceneBreakTen(a,b);
  if(a<=10)return sceneSub(a,b);
  if(a%10===0&&b%10===0)return sceneTens(a,'-',b);
  return sceneBlocksSub(a,b);}

// ---------- 播放器 ----------
function Player(root,sc,opts){
  opts=opts||{};var self=this;this.sc=sc;this.k=0;this.root=root;this.opts=opts;
  root.innerHTML='<div class="mtitle">'+API.esc(sc.title)+'</div><div class="mbox" id="mbox"></div><div class="meq" id="meq"></div><div class="mcap" id="mcap"></div>'+
    (opts.guided?'<div id="mask"></div>':'<div class="mctl"><button class="btn ghost mbtn" id="mrestart">⟲ 從頭看</button><button class="btn mbtn" id="mnext">下一步 ▶</button></div>');
  this.box=root.querySelector('#mbox');this.reset(true);
  if(!opts.guided){root.querySelector('#mrestart').onclick=function(){self.reset();self.next();};root.querySelector('#mnext').onclick=function(){self.next();};}
}
Player.prototype.reset=function(silent){
  var sc=this.sc;this.k=0;this.eqs=sc.eq.slice();
  if(sc.col){this.box.className='mbox colbox';this.box.innerHTML=sc.html;this.st={_instant:false,cls:function(){},move:function(){}};}
  else{this.box.className='mbox';this.st=new Stage(this.box,sc.ratio);sc.build(this.st);}
  this.render();if(!silent)stopSay();};
Player.prototype.render=function(){var r=this.root;r.querySelector('#meq').innerHTML=this.eqs.map(function(e){return '<div>'+API.esc(e)+'</div>';}).join('');
  var st=this.sc.steps[this.k-1];r.querySelector('#mcap').innerHTML=st?API.esc(st.cap):'按「下一步」開始看 👀';
  var nb=r.querySelector('#mnext');if(nb){nb.textContent=this.k>=this.sc.steps.length?'🔁 再看一次':'下一步 ▶ ('+this.k+'/'+this.sc.steps.length+')';}};
Player.prototype.apply=function(i,quiet){var s=this.sc.steps[i];if(s.run)s.run(this.st,this.box);if(s.eq)this.eqs.push(s.eq);if(!quiet&&s.say&&s.say.length)say(s.say);};
Player.prototype.next=function(){if(this.k>=this.sc.steps.length){this.reset();}
  this.apply(this.k);this.k++;this.render();if(this.k>=this.sc.steps.length&&this.opts.onDone)this.opts.onDone();};
Player.prototype.auto=function(gap,onDone){var self=this;var tok=++this._auto||(this._auto=1);var my=this._auto;
  (function go(){if(self._auto!==my||!document.body.contains(self.root))return;if(self.k>=self.sc.steps.length){if(onDone)onDone();return;}self.next();setTimeout(go,gap||2600);})();};
Player.prototype.stop=function(){this._auto=(this._auto||0)+1;};

// ---------- 數字鍵盤 ----------
function padHTML(){var k='';[7,8,9,4,5,6,1,2,3].forEach(function(n){k+='<button class="nk" data-n="'+n+'">'+n+'</button>';});
  k+='<button class="nk fn" data-n="back">⌫</button><button class="nk" data-n="0">0</button><button class="nk ok" data-n="ok">✓</button>';return '<div class="npad">'+k+'</div>';}
function bindPad(root,max,onInput,onOk){var v='';root.querySelector('.npad').onclick=function(e){var b=e.target.closest('.nk');if(!b)return;var n=b.getAttribute('data-n');
  if(n==='back')v=v.slice(0,-1);else if(n==='ok'){if(v!=='')onOk(+v,function(){v='';onInput(v);});return;}else if(v.length<max){v=(v==='0'?'':v)+n;}onInput(v);};
  return {clear:function(){v='';onInput(v);}};}

// ---------- 課程 ----------
var LESSONS=[
 {id:'L_add',g:'add',icon:'🍎',name:'加法是「合起來」',grade:'一年級',demo:function(){return sceneAdd(3,4);},more:function(){var a=rint(1,7);return sceneAdd(a,rint(1,10-a));}},
 {id:'L_ten',g:'add',icon:'🔟',name:'合十：幾和幾是 10',grade:'一年級',demo:function(){return sceneTen(7);},more:function(){return sceneTen(rint(1,9));}},
 {id:'L_make10',g:'add',icon:'⭐',star:1,name:'湊十法（進位加法）',grade:'一年級',demo:function(){return sceneMakeTen(8,5);},more:function(){var a=rint(5,9);return sceneMakeTen(a,rint(11-a,9));}},
 {id:'L_blkadd',g:'add',icon:'🧱',star:1,name:'位值積木：二位數加法（進位）',grade:'一年級下',demo:function(){return sceneBlocksAdd(26,17);},more:function(){var x=genAdd2(true);return sceneBlocksAdd(x[0],x[1]);}},
 {id:'L_coladd',g:'add',icon:'📐',star:1,name:'直式加法（二次進位）',grade:'二年級',demo:function(){return sceneColAdd(158,267);},more:function(){var x=genAdd3(rint(1,2));return sceneColAdd(x[0],x[1]);}},
 {id:'L_sub',g:'sub',icon:'🍪',name:'減法是「拿走」',grade:'一年級',demo:function(){return sceneSub(7,3);},more:function(){var a=rint(3,10);return sceneSub(a,rint(1,a));}},
 {id:'L_break10',g:'sub',icon:'⭐',star:1,name:'破十法（退位減法）',grade:'一年級',demo:function(){return sceneBreakTen(13,5);},more:function(){var x=genBreak();return sceneBreakTen(x[0],x[1]);}},
 {id:'L_blksub',g:'sub',icon:'🧱',star:1,name:'位值積木：二位數減法（退位）',grade:'一年級下',demo:function(){return sceneBlocksSub(43,15);},more:function(){var x=genSub2(true);return sceneBlocksSub(x[0],x[1]);}},
 {id:'L_colsub',g:'sub',icon:'📐',star:1,name:'直式減法（退位）',grade:'二年級',demo:function(){return sceneColSub(352,127);},more:function(){var x=genSub3(1);return sceneColSub(x[0],x[1]);}}
];
var LBY={};LESSONS.forEach(function(l){LBY[l.id]=l;});
function lessonPage(id,fresh){
  var l=LBY[id];var sc=fresh?l.more():l.demo();var m=M();m.lesson[id]=(m.lesson[id]||0)+1;API.save();
  API.h('<div class="muted">🔢 數學星系 › '+(l.g==='add'?'加法教室':'減法教室')+'</div><h2 class="center">'+l.icon+' '+l.name+'</h2><div id="player"></div>'+
    '<button class="btn blue" id="auto">▶ 自動播放</button><button class="btn" id="fresh">🎲 換一題再看</button><button class="btn ghost" id="back">⬅ 回'+(l.g==='add'?'加法':'減法')+'教室</button>');
  var p=new Player($('player'),sc);
  $('auto').onclick=function(){p.reset();p.auto(2800);};
  $('fresh').onclick=function(){p.stop();stopSay();lessonPage(id,true);};
  $('back').onclick=function(){p.stop();stopSay();classroom(l.g);};}
function classroom(g){
  var ls=LESSONS.filter(function(l){return l.g===g;});var m=M();
  var html='<div class="ship">'+(g==='add'?'➕':'➖')+'</div><h1>'+(g==='add'?'加法教室':'減法教室')+'</h1><p class="sub">看動畫學方法，⭐ 是最重要的'+(g==='add'?'「進位」':'「退位」')+'</p><div class="planet-grid">';
  ls.forEach(function(l){html+='<button class="planet wide lesson'+(l.star?' starl':'')+'" data-l="'+l.id+'"><div class="pname" style="font-size:20px">'+l.icon+' '+l.name+'</div><div class="pstars">'+l.grade+(m.lesson[l.id]?'・看過 ✔':'')+'</div></button>';});
  html+='</div><button class="btn ghost" id="back">⬅ 回數學星系</button>';
  API.h(html);
  document.querySelectorAll('[data-l]').forEach(function(b){b.onclick=function(){lessonPage(b.getAttribute('data-l'));};});
  $('back').onclick=hub;}

// ---------- 題目產生（依課綱範圍） ----------
function carries(a,b){var c=0,n=0;while(a||b||c){var s=a%10+b%10+c;c=s>=10?1:0;n+=c;a=Math.floor(a/10);b=Math.floor(b/10);}return n;}
function borrows(a,b){var n=0,br=0;while(a||b){var t=a%10-br,d=b%10;if(t<d){n++;br=1;}else br=0;a=Math.floor(a/10);b=Math.floor(b/10);}return n;}
function genAdd2(carry){for(;;){var a=rint(11,89),b=rint(11,89);if(a+b>99)continue;if(carry!==(a%10+b%10>=10))continue;return [a,b];}}
function genSub2(br){for(;;){var a=rint(21,99),b=rint(11,a-1);if(br!==(a%10<b%10))continue;if(a-b<1)continue;return [a,b];}}
function genAdd3(nc){for(;;){var a=rint(100,899),b=Math.random()<0.25?rint(15,99):rint(100,899);if(a+b>999)continue;if(carries(a,b)!==nc)continue;return Math.random()<0.5?[a,b]:[a,b];}}
function genSub3(nb){for(;;){var a=rint(120,999),b=Math.random()<0.25?rint(12,99):rint(100,a-10);if(b>=a)continue;if(borrows(a,b)!==nb)continue;return [a,b];}}
function genBreak(){for(;;){var m=rint(11,18),b=rint(2,9);if(b>m%10&&m-b<10)return [m,b];}}
function Q(a,op,b,extra){var q={a:a,op:op,b:b,ans:op==='+'?a+b:a-b};for(var k in extra)q[k]=extra[k];q.key=a+op+b;return q;}
var LEVELS=[
 {id:'m1',name:'十以內的加法',grade:'一年級',tip:'用手指或想像十格框，數一數合起來有幾個',gen:function(){var a=rint(0,9);return Q(a,'+',rint(Math.random()<0.1?0:1,10-a));}},
 {id:'m2',name:'合十：幾和幾是 10',grade:'一年級',tip:'1 和 9、2 和 8、3 和 7、4 和 6、5 和 5 都是好朋友',gen:function(){var a=rint(1,9);return Q(a,'+',10-a,{kind:'ten'});}},
 {id:'m3',name:'十以內的減法',grade:'一年級',tip:'想成「拿走」：有幾個，拿走幾個，剩下幾個',gen:function(){var a=rint(1,10);return Q(a,'-',rint(Math.random()<0.1?0:1,a));}},
 {id:'m4',name:'加 10、減 10、十幾',grade:'一年級',tip:'十幾就是 1 個十和幾個一',gen:function(){var x=rint(1,9);return rnd([Q(10,'+',x),Q(x,'+',10),Q(10+x,'-',x),Q(10+x,'-',10)]);}},
 {id:'m5',star:1,name:'進位加法（湊十法）',grade:'一年級',tip:'先湊成 10，再加剩下的：8＋5 → 8＋2＋3 → 10＋3',scene:'L_make10',gen:function(){var a=rint(2,9);return Q(a,'+',rint(Math.max(2,11-a),9));}},
 {id:'m6',star:1,name:'退位減法（破十法）',grade:'一年級',tip:'先用 10 減：13－5 → 10－5＝5，5＋3＝8',scene:'L_break10',gen:function(){var x=genBreak();return Q(x[0],'-',x[1]);}},
 {id:'m7',name:'整十數加減',grade:'一年級',tip:'幾個十加減幾個十：30＋40 → 3 個十加 4 個十 → 7 個十',gen:function(){var t=rint(1,8);return rnd([Q(t*10,'+',rint(1,9-t)*10),Q(rint(2,9)*10,'-',t*10)]).ans>=0?(function(){var a=rint(2,9),b=rint(1,a);return Math.random()<0.5?Q(t*10,'+',rint(1,9-t)*10):Q(a*10,'-',b*10);})():Q(30,'+',40);}},
 {id:'m8',star:1,name:'二位數加減一位數（進位、退位）',grade:'一年級下',tip:'個位先算：38＋5 → 8＋5＝13，進 1 → 43',gen:function(){if(Math.random()<0.5){for(;;){var a=rint(11,89),b=rint(2,9);if(a%10+b>=10&&a+b<100)return Q(a,'+',b);}}for(;;){var c=rint(21,98),d=rint(2,9);if(c%10<d)return Q(c,'-',d);}}},
 {id:'m9',star:1,name:'二位數加法（進位）',grade:'一年級下～二年級',tip:'拆數心算：26＋17 → 26＋10＝36，36＋7＝43',gen:function(){var x=genAdd2(Math.random()<0.8);return Q(x[0],'+',x[1]);}},
 {id:'m10',star:1,name:'二位數減法（退位）',grade:'一年級下～二年級',tip:'個位不夠減，向十位借 1 個十：43－15 → 13－5＝8，3－1＝2 → 28',gen:function(){var x=genSub2(Math.random()<0.8);return Q(x[0],'-',x[1]);}},
 {id:'m11',star:1,name:'直式加法（三位數、二次進位）',grade:'二年級',tip:'從個位算起，滿 10 就在前一位上面寫小小的 1',col:1,gen:function(){var x=genAdd3(rnd([1,2,2]));return Q(x[0],'+',x[1],{col:true});}},
 {id:'m12',star:1,name:'直式減法（三位數、一次退位）',grade:'二年級',tip:'不夠減就向前一位借 1，前一位要記得少 1',col:1,gen:function(){var x=genSub3(Math.random()<0.85?1:0);return Q(x[0],'-',x[1],{col:true});}},
 {id:'m13',star:1,name:'進位退位大挑戰（混合）',grade:'綜合',tip:'先看是加還是減，再想：要進位嗎？要退位嗎？',gen:function(){return rnd([LEVELS[4],LEVELS[5],LEVELS[7],LEVELS[8],LEVELS[9]]).gen();}}
];
// m7 產生器寫得簡潔一點
LEVELS[6].gen=function(){if(Math.random()<0.5){var t=rint(1,8);return Q(t*10,'+',rint(1,9-t)*10);}var a=rint(2,9),b=rint(1,a);return Q(a*10,'-',b*10);};
var LVBY={};LEVELS.forEach(function(l){LVBY[l.id]=l;});
var NQ=10;

// ---------- 心算練習 ----------
var sess=null;
function practiceList(){
  var m=M();var html='<div class="ship">🧠</div><h1>心算練習場</h1><p class="sub">每關 10 題，⭐ 是進位、退位的重點關卡</p>';
  html+='<div class="card mtip">🧠 心算小撇步：<b>湊十</b>（8＋5＝8＋2＋3）、<b>破十</b>（13－5＝10－5＋3）、<b>拆數</b>（26＋17＝26＋10＋7）、<b>整十數</b>（30＋40＝7 個十）</div>';
  LEVELS.forEach(function(l,i){var r=m.lv[l.id]||{};html+='<div class="card mission'+(l.star?' starc':'')+'"><div><b>第 '+(i+1)+' 關'+(l.star?' ⭐':'')+'</b>　'+API.starStr(r.stars||0)+'<div>'+l.name+'</div><div class="muted">'+l.grade+(r.plays?'・玩過 '+r.plays+' 次・最佳 '+r.best+'/'+NQ:'')+'</div></div><button class="btn" data-lv="'+l.id+'">出發 🚀</button></div>';});
  html+='<button class="btn ghost" id="back">⬅ 回數學星系</button>';
  API.h(html);document.querySelectorAll('[data-lv]').forEach(function(b){b.onclick=function(){startLevel(b.getAttribute('data-lv'));};});$('back').onclick=hub;}
function makeSet(lv){var seen={},out=[],guard=0;while(out.length<NQ&&guard++<400){var q=lv.gen();if(seen[q.key])continue;seen[q.key]=1;out.push(q);}return out;}
function startLevel(id){var lv=LVBY[id];sess={lv:lv,qs:makeSet(lv),idx:0,first:0,wrong:[],t0:Date.now()};showMQ();}
function qText(q){if(q.kind==='ten')return q.a+' 和 □ 合起來是 10';return q.a+' '+(q.op==='+'?'＋':'－')+' '+q.b+' ＝ □';}
function qSay(q){if(q.kind==='ten')return say(numIds(q.a).concat(['m_heq10']));sayQ(q.a,q.op,q.b);}
function regroup(q){if(q.kind==='ten')return false;var a=q.a,b=q.b,c=0;
  if(q.op==='+'){while(a||b){var s=a%10+b%10+c;if(s>=10)return true;c=0;a=Math.floor(a/10);b=Math.floor(b/10);}return false;}
  while(b){if(a%10<b%10)return true;a=Math.floor(a/10);b=Math.floor(b/10);}return false;}
function qAns(q){return q.kind==='ten'?q.b:q.ans;}
function colQ(q,val){var len=Math.max(String(q.a).length,String(q.b).length,String(q.ans).length);
  var A=digits(q.a,len),B=digits(q.b,len),V=digits(val||'',len);
  function row(op,arr,cls){return '<div class="cg-row '+(cls||'')+'"><span class="op">'+op+'</span>'+arr.map(function(d){return '<span>'+(d===' '?'':d)+'</span>';}).join('')+'</div>';}
  return '<div class="colgrid q c'+len+'">'+row('',A)+row(q.op==='+'?'＋':'－',B)+'<div class="cg-line"></div>'+row('',V,'res')+'</div>';}
function showMQ(){
  var q=sess.qs[sess.idx];var total=sess.qs.length;
  var html='<div class="muted">🧠 '+sess.lv.name+'</div><div class="progress"><i style="width:'+(sess.idx/total*100)+'%"></i></div>'+
   (q.retried?'<p class="center"><span class="retry-tag">🔁 剛剛錯的，再試一次</span></p>':'')+
   (q.col?'<div id="qshow">'+colQ(q,'')+'</div>':'<div class="mq" id="qshow">'+API.esc(qText(q)).replace('□','<span class="ansbox" id="ab">?</span>')+'</div>')+
   '<button class="speak" id="say">🔊 聽題目</button><div class="feedback" id="fb"></div><div id="padw">'+padHTML()+'</div><div id="explain"></div><div id="next-wrap"></div>';
  API.h(html);$('say').onclick=function(){qSay(q);};setTimeout(function(){qSay(q);},250);
  var tries=0;
  bindPad(document,4,function(v){if(q.col)$('qshow').innerHTML=colQ(q,v);else{var ab=$('ab');if(ab)ab.textContent=v===''?'?':v;}},function(v,clear){
    var ok=v===qAns(q);var fb=$('fb');
    if(ok){if(!q.retried&&tries===0)sess.first++;if(regroup(q))sess.rg=true;API.S().fuel++;API.save();API.hud();fb.className='feedback ok';fb.innerHTML=rnd(['答對了！⭐','好厲害！🌟','心算小太空人！🚀','完美！🛸'])+'<small>'+eqStr(q)+'</small>';
      say([rnd(['m_ok','m_ok2','m_ok3'])]);$('padw').style.pointerEvents='none';setTimeout(nextMQ,1100);return;}
    tries++;
    if(!q.retried&&tries===1){sess.wrong.push({q:qText(q),ans:qAns(q),input:v,lv:sess.lv.id});var r=JSON.parse(JSON.stringify(q));r.retried=true;sess.qs.push(r);}
    fb.className='feedback bad';
    if(tries===1&&!q.col&&(sess.lv.id==='m1'||sess.lv.id==='m2'||sess.lv.id==='m3')){fb.innerHTML='再想想看 💪<small>你寫的是 '+v+'</small>';say(['m_try']);clear();return;}
    fb.innerHTML='正確答案是 <b>'+qAns(q)+'</b><small>'+eqStr(q)+'　一起看看怎麼算 👇</small>';$('padw').style.display='none';
    var ex=$('explain');ex.innerHTML='<div class="card" id="explayer"></div>';var p=new Player($('explayer'),sceneFor(q));
    say(['m_look'],function(){p.auto(2600);});
    $('next-wrap').innerHTML='<button class="btn blue" id="replay">🔁 再看一次</button><button class="btn" id="next">下一題 ➡</button>';
    $('replay').onclick=function(){p.stop();p.reset();p.auto(2600);};$('next').onclick=function(){p.stop();stopSay();nextMQ();};});}
function eqStr(q){if(q.kind==='ten')return q.a+' ＋ '+q.b+' ＝ 10';return q.a+' '+(q.op==='+'?'＋':'－')+' '+q.b+' ＝ '+q.ans;}
function nextMQ(){sess.idx++;if(sess.idx>=sess.qs.length)finishMQ();else showMQ();}
function finishMQ(){
  var base=sess.qs.filter(function(q){return !q.retried;}).length,c=sess.first;var stars=c===base?3:c>=Math.ceil(base*0.8)?2:c>=Math.ceil(base*0.5)?1:0;
  var m=M();var r=m.lv[sess.lv.id]||(m.lv[sess.lv.id]={stars:0,best:0,plays:0,a:0,c:0});r.plays++;r.a+=base;r.c+=c;if(stars>r.stars)r.stars=stars;if(c>r.best)r.best=c;
  var secs=Math.round((Date.now()-sess.t0)/1000);
  m.log.push({date:new Date().toISOString(),lv:sess.lv.id,score:c,total:base,secs:secs,wrong:sess.wrong});if(m.log.length>60)m.log=m.log.slice(-60);API.save();API.hud();
  var html='<div class="big-result">'+(stars===3?'🏆':stars>0?'🌟':'🚀')+'</div><h1>'+(stars===3?'全部答對，太神了！':stars>0?'過關！':'完成練習，再挑戰一次會更好！')+'</h1>'+
   '<p class="sub" style="font-size:22px">第一次就答對 '+c+' / '+base+' 題<br>'+API.starStr(stars)+'<br><span class="muted">用時 '+Math.floor(secs/60)+' 分 '+(secs%60)+' 秒</span></p>';
  if(sess.wrong.length)html+='<div class="card"><h2>🔧 要再練習的題目</h2><ul class="list">'+sess.wrong.map(function(w){return '<li><div>'+API.esc(w.q.replace('□',String(w.ans)))+'<div class="muted">你寫 '+API.esc(w.input)+'</div></div></li>';}).join('')+'</ul></div>';
  html+='<button class="btn" id="again">🔁 再玩一次（換新題）</button><button class="btn blue" id="back">⬅ 回練習場</button>';
  API.h(html);say([stars>0?'m_done':'m_done2']);var id=sess.lv.id;
  if(window.ZYReward)window.ZYReward.earn({src:'數學',key:'math:'+id,title:sess.lv.name,perfect:c===base,regroup:!!sess.rg});$('again').onclick=function(){startLevel(id);};$('back').onclick=practiceList;}

// ---------- ⭐ 進位退位特訓營（一步一步引導） ----------
var CAMP=[
 {id:'c1',name:'湊十進位（20 以內）',icon:'🔟',gen:function(){var a=rint(5,9);return sceneMakeTen(a,rint(11-a,9));}},
 {id:'c2',name:'二位數加法進位（積木）',icon:'🧱',gen:function(){var x=genAdd2(true);return sceneBlocksAdd(x[0],x[1]);}},
 {id:'c3',name:'直式加法：二次進位',icon:'📐',gen:function(){var x=genAdd3(2);return sceneColAdd(x[0],x[1]);}},
 {id:'c4',name:'破十退位（20 以內）',icon:'🍪',gen:function(){var x=genBreak();return sceneBreakTen(x[0],x[1]);}},
 {id:'c5',name:'二位數減法退位（積木）',icon:'🧱',gen:function(){var x=genSub2(true);return sceneBlocksSub(x[0],x[1]);}},
 {id:'c6',name:'直式減法：一次退位',icon:'📐',gen:function(){var x=genSub3(1);return sceneColSub(x[0],x[1]);}}
];
var CBY={};CAMP.forEach(function(c){CBY[c.id]=c;});var NCAMP=3;
function campList(){var m=M();
  var html='<div class="ship">🏋️</div><h1>進位退位特訓營</h1><p class="sub">一步一步跟著動畫算，每一步都自己算出來！</p>';
  html+='<h2 class="galaxy">➕ 進位特訓</h2>';CAMP.slice(0,3).forEach(function(c){html+=campBtn(c,m);});
  html+='<h2 class="galaxy">➖ 退位特訓</h2>';CAMP.slice(3).forEach(function(c){html+=campBtn(c,m);});
  html+='<button class="btn ghost" id="back">⬅ 回數學星系</button>';
  API.h(html);document.querySelectorAll('[data-camp]').forEach(function(b){b.onclick=function(){startCamp(b.getAttribute('data-camp'));};});$('back').onclick=hub;}
function campBtn(c,m){var r=m.camp[c.id]||{};return '<div class="card mission starc"><div><b>'+c.icon+' '+c.name+'</b><div>'+API.starStr(r.stars||0)+'</div><div class="muted">每次 '+NCAMP+' 題'+(r.plays?'・練過 '+r.plays+' 次':'')+'</div></div><button class="btn" data-camp="'+c.id+'">開始 💪</button></div>';}
var camp=null;
function startCamp(id){camp={c:CBY[id],n:0,mist:0,steps:0};campQ();}
function campQ(){
  var sc=camp.c.gen();camp.sc=sc;
  API.h('<div class="muted">🏋️ '+camp.c.name+'　第 '+(camp.n+1)+' / '+NCAMP+' 題</div><div class="progress"><i style="width:'+(camp.n/NCAMP*100)+'%"></i></div><div id="player"></div><div class="feedback" id="fb"></div><div id="askw"></div><div id="next-wrap"></div><button class="btn ghost" id="quit">⬅ 回特訓營</button>');
  var p=new Player($('player'),sc,{guided:true});$('quit').onclick=function(){stopSay();campList();};
  function step(){
    if(p.k>=sc.steps.length){$('askw').innerHTML='';$('fb').className='feedback ok';$('fb').innerHTML='這題完成！🎉';
      camp.n++;$('next-wrap').innerHTML='<button class="btn" id="next">'+(camp.n>=NCAMP?'看成績 🏆':'下一題 ➡')+'</button>';$('next').onclick=function(){stopSay();if(camp.n>=NCAMP)campDone();else campQ();};return;}
    var s=sc.steps[p.k];
    if(!s.ask){p.next();setTimeout(step,s.run?1500:900);return;}
    camp.steps++;var tries=0;
    $('askw').innerHTML='<div class="askq">'+API.esc(s.ask.q).replace('？','<span class="ansbox" id="ab">?</span>')+'</div>'+padHTML();
    bindPad($('askw'),4,function(v){var ab=$('ab');if(ab)ab.textContent=v===''?'?':v;},function(v,clear){
      var fb=$('fb');
      if(v===s.ask.a){fb.className='feedback ok';fb.innerHTML=rnd(['對！','好棒！','沒錯！'])+' ✅';$('askw').innerHTML='';p.next();setTimeout(step,1700);return;}
      tries++;camp.mist++;fb.className='feedback bad';
      if(tries<2){fb.innerHTML='再想想看 💪';say(['m_try']);clear();}
      else{fb.innerHTML='答案是 <b>'+s.ask.a+'</b>，看動畫 👀';$('askw').innerHTML='';p.next();setTimeout(step,2200);}});}
  setTimeout(function(){p.next();setTimeout(step,1400);},300);}
function campDone(){var m=M();var r=m.camp[camp.c.id]||(m.camp[camp.c.id]={stars:0,plays:0,mist:0,steps:0});r.plays++;r.mist+=camp.mist;r.steps+=camp.steps;
  var stars=camp.mist===0?3:camp.mist<=2?2:1;if(stars>r.stars)r.stars=stars;
  m.log.push({date:new Date().toISOString(),lv:camp.c.id,camp:1,score:camp.steps-Math.min(camp.steps,camp.mist),total:camp.steps,secs:0,wrong:[]});if(m.log.length>60)m.log=m.log.slice(-60);API.save();API.hud();
  API.h('<div class="big-result">'+(stars===3?'🏆':'🌟')+'</div><h1>特訓完成！</h1><p class="sub" style="font-size:22px">'+camp.steps+' 個步驟，答錯 '+camp.mist+' 次<br>'+API.starStr(stars)+'</p><button class="btn" id="again">🔁 再練一次</button><button class="btn blue" id="back">⬅ 回特訓營</button>');
  say([stars===3?'m_done':'m_done2']);var id=camp.c.id;
  if(window.ZYReward)window.ZYReward.earn({src:'數學',key:'camp:'+id,title:'特訓營：'+(camp.c.name||id),perfect:camp.mist===0,regroup:camp.mist<camp.steps});$('again').onclick=function(){startCamp(id);};$('back').onclick=campList;}

// ---------- 數學星系首頁 ----------
function hub(){stopSay();API.hud();
  var m=M();
  var html='<div class="ship">🪐</div><h1>數學星系</h1><p class="sub">加法、減法，一起變成心算高手！</p><div class="planet-grid">';
  html+='<button class="planet" id="go-add" style="background:linear-gradient(135deg,#ff9f43,#ee5253)"><div class="orb">＋</div><div class="pname">加法教室</div><div class="pstars">動畫教學・湊十・進位</div></button>';
  html+='<button class="planet" id="go-sub" style="background:linear-gradient(135deg,#48dbfb,#0abde3)"><div class="orb">－</div><div class="pname">減法教室</div><div class="pstars">動畫教學・破十・退位</div></button>';
  html+='<button class="planet wide starl" id="go-camp" style="background:linear-gradient(135deg,#feca57,#ff6b6b)"><div class="orb" style="font-size:34px">⭐</div><div class="pname">進位退位特訓營</div><div class="pstars">一步一步跟著算・小朋友最容易錯的地方</div></button>';
  html+='<button class="planet wide" id="go-prac" style="background:linear-gradient(135deg,#a29bfe,#6c5ce7)"><div class="orb" style="font-size:34px">🧠</div><div class="pname">心算練習場（13 關）</div><div class="pstars">⭐ '+starsTotal()+' / '+(LEVELS.length*3)+'</div></button></div>';
  html+='<p class="muted center" style="margin-top:14px">依教育部十二年國教數學課綱：一年級 20 以內加減、合十拆十、二位數加減；二年級直式（加法到二次進位、減法一次退位）</p>';
  html+='<button class="btn ghost" id="back">⬅ 回太空基地</button>';
  API.h(html);$('go-add').onclick=function(){classroom('add');};$('go-sub').onclick=function(){classroom('sub');};$('go-camp').onclick=campList;$('go-prac').onclick=practiceList;$('back').onclick=API.back;}
function starsTotal(){var m=M(),n=0;for(var k in m.lv)n+=m.lv[k].stars||0;return n;}
function campStars(){var m=M(),n=0;for(var k in m.camp)n+=m.camp[k].stars||0;return n;}

// ---------- 家長專區 ----------
function parentsCard(){var m=M();
  var html='<div class="card"><h2>🔢 數學練習紀錄</h2><p class="muted" style="margin:0 0 6px">心算練習場每關 10 題，算第一次就答對的題數</p>';
  LEVELS.forEach(function(l,i){var r=m.lv[l.id];var pct=r&&r.a?Math.round(r.c/r.a*100):null;
    html+='<div class="bar"><span class="lbl" style="width:auto;min-width:46px;font-size:14px">'+(i+1)+(l.star?'⭐':'')+'</span><span class="track"><i style="width:'+(pct||0)+'%;background:'+(pct>=80?'#64e39b':pct>=60?'#ffd166':'#ff6b81')+'"></i></span><span class="num" style="width:auto;min-width:96px">'+(r?API.starStr(r.stars)+'<br>'+pct+'%・'+r.plays+' 次':'—')+'</span></div><div class="muted" style="font-size:13px;margin:-4px 0 6px 4px">'+l.name+'</div>';});
  var ca=0,cc=0,sa=0,scc=0;m.log.forEach(function(g){if(g.camp)return;var lv=LVBY[g.lv];if(!lv)return;if(lv.star){ca+=g.total;cc+=g.score;}else{sa+=g.total;scc+=g.score;}});
  html+='<p style="margin:8px 0 4px">⭐ 進位／退位關卡正確率：<b>'+(ca?Math.round(cc/ca*100)+'%':'—')+'</b>　一般關卡：<b>'+(sa?Math.round(scc/sa*100)+'%':'—')+'</b></p>';
  html+='<p style="margin:4px 0">🏋️ 特訓營：'+CAMP.map(function(c){var r=m.camp[c.id];return c.name+' '+(r?API.starStr(r.stars)+'（'+r.plays+' 次，錯 '+r.mist+'/'+r.steps+' 步）':'—');}).join('<br>')+'</p>';
  var logs=m.log.slice().reverse().slice(0,15);
  html+='<h3 style="margin:10px 0 4px">最近練習</h3>'+(logs.length?'<ul class="list">'+logs.map(function(g){var d=new Date(g.date);var ds=(d.getMonth()+1)+'/'+d.getDate()+' '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);
    var nm=g.camp?('🏋️ '+(CBY[g.lv]?CBY[g.lv].name:g.lv)):(LVBY[g.lv]?LVBY[g.lv].name:g.lv);
    return '<li style="display:block"><div style="display:flex;justify-content:space-between"><span>'+ds+'　'+API.esc(nm)+'</span><b>'+g.score+' / '+g.total+'</b></div>'+(g.wrong&&g.wrong.length?'<div class="muted">錯：'+g.wrong.map(function(w){return API.esc(w.q.replace('□',String(w.ans)))+'（寫 '+API.esc(w.input)+'）';}).join('；')+'</div>':'')+'</li>';}).join('')+'</ul>':'<p class="muted">還沒有數學練習紀錄</p>');
  html+='<button class="btn blue" id="test-voice-m" style="font-size:18px">🔊 測試數學語音（應唸「八加五等於多少？」「兩百零五」「三百一十八」）</button></div>';
  return html;}
function bindParents(){var b=$('test-voice-m');if(b)b.onclick=function(){sayQ(8,'+',5);setTimeout(function(){say(numIds(205),function(){setTimeout(function(){say(numIds(318));},300);});},2600);};}

window.ZYMath={init:function(api){API=api;},_start:function(id){startLevel(id);},get _sess(){return sess;},open:hub,parentsCard:parentsCard,bindParents:bindParents,totalStars:function(){return starsTotal()+campStars();},
  badges:function(){var m=M(),n=0;LEVELS.forEach(function(l){if((m.lv[l.id]||{}).stars===3)n++;});return n;},
  _t:{cn:cn,numIds:numIds,wordsOf:wordsOf,LEVELS:LEVELS,carries:carries,borrows:borrows,sceneFor:sceneFor,genAdd3:genAdd3,genSub3:genSub3,makeSet:makeSet,Player:Player,lessonPage:lessonPage,startLevel:startLevel,startCamp:startCamp,practiceList:practiceList,campList:campList,classroom:classroom,TXT:TXT,get sess(){return sess;},get camp(){return camp;}}};
})();
