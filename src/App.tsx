import { useEffect, useRef, useState } from "react";
import "./App.css";
import { AudioToFile } from "./audio/audio_to_file";
import {
  Line,
  LineChart,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function App() {
  const [audioToFile, setAudioToFile] = useState<AudioToFile | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [pitchData, setPitchData] = useState<
    { pitch: number; time: number; clarity: number }[] | null
  >(null);

  useEffect(() => {
    if (audioToFile) {
      const interval = setInterval(() => {
        setPitchData(audioToFile.cleanedPitchData());
      }, 100);
      return () => clearInterval(interval);
    }
  }, [audioToFile]);

  const [audioFile, setAudioFile] = useState<Blob | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  return (
    <>
      <h1>Vite + React</h1>

      <h2>Pitch Detection</h2>
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
          <YAxis yAxisId="frequency" domain={["auto", 1000]} scale="log" />
          <YAxis yAxisId="clarity" orientation="right" domain={[0, 1]} />
          <Tooltip />

          <Line dataKey="pitch" stroke="#8884d8" yAxisId="frequency" />
          <Line dataKey="clarity" stroke="#82ca9d" yAxisId="clarity" />
          <ReferenceLine
            x={currentTime}
            yAxisId="frequency"
            stroke="red"
            label="Playback time"
          />
        </LineChart>
      )}
      <div className="card">
        <button
          onClick={async () => {
            if (audioToFile) {
              const audioBlob = await audioToFile.getAudioBlob();
              setAudioFile(audioBlob);
              setAudioToFile(null);
            } else {
              const audioToFile = await AudioToFile.fromMicrophone();
              setAudioToFile(audioToFile);
            }
          }}
        >
          {audioToFile ? "Stop" : "Start"} Recording
        </button>
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
      </div>
    </>
  );
}

export default App;
