import {W,H,FOOT,LEVELS,groundAt} from './physics.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
// Gestaltung je Mission. Nur Darstellung: Kollision und Physik stehen ausschließlich in physics.js.
export const THEMES={
 moon:{outline:'#849ba9',shade:'#07142155',tint:null,pad:'#b4e745'},
 mars:{outline:'#f2a173',shade:'#2a0c0655',tint:'#c4552d',pad:'#b4e745',strata:'#3b120a'},
 xenara:{outline:'#7ff0d8',shade:'#12052a66',tint:'#5a44a8',pad:'#b4e745',strata:'#1a0a33'}
};
export function shipPose(s,keys){
 const L=LEVELS[s.level||0],pad=L.pad;
 const altitude=Math.max(0,groundAt(s.x,L)-s.y-FOOT);
 const braking=(s.vx>0&&keys.has('ArrowLeft'))||(s.vx<0&&keys.has('ArrowRight'));
 const approach=s.x>pad.left-600&&s.x<pad.right+300;
 const nearGround=clamp(altitude/140,0,1);
 let angle=Math.sign(s.vx)*Math.min(1.22,Math.abs(s.vx)/65*1.22);
 if(braking)angle*=.18;
 if(approach)angle*=nearGround;
 if(Math.abs(s.vx)<24)angle*=nearGround;
 return {angle:s.status==='landed'||s.status==='ready'?0:angle,gear:s.status==='landed'||altitude<=80?1:0,altitude};
}
function stars(ctx,camera,drift,count,color,alpha){for(let i=0;i<count;i++){const x=((i*173.21-camera*.11-drift*.28)%W+W)%W,y=(i*67.41)%330;ctx.globalAlpha=alpha+(i%4)*.12;ctx.fillStyle=color;ctx.fillRect(x,y,i%9===0?2:1,1);}ctx.globalAlpha=1;}
// Ferne Gebirgssilhouette: rein dekorativ, gleitet langsamer als die Oberfläche.
function ridge(ctx,offset,base,amp,freq,color,spiky){ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(0,H);for(let x=0;x<=W+20;x+=20){const u=(x+offset)*freq;let y=base-amp*(.55*Math.sin(u)+.3*Math.sin(u*2.7+1.3)+.15*Math.sin(u*6.1+.4));if(spiky)y-=amp*.9*Math.max(0,Math.sin(u*1.7+2))**8;ctx.lineTo(x,y);}ctx.lineTo(W,H);ctx.closePath();ctx.fill();}
function glow(ctx,x,y,r,color){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'#0000');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}
export function drawBackground(ctx,sky,camera,elapsed,reduced,level=0,wind=0){
 const drift=reduced?0:elapsed,id=LEVELS[level].id;
 if(id==='mars'){
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#13060a');g.addColorStop(.5,'#3a130f');g.addColorStop(1,'#7a3219');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  stars(ctx,camera,drift,40,'#ffe3d0',.12);
  const sunX=960-camera*.02;glow(ctx,sunX,72,70,'#ffe9c855');ctx.fillStyle='#fff3dc';ctx.beginPath();ctx.arc(sunX,72,11,0,Math.PI*2);ctx.fill();
  planet(ctx,420-camera*.07-drift*.3,95,13,['#c9b29b','#7d6450','#2e211b'],false);
  planet(ctx,180-camera*.03-drift*.15,58,6,['#d8c7b5','#8a7563','#3a2c24'],false);
  ctx.globalAlpha=.75;ridge(ctx,camera*.18+drift*.6,265,55,.006,'#4b1a12',false);ctx.globalAlpha=.9;ridge(ctx,camera*.32+drift*.9,320,45,.009,'#5e2416',false);ctx.globalAlpha=1;
  const haze=ctx.createLinearGradient(0,250,0,H);haze.addColorStop(0,'#c86b3c00');haze.addColorStop(1,'#c86b3c40');ctx.fillStyle=haze;ctx.fillRect(0,250,W,H-250);
  return;
 }
 if(id==='xenara'){
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#07031a');g.addColorStop(.55,'#1d0b3d');g.addColorStop(1,'#43175a');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  stars(ctx,camera,drift,90,'#e7dcff',.2);
  // Polarlicht in zwei Farben.
  for(const [color,base,phase]of [['#43f5c7',90,0],['#b26cff',130,2.1]]){ctx.save();ctx.globalAlpha=.16;ctx.strokeStyle=color;ctx.lineWidth=26;ctx.lineCap='round';ctx.beginPath();for(let x=-20;x<=W+20;x+=24){const y=base+22*Math.sin((x+camera*.05)*.006+phase+drift*.25)+10*Math.sin(x*.017+drift*.4);x<0?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();ctx.restore();}
  glow(ctx,1040-camera*.015,60,50,'#ffe6a855');ctx.fillStyle='#ffe6a8';ctx.beginPath();ctx.arc(1040-camera*.015,60,8,0,Math.PI*2);ctx.fill();
  glow(ctx,1090-camera*.015,96,34,'#9fd8ff44');ctx.fillStyle='#bfe6ff';ctx.beginPath();ctx.arc(1090-camera*.015,96,5,0,Math.PI*2);ctx.fill();
  planet(ctx,560-camera*.05-drift*.12,150,78,['#ffd1f0','#c0569b','#3b0f3d'],true,'#7ff0d8');
  planet(ctx,210-camera*.03-drift*.2,70,14,['#c8fff4','#4fb7a5','#103b3c'],false);
  ctx.globalAlpha=.8;ridge(ctx,camera*.16+drift*.5,250,70,.008,'#1c0d33',true);ctx.globalAlpha=.95;ridge(ctx,camera*.3+drift*.8,315,55,.011,'#2a1245',true);ctx.globalAlpha=1;
  return;
 }
 ctx.fillStyle='#06111b';ctx.fillRect(0,0,W,H);
 if(sky.complete&&sky.naturalWidth){const offset=clamp(-280-camera*.055-drift*.13,-W*.45,0);ctx.globalAlpha=.85;ctx.drawImage(sky,offset,-45,W*1.45,H*1.25);ctx.globalAlpha=1;}
 // Separate depths slide slower than the surface; the distant moon lives in the sky image.
 stars(ctx,camera,drift,65,'#dbe6f1',.25);
 planet(ctx,650-camera*.08-drift*.32,83,35,['#ead5a5','#a78463','#423a43'],true);
 planet(ctx,235-camera*.035-drift*.18,66,16,['#a9d7e7','#4f7797','#172b42'],false);
}
function planet(ctx,x,y,r,colors,rings,ringColor){
 ctx.save();ctx.translate(x,y);ctx.globalAlpha=.8;
 if(rings){ctx.save();ctx.rotate(-.3);ctx.strokeStyle=ringColor?ringColor+'55':'#a9a0a06b';ctx.lineWidth=r*.34;ctx.beginPath();ctx.ellipse(0,0,r*2.2,r*.48,0,Math.PI,Math.PI*2);ctx.stroke();ctx.restore();}
 const gradient=ctx.createRadialGradient(-r*.35,-r*.4,1,0,0,r);gradient.addColorStop(0,colors[0]);gradient.addColorStop(.62,colors[1]);gradient.addColorStop(1,colors[2]);ctx.fillStyle=gradient;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();
 if(rings){ctx.save();ctx.rotate(-.3);ctx.strokeStyle=ringColor?ringColor+'99':'#cabb9e99';ctx.lineWidth=r*.26;ctx.beginPath();ctx.ellipse(0,0,r*2.2,r*.48,0,0,Math.PI);ctx.stroke();ctx.lineWidth=1;ctx.strokeStyle=ringColor?ringColor+'aa':'#f6e1b688';ctx.beginPath();ctx.ellipse(0,0,r*2.35,r*.52,0,0,Math.PI);ctx.stroke();ctx.restore();}
 ctx.restore();
}
// Mondoberfläche mit Textur; Mars und Xenara färben dieselbe Felstextur passend ein.
export function drawTerrain(ctx,texture,level,camera,elapsed,reduced){
 const L=LEVELS[level],T=THEMES[L.id],t=L.terrain,top=Math.min(...t.map(p=>p[1]))-30,from=Math.max(0,camera-40),to=Math.min(L.width,camera+W+40);
 ctx.save();ctx.beginPath();ctx.moveTo(0,H);for(const [x,y]of t)ctx.lineTo(x,y);ctx.lineTo(L.width,H);ctx.closePath();ctx.clip();
 const texTop=Math.min(220,top);if(texture.complete&&texture.naturalWidth)for(let x=Math.floor(from/W)*W;x<to;x+=W)ctx.drawImage(texture,x,texTop,W,H-texTop);
 if(T.tint){ctx.globalCompositeOperation='multiply';ctx.fillStyle=T.tint;ctx.fillRect(from,texTop,to-from,H-texTop);ctx.globalCompositeOperation='source-over';}
 ctx.fillStyle=T.shade;ctx.fillRect(from,texTop,to-from,H-texTop);
 if(T.strata){ctx.strokeStyle=T.strata;ctx.lineWidth=2;for(const [shift,alpha]of [[16,.5],[38,.35],[66,.25]]){ctx.globalAlpha=alpha;ctx.beginPath();t.forEach(([x,y],i)=>i?ctx.lineTo(x,y+shift):ctx.moveTo(x,y+shift));ctx.stroke();}ctx.globalAlpha=1;}
 if(L.id==='xenara')canyonDetails(ctx,L);
 ctx.restore();
 ctx.save();ctx.beginPath();t.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle=T.outline;ctx.lineWidth=L.id==='moon'?1:1.5;if(L.id==='xenara'){ctx.shadowColor=T.outline;ctx.shadowBlur=8;}ctx.stroke();ctx.restore();
 if(L.id==='xenara'){crystals(ctx,L,from,to,elapsed,reduced);canyonLights(ctx,L,elapsed,reduced);}
}
// Wandkontur des Canyons einmal berechnen: x-Position der Wand je Höhe und Seite.
let canyonCache=null;
function canyonWalls(L){if(canyonCache)return canyonCache;const P=L.pad,walls={'-1':[],'1':[]};for(const side of [-1,1])for(let y=180;y<=P.y;y+=6){let x=side<0?P.left:P.right;while(groundAt(x,L)>y&&Math.abs(x-(side<0?P.left:P.right))<260)x+=side;walls[side].push([x,y]);}return canyonCache=walls;}
function canyonDetails(ctx,L){const walls=canyonWalls(L);
 // Leuchtende Adern in den Canyonwänden zeichnen den Korridor nach.
 ctx.save();ctx.strokeStyle='#7ff0d8';ctx.lineWidth=1.5;ctx.globalAlpha=.35;for(const side of [-1,1]){ctx.beginPath();walls[side].forEach(([x,y],i)=>{const px=x+side*(6+(i%6===0?4:0));i?ctx.lineTo(px,y):ctx.moveTo(px,y);});ctx.stroke();}ctx.restore();
}
// Blinkende Positionslichter an beiden Wänden führen hinunter zur Plattform.
function canyonLights(ctx,L,elapsed,reduced){const walls=canyonWalls(L),blink=reduced?1:.45+.55*Math.max(0,Math.sin(elapsed*3));
 ctx.save();for(const side of [-1,1])walls[side].forEach(([x,y],i)=>{if(i%9!==3||y>L.pad.y-20)return;ctx.globalAlpha=blink;glow(ctx,x-side*2,y,9,'#ffb15c');ctx.fillStyle='#ffd7a0';ctx.fillRect(x-side*2-1.5,y-1.5,3,3);});ctx.restore();
}
function crystals(ctx,L,from,to,elapsed,reduced){const t=L.terrain,P=L.pad;
 for(let i=3;i<t.length-1;i+=4){const [x,y]=t[i];if(x<from||x>to||(x>P.left-60&&x<P.right+60))continue;const hue=i%8===3?'#43f5c7':'#c78bff',pulse=reduced?.8:.6+.4*Math.sin(elapsed*2+i);
  ctx.save();ctx.translate(x,y+3);ctx.globalAlpha=pulse*.5;glow(ctx,0,-4,16,hue+'88');ctx.globalAlpha=.9;ctx.fillStyle=hue;for(const [dx,h,w]of [[-4,9,3],[0,12,3.5],[4,7,3]]){ctx.beginPath();ctx.moveTo(dx-w,0);ctx.lineTo(dx,-h);ctx.lineTo(dx+w,0);ctx.closePath();ctx.fill();}ctx.restore();}
}
// Staubkörner auf dem Mars ziehen mit der aktuellen Böe.
export function drawDust(ctx,level,camera,elapsed,reduced,wind){if(LEVELS[level].id!=='mars'||reduced)return;ctx.save();ctx.fillStyle='#f3b58a';for(let i=0;i<70;i++){const x=((i*211.7+elapsed*(40+wind*14)-camera*.6)%W+W)%W,y=150+(i*53.3)%330+6*Math.sin(elapsed*.8+i);ctx.globalAlpha=.12+(i%5)*.05;ctx.fillRect(x,y,i%7?1.5:2.5,1);}ctx.restore();}
export function drawPad(ctx,level){const P=LEVELS[level].pad,color=THEMES[LEVELS[level].id].pad;
 ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=12;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(P.left,P.y-16);ctx.lineTo(P.left,P.y);ctx.lineTo(P.right,P.y);ctx.lineTo(P.right,P.y-16);ctx.stroke();ctx.shadowBlur=0;ctx.font='12px Mono,monospace';ctx.textAlign='center';ctx.fillText('LANDEZONE',(P.left+P.right)/2,Math.min(H-6,P.y+23));ctx.restore();}
export function drawShip(ctx,x,y,angle,gear){
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);
 // Retractable landing struts stay within the same collision footprint (18 × 22).
 ctx.strokeStyle='#b9c9d1';ctx.lineWidth=2;ctx.lineCap='round';
 for(const side of [-1,1]){const footX=side*(9+8*gear),footY=8+14*gear;ctx.beginPath();ctx.moveTo(side*8,5);ctx.lineTo(footX,footY);ctx.lineTo(footX-side*4,footY);ctx.stroke();if(gear>.05){ctx.strokeStyle='#fbdfa1';ctx.beginPath();ctx.moveTo(side*5,10);ctx.lineTo(footX,footY);ctx.stroke();ctx.strokeStyle='#b9c9d1';}}
 const hull=ctx.createLinearGradient(-12,0,12,0);hull.addColorStop(0,'#8a7959');hull.addColorStop(.4,'#ead49a');hull.addColorStop(1,'#9c6a35');ctx.fillStyle=hull;ctx.beginPath();ctx.moveTo(-11,-2);ctx.lineTo(11,-2);ctx.lineTo(12,10);ctx.lineTo(-12,10);ctx.closePath();ctx.fill();
 const cabin=ctx.createLinearGradient(-10,-16,10,0);cabin.addColorStop(0,'#8fa6b3');cabin.addColorStop(.45,'#e9eff0');cabin.addColorStop(1,'#718d9c');ctx.fillStyle=cabin;ctx.beginPath();ctx.moveTo(-9,-3);ctx.lineTo(-9,-11);ctx.lineTo(-4,-19);ctx.lineTo(4,-19);ctx.lineTo(9,-11);ctx.lineTo(9,-3);ctx.closePath();ctx.fill();
 ctx.fillStyle='#173743';ctx.strokeStyle='#b6d5db';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(-5,-13,10,7,2);ctx.fill();ctx.stroke();ctx.fillStyle='#b4e745';ctx.fillRect(-2,-11,3,1);
 ctx.strokeStyle='#cedee2';ctx.beginPath();ctx.moveTo(0,-19);ctx.lineTo(0,-24);ctx.stroke();ctx.fillStyle='#ffb77b';ctx.fillRect(-1,-25,2,2);
 ctx.fillStyle='#4c5d62';ctx.beginPath();ctx.moveTo(-4,10);ctx.lineTo(4,10);ctx.lineTo(6,15);ctx.lineTo(-6,15);ctx.closePath();ctx.fill();ctx.restore();
}
