import React, { useState } from "react";
import { Typography, Box, Table, TableBody, TableCell, TableRow } from "@mui/material";
import { RenderMatrix } from "./MatrixDisplay";
import en from '../locales/en';
import el from '../locales/el';
import { getColumnsForExplanations, getHighlightedColumnsByMatrix } from "./KeyExpansionHelper";
import { CirclePlus, RotateCcw, Wand2, Equal } from 'lucide-react';
import { sBox } from "../utils/aes_manual_v2";

function KeyExpansionMatrices({ roundKeys, toHex, keySize: userKeySize }) {
  const [highlightedMatrix, setHighlightedMatrix] = useState(null);
  const [highlightedCells, setHighlightedCells] = useState({});
  const [highlightedColumnsByMatrix, setHighlightedColumnsByMatrix] = useState({});
  const [explanationColumns, setExplanationColumns] = useState([]);
  const displayOrder = ["previous word", "offset word before", "current word"];

  // Handler for cell click: highlight cell and column
  const handleCellClick = (matrixIdx, colIdx) => {
    const n = 4;
    const offset = keySize / 32;
    const isSpecialCol = ((colIdx + matrixIdx * n) % offset) === 0;

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
    const columnsArray = Array.from(columnDataMap.values());
    const sortedColumns = columnsArray.sort(
      (a, b) => displayOrder.indexOf(a.column) - displayOrder.indexOf(b.column)
    );
    console.log("Sorted Columns for Explanation:", sortedColumns);
    const xorEntry = { column: "XOR", matrix: null, colidx: null, data: ["", "XOR", "", ""] };
    const rotateEntry = { column: "Rotate", matrix: null, colidx: null, data: ["", "Rotate", "", ""] };
    const subEntry = { column: "Substitute", matrix: null, colidx: null, data: ["", "Substitute", "", ""] };
    const equalsEntry = { column: "Equals", matrix: null, colidx: null, data: ["", "=", "", ""] };
    // add a check if we the current column is colidx == 0 (first column) then console.log if yes or no
    if (colIdx === 0) {
      console.log("Current column is the first column (colIdx == 0)");
    } else {
      console.log("Current column is not the first column (colIdx != 0)");
    }

    const prevWord = sortedColumns[0].data;

    const roratedWordData = [prevWord[1], prevWord[2], prevWord[3], prevWord[0]];
    const roratedWord = {
      column: "Rotated Word",
      matrix: sortedColumns[0].matrix,
      colidx: sortedColumns[0].colidx,
      data: roratedWordData
    };
    
    const subbedWordData = roratedWordData.map(byte =>
      typeof byte === "string"
        ? sBox[parseInt(byte, 16)].toString(16).padStart(2, "0")
        : sBox[byte].toString(16).padStart(2, "0")
    );
    const subbedWord = {
      column: "Substituted Word",
      matrix: sortedColumns[0].matrix,
      colidx: sortedColumns[0].colidx,
      data: subbedWordData
    };
    const sortedColumnsWithXor = isSpecialCol
  ? [
      sortedColumns[0],
      rotateEntry,
      roratedWord,
      subEntry,
      subbedWord,
      xorEntry,
      sortedColumns[1],
      xorEntry,
      equalsEntry,
      sortedColumns[2]
    ]
  : [
      sortedColumns[0],
      xorEntry,
      sortedColumns[1],
      xorEntry,
      sortedColumns[2]
    ];
    console.log("Sorted Columns with XOR for Explanation:", sortedColumnsWithXor);
    setExplanationColumns(sortedColumnsWithXor);
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
      {explanationColumns.length > 0 && (
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
                  {explanationColumns.map((col, colIdx) =>
                    <TableCell
                      key={`header-${col.column}-${colIdx}`}
                      align="center"
                      sx={{ fontWeight: "bold", color: "#7b1fa2", padding: "4px", minWidth: "32px" }}
                    >
                      {col.column === "previous word" ? "Prev" :
                      col.column === "offset word before" ? "Offset" :
                      col.column === "current word" ? "Curr" :
                      col.column === "XOR" ? "XOR" :
                      col.column === "Rotate" ? "Rotate" :
                      col.column === "Substitute" ? "Sub" :
                      col.column === "Rotated" ? "Rotated" :
                      col.column === "Substituted Word" ? "Subbed" :
                      col.column === "Rcon" ? "Rcon" :
                      col.column}
                    </TableCell>
                  )}
                </TableRow>
                {/* Data rows: bytes for each column */}
                {[0, 1, 2, 3].map(rowIdx => (
                  <TableRow key={`row-${rowIdx}`}>
                    {explanationColumns.map((col, colIdx) =>
                      <TableCell key={`cell-${colIdx}-${rowIdx}`} align="center">
                        {(col.column === "XOR" && col.data[rowIdx] === "XOR")
                          ? <CirclePlus size={20} color="#7b1fa2" />
                          : (col.column === "Rotate" && col.data[rowIdx] === "Rotate")
                            ? <RotateCcw size={20} color="#7b1fa2" />
                            : (col.column === "Substitute" && col.data[rowIdx] === "Substitute")
                              ? <Wand2 size={20} color="#7b1fa2" />
                              : (col.column === "Equals" && col.data[rowIdx] === "=")
                                ? <Equal size={20} color="#7b1fa2" />
                                : col.data[rowIdx]
                        }
                      </TableCell>
                    )}
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