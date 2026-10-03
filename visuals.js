import {W,H,FOOT,pad,groundAt} from './physics.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function shipPose(s,keys){
 const altitude=Math.max(0,groundAt(s.x)-s.y-FOOT);
 const braking=(s.vx>0&&keys.has('ArrowLeft'))||(s.vx<0&&keys.has('ArrowRight'));
 const approach=s.x>pad.left-600&&s.x<pad.right+300;
 const nearGround=clamp(altitude/140,0,1);
 let angle=Math.sign(s.vx)*Math.min(1.22,Math.abs(s.vx)/65*1.22);
 if(braking)angle*=.18;
 if(approach)angle*=nearGround;
 if(Math.abs(s.vx)<24)angle*=nearGround;
 return {angle:s.status==='landed'||s.status==='ready'?0:angle,gear:s.status==='landed'||altitude<=80?1:0,altitude};
}
export function drawBackground(ctx,sky,camera,elapsed,reduced){
 const drift=reduced?0:elapsed;
 ctx.fillStyle='#06111b';ctx.fillRect(0,0,W,H);
 if(sky.complete&&sky.naturalWidth){const offset=clamp(-280-camera*.055-drift*.13,-W*.45,0);ctx.globalAlpha=.85;ctx.drawImage(sky,offset,-45,W*1.45,H*1.25);ctx.globalAlpha=1;}
 // Separate depths slide slower than the surface; the distant moon lives in the sky image.
 for(let i=0;i<65;i++){const x=((i*173.21-camera*.11-drift*.28)%W+W)%W,y=(i*67.41)%330;ctx.globalAlpha=.25+(i%4)*.12;ctx.fillStyle='#dbe6f1';ctx.fillRect(x,y,i%9===0?2:1,1);}
 ctx.globalAlpha=1;
 planet(ctx,650-camera*.08-drift*.32,83,35,['#ead5a5','#a78463','#423a43'],true);
 planet(ctx,235-camera*.035-drift*.18,66,16,['#a9d7e7','#4f7797','#172b42'],false);
}
function planet(ctx,x,y,r,colors,rings){
 ctx.save();ctx.translate(x,y);ctx.globalAlpha=.8;
 if(rings){ctx.save();ctx.rotate(-.3);ctx.strokeStyle='#a9a0a06b';ctx.lineWidth=12;ctx.beginPath();ctx.ellipse(0,0,r*2.2,r*.48,0,Math.PI,Math.PI*2);ctx.stroke();ctx.restore();}
 const gradient=ctx.createRadialGradient(-r*.35,-r*.4,1,0,0,r);gradient.addColorStop(0,colors[0]);gradient.addColorStop(.62,colors[1]);gradient.addColorStop(1,colors[2]);ctx.fillStyle=gradient;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();
 if(rings){ctx.save();ctx.rotate(-.3);ctx.strokeStyle='#cabb9e99';ctx.lineWidth=9;ctx.beginPath();ctx.ellipse(0,0,r*2.2,r*.48,0,0,Math.PI);ctx.stroke();ctx.lineWidth=1;ctx.strokeStyle='#f6e1b688';ctx.beginPath();ctx.ellipse(0,0,r*2.35,r*.52,0,0,Math.PI);ctx.stroke();ctx.restore();}
 ctx.restore();
}
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
