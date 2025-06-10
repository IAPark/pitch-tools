import { useEffect, useState } from "react";
import { AudioToFile } from "../audio/audio_to_file";

export function useAudioRecording(updateFrequency: number = 0.1) {
  const [audioToFile, setAudioToFile] = useState<AudioToFile | null>(null);
  const [pitchData, setPitchData] = useState<
    { pitch: number | null; time: number; clarity: number }[] | null
  >(null);
  const [audioFile, setAudioFile] = useState<Blob | null>(null);
  const [averagePitch, setAveragePitch] = useState<number | null>(null);

  const isRecording = audioToFile !== null;

  const [currentFrequency, setCurrentFrequency] = useState<number | null>(null);

  const startRecording = async () => {
    if (!isRecording) {
      setPitchData(null);
      setAveragePitch(null);
      setAudioFile(null);
      const audioToFile = await AudioToFile.fromMicrophone();
      setAudioToFile(audioToFile);
    }
  };

  useEffect(() => {
    if (audioToFile) {
      const interval = setInterval(() => {
        const lastPitch = audioToFile.getLastClearPitch(
          Math.max(
            Math.floor(audioToFile.getFrequencySampleRate() * updateFrequency),
            1
          )
        );
        setCurrentFrequency(lastPitch);
      }, updateFrequency * 1000);
      return () => clearInterval(interval);
    }
  }, [audioToFile, updateFrequency]);

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
    currentFrequency,
    audioFile,
    averagePitch,
    isRecording,
    startRecording,
    stopRecording,
    toggleRecording,
  };
}
