export interface GeigerAudioConfig {
  volume: number;
  pitch: number;
  sensitivity: number;
}

export class GeigerAudioEngine {
  private context: AudioContext | null = null;
  private muted = false;
  private config: GeigerAudioConfig = {
    volume: 0.65,
    pitch: 1,
    sensitivity: 0.7,
  };
  private lastTick = 0;

  async ensureContext(): Promise<void> {
    if (!this.context) {
      this.context = new AudioContext();
    }
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  setConfig(config: GeigerAudioConfig): void {
    this.config = config;
  }

  tick(rssi: number): void {
    if (!this.context || this.muted) {
      return;
    }
    const now = performance.now();
    const cadence = this.getCadence(rssi);
    if (now - this.lastTick < cadence) {
      return;
    }
    this.lastTick = now;

    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    const filter = this.context.createBiquadFilter();
    const noise = this.context.createBufferSource();
    const noiseBuffer = this.context.createBuffer(1, this.context.sampleRate * 0.04, this.context.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);

    for (let i = 0; i < noiseData.length; i += 1) {
      noiseData[i] = (Math.random() * 2 - 1) * 0.45;
    }

    noise.buffer = noiseBuffer;
    oscillator.type = 'square';
    oscillator.frequency.value = 700 * this.config.pitch;
    gain.gain.value = 0.001 + this.config.volume * 0.04;
    filter.type = 'bandpass';
    filter.frequency.value = 1000 + this.config.pitch * 400;

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(this.context.destination);
    noise.connect(gain);

    oscillator.start();
    noise.start();
    oscillator.stop(this.context.currentTime + 0.032);
    noise.stop(this.context.currentTime + 0.04);
  }

  private getCadence(rssi: number): number {
    const normalized = Math.max(0, Math.min(1, (rssi + 100) / 70));
    const sensitivity = Math.max(0.2, this.config.sensitivity);
    const cadence = 1300 - normalized * 1100 * sensitivity;
    return Math.max(60, cadence);
  }
}

export const geigerAudio = new GeigerAudioEngine();
