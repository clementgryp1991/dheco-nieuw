(function(){
'use strict';
var d=document,w=window,B=d.body,kind=B.getAttribute('data-hx');
var RM=w.matchMedia('(prefers-reduced-motion: reduce)').matches;
var clamp=function(v,a,b){return Math.max(a,Math.min(b,v))};
var $=function(s,r){return (r||d).querySelector(s)},$$=function(s,r){return [].slice.call((r||d).querySelectorAll(s))};
/* sticky CTA tonen na korte vertraging */
var fab=$('.fab'),bar=$('.bar');
setTimeout(function(){if(fab)fab.classList.add('show')},600);
/* scrollvoortgang 0..1 van een track met sticky binnenkant */
function trackP(el){var r=el.getBoundingClientRect(),h=el.offsetHeight-w.innerHeight+68;return h<=0?0:clamp(-r.top/h,0,1)}
function scrollToP(el,p){var h=el.offsetHeight-w.innerHeight+68;var top=el.getBoundingClientRect().top+w.scrollY+h*p;w.scrollTo({top:top,behavior:RM?'auto':'smooth'})}
/* gedeelde rAF-lerp */
function Smooth(get,apply,k){var cur=get(),run=false;function tick(){var t=get();cur+=(t-cur)*(RM?1:(k||.14));if(Math.abs(t-cur)<.0008)cur=t;apply(cur);if(cur!==t){requestAnimationFrame(tick)}else run=false}
 function kick(){if(!run){run=true;requestAnimationFrame(tick)}}
 apply(cur);w.addEventListener('scroll',kick,{passive:true});w.addEventListener('resize',kick);return {kick:kick,jump:function(v){cur=v;apply(cur)}}}

/* ===== A ===== */
if(kind==='a'){
 var tr=$('.hxA-track'),imgs=$$('.hxA-glass img'),tabs=$$('.hxA-tabs button'),cap=$('.hxA-cap span'),chip=$('.hxA-chip b'),prog=$('.hxA-prog'),glass=$('.hxA-glass'),sill=$('.hxA-frame');
 var caps=['Lente — het ochtendlicht valt binnen','Herfst — gouden uur, alles blijft warm','Winter — stilte en sterren, buiten'];
 var chips=['Lente · 09:30','Herfst · 18:45','Winter · 22:10'];
 var N=imgs.length,desk=w.matchMedia('(min-width:961px)'),cur=0,auto=null,manual=false,lastI=-1;
 function show(x){ // x in 0..N-1 (continu)
  imgs.forEach(function(im,i){var o=clamp(1-Math.abs(x-i),0,1);im.style.opacity=o;im.classList.toggle('on',o>=1)});
  var i=Math.round(x); if(i!==lastI){lastI=i;cap.textContent=caps[i];chip.textContent=chips[i];tabs.forEach(function(b,j){b.setAttribute('aria-pressed',j===i)})}
  glass.parentNode.style.setProperty('--rx',(x*40-30)+'%');
 }
 var sm=Smooth(function(){return desk.matches?trackP(tr)*(N-1):cur},function(v){show(v);if(prog)prog.style.setProperty('--p',v/(N-1))},.1);
 tabs.forEach(function(b,i){b.addEventListener('click',function(){manual=true;clearInterval(auto);if(desk.matches){scrollToP(tr,i/(N-1))}else{cur=i;sm.kick()}})});
 if(!desk.matches&&!RM){auto=setInterval(function(){if(manual)return;cur=(cur+1)%N;sm.kick()},4200)}
 desk.addEventListener&&desk.addEventListener('change',function(){sm.kick()});
 var ph=$('.hxA-win');
 ph.addEventListener('pointermove',function(e){if(RM||e.pointerType==='touch')return;var r=glass.getBoundingClientRect();var nx=(e.clientX-r.left)/r.width-.5,ny=(e.clientY-r.top)/r.height-.5;glass.style.setProperty('--px',(-nx*18)+'px');glass.style.setProperty('--py',(-ny*12)+'px');$$('img',glass).forEach(function(im){im.style.setProperty('--px',(-nx*18)+'px');im.style.setProperty('--py',(-ny*12)+'px')})});
 ph.addEventListener('pointerleave',function(){$$('img',glass).forEach(function(im){im.style.setProperty('--px','0px');im.style.setProperty('--py','0px')})});
}

/* ===== C: lens ===== */
if(kind==='c'){
 var st=$('.hxC-stage'),ringV=$('#cV'),ringN=$('#cN'),bar1=$('#cB'),ug=$('#cU'),lab=$('#cL');
 var W=1,H=1,tx=.5,ty=.55,x=.5,y=.55,r=0,tr_=0,t=0,tt=0,pointer=false,touching=false,t0=performance.now();
 function size(){var b=st.getBoundingClientRect();W=b.width;H=b.height}
 size();w.addEventListener('resize',size);
 function pos(e){var b=st.getBoundingClientRect();tx=clamp((e.clientX-b.left)/b.width,0,1);ty=clamp((e.clientY-b.top)/b.height,0,1)}
 st.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse'){pointer=true;pos(e)}});
 st.addEventListener('pointermove',function(e){if(e.pointerType==='mouse'||touching){pointer=true;pos(e)}});
 st.addEventListener('pointerleave',function(e){if(e.pointerType==='mouse')pointer=false});
 st.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse'){touching=true;pointer=true;pos(e);try{st.setPointerCapture(e.pointerId)}catch(_){}}});
 st.addEventListener('pointerup',function(e){if(e.pointerType!=='mouse'){touching=false;setTimeout(function(){if(!touching)pointer=false},1600)}});
 st.addEventListener('keydown',function(e){var s=.06;if(e.key==='ArrowLeft'){tx=clamp(tx-s,0,1)}else if(e.key==='ArrowRight'){tx=clamp(tx+s,0,1)}else if(e.key==='ArrowUp'){ty=clamp(ty-s,0,1)}else if(e.key==='ArrowDown'){ty=clamp(ty+s,0,1)}else return;pointer=true;e.preventDefault()});
 function frame(now){
  var s=(now-t0)/1000;
  if(!pointer){if(RM){tx=.5;ty=.55}else{tx=.5+Math.sin(s*.5)*.3;ty=.52+Math.cos(s*.37)*.12}}
  var base=Math.min(W,H*1.6)*.15+H*.2; var big=H*.52;
  tr_=pointer?big:(RM?big*.8:base+Math.sin(s*.9)*H*.05);
  tt=pointer?1:(tr_-H*.2)/(H*.34);
  var k=RM?1:.12; x+=(tx-x)*k;y+=(ty-y)*k;r+=(tr_-r)*k;t+=(clamp(tt,0,1)-t)*k;
  st.style.setProperty('--x',(x*100)+'%');st.style.setProperty('--y',(y*100)+'%');st.style.setProperty('--r',r.toFixed(1)+'px');
  var comfort=Math.round(58+36*t),u=(2.8-1.8*t);
  ringN.textContent=comfort;ringV.style.setProperty('--v',(comfort/100).toFixed(3));
  bar1.style.setProperty('--w',(82-58*t).toFixed(1));ug.textContent=u.toFixed(1).replace('.',',');
  requestAnimationFrame(frame)}
 requestAnimationFrame(frame);
}

/* ===== D ===== */
if(kind==='d'){
 var trd=$('.hxD-track'),scene=$('.hxD-scene'),btn=$('.hxD-open'),cta=$('.hxD-cta'),label=$('.hxD-open span'),hint=$('.hxD-hint');
 var smd=Smooth(function(){return Math.min(1,trackP(trd)/.78)},function(p){scene.style.setProperty('--p',p.toFixed(4));var o=p>.62;cta.classList.toggle('on',o);var opened=p>.5;btn.setAttribute('aria-pressed',opened);label.textContent=opened?'Sluit de deur':'Open de deur';if(hint)hint.style.opacity=p>.1?0:1;
  $('.hxD-cta .btn').tabIndex=o?0:-1},.12);
 btn.addEventListener('click',function(){var opened=btn.getAttribute('aria-pressed')==='true';scrollToP(trd,opened?0:.8)});
 // direct klikken op de deur opent ook
 $('.hxD-leaf').addEventListener('click',function(){scrollToP(trd,.8)});
}
})();
