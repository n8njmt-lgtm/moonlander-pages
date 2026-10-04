import {createState,advance,TIME_LIMIT} from './physics.js';
export const REPLAY_VERSION='moonlander-2.1';
const step=1/120,arrowNames=['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'];
export function inputMask(keys){return arrowNames.reduce((mask,key,i)=>mask|(keys.has(key)?1<<i:0),0);}
export class FlightRecorder {
 constructor(){this.runs=[];this.frames=0;}
 record(keys){if(this.frames>=TIME_LIMIT*120)throw new Error('Flugaufzeichnung ist zu lang.');const mask=inputMask(keys),last=this.runs.at(-1);if(last&&last[1]===mask)last[0]++;else this.runs.push([1,mask]);this.frames++;}
 snapshot(){return {version:REPLAY_VERSION,runs:this.runs.map(run=>[...run])};}
}
// The backend must supply the seed from its stored flight ticket, never from the score request.
export function verifyFlight(seed,payload){
 if(!Number.isInteger(seed)||seed<0||seed>0xffffffff)throw new Error('Ungültiger Flug-Seed.');
 if(!payload||payload.version!==REPLAY_VERSION||!Array.isArray(payload.runs)||payload.runs.length===0||payload.runs.length>18000)throw new Error('Ungültige Flugaufzeichnung.');
 let frames=0;for(const run of payload.runs){if(!Array.isArray(run)||run.length!==2||!Number.isInteger(run[0])||run[0]<1||!Number.isInteger(run[1])||run[1]<0||run[1]>15)throw new Error('Ungültige Steuereingaben.');frames+=run[0];if(frames>TIME_LIMIT*120)throw new Error('Flugaufzeichnung ist zu lang.');}
 const state=createState(seed);state.status='running';let completed=0;
 for(const [ticks,mask]of payload.runs){const keys=new Set(arrowNames.filter((_,i)=>mask&(1<<i)));for(let i=0;i<ticks;i++){advance(state,keys,step);completed++;if(state.status==='crashed')throw new Error('Dieser Flug ist abgestürzt.');if(state.status==='landed'&&completed!==frames)throw new Error('Die Aufzeichnung endet nicht mit der Landung.');}}
 if(state.status!=='landed')throw new Error('Keine erfolgreiche Landung aufgezeichnet.');
 return {version:REPLAY_VERSION,seconds:Math.round(completed/120*100)/100,frames:completed};
}
