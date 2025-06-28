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
  const [volume, setVolume] = useState<number>(0.8); // Default volume
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
    if (generatorRef.current) {
      generatorRef.current.setFrequency(frequency);
    }
  }, [frequency]);

  useEffect(() => {
    if (generatorRef.current) {
      generatorRef.current.setVolume(volume);
    }
  }, [volume]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopPlaying();
    } else {
      // Start playing
      generatorRef.current = new PitchGenerator(frequency, volume, 100);
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
      <div
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <label htmlFor="volume-slider">Volume:</label>
        <input
          id="volume-slider"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          style={{ width: "150px" }}
        />
        <span style={{ minWidth: "40px", fontSize: "14px" }}>
          {Math.round(volume * 100)}%
        </span>
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
