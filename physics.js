export const W=1200,H=500,HALF=18,FOOT=22,LIMIT_X=24,LIMIT_Y=32;
export const pad={left:974,right:1128,y:410};
export const terrain=[[0,398],[70,366],[130,400],[210,324],[256,348],[310,295],[357,337],[405,374],[455,347],[512,393],[575,361],[632,400],[696,343],[742,380],[797,329],[850,371],[911,395],[974,410],[1128,410],[1163,389],[1200,399]];
export function groundAt(x){for(let i=1;i<terrain.length;i++){const a=terrain[i-1],b=terrain[i];if(x<=b[0])return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);}return 399;}
export function createState(){return {x:120,y:175,vx:18,vy:0,time:75,status:'ready',reason:''};}
export function advance(s,keys,dt){if(s.status!=='running')return s; const oldBottom=s.y+FOOT;
 s.vx+=((keys.has('ArrowRight')?1:0)-(keys.has('ArrowLeft')?1:0))*30*dt;
 s.vy+=(6+((keys.has('ArrowDown')?1:0)-(keys.has('ArrowUp')?1:0))*30)*dt;
 s.x+=s.vx*dt;s.y+=s.vy*dt;s.time=Math.max(0,s.time-dt);
 const crash=reason=>{s.status='crashed';s.reason=reason;return s;};
 if(s.x-HALF<0||s.x+HALF>W||s.y-FOOT<0||s.y+FOOT>H)return crash('Du hast den Flugbereich verlassen.');
 if(s.time<=0)return crash('Die 75 Sekunden sind abgelaufen.');
 const onPad=s.x-HALF>=pad.left&&s.x+HALF<=pad.right;
 if(onPad&&oldBottom<=pad.y&&s.y+FOOT>=pad.y&&s.vy>=0){if(Math.abs(s.vx)<=LIMIT_X&&s.vy<=LIMIT_Y){s.y=pad.y-FOOT;s.status='landed';s.reason='Sanft gelandet. Mission erfüllt.';}else crash('Zu schnell aufgesetzt. Bremse früher mit Gegenschub.');return s;}
 const left=s.x-HALF,right=s.x+HALF;
 let top=Math.min(groundAt(left),groundAt(right));for(const [x,y]of terrain)if(x>=left&&x<=right)top=Math.min(top,y);
 if(s.y+FOOT>=top)return crash(onPad?'Zu schnell aufgesetzt.':'Du hast einen Berg berührt.');return s;
}
