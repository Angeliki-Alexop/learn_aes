import React from "react";
import { Box, Typography } from "@mui/material";
import { formatAsMatrix } from "../utils/stepByStepUtils";
import { highlightColor } from "./StepByStep";

// Matrix rendering component
export function RenderMatrix({
  hexString,
  matrixId,
  title,
  highlightRows = false,
  highlightColumns = false,
  highlightedCells = {}, // <-- change here
  handleCellClick,
  highlightedCellValue,
  highlightedColumns = []
}) {
  const matrix = formatAsMatrix(hexString);
  return (
    <Box className="matrix">
      <table className="matrix-table">
        <tbody>
          {matrix.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((byte, colIndex) => {
                const cellId = `${matrixId}-${rowIndex}-${colIndex}`;
                const isHighlighted = highlightedCells[cellId]; // <-- change here
                let highlightStyle = {};
                if (
                  Array.isArray(highlightedColumns) &&
                  highlightedColumns.includes(colIndex)
                ) {
                  highlightStyle = { backgroundColor: "rgba(128, 0, 128, 0.2)" };
                }
                if (isHighlighted) {
                  highlightStyle = { backgroundColor: "rgba(255, 0, 0, 0.7)" };
                }
                return (
                  <td
                    key={colIndex}
                    id={cellId}
                    onClick={() => handleCellClick(cellId, byte, matrixId, colIndex)}
                    style={highlightStyle}
                  >
                    {byte}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <Typography
        variant="body1"
        component="p"
        align="left"
        className="matrix-title"
        id={`${matrixId}-title`}
      >
        {title}
      </Typography>
    </Box>
  );
}

export function RenderFixedMatrix() {
  const fixedMatrix = [
    ["02", "03", "01", "01"],
    ["01", "02", "03", "01"],
    ["01", "01", "02", "03"],
    ["03", "01", "01", "02"],
  ];
  return (
    <Box className="matrix">
      <table className="matrix-table">
        <tbody>
          {fixedMatrix.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((byte, colIndex) => (
                <td key={colIndex}>{byte}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <Typography
        variant="body1"
        component="p"
        align="left"
        className="matrix-title"
      >
        Fixed Matrix
      </Typography>
    </Box>
  );
}

export function RenderSBox({ sBox, highlightedCellValue }) {
  const sBoxMatrix = [];
  for (let i = 0; i < 16; i++) {
    sBoxMatrix.push(sBox.slice(i * 16, i * 16 + 16));
  }
  const highlightRow = highlightedCellValue
    ? parseInt(highlightedCellValue[0], 16)
    : -1;
  const highlightCol = highlightedCellValue
    ? parseInt(highlightedCellValue[1], 16)
    : -1;
  return (
    <Box className="matrix">
      <table className="matrix-table small">
        <thead>
          <tr>
            <th></th>
            {Array.from({ length: 16 }, (_, i) => (
              <th key={i}>{i.toString(16).toUpperCase()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sBoxMatrix.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              style={
                highlightRow === rowIndex
                  ? { backgroundColor: "rgba(255, 0, 0, 0.2)" }
                  : {}
              }
            >
              <th>{rowIndex.toString(16).toUpperCase()}</th>
              {row.map((byte, colIndex) => (
                <td
                  key={colIndex}
                  style={
                    highlightRow === rowIndex && highlightCol === colIndex
                      ? { backgroundColor: "red" }
                      : highlightRow === rowIndex ||
                        highlightCol === colIndex
                      ? { backgroundColor: "rgba(255, 0, 0, 0.2)" }
                      : {}
                  }
                >
                  {byte.toString(16).padStart(2, "0")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <Typography
        variant="body1"
        component="p"
        align="left"
        className="matrix-title"
      >
        sBox
      </Typography>
    </Box>
  );
}
