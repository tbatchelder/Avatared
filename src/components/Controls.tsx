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
          height="60" /* Match button size */
          viewBox="0 0 24 24" /* Standard viewBox */
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          preserveAspectRatio="xMidYMid meet" /* Ensures it scales evenly */
        >
          <path d="M12 2L4 10h5v6h6v-6h5L12 2z" />
        </svg>
      </button>
      <div className="horizontal-buttons">
        <button onClick={() => onMove("←")}>←</button>
        <button onClick={() => onMove("→")}>→</button>
      </div>
      <button onClick={() => onMove("↓")}>↓</button>
    </div>
  );
};

export default Controls;
