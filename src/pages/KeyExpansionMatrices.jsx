import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Paper,
} from "@mui/material";
import { RenderMatrix } from "./MatrixDisplay";
import { useTranslation } from 'react-i18next';
import {
  getColumnsForExplanations,
  getHighlightedColumnsByMatrix,
  getExplanationColumns,
} from "./KeyExpansionHelper";
import { CirclePlus, RotateCcw, Wand2, Equal } from "lucide-react";
import { sBox, rCon } from "../utils/aes_manual_v2";

function KeyExpansionMatrices({ roundKeys, toHex, keySize: userKeySize, mode = 'Encrypt' }) {
  const { t } = useTranslation();
  const [highlightedMatrix, setHighlightedMatrix] = useState(null);
  const [highlightedCells, setHighlightedCells] = useState({});
  const [highlightedColumnsByMatrix, setHighlightedColumnsByMatrix] = useState(
    {}
  );
  const [explanationColumns, setExplanationColumns] = useState([]);
  const displayOrder = ["previous word", "offset word before", "current word"];

  // Determine key size dynamically
  let keySize = userKeySize;
  if (!keySize) {
    // roundKeys.length is number of rounds + 1
    if (roundKeys && roundKeys.length === 11) keySize = 128;
    else if (roundKeys && roundKeys.length === 13) keySize = 192;
    else if (roundKeys && roundKeys.length === 15) keySize = 256;
    else keySize = 128; // fallback
  }

  // explanation text state so we can change it dynamically
  let defaultExplanationText = "";
  // Use the English keyExpansion long explanations from the locale resource
  if (keySize === 128) defaultExplanationText = t('keyExpansion.aes128');
  else if (keySize === 192) defaultExplanationText = t('keyExpansion.aes192');
  else if (keySize === 256) defaultExplanationText = t('keyExpansion.aes256');

  const [explanationText, setExplanationText] = useState(
    defaultExplanationText
  );

  // words per round key (used to display offsets like w[i - 4], w[i - 6], w[i - 8])
  const wordsPerKey = keySize / 32;

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
      keySize,
    });

    setExplanationColumns(sortedColumnsWithXor);

    // Dynamic explanatory text depending on key size and selected word (use i18n)
    const wordIndex = matrixIdx * 4 + colIdx;
    if (keySize === 128) {
      const isSpecial = wordIndex % 4 === 0;
      if (isSpecial) {
        setExplanationText(t('pages.stepByStep.keySchedule.explanations.case1', { mod: 4, offset: 4 }));
      } else {
        setExplanationText(t('pages.stepByStep.keySchedule.explanations.case2', { offset: 4 }));
      }
    } else if (keySize === 192) {
      const isSpecial = wordIndex % 6 === 0;
      if (isSpecial) {
        setExplanationText(t('pages.stepByStep.keySchedule.explanations.case1', { mod: 6, offset: 6 }));
      } else {
        setExplanationText(t('pages.stepByStep.keySchedule.explanations.case2', { offset: 6 }));
      }
    } else if (keySize === 256) {
      if (wordIndex % 8 === 0) {
        setExplanationText(t('pages.stepByStep.keySchedule.explanations.case1', { mod: 8, offset: 8 }));
      } else if (wordIndex % 8 === 4) {
        setExplanationText(t('pages.stepByStep.keySchedule.explanations.case2_mid', { mod: 8, mid: 4, offset: 8 }));
      } else {
        setExplanationText(t('pages.stepByStep.keySchedule.explanations.case2', { offset: 8 }));
      }
    } else {
      setExplanationText(defaultExplanationText);
    }
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

  // reset to default when no column selected
  useEffect(() => {
    if (!explanationColumns || explanationColumns.length === 0) {
      setExplanationText(defaultExplanationText);
    }
  }, [explanationColumns, defaultExplanationText]);

  return (
    <>
      <Typography variant="subtitle1" align="center">
        {t('pages.stepByStep.keySchedule.title')}
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

          const numberOfRounds = keySize === 128 ? 10 : keySize === 192 ? 12 : 14;
          // use display label if you want round to be reversed for Decrypt mode
          // const displayLabel = mode === 'Decrypt' ? numberOfRounds - idx : idx;

          return (
            <div key={idx} style={{ width: "100%" }}>
              <Typography variant="caption" align="center">
                {t('pages.stepByStep.keySchedule.roundLabel', { n: idx })}
              </Typography>
              <RenderMatrix
                hexString={toHex(roundKey)}
                matrixId={idx}
                title=""
                highlightedCells={highlightedCells}
                handleCellClick={(cellId, byte, matrixId, rowIdx, colIdx) =>
                  handleCellClick(idx, colIdx)
                }
                highlightedColumns={highlightedColumnsByMatrix[idx] || []}
                disabledColumns={disabledCols}
              />
            </div>
          );
        })}
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
              flex: "1 1 180px",
              marginLeft: "100px",
              marginRight: "500px",
            }}
          >
            <Table
              className="combined-matrix-col-table"
              size="small"
              style={{
                margin: "0 auto",
                minWidth: 60,
                width: "auto",
                flex: "0 0 auto",
              }}
            >
              <TableBody>
                {/* Header row: labels for each column */}
                <TableRow>
                  {explanationColumns.map((col, colIdx) => (
                    <TableCell
                      key={`header-${col.column}-${colIdx}`}
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        color: "#7b1fa2",
                        padding: "4px",
                        minWidth: "32px",
                      }}
                    >
                      {col.column === "previous word"
                        ? t('pages.stepByStep.keySchedule.columns.previousWord')
                        : col.column === "offset word before"
                        ? t('pages.stepByStep.keySchedule.columns.offsetWordBefore', { offset: wordsPerKey })
                        : col.column === "current word"
                        ? t('pages.stepByStep.keySchedule.columns.currentWord')
                        : col.column === "XOR"
                        ? t('pages.stepByStep.keySchedule.columns.XOR')
                        : col.column === "Rotate"
                        ? t('pages.stepByStep.keySchedule.columns.Rotate')
                        : col.column === "Substitute"
                        ? t('pages.stepByStep.keySchedule.columns.Substitute')
                        : col.column === "Rotated"
                        ? t('pages.stepByStep.keySchedule.columns.Rotated')
                        : col.column === "Substituted Word" || col.column === "SubstitutedWord"
                        ? t('pages.stepByStep.keySchedule.columns.SubstitutedWord')
                        : col.column === "Rcon"
                        ? t('pages.stepByStep.keySchedule.columns.Rcon')
                        : col.column === "Equals"
                        ? t('pages.stepByStep.keySchedule.columns.Equals')
                        : col.column}
                    </TableCell>
                  ))}
                </TableRow>
                {/* Data rows: bytes for each column */}
                {[0, 1, 2, 3].map((rowIdx) => (
                  <TableRow key={`row-${rowIdx}`}>
                    {explanationColumns.map((col, colIdx) => (
                      <TableCell
                        key={`cell-${colIdx}-${rowIdx}`}
                        align="center"
                      >
                        {col.column === "XOR" && col.data[rowIdx] === "XOR" ? (
                          <CirclePlus size={20} color="#7b1fa2" />
                        ) : col.column === "Rotate" &&
                          col.data[rowIdx] === "Rotate" ? (
                          <RotateCcw size={20} color="#7b1fa2" />
                        ) : col.column === "Substitute" &&
                          col.data[rowIdx] === "Substitute" ? (
                          <Wand2 size={20} color="#7b1fa2" />
                        ) : col.column === "Equals" &&
                          col.data[rowIdx] === "=" ? (
                          <Equal size={20} color="#7b1fa2" />
                        ) : (
                          col.data[rowIdx]
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* Right: Key expansion explanation */}
          <Paper
            elevation={2}
            className="explanation-text"
            sx={{
              minWidth: 220,
              maxWidth: 400,
              flex: "1 1 220px",
              marginLeft: "auto",
              marginRight: { xs: 0, md: "100px" },
              width: "100%",
              p: 2,
              bgcolor: "#cae2fc",
              borderRadius: 2,
            }}
          >
            <Typography
              variant="body2"
              component="div"
              sx={{ whiteSpace: "pre-line" }}
            >
              {explanationText}
            </Typography>
          </Paper>
        </Box>
      )}
    </>
  );
}

export default KeyExpansionMatrices;
