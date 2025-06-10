import { useState, useRef, useEffect } from "react";
import { PitchGenerator } from "../audio/pitch_generator";

export function Controls({
  onFrequencyChange,
  frequency,
  isRecording,
  showDirectionalArrows = false,
  setShowDirectionalArrows = (_: boolean) => {},
  toggleRecording,
}: {
  onFrequencyChange: (frequency: number) => void;
  frequency: number;
  showDirectionalArrows?: boolean;
  setShowDirectionalArrows?: (showArrows: boolean) => void;
  isRecording: boolean;
  toggleRecording: () => void;
}) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const generatorRef = useRef<PitchGenerator | null>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (generatorRef.current) {
        generatorRef.current.stop();
        generatorRef.current.dispose();
        generatorRef.current = null;
      }
      setIsPlaying(false);
    };
  }, []);

  useEffect(() => {
    // Update frequency in the generator if it's playing
    if (generatorRef.current) {
      generatorRef.current.setFrequency(frequency);
    }
  }, [frequency]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopPlaying();
    } else {
      // Start playing
      generatorRef.current = new PitchGenerator(frequency, 1, 100);
      generatorRef.current.start();
      setIsPlaying(true);
    }
  };

  const stopPlaying = () => {
    if (generatorRef.current) {
      generatorRef.current.stop();
      generatorRef.current.dispose();
      generatorRef.current = null;
      setIsPlaying(false);
    }
  };

  const handleFrequencyChange = (newFrequency: number) => {
    onFrequencyChange(newFrequency);
  };

  const handleToggleRecord = () => {
    if (isPlaying && isRecording) {
      stopPlaying();
    }
    toggleRecording();
  };

  const handleToggleShowArrows = () => {
    setShowDirectionalArrows(!showDirectionalArrows);
  };

  return (
    <div className="card">
      <div
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <label htmlFor="frequency-input">Frequency (Hz):</label>
        <input
          id="frequency-input"
          type="number"
          value={frequency}
          onChange={(e) => handleFrequencyChange(Number(e.target.value))}
          min="20"
          max="20000"
          step="1"
          style={{ width: "100px" }}
        />
      </div>
      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={handleTogglePlay}>
          {isPlaying ? "Stop" : "Start"} Tone
        </button>
        <button onClick={handleToggleRecord}>
          {isRecording ? "Stop" : "Start"} Recording
        </button>
        <button onClick={handleToggleShowArrows} disabled={!isRecording}>
          {showDirectionalArrows ? "Hide" : "Show"} Directional Arrows
        </button>
      </div>
    </div>
  );
}
