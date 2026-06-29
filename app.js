const $=id=>document.getElementById(id);

// Quand le serveur cloud sera prêt, remplace seulement cette adresse par ton URL /tts.
const CLOUD_TTS_URL='';

const state={cat:'Besoins',favs:JSON.parse(localStorage.taqvoxFavs||'[]')};

const data={
 'Besoins':[
  'Vghigh aman|Je veux de l’eau',
  'Vghigh adccagh|Je veux manger',
  'Adgnagh|Je veux dormir',
  'Ur vghigh ara|Je ne veux pas',
  'Asmid|J’ai froid',
  'I7ma|J’ai chaud'
 ],
 'Douleur':[
  'I9ar7iyi|J’ai mal',
  'I9ar7iyi uqerruy|J’ai mal à la tête',
  'I9ar7iyi a3bod|J’ai mal au ventre',
  'I9ar7iyi afus|J’ai mal à la main/bras',
  'I9ar7iyi adhar|J’ai mal à la jambe/pied',
  'I9ar7iyi atas|J’ai très mal'
 ],
 'Famille':[
  'Ghar i mama|Appelle maman',
  'Ghar i papa|Appelle papa',
  'Ghar i gma|Appelle mon frère',
  'Ghar i weltma|Appelle ma sœur',
  'Taliyid|Regarde-moi',
  'Qim yidi|Reste avec moi'
 ],
 'Position':[
  'Dewriyi|Retourne-moi',
  '9a3diyi|Redresse-moi',
  'Sersiyi|Baisse-moi',
  'Rfed aqerruy|Lève ma tête',
  'Sers aqerruy|Baisse ma tête',
  'Beddeliyi amkan|Change ma position'
 ],
 'Réponses':[
  'Ih|Oui',
  'Ala|Non',
  'Tanemmirt|Merci',
  'Sma7iyi|Pardon',
  'Ma3lich|Pas grave',
  '3iwedas|Répète'
 ],
 'Urgence':[
  'I9ar7iyi atas|J’ai très mal',
  'Ur zmiregh ara ad nefsegh|Je respire mal',
  'Ghar i tbib|Appelle le médecin',
  'Ghar i mama|Appelle maman',
  'Ghar i papa|Appelle papa'
 ],
 'Favoris':[]
};

// 1) MOTEUR VOIX PROPRE - Version simple et stable
// On ne transforme PLUS tout le mot en arabe. C'est ça qui cassait la voix.
// On garde le mot presque pareil, et on remplace seulement les sons spéciaux.

const WORD_PRONUNCIATION = {
  // mots exacts corrigés par toi
  'adccagh': 'adtchagh',   // Adccagh = Adtchagh
  'Adccagh': 'Adtchagh',
  'adhadh': 'aظaظ',       // dh = ظ
  'Adhadh': 'Aظaظ',
  'aghrom': 'aغروم',      // gh = غ, mais on garde le mot simple
  'Aghrom': 'Aغروم',
  'vghigh': 'vغيغ',
  'Vghigh': 'Vغيغ',
  'i9ar7iyi': 'iقارحيyi',
  'I9ar7iyi': 'Iقارحيyi',
  'a3bod': 'aعبود',
  'A3bod': 'Aعبود',
  'i7ma': 'iحma',
  'I7ma': 'Iحma'
};

function replaceSpecialSounds(word){
  if(WORD_PRONUNCIATION[word]) return WORD_PRONUNCIATION[word];
  let t=word;
  // Ordre important : les sons longs AVANT les sons courts.
  const rules=[
    [/cca/g,'tcha'], [/Cca/g,'Tcha'], [/CCA/g,'TCHA'],
    [/cci/g,'tchi'], [/Cci/g,'Tchi'], [/CCI/g,'TCHI'],
    [/cc/g,'tch'], [/Cc/g,'Tch'], [/CC/g,'TCH'],
    [/dh/g,'ظ'], [/Dh/g,'ظ'], [/DH/g,'ظ'],
    [/gh/g,'غ'], [/Gh/g,'غ'], [/GH/g,'غ'],
    [/kh/g,'خ'], [/Kh/g,'خ'], [/KH/g,'خ'],
    [/ch/g,'ش'], [/Ch/g,'ش'], [/CH/g,'ش'],
    [/3/g,'ع'], [/7/g,'ح'], [/9/g,'ق']
  ];
  for(const [a,b] of rules) t=t.replace(a,b);
  return t;
}

function toVoiceText(text){
  return (text||'')
    .split(/(\s+|[.,!?;:])/)
    .map(part=>replaceSpecialSounds(part))
    .join('')
    .replace(/\s+/g,' ')
    .trim();
}

// Texte interne pour futur vrai moteur IA kabyle.
function toKabyleInternal(text){
  return toVoiceText(text);
}

// Ancien nom gardé pour éviter les bugs dans le reste du code.
function toArabicPhonetic(text){
  return toVoiceText(text);
}

function bestArabicVoice(){
  const voices=speechSynthesis.getVoices ? speechSynthesis.getVoices() : [];
  return voices.find(v=>/^ar/i.test(v.lang)) || voices.find(v=>/arab/i.test(v.name)) || null;
}

function renderCats(){ $('categories').innerHTML=Object.keys(data).map(c=>`<button class="cat ${state.cat===c?'active':''}" data-cat="${c}">${c}</button>`).join(''); document.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{state.cat=b.dataset.cat;renderAll()});}
function listPhrases(){return state.cat==='Favoris'?state.favs:data[state.cat]}
function renderPhrases(){ $('phrases').innerHTML=listPhrases().map(item=>{let [kab,fr]=item.split('|');return `<button class="phrase" data-say="${kab}">${kab}<small>${fr||''}</small></button>`}).join(''); document.querySelectorAll('[data-say]').forEach(b=>b.onclick=()=>setAndSpeak(b.dataset.say));}
function renderKeys(){ const chars='a z e r t y u i o p q s d f g h j k l m w x c v b n 3 7 9 gh ch kh'.split(' '); $('keyboard').innerHTML=chars.map(k=>`<button class="key" data-k="${k}">${k}</button>`).join('')+`<button class="key" data-k=" ">␣</button><button class="key" data-del="1">⌫</button>`; document.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{$('textOut').value+=b.dataset.k; suggest()}); document.querySelector('[data-del]').onclick=()=>{$('textOut').value=$('textOut').value.slice(0,-1);suggest()};}
function suggest(){ const t=$('textOut').value.toLowerCase().trim(); const all=Object.values(data).flat().concat(state.favs); const res=[...new Set(all)].filter(x=>x.toLowerCase().startsWith(t)&&t.length>0).slice(0,6); $('suggestions').innerHTML=res.map(x=>{let [kab]=x.split('|');return `<button data-sug="${kab}">${kab}</button>`}).join(''); document.querySelectorAll('[data-sug]').forEach(b=>b.onclick=()=>setAndSpeak(b.dataset.sug));}
async function setAndSpeak(text){$('textOut').value=text; await speak(text)}

async function speak(text){
  const displayText=(text||'Azul').trim();
  const kabyleText=toKabyleInternal(displayText);
  const arabicText=toArabicPhonetic(displayText);
  $('status').textContent='Voix: '+displayText+' → '+arabicText;

  // Futur vrai moteur IA kabyle: on lui envoie les 3 écritures.
  if(CLOUD_TTS_URL){
    try{
      const r=await fetch(CLOUD_TTS_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({display_text:displayText,kabyle_text:kabyleText,arabic_phonetic:arabicText,mode:'sidiaich_arabizi'})});
      if(!r.ok) throw new Error('Erreur serveur IA');
      const blob=await r.blob();
      const audio=new Audio(URL.createObjectURL(blob));
      await audio.play();
      $('status').textContent='Voix IA Sidi Aïch utilisée.';
      return;
    }catch(e){ $('status').textContent='Serveur IA indisponible, voix iPhone arabe phonétique.'; }
  }

  if('speechSynthesis' in window){
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(arabicText);
    const arVoice=bestArabicVoice();
    if(arVoice) u.voice=arVoice;
    u.lang=arVoice ? arVoice.lang : 'ar-DZ';
    u.rate=.62;
    u.pitch=1;
    speechSynthesis.speak(u);
  } else alert(displayText+'\n'+arabicText);
}

function renderAll(){renderCats();renderPhrases();renderKeys();suggest()}
$('speakBtn').onclick=()=>speak($('textOut').value||'Azul');
$('btnVoice').onclick=()=>speak('Vghigh aman');
$('clearBtn').onclick=()=>{$('textOut').value='';suggest()};
$('favBtn').onclick=()=>{const v=$('textOut').value.trim(); if(v&&!state.favs.includes(v+'|Favori')){state.favs.unshift(v+'|Favori');localStorage.taqvoxFavs=JSON.stringify(state.favs);renderAll()}};
if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
if('speechSynthesis' in window) speechSynthesis.onvoiceschanged=()=>{};
renderAll();
