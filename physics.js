export const W=1200,H=500,WORLD_WIDTH=4400,TIME_LIMIT=150,HALF=18,FOOT=22,LIMIT_X=24,LIMIT_Y=32;
export const pad={left:4110,right:4290,y:410};
export const terrain=[[0,410],[130,370],[270,405],[420,335],[560,385],[730,285],[860,350],[1010,310],[1190,400],[1350,350],[1510,250],[1680,345],[1810,390],[1970,305],[2120,375],[2290,270],[2440,355],[2620,395],[2780,325],[2920,245],[3080,355],[3230,395],[3380,300],[3520,365],[3700,275],[3830,355],[3970,395],[4110,410],[4290,410],[4400,390]];
export const cameraAt=x=>Math.max(0,Math.min(WORLD_WIDTH-W,x-360));
export function groundAt(x){for(let i=1;i<terrain.length;i++){const a=terrain[i-1],b=terrain[i];if(x<=b[0])return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);}return terrain.at(-1)[1];}
export function createState(){return {x:120,y:150,vx:18,vy:0,time:TIME_LIMIT,elapsed:0,status:'ready',reason:'',meteors:[],nextStorm:16,storms:0};}
function sweptHit(ax,ay,bx,by,r){const dx=bx-ax,dy=by-ay,d=dx*dx+dy*dy,t=d?Math.max(0,Math.min(1,-(ax*dx+ay*dy)/d)):0;return (ax+dx*t)**2+(ay+dy*t)**2<=r*r;}
export function advance(s,keys,dt){if(s.status!=='running')return s;
 const oldX=s.x,oldY=s.y,oldBottom=s.y+FOOT;
 s.vx+=((keys.has('ArrowRight')?1:0)-(keys.has('ArrowLeft')?1:0))*30*dt;
 s.vy+=(6+((keys.has('ArrowDown')?1:0)-(keys.has('ArrowUp')?1:0))*30)*dt;
 s.x+=s.vx*dt;s.y+=s.vy*dt;s.time=Math.max(0,s.time-dt);s.elapsed+=dt;
 const crash=reason=>{s.status='crashed';s.reason=reason;return s;};
 if(s.x-HALF<0||s.x+HALF>WORLD_WIDTH||s.y-FOOT<0||s.y+FOOT>H)return crash('Du hast den Flugbereich verlassen.');
 if(s.time<=0)return crash('Die 150 Sekunden sind abgelaufen.');
 // The same light showers every flight keep recorded landing times comparable.
 if(s.elapsed>=s.nextStorm){
  if(s.x<pad.left-450){const ahead=s.storms%2?760:620;for(let i=0;i<2;i++)s.meteors.push({x:Math.min(WORLD_WIDTH-70,s.x+ahead+i*230),y:-35-i*140,vx:-24-i*8,vy:55+i*7,r:11+i*2,angle:s.storms+i});}
  s.storms++;s.nextStorm+=18;
 }
 for(const m of s.meteors){const mx=m.x,my=m.y;m.x+=m.vx*dt;m.y+=m.vy*dt;m.angle+=dt;
  if(sweptHit(mx-oldX,my-oldY,m.x-s.x,m.y-s.y,m.r+18))return crash('Ein Meteorit hat deine Landefähre getroffen.');
 }
 s.meteors=s.meteors.filter(m=>m.y-m.r<groundAt(m.x)&&m.x+m.r>0);
 const onPad=s.x-HALF>=pad.left&&s.x+HALF<=pad.right;
 if(onPad&&oldBottom<=pad.y&&s.y+FOOT>=pad.y&&s.vy>=0){if(Math.abs(s.vx)<=LIMIT_X&&s.vy<=LIMIT_Y){s.y=pad.y-FOOT;s.status='landed';s.reason='Sanft gelandet. Mission erfüllt.';}else crash('Zu schnell aufgesetzt. Bremse früher mit Gegenschub.');return s;}
 const left=s.x-HALF,right=s.x+HALF;
 let top=Math.min(groundAt(left),groundAt(right));for(const [x,y]of terrain)if(x>=left&&x<=right)top=Math.min(top,y);
 if(s.y+FOOT>=top)return crash(onPad?'Zu schnell aufgesetzt.':'Du hast einen Berg berührt.');return s;
}
