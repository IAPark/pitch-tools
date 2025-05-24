import { PitchDetector } from "pitchy";

class PitchDetectorProcessor
  extends AudioWorkletProcessor
  implements AudioWorkletProcessorImpl
{
  MAX_BUFFER_SIZE = 2048; // Maximum buffer size
  buffer = new Float32Array(this.MAX_BUFFER_SIZE * 2);
  lastInputSample = 0;
  pitchDetector: PitchDetector<Float32Array<ArrayBufferLike>>;

  constructor() {
    super();
    this.pitchDetector = PitchDetector.forFloat32Array(this.MAX_BUFFER_SIZE);
  }

  process(inputList: Float32Array[][]) {
    if (inputList.length === 0) {
      return true; // No input, continue processing
    }

    const input = inputList[0];
    if (input.length === 0) {
      return true;
    }

    const inputChannel = input[0]; // Assuming mono input

    this.buffer.set(inputChannel, this.lastInputSample);
    this.lastInputSample = this.lastInputSample + inputChannel.length;
    if (this.lastInputSample >= this.MAX_BUFFER_SIZE) {
      this.buffer.copyWithin(0, inputChannel.length);
      this.lastInputSample -= inputChannel.length;
      const [pitch, clarity] = this.pitchDetector.findPitch(
        this.buffer.subarray(0, this.MAX_BUFFER_SIZE),
        sampleRate
      );

      this.port.postMessage({
        pitch: pitch,
        clarity: clarity,
        time: currentTime,
      });
    }

    return true;
  }
}

registerProcessor("pitch-detector-processor", PitchDetectorProcessor);
