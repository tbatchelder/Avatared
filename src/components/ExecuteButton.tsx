import React from "react";
import "../styles/ExecuteButton.css";

interface ExecuteButtonProps {
  onExecute: () => void;
}

const ExecuteButton: React.FC<ExecuteButtonProps> = ({ onExecute }) => {
  return (
    <button className="execute-button" onClick={onExecute}>
      Execute
    </button>
  );
};

export default ExecuteButton;
