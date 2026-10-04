import {startAttempt,advance,LEVELS,MAX_CAMPAIGN_SECONDS} from './physics.js';
export const REPLAY_VERSION='moonlander-3.0';
const step=1/120,arrowNames=['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'],maxFrames=MAX_CAMPAIGN_SECONDS*120,maxRuns=40000;
export function inputMask(keys){return arrowNames.reduce((mask,key,i)=>mask|(keys.has(key)?1<<i:0),0);}
// Eine Aufzeichnung umfasst die ganze Expedition. Pausen und Zwischenbildschirme erzeugen keine Schritte.
export class FlightRecorder {
 constructor(){this.runs=[];this.frames=0;}
 record(keys){if(this.frames>=maxFrames)throw new Error('Flugaufzeichnung ist zu lang.');const mask=inputMask(keys),last=this.runs.at(-1);if(last&&last[1]===mask)last[0]++;else this.runs.push([1,mask]);this.frames++;}
 snapshot(){return {version:REPLAY_VERSION,runs:this.runs.map(run=>[...run])};}
}
// The backend must supply the seed from its stored flight ticket, never from the score request.
// Ablauf wie im Spiel: Landung → nächste Mission, Absturz → neuer Versuch derselben Mission. Die Zeit aller Versuche zählt.
export function verifyFlight(seed,payload){
 if(!Number.isInteger(seed)||seed<0||seed>0xffffffff)throw new Error('Ungültiger Flug-Seed.');
 if(!payload||payload.version!==REPLAY_VERSION||!Array.isArray(payload.runs)||payload.runs.length===0||payload.runs.length>maxRuns)throw new Error('Ungültige Flugaufzeichnung.');
 let frames=0;for(const run of payload.runs){if(!Array.isArray(run)||run.length!==2||!Number.isInteger(run[0])||run[0]<1||!Number.isInteger(run[1])||run[1]<0||run[1]>15)throw new Error('Ungültige Steuereingaben.');frames+=run[0];if(frames>maxFrames)throw new Error('Flugaufzeichnung ist zu lang.');}
 const last=LEVELS.length-1;let level=0,attempt=0,attempts=1,state=startAttempt(seed,0,0),completed=0;state.status='running';
 for(const [ticks,mask]of payload.runs){const keys=new Set(arrowNames.filter((_,i)=>mask&(1<<i)));for(let i=0;i<ticks;i++){
  if(state.status!=='running'){if(state.status==='landed'){if(level===last)throw new Error('Die Aufzeichnung endet nicht mit der Landung.');level++;attempt=0;}else attempt++;attempts++;state=startAttempt(seed,level,attempt);state.status='running';}
  advance(state,keys,step);completed++;
 }}
 if(level!==last||state.status!=='landed')throw new Error('Keine vollständige Expedition mit drei Landungen aufgezeichnet.');
 return {version:REPLAY_VERSION,seconds:Math.round(completed/120*100)/100,frames:completed,attempts};
}
