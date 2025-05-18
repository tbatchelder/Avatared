import { useState, useEffect, useRef } from "react";
import React from "react";
import Grid from "./components/Grid";
import type { Tile } from "./components/Grid";
import PathBox from "./components/PathBox";
import Controls from "./components/Controls";
import ExecuteButton from "./components/ExecuteButton";

const GRID_SIZE = 10;

const App: React.FC = () => {
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

  // Generate grid on initial load
  useEffect(() => {
    const { grid, startCol, endCol } = generateGrid();
    setGrid(grid);
    setStartCol(startCol);
    setEndCol(endCol);
  }, []);

  // Set initial player position when grid is generated
  useEffect(() => {
    if (grid.length > 0) {
      setPlayerPosition({ row: GRID_SIZE - 1, col: startCol });
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
    const grid: Tile[][] = Array(GRID_SIZE)
      .fill(null)
      .map(() =>
        Array(GRID_SIZE)
          .fill(null)
          .map(() => ({
            type: "empty",
            score: [5, 10, 15, 20][Math.floor(Math.random() * 4)],
          }))
      );

    // Lock Start & End Positions
    const startCol = Math.floor(Math.random() * GRID_SIZE);
    const endCol = Math.floor(Math.random() * GRID_SIZE);
    grid[GRID_SIZE - 1][startCol] = { type: "start", score: 0 };
    grid[0][endCol] = { type: "end", score: 0 };

    // Function to check if a path exists using BFS
    const isPathValid = () => {
      const queue = [{ row: GRID_SIZE - 1, col: startCol }];
      const visited = Array(GRID_SIZE)
        .fill(null)
        .map(() => Array(GRID_SIZE).fill(false));

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
            newCol < GRID_SIZE &&
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
    while (attempts < 100) {
      // Reset grid except start/end
      for (let row = 1; row < GRID_SIZE - 1; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          grid[row][col] = {
            type: "empty",
            score: [5, 10, 15, 20][Math.floor(Math.random() * 4)],
          };
        }
      }

      // Place 30 obstacles randomly
      let obstaclesPlaced = 0;
      while (obstaclesPlaced < 30) {
        const row = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
        const col = Math.floor(Math.random() * GRID_SIZE);
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
      const newPath = [...prevPath];
      newPath[index] = "↓"; // Temporary replacement for testing
      return newPath;
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

  // Add debug state to help track what's happening
  const [debugInfo, setDebugInfo] = useState<string>("");

  const executePath = () => {
    // Don't allow execution if already running
    if (isExecuting) return;

    setDebugInfo(`Starting execution with ${path.length} steps`);

    // Reset player position to start and path index
    setPlayerPosition({ row: GRID_SIZE - 1, col: startCol });
    setCurrentPathIndex(0);
    setIsExecuting(true);

    // Create a copy of the grid without any existing path markers
    const newGrid: Tile[][] = JSON.parse(JSON.stringify(grid));
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
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
      movePlayer(newGrid, 0, { row: GRID_SIZE - 1, col: startCol });
    }, 100);
  };

  // Completely new implementation with direct parameter passing
  const movePlayer = (
    currentGrid: Tile[][],
    stepIndex: number,
    position: { row: number; col: number }
  ) => {
    // Check if we've completed all steps
    if (stepIndex >= path.length) {
      setDebugInfo("Path complete!");
      setIsExecuting(false);
      return;
    }

    setDebugInfo(`Step ${stepIndex}: ${path[stepIndex]}`);

    const direction = path[stepIndex];
    let newRow = position.row;
    let newCol = position.col;

    // Update position based on direction
    switch (direction) {
      case "↑": // Up
        newRow = Math.max(0, newRow - 1);
        break;
      case "↓": // Down
        newRow = Math.min(GRID_SIZE - 1, newRow + 1);
        break;
      case "←": // Left
        newCol = Math.max(0, newCol - 1);
        break;
      case "→": // Right
        newCol = Math.min(GRID_SIZE - 1, newCol + 1);
        break;
      default:
        // Invalid direction, skip to next step
        setDebugInfo(`Invalid direction: ${direction}`);
        executionTimerRef.current = window.setTimeout(() => {
          movePlayer(currentGrid, stepIndex + 1, position);
        }, 500);
        return;
    }

    // Create new position
    const newPosition = { row: newRow, col: newCol };

    // Check if new position hits an obstacle
    if (currentGrid[newRow][newCol].type === "obstacle") {
      setDebugInfo(`Hit obstacle at ${newRow},${newCol}`);
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
      console.log("Reached the end!");
      setDebugInfo("Reached the end!");
      setIsExecuting(false);
      return;
    }

    if (stepIndex >= path.length - 1) {
      setDebugInfo("You lost! Didn't reach the goal.");
      setIsExecuting(false);
      return;
    }

    // Schedule next step with a delay, passing updated grid, increased index, and new position
    executionTimerRef.current = window.setTimeout(() => {
      movePlayer(newGrid, stepIndex + 1, newPosition);
    }, 500);
  };

  const globalErrors = [
    { message: "💀 ERROR: SYSTEM FAILURE - RESTARTING...", baseChance: 10 },
    {
      message: "🔒 Access Denied. Unauthorized Activity Detected.",
      baseChance: 15,
    },
    {
      message: "❌ Critical System Error! Attempting Recovery...",
      baseChance: 8,
    },
    {
      message: "🌐 No Network Connection. Please check your router..",
      baseChance: 5,
    },
    {
      message: "💿 Filesystem Corrupt. Attempting Repair...",
      baseChance: 9,
    },
    { message: "🔄 Rebooting in 3... 2... 1...", baseChance: 5 },
    { message: "🛑 400 Bad Request. Invalid Input Detected.", baseChance: 12 },
    {
      message: "🔥 Overheating Warning! Emergency Shutdown Imminent.",
      baseChance: 6,
    },
    { message: "❌ 404 Not Found. Grid Data Missing.", baseChance: 10 },
    { message: "💾 Corrupt Data Detected. Repairing System...", baseChance: 7 },
    { message: "⚠️ Unexpected Kernel Behavior Detected.", baseChance: 9 },
  ];

  const localErrors = [
    { message: "⚠️ Avatar Sync Disrupted. Retrying...", baseChance: 20 },
    { message: "🔄 Command Delay: Expect Slowed Execution.", baseChance: 10 },
    { message: "❌ Unauthorized Avatar Input Detected.", baseChance: 8 },
    {
      message: "🔧 Calibration Failure: Resetting Avatar Position.",
      baseChance: 15,
    },
    { message: "🚨 Routing Mismatch: Adjusting Trajectory.", baseChance: 12 },
    { message: "🌀 Sync Error: Movement Unpredictable.", baseChance: 10 },
    { message: "❌ Avatar Not Recognized. Confirm Identity.", baseChance: 5 },
    { message: "💾 Pathway Data Unstable. Recalibrating...", baseChance: 8 },
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

    console.log(
      "Glitch triggered:",
      selectedError.message,
      "Impact:",
      selectedError.impactType
    );
    const glitchType = getRandomImpactType(); // Randomly choose "Path", "Grid", or "Score"

    if (glitchType === "Path") {
      triggerPathGlitch();
    } else if (glitchType === "Grid") {
      triggerGridGlitch();
    } else {
      triggerScoreGlitch();
    }

    console.log(`Glitch Activated: ${glitchType}`);

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
    console.log(`Path Glitch! Changed step }`);
  };

  const triggerGridGlitch = () => {
    const { grid, startCol, endCol } = generateGrid(); // Generate fresh grid

    setGrid(grid);
    setStartCol(startCol);
    setEndCol(endCol);

    console.log("Grid Glitch! Entire map changed.");
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

    console.log("Score Glitch! All tile scores randomized.");
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        padding: "20px",
        backgroundColor: "#111",
        color: "#fff",
      }}
    >
      {globalGlitchActive && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "#0000AA", // BSOD color
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "24px",
            fontWeight: "bold",
            zIndex: 9999, // Ensures it covers everything
          }}
        >
          💀 ERROR: SYSTEM FAILURE - RESTARTING...
        </div>
      )}

      <div>
        <h1>Avatared</h1>
      </div>
      {/* LEFT SIDE: Instructions */}
      <div style={{ width: "250px", padding: "10px" }}>
        <h2>Story</h2>
        <p>The GLIP Lander has successfull made it to the surface of Venus.</p>
        <p>... Just not in the right spot.</p>
        <p>
          High winds have blown it off course and it has landed in ...
          undesirable terrain.
        </p>
        <h2>Instructions</h2>
        <p>
          Program the GLIP Lander to navigate the inhospitable terrain to reach
          its goal.
        </p>
        <p>Beware, Venus has powerful electrical storms ...</p>
      </div>

      {/* CENTER: Main Game Area */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          border: "1px solid #555",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
          }}
        >
          {localGlitchActive && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0)", // Blackout effect
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                fontWeight: "bold",
                zIndex: 999, // Covers only the grid
              }}
            >
              ⚠️ CONNECTION LOST: RETRYING...
            </div>
          )}
          {/* Path Display Above the Grid */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            {generatePathRows().map((row, rowIndex) => (
              <div
                key={rowIndex}
                style={{ display: "flex", gap: "5px", marginBottom: "5px" }}
              >
                {row.map((direction, index) => (
                  <PathBox
                    key={`${rowIndex}-${index}`}
                    direction={direction}
                    index={index}
                    onModify={() => modifyPath(index)}
                  />
                ))}
              </div>
            ))}
          </div>
          <Grid
            grid={grid}
            gridSize={GRID_SIZE}
            playerPosition={playerPosition}
          />
          <Controls onMove={addToPath} />
          <ExecuteButton onExecute={executePath} />
        </div>
      </div>

      {/* RIGHT SIDE: Status Updates */}
      <div style={{ width: "250px", padding: "10px" }}>
        <h2>Status</h2>
        <p>Current Score: {score}</p>
        <p>Current Steps: {path.length}</p>
        <p>Path Index: {currentPathIndex}</p>
        <p>Debug: {debugInfo}</p>
      </div>
    </div>
  );
};

export default App;
