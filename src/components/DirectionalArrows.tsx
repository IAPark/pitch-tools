import { useMemo } from "react";

interface DirectionalArrowsProps {
  frequency: number | null;
  target: number;
  affordance: number;
}

export function DirectionalArrows({
  frequency,
  target,
  affordance,
}: DirectionalArrowsProps) {
  const direction = useMemo(() => {
    if (!frequency || !target) {
      return "none";
    }

    const tolerance = target * affordance;
    const diff = frequency - target;

    if (Math.abs(diff) <= tolerance) {
      return "correct";
    } else if (diff > 0) {
      return "down";
    } else {
      return "up";
    }
  }, [frequency, target, affordance]);

  const getArrowStyle = (arrowDirection: "up" | "down") => {
    const isActive = direction === arrowDirection;
    const isCorrect = direction === "correct";

    return {
      fontSize: "3rem",
      color: isCorrect ? "#4CAF50" : isActive ? "#FF5722" : "#ccc",
      opacity: isCorrect ? 0.3 : isActive ? 1 : 0.3,
      transition: "all 0.2s ease-in-out",
      userSelect: "none" as const,
    };
  };

  const getStatusMessage = () => {
    if (!frequency) {
      return "No signal detected";
    }

    switch (direction) {
      case "correct":
        return "Perfect! You're on target";
      case "down":
        return "Too high - pitch down";
      case "up":
        return "Too low - pitch up";
      default:
        return "No signal detected";
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        margin: "20px 0",
        backgroundColor: direction === "correct" ? "#E8F5E8" : "#f9f9f9",
        borderRadius: "12px",
        border: `2px solid ${direction === "correct" ? "#4CAF50" : "#ddd"}`,
        transition: "all 0.3s ease-in-out",
      }}
    >
      {/* Up Arrow */}
      <div style={getArrowStyle("up")}>↑</div>

      {/* Target Frequency */}
      <div
        style={{
          fontSize: "1rem",
          color: "#666",
          marginBottom: "10px",
        }}
      >
        Target: {target.toFixed(1)} Hz
      </div>

      {/* Down Arrow */}
      <div style={getArrowStyle("down")}>↓</div>

      {/* Status Message */}
      <div
        style={{
          fontSize: "1rem",
          marginTop: "15px",
          color: direction === "correct" ? "#4CAF50" : "#666",
          fontWeight: direction === "correct" ? "bold" : "normal",
          textAlign: "center",
        }}
      >
        {getStatusMessage()}
      </div>
    </div>
  );
}
