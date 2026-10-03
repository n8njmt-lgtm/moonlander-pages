export const SCORE_KEY='moonlander-flight-times-v2-1';
export function cleanName(value){return String(value).normalize('NFKC').replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,12);}
export function normalizeScores(value){if(!Array.isArray(value))return [];return value.filter(s=>s&&typeof s.name==='string'&&Number.isFinite(s.seconds)&&s.seconds>0&&s.seconds<=150).map(s=>({name:cleanName(s.name)||'Pilot',seconds:Math.round(s.seconds*100)/100})).sort((a,b)=>a.seconds-b.seconds).slice(0,10);}
export function readScores(storage){try{return {scores:normalizeScores(JSON.parse(storage.getItem(SCORE_KEY)||'[]')),available:true};}catch{return {scores:[],available:false};}}
export function saveScore(storage,name,seconds){const current=readScores(storage);if(!current.available)throw new Error('Die Bestenliste kann in diesem Browser nicht gespeichert werden.');const scores=normalizeScores([...current.scores,{name:cleanName(name)||'Pilot',seconds}]);storage.setItem(SCORE_KEY,JSON.stringify(scores));return scores;}
export const formatTime=seconds=>seconds.toFixed(2).replace('.',',')+' s';
