import React, { useState } from "react";
import { Typography, Box, Table, TableBody, TableCell, TableRow } from "@mui/material";
import { RenderMatrix } from "./MatrixDisplay";
import en from '../locales/en';
import el from '../locales/el';
import { getColumnsForExplanations, getHighlightedColumnsByMatrix } from "./KeyExpansionHelper";

function KeyExpansionMatrices({ roundKeys, toHex, keySize: userKeySize }) {
  const [highlightedMatrix, setHighlightedMatrix] = useState(null);
  const [highlightedCells, setHighlightedCells] = useState({});
  const [highlightedColumnsByMatrix, setHighlightedColumnsByMatrix] = useState({});
  const selectedColumns = highlightedColumnsByMatrix[highlightedMatrix] || [];

  // Handler for cell click: highlight cell and column
  const handleCellClick = (matrixIdx, colIdx) => {
    const n = 4;
    const offset = keySize / 32;
    if (matrixIdx === 0) return;
    if (matrixIdx === 1) {
      if (offset === 8) return;
      if (offset === 6 && colIdx < 2) return;
    }

    const cellKey = `${matrixIdx}-${colIdx}`;
    setHighlightedCells({ [cellKey]: true });
    setHighlightedMatrix(matrixIdx);

    // Use helper to calculate highlighted columns
    const updated = getHighlightedColumnsByMatrix(matrixIdx, colIdx, keySize);

    setHighlightedColumnsByMatrix(updated);

    // Use the helper function for explanations
    const columnDataMap = getColumnsForExplanations(
      matrixIdx,
      colIdx,
      roundKeys,
      toHex,
      keySize,
      formatAsMatrix
    );
    console.log("Column Data Map:", Array.from(columnDataMap.values()));
  };

  // You may need to import or define formatAsMatrix here if not already available
  function formatAsMatrix(hexString) {
    const bytes = hexString.split(" ");
    const matrix = [[], [], [], []];
    for (let i = 0; i < 16; i++) {
      matrix[i % 4].push(bytes[i]);
    }
    return matrix;
  }

  // Determine key size dynamically
  let keySize = userKeySize;
  if (!keySize) {
    // roundKeys.length is number of rounds + 1
    if (roundKeys && roundKeys.length === 11) keySize = 128;
    else if (roundKeys && roundKeys.length === 13) keySize = 192;
    else if (roundKeys && roundKeys.length === 15) keySize = 256;
    else keySize = 128; // fallback
  }

  let explanationText = "";
  if (keySize === 128) explanationText = en.keyExpansion.aes128;
  else if (keySize === 192) explanationText = en.keyExpansion.aes192;
  else if (keySize === 256) explanationText = en.keyExpansion.aes256;

  return (
    <>
      <Typography variant="subtitle1" align="center">
        All Round Keys (Matrix Format)
      </Typography>
      <div
        className="key-expansion-matrix-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "16px",
          justifyItems: "center",
          alignItems: "start",
          marginTop: "16px",
          maxWidth: "1000px",
          marginLeft: "auto",
          marginRight: "auto",
          justifyContent: "center",
        }}
      >
        {roundKeys.map((roundKey, idx) => (
          <div key={idx} style={{ width: "100%" }}>
            <Typography variant="caption" align="center">
              Round {idx}
            </Typography>
            <RenderMatrix
              hexString={toHex(roundKey)}
              matrixId={idx}
              title=""
              highlightedCells={highlightedCells}
              handleCellClick={(cellId, byte, matrixId, colIndex) => handleCellClick(idx, colIndex)}
              highlightedColumns={highlightedColumnsByMatrix[idx] || []}
            />
          </div>
        ))}
      </div>
      {/* Info container for selected columns */}
      {Object.entries(highlightedColumnsByMatrix).length > 0 && (
        <Box
          className="info-container"
          mt={2}
          sx={{
            display: "flex",
            gap: "32px",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          <div
            className="visual-explanation"
            style={{
              display: "flex",
              gap: 24,
              flexWrap: "wrap",
              minWidth: 180,
              flex: "1 1 180px"
            }}
          >
            {/* Combine all highlighted columns into one table */}
            <Table
              className="combined-matrix-col-table"
              size="small"
              style={{
                margin: "0 auto",
                minWidth: 60,
                width: "auto",
                flex: "0 0 auto"
              }}
            >
              <TableBody>
                {/* Header row: labels for each column */}
                <TableRow>
                  {Object.entries(highlightedColumnsByMatrix).flatMap(([matrixIdx, cols]) =>
                    cols.map((col, colIdx) => (
                      <TableCell
                        key={`header-${matrixIdx}-${col}`}
                        align="center"
                        style={{ fontWeight: "bold", color: "#7b1fa2" }}
                      >
                        Matrix {matrixIdx}, Col {col}
                      </TableCell>
                    ))
                  )}
                </TableRow>
                {/* Data rows: bytes for each column */}
                {[0, 1, 2, 3].map(rowIdx => (
                  <TableRow key={`row-${rowIdx}`}>
                    {Object.entries(highlightedColumnsByMatrix).flatMap(([matrixIdx, cols]) => {
                      const matrix = formatAsMatrix(toHex(roundKeys[matrixIdx]));
                      return cols.map(col => (
                        <TableCell key={`cell-${matrixIdx}-${col}-${rowIdx}`} align="center">
                          {matrix[rowIdx][col]}
                        </TableCell>
                      ));
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* Right: Key expansion explanation */}
          <div
            className="explanation-text"
            style={{
              minWidth: 220,
              maxWidth: 400,
              flex: "1 1 220px",
              marginLeft: "auto",
              width: "100%", // helps wrapping on small screens //didnt work good
            }}
          >
            <Typography variant="body2" component="div" style={{ whiteSpace: "pre-line" }}>
              {explanationText}
            </Typography>
          </div>
        </Box>
      )}
    </>
  );
} 

export default KeyExpansionMatrices;