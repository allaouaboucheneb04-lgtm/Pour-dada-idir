'use strict';

// ───────────────────────────────────────────────
// DONNÉES KABYLES
// ───────────────────────────────────────────────
const PHRASES = {
  'Besoins': [
    ['Vghigh aman', "Je veux de l'eau"],
    ['Vghigh ad chegh', 'Je veux manger'],
    ['Adgnagh', 'Je veux dormir'],
    ['Ur vghigh ara', 'Je ne veux pas'],
    ['Asmid', "J'ai froid"],
    ['I7ma', "J'ai chaud"],
    ['Vghigh ad kecmegh', 'Je veux entrer'],
    ['Vghigh ad ffeghegh', 'Je veux sortir'],
  ],
  'Douleur': [
    ['I9ar7iyi', "J'ai mal"],
    ['I9ar7iyi uqerruy', "J'ai mal à la tête"],
    ['I9ar7iyi a3bod', "J'ai mal au ventre"],
    ['I9ar7iyi afus', "J'ai mal à la main"],
    ['I9ar7iyi adhar', "J'ai mal à la jambe"],
    ['I9ar7iyi atas', "J'ai très mal"],
    ['Ur zmiregh ara', 'Je ne peux pas'],
  ],
  'Famille': [
    ['Ghar i mama', 'Appelle maman'],
    ['Ghar i baba', 'Appelle papa'],
    ['Ghar i gma', 'Appelle mon frère'],
    ['Ghar i weltma', 'Appelle ma sœur'],
    ['Taliyid', 'Regarde-moi'],
    ['Qim yidi', 'Reste avec moi'],
    ['Ffegh', 'Sors / laisse-moi'],
  ],
  'Corps': [
    ['Dewriyi', 'Retourne-moi'],
    ['9a3diyi', 'Redresse-moi'],
    ['Sersiyi', 'Allonge-moi'],
    ['Rfed aqerruy', 'Lève ma tête'],
    ['Sers aqerruy', 'Baisse ma tête'],
    ['Beddeliyi amkan', 'Change ma position'],
    ['Sufegh aaddis', 'Couvre mon ventre'],
  ],
  'Réponses': [
    ['Ih', 'Oui'],
    ['Ala', 'Non'],
    ['Tanemmirt', 'Merci'],
    ['Sma7iyi', 'Pardon / excuse-moi'],
    ['Ma3lich', 'Pas grave'],
    ['3iwedas', 'Répète'],
    ['Ur fhimegh', "Je n'ai pas compris"],
  ],
  'Urgence': [
    ['Ur zmiregh ara ad nefsegh', 'Je respire mal'],
    ['I9ar7iyi atas', "J'ai très mal"],
    ['Ghar i tbib', 'Appelle le médecin'],
    ['Ghar i samu', 'Appelle le SAMU'],
    ['Ghar i mama', 'Appelle maman'],
    ['Ghar i baba', 'Appelle papa'],
  ],
};

// ───────────────────────────────────────────────
// ÉTAT
// ───────────────────────────────────────────────
const state = {
  cat: 'Besoins',
  currentText: '',
  currentFr: '',
  scanMode: false,
  scanIndex: 0,
  scanTargets: [],
  scanTimer: null,
  scanSpeed: 2000,
  fontSize: 36,
  cloudUrl: '',
  anthropicKey: '',
};

// ───────────────────────────────────────────────
// DOM
// ───────────────────────────────────────────────
const $ = id => document.getElementById(id);
const displayText = $('displayText');
const displayFr   = $('displayFr');
const voiceStatus = $('voiceStatus');
const scanBar     = $('scanBar');
const scanIndicator = $('scanIndicator');

// ───────────────────────────────────────────────
// PERSISTANCE
// ───────────────────────────────────────────────
function loadPrefs() {
  try {
    state.scanSpeed    = parseFloat(localStorage.taqvoxScanSpeed || '2') * 1000;
    state.fontSize     = parseInt(localStorage.taqvoxFontSize   || '36');
    state.cloudUrl     = localStorage.taqvoxCloudUrl            || '';
    state.anthropicKey = localStorage.taqvoxAnthropicKey        || '';
    document.documentElement.style.setProperty('--font-size', state.fontSize + 'px');
    $('scanSpeed').value    = state.scanSpeed / 1000;
    $('scanSpeedVal').textContent = (state.scanSpeed / 1000) + 's';
    $('fontSize').value     = state.fontSize;
    $('fontSizeVal').textContent  = state.fontSize + 'px';
    $('cloudUrl').value     = state.cloudUrl;
    $('anthropicKey').value = state.anthropicKey;
  } catch(e){}
}

function savePrefs() {
  localStorage.taqvoxScanSpeed    = $('scanSpeed').value;
  localStorage.taqvoxFontSize     = $('fontSize').value;
  localStorage.taqvoxCloudUrl     = $('cloudUrl').value;
  localStorage.taqvoxAnthropicKey = $('anthropicKey').value;
  state.scanSpeed    = parseFloat($('scanSpeed').value) * 1000;
  state.fontSize     = parseInt($('fontSize').value);
  state.cloudUrl     = $('cloudUrl').value;
  state.anthropicKey = $('anthropicKey').value;
  document.documentElement.style.setProperty('--font-size', state.fontSize + 'px');
  $('panelSettings').classList.add('hidden');
  renderAll();
}

// ───────────────────────────────────────────────
// CONVERSION VOIX
// ───────────────────────────────────────────────

// Conversion kabyle "WhatsApp" → arabe phonétique pour voix iPhone arabe
function toArabicPhonetic(text) {
  let t = (text || '').toLowerCase();
  // Règles multi-caractères d'abord
  const rules = [
    // Mots kabyles connus → phonétique arabe
    [/vghigh|vɣigh/g,    'ڤغيغ'],
    [/adgnagh/g,          'ادڨناغ'],
    [/i9ar7iyi/g,         'يقارحيّ'],
    [/9a3diyi/g,          'قاعديّ'],
    [/dewriyi/g,          'دوريّ'],
    [/sersiyi/g,          'سرسيّ'],
    [/sma7iyi/g,          'سماحيّ'],
    [/tanemmirt/g,        'تانيميرت'],
    [/adgnagh/g,          'ادڨناغ'],
    [/ma3lich/g,          'ماعليش'],
    [/ur zmiregh ara/g,   'ور زميريغ ارا'],
    [/ur vghigh ara/g,    'ور ڤغيغ ارا'],
    [/ghar i tbib/g,      'غار إ تبيب'],
    [/ghar i mama/g,      'غار إ ماما'],
    [/ghar i baba/g,      'غار إ بابا'],
    [/ghar i gma/g,       'غار إ ڨما'],
    [/ghar i weltma/g,    'غار إ ولتما'],
    [/ghar i samu/g,      'غار إ سامو'],
    [/qim yidi/g,         'قيم ييدي'],
    [/taliyid/g,          'تاليّيد'],
    // Digraphes
    [/gh/g, 'غ'], [/kh/g, 'خ'], [/ch/g, 'ش'], [/dh/g, 'ذ'],
    // Chiffres spéciaux kabyles
    [/3/g, 'ع'], [/7/g, 'ح'], [/9/g, 'ق'], [/v/g, 'ڤ'],
    // Lettres latines → arabe phonétique
    [/a/g,'ا'], [/b/g,'ب'], [/d/g,'د'], [/e/g,'ي'],
    [/f/g,'ف'], [/g/g,'ڨ'], [/h/g,'ه'], [/i/g,'ي'],
    [/j/g,'ج'], [/k/g,'ك'], [/l/g,'ل'], [/m/g,'م'],
    [/n/g,'ن'], [/o/g,'و'], [/p/g,'پ'], [/r/g,'ر'],
    [/s/g,'س'], [/t/g,'ت'], [/u/g,'و'], [/w/g,'و'],
    [/x/g,'خ'], [/y/g,'ي'], [/z/g,'ز'],
  ];
  for (const [a, b] of rules) t = t.replace(a, b);
  return t.replace(/\s+/g, ' ').trim();
}

// Texte kabyle standardisé pour affichage
function toKabyleDisplay(text) {
  let t = (text || '');
  return t
    .replace(/gh/gi, 'ɣ').replace(/kh/gi, 'x').replace(/ch/gi, 'č')
    .replace(/3/g, 'ɛ').replace(/7/g, 'ḥ').replace(/9/g, 'q').replace(/v/gi, 'v');
}

// ───────────────────────────────────────────────
// VOIX
// ───────────────────────────────────────────────
let voices = [];
if ('speechSynthesis' in window) {
  speechSynthesis.onvoiceschanged = () => { voices = speechSynthesis.getVoices(); };
  voices = speechSynthesis.getVoices();
}

function bestVoice() {
  // Priorité : voix arabe algérienne, puis arabe, puis française
  return voices.find(v => /ar[-_]DZ/i.test(v.lang))
      || voices.find(v => /^ar/i.test(v.lang))
      || voices.find(v => /arab/i.test(v.name))
      || voices.find(v => /^fr/i.test(v.lang))
      || null;
}

async function speakWithCloudTTS(text) {
  // Essai serveur kabyle IA (facebook/mms-tts-kab)
  if (state.cloudUrl) {
    try {
      voiceStatus.textContent = '⏳ Voix IA kabyle…';
      const r = await fetch(state.cloudUrl, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({text, mode: 'kabyle'})
      });
      if (!r.ok) throw new Error('Serveur IA indisponible');
      const blob = await r.blob();
      const audio = new Audio(URL.createObjectURL(blob));
      $('btnSpeak').classList.add('speaking');
      await audio.play();
      audio.onended = () => $('btnSpeak').classList.remove('speaking');
      voiceStatus.textContent = '✓ Voix IA kabyle';
      return true;
    } catch(e) {
      voiceStatus.textContent = '⚠️ Serveur IA indisponible — voix de secours';
    }
  }
  return false;
}

async function speak(text, fr) {
  if (!text) return;

  // Mise à jour affichage
  state.currentText = text;
  state.currentFr   = fr || '';
  displayText.textContent = text;
  displayFr.textContent   = fr || '';

  // 1. Essai voix IA kabyle cloud
  const cloudOk = await speakWithCloudTTS(text);
  if (cloudOk) return;

  // 2. Voix de navigateur avec texte arabe phonétique
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
    const arabic = toArabicPhonetic(text);
    const u = new SpeechSynthesisUtterance(arabic);
    const v = bestVoice();
    if (v) { u.voice = v; u.lang = v.lang; }
    else u.lang = 'ar-DZ';
    u.rate  = 0.62;
    u.pitch = 1.0;

    $('btnSpeak').classList.add('speaking');
    u.onend = () => {
      $('btnSpeak').classList.remove('speaking');
      voiceStatus.textContent = v ? `✓ Voix ${v.lang}` : '✓ Voix arabe phonétique';
    };
    speechSynthesis.speak(u);
    voiceStatus.textContent = '🔊 Lecture…';
  }
}

// ───────────────────────────────────────────────
// RENDU
// ───────────────────────────────────────────────
function renderCategories() {
  const nav = $('categories');
  nav.innerHTML = Object.keys(PHRASES).map(cat =>
    `<button class="cat-btn scan-target ${state.cat === cat ? 'active' : ''}" data-cat="${cat}">${cat}</button>`
  ).join('');
  nav.querySelectorAll('[data-cat]').forEach(b =>
    b.addEventListener('click', () => { state.cat = b.dataset.cat; renderAll(); })
  );
}

function renderPhrases() {
  const section = $('phrases');
  const list = PHRASES[state.cat] || [];
  section.innerHTML = list.map(([kab, fr]) =>
    `<button class="btn-phrase scan-target" data-say="${kab}" data-fr="${fr}">
      ${kab}<small>${fr}</small>
    </button>`
  ).join('');
  section.querySelectorAll('[data-say]').forEach(b =>
    b.addEventListener('click', () => speak(b.dataset.say, b.dataset.fr))
  );
}

function renderAll() {
  renderCategories();
  renderPhrases();
  if (state.scanMode) refreshScanTargets();
}

// ───────────────────────────────────────────────
// MODE SCAN
// ───────────────────────────────────────────────
function refreshScanTargets() {
  state.scanTargets = Array.from(document.querySelectorAll('.scan-target'));
}

function startScan() {
  state.scanMode = true;
  state.scanIndex = 0;
  $('btnScanToggle').classList.add('active');
  $('btnScanToggle').textContent = '⏸ Scan';
  scanIndicator.classList.remove('hidden');
  refreshScanTargets();
  nextScan();
}

function stopScan() {
  state.scanMode = false;
  clearTimeout(state.scanTimer);
  $('btnScanToggle').classList.remove('active');
  $('btnScanToggle').textContent = '⟳ Scan';
  scanIndicator.classList.add('hidden');
  // Retire la surbrillance
  document.querySelectorAll('.scan-active').forEach(el => el.classList.remove('scan-active'));
  // Cache la barre
  scanBar.style.width = '0%';
}

function nextScan() {
  if (!state.scanMode) return;
  // Retire surbrillance précédente
  document.querySelectorAll('.scan-active').forEach(el => el.classList.remove('scan-active'));

  refreshScanTargets();
  if (!state.scanTargets.length) return;

  if (state.scanIndex >= state.scanTargets.length) state.scanIndex = 0;

  const target = state.scanTargets[state.scanIndex];
  target.classList.add('scan-active');
  // Scroll vers le bouton actif
  target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });

  // Barre de progression
  scanBar.style.transition = 'none';
  scanBar.style.width = '0%';
  requestAnimationFrame(() => {
    scanBar.style.transition = `width ${state.scanSpeed}ms linear`;
    scanBar.style.width = '100%';
  });

  state.scanIndex++;
  state.scanTimer = setTimeout(nextScan, state.scanSpeed);
}

function selectCurrentScan() {
  if (!state.scanMode) return;
  clearTimeout(state.scanTimer);
  const target = document.querySelector('.scan-active');
  if (target) {
    // Simule le clic
    target.click();
    // Petite pause après sélection, puis reprend
    setTimeout(() => {
      if (state.scanMode) nextScan();
    }, 400);
  }
}

// ───────────────────────────────────────────────
// ACTIONS BOUTONS SPEAK/CLEAR
// ───────────────────────────────────────────────
$('btnSpeak').addEventListener('click', () => {
  if (state.scanMode) { selectCurrentScan(); return; }
  speak(state.currentText || 'Azul', state.currentFr);
});

$('btnClear').addEventListener('click', () => {
  state.currentText = '';
  state.currentFr   = '';
  displayText.textContent = '—';
  displayFr.textContent   = '';
  voiceStatus.textContent = '';
  speechSynthesis.cancel();
});

$('btnVoiceTest').addEventListener('click', () => {
  speak('Azul, Vghigh aman', "Bonjour, je veux de l'eau");
});

// Urgences
document.querySelectorAll('.btn-emergency').forEach(b => {
  b.addEventListener('click', () => speak(b.dataset.say, b.dataset.fr));
});

// ───────────────────────────────────────────────
// TOGGLE SCAN
// ───────────────────────────────────────────────
$('btnScanToggle').addEventListener('click', () => {
  if (state.scanMode) stopScan(); else startScan();
});

// Clic n'importe où = sélection en mode scan
document.addEventListener('click', e => {
  // Ignore si clic sur un bouton de contrôle
  if (!state.scanMode) return;
  const ctrl = e.target.closest('.ctrl-btn, .panel-inner, #panelSettings');
  if (ctrl) return;
  // Si clic sur un scan-target, il le gère lui-même
  if (e.target.closest('.scan-target')) return;
  // Sinon, sélectionne le scan actif
  selectCurrentScan();
}, true);

// Accessibilité : touche espace ou entrée = sélection
document.addEventListener('keydown', e => {
  if (!state.scanMode) return;
  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault();
    selectCurrentScan();
  }
});

// ───────────────────────────────────────────────
// RÉGLAGES
// ───────────────────────────────────────────────
$('btnSettings').addEventListener('click', () => {
  $('panelSettings').classList.remove('hidden');
});

$('btnCloseSettings').addEventListener('click', () => {
  $('panelSettings').classList.add('hidden');
});

$('btnSaveSettings').addEventListener('click', savePrefs);

$('scanSpeed').addEventListener('input', e => {
  $('scanSpeedVal').textContent = e.target.value + 's';
});

$('fontSize').addEventListener('input', e => {
  $('fontSizeVal').textContent = e.target.value + 'px';
  document.documentElement.style.setProperty('--font-size', e.target.value + 'px');
});

// ───────────────────────────────────────────────
// SERVICE WORKER (offline)
// ───────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

// ───────────────────────────────────────────────
// INIT
// ───────────────────────────────────────────────
loadPrefs();
renderAll();

// Pré-charge les voix
if ('speechSynthesis' in window) {
  voices = speechSynthesis.getVoices();
  speechSynthesis.onvoiceschanged = () => { voices = speechSynthesis.getVoices(); };
}
