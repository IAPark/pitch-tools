import {
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { memo, useCallback, useRef, useState } from "react";
import type H5AudioPlayer from "react-h5-audio-player";

type AudioResultProps = {
  frequencyTarget: number;
  averagePitch: number | null;
  pitchData: { pitch: number | null; time: number; clarity: number }[];
  audioFile: Blob;
};
export default function AudioResult({
  frequencyTarget,
  averagePitch,
  pitchData,
  audioFile,
}: AudioResultProps) {
  const audioRef = useRef<H5AudioPlayer | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  return (
    <>
      {averagePitch && (
        <div style={{ alignSelf: "left", marginBottom: "20px" }}>
          <a
            href={URL.createObjectURL(audioFile)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Average Pitch: {averagePitch.toFixed(2)} Hz
          </a>
        </div>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          height={300}
          data={pitchData}
          onClick={(e) => {
            if (audioRef.current) {
              setCurrentTime(e.activePayload?.[0]?.payload.time);
              audioRef.current.audio.current.currentTime =
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

          <ReferenceArea
            y1={frequencyTarget - (frequencyTarget - 440) * 0.02}
            y2={frequencyTarget + (frequencyTarget - 440) * 0.02}
            ifOverflow="extendDomain"
            fill="green"
            fillOpacity={0.1}
          />
          <ReferenceLine x={currentTime} stroke="red" label="Playback time" />
        </LineChart>
      </ResponsiveContainer>

      <BlobPlayer
        blob={audioFile}
        ref={audioRef}
        onListen={useCallback(
          (time: number) => {
            setCurrentTime(time);
          },
          [setCurrentTime]
        )}
        style={{ width: "100%", marginBottom: "20px" }}
      />
    </>
  );
}

const BlobPlayer = memo(
  ({
    blob,
    ref,
    onListen,
    style = {},
  }: {
    blob: Blob;
    ref: React.RefObject<H5AudioPlayer | null>;
    onListen?: (currentTime: number) => void;
    style?: React.CSSProperties;
  }) => {
    const audioUrl = URL.createObjectURL(blob);
    return (
      <AudioPlayer
        ref={ref}
        src={audioUrl}
        style={style}
        autoPlay={false}
        listenInterval={10}
        onListen={() => {
          onListen?.(ref.current?.audio.current.currentTime || 0);
        }}
      />
    );
  },
  (prevProps, nextProps) =>
    prevProps.blob === nextProps.blob &&
    JSON.stringify(prevProps.style) === JSON.stringify(nextProps.style)
);
