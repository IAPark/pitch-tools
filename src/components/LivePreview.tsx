import React, { useEffect } from "react";

interface LivePreviewProps {
  getFrequencyBuffer: () => {
    pitch: number;
    clarity: number;
    time: number;
  }[];
}

export const LivePreview = ({ getFrequencyBuffer }: LivePreviewProps) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameRequestId: number;

    const redraw = () => {
      if (!canvasRef.current) return;

      canvas.width = canvas.clientWidth * 2;
      canvas.height = canvas.clientHeight * 2;

      const width = canvas.width;
      const height = canvas.height;

      const currentBuffer = getFrequencyBuffer();

      ctx.clearRect(0, 0, width, height);

      const sampleRate =
        currentBuffer[1]?.time - currentBuffer[0]?.time || 1 / 1000;

      const toDraw = currentBuffer.slice(-3 / sampleRate);
      console.log(sampleRate, toDraw.length);

      const maxPitch = 600;
      const minPitch = 50;

      const points = toDraw.map((data, index) => {
        const x = index * (width / toDraw.length);
        const y =
          height - ((data.pitch - minPitch) / (maxPitch - minPitch)) * height;

        return [x, y];
      });

      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      points.forEach((point) => {
        ctx.lineTo(point[0], point[1]);
      });
      ctx.strokeStyle = "#4CAF50";
      ctx.lineWidth = 4;
      ctx.stroke();

      if (toDraw[toDraw.length - 1].clarity > 0.7) {
        ctx.textAlign = "right";
        ctx.fillStyle = "#000";
        ctx.font = "32px Arial";
        ctx.fillText(
          `${currentBuffer[currentBuffer.length - 1].pitch.toFixed(2)} Hz`,
          width - 10,
          points[points.length - 1][1] - 10
        );
      }

      animationFrameRequestId = requestAnimationFrame(redraw);
    };

    animationFrameRequestId = requestAnimationFrame(redraw);

    return () => {
      cancelAnimationFrame(animationFrameRequestId);
    };
  }, [getFrequencyBuffer]);

  return (
    <canvas
      id="live-preview"
      ref={canvasRef}
      style={{
        width: "100%",
        height: "200px",
        borderRadius: "8px",
      }}
    ></canvas>
  );
};
