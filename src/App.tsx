import { useRef, useState } from "react";
import "./App.css";
import { PitchGeneratorControl } from "./components/PitchGeneratorControl";
import { AudioRecordingControl } from "./components/AudioRecordingControl";
import {
  Line,
  LineChart,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAudioRecording } from "./hooks/useAudioRecording";

function App() {
  const [frequencyTarget, setFrequencyTarget] = useState<number>(247); // Default frequency set to B3
  const [currentTime, setCurrentTime] = useState(0);

  const { pitchData, audioFile, averagePitch, toggleRecording, isRecording } =
    useAudioRecording();

  const audioRef = useRef<HTMLAudioElement | null>(null);

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

      {averagePitch && (
        <div className="card">
          <p>Average Pitch: {averagePitch.toFixed(2)} Hz</p>
        </div>
      )}

      {pitchData && (
        <LineChart
          width={800}
          height={300}
          data={pitchData}
          onClick={(e) => {
            if (audioRef.current) {
              audioRef.current.currentTime =
                e.activePayload?.[0]?.payload.time || 0;
            }
          }}
        >
          <XAxis
            dataKey="time"
            type="number"
            tick={false}
            minTickGap={0}
            domain={[0, "dataMax"]}
          />
          <YAxis
            domain={[
              (dataMin: number) => Math.min(dataMin, frequencyTarget - 10),
              (dataMax: number) => Math.max(dataMax, frequencyTarget + 10),
            ]}
            scale="log"
          />
          <Tooltip />

          <Line dataKey="pitch" stroke="#8884d8" dot={false} />

          <ReferenceLine y={frequencyTarget} stroke="green" />
          <ReferenceLine x={currentTime} stroke="red" label="Playback time" />
        </LineChart>
      )}
      {audioFile && (
        <audio
          ref={audioRef}
          controls
          onTimeUpdate={(e) => {
            setCurrentTime(e.currentTarget.currentTime);
          }}
        >
          {audioFile && (
            <source src={URL.createObjectURL(audioFile)} type="audio/wav" />
          )}
        </audio>
      )}
    </>
  );
}

export default App;
