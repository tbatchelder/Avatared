import React from "react";
import "../styles/PathBox.css";

interface PathBoxProps {
  direction?: string; // Default: "→"
  index?: number; // Default: 0
  onModify?: () => void;
}

const PathBox: React.FC<PathBoxProps> = ({
  direction = "→",

  onModify,
}) => {
  return (
    <div className="path-box" onClick={() => onModify?.()}>
      {direction} {/* Displays debugging */}
    </div>
  );
};

export default PathBox;
