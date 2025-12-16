import React, { useState } from "react";
import { Typography, Box, Table, TableBody, TableCell, TableRow } from "@mui/material";
import { RenderMatrix } from "./MatrixDisplay";
import en from '../locales/en';
import el from '../locales/el';
import { getColumnsForExplanations, getHighlightedColumnsByMatrix, getExplanationColumns } from "./KeyExpansionHelper";
import { CirclePlus, RotateCcw, Wand2, Equal } from 'lucide-react';
import { sBox, rCon } from "../utils/aes_manual_v2";

function KeyExpansionMatrices({ roundKeys, toHex, keySize: userKeySize }) {
  const [highlightedMatrix, setHighlightedMatrix] = useState(null);
  const [highlightedCells, setHighlightedCells] = useState({});
  const [highlightedColumnsByMatrix, setHighlightedColumnsByMatrix] = useState({});
  const [explanationColumns, setExplanationColumns] = useState([]);
  const displayOrder = ["previous word", "offset word before", "current word"];

  // Handler for cell click: highlight cell and column
  const handleCellClick = (matrixIdx, colIdx) => {
    if (matrixIdx === 0) return;
    const n = 4;
    const offset = keySize / 32;

    // Special cases for AES-192 and AES-256 (skip some columns in round 1)
    if (matrixIdx === 1) {
      if (offset === 8) return;
      if (offset === 6 && colIdx < 2) return;
    }

    const cellKey = `${matrixIdx}-${colIdx}`;
    setHighlightedCells({ [cellKey]: true });
    setHighlightedMatrix(matrixIdx);

    // Highlighted columns
    const updated = getHighlightedColumnsByMatrix(matrixIdx, colIdx, keySize);
    setHighlightedColumnsByMatrix(updated);

    // Get explanation columns using helper
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

    // Use helper to build the visual explanation columns
    const sortedColumnsWithXor = getExplanationColumns({
      matrixIdx,
      colIdx,
      sortedColumns,
      keySize
    });

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
        {roundKeys.map((roundKey, idx) => {
          // compute disabled columns (words) that belong to the original key
          const initialBytes = (keySize || userKeySize) / 8; // e.g., 16,24,32
          const matrixStartByte = idx * 16;
          const disabledCols = [];
          for (let col = 0; col < 4; col++) {
            const wordStart = matrixStartByte + col * 4;
            if (wordStart < initialBytes) {
              disabledCols.push(col);
            }
          }

          return (
          <div key={idx} style={{ width: "100%" }}>
            <Typography variant="caption" align="center">
              Round {idx}
            </Typography>
            <RenderMatrix
              hexString={toHex(roundKey)}
              matrixId={idx}
              title=""
              highlightedCells={highlightedCells}
              handleCellClick={(cellId, byte, matrixId, rowIdx, colIdx) => handleCellClick(idx, colIdx)}
              highlightedColumns={highlightedColumnsByMatrix[idx] || []}
              disabledColumns={disabledCols}
            />
          </div>
        )})}
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