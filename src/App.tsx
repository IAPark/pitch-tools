import { useState } from "react";
import { Controls } from "./components/Controls";
import { useAudioRecording } from "./hooks/useAudioRecording";
import AudioResult from "./components/AudioResult";

function App() {
  const [frequencyTarget, setFrequencyTarget] = useState<number>(247); // Default frequency set to B3

  const { pitchData, audioFile, averagePitch, toggleRecording, isRecording } =
    useAudioRecording();

  return (
    <>
      <Controls
        frequency={frequencyTarget}
        onFrequencyChange={setFrequencyTarget}
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
