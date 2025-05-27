interface AudioRecordingControlProps {
  isRecording: boolean;
  toggleRecording: () => void;
}

export function AudioRecordingControl({
  isRecording,
  toggleRecording,
}: AudioRecordingControlProps) {
  return (
    <div className="card">
      <button onClick={toggleRecording}>
        {isRecording ? "Stop" : "Start"} Recording
      </button>
    </div>
  );
}
