import { useState } from "react";
import "./App.css";
import { PitchGeneratorControl } from "./components/PitchGeneratorControl";
import { AudioRecordingControl } from "./components/AudioRecordingControl";
import { useAudioRecording } from "./hooks/useAudioRecording";
import AudioResult from "./components/AudioResult";

function App() {
  const [frequencyTarget, setFrequencyTarget] = useState<number>(247); // Default frequency set to B3

  const { pitchData, audioFile, averagePitch, toggleRecording, isRecording } =
    useAudioRecording();

  return (
    <>
      <PitchGeneratorControl
        frequency={frequencyTarget}
        onFrequencyChange={setFrequencyTarget}
      />
      <AudioRecordingControl
        isRecording={isRecording}
        toggleRecording={toggleRecording}
      />
      {pitchData && audioFile && (
        <AudioResult
          frequencyTarget={frequencyTarget}
          averagePitch={averagePitch}
          pitchData={pitchData}
          audioFile={audioFile}
        />
      )}
    </>
  );
}

export default App;
