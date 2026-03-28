// ============================================================
//   SPERNEW OPTIMIZE — script.js
// ============================================================

// Prevent context menu / copy
(() => {
  const prevent = e => e.preventDefault();
  ['contextmenu','selectstart','dragstart','copy','cut'].forEach(ev =>
    document.addEventListener(ev, prevent, { passive: false })
  );
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && ['a','c','x'].includes(e.key.toLowerCase()))
      e.preventDefault();
  }, { passive: false });
})();

// ============ SPLASH ============
const splashMessages = [
  'INITIALIZING SYSTEM...',
  'LOADING AI ENGINE...',
  'CALIBRATING SENSORS...',
  'SCANNING DEVICE...',
  'OPTIMIZING MEMORY...',
  'READY.',
];

window.addEventListener('DOMContentLoaded', () => {
  // Particles
  const pc = document.getElementById('splash-particles');
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left: ${Math.random()*100}%;
      bottom: ${Math.random()*30}%;
      animation-duration: ${2 + Math.random()*3}s;
      animation-delay: ${Math.random()*3}s;
      width: ${1 + Math.random()*2}px;
      height: ${1 + Math.random()*2}px;
    `;
    pc.appendChild(p);
  }

  // Loader
  const fill = document.getElementById('splash-loader-fill');
  const text = document.getElementById('splash-loader-text');
  let pct = 0;
  let msgIdx = 0;
  const interval = setInterval(() => {
    pct += Math.random() * 18 + 5;
    if (pct > 100) pct = 100;
    fill.style.width = pct + '%';
    const mIdx = Math.floor((pct / 100) * (splashMessages.length - 1));
    if (mIdx !== msgIdx) {
      msgIdx = mIdx;
      text.textContent = splashMessages[Math.min(msgIdx, splashMessages.length - 1)];
    }
    if (pct >= 100) {
      clearInterval(interval);
      text.textContent = 'READY.';
      setTimeout(hideSplash, 600);
    }
  }, 180);
});

function hideSplash() {
  const splash = document.getElementById('splash-screen');
  const app = document.getElementById('app');
  splash.style.transition = 'opacity .6s ease';
  splash.style.opacity = '0';
  setTimeout(() => {
    splash.style.display = 'none';
    app.style.display = 'flex';
    initApp();
  }, 600);
}

// ============ APP INIT ============
function initApp() {
  buildFeatures();
  startStats();
  startRealtimeGraphs();
  animateScoreRing(78);
  document.getElementById('perf-score').textContent = '78';
  document.getElementById('perf-grade').textContent = 'GOOD — Tốt';
  checkSavedKey();
}

// ============ PAGE NAV ============
function switchPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.bnav-btn').forEach(b => b.classList.remove('active'));
  const page = document.getElementById('page-' + id);
  if (page) page.classList.add('active');
  document.querySelectorAll(`[data-page="${id}"]`).forEach(b => b.classList.add('active'));
}

// ============ FEATURES ============
const freeFeatures = [
  { icon: '⚡', name: 'FPS Stabilizer', desc: 'Ổn định khung hình / Frame stabilization', id: 'fps-stab' },
  { icon: '🧹', name: 'RAM Cleaner', desc: 'Dọn RAM nhanh / Quick memory clean', id: 'ram-clean' },
  { icon: '🌡️', name: 'Thermal Monitor', desc: 'Theo dõi nhiệt độ / Temperature tracking', id: 'thermal' },
  { icon: '📶', name: 'Network Monitor', desc: 'Theo dõi mạng / Network tracking', id: 'net-mon' },
  { icon: '🔋', name: 'Battery Saver', desc: 'Tiết kiệm pin / Battery optimization', id: 'bat-save' },
];
const vipFeatures = [
  { icon: '🎯', name: 'AI Aim Engine', desc: 'Tối ưu điều khiển AI / AI control optimizer', id: 'aim-eng' },
  { icon: '🚀', name: 'Turbo Frame', desc: 'Tăng FPS tối đa / Maximum FPS boost', id: 'turbo' },
  { icon: '🛡️', name: 'Thermal AI Guard', desc: 'Kiểm soát nhiệt AI / AI thermal control', id: 'therm-ai' },
  { icon: '🌐', name: 'Net Accelerator', desc: 'Giảm ping / Ping reducer', id: 'net-acc' },
  { icon: '🔊', name: 'Sound Enhancer', desc: 'Tăng âm thanh định hướng / Directional audio', id: 'sound-en' },
  { icon: '📊', name: 'Deep Analytics', desc: 'Phân tích chuyên sâu / Deep analytics', id: 'analytics' },
];

function buildFeatures() {
  buildFeatList('feature-list-free', freeFeatures, false);
  buildFeatList('feature-list-vip', vipFeatures, true);
}

function buildFeatList(containerId, features, isVip) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  features.forEach(f => {
    const item = document.createElement('div');
    item.className = 'feat-item';
    item.innerHTML = `
      <div class="feat-icon">${f.icon}</div>
      <div class="feat-info">
        <div class="feat-name">${f.name}</div>
        <div class="feat-desc">${f.desc}</div>
      </div>
      <label class="toggle feat-toggle">
        <input type="checkbox" id="feat-${f.id}" ${isVip ? '' : 'onchange="onFeatureToggle(this, \'' + f.name + '\')"'}>
        <span class="toggle-track"></span>
      </label>
    `;
    container.appendChild(item);
  });
}

function onFeatureToggle(el, name) {
  showToast(el.checked ? `${name} enabled` : `${name} disabled`);
}

// ============ STATS SIMULATION ============
let statsInterval = null;
const statsHistory = { fps: [], cpu: [], ram: [], temp: [] };

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function lerp(a, b, t) { return a + (b - a) * t; }

let fpsTarget = 60, cpuTarget = 35, ramTarget = 55, tempTarget = 42;

function startStats() {
  updateStats();
  statsInterval = setInterval(updateStats, 1200);
}

function updateStats() {
  fpsTarget = lerp(fpsTarget, rand(45, 90), .3);
  cpuTarget = lerp(cpuTarget, rand(20, 75), .3);
  ramTarget = lerp(ramTarget, rand(40, 80), .3);
  tempTarget = lerp(tempTarget, rand(35, 65), .3);

  const fps = Math.round(fpsTarget);
  const cpu = Math.round(cpuTarget);
  const ram = Math.round(ramTarget);
  const temp = Math.round(tempTarget);

  // Dashboard stats
  setStatCard('fps', fps, '', fps >= 60 ? 'SMOOTH' : fps >= 45 ? 'NORMAL' : 'LOW', (fps / 120) * 100);
  setStatCard('cpu', cpu, '%', cpu < 50 ? 'NORMAL' : cpu < 70 ? 'HIGH' : 'CRITICAL', cpu);
  setStatCard('ram', ram, '%', ram < 60 ? 'OK' : ram < 75 ? 'HIGH' : 'FULL', ram);
  setStatCard('temp', temp, '°', temp < 45 ? 'COOL' : temp < 55 ? 'WARM' : 'HOT', (temp / 80) * 100);

  // Score
  const score = Math.round(((fps / 90) * 30 + ((100 - cpu) / 100) * 25 + ((100 - ram) / 100) * 25 + ((80 - temp) / 80) * 20));
  const clampedScore = Math.min(99, Math.max(10, score));
  document.getElementById('perf-score').textContent = clampedScore;
  document.getElementById('perf-grade').textContent = clampedScore >= 80 ? 'EXCELLENT — Xuất sắc'
    : clampedScore >= 65 ? 'GOOD — Tốt'
    : clampedScore >= 50 ? 'NORMAL — Bình thường'
    : 'LOW — Cần tối ưu';
  animateScoreRing(clampedScore);

  // Realtime page
  document.getElementById('rt-fps').textContent = fps;
  document.getElementById('rt-cpu').textContent = cpu + '%';
  document.getElementById('rt-ram').textContent = ram + '%';
  document.getElementById('rt-temp').textContent = temp + '°';

  // History
  ['fps','cpu','ram','temp'].forEach(k => {
    const v = k === 'fps' ? fps : k === 'cpu' ? cpu : k === 'ram' ? ram : temp;
    statsHistory[k].push(v);
    if (statsHistory[k].length > 20) statsHistory[k].shift();
    updateMinMaxAvg(k, statsHistory[k]);
  });

  // Network
  document.getElementById('net-down').textContent = (Math.random() * 5 + .5).toFixed(1) + ' MB/s';
  document.getElementById('net-up').textContent = (Math.random() * 1 + .1).toFixed(1) + ' MB/s';
  document.getElementById('net-ping').textContent = rand(8, 45) + ' ms';
}

function setStatCard(key, val, suffix, statusText, pct) {
  const elVal = document.getElementById('val-' + key);
  const elBar = document.getElementById('bar-' + key);
  const elStatus = document.getElementById('status-' + key);
  if (elVal) elVal.innerHTML = val + (suffix ? `<span>${suffix}</span>` : '');
  if (elBar) elBar.style.width = Math.min(100, pct) + '%';
  if (elStatus) elStatus.textContent = statusText;
}

function updateMinMaxAvg(key, arr) {
  if (!arr.length) return;
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const avg = Math.round(arr.reduce((a,b) => a+b, 0) / arr.length);
  const suffix = key === 'fps' ? '' : key === 'temp' ? '°' : '%';
  const el = (id) => document.getElementById(id);
  if (el(`rt-${key}-min`)) el(`rt-${key}-min`).textContent = min + suffix;
  if (el(`rt-${key}-max`)) el(`rt-${key}-max`).textContent = max + suffix;
  if (el(`rt-${key}-avg`)) el(`rt-${key}-avg`).textContent = avg + suffix;
}

// ============ GRAPH BARS ============
const graphColors = {
  fps: '#00ff88', cpu: '#ffe94d', ram: '#4df0ff', temp: '#ff4d6a'
};

function startRealtimeGraphs() {
  ['fps','cpu','ram','temp'].forEach(k => {
    const container = document.getElementById('graph-' + k);
    if (!container) return;
    for (let i = 0; i < 20; i++) {
      const bar = document.createElement('div');
      bar.className = 'graph-bar';
      bar.style.background = graphColors[k] + '55';
      bar.style.height = '2px';
      container.appendChild(bar);
    }
  });
  setInterval(updateGraphs, 1200);
}

function updateGraphs() {
  ['fps','cpu','ram','temp'].forEach(k => {
    const container = document.getElementById('graph-' + k);
    if (!container) return;
    const bars = container.querySelectorAll('.graph-bar');
    const history = statsHistory[k];
    if (!history.length) return;
    const maxVal = k === 'fps' ? 120 : k === 'temp' ? 80 : 100;
    bars.forEach((bar, i) => {
      const val = history[i] || 0;
      const pct = (val / maxVal) * 100;
      bar.style.height = Math.max(2, pct * 0.4) + 'px';
      const isLast = i === history.length - 1;
      bar.style.background = isLast ? graphColors[k] : graphColors[k] + '44';
      bar.style.boxShadow = isLast ? `0 0 4px ${graphColors[k]}` : 'none';
    });
  });
}

// ============ SCORE RING ============
function animateScoreRing(score) {
  const circle = document.getElementById('score-ring-circle');
  if (!circle) return;
  const circumference = 2 * Math.PI * 32;
  const offset = circumference - (score / 100) * circumference;
  circle.style.strokeDashoffset = offset;
  circle.style.stroke = score >= 80 ? '#00ff88' : score >= 60 ? '#ffe94d' : '#ff4d6a';
}

// ============ BOOST ============
function runBoost() {
  const overlay = document.getElementById('boost-overlay');
  const text = document.getElementById('boost-overlay-text');
  const pct = document.getElementById('boost-overlay-pct');
  overlay.style.display = 'flex';
  let p = 0;
  const msgs = ['SCANNING MEMORY...','CLEARING CACHE...','OPTIMIZING FPS...','APPLYING TWEAKS...','DONE!'];
  const iv = setInterval(() => {
    p += rand(8, 18);
    if (p > 100) p = 100;
    pct.textContent = p + '%';
    text.textContent = msgs[Math.floor((p / 100) * (msgs.length - 1))];
    if (p >= 100) {
      clearInterval(iv);
      setTimeout(() => {
        overlay.style.display = 'none';
        showToast('✅ Boost complete! System optimized.');
      }, 500);
    }
  }, 200);
}

// ============ QUICK ACTIONS ============
const qaMessages = {
  clear: '🧹 RAM cleared — 512MB freed',
  cool: '❄️ Cooling mode activated',
  boost: '⚡ FPS boost applied',
  network: '🌐 Network optimized — ping reduced',
};
function quickAction(type) {
  showToast(qaMessages[type] || 'Done!');
}

// ============ TOAST ============
let toastTimer = null;
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

// ============ SETTINGS ============
function applySettings() {
  // Dark mode always on for now
  showToast('Settings saved / Đã lưu cài đặt');
}


// ============================================================
//   AIM LAB — Hỗ trợ kéo tâm Free Fire
// ============================================================

// ── 1. AIM LOCK v1–v4 ────────────────────────────────────────
const aimlockData = {
  v1: { radius:'15px', speed:'Rất nhẹ',  priority:'Ngực',       label:'AimLock v1 — Nhẹ'  },
  v2: { radius:'25px', speed:'Nhẹ',      priority:'Đầu + Ngực', label:'AimLock v2 — Vừa'  },
  v3: { radius:'35px', speed:'Medium',   priority:'Đầu + Ngực', label:'AimLock v3 — Mạnh' },
  v4: { radius:'55px', speed:'Nhanh',    priority:'Đầu (MAX)',  label:'AimLock v4 — MAX'  },
};

function setAimLock(btn, ver) {
  document.querySelectorAll('.aimlock-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const d = aimlockData[ver];
  document.getElementById('al-radius').textContent   = d.radius;
  document.getElementById('al-speed').textContent    = d.speed;
  document.getElementById('al-priority').textContent = d.priority;
  document.getElementById('aim-mode-label').textContent = d.label;
  updateAimScore();
  showToast('🔒 ' + d.label + ' đã chọn');
}

// ── 2. NHẸ TÂM (Smooth) ──────────────────────────────────────
function updateSmooth(val) {
  document.getElementById('smooth-fill').style.width = val + '%';
  document.getElementById('smooth-pct').textContent  = val + '%';
  updateAimScore();
}
function setSmooth(btn, val) {
  document.querySelectorAll('.smooth-pre-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const slider = document.querySelector('.smooth-slider');
  if (slider) { slider.value = val; updateSmooth(val); }
  showToast('🪶 Smooth aim: ' + btn.textContent);
}

// ── 3. AIM ASSIST ─────────────────────────────────────────────
function toggleAssist(el) {
  showToast(el.checked ? '🤖 Aim Assist đã bật' : '🤖 Aim Assist đã tắt');
  updateAimScore();
}
function setAssistLevel(btn, lvl) {
  document.querySelectorAll('.assist-lvl').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  showToast('Aim Assist: ' + btn.textContent);
}
function setAssistTarget(btn, t) {
  document.querySelectorAll('.assist-target').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  showToast('Target: ' + btn.textContent);
}
function setAssistWhen(btn, w) {
  document.querySelectorAll('.assist-when').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  showToast('Kích hoạt: ' + btn.textContent);
}

// ── 4. AIM HOLD ───────────────────────────────────────────────
function toggleHold(el) {
  document.getElementById('hold-options').style.display = el.checked ? 'block' : 'none';
  showToast(el.checked ? '🖐️ Aim Hold bật' : '🖐️ Aim Hold tắt');
}
function setHoldMode(btn, mode) {
  document.querySelectorAll('.gyro-mode-btn').forEach(b => {
    if (b.closest('#hold-options')) b.classList.remove('active');
  });
  btn.classList.add('active');
  showToast('Hold mode: ' + btn.textContent);
}

// ── 5. SENSITIVITY ────────────────────────────────────────────
const sensPresets = {
  balanced: { general:100, ads:80, scope2:65, scope4:50, scope8:35, label:'Chế độ: Cân bằng' },
  sniper:   { general:55,  ads:42, scope2:32, scope4:26, scope8:18, label:'Chế độ: Sniper'   },
  rush:     { general:155, ads:120,scope2:100,scope4:80, scope8:55, label:'Chế độ: Rush'      },
  pro:      { general:88,  ads:70, scope2:58, scope4:44, scope8:30, label:'Chế độ: Pro Aim'   },
};

function applySensPreset(btn, preset) {
  document.querySelectorAll('.sens-preset-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const p = sensPresets[preset];
  ['general','ads','scope2','scope4','scope8'].forEach(k => {
    const sl = document.getElementById('sr-' + k);
    const vl = document.getElementById('sv-' + k);
    if (sl) sl.value = p[k];
    if (vl) vl.textContent = p[k];
  });
  document.getElementById('aim-mode-label').textContent = p.label;
  showToast('✅ Preset: ' + btn.querySelector('.sp-name').textContent);
}

function updateSens(key, val) {
  const el = document.getElementById('sv-' + key);
  if (el) el.textContent = val;
}

// ── 6. HEAD LOCK / BÁM ĐẦU ───────────────────────────────────
const headLockData = [
  { zone:'±10px', speed:'Rất nhẹ', acc:'70%' },
  { zone:'±18px', speed:'Nhẹ',     acc:'78%' },
  { zone:'±26px', speed:'Trung',   acc:'85%' },
  { zone:'±36px', speed:'Nhanh',   acc:'91%' },
  { zone:'±50px', speed:'Tối đa',  acc:'97%' },
];

function toggleHeadLock(el) {
  const ring = document.getElementById('ht-ring');
  if (el.checked) {
    ring.style.animation = 'ht-pulse 1s infinite';
    ring.style.borderColor = '#ff4d6a';
    showToast('💀 Head Lock đã bật');
  } else {
    ring.style.animation = 'none';
    ring.style.borderColor = '#333';
    showToast('💀 Head Lock đã tắt');
  }
  updateAimScore();
}

function setHeadLockLevel(btn, lv) {
  document.querySelectorAll('.hl-lvl-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const d = headLockData[lv - 1];
  document.getElementById('hl-zone').textContent  = d.zone;
  document.getElementById('hl-speed').textContent = d.speed;
  document.getElementById('hl-acc').textContent   = d.acc;
  showToast('💀 Head Lock Lv' + lv + ' — ' + d.acc);
  updateAimScore();
}

// ── 7. GYROSCOPE ─────────────────────────────────────────────
function toggleGyro(el) {
  document.getElementById('gyro-options').style.display = el.checked ? 'block' : 'none';
  showToast(el.checked ? '🔄 Gyroscope bật' : '🔄 Gyroscope tắt');
}
function setGyroMode(btn, mode) {
  const parent = btn.closest('.gyro-mode-btns');
  parent.querySelectorAll('.gyro-mode-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const lbl = { always:'Luôn bật', ads:'Khi ADS', scope:'Khi scope' };
  showToast('Gyro: ' + lbl[mode]);
}

// ── 8. TOUCH LATENCY ─────────────────────────────────────────
let currentLatency = 12;
function optimizeTouchLatency() {
  const arc = document.getElementById('tl-gauge-arc');
  const valEl = document.getElementById('tl-gauge-val');
  const txt   = document.getElementById('tl-status-text');
  let lat = currentLatency;
  showToast('⚡ Đang tối ưu touch latency...');
  const iv = setInterval(() => {
    lat = Math.max(3, lat - Math.random() * 3);
    const offset = 110 - ((lat / 50) * 110);
    if (arc)   arc.style.strokeDashoffset = offset;
    if (valEl) valEl.textContent = Math.round(lat) + 'ms';
    if (lat <= 4) {
      clearInterval(iv);
      currentLatency = Math.round(lat);
      arc.style.stroke = '#00ff88';
      txt.textContent  = 'SIÊU NHANH — Xuất sắc';
      showToast('✅ Latency tối ưu: ' + currentLatency + 'ms');
    }
  }, 180);
}

// ── 9. LAYOUT ─────────────────────────────────────────────────
const layoutTips = {
  '2': { t:'💡 Mẹo 2 ngón:', d:'Cả 2 ngón cái điều khiển tất cả · Đơn giản · Phù hợp người mới bắt đầu' },
  '3': { t:'💡 Mẹo 3 ngón:', d:'Ngón cái trái: di chuyển · Ngón cái phải: nhìn · Ngón trỏ: bắn — Cân bằng tốt' },
  '4': { t:'💡 Mẹo 4 ngón:', d:'Cái trái: di chuyển · Cái phải: bắn · Trỏ trái: nhảy/crouch · Trỏ phải: scope — Kéo tâm mượt hơn 40%' },
};
function selectLayout(btn, f) {
  document.querySelectorAll('.layout-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const t = layoutTips[f];
  const el = document.getElementById('layout-tips');
  if (el && t) el.innerHTML = `<div class="tip-title">${t.t}</div><div class="tip-text">${t.d}</div>`;
  showToast('✋ Layout ' + f + ' ngón');
}

// ── AIM SCORE ─────────────────────────────────────────────────
function updateAimScore() {
  const base = 60;
  const al  = document.querySelector('.aimlock-btn.active');
  const hlT = document.getElementById('headlock-toggle');
  const asT = document.getElementById('assist-toggle');
  const hoT = document.getElementById('hold-toggle');
  let score = base;
  if (al) { const v = al.id; score += v==='v4'?18:v==='v3'?12:v==='v2'?7:3; }
  if (hlT && hlT.checked) score += 10;
  if (asT && asT.checked) score += 8;
  if (hoT && hoT.checked) score += 4;
  score = Math.min(99, score);
  const el = document.getElementById('aim-score-val');
  if (el) el.textContent = score;
}

// ── APPLY ALL ─────────────────────────────────────────────────
function applyAimSettings() {
  const overlay = document.getElementById('boost-overlay');
  const text    = document.getElementById('boost-overlay-text');
  const pct     = document.getElementById('boost-overlay-pct');
  overlay.style.display = 'flex';
  let p = 0;
  const msgs = ['LOADING AIM CONFIG...','CALIBRATING AIM LOCK...','APPLYING HEAD TRACKING...','TUNING SENSITIVITY...','AIM OPTIMIZED!'];
  const iv = setInterval(() => {
    p += rand(10, 20);
    if (p > 100) p = 100;
    pct.textContent  = p + '%';
    text.textContent = msgs[Math.min(Math.floor((p/100)*(msgs.length-1)), msgs.length-1)];
    if (p >= 100) {
      clearInterval(iv);
      setTimeout(() => {
        overlay.style.display = 'none';
        const badge = document.getElementById('aim-status-badge');
        if (badge) { badge.textContent = '● OPTIMIZED'; badge.style.color = '#00ff88'; }
        showToast('🎯 Tất cả cài đặt AIM đã áp dụng! Chúc rank cao!');
        updateAimScore();
      }, 400);
    }
  }, 200);
}

// ⚠️ Điền 2 dòng này sau khi tạo project Supabase
const SUPABASE_URL = 'https://pjhdnvbssbcmbhepevcn.supabase.co';  // ← dán URL project vào đây
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqaGRudmJzc2JjbWJoZXBldmNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2NTk4MzMsImV4cCI6MjA5MDIzNTgzM30.00MnFaNSNOJEHJO_OPbsMu45EftknC9o4_ukx5UHaE4';              // ← dán anon key vào đây

function showKeyModal() {
  document.getElementById('key-modal').style.display = 'flex';
  document.getElementById('key-input').value = '';
  document.getElementById('key-msg').textContent = '';
  setTimeout(() => document.getElementById('key-input').focus(), 100);
}

function hideKeyModal() {
  document.getElementById('key-modal').style.display = 'none';
}

async function activateKey() {
  const key = document.getElementById('key-input').value.trim();
  const msgEl = document.getElementById('key-msg');
  const btn = document.getElementById('activate-btn');

  if (!key) { msgEl.style.color = '#ff4d6a'; msgEl.textContent = '⚠️ Vui lòng nhập key!'; return; }

  btn.textContent = 'ĐANG KIỂM TRA...';
  btn.disabled = true;
  msgEl.style.color = '#aaa';
  msgEl.textContent = 'Đang xác thực...';

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/keys?key=eq.${encodeURIComponent(key)}&select=expires_at,is_active`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const data = await res.json();

    if (!data.length) {
      msgEl.style.color = '#ff4d6a'; msgEl.textContent = '❌ Key không tồn tại';
    } else {
      const { expires_at, is_active } = data[0];
      if (!is_active) {
        msgEl.style.color = '#ff4d6a'; msgEl.textContent = '❌ Key đã bị thu hồi';
      } else if (new Date(expires_at) < new Date()) {
        msgEl.style.color = '#ff4d6a'; msgEl.textContent = '❌ Key đã hết hạn';
      } else {
        const exp = expires_at.slice(0, 10);
        localStorage.setItem('vip_key', key);
        localStorage.setItem('vip_expires', exp);
        msgEl.style.color = '#00ff88';
        msgEl.textContent = '✅ Kích hoạt VIP thành công!';
        setTimeout(() => { hideKeyModal(); unlockVIP(exp); }, 900);
      }
    }
  } catch (e) {
    msgEl.style.color = '#ff4d6a';
    msgEl.textContent = '❌ Không kết nối được Supabase';
  }

  btn.textContent = 'KÍCH HOẠT';
  btn.disabled = false;
}

function unlockVIP(expiresAt) {
  // Mở khoá tất cả VIP toggles
  const vipList = document.getElementById('feature-list-vip');
  if (vipList) {
    vipList.classList.remove('locked');
    vipList.querySelectorAll('input[type=checkbox]').forEach(el => {
      el.disabled = false;
      el.onchange = function () {
        onFeatureToggle(this, this.closest('.feat-item').querySelector('.feat-name').textContent);
      };
    });
  }

  // Đổi nút UPGRADE → đã kích hoạt
  document.querySelectorAll('.upgrade-mini-btn').forEach(btn => {
    btn.textContent = '👑 VIP';
    btn.style.background = 'linear-gradient(135deg,#ffe94d,#ff9800)';
    btn.style.color = '#000';
    btn.onclick = null;
  });

  // Banner VIP ở đầu app
  if (!document.getElementById('vip-banner')) {
    const banner = document.createElement('div');
    banner.id = 'vip-banner';
    banner.style.cssText = 'background:linear-gradient(90deg,#00ff8811,#00ff8822);border-bottom:1px solid #00ff8833;color:#00ff88;padding:7px 16px;text-align:center;font-size:11px;font-weight:700;letter-spacing:1px;';
    banner.innerHTML = `👑 VIP ACTIVE &nbsp;|&nbsp; Hết hạn: ${expiresAt}`;
    document.getElementById('app').prepend(banner);
  }

  showToast('👑 VIP kích hoạt thành công! Hết hạn ' + expiresAt);
}

function checkSavedKey() {
  const key = localStorage.getItem('vip_key');
  const exp = localStorage.getItem('vip_expires');
  if (key && exp && new Date(exp) > new Date()) {
    unlockVIP(exp);
  } else {
    localStorage.removeItem('vip_key');
    localStorage.removeItem('vip_expires');
  }
}
