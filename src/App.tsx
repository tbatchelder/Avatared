// import { useState } from "react";
// import React from "react";
// import Grid from "./components/Grid";
// import PathBox from "./components/PathBox";
// import Controls from "./components/Controls";
// import ExecuteButton from "./components/ExecuteButton";

// const App: React.FC = () => {
//   const [path, setPath] = useState<string[]>([]); // Store player inputs dynamically

//   const MAX_PER_ROW = 10;

//   const generatePathRows = () => {
//     const paddedPath = path.length === 0 ? [" "] : [...path]; // Ensure at least one empty box
//     const rows = [];
//     for (let i = 0; i < paddedPath.length; i += MAX_PER_ROW) {
//       rows.push(paddedPath.slice(i, i + MAX_PER_ROW));
//     }
//     return rows;
//   };

//   const modifyPath = (index: number) => {
//     setPath((prevPath) => {
//       const newPath = [...prevPath];
//       newPath[index] = "↓"; // Temporary replacement for testing
//       return newPath;
//     });
//   };

//   const addToPath = (direction: string) => {
//     setPath((prevPath) => [...prevPath, direction]); // Append each move
//   };

//   const executePath = () => {
//     console.log("Executing path:", path);
//   };

//   return (
//     <div
//       style={{
//         display: "flex",
//         justifyContent: "space-between" /* Spreads sections evenly */,
//         alignItems: "center",
//         height: "100vh",
//         width: "100vw",
//         padding: "20px",
//         backgroundColor: "#111",
//         color: "#fff",
//       }}
//     >
//       {/* LEFT SIDE: Instructions */}
//       <div style={{ width: "250px", padding: "10px" }}>
//         <h2>Instructions</h2>
//         <p>Program the avatar using the arrow buttons.</p>
//         <p>Watch out—something may change...</p>
//       </div>

//       {/* CENTER: Main Game Area */}
//       <div
//         style={{
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//         }}
//       >
//         <h1>Avatared</h1>
//         <div
//           style={{
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//           }}
//         >
//           {/* Path Display Above the Grid */}
//           <div
//             style={{
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               marginBottom: "20px",
//             }}
//           >
//             {generatePathRows().map((row, rowIndex) => (
//               <div
//                 key={rowIndex}
//                 style={{ display: "flex", gap: "5px", marginBottom: "5px" }}
//               >
//                 {row.map((direction, index) => (
//                   <PathBox
//                     key={`${rowIndex}-${index}`}
//                     direction={direction}
//                     index={index}
//                     onModify={() => modifyPath(index)}
//                   />
//                 ))}
//               </div>
//             ))}
//           </div>
//           <Grid />
//           <Controls onMove={addToPath} />
//           <ExecuteButton onExecute={executePath} />
//         </div>
//       </div>

//       {/* RIGHT SIDE: Status Updates */}
//       <div style={{ width: "250px", padding: "10px" }}>
//         <h2>Status</h2>
//         <p>Current Steps: {path.length}</p>
//         <p>Glitches: ???</p>
//       </div>
//     </div>
//   );
// };

// export default App;

// import { useState, useEffect } from "react";
// import React from "react";
// import Grid from "./components/Grid";
// import type { Tile } from "./components/Grid";
// import PathBox from "./components/PathBox";
// import Controls from "./components/Controls";
// import ExecuteButton from "./components/ExecuteButton";

// const GRID_SIZE = 10;

// const App: React.FC = () => {
//   const [grid, setGrid] = useState<Tile[][]>([]);
//   const [path, setPath] = useState<string[]>([]); // Store player inputs dynamically
//   const [startCol, setStartCol] = useState<number>(0);
//   const [endCol, setEndCol] = useState<number>(0);

//   const [running, setRunning] = useState(false);
//   const [avatarPos, setAvatarPos] = useState<{
//     row: number;
//     col: number;
//   } | null>(null);

//   // Generate grid on initial load
//   useEffect(() => {
//     const { grid, startCol, endCol } = generateGrid();
//     setGrid(grid);
//     setStartCol(startCol);
//     setEndCol(endCol);
//   }, []);

//   const generateGrid = () => {
//     const grid: Tile[][] = Array(GRID_SIZE)
//       .fill(null)
//       .map(() => Array(GRID_SIZE).fill({ type: "empty" }));

//     // Lock Start & End Positions
//     const startCol = Math.floor(Math.random() * GRID_SIZE);
//     const endCol = Math.floor(Math.random() * GRID_SIZE);
//     grid[GRID_SIZE - 1][startCol] = { type: "start" };
//     grid[0][endCol] = { type: "end" };

//     // Function to check if a path exists using BFS
//     const isPathValid = () => {
//       const queue = [{ row: GRID_SIZE - 1, col: startCol }];
//       const visited = Array(GRID_SIZE)
//         .fill(null)
//         .map(() => Array(GRID_SIZE).fill(false));

//       while (queue.length > 0) {
//         const { row, col } = queue.shift()!;
//         if (row === 0) return true; // Found a path to the top

//         visited[row][col] = true;
//         const directions = [
//           [-1, 0],
//           [0, -1],
//           [0, 1],
//         ]; // Up, Left, Right

//         for (const [dRow, dCol] of directions) {
//           const newRow = row + dRow;
//           const newCol = col + dCol;

//           if (
//             newRow >= 0 &&
//             newCol >= 0 &&
//             newCol < GRID_SIZE &&
//             !visited[newRow][newCol] &&
//             grid[newRow][newCol].type !== "obstacle"
//           ) {
//             queue.push({ row: newRow, col: newCol });
//           }
//         }
//       }
//       return false;
//     };

//     // Place Obstacles & Ensure Valid Path
//     let attempts = 0;
//     while (attempts < 100) {
//       // Reset grid except start/end
//       for (let row = 1; row < GRID_SIZE - 1; row++) {
//         for (let col = 0; col < GRID_SIZE; col++) {
//           grid[row][col] = { type: "empty" };
//         }
//       }

//       // Place 30 obstacles randomly
//       let obstaclesPlaced = 0;
//       while (obstaclesPlaced < 30) {
//         const row = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
//         const col = Math.floor(Math.random() * GRID_SIZE);
//         if (grid[row][col].type === "empty") {
//           grid[row][col] = { type: "obstacle" };
//           obstaclesPlaced++;
//         }
//       }

//       // Validate path
//       if (isPathValid()) break;
//       attempts++;
//     }

//     return { grid, startCol, endCol };
//   };

//   const MAX_PER_ROW = 10;

//   const generatePathRows = () => {
//     const paddedPath = path.length === 0 ? [" "] : [...path]; // Ensure at least one empty box
//     const rows = [];
//     for (let i = 0; i < paddedPath.length; i += MAX_PER_ROW) {
//       rows.push(paddedPath.slice(i, i + MAX_PER_ROW));
//     }
//     return rows;
//   };

//   const modifyPath = (index: number) => {
//     setPath((prevPath) => {
//       const newPath = [...prevPath];
//       newPath[index] = "↓"; // Temporary replacement for testing
//       return newPath;
//     });
//   };

//   const addToPath = (direction: string) => {
//     setPath((prevPath) => [...prevPath, direction]); // Append each move
//   };

//   // You can use these variables for the player movement implementation
//   // For example, you'll need startCol to know where the player begins
//   const executePath = () => {
//     console.log("Executing path:", path);
//     console.log("Starting column:", startCol);
//     console.log("Target column:", endCol);

//     if (running) return;
//     setRunning(true);

//     let currentRow = GRID_SIZE - 1; // Start at bottom row
//     let currentCol = startCol;
//     setAvatarPos({ row: currentRow, col: currentCol }); // Initialize avatar position

//     path.forEach((direction, index) => {
//       setTimeout(() => {
//         // Calculate next position
//         if (direction === "↑") currentRow--;
//         else if (direction === "→") currentCol++;
//         else if (direction === "←") currentCol--;

//         // Check for obstacles or boundaries
//         if (
//           currentRow < 0 ||
//           currentCol < 0 ||
//           currentCol >= GRID_SIZE ||
//           grid[currentRow][currentCol].type === "obstacle"
//         ) {
//           alert("Game Over!");
//           setRunning(false);
//           return;
//         }

//         // Update avatar position
//         setAvatarPos({ row: currentRow, col: currentCol });

//         // If reached end position, trigger win
//         if (grid[currentRow][currentCol].type === "end") {
//           alert("You Win!");
//           setRunning(false);
//         }
//       }, index * 1000); // Delay per step
//     });
//     // Implement execution of the path here
//     // You could animate the avatar's movement through the grid based on path directions
//   };

//   return (
//     <div
//       style={{
//         display: "flex",
//         justifyContent: "space-between",
//         alignItems: "center",
//         height: "100vh",
//         width: "100vw",
//         padding: "20px",
//         backgroundColor: "#111",
//         color: "#fff",
//       }}
//     >
//       {/* LEFT SIDE: Instructions */}
//       <div style={{ width: "250px", padding: "10px" }}>
//         <h2>Instructions</h2>
//         <p>Program the avatar using the arrow buttons.</p>
//         <p>Watch out—something may change...</p>
//       </div>

//       {/* CENTER: Main Game Area */}
//       <div
//         style={{
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//         }}
//       >
//         <h1>Avatared</h1>
//         <div
//           style={{
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//           }}
//         >
//           {/* Path Display Above the Grid */}
//           <div
//             style={{
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               marginBottom: "20px",
//             }}
//           >
//             {generatePathRows().map((row, rowIndex) => (
//               <div
//                 key={rowIndex}
//                 style={{ display: "flex", gap: "5px", marginBottom: "5px" }}
//               >
//                 {row.map((direction, index) => (
//                   <PathBox
//                     key={`${rowIndex}-${index}`}
//                     direction={direction}
//                     index={index}
//                     onModify={() => modifyPath(index)}
//                   />
//                 ))}
//               </div>
//             ))}
//           </div>
//           <Grid grid={grid} gridSize={GRID_SIZE} />
//           <Controls onMove={addToPath} />
//           <ExecuteButton onExecute={executePath} />
//         </div>
//       </div>

//       {/* RIGHT SIDE: Status Updates */}
//       <div style={{ width: "250px", padding: "10px" }}>
//         <h2>Status</h2>
//         <p>Current Steps: {path.length}</p>
//         <p>Glitches: ???</p>
//       </div>
//     </div>
//   );
// };

// export default App;

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
      .map(() => Array(GRID_SIZE).fill({ type: "empty" }));

    // Lock Start & End Positions
    const startCol = Math.floor(Math.random() * GRID_SIZE);
    const endCol = Math.floor(Math.random() * GRID_SIZE);
    grid[GRID_SIZE - 1][startCol] = { type: "start" };
    grid[0][endCol] = { type: "end" };

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
          grid[row][col] = { type: "empty" };
        }
      }

      // Place 30 obstacles randomly
      let obstaclesPlaced = 0;
      while (obstaclesPlaced < 30) {
        const row = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
        const col = Math.floor(Math.random() * GRID_SIZE);
        if (grid[row][col].type === "empty") {
          grid[row][col] = { type: "obstacle" };
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
    setPath((prevPath) => [...prevPath, direction]); // Append each move
  };

  // Add debug state to help track what's happening
  const [debugInfo, setDebugInfo] = useState<string>("");

  const executePath = () => {
    // Don't allow execution if already running
    if (isExecuting) return;

    console.log("Starting path execution with path:", path);
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
          newGrid[row][col] = { type: "empty" };
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
      console.log("Path complete!");
      setDebugInfo("Path complete!");
      setIsExecuting(false);
      return;
    }

    console.log(`Executing step ${stepIndex}: ${path[stepIndex]}`);
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
        console.log("Invalid direction, skipping");
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
      console.log("Hit an obstacle at", newRow, newCol);
      setDebugInfo(`Hit obstacle at ${newRow},${newCol}`);
      setPlayerPosition(newPosition);
      setIsExecuting(false);
      return;
    }

    // Create a new grid that includes all previous path markers
    const newGrid: Tile[][] = JSON.parse(JSON.stringify(currentGrid));

    // Mark the new position as path if it's not start or end
    if (
      newGrid[newRow][newCol].type !== "start" &&
      newGrid[newRow][newCol].type !== "end"
    ) {
      newGrid[newRow][newCol] = { type: "path" };
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

    // Schedule next step with a delay, passing updated grid, increased index, and new position
    executionTimerRef.current = window.setTimeout(() => {
      movePlayer(newGrid, stepIndex + 1, newPosition);
    }, 500);
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
      {/* LEFT SIDE: Instructions */}
      <div style={{ width: "250px", padding: "10px" }}>
        <h2>Instructions</h2>
        <p>Program the avatar using the arrow buttons.</p>
        <p>Watch out—something may change...</p>
      </div>

      {/* CENTER: Main Game Area */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h1>Avatared</h1>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
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
        <p>Current Steps: {path.length}</p>
        <p>Path Index: {currentPathIndex}</p>
        <p>Debug: {debugInfo}</p>
      </div>
    </div>
  );
};

export default App;
