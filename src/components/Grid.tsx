// //
// import React from "react";

// export type Tile = { type: "start" | "end" | "path" | "empty" | "obstacle" };

// interface GridProps {
//   grid: Tile[][];
//   gridSize: number;
// }

// const Grid: React.FC<GridProps> = ({ grid, gridSize }) => {
//   return (
//     <div
//       style={{
//         display: "grid",
//         gridTemplateColumns: `repeat(${gridSize}, 40px)`,
//       }}
//     >
//       {grid.flat().map((cell, index) => (
//         <div
//           key={index}
//           style={{
//             width: 40,
//             height: 40,
//             backgroundColor:
//               cell.type === "start"
//                 ? "green"
//                 : cell.type === "end"
//                 ? "red"
//                 : cell.type === "path"
//                 ? "yellow"
//                 : cell.type === "obstacle"
//                 ? "blue"
//                 : "#222",
//             border: "1px solid #555",
//           }}
//         />
//       ))}
//     </div>
//   );
// };

// export default Grid;

import React from "react";

export type Tile = { type: "start" | "end" | "path" | "empty" | "obstacle" };

interface GridProps {
  grid: Tile[][];
  gridSize: number;
  playerPosition?: { row: number; col: number } | null;
}

const Grid: React.FC<GridProps> = ({ grid, gridSize, playerPosition }) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${gridSize}, 40px)`,
      }}
    >
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          // Check if this is the current player position
          const isPlayerPosition =
            playerPosition &&
            playerPosition.row === rowIndex &&
            playerPosition.col === colIndex;

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              style={{
                width: 40,
                height: 40,
                backgroundColor: isPlayerPosition
                  ? "purple" // Player position color
                  : cell.type === "start"
                  ? "green"
                  : cell.type === "end"
                  ? "red"
                  : cell.type === "path"
                  ? "yellow"
                  : cell.type === "obstacle"
                  ? "blue"
                  : "#222",
                border: "1px solid #555",
                position: "relative",
              }}
            >
              {isPlayerPosition && (
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    backgroundColor: "white",
                  }}
                />
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default Grid;
