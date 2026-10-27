(function(){
'use strict';
var d=document,$=function(s,r){return (r||d).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||d).querySelectorAll(s))};
// Formspree-klaar: vul hier het endpoint in (bv. 'https://formspree.io/f/xxxxxxx'). Leeg = mailto-fallback naar info@dheco.be
var FORM_ENDPOINT='';var MAIL='info@dheco.be';
d.documentElement.classList.add('js');
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

// preview-banner hoogte voor mobiel menu
var pv=$('.pv');if(pv)d.documentElement.style.setProperty('--pv',pv.offsetHeight+'px');

// reveal on scroll
if('IntersectionObserver' in window&&!reduce){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px',threshold:.06});
  $$('.rv').forEach(function(el){io.observe(el)});
}else $$('.rv').forEach(function(el){el.classList.add('in')});

// mobiel menu
var bg=$('.burger'),mn=$('.mnav');
if(bg&&mn){
  bg.addEventListener('click',function(){var o=!mn.classList.contains('open');mn.classList.toggle('open',o);bg.setAttribute('aria-expanded',o);d.body.style.overflow=o?'hidden':''});
  d.addEventListener('keydown',function(e){if(e.key==='Escape'&&mn.classList.contains('open'))bg.click()});
  $$('a',mn).forEach(function(a){a.addEventListener('click',function(){if(mn.classList.contains('open'))bg.click()})});
}
// dropdown (toetsenbord/touch)
$$('.dd>button').forEach(function(b){b.addEventListener('click',function(){var p=b.parentNode,o=!p.classList.contains('open');p.classList.toggle('open',o);b.setAttribute('aria-expanded',o)});});
d.addEventListener('click',function(e){$$('.dd.open').forEach(function(p){if(!p.contains(e.target)){p.classList.remove('open');$('button',p).setAttribute('aria-expanded','false')}})});

// open/gesloten (Europe/Brussels)
(function(){
  var p={};try{new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Brussels',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date()).forEach(function(x){p[x.type]=x.value})}catch(_){return}
  var wd=['Mon','Tue','Wed','Thu','Fri'].indexOf(p.weekday)>-1,m=(+p.hour)*60+(+p.minute),on=wd&&m>=480&&m<990;
  $$('[data-open]').forEach(function(el){el.classList.toggle('on',on);el.textContent=on?'Nu bereikbaar · ma–vr 8:00–16:30':'Nu gesloten · ma–vr 8:00–16:30'});
})();

// diensten-lijst: beeld wisselt bij hover/focus
(function(){
  var list=$('.svc-list');if(!list)return;
  var links=$$('a',list),imgs=$$('.svc-stage .ph');
  function set(i){links.forEach(function(a,k){a.classList.toggle('on',k===i)});imgs.forEach(function(m,k){m.classList.toggle('on',k===i)})}
  links.forEach(function(a,i){a.addEventListener('mouseenter',function(){set(i)});a.addEventListener('focus',function(){set(i)})});
  set(0);
  if(window.matchMedia('(min-width:981px)').matches){var pre=function(){$$('.svc-stage img').forEach(function(i){i.loading='eager'})};list.addEventListener('mouseenter',pre,{once:true});list.addEventListener('focusin',pre,{once:true})}
})();

// review slider
(function(){
  var st=$('.rev-stage');if(!st)return;
  var sl=$$('figure',st),i=0,cnt=$('.cnt'),pr=$('[data-rev=prev]'),nx=$('[data-rev=next]');
  function show(n){i=(n+sl.length)%sl.length;sl.forEach(function(s,k){var on=k===i;s.classList.toggle('on',on);s.setAttribute('aria-hidden',!on);s.inert=!on});if(cnt)cnt.textContent=('0'+(i+1)).slice(-2)+' / '+('0'+sl.length).slice(-2)}
  pr.addEventListener('click',function(){show(i-1)});nx.addEventListener('click',function(){show(i+1)});
  st.addEventListener('keydown',function(e){if(e.key==='ArrowRight')show(i+1);if(e.key==='ArrowLeft')show(i-1)});
  var x0=null;st.addEventListener('touchstart',function(e){x0=e.touches[0].clientX},{passive:true});
  st.addEventListener('touchend',function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>45)show(i+(dx<0?1:-1));x0=null});
  show(0);
})();

// formulier
$$('form.f').forEach(function(f){
  var ok=$('.thanks',f.parentNode);
  function bad(el,b){var w=el.closest('.fld');if(w)w.classList.toggle('bad',b)}
  f.addEventListener('submit',function(e){
    e.preventDefault();if(f.hp&&f.hp.value)return;
    var good=true;
    ['naam','email','dienst'].forEach(function(n){var el=f.elements[n];var v=el&&el.value.trim();var b=!v||(n==='email'&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v));bad(el,b);if(b)good=false});
    var c=f.elements.privacy;if(c&&!c.checked){good=false;$('.cerr',f).hidden=false}else if(c)$('.cerr',f).hidden=true;
    if(!good){var first=$('.fld.bad input,.fld.bad select',f)||$('.cerr:not([hidden])',f);if(first&&first.focus)first.focus();return}
    var fd=new FormData(f),body=['Naam: '+fd.get('naam'),'E-mail: '+fd.get('email'),'Telefoon: '+(fd.get('tel')||'-'),'Dienst: '+fd.get('dienst'),'','Toelichting:',fd.get('bericht')||'-'].join('\n');
    var done=function(sent){
      if(!sent){location.href='mailto:'+MAIL+'?subject='+encodeURIComponent('Offerte-aanvraag via nieuwe website')+'&body='+encodeURIComponent(body)}
      f.hidden=true;if(ok){ok.classList.add('on');ok.setAttribute('tabindex','-1');ok.focus()}
    };
    if(FORM_ENDPOINT){fetch(FORM_ENDPOINT,{method:'POST',headers:{'Accept':'application/json','Content-Type':'application/json'},body:JSON.stringify({_subject:'Offerte-aanvraag via nieuwe website',email:fd.get('email'),message:body})}).then(function(r){done(r.ok)}).catch(function(){done(false)})}
    else done(false);
  });
  $$('input,select,textarea',f).forEach(function(el){el.addEventListener('input',function(){bad(el,false)})});
});
// dienst voorselectie via ?dienst=
(function(){var s=$('select[name=dienst]');if(!s)return;var q=new URLSearchParams(location.search).get('dienst');if(q){$$('option',s).forEach(function(o){if(o.value.toLowerCase().indexOf(q.toLowerCase())===0)s.value=o.value})}})();
})();
