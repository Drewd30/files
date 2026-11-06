const KEYS=Object.keys(D),$=s=>document.querySelector(s),ST='mastery_blitz_v1',DUR=60;
const fmt=n=>n.toLocaleString('en-US');
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const elTm=$('#tm'),elBar=$('#bar'),elTmBox=$('#tmBox'),peekEl=$('#peek');
/* Saved progress: same key + same shape as before; malformed records are ignored instead of crashing the page. */
const okRec=r=>r&&typeof r==='object'&&Number.isFinite(+r.score);
let S=(()=>{let v=null;try{v=JSON.parse(localStorage.getItem(ST))}catch(e){}v=v&&typeof v==='object'?v:{};
  const sel=(Array.isArray(v.sel)?v.sel:[]).filter(k=>KEYS.includes(k));
  const best={};if(v.best&&typeof v.best==='object')for(const k in v.best)if(okRec(v.best[k]))best[k]=v.best[k];
  return{sel:sel.length?sel:[KEYS[0]],mode:typeof v.mode==='string'?v.mode:'60',sound:v.sound!==false,best,hist:(Array.isArray(v.hist)?v.hist:[]).filter(h=>okRec(h)&&typeof h.label==='string')}})();
const save=()=>{try{localStorage.setItem(ST,JSON.stringify(S))}catch(e){}};
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const selKey=()=>KEYS.filter(k=>S.sel.includes(k)).join('+');
const lk=k=>k[0]==='h'?k.slice(1)+'(ひらがな)':k;
const selLabel=()=>{const s=KEYS.filter(k=>S.sel.includes(k));return s.length===KEYS.length?'All lessons':s.length<=3?'Lessons '+s.map(lk).join(' + '):s.length+' lesson sets'};
const isK512=k=>+k.replace(/^h/,'').split('-')[0]<21;   // Kanji512 sets are 1-2 ... 19-20
/* pool item = [term, answer, type ('m' meaning | 'r' reading), group ('k' Kanji512 | 'v' N4Vocabs)] */
const getPool=()=>{const seen=new Set(),out=[];KEYS.filter(k=>S.sel.includes(k)).forEach(k=>{const t=k[0]==='h'?'r':'m',g=isK512(k)?'k':'v';D[k].forEach(p=>{const id=p[0]+t;if(!seen.has(id)){seen.add(id);out.push([p[0],p[1],t,g])}})});return out};
const show=id=>{['setup','play','result'].forEach(x=>$('#'+x).hidden=x!==id);if(id!=='setup')hidePeek()};

/* sound */
let ac=null;
const beep=(f,d,t='sine',v=.15,at=0)=>{if(!S.sound||!ac)return;const o=ac.createOscillator(),g=ac.createGain(),n=ac.currentTime+at;o.type=t;o.frequency.value=f;g.gain.setValueAtTime(v,n);g.gain.exponentialRampToValueAtTime(.001,n+d);o.connect(g).connect(ac.destination);o.start(n);o.stop(n+d)};
const sfx={ok:s=>{beep(660+Math.min(s,20)*25,.12,'triangle');beep(990+Math.min(s,20)*25,.12,'triangle',.07)},no:()=>beep(160,.28,'sawtooth',.12),end:()=>[523,659,784,1047].forEach((f,i)=>beep(f,.2,'triangle',.15,i*.12)),tick:()=>beep(880,.05,'square',.05)};

/* setup */
const PARTS=[['N4Vocabs',['27-28','29-30','31-32','33-34','35-36','37-38','39-40','41-42','43-44','45-46','47-48']],['N4Vocabs(ひらがな)',['h27-28','h29-30','h31-32','h33-34','h35-36','h37-38','h39-40','h41-42','h43-44','h45-46','h47-48']],['Kanji512',['1-2','3-4','5-6','7-8','9-10','11-12','13-14','15-16','17-18','19-20']],['Kanji512(ひらがな)',['h1-2','h3-4','h5-6','h7-8','h9-10','h11-12','h13-14','h15-16','h17-18','h19-20']]].map(([t,ks])=>[t,ks.filter(k=>KEYS.includes(k))]);
const MODES=[['60','60 Second Blitz',60,0,'Fixed 60 seconds. Answer as many as you can.','60 seconds'],['plus','+1 Second Blitz',60,1,'Starts at 60 seconds. Every correct answer adds 1 second.',''],['180','3 Minute Blitz',180,0,'Fixed 3 minutes.','3 minutes'],['300','5 Minute Blitz',300,0,'Fixed 5 minutes.','5 minutes']];
const mode=()=>MODES.find(m=>m[0]===S.mode)||MODES[0];
const modeShort=()=>({'60':'60s','plus':'+1s','180':'3 min','300':'5 min'})[mode()[0]];
const bestKey=()=>mode()[0]==='60'?selKey():mode()[0]+':'+selKey();
let chipEls=[],modeEls=[];
function buildSetup(){
  $('#chips').innerHTML=PARTS.map(([t,ks],i)=>`<div class="part"><span>${t}</span><span class="mini"><button class="link" data-p="${i}" data-act="all">Select all</button><button class="link" data-p="${i}" data-act="none">Clear all</button></span></div><div class="row">${ks.map(k=>`<button class="chip" data-k="${k}" aria-pressed="false">${k.replace(/^h/,'')}</button>`).join('')}</div>`).join('');
  $('#modes').innerHTML=MODES.map(m=>`<button class="chip" data-m="${m[0]}" aria-pressed="false">${m[1]}</button>`).join('');
  chipEls=[...document.querySelectorAll('#chips [data-k]')];modeEls=[...document.querySelectorAll('#modes [data-m]')];
}
function renderSetup(){
  const sel=new Set(S.sel),md=mode()[0];
  chipEls.forEach(c=>c.setAttribute('aria-pressed',sel.has(c.dataset.k)));
  modeEls.forEach(b=>b.setAttribute('aria-pressed',b.dataset.m===md));
  $('#modeNote').textContent=mode()[4];
  $('#sub').textContent=md==='plus'?'How long can you keep the clock alive? Every correct answer adds a second.':`How many kanji and words can you recognize in ${mode()[5]}?`;
  const b=S.best[bestKey()];
  $('#bestLbl').textContent=`Best (${selLabel()} · ${modeShort()}):`;
  $('#bestPts').textContent=b?fmt(b.score)+' pts':'—';
  $('#bestSub').textContent=b?`Top streak ${b.streak} · Most correct ${b.correct}`:'No record yet for this selection. Set your first one!';
  $('#start').disabled=!S.sel.length;
  $('#snd').textContent='Sound: '+(S.sound?'ON':'OFF');$('#snd').setAttribute('aria-pressed',S.sound);
  $('#hist').innerHTML=S.hist.map(h=>`<li><span>${esc(h.label)}</span><span><b>${fmt(+h.score)}</b> pts · ${+h.correct||0} ✓${h.avg?` · ${+h.avg}s avg`:''}</span></li>`).join('');
  $('#histWrap').hidden=!S.hist.length;
}
$('#chips').onclick=e=>{
  const a=e.target.closest('[data-act]');
  if(a){const ks=PARTS[+a.dataset.p][1];S.sel=a.dataset.act==='all'?[...new Set([...S.sel,...ks])]:S.sel.filter(k=>!ks.includes(k));save();renderSetup();return}
  const c=e.target.closest('[data-k]');if(!c)return;
  if(review){showPeek(c,e.detail===0);return}
  const k=c.dataset.k;S.sel=S.sel.includes(k)?S.sel.filter(x=>x!==k):[...S.sel,k];save();renderSetup()};
$('#modes').onclick=e=>{const c=e.target.closest('[data-m]');if(!c)return;S.mode=c.dataset.m;save();renderSetup()};
$('#snd').onclick=()=>{S.sound=!S.sound;save();renderSetup()};
$('#reset').onclick=()=>{if(confirm('Erase ALL personal bests and round history on this device?')){S.best={};S.hist=[];save();renderSetup()}};

/* ---------- Review mode ----------
   Button or R. Desktop (mouse): hover a lesson. Touch / small screens: tap a lesson (bottom sheet).
   Each row = Japanese term + reading + English meaning, joined from the quiz data by TERM inside the
   same lesson (27-28 <-> h27-28, 1-2 <-> h1-2). Repeated terms are paired by occurrence order. */
let review=false,peekT=0,peekKey='',kbd=false,refocus=false;
const mqHover=matchMedia('(hover: hover) and (pointer: fine)'),mqSheet=matchMedia('(hover: none), (max-width: 650px)');
const hoverMode=()=>mqHover.matches&&!mqSheet.matches;
const KANA_ONLY=/^[\u3041-\u309F\u30A0-\u30FF\u30FC\u30FB\s]+$/,GAP='—';
const toHira=s=>s.replace(/[\u30A1-\u30F6]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60));
function buildReview(pair){
  const rd=new Map(),used=new Map();
  (D['h'+pair]||[]).forEach(([t,r])=>{if(!rd.has(t))rd.set(t,[]);rd.get(t).push(r)});
  const rows=(D[pair]||[]).map(([t,m])=>{
    const n=used.get(t)||0;used.set(t,n+1);const r=(rd.get(t)||[])[n];
    if(r!==undefined)return{t,r,m};
    return KANA_ONLY.test(t)?{t,r:toHira(t),m}:{t,r:GAP,m,rgap:1};   // kana-only term is its own reading; anything else -> placeholder
  });
  rd.forEach((list,t)=>{for(let i=used.get(t)||0;i<list.length;i++)rows.push({t,r:list[i],m:GAP,mgap:1})});   // reading with no English meaning
  return rows;
}
const peekCache=new Map();
function peekHTML(k){
  if(peekCache.has(k))return peekCache.get(k);
  const rows=buildReview(k.replace(/^h/,'')),
  html=`<h3><span class="peek-heading" id="peekTitle">Lesson ${esc(lk(k))} <span>${rows.length} words</span></span><button type="button" class="peek-close" aria-label="Close lesson review" title="Close">×</button></h3><ul style="--c1:${(Math.min(6,Math.max(...rows.map(r=>[...r.t].length)))*1.3).toFixed(1)}rem"><li class="rv-head" aria-hidden="true"><span>日本語</span><span>ひらがな</span><span>英語の意味</span></li>${rows.map(r=>`<li><span class="kanji" lang="ja">${esc(r.t)}</span><span class="rd${r.rgap?' gap':''}" lang="ja">${esc(r.r)}</span><span class="en${r.mgap?' gap':''}">${esc(r.m)}</span></li>`).join('')}</ul>`;
  peekCache.set(k,html);return html;
}
function renderReviewHint(){
  const btn=$('#reviewBtn');
  btn.textContent=review?'📖 Review: ON':'📖 Review: OFF';
  btn.setAttribute('aria-pressed',String(review));
  $('#rvHint').textContent=review?'Review is on: hover (desktop) or tap a lesson to preview its words. Tap Review again to select lessons. (R also works)':'Tap Review to preview any lesson’s words, or press R.';
  chipEls.forEach(c=>review?c.setAttribute('aria-haspopup','dialog'):c.removeAttribute('aria-haspopup'));
}
function toggleReview(){review=!review;renderReviewHint();hidePeek()}
$('#reviewBtn').onclick=toggleReview;
function placePeek(chip){
  if(mqSheet.matches){peekEl.style.left=peekEl.style.top='';return}
  const r=chip.getBoundingClientRect(),w=peekEl.offsetWidth,h=peekEl.offsetHeight,vw=innerWidth,vh=innerHeight;
  let left=Math.min(Math.max(12,r.left),Math.max(12,vw-w-12)),top=r.bottom+8;
  if(r.right+w+20<vw){left=r.right+10;top=r.top}            // beside the chip so it never covers it
  else if(r.left-w-20>0){left=r.left-w-10;top=r.top}
  else if(top+h>vh-12)top=r.top-h-8;
  top=Math.max(12,Math.min(top,vh-h-12));
  peekEl.style.left=left+'px';peekEl.style.top=top+'px';
}
function showPeek(chip,focusClose){
  if(!review||$('#setup').hidden)return;
  clearTimeout(peekT);
  const k=chip.dataset.k,wasHidden=peekEl.hidden;
  if(peekKey!==k||wasHidden){peekEl.innerHTML=peekHTML(k);peekKey=k}
  peekEl.setAttribute('aria-labelledby','peekTitle');
  peekEl.hidden=false;if(wasHidden||peekKey===k)peekEl.scrollTop=0;
  placePeek(chip);
  if(focusClose)peekEl.querySelector('.peek-close').focus({preventScroll:true});
}
function hidePeek(){
  clearTimeout(peekT);if(peekEl.hidden)return;
  const back=peekEl.contains(document.activeElement);peekEl.hidden=true;
  if(back){const c=chipEls.find(x=>x.dataset.k===peekKey);if(c){refocus=true;c.focus({preventScroll:true});refocus=false}}
}
const hideSoon=()=>{clearTimeout(peekT);peekT=setTimeout(hidePeek,220)};
const chipOf=e=>e.target.closest&&e.target.closest('#chips [data-k]');
$('#chips').addEventListener('mouseover',e=>{if(!hoverMode())return;const c=chipOf(e);if(c)showPeek(c)});
$('#chips').addEventListener('mouseout',e=>{if(hoverMode()&&chipOf(e))hideSoon()});
$('#chips').addEventListener('focusin',e=>{const c=chipOf(e);if(c&&kbd&&!refocus)showPeek(c)});
$('#chips').addEventListener('focusout',e=>{if(kbd&&!(e.relatedTarget&&(peekEl.contains(e.relatedTarget)||chipOf({target:e.relatedTarget}))))hideSoon()});
peekEl.addEventListener('click',e=>{if(e.target.closest('.peek-close'))hidePeek()});
peekEl.addEventListener('mouseenter',()=>clearTimeout(peekT));
peekEl.addEventListener('mouseleave',()=>{if(hoverMode())hideSoon()});
document.addEventListener('pointerdown',e=>{kbd=false;if(!peekEl.hidden&&!e.target.closest('#peek')&&!e.target.closest('#chips [data-k]'))hidePeek()},true);
addEventListener('scroll',()=>{if(!peekEl.hidden&&!mqSheet.matches)hidePeek()},{passive:true});   // anchored popup would drift away from its chip
addEventListener('resize',()=>{if(!peekEl.hidden&&!mqSheet.matches)hidePeek()});
mqSheet.addEventListener('change',hidePeek);

/* round */
let R=null;
const mult=n=>n>=15?3:n>=10?2:n>=5?1.5:1;
function start(){
  if(!S.sel.length)return;
  try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();ac.resume&&ac.resume()}catch(e){}
  const pool=getPool();
  if(R&&R.timer)clearInterval(R.timer);const m=mode();
  R={pool,bag:[],last:null,q:null,score:0,streak:0,maxStreak:0,ok:0,bad:0,miss:[],rts:[],qStart:performance.now(),locked:false,over:false,paused:false,total:m[2],bonus:m[3],mm:m[0]!=='60',end:performance.now()+m[2]*1000,tick:0};
  $('#pause').hidden=true;
  show('play');$('#sc').textContent='0';updateStreak();nextQ();
  R.timer=setInterval(tickFn,100);tickFn();
}
function tickFn(){
  const left=Math.max(0,R.end-performance.now()),s=Math.ceil(left/1000);
  elTm.textContent=R.mm?Math.floor(s/60)+':'+String(s%60).padStart(2,'0'):s;elBar.style.transform=`scaleX(${Math.min(1,left/(R.total*1000))})`;
  elTmBox.classList.toggle('low',s<=10);
  if(s<=5&&s!==R.tick&&left>0){R.tick=s;sfx.tick()}
  if(left<=0)finish();
}
function updateStreak(){const m=mult(R.streak);const el=$('#stk');el.textContent=R.streak?`🔥 ${R.streak} · ×${m}`:'Streak 0';el.classList.toggle('hot',R.streak>=5)}
function nextQ(){
  if(!R.bag.length)R.bag=shuffle(R.pool.slice());
  let q=R.bag.pop();
  if(q[0]===R.last&&R.bag.length){const t=R.bag.pop();R.bag.unshift(q);q=t}
  R.last=q[0];R.q=q;R.qStart=performance.now();
  const seen=new Set([q[1]]),wrong=[],L=q[1].length;
  /* distractors come from the same kind (meaning/reading) AND same dataset first, so Kanji512's "on ／ kun" format never gives the answer away */
  const same=shuffle(R.pool.filter(p=>p[2]===q[2]&&p[3]===q[3])),other=shuffle(R.pool.filter(p=>p[2]===q[2]&&p[3]!==q[3]));
  if(q[2]==='r')same.sort((a,b)=>Math.abs(a[1].length-L)-Math.abs(b[1].length-L));
  for(const p of same.concat(other)){if(!seen.has(p[1])){seen.add(p[1]);wrong.push(p[1]);if(wrong.length===3)break}}
  const opts=shuffle([q[1],...wrong]);
  $('#k').textContent=q[0];$('.ask').textContent=q[2]==='r'?'How is it read?':'What does it mean?';$('#k').classList.toggle('long',q[0].length>4);
  $('#opts').innerHTML=opts.map((o,i)=>`<button class="opt${q[2]==='r'?' kana':''}" data-a="${o.replace(/"/g,'&quot;')}"><kbd>${i+1}</kbd><span>${o.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</span></button>`).join('');
  R.locked=false;
}
function answer(btn){
  if(!R||R.over||R.paused||R.locked)return;R.locked=true;
  const q=R.q,pick=btn.dataset.a,right=pick===q[1];R.rts.push((performance.now()-R.qStart)/1000);
  document.querySelectorAll('.opt').forEach(b=>{b.disabled=true;if(b.dataset.a===q[1])b.classList.add('good')});
  const pop=$('#pop');pop.classList.remove('show');void pop.offsetWidth;
  if(right){
    R.ok++;if(R.bonus){R.end+=1000;const tp=$('#tpop');tp.classList.remove('show');void tp.offsetWidth;tp.classList.add('show')}R.streak++;R.maxStreak=Math.max(R.maxStreak,R.streak);
    const pts=Math.round(100*mult(R.streak));R.score+=pts;
    $('#sc').textContent=fmt(R.score);pop.textContent='+'+pts;pop.style.color='';pop.classList.add('show');sfx.ok(R.streak);
  }else{
    R.bad++;R.streak=0;btn.classList.add('bad');R.miss.push([q[0],q[1],pick]);sfx.no();
    pop.textContent='Streak lost';pop.style.color='var(--bad)';pop.classList.add('show');
  }
  updateStreak();
  setTimeout(()=>{if(R&&!R.over)nextQ()},60);
}
$('#opts').onclick=e=>{const b=e.target.closest('.opt');if(b)answer(b)};
document.addEventListener('keydown',e=>{
  kbd=true;
  if(!$('#play').hidden){
    if(e.key==='Escape'){e.preventDefault();if(R&&R.paused)resume();else pause();return}
    if(R&&R.paused)return;
    const i='1234'.indexOf(e.key);if(i>=0){const b=document.querySelectorAll('.opt')[i];if(b)answer(b)}
  }else if(!$('#setup').hidden){
    if((e.key==='r'||e.key==='R')&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();if(!e.repeat)toggleReview()}
    else if(e.key==='Escape'&&!peekEl.hidden){e.preventDefault();hidePeek()}
    else if(e.key==='Enter'&&document.activeElement===document.body)start();
  }
});
$('#quit').onclick=()=>finish();
function pause(){if(!R||R.over||R.paused)return;R.paused=true;R.pausedAt=performance.now();R.left=Math.max(0,R.end-performance.now());clearInterval(R.timer);$('#pause').hidden=false;$('#resume').focus()}
function resume(){if(!R||R.over||!R.paused)return;R.paused=false;R.qStart+=performance.now()-R.pausedAt;R.end=performance.now()+R.left;R.timer=setInterval(tickFn,100);$('#pause').hidden=true;tickFn()}
$('#pz').onclick=pause;$('#resume').onclick=resume;
$('#restart').onclick=()=>{$('#pause').hidden=true;start()};
$('#home').onclick=()=>{if(R){R.over=true;clearInterval(R.timer)}R=null;$('#pause').hidden=true;renderSetup();show('setup')};
function finish(){
  if(!R||R.over)return;R.over=true;clearInterval(R.timer);sfx.end();
  const avg=R.rts.length?R.rts.reduce((a,b)=>a+b,0)/R.rts.length:null,avgTxt=avg===null?'—':avg.toFixed(1)+'s';
  const key=bestKey(),prev=S.best[key],total=R.ok+R.bad,acc=total?Math.round(R.ok/total*100):0;
  const isNew=R.score>0&&R.score>(prev?prev.score:0);
  S.best[key]={score:Math.max(R.score,prev?prev.score:0),streak:Math.max(R.maxStreak,prev?prev.streak:0),correct:Math.max(R.ok,prev?prev.correct:0),date:Date.now()};
  S.hist=[{label:selLabel()+' · '+modeShort(),score:R.score,correct:R.ok,avg:avg===null?null:+avg.toFixed(1)},...S.hist].slice(0,6);save();
  $('#nb').innerHTML=isNew?'<span class="newbest">🏆 NEW PERSONAL BEST!</span>':'';
  $('#rs').textContent=fmt(R.score);
  $('#rl').textContent=isNew?(prev?`Previous best: ${fmt(prev.score)} pts`:'First record for this selection'):`Your best: ${fmt(S.best[key].score)} pts · ${selLabel()}`;
  $('#rstats').innerHTML=[['Correct',R.ok],['Missed',R.bad],['Accuracy',acc+'%'],['Best streak',R.maxStreak],['Avg time',avgTxt]].map(([a,b])=>`<div><b>${b}</b><small>${a}</small></div>`).join('');
  const seen=new Set(),m=R.miss.filter(p=>!seen.has(p[0])&&seen.add(p[0]));
  $('#miss').innerHTML=m.map(p=>`<li><span class="kanji" lang="ja">${esc(p[0])}</span><span><b>${esc(p[1])}</b><br><small>You chose: ${esc(p[2])}</small></span></li>`).join('');
  $('#missWrap').hidden=!m.length;$('#missTitle').textContent='Review wrong answers ('+m.length+')';
  show('result');window.scrollTo(0,0);
}
$('#again').onclick=start;$('#start').onclick=start;
$('#back').onclick=()=>{renderSetup();show('setup')};
buildSetup();renderSetup();renderReviewHint();
