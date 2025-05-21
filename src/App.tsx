import { useState, useEffect, useRef } from "react";
import React from "react";
import Grid from "./components/Grid";
import type { Tile } from "./components/Grid";
import PathBox from "./components/PathBox";
import Controls from "./components/Controls";
import ExecuteButton from "./components/ExecuteButton";

const MIN_GRID_SIZE = 5;
const MAX_GRID_SIZE = 20;
const BASE_OBSTACLE_PERCENT = 25;
const OBSTACLE_PERCENT_INCREMENT = 3;

const App: React.FC = () => {
  const [level, setLevel] = useState<number>(1);
  const [grid, setGrid] = useState<Tile[][]>([]);
  const [path, setPath] = useState<string[]>([]); // Store player inputs dynamically
  const [startCol, setStartCol] = useState<number>(0);
  const [endCol, setEndCol] = useState<number>(0);
  const [playerPosition, setPlayerPosition] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [currentPathIndex, setCurrentPathIndex] = useState<number>(0);
  const executionTimerRef = useRef<number | null>(null);
  const [score, setScore] = useState(0);
  const [globalGlitchActive, setGlobalGlitchActive] = useState(false);
  const [localGlitchActive, setLocalGlitchActive] = useState(false);
  const [glitchProbability, setGlitchProbability] = useState(
    Math.random() * 25
  );
  // const [debugInfo, setDebugInfo] = useState<string>("");

  // Calculate current grid size based on level
  const getCurrentGridSize = () => {
    return Math.min(MIN_GRID_SIZE + (level - 1), MAX_GRID_SIZE);
  };

  // Calculate obstacle count based on level
  const getObstacleCount = (gridSize: number) => {
    const totalTiles = gridSize * gridSize;
    const obstaclePercent =
      BASE_OBSTACLE_PERCENT + (level - 1) * OBSTACLE_PERCENT_INCREMENT;
    return Math.floor((totalTiles - 2) * (obstaclePercent / 100)); // Subtract 2 for start and end tiles
  };

  // Calculate glitch multiplier based on level
  const getGlitchMultiplier = () => {
    return Math.pow(2, level - 1); // Double for each level: 1, 2, 4, 8, 16, etc.
  };

  // Generate grid based on current level
  useEffect(() => {
    const { grid, startCol, endCol } = generateGrid();
    setGrid(grid);
    setStartCol(startCol);
    setEndCol(endCol);
  }, [level]);

  // Set initial player position when grid is generated
  useEffect(() => {
    if (grid.length > 0) {
      const gridSize = getCurrentGridSize();
      setPlayerPosition({ row: gridSize - 1, col: startCol });
    }
  }, [grid, startCol]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (executionTimerRef.current !== null) {
        window.clearTimeout(executionTimerRef.current);
      }
    };
  }, []);

  const generateGrid = () => {
    const gridSize = getCurrentGridSize();
    const grid: Tile[][] = Array(gridSize)
      .fill(null)
      .map(() =>
        Array(gridSize)
          .fill(null)
          .map(() => ({
            type: "empty",
            score: [5, 10, 15, 20][Math.floor(Math.random() * 4)],
          }))
      );

    // Lock Start & End Positions
    const startCol = Math.floor(Math.random() * gridSize);
    const endCol = Math.floor(Math.random() * gridSize);
    grid[gridSize - 1][startCol] = { type: "start", score: 0 };
    grid[0][endCol] = { type: "end", score: 0 };

    // Function to check if a path exists using BFS
    const isPathValid = () => {
      const queue = [{ row: gridSize - 1, col: startCol }];
      const visited = Array(gridSize)
        .fill(null)
        .map(() => Array(gridSize).fill(false));

      while (queue.length > 0) {
        const { row, col } = queue.shift()!;
        if (row === 0) return true; // Found a path to the top

        visited[row][col] = true;
        const directions = [
          [-1, 0],
          [0, -1],
          [0, 1],
        ]; // Up, Left, Right

        for (const [dRow, dCol] of directions) {
          const newRow = row + dRow;
          const newCol = col + dCol;

          if (
            newRow >= 0 &&
            newCol >= 0 &&
            newCol < gridSize &&
            !visited[newRow][newCol] &&
            grid[newRow][newCol].type !== "obstacle"
          ) {
            queue.push({ row: newRow, col: newCol });
          }
        }
      }
      return false;
    };

    // Place Obstacles & Ensure Valid Path
    let attempts = 0;
    const obstacleCount = getObstacleCount(gridSize);

    while (attempts < 100) {
      // Reset grid except start/end
      for (let row = 1; row < gridSize - 1; row++) {
        for (let col = 0; col < gridSize; col++) {
          grid[row][col] = {
            type: "empty",
            score: [5, 10, 15, 20][Math.floor(Math.random() * 4)],
          };
        }
      }

      // Place obstacles randomly based on level-appropriate count
      let obstaclesPlaced = 0;
      while (obstaclesPlaced < obstacleCount) {
        const row = Math.floor(Math.random() * (gridSize - 2)) + 1;
        const col = Math.floor(Math.random() * gridSize);
        if (grid[row][col].type === "empty") {
          grid[row][col] = { type: "obstacle", score: 0 };
          obstaclesPlaced++;
        }
      }

      // Validate path
      if (isPathValid()) break;
      attempts++;
    }

    return { grid, startCol, endCol };
  };

  const MAX_PER_ROW = 10;

  const generatePathRows = () => {
    const paddedPath = path.length === 0 ? [" "] : [...path]; // Ensure at least one empty box
    const rows = [];
    for (let i = 0; i < paddedPath.length; i += MAX_PER_ROW) {
      rows.push(paddedPath.slice(i, i + MAX_PER_ROW));
    }
    return rows;
  };

  const modifyPath = (index: number) => {
    setPath((prevPath) => {
      const newPath = [...prevPath]; // Ensure a new array reference
      const possibleDirections = ["↑", "↓", "←", "→"].filter(
        (dir) => dir !== prevPath[index]
      );

      newPath[index] =
        possibleDirections[
          Math.floor(Math.random() * possibleDirections.length)
        ];

      return [...newPath]; // Returning a new array forces re-render
    });
  };

  const addToPath = (direction: string) => {
    setPath((prevPath) => [...prevPath, direction]);

    // Increase glitch probability by a random 0–25%
    setGlitchProbability((prev) => prev + Math.random() * 25);

    // Check if a glitch should occur
    if (glitchProbability >= 100) {
      triggerGlitch();
      setGlitchProbability((prev) => prev - 100); // Reset after glitch
    }
  };

  const executePath = () => {
    // Don't allow execution if already running
    if (isExecuting) return;

    // setDebugInfo(`Starting execution with ${path.length} steps`);

    // Reset player position to start and path index
    const gridSize = getCurrentGridSize();
    setPlayerPosition({ row: gridSize - 1, col: startCol });
    setCurrentPathIndex(0);
    setIsExecuting(true);

    // Create a copy of the grid without any existing path markers
    const newGrid: Tile[][] = JSON.parse(JSON.stringify(grid));
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (newGrid[row][col].type === "path") {
          newGrid[row][col] = {
            type: "empty",
            score: [5, 10, 15, 20][Math.floor(Math.random() * 4)],
          };
        }
      }
    }
    setGrid(newGrid);

    // Start the execution process with a clean grid - using a direct function call
    // rather than relying on state updates to trigger the chain
    setTimeout(() => {
      movePlayer(newGrid, 0, { row: gridSize - 1, col: startCol });
    }, 100);
  };

  // Completely new implementation with direct parameter passing
  const movePlayer = (
    currentGrid: Tile[][],
    stepIndex: number,
    position: { row: number; col: number }
  ) => {
    const gridSize = getCurrentGridSize();

    // Check if we've completed all steps
    if (stepIndex >= path.length) {
      // setDebugInfo("Path complete!");
      setIsExecuting(false);
      return;
    }

    // setDebugInfo(`Step ${stepIndex}: ${path[stepIndex]}`);

    const direction = path[stepIndex];
    let newRow = position.row;
    let newCol = position.col;

    // Update position based on direction
    switch (direction) {
      case "↑": // Up
        newRow = Math.max(0, newRow - 1);
        break;
      case "↓": // Down
        newRow = Math.min(gridSize - 1, newRow + 1);
        break;
      case "←": // Left
        newCol = Math.max(0, newCol - 1);
        break;
      case "→": // Right
        newCol = Math.min(gridSize - 1, newCol + 1);
        break;
      default:
        // Invalid direction, skip to next step
        // setDebugInfo(`Invalid direction: ${direction}`);
        executionTimerRef.current = window.setTimeout(() => {
          movePlayer(currentGrid, stepIndex + 1, position);
        }, 500);
        return;
    }

    // Create new position
    const newPosition = { row: newRow, col: newCol };

    // Check if new position hits an obstacle
    if (currentGrid[newRow][newCol].type === "obstacle") {
      // setDebugInfo(`Hit obstacle at ${newRow},${newCol}`);
      setPlayerPosition(newPosition);
      setIsExecuting(false);
      return;
    }

    // **Accumulate Score Here**
    setScore((prevScore) => prevScore + currentGrid[newRow][newCol].score);

    // **Reset Tile Score After Collection**
    const updatedGrid = currentGrid.map((row) =>
      row.map((cell) => ({ ...cell }))
    );

    updatedGrid[newRow][newCol] = { ...updatedGrid[newRow][newCol], score: 0 };

    // Update Grid State
    setGrid(updatedGrid);

    // Create a new grid that includes all previous path markers
    const newGrid: Tile[][] = JSON.parse(JSON.stringify(currentGrid));

    // Mark the new position as path if it's not start or end
    if (
      newGrid[newRow][newCol].type !== "start" &&
      newGrid[newRow][newCol].type !== "end"
    ) {
      newGrid[newRow][newCol] = { type: "path", score: 0 };
    }

    // Update the grid and player position in state
    setGrid(newGrid);
    setPlayerPosition(newPosition);
    setCurrentPathIndex(stepIndex);

    // Check if reached the end
    if (newRow === 0 && newCol === endCol) {
      // console.log("Reached the end!");
      // setDebugInfo("Reached the end! Level complete!");
      setIsExecuting(false);

      // Advance to next level
      setTimeout(() => {
        setLevel((prevLevel) => prevLevel + 1);
        setPath([]); // Reset path for new level
        setScore((prevScore) => prevScore + 100); // Bonus for completing level
      }, 1500);

      return;
    }

    if (stepIndex >= path.length - 1) {
      // setDebugInfo("You lost! Didn't reach the goal.");
      setIsExecuting(false);
      return;
    }

    // Schedule next step with a delay, passing updated grid, increased index, and new position
    executionTimerRef.current = window.setTimeout(() => {
      movePlayer(newGrid, stepIndex + 1, newPosition);
    }, 500);
  };

  const globalErrors = [
    { message: "💀 ERROR: SYSTEM FAILURE - RESTARTING...", baseChance: 5 },
    {
      message: "🔒 Access Denied. Unauthorized Activity Detected.",
      baseChance: 2,
    },
    {
      message: "❌ Critical System Error! Attempting Recovery...",
      baseChance: 8,
    },
    {
      message: "🌐 No Network Connection. Please check your router..",
      baseChance: 11,
    },
    {
      message: "💿 Filesystem Corrupt. Attempting Repair...",
      baseChance: 15,
    },
    { message: "🔄 Rebooting in 3... 2... 1...", baseChance: 3 },
    { message: "🛑 400 Bad Request. Invalid Input Detected.", baseChance: 12 },
    {
      message: "🔥 Overheating Warning! Emergency Shutdown Imminent.",
      baseChance: 6,
    },
    { message: "❌ 404 Not Found. Grid Data Missing.", baseChance: 10 },
    {
      message: "💾 Corrupt Data Detected. Repairing System...",
      baseChance: 13,
    },
    { message: "⚠️ Unexpected Kernel Behavior Detected.", baseChance: 9 },
  ];

  const localErrors = [
    { message: "⚠️ Avatar Sync Disrupted. Retrying...", baseChance: 20 },
    { message: "🔄 Command Delay: Expect Slowed Execution.", baseChance: 10 },
    { message: "❌ Unauthorized Avatar Input Detected.", baseChance: 18 },
    {
      message: "🔧 Calibration Failure: Resetting Avatar Position.",
      baseChance: 25,
    },
    { message: "🚨 Routing Mismatch: Adjusting Trajectory.", baseChance: 12 },
    { message: "🌀 Sync Error: Movement Unpredictable.", baseChance: 30 },
    { message: "❌ Avatar Not Recognized. Confirm Identity.", baseChance: 15 },
    { message: "💾 Pathway Data Unstable. Recalibrating...", baseChance: 18 },
    { message: "⏳ Warning: Signal Delay Expected.", baseChance: 15 },
    {
      message: "🎲 Routing Mismatch. Recalculating New Directions...",
      baseChance: 12,
    },
    {
      message: "🔺 Response Time Degraded. Adjusting Synchronization...",
      baseChance: 12,
    },
  ];

  // Function to randomly assign impact type (Path, Score, or Grid)
  const getRandomImpactType = () => {
    const impactTypes = ["Path", "Score", "Grid"];
    return impactTypes[Math.floor(Math.random() * impactTypes.length)];
  };

  // Function to retrieve a random error with impact type
  const getRandomGlobalError = () => {
    const error = globalErrors[Math.floor(Math.random() * globalErrors.length)];
    return { ...error, impactType: getRandomImpactType() };
  };

  const getRandomLocalError = () => {
    const error = localErrors[Math.floor(Math.random() * localErrors.length)];
    return { ...error, impactType: getRandomImpactType() };
  };

  const triggerGlitch = () => {
    const isGlobal = Math.random() < 0.5; // 50% chance of global vs local glitch
    const selectedError = isGlobal
      ? getRandomGlobalError()
      : getRandomLocalError();

    if (isGlobal) {
      setGlobalGlitchActive(true);
    } else {
      setLocalGlitchActive(true);
    }

    // console.log(
    //   "Glitch triggered:",
    //   selectedError.message,
    //   "Impact:",
    //   selectedError.impactType
    // );
    const glitchType = getRandomImpactType(); // Randomly choose "Path", "Grid", or "Score"

    // Apply level-based scaling to glitch chances
    const glitchMultiplier = getGlitchMultiplier();

    if (glitchType === "Path") {
      // For Path glitches, we can trigger multiple changes
      const pathEffectCount = Math.floor(glitchMultiplier);
      for (let i = 0; i < pathEffectCount; i++) {
        triggerPathGlitch();
      }

      // Check if we need an additional change based on remainder probability
      const remainderProbability = (glitchMultiplier - pathEffectCount) * 100;
      if (Math.random() * 100 < remainderProbability) {
        triggerPathGlitch();
      }
    } else if (glitchType === "Grid") {
      // Grid glitches only happen once, but with scaled probability
      if (Math.random() * 100 < selectedError.baseChance * glitchMultiplier) {
        triggerGridGlitch();
      }
    } else {
      // Score glitches only happen once, but with scaled probability
      if (Math.random() * 100 < selectedError.baseChance * glitchMultiplier) {
        triggerScoreGlitch();
      }
    }

    // console.log(
    //   `Glitch Activated: ${glitchType} with multiplier ${glitchMultiplier}`
    // );

    setTimeout(() => {
      setGlobalGlitchActive(false);
      setLocalGlitchActive(false);
    }, 3000); // Glitch lasts for 3 seconds
  };

  const triggerPathGlitch = () => {
    if (path.length === 0) return; // No path to modify

    const randomIndex = Math.floor(Math.random() * path.length);
    const possibleDirections = ["↑", "↓", "←", "→"].filter(
      (dir) => dir !== path[randomIndex]
    ); // Ensure change

    setPath((prevPath) => {
      const newPath = [...prevPath];
      newPath[randomIndex] =
        possibleDirections[
          Math.floor(Math.random() * possibleDirections.length)
        ];
      return newPath;
    });
    // console.log(`Path Glitch! Changed step ${randomIndex}`);
  };

  const triggerGridGlitch = () => {
    const { grid, startCol, endCol } = generateGrid(); // Generate fresh grid

    setGrid(grid);
    setStartCol(startCol);
    setEndCol(endCol);

    // console.log("Grid Glitch! Entire map changed.");
  };

  const triggerScoreGlitch = () => {
    setGrid((prevGrid) => {
      return prevGrid.map((row) =>
        row.map((cell) => ({
          ...cell,
          score:
            cell.type === "empty"
              ? [5, 10, 15, 20][Math.floor(Math.random() * 4)]
              : 0,
        }))
      );
    });

    // console.log("Score Glitch! All tile scores randomized.");
  };

  // Reset game to level 1
  const resetGame = () => {
    setLevel(1);
    setPath([]);
    setScore(0);
    setGlitchProbability(Math.random() * 25);
    setIsExecuting(false);
    setCurrentPathIndex(0);
    if (executionTimerRef.current !== null) {
      window.clearTimeout(executionTimerRef.current);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#111",
        color: "#fff",
        minHeight: "100vh",
        minWidth: "100vw",
      }}
    >
      {/* Header */}
      <header
        style={{
          width: "100%",
          textAlign: "center",
          padding: "12px 0",
          borderBottom: "1px solid #444",
        }}
      >
        <h1
          style={{
            fontSize: "3.25rem",
            fontWeight: "bold",
            background: "linear-gradient( to right, white 40%, red 60% )",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Avatared
        </h1>
      </header>

      {/* Main content with 3 columns */}
      <div
        style={{
          display: "flex",
          flex: 1,
          justifyContent: "space-between",
          padding: "16px",
        }}
      >
        {/* Global glitch overlay */}
        {globalGlitchActive && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "#0000AA",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "24px",
              fontWeight: "bold",
              zIndex: 50,
            }}
          >
            {getRandomGlobalError().message}
          </div>
        )}

        {/* LEFT SIDE: Instructions */}
        <div style={{ width: "30%", padding: "16px" }}>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: "bold",
              marginBottom: "16px",
            }}
          >
            Story
          </h2>
          <p style={{ marginBottom: "8px" }}>
            The GLIP Lander has successfully made it to the surface of Venus.
          </p>
          <p style={{ marginBottom: "8px" }}>... Just not in the right spot.</p>
          <p style={{ marginBottom: "16px" }}>
            High winds have blown it off course and it has landed in ...
            undesirable terrain.
          </p>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: "bold",
              marginBottom: "16px",
            }}
          >
            Instructions
          </h2>
          <p style={{ marginBottom: "8px" }}>
            Program the GLIP Lander to navigate the inhospitable terrain to
            reach its goal.
          </p>
          <p style={{ marginBottom: "8px" }}>
            Beware, Venus has powerful electrical storms ...
          </p>
          {/* <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: "bold",
              marginTop: "16px",
              marginBottom: "16px",
            }}
          >
            Level Info
          </h2>
          <p style={{ marginBottom: "8px" }}>Current Level: {level}</p>
          <p style={{ marginBottom: "8px" }}>
            Grid Size: {getCurrentGridSize()} x {getCurrentGridSize()}
          </p>
          <p style={{ marginBottom: "8px" }}>
            Obstacle Density:{" "}
            {Math.round(
              BASE_OBSTACLE_PERCENT + (level - 1) * OBSTACLE_PERCENT_INCREMENT
            )}
            %
          </p>
          <p style={{ marginBottom: "8px" }}>
            Glitch Multiplier: {getGlitchMultiplier()}x
          </p>
          <p style={{ marginBottom: "8px" }}>
            Glitch Probability: {Math.round(glitchProbability)}%
          </p> */}
        </div>

        {/* CENTER: Main Game Area */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            border: "1px solid #555",
            padding: "16px",
            position: "relative",
            width: "60%",
          }}
        >
          {localGlitchActive && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "20px",
                fontWeight: "bold",
                zIndex: 40,
              }}
            >
              {getRandomLocalError().message}
            </div>
          )}

          {/* Path Display Above the Grid */}
          <div
            style={{
              width: "15%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            {generatePathRows().map((row, rowIndex) => (
              <div
                key={rowIndex}
                style={{ display: "flex", gap: "4px", marginBottom: "4px" }}
              >
                {row.map((direction, index) => (
                  <PathBox
                    key={`${rowIndex}-${index}`}
                    direction={direction}
                    index={rowIndex * MAX_PER_ROW + index}
                    onModify={() => modifyPath(rowIndex * MAX_PER_ROW + index)}
                  />
                ))}
              </div>
            ))}
          </div>

          <Grid
            grid={grid}
            gridSize={getCurrentGridSize()}
            playerPosition={playerPosition}
          />

          <Controls onMove={addToPath} />
          <ExecuteButton onExecute={executePath} />
        </div>

        {/* RIGHT SIDE: Status Updates */}
        <div
          style={{
            width: "10%",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              padding: "5px 15px",
              fontSize: "1.25rem",
              fontWeight: "bold",
              marginBottom: "16px",
            }}
          >
            Status
          </h2>

          <div
            style={{
              padding: "5px 15px",
              background: "#333",
              borderRadius: "4px",
              fontSize: "18px",
              width: "75%",
              marginBottom: "8px",
            }}
          >
            Level: {level}
          </div>
          <div
            style={{
              padding: "5px 15px",
              background: "#333",
              borderRadius: "4px",
              fontSize: "18px",
              width: "75%",
              marginBottom: "8px",
            }}
          >
            Grid: {getCurrentGridSize()}x{getCurrentGridSize()}
          </div>
          <div
            style={{
              padding: "5px 15px",
              background: "#333",
              borderRadius: "4px",
              fontSize: "18px",
              width: "75%",
              marginBottom: "8px",
            }}
          >
            Score: {score}
          </div>
          <button
            onClick={resetGame}
            style={{
              padding: "5px 15px",
              backgroundColor: "#800",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
              width: "100%",
            }}
          >
            Reset Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
