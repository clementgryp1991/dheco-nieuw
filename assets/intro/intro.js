(function(){
var H=document.documentElement,el=document.getElementById('dxi');
document.addEventListener('click',function(e){if(e.target.closest('.dxi-again')){try{sessionStorage.removeItem('dxi')}catch(_){}scrollTo(0,0);location.reload()}});
if(!el||!H.classList.contains('dxi-on'))return;
var cv=el.querySelector('canvas'),cx=cv.getContext('2d'),copy=el.querySelector('.dxi-copy'),bar=el.querySelector('.dxi-bar'),
RM=matchMedia('(prefers-reduced-motion: reduce)').matches,M=innerWidth/innerHeight<1,N=73,
base=el.getAttribute('data-src')+(M?'m/':'d/'),fr=[],p=0,t=0,auto=0,done=0,last=performance.now(),idle;
function pad(i){return(i<10?'0':'')+i}
function fit(){var d=Math.min(devicePixelRatio||1,2);cv.width=innerWidth*d;cv.height=innerHeight*d;draw()}
function draw(){var f=Math.min(N-1,Math.round(Math.min(1,p/.78)*(N-1)));for(var k=f;k>=0&&!(fr[k]&&fr[k].complete&&fr[k].naturalWidth);k--);if(k<0)return;
var im=fr[k],W=cv.width,Hh=cv.height,s=Math.max(W/im.naturalWidth,Hh/im.naturalHeight),w=im.naturalWidth*s,h=im.naturalHeight*s;cx.drawImage(im,(W-w)/2,(Hh-h)/2,w,h)}
function load(i){var im=new Image();im.decoding='async';im.onload=function(){if(Math.abs(i-Math.round(Math.min(1,p/.78)*(N-1)))<3)draw()};im.src=base+pad(i+1)+'.webp';fr[i]=im}
function finish(){if(done)return;done=1;try{sessionStorage.setItem('dxi','1')}catch(_){}el.classList.add('out');setTimeout(function(){H.classList.remove('dxi-on');el.remove();var m=document.getElementById('main');m&&m.focus&&m.focus({preventScroll:true})},620)}
function nudge(d){if(done)return;t=Math.max(0,Math.min(1,t+d));kick()}
function kick(){clearTimeout(idle);idle=setTimeout(function(){auto=1},7000)}
el.querySelector('.dxi-skip').onclick=function(e){e.stopPropagation();finish()};
if(RM){var pi=el.querySelector('.dxi-p');el.addEventListener('click',finish);addEventListener('keydown',function(e){if(/Enter| |ArrowDown|PageDown/.test(e.key))finish()});setTimeout(finish,5000);return}
load(0);fit();addEventListener('resize',fit);
addEventListener('load',function(){for(var i=1;i<N;i++)load(i)});if(document.readyState==='complete')for(var i=1;i<N;i++)load(i);
addEventListener('wheel',function(e){e.preventDefault();nudge(e.deltaY/(e.deltaMode?30:1400))},{passive:false});
var ty=null;addEventListener('touchstart',function(e){ty=e.touches[0].clientY},{passive:true});
addEventListener('touchmove',function(e){if(ty==null)return;e.preventDefault();var y=e.touches[0].clientY;nudge((ty-y)/(innerHeight*.9));ty=y},{passive:false});
el.addEventListener('click',function(){auto=1});
addEventListener('keydown',function(e){if(done)return;if(e.key==='Escape')finish();else if(/ArrowDown|PageDown| |Enter/.test(e.key)){e.preventDefault();auto=1}});
kick();
(function loop(now){if(done)return;var dt=Math.min(.05,(now-last)/1000);last=now;
if(auto)t=Math.min(1,t+dt/4.2);p+=(t-p)*Math.min(1,dt*7);if(t>=1&&p>.995)p=1;
draw();var z=Math.max(0,(p-.72)/.28);cv.style.transform='scale('+(1+z*z*2.4)+')';
copy.style.opacity=Math.max(0,1-p*7);bar.style.width=(p*100)+'%';
if(p>=.93){finish();return}requestAnimationFrame(loop)})(last);
})();
