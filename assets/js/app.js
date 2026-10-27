(function(){
'use strict';
var d=document,$=function(s,r){return (r||d).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||d).querySelectorAll(s))};
// Formspree-klaar: vul hier het endpoint in (bv. 'https://formspree.io/f/xxxxxxx'). Leeg = mailto-demo naar info@dheco.be
var FORM_ENDPOINT='';var MAIL='info@dheco.be';
var root=d.documentElement;root.classList.add('js');
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var vh=window.innerHeight;

// preview-banner hoogte voor mobiel menu
var pv=$('.pv');if(pv)root.style.setProperty('--pv',pv.offsetHeight+'px');

// reveal on scroll (tekst + beelden)
if('IntersectionObserver' in window&&!reduce){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px',threshold:.06});
  $$('.rv').forEach(function(el){io.observe(el)});
  var io3=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){(e.target._rvi||[]).forEach(function(x){x.classList.add('in')});io3.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px',threshold:.06});
  var cand=$$('main .ph, .ftr .ph').filter(function(el){
    if(el.closest('.svc-stage')||el.closest('.hero-fig'))return false;
    var r=el.getBoundingClientRect();return !(r.top<vh*.9&&r.bottom>0);
  });
  cand.forEach(function(el){
    el.classList.add('rvi');
    // clip-path op het element zelf blokkeert IntersectionObserver: observeer een zichtbare ouder
    var par=el.parentNode;while(par&&par!==d.body&&!par.offsetHeight)par=par.parentNode;
    (par._rvi=par._rvi||[]).push(el);io3.observe(par);
  });
}else $$('.rv').forEach(function(el){el.classList.add('in')});

// header: krimpt bij scrollen + voortgangsbalk
var hdr=$('.hdr'),ticking=false;
function onScroll(){
  ticking=false;var y=window.pageYOffset||0;
  if(hdr){hdr.classList.toggle('sm',y>24);var h=root.scrollHeight-vh;hdr.style.setProperty('--sp',h>0?Math.min(1,y/h).toFixed(4):0)}
  if(fab)fab.classList.toggle('show',y>700&&!inForm);
  if(bar)bar.classList.toggle('off',inForm||menuOpen);
}
// sticky CTA's: verberg bij formulier / cta-band in beeld
var fab=$('[data-fab]'),bar=$('[data-bar]'),inForm=false,menuOpen=false,seen=[];
if('IntersectionObserver' in window&&(fab||bar)){
  var io2=new IntersectionObserver(function(es){es.forEach(function(e){var i=seen.indexOf(e.target);if(e.isIntersecting&&i<0)seen.push(e.target);if(!e.isIntersecting&&i>-1)seen.splice(i,1)});inForm=seen.length>0;onScroll()});
  $$('#offerte,[data-cta]').forEach(function(el){io2.observe(el)});
}
window.addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(onScroll)}},{passive:true});
window.addEventListener('resize',function(){vh=window.innerHeight;onScroll()});
onScroll();

// mobiel menu
var bg=$('.burger'),mn=$('.mnav');
if(bg&&mn){
  var setMenu=function(o){mn.classList.toggle('open',o);bg.setAttribute('aria-expanded',o);bg.setAttribute('aria-label',o?'Menu sluiten':'Menu openen');d.body.style.overflow=o?'hidden':'';menuOpen=o;onScroll();if(o){var a=$('a',mn);a&&setTimeout(function(){a.focus()},60)}else bg.focus()};
  bg.addEventListener('click',function(){setMenu(!mn.classList.contains('open'))});
  d.addEventListener('keydown',function(e){if(e.key==='Escape'&&mn.classList.contains('open'))setMenu(false)});
  $$('a',mn).forEach(function(a){a.addEventListener('click',function(){if(mn.classList.contains('open')){mn.classList.remove('open');bg.setAttribute('aria-expanded','false');bg.setAttribute('aria-label','Menu openen');d.body.style.overflow='';menuOpen=false}})});
  window.matchMedia('(min-width:1021px)').addEventListener&&window.matchMedia('(min-width:1021px)').addEventListener('change',function(m){if(m.matches&&mn.classList.contains('open'))setMenu(false)});
}
// dropdown (toetsenbord/touch)
function closeDD(p){p.classList.remove('open');var b=$('button',p);b&&b.setAttribute('aria-expanded','false')}
$$('.dd>button').forEach(function(b){b.addEventListener('click',function(){var p=b.parentNode,o=!p.classList.contains('open');p.classList.toggle('open',o);b.setAttribute('aria-expanded',o)});});
d.addEventListener('click',function(e){$$('.dd.open').forEach(function(p){if(!p.contains(e.target))closeDD(p)})});
d.addEventListener('keydown',function(e){if(e.key==='Escape')$$('.dd.open').forEach(function(p){closeDD(p);var b=$('button',p);b&&b.focus()})});

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
  var sl=$$('figure',st),i=0,cnt=$('.cnt'),pr=$('[data-rev=prev]'),nx=$('[data-rev=next]'),gos=$$('[data-rev-go]');
  function show(n){i=(n+sl.length)%sl.length;sl.forEach(function(s,k){var on=k===i;s.classList.toggle('on',on);s.setAttribute('aria-hidden',!on);s.inert=!on});gos.forEach(function(g,k){if(k===i)g.setAttribute('aria-current','true');else g.removeAttribute('aria-current')});if(cnt)cnt.textContent=('0'+(i+1)).slice(-2)+' / '+('0'+sl.length).slice(-2)}
  pr.addEventListener('click',function(){show(i-1)});nx.addEventListener('click',function(){show(i+1)});
  gos.forEach(function(g){g.addEventListener('click',function(){show(+g.getAttribute('data-rev-go'))})});
  st.addEventListener('keydown',function(e){if(e.key==='ArrowRight')show(i+1);if(e.key==='ArrowLeft')show(i-1)});
  var x0=null;st.addEventListener('touchstart',function(e){x0=e.touches[0].clientX},{passive:true});
  st.addEventListener('touchend',function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>45)show(i+(dx<0?1:-1));x0=null});
  show(0);
})();

// formulier
$$('form.f').forEach(function(f){
  var box=f.parentNode,ok=$('.thanks',box),btn=$('button[type=submit]',f),prog=$('.fprog i',f),progT=$('[data-prog]',f);
  var fileIn=f.elements.files,fileList=$('.files',f),fileErr=$('[data-file-e]',f),drop=$('.drop',f),files=[];
  var MAXF=5,MAXMB=10,TYPES=/^(image\/|application\/pdf)/;
  var RULES={
    naam:function(v){return v.trim().length>1},
    email:function(v){return /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v.trim())},
    dienst:function(v){return !!v},
    tel:function(v){return !v.trim()||(v.replace(/\D/g,'').length>=8&&/^[+()\d\s./-]+$/.test(v.trim()))},
    postcode:function(v){return !v.trim()||/^[1-9]\d{3}$/.test(v.trim())}
  };
  var REQ=['naam','email','dienst'];
  function wrap(el){return el.closest('.fld')}
  function check(el,show){
    var n=el.name,rule=RULES[n];if(!rule)return true;var v=el.value,good=rule(v),w=wrap(el);
    if(show){
      if(n==='postcode'){var h=$('[data-pc-hint]',f);h.textContent=good?'Dheco is actief in West- en Oost-Vlaanderen.':'Een Belgische postcode heeft 4 cijfers.';h.style.color=good?'':'#b3261e'}
      else if(w)w.classList.toggle('bad',!good);
      el.setAttribute('aria-invalid',good?'false':'true');
      if(w)w.classList.toggle('ok',good&&!!v.trim()&&n!=='postcode'&&n!=='tel');
    }
    return good;
  }
  function progress(){
    var n=0;REQ.forEach(function(k){if(RULES[k](f.elements[k].value))n++});if(f.elements.privacy.checked)n++;
    if(prog)prog.style.transform='scaleX('+(n/4)+')';if(progT)progT.textContent=n===4?'Klaar om te versturen':n+' van 4 ingevuld';
  }
  ['naam','email','tel','postcode','dienst'].forEach(function(k){
    var el=f.elements[k];if(!el)return;var touched=false;
    el.addEventListener('blur',function(){touched=true;if(el.value||k==='dienst'||REQ.indexOf(k)>-1)check(el,!(k==='dienst'&&!el.value&&!touched))});
    el.addEventListener('input',function(){if(touched||wrap(el).classList.contains('bad'))check(el,true);progress()});
    el.addEventListener('change',function(){touched=true;check(el,true);progress()});
  });
  f.elements.privacy.addEventListener('change',function(){if(this.checked)$('.cerr',f).hidden=true;progress()});

  // bestanden
  function syncFiles(){
    try{var dt=new DataTransfer();files.forEach(function(x){dt.items.add(x)});fileIn.files=dt.files}catch(_){}
    fileList.innerHTML='';
    files.forEach(function(x,i){var li=d.createElement('li'),s=d.createElement('span'),b=d.createElement('button');s.textContent=x.name+' · '+(x.size/1048576<.1?Math.max(1,Math.round(x.size/1024))+' kB':(x.size/1048576).toFixed(1)+' MB');b.type='button';b.textContent='Verwijder';b.setAttribute('aria-label',x.name+' verwijderen');b.addEventListener('click',function(){files.splice(i,1);syncFiles()});li.appendChild(s);li.appendChild(b);fileList.appendChild(li)});
  }
  function addFiles(list){
    var bad=false;Array.prototype.forEach.call(list,function(x){if(files.length>=MAXF||x.size>MAXMB*1048576||!TYPES.test(x.type)){bad=true;return}if(!files.some(function(y){return y.name===x.name&&y.size===x.size}))files.push(x)});
    fileErr.style.display=bad?'block':'none';syncFiles();
  }
  if(fileIn){
    fileIn.addEventListener('change',function(){addFiles(fileIn.files)});
    if(drop){['dragenter','dragover'].forEach(function(t){drop.addEventListener(t,function(e){e.preventDefault();drop.classList.add('over')})});['dragleave','drop'].forEach(function(t){drop.addEventListener(t,function(e){e.preventDefault();drop.classList.remove('over');if(t==='drop'&&e.dataTransfer)addFiles(e.dataTransfer.files)})})}
  }

  f.addEventListener('submit',function(e){
    e.preventDefault();if(f.hp&&f.hp.value)return;
    var good=true,first=null;
    ['naam','email','dienst','tel','postcode'].forEach(function(k){var el=f.elements[k];var g=check(el,true);if(!g){good=false;if(!first)first=el}});
    var c=f.elements.privacy,ce=$('.cerr',f);
    if(!c.checked){good=false;ce.hidden=false;if(!first)first=c}else ce.hidden=true;
    if(!good){first&&first.focus();return}
    var fd=new FormData(f),nm=(fd.get('naam')||'').trim(),first1=nm.split(/\s+/)[0];
    var lines=['Naam: '+nm,'E-mail: '+fd.get('email'),'Telefoon: '+(fd.get('tel')||'-'),'Postcode: '+(fd.get('postcode')||'-'),'Dienst: '+fd.get('dienst'),'Premie-info gewenst: '+(fd.get('premie')?'ja':'nee'),'','Toelichting:',fd.get('bericht')||'-'];
    if(files.length)lines.push('','Bijlagen (voeg ze toe aan deze e-mail): '+files.map(function(x){return x.name}).join(', '));
    var body=lines.join('\n');
    var sum=[fd.get('dienst'),fd.get('postcode')?'postcode '+fd.get('postcode'):'',files.length?files.length+' bijlage'+(files.length>1?'n':''):''].filter(Boolean).join(' · ');
    var done=function(sent){
      btn.classList.remove('busy');btn.disabled=false;
      if(!sent){location.href='mailto:'+MAIL+'?subject='+encodeURIComponent('Offerte-aanvraag via nieuwe website')+'&body='+encodeURIComponent(body)}
      var h=$('[data-t-h]',ok),p=$('[data-t-p]',ok),s=$('[data-sum]',ok);
      if(h)h.textContent=sent?'Bedankt'+(first1?', '+first1:'')+'. Je aanvraag is verstuurd.':'Bijna klaar'+(first1?', '+first1:'')+'.';
      if(p)p.textContent=sent?'We hebben je aanvraag ontvangen en nemen zo snel mogelijk contact met je op.':'Je mailprogramma is geopend met een voorbereide e-mail. Verstuur die om je aanvraag af te ronden'+(files.length?' en voeg je bijlagen toe':'')+'. (Demo van de preview: bij livegang wordt dit rechtstreeks verstuurd.)';
      if(s)s.textContent='Je aanvraag: '+sum;
      f.hidden=true;if(ok){ok.classList.add('on');ok.setAttribute('tabindex','-1');ok.focus();ok.scrollIntoView({block:'center',behavior:reduce?'auto':'smooth'})}
    };
    if(FORM_ENDPOINT){
      btn.classList.add('busy');btn.disabled=true;
      var opts=files.length?{method:'POST',headers:{'Accept':'application/json'},body:fd}:{method:'POST',headers:{'Accept':'application/json','Content-Type':'application/json'},body:JSON.stringify({_subject:'Offerte-aanvraag via nieuwe website',email:fd.get('email'),message:body})};
      fetch(FORM_ENDPOINT,opts).then(function(r){done(r.ok)}).catch(function(){done(false)});
    }else done(false);
  });
  progress();
});

// voorselecties via ?dienst= en ?premie=1
(function(){
  var q=new URLSearchParams(location.search),s=$('select[name=dienst]'),dq=q.get('dienst');
  if(s&&dq){$$('option',s).forEach(function(o){if(o.value.toLowerCase().indexOf(dq.toLowerCase())===0){s.value=o.value;s.dispatchEvent(new Event('change'))}})}
  var pc=$('input[name=premie]');if(pc&&q.get('premie')==='1')pc.checked=true;
})();
})();
