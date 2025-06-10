import { useState } from "react";
import { Controls } from "./components/Controls";
import { useAudioRecording } from "./hooks/useAudioRecording";
import AudioResult from "./components/AudioResult";
import { DirectionalArrows } from "./components/DirectionalArrows";

function App() {
  const [frequencyTarget, setFrequencyTarget] = useState<number>(247); // Default frequency set to B3
  const [showDirectionalArrows, setShowDirectionalArrows] =
    useState<boolean>(false);

  const {
    pitchData,
    audioFile,
    averagePitch,
    toggleRecording,
    isRecording,
    currentFrequency,
  } = useAudioRecording();

  return (
    <>
      <Controls
        frequency={frequencyTarget}
        onFrequencyChange={setFrequencyTarget}
        isRecording={isRecording}
        toggleRecording={toggleRecording}
        showDirectionalArrows={showDirectionalArrows}
        setShowDirectionalArrows={setShowDirectionalArrows}
      />
      {showDirectionalArrows && isRecording && (
        <DirectionalArrows
          frequency={currentFrequency}
          target={frequencyTarget}
          affordance={0.02}
        />
      )}
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
