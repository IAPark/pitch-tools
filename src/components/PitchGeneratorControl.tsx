import { useState, useRef, useEffect } from "react";
import { PitchGenerator } from "../audio/pitch_generator";

export function PitchGeneratorControl({
  onFrequencyChange,
  frequency,
}: {
  onFrequencyChange: (frequency: number) => void;
  frequency: number;
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
    if (generatorRef.current && isPlaying) {
      generatorRef.current.setFrequency(frequency);
    }
  }, [frequency, isPlaying]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      // Stop playing
      if (generatorRef.current) {
        generatorRef.current.stop();
        generatorRef.current.dispose();
        generatorRef.current = null;
      }
      setIsPlaying(false);
    } else {
      // Start playing
      generatorRef.current = new PitchGenerator(frequency);
      generatorRef.current.start();
      setIsPlaying(true);
    }
  };

  const handleFrequencyChange = (newFrequency: number) => {
    onFrequencyChange(newFrequency);
  };

  return (
    <div className="card">
      <h3>Pitch Generator</h3>
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
      <button onClick={handleTogglePlay}>
        {isPlaying ? "Stop" : "Start"} Tone
      </button>
      {isPlaying && (
        <p style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
          Playing: {frequency.toFixed(1)} Hz
        </p>
      )}
    </div>
  );
}
