import React from "react";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { formatAsMatrix } from "../utils/stepByStepUtils";
import { highlightColor } from "./StepByStep";

// Matrix rendering component
export function RenderMatrix({
  hexString,
  matrixId,
  title,
  highlightRows = false,
  highlightColumns = false,
  highlightedCells = {},
  highlightedCell = {},
  handleCellClick,
  highlightedCellValue,
  highlightedColumns = [],
  shiftHighlights = [], // array of [row,col] to highlight special for ShiftRows next-state
  disabledColumns = [],
}) {
  const matrix = formatAsMatrix(hexString);
  return (
    <Box
      className={
        "matrix " +
        (matrixId === "previous"
          ? "previous-matrix"
          : matrixId === "roundKey"
          ? "roundkey-matrix"
          : "")
      }
    >
      <table className="matrix-table">
        <tbody>
          {matrix.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((byte, colIndex) => {
                const cellId = `${matrixId}-${rowIndex}-${colIndex}`;
                let highlightStyle = {};
                const isDisabled =
                  Array.isArray(disabledColumns) &&
                  disabledColumns.includes(colIndex);

                // Highlight selected cell in red
                if (highlightedCell === cellId) {
                  highlightStyle = { backgroundColor: "rgba(255, 0, 0, 1)" }; // Red as is highlighted class
                }

                // Highlight column if needed (MixColumns)
                if (
                  Array.isArray(highlightedColumns) &&
                  highlightedColumns.includes(colIndex)
                ) {
                  highlightStyle = {
                    backgroundColor: "rgba(128, 0, 128, 0.15)",
                  }; // Purple
                }

                // Determine if this cell is in the shiftHighlights list
                const isShiftHighlighted =
                  Array.isArray(shiftHighlights) &&
                  shiftHighlights.some(
                    (coord) =>
                      Array.isArray(coord) &&
                      coord[0] === rowIndex &&
                      coord[1] === colIndex
                  );

                const className = isShiftHighlighted
                  ? "cell-shifted-highlight"
                  : undefined;

                return (
                  <td
                    key={colIndex}
                    id={cellId}
                    className={className}
                    style={{
                      ...highlightStyle,
                      cursor: isDisabled ? "not-allowed" : undefined,
                      opacity: isDisabled ? 0.45 : 1,
                    }}
                    onClick={() => {
                      if (isDisabled) return;
                      handleCellClick &&
                        handleCellClick(
                          cellId,
                          byte,
                          matrixId,
                          rowIndex,
                          colIndex
                        );
                    }}
                  >
                    {byte}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {title ? (
        <Typography
          variant="body1"
          component="p"
          align="left"
          className="matrix-title"
          id={`${matrixId}-title`}
        >
          {title}
        </Typography>
      ) : null}
    </Box>
  );
}

export function RenderFixedMatrix({ highlightedRow = null }) {
  const { t } = useTranslation();
  const fixedMatrix = arguments[0].matrix || [
    ["02", "03", "01", "01"],
    ["01", "02", "03", "01"],
    ["01", "01", "02", "03"],
    ["03", "01", "01", "02"],
  ];
  const title = arguments[0].title || t("pages.stepByStep.mixColumns.fixedMatrix", "Fixed Matrix");
  return (
    <Box className="matrix fixed-matrix">
      <table className="matrix-table">
        <tbody>
          {fixedMatrix.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              style={{
                background:
                  highlightedRow === rowIndex
                    ? "rgba(128, 0, 128, 0.15)"
                    : "transparent",
              }}
            >
              {row.map((cell, colIndex) => (
                <td key={colIndex}>{cell}</td>
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
        {title}
      </Typography>
    </Box>
  );
}

export function RenderSBox({ sBox, highlightedInputValue, highlightedOutputValue, title = 'S-Box' }) {
  const sBoxMatrix = [];
  for (let i = 0; i < 16; i++) {
    sBoxMatrix.push(sBox.slice(i * 16, (i + 1) * 16));
  }
  // Determine highlight row/col for input value (high nibble = row, low = col)
  let inputRow = -1;
  let inputCol = -1;
  if (highlightedInputValue) {
    const norm = String(highlightedInputValue).toLowerCase().replace(/^0x/, "").padStart(2, "0");
    inputRow = parseInt(norm[0], 16);
    inputCol = parseInt(norm[1], 16);
  }
  // Determine which cell contains the output value (search table for value)
  let outputRow = -1;
  let outputCol = -1;
  if (highlightedOutputValue) {
    const searchVal = parseInt(String(highlightedOutputValue).toLowerCase().replace(/^0x/, "").padStart(2, "0"), 16);
    const index = sBox.findIndex((v) => v === searchVal);
    if (index >= 0) {
      outputRow = Math.floor(index / 16);
      outputCol = index % 16;
    }
  }
  return (
    <Box
      className="matrix sbox-matrix"
      sx={{
        display: "inline-block",
        p: 0.5,
        bgcolor: "background.paper",
        border: "1px solid rgba(0,0,0,0.06)",
        borderRadius: 2,
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <Typography
        variant="body1"
        component="p"
        align="center"
        className="matrix-title"
        sx={{ display: "block", mb: -1 }}
      >
        {title}
      </Typography>
      <table
        className="matrix-table small"
        style={{ borderCollapse: "separate", borderSpacing: "4px" }}
      >
        <thead>
          <tr>
            <th
              style={{
                padding: "2px 4px",
                backgroundColor: "rgba(15, 15, 15, 0.03)",
                borderRadius: "4px",
              }}
            ></th>
            {Array.from({ length: 16 }, (_, i) => (
              <th
                key={i}
                style={{
                  ...(inputCol === i
                    ? { backgroundColor: "rgba(255, 0, 0, 0.32)" }
                    : { backgroundColor: "rgba(190, 2, 134, 0.16)" }),
                  padding: "2px 4px",
                  fontSize: "11px",
                  textAlign: "center",
                  minWidth: "22px",
                  borderRadius: "4px",
                }}
              >
                {i.toString(16).toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sBoxMatrix.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              style={
                inputRow === rowIndex || outputRow === rowIndex
                  ? { backgroundColor: "rgba(255, 0, 0, 0.04)" }
                  : {}
              }
            >
              <th
                style={{
                  ...(inputRow === rowIndex
                    ? { backgroundColor: "rgba(255,0,0,0.32)" }
                    : { backgroundColor: "rgba(190, 2, 134, 0.16)" }),
                  padding: "2px 4px",
                  fontSize: "11px",
                  textAlign: "center",
                  borderRadius: "4px",
                }}
              >
                {rowIndex.toString(16).toUpperCase()}
              </th>
              {row.map((byte, colIndex) => (
                <td
                  key={colIndex}
                  style={{
                    ...(outputRow === rowIndex && outputCol === colIndex
                      ? { backgroundColor: "rgb(255, 255, 0)" }
                      : inputRow === rowIndex || inputCol === colIndex
                      ? { backgroundColor: "rgba(255, 0, 0, 0.09)" }
                      : { backgroundColor: "#ffffff" }),
                    padding: "4px 6px",
                    fontSize: "11px",
                    textAlign: "center",
                    minWidth: "22px",
                    borderRadius: "4px",
                    border: "1px solid rgba(0,0,0,0.03)",
                  }}
                >
                  <span style={{ fontFamily: "monospace" }}>
                    {byte.toString(16).padStart(2, "0")}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
}
