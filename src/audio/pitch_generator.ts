export class PitchGenerator {
  private audioContext: AudioContext;
  private nodes: HarmonicNode[] = [];
  private volumes: number[] = [];
  private gainNode: GainNode;
  private isPlaying: boolean = false;
  private frequency: number;
  private volume: number;

  constructor(frequency: number, volume: number = 0.1, harmonics: number = 1) {
    this.audioContext = new AudioContext();
    this.gainNode = this.audioContext.createGain();

    this.nodes = Array.from({ length: harmonics }, (_, i) => {
      const node = new HarmonicNode(this.audioContext);
      node.connect(this.gainNode);
      return node;
    });

    this.volumes = Array.from(
      { length: harmonics },
      (_, i) => 1 / (i + 1) ** 5
    );

    this.frequency = frequency;
    this.volume = volume;
  }

  public start(): void {
    if (this.isPlaying) {
      return;
    }

    this.isPlaying = true;

    this.nodes.forEach((node) => {
      node.start();
    });

    this.setFrequency(this.frequency);
    this.setVolume(this.volume, 0);
    this.gainNode.connect(this.audioContext.destination);
  }

  public stop(): void {
    if (!this.isPlaying || this.nodes.length === 0) {
      return;
    }

    this.nodes.forEach((node) => {
      node.stop();
    });

    this.gainNode.disconnect();
    this.isPlaying = false;
  }

  public setFrequency(frequency: number): void {
    if (this.isPlaying && this.nodes.length > 0) {
      this.nodes.forEach((node, i) => {
        node.frequency = frequency * (i + 1); // Set frequency for each harmonic

        if (node.frequency > 10000) {
          node.volume = 0;
        }
      });
    }
  }

  public setVolume(volume: number, offset: number = 0.1): void {
    // Volume should be between 0 and 1
    const clampedVolume = Math.max(0, Math.min(1, volume));

    const totalVolume = this.volumes.reduce((sum, v) => sum + v, 0);

    const adjustmentTime = this.audioContext.currentTime + offset;

    this.nodes.forEach((node, i) => {
      node.setVolume(
        (clampedVolume * this.volumes[i]) / totalVolume,
        adjustmentTime
      );
    });

    this.gainNode.gain.setValueAtTime(1, adjustmentTime);
  }

  public dispose(): void {
    this.stop();
    this.audioContext.close();
  }
}

class HarmonicNode {
  private gainNode: GainNode;
  private oscillator: OscillatorNode;

  constructor(context: AudioContext) {
    this.gainNode = context.createGain();

    this.oscillator = context.createOscillator();
    this.oscillator.type = "sine"; // You can change this to "square", "triangle", etc.
    this.oscillator.connect(this.gainNode);
  }

  set frequency(frequency: number) {
    this.oscillator.frequency.setValueAtTime(
      frequency,
      this.oscillator.context.currentTime
    );
  }
  get frequency(): number {
    return this.oscillator.frequency.value;
  }

  set volume(volume: number) {
    this.setVolume(volume, this.gainNode.context.currentTime);
  }

  setVolume(volume: number, time: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.gainNode.gain.setValueAtTime(clampedVolume, time);
  }

  get volume(): number {
    return this.gainNode.gain.value;
  }

  connect(
    destinationNode: AudioNode,
    output?: number,
    input?: number
  ): AudioNode;
  connect(destinationParam: AudioParam, output?: number): void;
  connect(
    destination: AudioNode | AudioParam,
    output?: number,
    input?: number
  ): AudioNode | void {
    if (destination instanceof AudioParam) {
      this.gainNode.connect(destination, output);
      return;
    } else {
      this.gainNode.connect(destination, output, input);
      return this.gainNode;
    }
  }

  disconnect(): void;
  disconnect(output: number): void;
  disconnect(destinationNode: AudioNode): void;
  disconnect(destinationNode: AudioNode, output: number): void;
  disconnect(destinationNode: AudioNode, output: number, input: number): void;
  disconnect(destinationParam: AudioParam): void;
  disconnect(destinationParam: AudioParam, output: number): void;
  disconnect(...args: DisconnectArgs): void {
    //@ts-ignore
    this.gainNode.disconnect(...args);
  }

  public start(): void {
    this.oscillator.start();
  }

  public stop(): void {
    this.oscillator.stop();
  }
}

type DisconnectArgs =
  | []
  | [number]
  | [AudioNode]
  | [AudioNode, number]
  | [AudioNode, number, number]
  | [AudioParam]
  | [AudioParam, number];
