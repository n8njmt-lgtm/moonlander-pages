export const W=1200,H=500,HALF=18,FOOT=22,LIMIT_X=24,LIMIT_Y=32,MAX_CAMPAIGN_SECONDS=900;
// Nur +, -, *, / und Math.imul: Browser (auch Safari) und Server-Nachprüfung rechnen damit bitgleich. Kein Math.sin/cos in der Physik.
function roughen(points,amp,step,seed){const out=[];const rnd=()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<points.length;i++){const p=points[i],q=points[i+1];out.push(p);if(!q||p[1]===q[1])continue;const n=Math.floor((q[0]-p[0])/step);for(let k=1;k<n;k++){const t=k/n;out.push([Math.round(p[0]+(q[0]-p[0])*t),Math.round(p[1]+(q[1]-p[1])*t+(rnd()-.5)*amp)]);}}
 return out;}
// Drei Missionen mit steigendem Schwierigkeitsgrad. Mission 1 entspricht exakt dem bisherigen Anflug 2.1.
export const LEVELS=[
 {id:'moon',name:'Mond',width:5200,time:150,gravity:6,wind:0,start:{x:120,y:150,vx:18},
  pad:{left:3600,right:3930,y:410},meteors:{first:16,gap:14,spread:8,single:.55,double:1,speed:1},
  terrain:[[0,410],[130,370],[270,405],[420,335],[560,385],[730,285],[860,350],[1010,310],[1190,400],[1350,350],[1510,250],[1680,345],[1810,390],[1970,305],[2120,375],[2290,270],[2440,355],[2620,395],[2780,325],[2920,245],[3080,355],[3230,395],[3380,375],[3490,402],[3600,410],[3930,410],[4060,425],[4220,415],[4400,430],[4600,410],[4800,420],[5000,405],[5200,420]]},
 {id:'mars',name:'Mars',width:5600,time:140,gravity:8,wind:9,start:{x:120,y:150,vx:18},
  pad:{left:4000,right:4240,y:425},meteors:{first:12,gap:11,spread:6,single:.4,double:.85,speed:1.15},
  terrain:roughen([[0,425],[150,395],[300,420],[430,330],[540,375],[660,260],[760,330],[900,380],[1040,290],[1150,215],[1260,300],[1400,405],[1540,350],[1660,240],[1760,195],[1880,300],[2000,390],[2150,330],[2280,250],[2380,300],[2500,410],[2650,360],[2790,230],[2880,185],[2990,280],[3120,380],[3260,330],[3400,260],[3520,330],[3640,390],[3760,410],[3880,418],[3960,422],[4000,425],[4240,425],[4300,430],[4420,415],[4600,440],[4800,400],[5000,430],[5200,410],[5400,430],[5600,420]],28,16,0x6d617273)},
 {id:'xenara',name:'Xenara',width:5000,time:130,gravity:9.5,wind:5,start:{x:120,y:140,vx:18},
  pad:{left:3880,right:4040,y:462},meteors:{first:10,gap:9,spread:5,single:.3,double:.75,speed:1.25},
  // Landeplatz tief im Canyon: Die steilen Wände links und rechts sind echte Kollisionsfläche.
  terrain:roughen([[0,430],[140,400],[260,430],[380,330],[450,210],[520,340],[640,420],[780,380],[900,250],[960,175],[1030,260],[1150,400],[1290,430],[1420,340],[1520,200],[1600,150],[1690,230],[1800,380],[1950,420],[2080,300],[2180,205],[2260,300],[2400,410],[2560,360],[2700,240],[2780,170],[2850,250],[2980,380],[3120,330],[3260,250],[3380,210],[3500,190],[3640,175],[3760,168],[3815,172]],12,30,0x78656e61).concat([[3830,240],[3842,300],[3850,380],[3862,440],[3872,455],[3880,462],[4040,462],[4048,455],[4058,440],[4068,380],[4076,300],[4088,240],[4102,150],[4130,118],[4260,112],[4400,160],[4560,260],[4700,330],[4850,300],[5000,320]])}
];
// Kompatibilität: Mission 1 bleibt unter den bisherigen Namen verfügbar.
export const WORLD_WIDTH=LEVELS[0].width,TIME_LIMIT=LEVELS[0].time,pad=LEVELS[0].pad,terrain=LEVELS[0].terrain;
export function cameraAt(x,L=LEVELS[0]){const anchor=(L.pad.left+L.pad.right)/2-W/2;return Math.max(0,Math.min(L.width-W,Math.min(x-360,anchor)+Math.max(0,x-anchor-W*.78)));}
export function horizontalVelocity(v,dir,dt){if(!dir)return v;const acceleration=dir*v<0?48:30;if(dir*v<0&&Math.abs(v)<=48*dt)return dir*30*(dt-Math.abs(v)/48)||0;return v+dir*acceleration*dt;}
function random(s,key='seed'){s[key]=(Math.imul(1664525,s[key])+1013904223)>>>0;return s[key]/4294967296;}
export function groundAt(x,L=LEVELS[0]){const t=L.terrain;for(let i=1;i<t.length;i++){const a=t[i-1],b=t[i];if(x<=b[0])return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);}return t.at(-1)[1];}
export function createState(seed=Math.floor(Math.random()*4294967296),level=0){const L=LEVELS[level];return {seed:seed>>>0,level,x:L.start.x,y:L.start.y,vx:L.start.vx,vy:0,time:L.time,elapsed:0,status:'ready',reason:'',meteors:[],nextStorm:L.meteors.first,storms:0,...(L.wind?{windSeed:(seed^0x5bd1e995)>>>0,wind:0,windTarget:0,nextGust:0}:{})};}
// Jeder Versuch einer Mission erhält einen eigenen, aus dem Server-Seed abgeleiteten Seed.
export const levelSeed=(seed,level,attempt)=>(seed+Math.imul(level,0x9e3779b1)+Math.imul(attempt,0x85ebca77))>>>0;
export function startAttempt(seed,level,attempt){return createState(levelSeed(seed,level,attempt),level);}
function sweptHit(ax,ay,bx,by,r){const dx=bx-ax,dy=by-ay,d=dx*dx+dy*dy,t=d?Math.max(0,Math.min(1,-(ax*dx+ay*dy)/d)):0;return (ax+dx*t)**2+(ay+dy*t)**2<=r*r;}
export function advance(s,keys,dt){if(s.status!=='running')return s;
 const L=LEVELS[s.level||0],P=L.pad,oldX=s.x,oldY=s.y,oldBottom=s.y+FOOT;
 // Böen: neue Zielstärke in unregelmäßigen Abständen, danach lineare Annäherung.
 if(L.wind){if(s.elapsed>=s.nextGust){s.windTarget=(random(s,'windSeed')*2-1)*L.wind;s.nextGust+=2.5+random(s,'windSeed')*2.5;}const change=L.wind*.8*dt;s.wind+=Math.max(-change,Math.min(change,s.windTarget-s.wind));}
 s.vx=horizontalVelocity(s.vx,(keys.has('ArrowRight')?1:0)-(keys.has('ArrowLeft')?1:0),dt)+(L.wind?s.wind*dt:0);
 s.vy+=(L.gravity+((keys.has('ArrowDown')?1:0)-(keys.has('ArrowUp')?1:0))*30)*dt;
 s.x+=s.vx*dt;s.y+=s.vy*dt;s.time=Math.max(0,s.time-dt);s.elapsed+=dt;
 const crash=reason=>{s.status='crashed';s.reason=reason;return s;};
 if(s.x-HALF<0||s.x+HALF>L.width||s.y-FOOT<0||s.y+FOOT>H)return crash('Du hast den Flugbereich verlassen.');
 if(s.time<=0)return crash(`Die ${L.time} Sekunden sind abgelaufen.`);
 // Seeded per flight: varied showers, reproducible within a flight and in tests.
 if(s.elapsed>=s.nextStorm){
  if(s.x<P.left-900){const r=random(s),count=r<L.meteors.single?1:r<L.meteors.double?2:3,v=L.meteors.speed;for(let i=0;i<count;i++){
   s.meteors.push({x:Math.min(L.width-70,s.x+480+random(s)*450+i*150),y:-35-i*120,vx:(-48+random(s)*75)*v,vy:(40+random(s)*28)*v,ax:-2+random(s)*4,ay:2+random(s)*4,r:8+random(s)*6,angle:random(s)*Math.PI*2,spin:-1.2+random(s)*2.4});
  }}
  s.storms++;s.nextStorm+=L.meteors.gap+random(s)*L.meteors.spread;
 }
 for(const m of s.meteors){const mx=m.x,my=m.y;m.vx+=(m.ax||0)*dt;m.vy+=(m.ay||0)*dt;m.x+=m.vx*dt;m.y+=m.vy*dt;m.angle+=(m.spin??1)*dt;
  if(sweptHit(mx-oldX,my-oldY,m.x-s.x,m.y-s.y,m.r+18))return crash('Ein Meteorit hat deine Landefähre getroffen.');
 }
 s.meteors=s.meteors.filter(m=>m.y-m.r<groundAt(m.x,L)&&m.x+m.r>0);
 const onPad=s.x-HALF>=P.left&&s.x+HALF<=P.right;
 if(onPad&&oldBottom<=P.y&&s.y+FOOT>=P.y&&s.vy>=0){if(Math.abs(s.vx)<=LIMIT_X&&s.vy<=LIMIT_Y){s.y=P.y-FOOT;s.status='landed';s.reason='Sanft gelandet. Mission erfüllt.';}else crash('Zu schnell aufgesetzt. Bremse früher mit Gegenschub.');return s;}
 const left=s.x-HALF,right=s.x+HALF;
 let top=Math.min(groundAt(left,L),groundAt(right,L));for(const [x,y]of L.terrain)if(x>=left&&x<=right)top=Math.min(top,y);
 if(s.y+FOOT>=top)return crash(onPad?'Zu schnell aufgesetzt.':L.id==='xenara'&&s.x>P.left-200&&s.x<P.right+200?'Du hast die Canyonwand berührt.':'Du hast einen Berg berührt.');return s;
}
