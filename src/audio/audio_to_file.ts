import { PitchDetector } from "pitchy";

import audioWorkletUrl from "./audio_worklet_module?worker&url";

export class AudioToFile {
  private mediaRecorder: MediaRecorder;
  private audioCtx = new AudioContext();
  private analyser = this.audioCtx.createAnalyser();
  private destinationNode = this.audioCtx.createMediaStreamDestination();
  private sourceNode: MediaStreamAudioSourceNode;
  private frequencyDomainBuffer: Float32Array;
  public readonly pitchData: {
    pitch: number;
    clarity: number;
    time: number;
  }[] = [];
  pitchDetector: PitchDetector<Float32Array<ArrayBufferLike>>;

  static async fromMicrophone() {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });
    return new AudioToFile(stream);
  }

  constructor(stream: MediaStream) {
    this.analyser.fftSize = 2048;
    this.pitchDetector = PitchDetector.forFloat32Array(this.analyser.fftSize);
    this.frequencyDomainBuffer = new Float32Array(this.analyser.fftSize);

    this.sourceNode = this.audioCtx.createMediaStreamSource(stream);

    this.sourceNode.connect(this.analyser);
    this.sourceNode.connect(this.destinationNode);

    const preferredMimeTypes = [
      "audio/mpeg",
      "audio/wav",
      "audio/mp4",
      "audio/ogg",
      "audio/webm",
    ];
    const mimeType =
      preferredMimeTypes.find((type) => MediaRecorder.isTypeSupported(type)) ||
      undefined;

    this.mediaRecorder = new MediaRecorder(this.destinationNode.stream, {
      mimeType,
    });

    this.mediaRecorder.start();

    this.attachPitch();
  }

  public async attachPitch() {
    await this.audioCtx.audioWorklet.addModule(audioWorkletUrl);

    const pitchDetectorNode = new AudioWorkletNode(
      this.audioCtx,
      "pitch-detector-processor"
    );

    pitchDetectorNode.port.onmessage = (event) => {
      const { pitch, clarity, time } = event.data;
      this.pitchData.push({ pitch, clarity, time });
    };

    this.sourceNode.connect(pitchDetectorNode);
  }

  public cleanedPitchData() {
    if (this.pitchData.length === 0) {
      return [];
    }
    const cleanedData = this.pitchData.map((data) =>
      data.pitch < 1000 && data.pitch > 80 && data.clarity > 0.75
        ? data
        : { pitch: null, clarity: 0, time: data.time }
    );
    return cleanedData;
  }

  public getLastPitch() {
    return (
      this.pitchData[this.pitchData.length - 1] || {
        pitch: 0,
        clarity: 0,
        time: 0,
      }
    );
  }

  public getLastClearPitch(samples: number = 1000) {
    const clean = this.pitchData.slice(-samples).flatMap((data) => {
      if (data.pitch < 1000 && data.pitch > 80 && data.clarity > 0.75) {
        return [data.pitch];
      } else {
        return [];
      }
    });

    if (clean.length === 0) {
      return null;
    } else {
      return clean.reduce((sum, current) => sum + current, 0) / clean.length;
    }
  }

  getFrequencySampleRate() {
    return this.audioCtx.sampleRate / 2048;
  }

  public averagePitch() {
    const cleanedData = this.cleanedPitchData();
    if (cleanedData.length === 0) {
      return undefined;
    }

    const pitches = cleanedData.filter((data) => data.pitch !== null);

    if (pitches.length === 0) {
      return undefined;
    }
    return pitches.reduce((sum, data) => sum + data.pitch, 0) / pitches.length;
  }

  public getCurrentFrequencyDomain() {
    this.analyser.getFloatFrequencyData(this.frequencyDomainBuffer);
    return this.frequencyDomainBuffer;
  }
  public getAudioBlob() {
    return new Promise<Blob>((resolve) => {
      this.mediaRecorder.ondataavailable = (event) => {
        this.sourceNode.mediaStream.getTracks().forEach((track) => {
          track.stop();
        });
        this.audioCtx.close();
        resolve(event.data);
      };

      this.mediaRecorder.stop();
    });
  }
}
