export class PitchGenerator {
  private audioContext: AudioContext;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode;
  private frequency: number;
  private isPlaying: boolean = false;

  constructor(frequency: number) {
    this.frequency = frequency;
    this.audioContext = new AudioContext();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime); // Set volume to 10%
    this.gainNode.connect(this.audioContext.destination);
  }

  public start(): void {
    if (this.isPlaying) {
      return;
    }

    this.oscillator = this.audioContext.createOscillator();
    this.oscillator.type = 'sine';
    this.oscillator.frequency.setValueAtTime(this.frequency, this.audioContext.currentTime);
    this.oscillator.connect(this.gainNode);
    
    this.oscillator.start();
    this.isPlaying = true;
  }

  public stop(): void {
    if (!this.isPlaying || !this.oscillator) {
      return;
    }

    this.oscillator.stop();
    this.oscillator.disconnect();
    this.oscillator = null;
    this.isPlaying = false;
  }

  public setFrequency(frequency: number): void {
    this.frequency = frequency;
    if (this.isPlaying && this.oscillator) {
      this.oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    }
  }

  public setVolume(volume: number): void {
    // Volume should be between 0 and 1
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.gainNode.gain.setValueAtTime(clampedVolume, this.audioContext.currentTime);
  }

  public getFrequency(): number {
    return this.frequency;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public dispose(): void {
    this.stop();
    this.audioContext.close();
  }
}