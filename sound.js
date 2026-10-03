// Gas-jet sound: broadband noise, pneumatic attack and a soft release.
// AudioContext is created only in response to the user's Sound button.
export class JetAudio {
  constructor(){this.context=null;this.enabled=false;this.activeJets=0;}
  async setEnabled(enabled){
    this.enabled=enabled;
    if(!enabled){this.activeJets=0;if(this.master)this.master.gain.setTargetAtTime(0,this.context.currentTime,.01);if(this.jetGain){this.jetGain.gain.cancelScheduledValues(this.context.currentTime);this.jetGain.gain.setValueAtTime(0,this.context.currentTime);}return true;}
    try {
      if(!this.context)this.initialize();
      await this.context.resume();
      if(this.context.state!=='running'){this.enabled=false;return false;}
      this.master.gain.setTargetAtTime(.8,this.context.currentTime,.015);
      this.preview();return true;
    }catch{this.enabled=false;return false;}
  }
  resume(){if(this.enabled&&this.context)this.context.resume().catch(()=>{});}
  initialize(){
    const Context=globalThis.AudioContext||globalThis.webkitAudioContext;
    this.context=new Context();
    const ctx=this.context;
    this.master=ctx.createGain();this.master.gain.value=0;this.master.connect(ctx.destination);
    this.noise=ctx.createBuffer(1,ctx.sampleRate*3,ctx.sampleRate);
    const samples=this.noise.getChannelData(0);let soft=0;
    for(let i=0;i<samples.length;i++){const white=Math.random()*2-1;soft=.88*soft+.12*white;samples[i]=white*.8+soft*.2;}
    this.jet=ctx.createBufferSource();this.jet.buffer=this.noise;this.jet.loop=true;
    const high=ctx.createBiquadFilter();high.type='highpass';high.frequency.value=380;high.Q.value=.55;
    const low=ctx.createBiquadFilter();low.type='lowpass';low.frequency.value=6500;low.Q.value=.5;
    this.jetGain=ctx.createGain();this.jetGain.gain.value=0;
    this.jet.connect(high).connect(low).connect(this.jetGain).connect(this.master);this.jet.start();
  }
  async setMusic(enabled){
    this.musicEnabled=enabled;
    if(enabled){try{if(!this.context)this.initialize();await this.context.resume();if(this.context.state!=='running')throw new Error('Audio unavailable');if(!this.musicGain)this.initializeMusic();}catch{this.musicEnabled=false;return false;}}
    this.music(this.musicPlaying);return true;
  }
  initializeMusic(){
    const ctx=this.context;this.musicGain=ctx.createGain();this.musicGain.gain.value=0;
    const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=650;
    this.musicGain.connect(filter).connect(ctx.destination);
    // Quiet, slow-moving minor-chord pads; separate from the pneumatic jet sound.
    for(const [i,hz]of [110,164.81,220,261.63].entries()){
      const osc=ctx.createOscillator(),gain=ctx.createGain(),lfo=ctx.createOscillator(),depth=ctx.createGain();
      osc.type='sine';osc.frequency.value=hz;osc.detune.value=i%2?4:-4;gain.gain.value=.17;
      lfo.frequency.value=.045+i*.013;depth.gain.value=.065;lfo.connect(depth).connect(gain.gain);
      osc.connect(gain).connect(this.musicGain);osc.start();lfo.start();
    }
  }
  music(playing){this.musicPlaying=Boolean(playing);if(this.musicGain)this.musicGain.gain.setTargetAtTime(this.musicEnabled&&playing?.12:0,this.context.currentTime,.25);}
  thrust(count){
    count=this.enabled?Math.min(4,count):0;
    if(count===this.activeJets)return;
    this.activeJets=count;if(!this.context)return;
    const now=this.context.currentTime,gain=this.jetGain.gain;
    if(gain.cancelAndHoldAtTime)gain.cancelAndHoldAtTime(now);
    else{const current=gain.value;gain.cancelScheduledValues(now);gain.setValueAtTime(current,now);}
    if(count){const power=Math.sqrt(count);gain.linearRampToValueAtTime(.4*power,now+.008);gain.exponentialRampToValueAtTime(.23*power,now+.12);}
    else gain.setTargetAtTime(0,now,.025);
  }
  noiseBurst({duration=.24,volume=.32,lowpass=6500,highpass=500}={}){
    if(!this.enabled||!this.context)return;
    const ctx=this.context,now=ctx.currentTime,source=ctx.createBufferSource();source.buffer=this.noise;
    const high=ctx.createBiquadFilter();high.type='highpass';high.frequency.value=highpass;high.Q.value=.5;
    const low=ctx.createBiquadFilter();low.type='lowpass';low.frequency.value=lowpass;low.Q.value=.5;
    const gain=ctx.createGain();gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(volume,now+.008);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
    source.connect(high).connect(low).connect(gain).connect(this.master);
    source.start(now,Math.random());source.stop(now+duration+.025);
    source.onended=()=>{source.disconnect();high.disconnect();low.disconnect();gain.disconnect();};
  }
  preview(){this.noiseBurst();}
  result(win){
    if(!this.enabled||!this.context)return;
    if(!win){this.noiseBurst({duration:.8,volume:.8,lowpass:1600,highpass:35});return;}
    const ctx=this.context;
    for(let i=0;i<3;i++){const now=ctx.currentTime+i*.15,osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine';osc.frequency.value=[330,440,660][i];gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.08,now+.015);gain.gain.exponentialRampToValueAtTime(.0001,now+.45);osc.connect(gain).connect(this.master);osc.start(now);osc.stop(now+.46);osc.onended=()=>{osc.disconnect();gain.disconnect();};}
  }
}
