import React from "react";
import "../styles/PathBox.css";

interface PathBoxProps {
  direction?: string; // Default: "→"
  index?: number; // Default: 0
  onModify?: () => void;
}

const PathBox: React.FC<PathBoxProps> = ({
  direction = "→",
  index = 0,
  onModify,
}) => {
  return (
    <div className="path-box" onClick={() => onModify?.()}>
      {index}: {direction} {/* Displays debugging */}
    </div>
  );
};

export default PathBox;
