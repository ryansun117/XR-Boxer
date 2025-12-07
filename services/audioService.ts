// A simple synthesizer to generate a beat without external assets
export class AudioService {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private nextNoteTime: number = 0;
  private tempo: number = 100; // BPM
  private lookahead: number = 25.0; // ms
  private scheduleAheadTime: number = 0.1; // s
  private timerID: number | null = null;

  constructor() {
    // Initialize on first user interaction usually, but we define structure here
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playHitSound() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playMissSound() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  // --- Music Sequencer ---

  private scheduleNote(beatNumber: number, time: number) {
    if (!this.ctx) return;

    // Kick drum on every beat
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
    gain.gain.setValueAtTime(0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + 0.5);

    // Hi-hat on off-beats
    if (beatNumber % 2 !== 0) {
       // Create buffer for noise
       const bufferSize = this.ctx.sampleRate * 0.05; // 50ms
       const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
       const data = buffer.getChannelData(0);
       for (let i = 0; i < bufferSize; i++) {
         data[i] = Math.random() * 2 - 1;
       }
       const noise = this.ctx.createBufferSource();
       noise.buffer = buffer;
       const noiseFilter = this.ctx.createBiquadFilter();
       noiseFilter.type = 'highpass';
       noiseFilter.frequency.value = 1000;
       const noiseGain = this.ctx.createGain();
       noiseGain.gain.value = 0.1;
       noise.connect(noiseFilter);
       noiseFilter.connect(noiseGain);
       noiseGain.connect(this.ctx.destination);
       noise.start(time);
    }
    
    // Bass line
    if (beatNumber % 4 === 0) {
        const bass = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bass.type = 'sawtooth';
        bass.frequency.setValueAtTime(60, time);
        bassGain.gain.setValueAtTime(0.2, time);
        bassGain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
        bass.connect(bassGain);
        bassGain.connect(this.ctx.destination);
        bass.start(time);
        bass.stop(time + 0.4);
    }
  }

  private scheduler = () => {
    if (!this.ctx) return;
    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.currentBeat, this.nextNoteTime);
      this.nextNoteTime += 60.0 / this.tempo;
      this.currentBeat = (this.currentBeat + 1) % 4; // 4/4 time
    }
    this.timerID = window.setTimeout(this.scheduler, this.lookahead);
  };

  private currentBeat = 0;

  startMusic() {
    if (this.isPlaying) return;
    this.init();
    if (!this.ctx) return;
    
    this.isPlaying = true;
    this.currentBeat = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.1;
    this.scheduler();
  }

  stopMusic() {
    this.isPlaying = false;
    if (this.timerID) window.clearTimeout(this.timerID);
  }
}

export const audioService = new AudioService();
