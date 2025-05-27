import { useState } from "react";
import { AudioToFile } from "../audio/audio_to_file";

export function useAudioRecording() {
  const [audioToFile, setAudioToFile] = useState<AudioToFile | null>(null);
  const [pitchData, setPitchData] = useState<
    { pitch: number; time: number; clarity: number }[] | null
  >(null);
  const [audioFile, setAudioFile] = useState<Blob | null>(null);
  const [averagePitch, setAveragePitch] = useState<number | null>(null);

  const isRecording = audioToFile !== null;

  const startRecording = async () => {
    if (!isRecording) {
      setPitchData(null);
      setAveragePitch(null);
      setAudioFile(null);
      const audioToFile = await AudioToFile.fromMicrophone();
      setAudioToFile(audioToFile);
    }
  };

  const stopRecording = async () => {
    if (isRecording && audioToFile) {
      const audioBlob = await audioToFile.getAudioBlob();
      setAudioFile(audioBlob);
      setAudioToFile(null);
      setPitchData(audioToFile.cleanedPitchData());
      setAveragePitch(audioToFile.averagePitch() || null);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  return {
    pitchData,
    audioFile,
    averagePitch,
    isRecording,
    startRecording,
    stopRecording,
    toggleRecording,
  };
}
