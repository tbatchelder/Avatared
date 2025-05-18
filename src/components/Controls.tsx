import React from "react";
import "../styles/Controls.css";

interface ControlsProps {
  onMove: (direction: string) => void;
}

const Controls: React.FC<ControlsProps> = ({ onMove }) => {
  return (
    <div className="controls">
      <button onClick={() => onMove("↑")}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="60"
          height="60"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          preserveAspectRatio="xMidYMid meet"
        >
          <path d="M12 2L4 10h5v6h6v-6h5L12 2z" />
        </svg>
      </button>

      <button onClick={() => onMove("←")}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="60"
          height="60"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          preserveAspectRatio="xMidYMid meet"
        >
          <path d="M2 12L10 4v5h6v6h-6v5L2 12z" />
        </svg>
      </button>

      <button onClick={() => onMove("→")}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="60"
          height="60"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          preserveAspectRatio="xMidYMid meet"
        >
          <path d="M22 12L14 4v5h-6v6h6v5l8-8z" />
        </svg>
      </button>

      <button onClick={() => onMove("↓")}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="60"
          height="60"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          preserveAspectRatio="xMidYMid meet"
        >
          <path d="M12 22l8-8h-5v-6h-6v6H4l8 8z" />
        </svg>
      </button>
    </div>
  );
};

export default Controls;
