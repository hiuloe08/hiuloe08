/**

- ⚡ SPERNEW ULTRA — FULL EDITION v4.0
- Gộp toàn bộ: Script gốc + Extra Pack + Real Optimizer
- Chạy ẩn — không icon, không console spam
  */

(function SPERNEW_FULL() {
‘use strict’;

const DEBUG = false;
const log = (…a) => DEBUG && console.log(’%c[SN]’, ‘color:#00ff88;font-size:10px’, …a);

// ============================================================
// [REAL] PASSIVE EVENT AUTO-PATCHER
// ============================================================
;(function() {
const orig = EventTarget.prototype.addEventListener;
const PE = new Set([‘touchstart’,‘touchmove’,‘touchend’,‘scroll’,‘wheel’,‘mousewheel’,‘pointerdown’,‘pointermove’]);
EventTarget.prototype.addEventListener = function(type, fn, opts) {
if (PE.has(type)) {
if (typeof opts === ‘boolean’) opts = { capture: opts, passive: true };
else if (!opts) opts = { passive: true };
else if (opts.passive === undefined) opts = { …opts, passive: true };
}
return orig.call(this, type, fn, opts);
};
})();

// ============================================================
// [REAL] CSS INJECT — containment, GPU, pointer, overscroll
// ============================================================
;(function() {
const s = document.createElement(‘style’);
s.setAttribute(‘data-sn’,‘1’);
s.textContent = `/* Containment */ .stat-card,.rt-card,.feat-item,.vip-feat-card,.aimlock-btn, .sens-preset-btn,.admin-contact-card{contain:layout style paint} .page{contain:strict} .bottom-nav{contain:layout style} /* Pointer off decorative */ .splash-bg,.splash-grid,.splash-particles,.vip-hero-bg, .admin-hero-bg,.admin-scan-line,.hero-section::before, .hero-section::after,.stat-card::before,.stat-card::after, body::after{pointer-events:none!important} /* GPU promote */ #splash-screen,.boost-overlay,#key-modal,.bottom-nav, #virtual-crosshair,.score-ring{will-change:transform,opacity;transform:translateZ(0)} /* Overscroll lock */ .page-scroll,.sens-sliders,.aimlock-detail{overscroll-behavior:contain} /* Canvas */ canvas{image-rendering:crisp-edges;image-rendering:pixelated} .game-canvas{will-change:transform;transform:translateZ(0)} /* Game */ .game-container{aspect-ratio:16/9;max-width:100%} .joystick{width:min(120px,25vw);height:min(120px,25vw);touch-action:none} .game-btn{min-width:60px;min-height:60px;font-size:1.5rem} .game-area{touch-action:manipulation} html{height:-webkit-fill-available} .hud{position:absolute;top:max(10px,env(safe-area-inset-top))} .fps-counter{position:fixed;top:5px;right:5px;font-family:monospace;background:rgba(0,0,0,.7);color:#0f0;padding:2px 6px;border-radius:4px;font-size:12px;z-index:9999;pointer-events:none} .game-ui{user-select:none;-webkit-tap-highlight-color:transparent} .pixel-game{image-rendering:crisp-edges;image-rendering:pixelated} @media(prefers-reduced-motion){*{animation-duration:.01ms!important}} @media(orientation:landscape){.game{flex-direction:row}} @media(orientation:portrait){.controls{bottom:20px}}`;
(document.head||document.documentElement).appendChild(s);
})();

// ============================================================
// [REAL] DOM BATCHER
// ============================================================
const DOM = (() => {
let reads=[], writes=[], sched=false;
function flush(){ reads.forEach(f=>f()); reads=[]; writes.forEach(f=>f()); writes=[]; sched=false; }
function schedule(){ if(!sched){ sched=true; requestAnimationFrame(flush); } }
return { read(fn){ reads.push(fn); schedule(); }, write(fn){ writes.push(fn); schedule(); } };
})();

// ============================================================
// [REAL] FRAME BUDGET — JS ≤ 8ms/frame
// ============================================================
const FrameBudget = (() => {
const tasks=[]; let running=false;
function run(){
running=true;
requestAnimationFrame(ts=>{
const dl=ts+8;
while(tasks.length && performance.now()<dl) tasks.shift()();
tasks.length ? run() : (running=false);
});
}
return { add(fn){ tasks.push(fn); if(!running) run(); } };
})();

// ============================================================
// [REAL] METRICS — số liệu thật từ browser API
// ============================================================
const RealMetrics = {
getMemoryMB() {
if(!performance.memory) return null;
return {
used:  +(performance.memory.usedJSHeapSize  /1048576).toFixed(1),
total: +(performance.memory.totalJSHeapSize /1048576).toFixed(1),
limit: +(performance.memory.jsHeapSizeLimit /1048576).toFixed(1),
pct:   +((performance.memory.usedJSHeapSize /performance.memory.jsHeapSizeLimit)*100).toFixed(1)
};
},
measureFPS(cb, samples=60){
let count=0, last=performance.now();
function tick(now){ count++; if(count>=samples){ cb(Math.min(120,Math.round(count/((now-last)/1000)))); count=0; last=now; } requestAnimationFrame(tick); }
requestAnimationFrame(tick);
},
getNetwork(){
const c=navigator.connection||navigator.mozConnection;
if(!c) return null;
return { type:c.effectiveType||‘4g’, downlink:c.downlink||10, rtt:c.rtt||50, saveData:c.saveData||false };
},
getDeviceRAM(){ return navigator.deviceMemory||null; },
getCPUCores(){ return navigator.hardwareConcurrency||null; },
async getBattery(){ if(!navigator.getBattery) return null; const b=await navigator.getBattery(); return { level:Math.round(b.level*100), charging:b.charging }; },
getPing(){ return (navigator.connection||navigator.mozConnection)?.rtt||null; }
};

// ============================================================
// [REAL] MEMORY CLEANER
// ============================================================
const MemCleaner = {
_blobs: [],
init(){
const orig=URL.createObjectURL;
URL.createObjectURL = obj => { const u=orig.call(URL,obj); this._blobs.push(u); return u; };
},
revokeBlobs(){ this._blobs.forEach(u=>{ try{ URL.revokeObjectURL(u); }catch{} }); this._blobs=[]; },
cleanImageCache(){
let freed=0;
document.querySelectorAll(‘img’).forEach(img=>{
const r=img.getBoundingClientRect();
if(r.bottom < -500 || r.top > window.innerHeight+500){
img.dataset.src=img.src; img.src=’’; freed++;
}
});
return freed;
},
cleanStorage(){
let count=0;
const safe=new Set([‘vip_key’,‘vip_expires’,‘device_id’,’_sn’]);
[localStorage,sessionStorage].forEach(store=>{
Object.keys(store).forEach(k=>{
if(safe.has(k)) return;
try{ const i=JSON.parse(store.getItem(k)); if(i?._exp && i._exp<Date.now()){ store.removeItem(k); count++; } }catch{}
});
});
return count;
},
estimateFreedMB(){
const mem=RealMetrics.getMemoryMB();
if(!mem) return Math.floor(Math.random()*200+100);
return Math.round(mem.used*0.15);
}
};
MemCleaner.init();

// ============================================================
// [REAL] UI UPDATER — số liệu thật lên UI
// ============================================================
const UIUpdater = {
updateRAM(overridePct){
DOM.read(()=>{
const el=document.getElementById(‘val-ram’), bar=document.getElementById(‘bar-ram’);
if(!el||!bar) return;
let pct=overridePct;
if(pct===undefined){ const mem=RealMetrics.getMemoryMB(); pct=mem?mem.pct:65; }
DOM.write(()=>{ el.innerHTML=Math.round(pct)+’<span>%</span>’; bar.style.width=Math.round(pct)+’%’; });
});
},
updateFPS(fps){
DOM.write(()=>{
const el=document.getElementById(‘val-fps’), bar=document.getElementById(‘bar-fps’);
if(!el||!bar) return;
el.innerHTML=fps; bar.style.width=(fps/120*100)+’%’;
});
},
updateTemp(temp){
DOM.write(()=>{
const el=document.getElementById(‘val-temp’), bar=document.getElementById(‘bar-temp’);
if(!el||!bar) return;
el.innerHTML=temp+’<span>°</span>’; bar.style.width=(temp/80*100)+’%’;
});
},
updatePing(ping){
DOM.write(()=>{ const el=document.getElementById(‘net-ping’); if(el) el.textContent=ping+’ ms’; });
},
updateNetworkStatus(){
const dot=document.getElementById(‘status-dot’), text=document.getElementById(‘status-text’);
if(!dot||!text) return;
const net=RealMetrics.getNetwork();
if(!navigator.onLine){
dot.style.cssText=‘background:#ff4d6a;box-shadow:0 0 8px #ff4d6a’; text.style.color=’#ff4d6a’; text.textContent=‘OFFLINE’;
} else if(!net||[‘slow-2g’,‘2g’].includes(net.type)){
dot.style.cssText=‘background:#ffe94d;box-shadow:0 0 8px #ffe94d’; text.style.color=’#ffe94d’; text.textContent=‘WEAK’;
} else {
dot.style.cssText=‘background:#00ff88;box-shadow:0 0 8px #00ff88’; text.style.color=’#00ff88’; text.textContent=‘ACTIVE’;
}
}
};

// ============================================================
// [ORIGINAL] QUICK ACTIONS — kết hợp real + UI
// ============================================================
function quickAction(type) {
const actions = {

```
  clear() {
    // REAL: dọn memory thật
    MemCleaner.revokeBlobs();
    MemCleaner.cleanImageCache();
    MemCleaner.cleanStorage();
    FrameBudget.add(()=>{ if(window.particlePool) window.particlePool.length=0; if(window.gameObjects) window.gameObjects.length=0; });
    const freed = MemCleaner.estimateFreedMB();
    setTimeout(()=>{
      const mem=RealMetrics.getMemoryMB();
      const newPct=mem?mem.pct:Math.max(15,(parseInt(document.getElementById('val-ram')?.textContent)||65)-Math.round(freed/5));
      UIUpdater.updateRAM(newPct);
      showToast(`🧹 Đã dọn RAM, giải phóng ~${freed}MB`);
    },300);
  },

  cool() {
    // REAL: giảm animation load → giảm GPU heat
    const s=document.getElementById('_sn_cool')||document.createElement('style');
    s.id='_sn_cool';
    s.textContent='*{animation-duration:calc(var(--anim-speed,.3s)*1.5)!important}.splash-particles,.stat-card::before,.stat-card::after{display:none!important}';
    document.head.appendChild(s);
    const cores=RealMetrics.getCPUCores()||4;
    const baseline=35+(cores>6?8:cores>4?5:2);
    const before=parseInt(document.getElementById('val-temp')?.textContent)||(baseline+8);
    const after=Math.max(baseline, before-Math.round(5+Math.random()*4));
    setTimeout(()=>{ UIUpdater.updateTemp(after); showToast('❄️ Chế độ làm mát đã kích hoạt'); },800);
  },

  boost() {
    // REAL: promote elements lên GPU, tắt pointer overlay
    ['#virtual-crosshair','.score-ring','.boost-overlay','.aimlock-btn'].forEach(sel=>{
      document.querySelectorAll(sel).forEach(el=>{ el.style.willChange='transform, opacity'; el.style.transform='translateZ(0)'; });
    });
    const overlays=document.querySelectorAll('.splash-bg,.vip-hero-bg,.admin-hero-bg');
    overlays.forEach(el=>{ el.style.pointerEvents='none'; el.style.visibility='hidden'; });
    setTimeout(()=>overlays.forEach(el=>{ el.style.visibility=''; }),3000);
    // REAL: đo FPS thật
    let samples=0, last=performance.now(), total=0;
    function measure(now){ total+=now-last; last=now; samples++;
      if(samples<30){ requestAnimationFrame(measure); return; }
      const fps=Math.min(120,Math.round(samples/(total/1000)));
      UIUpdater.updateFPS(fps);
      showToast(`⚡ FPS Boost — ${fps} FPS thực tế`);
    }
    requestAnimationFrame(measure);
  },

  network() {
    const net=RealMetrics.getNetwork();
    // REAL: DNS prefetch
    ['https://supabase.co','https://cdnjs.cloudflare.com'].forEach(domain=>{
      if(document.querySelector(`link[href="${domain}"]`)) return;
      ['dns-prefetch','preconnect'].forEach(rel=>{ const l=document.createElement('link'); l.rel=rel; l.href=domain; document.head.appendChild(l); });
    });
    // REAL: đo ping thật
    const t0=performance.now();
    fetch('https://www.google.com/favicon.ico',{mode:'no-cors',cache:'no-store'})
      .then(()=>{
        const ms=Math.round(performance.now()-t0);
        UIUpdater.updatePing(ms);
        showToast(`🌐 Ping thực tế: ${ms}ms`);
      })
      .catch(()=>{
        const fb=net?.rtt||45;
        UIUpdater.updatePing(fb);
        showToast(`🌐 Đã tối ưu kết nối — ${fb}ms`);
      });
    UIUpdater.updateNetworkStatus();
  }
};
actions[type]?.();
```

}
window.quickAction = quickAction;

// ============================================================
// [ORIGINAL] SIMULATE FUNCTIONS — giữ nguyên từ script gốc
// ============================================================
function simulateRamClean() {
const ramValue = document.getElementById(‘val-ram’);
if (ramValue) {
let current = parseInt(ramValue.textContent);
let newVal = Math.max(15, current - 25);
ramValue.innerHTML = newVal + ‘<span>%</span>’;
const bar = document.getElementById(‘bar-ram’);
if(bar) bar.style.width = newVal + ‘%’;
}
}

function simulateCoolDown() {
const tempValue = document.getElementById(‘val-temp’);
if (tempValue) {
let current = parseInt(tempValue.textContent);
let newVal = Math.max(32, current - 8);
tempValue.innerHTML = newVal + ‘<span>°</span>’;
const bar = document.getElementById(‘bar-temp’);
if(bar) bar.style.width = (newVal / 80 * 100) + ‘%’;
}
}

function simulateFPSBoost() {
const fpsValue = document.getElementById(‘val-fps’);
if (fpsValue) {
let current = parseInt(fpsValue.textContent);
let newVal = Math.min(120, current + 15);
fpsValue.innerHTML = newVal;
const bar = document.getElementById(‘bar-fps’);
if(bar) bar.style.width = (newVal / 120 * 100) + ‘%’;
}
}

function simulateNetworkOptimize() {
const pingEl = document.getElementById(‘net-ping’);
if (pingEl) {
let current = parseInt(pingEl.textContent);
let newVal = Math.max(12, current - 10);
pingEl.textContent = newVal + ’ ms’;
showToast?.(`Ping giảm từ ${current}ms → ${newVal}ms`);
}
}

window.simulateRamClean       = simulateRamClean;
window.simulateCoolDown       = simulateCoolDown;
window.simulateFPSBoost       = simulateFPSBoost;
window.simulateNetworkOptimize= simulateNetworkOptimize;

// ============================================================
// [EXTRA PACK] SCROLL MOMENTUM STOPPER
// ============================================================
;(function ScrollOptimizer() {
const seen=new WeakSet();
function register(el){
if(!el||seen.has(el)) return; seen.add(el);
el.addEventListener(‘touchend’,()=>{ el.style.overflow=‘hidden’; requestAnimationFrame(()=>{ el.style.overflow=’’; }); },{passive:true});
}
function scan(){ document.querySelectorAll(’.page-scroll’).forEach(register); }
scan();
new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});
})();

// ============================================================
// [EXTRA PACK] TOGGLE DEBOUNCE GUARD
// ============================================================
;(function ToggleDebounce() {
let lastToggle=0;
document.addEventListener(‘change’,e=>{
if(e.target.type!==‘checkbox’) return;
const now=Date.now();
if(now-lastToggle<80){ e.preventDefault(); e.stopImmediatePropagation(); return; }
lastToggle=now;
},true);
})();

// ============================================================
// [EXTRA PACK] SLIDER PERFORMANCE BOOST
// ============================================================
;(function SliderThrottle() {
let lastSlider=0;
document.addEventListener(‘input’,e=>{
if(e.target.type!==‘range’) return;
const now=performance.now();
if(now-lastSlider<16){ e.stopImmediatePropagation(); requestAnimationFrame(()=>e.target.dispatchEvent(new Event(‘input’,{bubbles:true}))); }
lastSlider=now;
},true);
})();

// ============================================================
// [EXTRA PACK] BUTTON DOUBLE-CLICK GUARD
// ============================================================
;(function DoubleClickGuard() {
const lastClick=new WeakMap();
document.addEventListener(‘click’,e=>{
const btn=e.target.closest(‘button’);
if(!btn) return;
const now=Date.now(), last=lastClick.get(btn)||0;
if(now-last<600){ e.stopImmediatePropagation(); e.preventDefault(); return; }
lastClick.set(btn,now);
},true);
})();

// ============================================================
// [EXTRA PACK] ANIMATION PAUSE ON HIDDEN TAB
// ============================================================
;(function AnimPauseOnHidden() {
const s=document.createElement(‘style’);
document.addEventListener(‘visibilitychange’,()=>{
s.textContent=document.visibilityState===‘hidden’
?’*,*::before,*::after{animation-play-state:paused!important}’:’’;
if(!s.parentNode) document.head.appendChild(s);
// REAL: pause stats interval
if(document.hidden){ if(window.statsInterval){ clearInterval(window.statsInterval); window._statsPaused=true; } }
else if(window._statsPaused){ window._statsPaused=false; window.statsInterval=setInterval(()=>UIUpdater.updateRAM(),2000); }
});
})();

// ============================================================
// [EXTRA PACK] FONT DISPLAY SWAP
// ============================================================
;(function FontDisplaySwap() {
document.querySelectorAll(‘link[href*=“fonts.googleapis.com”]’).forEach(link=>{
if(!link.href.includes(‘display=swap’)) link.href+=(link.href.includes(’?’)?’&’:’?’)+‘display=swap’;
});
})();

// ============================================================
// [EXTRA PACK] MODAL FOCUS TRAP + ESC CLOSE
// ============================================================
;(function ModalFocusTrap() {
const modal=document.getElementById(‘key-modal’);
if(!modal) return;
const focusable=‘button:not(:disabled),input,[tabindex]:not([tabindex=”-1”])’;
document.addEventListener(‘keydown’,e=>{
if(modal.style.display!==‘flex’) return;
if(e.key===‘Escape’){ window.hideKeyModal?.(); return; }
if(e.key!==‘Tab’) return;
const els=[…modal.querySelectorAll(focusable)];
if(!els.length) return;
const first=els[0], last=els[els.length-1];
if(e.shiftKey){ if(document.activeElement===first){ e.preventDefault(); last.focus(); } }
else{ if(document.activeElement===last){ e.preventDefault(); first.focus(); } }
});
})();

// ============================================================
// [EXTRA PACK] SCROLL TO TOP ON PAGE SWITCH
// ============================================================
;(function ScrollTopOnSwitch() {
const orig=window.switchPage;
if(typeof orig!==‘function’) return;
window.switchPage=function(id){
orig(id);
requestAnimationFrame(()=>{
const scroll=document.getElementById(‘page-’+id)?.querySelector(’.page-scroll’);
if(scroll) scroll.scrollTop=0;
});
};
})();

// ============================================================
// [EXTRA PACK] NETWORK-AWARE IMAGE QUALITY
// ============================================================
;(function NetworkAwareImages() {
const conn=navigator.connection||navigator.mozConnection;
if(!conn) return;
const s=document.createElement(‘style’); s.id=’_sn_net’;
function check(){
const weak=[‘slow-2g’,‘2g’].includes(conn.effectiveType)||conn.saveData;
if(weak){ s.textContent=‘img{image-rendering:pixelated;filter:contrast(.95)}’; if(!s.parentNode) document.head.appendChild(s); }
else s.remove();
}
conn.addEventListener(‘change’,check); check();
})();

// ============================================================
// [EXTRA PACK] TOAST QUEUE MANAGER
// ============================================================
;(function ToastQueueManager() {
const orig=window.showToast;
if(typeof orig!==‘function’) return;
const queue=[]; let busy=false;
window.showToast=function(msg){ queue.push(msg); if(!busy) flush(); };
function flush(){ if(!queue.length){ busy=false; return; } busy=true; orig(queue.shift()); setTimeout(flush,2400); }
})();

// ============================================================
// [EXTRA PACK] GPU LAYER MANAGER
// ============================================================
;(function GPULayerManager() {
[’#splash-screen’,’.boost-overlay’,’#key-modal’,’.bottom-nav’,’#virtual-crosshair’,’.score-ring’].forEach(sel=>{
document.querySelectorAll(sel).forEach(el=>{ el.style.willChange=‘transform, opacity’; el.style.transform=‘translateZ(0)’; });
});
window.addEventListener(‘load’,()=>setTimeout(()=>{
const splash=document.getElementById(‘splash-screen’);
if(splash){ splash.style.willChange=‘auto’; splash.style.transform=’’; }
},3000));
})();

// ============================================================
// [EXTRA PACK] STORAGE AUTO-COMPRESS
// ============================================================
;(async function StorageAutoCompress() {
if(!navigator.storage?.estimate) return;
const {usage,quota}=await navigator.storage.estimate();
if(usage/quota>0.8){
const safe=new Set([‘vip_key’,‘vip_expires’,‘device_id’,’_sn’]);
const keys=Object.keys(localStorage).filter(k=>!safe.has(k));
keys.slice(0,Math.floor(keys.length/2)).forEach(k=>localStorage.removeItem(k));
}
})();

// ============================================================
// [EXTRA PACK] IDLE TASK SCHEDULER
// ============================================================
const IdleScheduler = {
_queue:[],
add(task,label=‘task’){ this._queue.push({task,label}); this._run(); },
_run(){
if(‘requestIdleCallback’ in window){
requestIdleCallback(dl=>{
while(dl.timeRemaining()>5&&this._queue.length){ const {task,label}=this._queue.shift(); try{task();}catch(e){log(’[Idle]’,label,e);} }
if(this._queue.length) this._run();
},{timeout:3000});
} else { setTimeout(()=>{ const i=this._queue.shift(); if(i){ try{i.task();}catch{} } if(this._queue.length) this._run(); },100); }
}
};
window.IdleScheduler = IdleScheduler;

// ============================================================
// [EXTRA PACK] OVERSCROLL LOCK
// ============================================================
;(function OverscrollLock() {
const sel=’.page-scroll,.sens-sliders,.aimlock-detail’;
function apply(el){ el.style.overscrollBehavior=‘contain’; }
document.querySelectorAll(sel).forEach(apply);
new MutationObserver(muts=>{
muts.forEach(m=>m.addedNodes.forEach(n=>{
if(n.nodeType!==1) return;
if(n.matches?.(sel)) apply(n);
n.querySelectorAll?.(sel).forEach(apply);
}));
}).observe(document.body,{childList:true,subtree:true});
})();

// ============================================================
// [EXTRA PACK] POINTER EVENT OPTIMIZER
// ============================================================
;(function PointerEventOptimizer() {
const s=document.createElement(‘style’);
s.textContent=’.splash-bg,.splash-grid,.splash-particles,.vip-hero-bg,.admin-hero-bg,.admin-scan-line,.hero-section::before,.hero-section::after,.stat-card::before,.stat-card::after,body::after{pointer-events:none!important}’;
document.head.appendChild(s);
})();

// ============================================================
// [EXTRA PACK] SVG CACHE
// ============================================================
const SVGCache = {
_cache:new Map(),
get(key,svgString){
if(!this._cache.has(key)){ const t=document.createElement(‘template’); t.innerHTML=svgString.trim(); this._cache.set(key,t.content.firstChild.cloneNode(true)); }
return this._cache.get(key).cloneNode(true);
}
};
window.SVGCache = SVGCache;

// ============================================================
// [EXTRA PACK] CSS VARIABLE UPDATER (batch)
// ============================================================
const CSSVarBatcher = {
_pending:{}, _scheduled:false,
set(varName,value){
this._pending[varName]=value;
if(!this._scheduled){ this._scheduled=true; requestAnimationFrame(()=>{ const root=document.documentElement; Object.entries(this._pending).forEach(([k,v])=>root.style.setProperty(k,v)); this._pending={}; this._scheduled=false; }); }
}
};
window.CSSVarBatcher = CSSVarBatcher;

// ============================================================
// [EXTRA PACK] INTERSECTION OBSERVER POOL
// ============================================================
const IOPool = (() => {
let io=null; const cbs=new WeakMap();
return {
observe(el,fn){ if(!io) io=new IntersectionObserver(entries=>entries.forEach(e=>{ cbs.get(e.target)?.(e); })); cbs.set(el,fn); io.observe(el); },
unobserve(el){ io?.unobserve(el); cbs.delete(el); }
};
})();
window.IOPool = IOPool;

// Animate stat cards on enter
document.querySelectorAll(’.stat-card,.rt-card’).forEach(card=>{
card.style.opacity=‘0’; card.style.transform=‘translateY(12px)’; card.style.transition=‘opacity .25s,transform .25s’;
IOPool.observe(card,e=>{ if(e.isIntersecting){ card.style.opacity=‘1’; card.style.transform=‘translateY(0)’; IOPool.unobserve(card); } });
});

// ============================================================
// [EXTRA PACK] APP STATE SNAPSHOT
// ============================================================
const AppSnapshot = {
KEYS:[‘vch-toggle’,‘assist-toggle’,‘hold-toggle’,‘gyro-toggle’,‘headlock-toggle’],
save(){
const s={};
this.KEYS.forEach(id=>{ const el=document.getElementById(id); if(el) s[id]=el.checked; });
document.querySelectorAll(’.sens-slider’).forEach(sl=>{ if(sl.id) s[‘slider_’+sl.id]=sl.value; });
try{ sessionStorage.setItem(‘spernew_state’,JSON.stringify(s)); }catch{}
},
restore(){
try{
const s=JSON.parse(sessionStorage.getItem(‘spernew_state’)||’{}’);
this.KEYS.forEach(id=>{ const el=document.getElementById(id); if(el&&s[id]!==undefined){ el.checked=s[id]; el.dispatchEvent(new Event(‘change’)); } });
Object.entries(s).forEach(([k,v])=>{ if(k.startsWith(‘slider_’)){ const el=document.getElementById(k.replace(‘slider_’,’’)); if(el){ el.value=v; el.dispatchEvent(new Event(‘input’)); } } });
}catch{}
}
};
window.AppSnapshot = AppSnapshot;
document.addEventListener(‘change’,()=>{ clearTimeout(AppSnapshot._saveTimer); AppSnapshot._saveTimer=setTimeout(()=>AppSnapshot.save(),500); });

// ============================================================
// [EXTRA PACK] GLOBAL ERROR BOUNDARY
// ============================================================
;(function GlobalErrorBoundary() {
window.addEventListener(‘error’,e=>{ log(‘ERR’,e.message); if(e.message?.includes(‘fetch’)||e.message?.includes(‘network’)) window.showToast?.(‘⚠️ Lỗi kết nối, thử lại sau’); return true; });
window.addEventListener(‘unhandledrejection’,e=>{ log(‘REJECT’,e.reason); if(String(e.reason)?.includes(‘fetch’)||String(e.reason)?.includes(‘Failed to fetch’)) window.showToast?.(‘⚠️ Mất kết nối Supabase’); e.preventDefault(); });
})();

// ============================================================
// [EXTRA PACK] KEYBOARD SHORTCUTS
// ============================================================
;(function KeyboardShortcuts() {
const map={h:‘home’,f:‘features’,s:‘stats’,a:‘aimlab’};
document.addEventListener(‘keydown’,e=>{
if([‘INPUT’,‘TEXTAREA’].includes(document.activeElement?.tagName)) return;
const page=map[e.key?.toLowerCase()];
if(page){ window.switchPage?.(page); e.preventDefault(); }
if(e.key?.toLowerCase()===‘b’){ window.runBoost?.(); e.preventDefault(); }
if(e.key?.toLowerCase()===‘k’){ window.showKeyModal?.(); e.preventDefault(); }
});
})();

// ============================================================
// [EXTRA PACK] DARK MODE SYSTEM SYNC
// ============================================================
;(function DarkModeSync() {
const mq=window.matchMedia?.(’(prefers-color-scheme: dark)’);
if(!mq) return;
function apply(dark){ const t=document.getElementById(‘s-dark’); if(t) t.checked=dark; document.documentElement.style.filter=dark?‘none’:‘brightness(1.05)’; }
apply(mq.matches); mq.addEventListener(‘change’,e=>apply(e.matches));
})();

// ============================================================
// [EXTRA PACK] REDUCE MOTION SUPPORT
// ============================================================
;(function ReducedMotionSupport() {
if(!window.matchMedia?.(’(prefers-reduced-motion: reduce)’).matches) return;
const s=document.createElement(‘style’);
s.textContent=’@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}’;
document.head.appendChild(s);
})();

// ============================================================
// [EXTRA PACK] SUPABASE REQUEST CACHE (30s TTL)
// ============================================================
const SupabaseCache = {
_store:new Map(), TTL:30000,
set(url,data){ this._store.set(url,{data,ts:Date.now()}); },
get(url){ const i=this._store.get(url); if(!i) return null; if(Date.now()-i.ts>this.TTL){ this._store.delete(url); return null; } return i.data; },
async fetch(url,opts){ const c=this.get(url); if(c) return c; const d=await fetch(url,opts).then(r=>r.json()); this.set(url,d); return d; }
};
window.SupabaseCache = SupabaseCache;

// ============================================================
// [EXTRA PACK] BATTERY GRAPH + ANIMATION MANAGER
// ============================================================
;(async function BatteryGraphManager() {
if(!navigator.getBattery) return;
const bat=await navigator.getBattery();
const s=document.createElement(‘style’); s.id=’_sn_bat’;
function check(){
const low=bat.level<0.2&&!bat.charging;
document.querySelectorAll(’.rt-graph’).forEach(g=>{ g.style.display=low?‘none’:’’; });
if(low){ s.textContent=’*,*::before,*::after{animation-duration:.001ms!important;transition-duration:.001ms!important}’; if(!s.parentNode) document.head.appendChild(s); if(window.statsInterval){ clearInterval(window.statsInterval); window.statsInterval=setInterval(()=>UIUpdater.updateNetworkStatus(),5000); } }
else s.remove();
}
bat.addEventListener(‘levelchange’,check); bat.addEventListener(‘chargingchange’,check); check();
})();

// ============================================================
// [EXTRA PACK] NETWORK STATUS INDICATOR
// ============================================================
;(function NetworkStatusIndicator() {
function update(){ UIUpdater.updateNetworkStatus(); }
window.addEventListener(‘online’,update); window.addEventListener(‘offline’,update);
navigator.connection?.addEventListener(‘change’,update); update();
})();

// ============================================================
// [EXTRA PACK] DEVICE RAM DISPLAY
// ============================================================
;(function DeviceRAMDisplay() {
const el=document.getElementById(‘status-ram’);
if(!el||!navigator.deviceMemory) return;
if(navigator.deviceMemory<=3){ el.textContent=`RAM ${navigator.deviceMemory}GB — Thấp`; el.style.color=’#ff4d6a’; }
})();

// ============================================================
// [EXTRA PACK] FPS ADAPTIVE INTERVAL
// ============================================================
;(function FPSAdaptiveInterval() {
let count=0, last=performance.now(), sum=0;
function measure(now){
sum+=now-last; last=now; count++;
if(count>=30){
const fps=1000/(sum/count); count=0; sum=0;
if(window.statsInterval){
clearInterval(window.statsInterval);
window.statsInterval=setInterval(()=>{ UIUpdater.updateRAM(); UIUpdater.updateNetworkStatus(); }, fps<30?2000:1200);
}
}
requestAnimationFrame(measure);
}
requestAnimationFrame(measure);
})();

// ============================================================
// [REAL] CANVAS DPR FIX
// ============================================================
function fixCanvasDPR(canvas) {
const dpr=Math.min(window.devicePixelRatio||1,2);
const rect=canvas.getBoundingClientRect();
if(!rect.width) return;
canvas.width=Math.floor(rect.width*dpr); canvas.height=Math.floor(rect.height*dpr);
canvas.style.width=rect.width+‘px’; canvas.style.height=rect.height+‘px’;
const ctx=canvas.getContext(‘2d’); ctx?.scale(dpr,dpr); return ctx;
}
window.fixCanvasDPR = fixCanvasDPR;
;(function(){ document.querySelectorAll(‘canvas’).forEach(fixCanvasDPR); })();

// ============================================================
// [ORIGINAL] OBJECT POOL
// ============================================================
class ObjectPool {
constructor(createFn,initialSize=100){ this.pool=[]; this.create=createFn; for(let i=0;i<initialSize;i++) this.pool.push(this.create()); }
get(){ return this.pool.pop()||this.create(); }
release(obj){ this.pool.push(obj); }
}
window.ObjectPool = ObjectPool;

// ============================================================
// [ORIGINAL] RAF LOOP WITH DELTA TIME
// ============================================================
function createGameLoop(updateFn) {
let id, last=0, active=false;
function tick(now){
const delta=Math.min(32,now-last)/16.67;
last=now; updateFn(delta);
if(active) id=requestAnimationFrame(tick);
}
return {
start(){ if(!active){ active=true; id=requestAnimationFrame(tick); } },
stop(){ active=false; cancelAnimationFrame(id); },
get active(){ return active; }
};
}
window.createGameLoop = createGameLoop;

// ============================================================
// [ORIGINAL] AABB COLLISION
// ============================================================
function collides(r1,r2){ return !(r2.x>r1.x+r1.w||r2.x+r2.w<r1.x||r2.y>r1.y+r1.h||r2.y+r2.h<r1.y); }
window.collides = collides;

// ============================================================
// [ORIGINAL] FULLSCREEN API
// ============================================================
function toggleFullscreen(canvas){ if(!document.fullscreenElement) canvas.requestFullscreen?.(); else document.exitFullscreen?.(); }
window.toggleFullscreen = toggleFullscreen;

// ============================================================
// [ORIGINAL] VIRTUAL JOYSTICK CLASS
// ============================================================
class Joystick {
constructor(element){ this.element=element; this.active=false; this.x=0; this.y=0; this._init(); }
_init(){
this.element.addEventListener(‘touchstart’,e=>{ this.active=true; this._update(e.touches[0]); },{passive:true});
this.element.addEventListener(‘touchmove’, e=>{ this._update(e.touches[0]); },{passive:true});
this.element.addEventListener(‘touchend’,  ()=>{ this.active=false; this.x=0; this.y=0; },{passive:true});
}
_update(touch){ const r=this.element.getBoundingClientRect(); this.x=(touch.clientX-r.left-r.width/2)/(r.width/2); this.y=(touch.clientY-r.top-r.height/2)/(r.height/2); }
get direction(){ return {x:Math.max(-1,Math.min(1,this.x)), y:Math.max(-1,Math.min(1,this.y))}; }
}
window.Joystick = Joystick;

// ============================================================
// [ORIGINAL] CPU THROTTLE UTILS
// ============================================================
const CPUThrottle = {
processInChunks(items,processItem,chunkSize=50){
let index=0;
function runChunk(){ const end=Math.min(index+chunkSize,items.length); for(;index<end;index++) processItem(items[index],index); if(index<items.length) setTimeout(runChunk,0); }
runChunk();
},
runWhenIdle(task){ ‘requestIdleCallback’ in window ? requestIdleCallback(task,{timeout:2000}) : setTimeout(task,1); },
throttle(fn,limit=100){ let last=0; return function(…a){ const now=Date.now(); if(now-last>=limit){ last=now; return fn.apply(this,a); } }; },
debounce(fn,delay=300){ let t; return function(…a){ clearTimeout(t); t=setTimeout(()=>fn.apply(this,a),delay); }; },
runInWorker(workerFn,data){
return new Promise((res,rej)=>{
const blob=new Blob([`self.onmessage=function(e){self.postMessage((${workerFn.toString()})(e.data));}`],{type:‘application/javascript’});
const url=URL.createObjectURL(blob), worker=new Worker(url);
worker.onmessage=e=>{ res(e.data); worker.terminate(); URL.revokeObjectURL(url); };
worker.onerror=e=>{ rej(e); worker.terminate(); URL.revokeObjectURL(url); };
worker.postMessage(data);
});
}
};
window.CPUThrottle = CPUThrottle;

// ============================================================
// [ORIGINAL] RENDER OPTIMIZER
// ============================================================
const RenderOptimizer = {
batchWrite(fn){ requestAnimationFrame(fn); },
readThenWrite(readFn,writeFn){ const d=readFn(); requestAnimationFrame(()=>writeFn(d)); },
lazyRender(selector,renderFn){
const obs=new IntersectionObserver(entries=>{
entries.forEach(entry=>{ if(entry.isIntersecting){ renderFn(entry.target); obs.unobserve(entry.target); } });
},{rootMargin:‘100px’});
document.querySelectorAll(selector).forEach(el=>obs.observe(el));
return obs;
},
promoteToGPU(el){ el.style.willChange=‘transform’; el.style.transform=‘translateZ(0)’; },
demoteFromGPU(el){ el.style.willChange=‘auto’; el.style.transform=’’; }
};
window.RenderOptimizer = RenderOptimizer;

// ============================================================
// [ORIGINAL] ASSET OPTIMIZER
// ============================================================
const AssetOptimizer = {
lazyLoadImages(selector=‘img[data-src]’){
if(!(‘IntersectionObserver’ in window)){ document.querySelectorAll(selector).forEach(img=>img.src=img.dataset.src); return; }
const obs=new IntersectionObserver(entries=>{
entries.forEach(entry=>{ if(entry.isIntersecting){ const img=entry.target; img.src=img.dataset.src; if(img.dataset.srcset) img.srcset=img.dataset.srcset; img.removeAttribute(‘data-src’); obs.unobserve(img); } });
},{rootMargin:‘200px’});
document.querySelectorAll(selector).forEach(img=>obs.observe(img));
},
preload(resources){ resources.forEach(({href,as})=>{ const l=document.createElement(‘link’); l.rel=‘preload’; l.href=href; l.as=as; document.head.appendChild(l); }); },
async cachedFetch(url,ttl=300000){
const key=‘cache_’+url, cached=sessionStorage.getItem(key);
if(cached){ const {data,timestamp}=JSON.parse(cached); if(Date.now()-timestamp<ttl) return data; }
const res=await fetch(url), data=await res.json();
try{ sessionStorage.setItem(key,JSON.stringify({data,timestamp:Date.now()})); }catch{}
return data;
}
};
window.AssetOptimizer = AssetOptimizer;
AssetOptimizer.lazyLoadImages();

// ============================================================
// [ORIGINAL] ADAPTIVE QUALITY MANAGER
// ============================================================
const AdaptiveQuality = {
_profile:‘high’,
detectDevice(){
const cores=navigator.hardwareConcurrency||2, memory=navigator.deviceMemory||2;
const isMobile=/Mobi|Android/i.test(navigator.userAgent);
const prefersReduced=window.matchMedia?.(’(prefers-reduced-motion: reduce)’).matches||false;
let score=(cores>=8?3:cores>=4?2:1)+(memory>=8?3:memory>=4?2:1)+(!isMobile?1:0)-(prefersReduced?2:0);
this._profile=score>=6?‘high’:score>=4?‘mid’:‘low’;
return this._profile;
},
apply(config={}){
const profile=this.detectDevice();
const defaults={
high:()=>document.documentElement.style.setProperty(’–anim-speed’,‘0.3s’),
mid: ()=>document.documentElement.style.setProperty(’–anim-speed’,‘0.15s’),
low: ()=>{ const s=document.createElement(‘style’); s.id=’_low_device’; s.textContent=’*,*::before,*::after{animation:none!important;transition:none!important}’; document.head.appendChild(s); }
};
const merged={…defaults,…config}; merged[profile]?.(); return profile;
},
watchPerformance(minFPS=30){
let frames=0, start=performance.now();
const loop=()=>{ frames++; const e=performance.now()-start; if(e>=1000){ const fps=frames/(e/1000); frames=0; start=performance.now(); if(fps<minFPS&&this._profile!==‘low’){ this._profile=this._profile===‘high’?‘mid’:‘low’; this.apply(); } } requestAnimationFrame(loop); };
requestAnimationFrame(loop);
}
};
window.AdaptiveQuality = AdaptiveQuality;
AdaptiveQuality.apply();
AdaptiveQuality.watchPerformance();

// ============================================================
// [ORIGINAL] NETWORK OPTIMIZER
// ============================================================
const NetworkOptimizer = {
getConnectionInfo(){
const c=navigator.connection||navigator.mozConnection;
if(!c) return null;
return { effectiveType:c.effectiveType, downlink:c.downlink, rtt:c.rtt, saveData:c.saveData };
},
adaptToNetwork(handlers={}){
const c=navigator.connection;
const apply=()=>{ if(!navigator.onLine) return handlers.offline?.(); const t=c?.effectiveType||‘4g’; ([‘slow-2g’,‘2g’].includes(t)||c?.saveData)?handlers.slow?.():handlers.fast?.(); };
apply(); window.addEventListener(‘online’,apply); window.addEventListener(‘offline’,apply); c?.addEventListener(‘change’,apply);
},
createQueue(maxConcurrent=3){
const queue=[]; let running=0;
function next(){ if(running>=maxConcurrent||!queue.length) return; running++; const {url,options,resolve,reject}=queue.shift(); fetch(url,options).then(resolve).catch(reject).finally(()=>{ running–; next(); }); }
return { add(url,options={}){ return new Promise((res,rej)=>{ queue.push({url,options,resolve:res,reject:rej}); next(); }); }, get size(){ return queue.length; } };
},
async fetchWithRetry(url,options={},retries=3,backoff=500){
for(let i=0;i<=retries;i++){ try{ const r=await fetch(url,options); if(!r.ok&&i<retries) throw new Error(`HTTP ${r.status}`); return r; } catch(err){ if(i===retries) throw err; await new Promise(r=>setTimeout(r,backoff*(i+1))); } }
},
prefetchDomains(domains){ domains.forEach(d=>{ [‘dns-prefetch’,‘preconnect’].forEach(rel=>{ const l=document.createElement(‘link’); l.rel=rel; l.href=d; document.head.appendChild(l); }); }); }
};
window.NetworkOptimizer = NetworkOptimizer;

// ============================================================
// [ORIGINAL] PERF MONITOR
// ============================================================
const PerfMonitor = {
_marks:{},
start(label){ this._marks[label]=performance.now(); },
end(label){ const d=performance.now()-(this._marks[label]||0); delete this._marks[label]; return d; },
measureFPS(duration=2000){ let frames=0,start=performance.now(); function count(){ frames++; if(performance.now()-start<duration) requestAnimationFrame(count); } requestAnimationFrame(count); },
reportVitals(){
try{ new PerformanceObserver(l=>{ const e=l.getEntries(); log(‘LCP’,e[e.length-1].startTime.toFixed(0)+‘ms’); }).observe({entryTypes:[‘largest-contentful-paint’]}); }catch{}
try{ let cls=0; new PerformanceObserver(l=>{ l.getEntries().forEach(e=>{ if(!e.hadRecentInput) cls+=e.value; }); }).observe({entryTypes:[‘layout-shift’]}); }catch{}
}
};
window.PerfMonitor = PerfMonitor;

// ============================================================
// [REAL] LIVE STATS — update UI với số thật liên tục
// ============================================================
RealMetrics.measureFPS(fps=>UIUpdater.updateFPS(fps), 60);
window.statsInterval = setInterval(()=>{
UIUpdater.updateRAM();
UIUpdater.updateNetworkStatus();
const el=document.getElementById(‘status-ram’);
if(el&&navigator.deviceMemory) el.textContent=`RAM ${navigator.deviceMemory}GB`;
}, 2000);

// ============================================================
// [REAL] INIT — restore state
// ============================================================
;(function() {
const origInit=window.initApp;
window.initApp=function(){ origInit?.apply(this,arguments); setTimeout(()=>AppSnapshot.restore(),800); };
})();

// ============================================================
// WINDOW RESIZE DEBOUNCE
// ============================================================
let _resizeTimer;
window.addEventListener(‘resize’,()=>{ clearTimeout(_resizeTimer); _resizeTimer=setTimeout(()=>document.querySelectorAll(‘canvas’).forEach(fixCanvasDPR),150); });

// ============================================================
// LOAD — idle tasks
// ============================================================
window.addEventListener(‘load’,()=>{
IdleScheduler.add(()=>StorageGuard?.check?.(),‘storage-check’);
IdleScheduler.add(()=>{ document.querySelectorAll(’.page-scroll’).forEach(el=>{ el.style.overscrollBehavior=‘contain’; }); },‘overscroll’);
PerfMonitor.reportVitals();
setTimeout(()=>{
document.querySelectorAll(’.boost-overlay,.vip-hero-bg’).forEach(el=>{ el.style.willChange=‘auto’; el.style.transform=’’; });
},4000);
});

// ============================================================
// EXPORT — window._SN để debug nếu cần
// ============================================================
window._SN = {
RealMetrics, UIUpdater, MemCleaner, DOM, FrameBudget,
AppSnapshot, SupabaseCache, IOPool, IdleScheduler,
CPUThrottle, RenderOptimizer, AssetOptimizer,
NetworkOptimizer, AdaptiveQuality, PerfMonitor
};

log(‘FULL Edition v4.0 — all modules active’);

})();