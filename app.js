
// PWA bootstrap
window.addEventListener('load', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(console.error);
  }
});

// Warm up low-priority images after first render
window.addEventListener('load', () => {
  const lowPriorityImages = Array.from(document.querySelectorAll('img[loading="lazy"]'));
  const warm = () => lowPriorityImages.forEach(img => {
    if (!img.complete) {
      const src = img.getAttribute('src');
      if (src) {
        const pre = new Image();
        pre.decoding = 'async';
        pre.src = src;
      }
    }
  });
  if ('requestIdleCallback' in window) {
    requestIdleCallback(warm, { timeout: 1200 });
  } else {
    setTimeout(warm, 600);
  }
});



(function(){
const STAGE_W=2456, STAGE_H=3070, wrap=document.getElementById('wrap');
const yearEl=document.getElementById('year'), year20El=document.getElementById('year20'), yearTensEl=document.getElementById('yearTens'), yearOnesEl=document.getElementById('yearOnes'), moEl=document.getElementById('mo'), tgEl=document.getElementById('tg'), woEl=document.getElementById('wo'), sEl=document.getElementById('s'), mtEl=document.getElementById('mt'), cmEl=document.getElementById('cm'), chEl=document.getElementById('ch'), hEl=document.getElementById('h'), mEl=document.getElementById('m'), csEl=document.getElementById('cs');
const pushStartStop=document.getElementById('pushStartStop'), pushReset=document.getElementById('pushReset');
const SYNODIC_MONTH=29.530588853, REF_NEW_MOON_UTC_MS=Date.UTC(2000,0,6,18,14,0);
const MO_OFFSET = 98;
const MT_OFFSET = 30;
const chrono=(window.__iwcChrono=window.__iwcChrono||{state:'idle',elapsedMs:0,startPerf:0,lastFireTs:0});

const SHADOW_ENGINE={
  stageCenterX:STAGE_W/2,
  distanceRange:[14,34],
  blurRange:[3,5],
  opacityRange:[0.22,0.34],
  secondaryOffsetFactor:0.52,
  secondaryBlurFactor:1.65,
  secondaryOpacityFactor:0.50
};

const HAND_SHADOWS={
  h:{distance:18,baseDepth:10,lift:5,blur:3.2,opacity:0.25},
  m:{distance:24,baseDepth:12,lift:7,blur:3.6,opacity:0.28},
  cs:{distance:30,baseDepth:14,lift:9,blur:4.0,opacity:0.31}
};

function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
function round2(v){return Math.round(v*100)/100;}
function buildShadowFilter(dx,dy,blur,opacity){
  const dx2=dx*SHADOW_ENGINE.secondaryOffsetFactor;
  const dy2=dy*SHADOW_ENGINE.secondaryOffsetFactor;
  const blur2=blur*SHADOW_ENGINE.secondaryBlurFactor;
  const opacity2=opacity*SHADOW_ENGINE.secondaryOpacityFactor;
  return 'drop-shadow('+round2(dx)+'px '+round2(dy)+'px '+round2(blur)+'px rgba(0,0,0,'+round2(opacity)+')) '+
         'drop-shadow('+round2(dx2)+'px '+round2(dy2)+'px '+round2(blur2)+'px rgba(0,0,0,'+round2(opacity2)+'))';
}
function applyHandShadow(el,angleDeg,cfg){
  if(!el||!cfg) return;
  const left=parseFloat(el.style.left||el.offsetLeft||0);
  const width=parseFloat(el.style.width||el.offsetWidth||0);
  const handCenterX=left+(width/2);
  const stageBias=clamp((handCenterX-SHADOW_ENGINE.stageCenterX)/(STAGE_W/2),-1,1);
  const rad=angleDeg*Math.PI/180;
  const side=Math.sin(rad);
  const distance=clamp(cfg.distance,SHADOW_ENGINE.distanceRange[0],SHADOW_ENGINE.distanceRange[1]);
  const blur=clamp(cfg.blur,SHADOW_ENGINE.blurRange[0],SHADOW_ENGINE.blurRange[1]);
  const opacity=clamp(cfg.opacity,SHADOW_ENGINE.opacityRange[0],SHADOW_ENGINE.opacityRange[1]);
  const dx=(side*distance)+(stageBias*1.4);
  const liftFactor=((1-Math.cos(rad))*0.5)*cfg.lift;
  const dy=cfg.baseDepth+liftFactor+(Math.abs(side)*1.2);
  el.style.filter=buildShadowFilter(dx,dy,blur,opacity);
}

function fitStage(){
  const vv=window.visualViewport;
  const vw=vv?vv.width:window.innerWidth;
  const vh=vv?vv.height:window.innerHeight;
  const offsetLeft=vv?vv.offsetLeft:0;
  const offsetTop=vv?vv.offsetTop:0;
  const s=Math.min(vw/STAGE_W,vh/STAGE_H);
  wrap.style.transform='scale('+s+')';
  wrap.style.left=(offsetLeft+((vw-STAGE_W*s)/2))+'px';
  wrap.style.top=(offsetTop+((vh-STAGE_H*s)/2))+'px';
}
function moonAgeDays(nowMs){const days=(nowMs-REF_NEW_MOON_UTC_MS)/86400000; let age=days%SYNODIC_MONTH; if(age<0) age+=SYNODIC_MONTH; return age;}
function currentChronoElapsedMs(){if(chrono.state==='running') return chrono.elapsedMs+(performance.now()-chrono.startPerf); return chrono.elapsedMs;}
function dispatchChronoPush(kind){document.dispatchEvent(new CustomEvent('iwc-chrono-push',{detail:{kind:kind,state:chrono.state}}));}
function handleStartStop(){if(chrono.state==='idle'){chrono.state='running'; chrono.elapsedMs=0; chrono.startPerf=performance.now();} else if(chrono.state==='running'){chrono.elapsedMs=currentChronoElapsedMs(); chrono.state='stopped';} else if(chrono.state==='stopped'){chrono.startPerf=performance.now(); chrono.state='running';} dispatchChronoPush('startStop');}
function handleReset(){if(chrono.state==='idle'||chrono.state==='stopped'){chrono.elapsedMs=0; chrono.startPerf=performance.now(); chrono.state='idle'; dispatchChronoPush('reset');}}
function bindPush(el, handler){
  if(!el) return;
  let pointerTracking=false;
  let touchTracking=false;
  function blockEvent(e){e.preventDefault(); e.stopPropagation();}
  function fire(handlerName, e){
    const now=performance.now();
    if(now-chrono.lastFireTs<250){blockEvent(e); return;}
    chrono.lastFireTs=now;
    blockEvent(e);
    handler();
  }
  el.addEventListener('pointerdown', function(e){
    if(e.pointerType==='mouse' && e.button!==0) return;
    pointerTracking=true;
    blockEvent(e);
  }, true);
  el.addEventListener('pointerup', function(e){
    if(!pointerTracking) return;
    pointerTracking=false;
    fire('pointer', e);
  }, true);
  el.addEventListener('pointercancel', function(){pointerTracking=false;}, true);
  el.addEventListener('touchstart', function(e){touchTracking=true; blockEvent(e);}, {capture:true, passive:false});
  el.addEventListener('touchend', function(e){if(!touchTracking) return; touchTracking=false; fire('touch', e);}, {capture:true, passive:false});
  el.addEventListener('touchcancel', function(){touchTracking=false;}, {capture:true, passive:false});
  el.addEventListener('click', function(e){fire('click', e);}, true);
}
bindPush(pushStartStop, handleStartStop);
bindPush(pushReset, handleReset);
setTimeout(function(){ if(chrono.state==='idle'){ chrono.elapsedMs=0; chrono.startPerf=performance.now(); chrono.state='running'; } }, 2000);

function render(){
  const now=new Date();
  const nowMs=now.getTime();
  const ms=now.getMilliseconds(), sec=now.getSeconds()+ms/1000, min=now.getMinutes()+sec/60, hr=(now.getHours()%12)+min/60;
  const hDeg=hr*30, mDeg=min*6, sDeg=sec*6;

  const chronoMs=currentChronoElapsedMs(), chronoSec=(chronoMs/1000)%60, chronoMin=Math.floor(chronoMs/60000)%30, chronoHour=(chronoMs/3600000)%12;
  const csDeg=chronoSec*6, cmDeg=chronoMin*12, chDeg=chronoHour*30;

  const moonAge=moonAgeDays(nowMs), moDeg=(moonAge/SYNODIC_MONTH)*360 + MO_OFFSET;

  // REALISTIC JUMP MODE with TG fix
  const day = now.getDate();      // 1..31
  const weekday = now.getDay();   // 0..6
  const month0 = now.getMonth();  // 0..11

  // TG fix: remove old -1, show current day directly
  const tgDeg = (day / 31) * 360;
  const woDeg = (weekday / 7) * 360;
  const mtDeg = (month0 / 12) * 360 + MT_OFFSET;

  hEl.style.transform='rotate('+hDeg+'deg)';
  mEl.style.transform='rotate('+mDeg+'deg)';
  sEl.style.transform='rotate('+sDeg+'deg)';
  csEl.style.transform='rotate('+csDeg+'deg)';
  applyHandShadow(hEl,hDeg,HAND_SHADOWS.h);
  applyHandShadow(mEl,mDeg,HAND_SHADOWS.m);
  applyHandShadow(csEl,csDeg,HAND_SHADOWS.cs);
  cmEl.style.transform='rotate('+cmDeg+'deg)';
  chEl.style.transform='rotate('+chDeg+'deg)';
  moEl.style.transform='rotate('+moDeg+'deg)';
  tgEl.style.transform='rotate('+tgDeg+'deg)';
  woEl.style.transform='rotate('+woDeg+'deg)';
  mtEl.style.transform='rotate('+mtDeg+'deg)';
  const yStr=String(now.getFullYear()).padStart(4,'0');
  year20El.textContent=yStr.slice(0,2);
  yearTensEl.textContent=yStr.slice(2,3);
  yearOnesEl.textContent=yStr.slice(3,4);
  requestAnimationFrame(render);
}
window.addEventListener('resize', fitStage, {passive:true});
if(window.visualViewport){
  window.visualViewport.addEventListener('resize', fitStage, {passive:true});
  window.visualViewport.addEventListener('scroll', fitStage, {passive:true});
}
window.addEventListener('orientationchange', fitStage, {passive:true});
fitStage(); render();
})();



(function(){
  const tickSoftAudio = document.getElementById('tickSoftAudio');
  const tickLoudAudio = document.getElementById('tickLoudAudio');
  const chronoClickAudio = document.getElementById('chronoClickAudio');

  const SOFT_VOL = 1.2;
  const LOUD_VOL = 1.0;
  const FADE_MS = 250;

  [tickSoftAudio, tickLoudAudio].forEach(audio => {
    if (!audio) return;
    audio.volume = 0;
  });
  if (chronoClickAudio) chronoClickAudio.volume = 1.0;

  function safePlay(audio){
    if(!audio) return;
    try{
      const p = audio.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    }catch(e){}
  }

  function fadeAudio(audio, target){
    if(!audio) return;
    const startVol = Number(audio.volume || 0);
    const startTime = performance.now();
    function step(now){
      const t = Math.min((now - startTime) / FADE_MS, 1);
      audio.volume = startVol + (target - startVol) * t;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function syncTickMode(){
    const chrono = window.__iwcChrono || {state:"idle"};
    const running = (chrono.state === "running");
    if (running){
      fadeAudio(tickSoftAudio, 0);
      fadeAudio(tickLoudAudio, LOUD_VOL);
    } else {
      fadeAudio(tickSoftAudio, SOFT_VOL);
      fadeAudio(tickLoudAudio, 0);
    }
  }

  function startTickEngines(){
    safePlay(tickSoftAudio);
    safePlay(tickLoudAudio);
    syncTickMode();
  }

  function playChronoClick(){
    if(!chronoClickAudio) return;
    try{ chronoClickAudio.currentTime = 0; }catch(e){}
    safePlay(chronoClickAudio);
  }

  let tickAudioUnlocked = false;

  function unlockAudio(){
    if (tickAudioUnlocked) return;
    tickAudioUnlocked = true;

    // Desktop browsers often require looped audio to be started directly
    // inside the first real user gesture. Start both engines immediately,
    // muted/faded as before, then sync the intended mode right away.
    startTickEngines();
    requestAnimationFrame(syncTickMode);
    setTimeout(syncTickMode, 120);

    document.removeEventListener('touchstart', unlockAudio, true);
    document.removeEventListener('pointerdown', unlockAudio, true);
    document.removeEventListener('click', unlockAudio, true);
  }

  document.addEventListener('touchstart', unlockAudio, true);
  document.addEventListener('pointerdown', unlockAudio, true);
  document.addEventListener('click', unlockAudio, true);

  const startStop = document.getElementById('pushStartStop');
  const reset = document.getElementById('pushReset');

  document.addEventListener('iwc-chrono-push', function(){
    playChronoClick();
    setTimeout(syncTickMode, 30);
  }, true);

  setTimeout(function(){
    startTickEngines();
  }, 2000);
  setTimeout(syncTickMode, 2100);
})();



(function(){
  const hint = document.getElementById('chronoHint');
  const startStop = document.getElementById('pushStartStop');
  if(!hint || !startStop) return;

  let hidden = false;
  function hideHint(){
    if(hidden) return;
    hidden = true;
    hint.classList.remove('show');
  }
  function showHint(){
    if(hidden) return;
    hint.classList.add('show');
    setTimeout(hideHint, 8000);
  }

  // show when the chrono autostarts after 2 seconds
  setTimeout(showHint, 2000);

  // first real press on start/stop removes the hint immediately
  document.addEventListener('iwc-chrono-push', function(e){ if(e.detail && e.detail.kind==='startStop') hideHint(); }, true);
})();



(function(){
  function runSingle(el){
    if(!el) return;
    el.classList.remove("glint");
    void el.offsetWidth;
    el.classList.add("glint");
    setTimeout(function(){
      el.classList.remove("glint");
    },500);
  }

  function runDouble(el){
    if(!el) return;
    runSingle(el);
    setTimeout(function(){
      runSingle(el);
    },680);
  }

  function scheduleRandomDouble(el, baseMs, randomRangeMs){
    if(!el) return;
    function loop(){
      const offset = (Math.random() * randomRangeMs * 2) - randomRangeMs;
      const delay = Math.max(1200, baseMs + offset);
      setTimeout(function(){
        runDouble(el);
        loop();
      }, delay);
    }
    loop();
  }

  const z11 = document.getElementById("glintZ11");
  const z12 = document.getElementById("glintZ12");
  const z13 = document.getElementById("glintZ13");
  const z14 = document.getElementById("glintZ14");
  const z15 = document.getElementById("glintZ15");
  const z16 = document.getElementById("glintZ16");
  const z17 = document.getElementById("glintZ17");

  // ULTRA REAL GLINT ENGINE FULL Z11-Z17
  scheduleRandomDouble(z11, 8000, 1500);
  scheduleRandomDouble(z12, 5000, 1000);
  scheduleRandomDouble(z13, 7000, 1500);
  scheduleRandomDouble(z14, 6000, 1000);
  scheduleRandomDouble(z15, 4500, 900);
  scheduleRandomDouble(z16, 6500, 1100);
  scheduleRandomDouble(z17, 5500, 1000);
})();



(function(){
  const stage = document.querySelector('.stage');
  if(!stage) return;

  const MIN_SCALE = 1;
  const MAX_SCALE = 1.5;

  let scale = 1;
  let posX = 0;
  let posY = 0;

  let dragging = false;
  let startX = 0;
  let startY = 0;

  let pinchStartDist = 0;
  let pinchStartScale = 1;
  let touchMode = '';

  function applyTransform(){
    stage.style.transformOrigin = '50% 50%';
    stage.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
  }

  function clampPanZoom(v, minv, maxv){
    return Math.max(minv, Math.min(maxv, v));
  }

  function getDist(t1, t2){
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.hypot(dx, dy);
  }

  // Wheel zoom on PC: persistent, no snap-back
  window.addEventListener('wheel', function(e){
    // let page remain non-scrollable but zoom persist
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    scale = clamp(scale + delta, MIN_SCALE, MAX_SCALE);
    applyTransform();
  }, {passive:false, capture:true});

  // Mouse drag pan
  stage.addEventListener('pointerdown', function(e){
    if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
      dragging = true;
      startX = e.clientX - posX;
      startY = e.clientY - posY;
      try { stage.setPointerCapture(e.pointerId); } catch(_) {}
    }
  });

  stage.addEventListener('pointermove', function(e){
    if (!dragging) return;
    posX = e.clientX - startX;
    posY = e.clientY - startY;
    applyTransform();
  });

  function stopDrag(e){
    dragging = false;
    try { if (e && e.pointerId != null) stage.releasePointerCapture(e.pointerId); } catch(_) {}
  }
  stage.addEventListener('pointerup', stopDrag);
  stage.addEventListener('pointercancel', stopDrag);

  // Touch: one finger pan, two finger persistent pinch zoom
  stage.addEventListener('touchstart', function(e){
    if (e.touches.length === 1) {
      touchMode = 'pan';
      startX = e.touches[0].clientX - posX;
      startY = e.touches[0].clientY - posY;
    } else if (e.touches.length === 2) {
      touchMode = 'pinch';
      pinchStartDist = getDist(e.touches[0], e.touches[1]);
      pinchStartScale = scale;
    }
  }, {passive:true});

  stage.addEventListener('touchmove', function(e){
    if (e.touches.length === 1 && touchMode === 'pan') {
      posX = e.touches[0].clientX - startX;
      posY = e.touches[0].clientY - startY;
      applyTransform();
    } else if (e.touches.length === 2) {
      const dist = getDist(e.touches[0], e.touches[1]);
      if (!pinchStartDist) pinchStartDist = dist;
      scale = clamp(pinchStartScale * (dist / pinchStartDist), MIN_SCALE, MAX_SCALE);
      applyTransform();
      // prevent browser gesture bounce while preserving our scale state
      e.preventDefault();
    }
  }, {passive:false});

  stage.addEventListener('touchend', function(e){
    if (e.touches.length === 0) {
      touchMode = '';
    } else if (e.touches.length === 1) {
      touchMode = 'pan';
      startX = e.touches[0].clientX - posX;
      startY = e.touches[0].clientY - posY;
    }
    // intentionally NO reset / recenter / snap-back
  }, {passive:true});

  // Initial state
  applyTransform();
})();



try{
if(window.tickSoft){ tickSoft.volume = 1.0; }
if(window.tickLoud){ tickLoud.volume = 1.0; }
}catch(e){}



(function(){

const el = document.getElementById('glassSweep');
if(!el) return;

const sweepTime = 650;
const startX = -260;
const endX   = 1750;

let sweeping = false;
let sweepStart = 0;
let direction = 1;
let sweepToken = 0;

function startSweep(isMini = false){
  sweeping = true;
  sweepStart = performance.now();
  direction *= -1;
  sweepToken += 1;
  el.dataset.mini = isMini ? '1' : '0';
}

function triggerSweep(){
  startSweep(false);

  // ganz selten: kleiner zweiter Reflex
  if(Math.random() < 0.12){
    setTimeout(() => {
      startSweep(true);
    }, 320);
  }
}

function scheduleNext(){
  // meist um 6.2 s, etwas früher/später
  const next = 5800 + Math.random() * 900;

  setTimeout(() => {
    triggerSweep();
    scheduleNext();
  }, next);
}

scheduleNext();

function frame(now){

  if(sweeping){

    const t = now - sweepStart;

    if(t <= sweepTime){

      const p = t / sweepTime;
      const x = startX + (endX - startX) * p;

      let o = 0;
      if(p < .12) o = p/.12 * .45;
      else if(p < .35) o = .45 + (p-.12)/.23 * .55;
      else if(p < .60) o = 1 - (p-.35)/.25 * .65;
      else o = .35 - (p-.60)/.40 * .35;

      const angle = direction === 1 ? 22 : -22;
      const isMini = el.dataset.mini === '1';
      const opacityScale = isMini ? 0.58 : 1.0;
      const widthScale = isMini ? 0.86 : 1.0;

      el.style.transform =
        'translate3d(' + x.toFixed(1) + 'px,0,0) rotate(' + angle + 'deg) scaleX(' + widthScale + ')';

      el.style.opacity = Math.max(0, o * opacityScale).toFixed(3);

    }else{

      sweeping = false;
      el.style.opacity = 0;
      el.dataset.mini = '0';

    }

  }

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

})();
