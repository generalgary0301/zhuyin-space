/* 爸爸測試模式（t48u）
 * ・小孩模式（預設）：依順序解鎖、照常記成績。
 * ・爸爸測試模式：輸入爸爸模式密碼（預設由家長設定，可在家長專區更改；畫面上不顯示）後，所有關卡、課程、考試、放映室都能直接打開。
 * ・沙盒：進入前先把小孩的進度存好；進入後這一頁「完全不寫入」儲存空間（作答、過關、星星、紀錄、不重複佇列、兌換都只在記憶體）。
 *   回到小孩模式＝重新載入頁面，從儲存空間讀回小孩原本的進度。重新整理或閒置 30 分鐘也會自動回到小孩模式。 */
(function(){
var API=null,ON=false,last=Date.now(),IDLE=30*60000,iv=null;
function $(id){return document.getElementById(id);}
function on(){return ON;}
function R(){return window.ZYReward.R();}
function pinOf(){var r=R();return r.dadPin||'1205';}
function topBtn(){var b=$('btn-dad');if(!b)return;
  b.innerHTML=ON?'<span>👦</span><small>小孩</small>':'<span>🔑</span><small>爸爸</small>';
  b.setAttribute('aria-label',ON?'回到小孩模式':'爸爸測試模式');b.classList.toggle('on',ON);}
function banner(){var d=$('dad-banner');if(!ON){if(d)d.remove();return;}
  if(!d){d=document.createElement('div');d.id='dad-banner';var tb=$('topbar');tb.parentNode.insertBefore(d,tb.nextSibling);}
  d.innerHTML='<span>🔑 <b>爸爸測試模式（不計成績）</b><small>全部解鎖・作答和兌換都不會存下來</small></span><button id="dad-exit">👦 回到小孩模式</button>';
  $('dad-exit').onclick=function(){exit('');};}
function enter(){if(ON)return;
  window.ZYReward._pin('進入爸爸測試模式',function(){
    try{API.save();}catch(e){}         // 先把小孩目前的進度存好
    ON=true;last=Date.now();document.body.classList.add('dad-mode');
    topBtn();banner();
    iv=setInterval(check,15000);
    API.toast('🔑 爸爸測試模式：全部解鎖、不計成績');API.base();
  },null,{sub:'請輸入爸爸模式密碼',check:function(v){return v===pinOf();},force:true});}
function exit(why){try{sessionStorage.setItem('zyDadBye',why||'back');}catch(e){}
  // 注意：ON 不改回 false，確保重新載入前（pagehide 等）也不會把測試資料寫進去
  location.reload();}
function playing(){try{var p=window.ZYReward._p&&window.ZYReward._p();return !!(p&&p.getPlayerState&&p.getPlayerState()===1);}catch(e){return false;}}
function check(){if(!ON)return;if(playing())last=Date.now();if(Date.now()-last>IDLE)exit('idle');}
['pointerdown','keydown','touchstart'].forEach(function(ev){document.addEventListener(ev,function(){last=Date.now();},true);});
document.addEventListener('visibilitychange',function(){if(!document.hidden)check();});
function init(api){API=api;topBtn();var b=$('btn-dad');if(b)b.onclick=function(){if(ON)exit('');else enter();};
  var bye=null;try{bye=sessionStorage.getItem('zyDadBye');sessionStorage.removeItem('zyDadBye');}catch(e){}
  if(bye)setTimeout(function(){API.toast(bye==='idle'?'⏰ 閒置 30 分鐘，已自動回到小孩模式':'👦 已回到小孩模式（測試資料沒有存下來）');},300);}
function parentsBlocked(){return '<h1>👨‍👦 家長專區</h1><div class="card dad-note"><h2>🔑 目前是爸爸測試模式</h2><p>測試模式裡的操作都不會存下來，所以家長專區（改設定、密碼、備份、重設進度）先暫停使用，避免把測試資料混進律恩的紀錄。</p><p class="muted">要改設定：先按「回到小孩模式」，再進家長專區輸入家長密碼。</p><button class="btn" id="dad-exit2">👦 回到小孩模式</button><button class="btn ghost" id="back">⬅ 回太空基地</button></div>';}
window.ZYDad={init:init,on:on,enter:enter,exit:exit,parentsBlocked:parentsBlocked,_idle:function(ms){IDLE=ms;},_check:check};
})();
