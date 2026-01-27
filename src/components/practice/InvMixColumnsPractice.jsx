import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { useTranslation } from "react-i18next";

// Inverse MixColumns matrix (decimal equivalents)
const INV_MIX_MATRIX = [
  [0x0e, 0x0b, 0x0d, 0x09],
  [0x09, 0x0e, 0x0b, 0x0d],
  [0x0d, 0x09, 0x0e, 0x0b],
  [0x0b, 0x0d, 0x09, 0x0e],
];

// GF(2^8) multiplication helper (same as MixColumns)
function gfMul(a, b) {
  let res = 0;
  for (let i = 0; i < 8; i++) {
    if (b & 1) res ^= a;
    let hiBitSet = a & 0x80;
    a = (a << 1) & 0xff;
    if (hiBitSet) a ^= 0x1b;
    b >>= 1;
  }
  return res;
}

// Generate random 4x4 matrix
function getRandomMatrix() {
  return Array.from({ length: 4 }, () =>
    Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)),
  );
}

// Inverse MixColumns transformation for one column
function invMixColumn(col) {
  return INV_MIX_MATRIX.map((row) =>
    row.reduce((acc, coef, i) => acc ^ gfMul(coef, col[i]), 0),
  );
}

// Inverse MixColumns for the whole state
function invMixColumns(matrix) {
  const result = [];
  for (let c = 0; c < 4; c++) {
    const col = matrix.map((row) => row[c]);
    const mixed = invMixColumn(col);
    for (let r = 0; r < 4; r++) {
      if (!result[r]) result[r] = [];
      result[r][c] = mixed[r];
    }
  }
  return result;
}

function coefHex(n) {
  return "0x" + n.toString(16).padStart(2, "0").toUpperCase();
}

function InvMixColumnsCalculator({
  matrix,
  column,
  onCalcChange,
  calcValues,
  outputValue,
  onOutputChange,
  onRowShow,
  onRowCheck,
  rowFeedback,
  calcStatus,
  outputStatus,
  showSolution,
}) {
  const { t } = useTranslation();
  return (
    <Box sx={{ mt: 2, p: 2, bgcolor: "#f9fbe7", borderRadius: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {t(
          "train.practice.invmixcolumns.calculator.title",
          "Step-by-Step InvMixColumns Calculation (Selected Column)"
        )}
      </Typography>
      <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mb: 2 }}>
        <Box>
          <Typography
            variant="body2"
            sx={{ fontWeight: "bold", mb: 1, textAlign: "center" }}
          >
            {t(
              "train.practice.invmixcolumns.calculator.fixedMatrix",
              "InvMixColumns Matrix:"
            )}
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 40px)",
              gap: 1,
              justifyContent: "center",
              mt: 1,
            }}
          >
            {INV_MIX_MATRIX.map((row, r) =>
              row.map((n, c) => (
                <Box
                  key={`mix-${r}-${c}`}
                  sx={{
                    border: "1px solid #ccc",
                    p: 1,
                    bgcolor: "#fff",
                    textAlign: "center",
                    minWidth: 36,
                  }}
                >
                  {coefHex(n)}
                </Box>
              )),
            )}
          </Box>
        </Box>
        <Box>
          <Typography
            variant="body2"
            sx={{ fontWeight: "bold", mb: 1, textAlign: "center" }}
          >
            {t(
              "train.practice.invmixcolumns.calculator.selectedColumn",
              "Selected Column:"
            )}
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "64px",
              gap: 1,
              paddingLeft: 3,
            }}
          >
            {column.map((val, i) => (
              <Box
                key={i}
                sx={{
                  border: "1px solid #ccc",
                  p: 1,
                  bgcolor: "#fff",
                  textAlign: "center",
                }}
              >
                {coefHex(val)}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
      <Box>
        <Typography variant="body2" sx={{ mb: 1 }}>
          {t(
            "train.practice.invmixcolumns.calculator.calculateOutput",
            "Calculate each output byte (row) for this column:"
          )}
        </Typography>
        {INV_MIX_MATRIX.map((row, r) => (
          <Box
            key={r}
            sx={{ mb: 2, p: 1, bgcolor: "#e3f2fd", borderRadius: 1 }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: "bold", paddingBottom: 2 }}
            >
              {t("train.practice.invmixcolumns.calculator.outputRow", "Output Row b")}
              {r - 1 + 1}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              {INV_MIX_MATRIX[r].map((coef, c) => (
                <React.Fragment key={c}>
                  <Typography variant="body2">
                    {coefHex(coef)} × {coefHex(column[c])} =
                  </Typography>
                  <TextField
                    value={calcValues[r][c]}
                    onChange={(e) => onCalcChange(r, c, e.target.value)}
                    size="small"
                    sx={{
                      width: 60,
                      bgcolor:
                        calcStatus &&
                        calcStatus[r] &&
                        calcStatus[r][c] === "correct"
                          ? "#e6f4ea"
                          : calcStatus &&
                              calcStatus[r] &&
                              calcStatus[r][c] === "incorrect"
                            ? "#fdecea"
                            : undefined,
                    }}
                    inputProps={{
                      maxLength: 4,
                      style: { textAlign: "center", fontFamily: "monospace" },
                    }}
                  />
                  {c < 3 && (
                    <Typography variant="body2" sx={{ mx: 1 }}>
                      ⊕
                    </Typography>
                  )}
                </React.Fragment>
              ))}
              <Typography variant="body2" sx={{ mx: 1 }}>
                =
              </Typography>
              <TextField
                value={outputValue[r]}
                onChange={(e) => onOutputChange(r, e.target.value)}
                size="small"
                disabled={
                  showSolution ||
                  (outputStatus && outputStatus[r] === "correct")
                }
                sx={{
                  width: 60,
                  bgcolor:
                    outputStatus && outputStatus[r] === "correct"
                      ? "#e6f4ea"
                      : outputStatus && outputStatus[r] === "incorrect"
                        ? "#fdecea"
                        : undefined,
                }}
                inputProps={{
                  maxLength: 4,
                  style: {
                    textAlign: "center",
                    fontFamily: "monospace",
                    fontWeight: "bold",
                  },
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ mt: 1, display: "block" }}>
              {t(
                "train.practice.invmixcolumns.calculator.enterMultiplication",
                "Enter each multiplication result (hex), then XOR them to get the output byte."
              )}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mt: 1, alignItems: "center" }}>
              <Button
                size="small"
                variant="contained"
                onClick={() => onRowCheck(r)}
              >
                {t("train.practice.invmixcolumns.calculator.check", "CHECK")}
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => onRowShow(r)}
                sx={{ background: "#fff" }}
              >
                {t("train.practice.invmixcolumns.calculator.show", "SHOW")}
              </Button>
              {rowFeedback && rowFeedback[r] && (
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {rowFeedback[r]}
                </Typography>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function HexBinConverter() {
  const [hex, setHex] = React.useState("");
  const [bin, setBin] = React.useState("");

  const fromHex = (h) => {
    const cleaned = h.replace(/[^0-9a-fA-F]/g, "").slice(0, 2);
    setHex(cleaned.toUpperCase());
    if (cleaned.length === 0) return setBin("");
    try {
      const val = parseInt(cleaned, 16);
      if (Number.isNaN(val)) return setBin("");
      setBin(val.toString(2).padStart(8, "0"));
    } catch (e) {
      setBin("");
    }
  };

  const fromBin = (b) => {
    const cleaned = b.replace(/[^01]/g, "").slice(0, 8);
    setBin(cleaned);
    if (cleaned.length === 0) return setHex("");
    try {
      const val = parseInt(cleaned, 2);
      if (Number.isNaN(val)) return setHex("");
      setHex(val.toString(16).padStart(2, "0").toUpperCase());
    } catch (e) {
      setHex("");
    }
  };

  return (
    <Box
      sx={{
        mt: 1,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        p: 2,
        mx: "auto",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.2 }}>
          Hex
        </Typography>
        <SwapHorizIcon sx={{ color: "primary.main" }} />
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.2 }}>
          Binary
        </Typography>
      </Box>
      <Typography variant="caption">
        Convert AES bytes between hexadecimal and binary
      </Typography>
      <Box sx={{ display: "flex", gap: 2 }}>
        <TextField
          label="Hex (byte)"
          value={hex}
          onChange={(e) => fromHex(e.target.value)}
          size="small"
          placeholder="00"
          helperText="Enter 2 hex digits (00–FF)"
          aria-label="hex-to-binary"
          sx={{
            width: 140,
            "& .MuiInputBase-input": {
              fontFamily: "monospace",
              fontSize: 14,
              textAlign: "center",
            },
          }}
        />
        <TextField
          label="Binary (8 bits)"
          value={bin}
          onChange={(e) => fromBin(e.target.value)}
          size="small"
          placeholder="00000000"
          helperText="Enter 8 bits"
          aria-label="binary-to-hex"
          sx={{
            width: 180,
            "& .MuiInputBase-input": {
              fontFamily: "monospace",
              fontSize: 13,
              textAlign: "center",
            },
          }}
        />
      </Box>
    </Box>
  );
}

const InvMixColumnsPractice = () => {
  const { t } = useTranslation();
  const [inputMatrix, setInputMatrix] = useState(getRandomMatrix());
  const [userMatrix, setUserMatrix] = useState(
    Array(4)
      .fill()
      .map(() => Array(4).fill("")),
  );
  const [showSolution, setShowSolution] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [incorrectCells, setIncorrectCells] = useState(
    Array(4)
      .fill()
      .map(() => Array(4).fill(false)),
  );
  const [showHelp, setShowHelp] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState(0);
  const [calcValues, setCalcValues] = useState(
    Array(4)
      .fill()
      .map(() => Array(4).fill("")),
  );
  const [outputCalc, setOutputCalc] = useState(Array(4).fill(""));
  const [rowFeedback, setRowFeedback] = useState(Array(4).fill(null));
  const [calcStatus, setCalcStatus] = useState(
    Array(4)
      .fill()
      .map(() => Array(4).fill(null)),
  );
  const [outputStatus, setOutputStatus] = useState(Array(4).fill(null));
  const [cellStatus, setCellStatus] = useState(
    Array(4)
      .fill()
      .map(() => Array(4).fill(null)),
  );

  const dialogContentRef = useRef(null);

  useEffect(() => {
    if (showHelp && dialogContentRef.current) {
      try {
        dialogContentRef.current.focus();
      } catch (e) {}
    }
  }, [showHelp]);

  useEffect(() => {
    setCalcValues(
      Array(4)
        .fill()
        .map(() => Array(4).fill("")),
    );
    setOutputCalc(Array(4).fill(""));
    setRowFeedback(Array(4).fill(null));
    setCalcStatus(
      Array(4)
        .fill()
        .map(() => Array(4).fill(null)),
    );
    setOutputStatus(Array(4).fill(null));
  }, [selectedColumn]);

  const solution = invMixColumns(inputMatrix);

  const handleInputChange = (rowIdx, colIdx, value) => {
    const updated = userMatrix.map((row) => [...row]);
    updated[rowIdx][colIdx] = value.toUpperCase();
    setUserMatrix(updated);
  };

  const handleCheck = () => {
    let correct = true;
    const newIncorrect = Array(4)
      .fill()
      .map(() => Array(4).fill(false));
    const newCellStatus = Array(4)
      .fill()
      .map(() => Array(4).fill(null));
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (parseInt(userMatrix[r][c], 16) !== solution[r][c]) {
          correct = false;
          newIncorrect[r][c] = true;
          newCellStatus[r][c] = "incorrect";
        } else {
          newCellStatus[r][c] = "correct";
        }
      }
    }
    setIncorrectCells(newIncorrect);
    setCellStatus(newCellStatus);
    setFeedback(
      correct
        ? t("train.practice.correct", "Correct!")
        : t(
            "train.practice.incorrect",
            "Some answers are incorrect. Incorrect cells are highlighted. Try again!"
          ),
    );
  };

  const handleShowSolution = () => {
    setShowSolution(true);
    setUserMatrix(
      solution.map((row) =>
        row.map((val) => val.toString(16).padStart(2, "0").toUpperCase()),
      ),
    );
    setIncorrectCells(
      Array(4)
        .fill()
        .map(() => Array(4).fill(false)),
    );
    setCellStatus(
      Array(4)
        .fill()
        .map(() => Array(4).fill(null)),
    );
    setCalcStatus(
      Array(4)
        .fill()
        .map(() => Array(4).fill(null)),
    );
    setOutputStatus(Array(4).fill(null));
    setFeedback(null);
  };

  const handleNext = () => {
    const newMatrix = getRandomMatrix();
    setInputMatrix(newMatrix);
    setUserMatrix(
      Array(4)
        .fill()
        .map(() => Array(4).fill("")),
    );
    setShowSolution(false);
    setFeedback(null);
    setIncorrectCells(
      Array(4)
        .fill()
        .map(() => Array(4).fill(false)),
    );
    setCalcValues(
      Array(4)
        .fill()
        .map(() => Array(4).fill("")),
    );
    setOutputCalc(Array(4).fill(""));
    setCalcStatus(
      Array(4)
        .fill()
        .map(() => Array(4).fill(null)),
    );
    setOutputStatus(Array(4).fill(null));
    setCellStatus(
      Array(4)
        .fill()
        .map(() => Array(4).fill(null)),
    );
  };

  const handleCalcChange = (row, col, value) => {
    const updated = calcValues.map((r) => [...r]);
    updated[row][col] = value.toUpperCase();
    setCalcValues(updated);
  };
  const handleOutputChange = (row, value) => {
    const updated = [...outputCalc];
    updated[row] = value.toUpperCase();
    setOutputCalc(updated);
  };

  const handleRowShow = (r) => {
    const col = inputMatrix.map((row) => row[selectedColumn]);
    const expectedMuls = INV_MIX_MATRIX[r].map((coef, i) =>
      gfMul(coef, col[i]),
    );
    setCalcValues((prev) => {
      const u = prev.map((row) => [...row]);
      u[r] = expectedMuls.map((n) =>
        n.toString(16).padStart(2, "0").toUpperCase(),
      );
      return u;
    });
    const expectedOut = expectedMuls.reduce((a, b) => a ^ b, 0);
    setOutputCalc((prev) => {
      const p = [...prev];
      p[r] = expectedOut.toString(16).padStart(2, "0").toUpperCase();
      return p;
    });
    const expectedOutHex = expectedOut
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();
    setUserMatrix((prev) => {
      const m = prev.map((row) => [...row]);
      m[r][selectedColumn] = expectedOutHex;
      return m;
    });

    setCalcStatus((prev) => {
      const u = prev.map((row) => [...row]);
      u[r] = expectedMuls.map(() => "correct");
      return u;
    });
    setOutputStatus((prev) => {
      const p = [...prev];
      p[r] = "correct";
      return p;
    });
    setCellStatus((prev) => {
      const s = prev.map((row) => [...row]);
      s[r][selectedColumn] = "correct";
      return s;
    });

    setRowFeedback((prev) => {
      const q = [...prev];
      q[r] = "Please continue with the next calculation.";
      return q;
    });
  };

  const handleRowCheck = (r) => {
    const col = inputMatrix.map((row) => row[selectedColumn]);
    const expectedMuls = INV_MIX_MATRIX[r].map((coef, i) =>
      gfMul(coef, col[i]),
    );
    const expectedOut = expectedMuls.reduce((a, b) => a ^ b, 0);

    let allMatch = true;
    for (let c = 0; c < 4; c++) {
      const entered = parseInt(calcValues[r][c], 16);
      if (Number.isNaN(entered) || entered !== expectedMuls[c]) {
        allMatch = false;
        break;
      }
    }
    const enteredOut = parseInt(outputCalc[r], 16);
    if (Number.isNaN(enteredOut) || enteredOut !== expectedOut)
      allMatch = false;

    setCalcStatus((prev) => {
      const u = prev.map((row) => [...row]);
      for (let c = 0; c < 4; c++) {
        const entered = parseInt(calcValues[r][c], 16);
        u[r][c] =
          !Number.isNaN(entered) && entered === expectedMuls[c]
            ? "correct"
            : "incorrect";
      }
      return u;
    });
    setOutputStatus((prev) => {
      const p = [...prev];
      const entOut = parseInt(outputCalc[r], 16);
      p[r] =
        !Number.isNaN(entOut) && entOut === expectedOut
          ? "correct"
          : "incorrect";
      return p;
    });

    setCellStatus((prev) => {
      const s = prev.map((row) => [...row]);
      s[r][selectedColumn] =
        !Number.isNaN(parseInt(outputCalc[r], 16)) &&
        parseInt(outputCalc[r], 16) === expectedOut
          ? "correct"
          : "incorrect";
      return s;
    });

    if (
      !Number.isNaN(parseInt(outputCalc[r], 16)) &&
      parseInt(outputCalc[r], 16) === expectedOut
    ) {
      setUserMatrix((prev) => {
        const m = prev.map((row) => [...row]);
        m[r][selectedColumn] = expectedOut
          .toString(16)
          .padStart(2, "0")
          .toUpperCase();
        return m;
      });
    }

    setRowFeedback((prev) => {
      const q = [...prev];
      q[r] = allMatch
        ? "Correct! Please continue with the next calculation."
        : "Incorrect result. Please try again.";
      return q;
    });
  };

  return (
    <Box
      sx={{
        maxWidth: "auto",
        mx: "auto",
        mt: 2,
        boxShadow: 2,
        background: "#fff",
        borderRadius: 2,
        p: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h5">
          {t("train.practice.invmixcolumns", "InvMixColumns Practice")}
        </Typography>
        <IconButton onClick={() => setShowHelp(true)}>
          <HelpOutlineIcon />
        </IconButton>
      </Box>
      <Typography variant="body2" sx={{ mb: 2, textAlign: "center" }}>
        {t(
          "train.practice.invmixcolumns.description",
          "InvMixColumns is the inverse of the MixColumns step and is used during AES decryption. In this step, each column of the original matrix (4 bytes) is multiplied by Inverse Fixed Matrix using arithmetic in GF(2⁸). Enter the resulting byte values for each cell after the InvMixColumns step. Note: You can use the helper below to see how each output is calculated."
        )}
      </Typography>
      <Box
        sx={{
          display: "flex",
          gap: 4,
          justifyContent: "center",
          alignItems: "center",
          mb: 2,
        }}
      >
        {/* Original Matrix */}
        <Box sx={{ width: 300 }}>
          <Typography variant="body2" sx={{ mb: 1, textAlign: "center" }}>
            {t("train.practice.originalMatrix", "Original Matrix (hex):")}
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 1,
            }}
          >
            {inputMatrix.map((row, r) =>
              row.map((val, c) => (
                <Box
                  key={`orig-${r}-${c}`}
                  sx={{
                    border: "1px solid #ccc",
                    borderRadius: 1,
                    p: 1,
                    textAlign: "center",
                    bgcolor: "#f5f5f5",
                    minHeight: 48,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                  }}
                >
                  {val.toString(16).padStart(2, "0").toUpperCase()}
                </Box>
              )),
            )}
          </Box>
        </Box>

        {/* Transformation Matrix */}
        <Box
          sx={{
            minWidth: "auto",
            textAlign: "center",
            bgcolor: "#f5f5f5",
            p: 2,
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
            {t("pages.stepByStep.mixColumns.inverseFixedMatrix", "Inverse Fixed Matrix:")}
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 32px)",
              gap: 1,
              mb: 1,
            }}
          >
            {INV_MIX_MATRIX.flat().map((n, i) => (
              <Box
                key={i}
                sx={{ border: "1px solid #ccc", p: 1, bgcolor: "#fff" }}
              >
                {n.toString(16).padStart(2, "0").toUpperCase()}
              </Box>
            ))}
          </Box>
        </Box>

        {/* User Output Matrix with labels (header c1..c4 and row labels b0..b3) */}
        <Box sx={{ width: "auto" }}>
          <Typography variant="body2" sx={{ mb: 1, textAlign: "center" }}>
            {t("train.practice.invmixcolumns.outputLabel", "Enter InvMixColumns output (hex):")}
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "48px repeat(4, 1fr)",
              gap: 1,
              alignItems: "stretch",
            }}
          >
            {/* header row: empty label cell + column headings */}
            <Box />
            {[0, 1, 2, 3].map((ci) => (
              <Box
                key={`col-head-${ci}`}
                sx={{ textAlign: "center", fontWeight: "bold", p: 1 }}
              >
                c{ci + 1}
              </Box>
            ))}

            {/* rows: label (b0..b3) + 4 cells */}
            {userMatrix.map((rowVals, r) => (
              <React.Fragment key={`row-${r}`}>
                {/* row label cell */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid transparent",
                    fontWeight: "bold",
                    bgcolor: "transparent",
                    p: 1,
                  }}
                >
                  b{r}
                </Box>

                {/* four cells for this row */}
                {rowVals.map((val, c) => (
                  <Box
                    key={`ans-${r}-${c}`}
                    sx={{
                      border: incorrectCells[r][c]
                        ? "2px solid #d32f2f"
                        : cellStatus &&
                            cellStatus[r] &&
                            cellStatus[r][c] === "correct"
                          ? "2px solid #2e7d32"
                          : showSolution
                            ? "2px solid #1976d2"
                            : "1px solid #ccc",
                      borderRadius: 1,
                      p: 1,
                      textAlign: "center",
                      bgcolor:
                        cellStatus &&
                        cellStatus[r] &&
                        cellStatus[r][c] === "correct"
                          ? "#e6f4ea"
                          : cellStatus &&
                              cellStatus[r] &&
                              cellStatus[r][c] === "incorrect"
                            ? "#fdecea"
                            : feedback === "Correct!"
                              ? "#c8e6c9"
                              : showSolution
                                ? "#e3f2fd"
                                : "#f5f5f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: 48,
                    }}
                  >
                    <TextField
                      value={
                        showSolution
                          ? solution[r][c]
                              .toString(16)
                              .padStart(2, "0")
                              .toUpperCase()
                          : val
                      }
                      onChange={(e) => handleInputChange(r, c, e.target.value)}
                      inputProps={{
                        maxLength: 2,
                        style: {
                          textAlign: "center",
                          textTransform: "uppercase",
                          fontWeight: "bold",
                          color:
                            cellStatus &&
                            cellStatus[r] &&
                            cellStatus[r][c] === "correct"
                              ? "#2e7d32"
                              : cellStatus &&
                                  cellStatus[r] &&
                                  cellStatus[r][c] === "incorrect"
                                ? "#d32f2f"
                                : feedback === "Correct!"
                                  ? "#2e7d32"
                                  : showSolution
                                    ? "#1976d2"
                                    : undefined,
                        },
                      }}
                      disabled={
                        showSolution ||
                        (cellStatus &&
                          cellStatus[r] &&
                          cellStatus[r][c] === "correct")
                      }
                      size="small"
                      sx={{
                        width: 56,
                        bgcolor:
                          cellStatus &&
                          cellStatus[r] &&
                          cellStatus[r][c] === "correct"
                            ? "#e6f4ea"
                            : cellStatus &&
                                cellStatus[r] &&
                                cellStatus[r][c] === "incorrect"
                              ? "#fdecea"
                              : feedback === "Correct!"
                                ? "#c8e6c9"
                                : showSolution
                                  ? "#e3f2fd"
                                  : undefined,
                        "& .MuiInputBase-input.Mui-disabled": {
                          color:
                            cellStatus &&
                            cellStatus[r] &&
                            cellStatus[r][c] === "correct"
                              ? "#2e7d32"
                              : cellStatus &&
                                  cellStatus[r] &&
                                  cellStatus[r][c] === "incorrect"
                                ? "#d32f2f"
                                : feedback === "Correct!"
                                  ? "#2e7d32"
                                  : showSolution
                                    ? "#1976d2"
                                    : undefined,
                          fontWeight: "bold",
                          opacity: 1,
                          WebkitTextFillColor:
                            cellStatus &&
                            cellStatus[r] &&
                            cellStatus[r][c] === "correct"
                              ? "#2e7d32"
                              : cellStatus &&
                                  cellStatus[r] &&
                                  cellStatus[r][c] === "incorrect"
                                ? "#d32f2f"
                                : feedback === "Correct!"
                                  ? "#2e7d32"
                                  : showSolution
                                    ? "#1976d2"
                                    : undefined,
                          background:
                            cellStatus &&
                            cellStatus[r] &&
                            cellStatus[r][c] === "correct"
                              ? "#e6f4ea"
                              : cellStatus &&
                                  cellStatus[r] &&
                                  cellStatus[r][c] === "incorrect"
                                ? "#fdecea"
                                : feedback === "Correct!"
                                  ? "#c8e6c9"
                                  : showSolution
                                    ? "#e3f2fd"
                                    : undefined,
                        },
                      }}
                    />
                  </Box>
                ))}
              </React.Fragment>
            ))}
          </Box>
        </Box>
      </Box>
      {feedback && (
        <Typography
          color={
            feedback === t("train.practice.correct", "Correct!")
              ? "success.main"
              : "error.main"
          }
          sx={{ textAlign: "center", mb: 2 }}
        >
          {feedback}
        </Typography>
      )}
      {showSolution && (
        <Typography variant="body2" sx={{ mb: 2, textAlign: "center" }}>
          {t(
            "train.practice.solutionMsg",
            "All correct answers are now filled in the User Output Matrix above."
          )}
        </Typography>
      )}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 2 }}>
        <Button
          variant="contained"
          onClick={handleCheck}
          disabled={showSolution}
        >
          {t("train.practice.check", "Check Answers")}
        </Button>
        <Button variant="outlined" onClick={handleShowSolution}>
          {t("train.practice.showSolution", "Show Solution")}
        </Button>
        <Button variant="contained" color="secondary" onClick={handleNext}>
          {t("train.practice.next", "Next Example")}
        </Button>
      </Box>

      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" sx={{ mb: 3, textAlign: "center" }}>
          {t(
            "train.practice.invmixcolumns.selectColumn",
            "Select which column to analyze:"
          )}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 2 }}>
          {[0, 1, 2, 3].map((colIdx) => (
            <Button
              key={colIdx}
              variant={selectedColumn === colIdx ? "contained" : "outlined"}
              size="small"
              onClick={() => setSelectedColumn(colIdx)}
            >
              {t("train.practice.invmixcolumns.calculator.column", "Column")} {colIdx + 1}
            </Button>
          ))}
        </Box>
        <InvMixColumnsCalculator
          matrix={INV_MIX_MATRIX}
          column={inputMatrix.map((row) => row[selectedColumn])}
          onCalcChange={handleCalcChange}
          calcValues={calcValues}
          outputValue={outputCalc}
          onOutputChange={handleOutputChange}
          onRowShow={handleRowShow}
          onRowCheck={handleRowCheck}
          rowFeedback={rowFeedback}
          calcStatus={calcStatus}
          outputStatus={outputStatus}
          showSolution={showSolution}
        />
      </Box>

      <Dialog
        open={showHelp}
        onClose={() => setShowHelp(false)}
        fullWidth
        maxWidth="xl"
        PaperProps={{ sx: { width: "92%", maxWidth: 1000, maxHeight: "92vh" } }}
        aria-labelledby="invmixcolumns-dialog-title"
        aria-describedby="invmixcolumns-dialog-desc"
      >
        <DialogTitle
          id="invmixcolumns-dialog-title"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {t(
            "train.practice.tooltips.invmixcolumns.title",
            "AES InvMixColumns – Step-by-Step Guide"
          )}
          <IconButton
            aria-label="Close InvMixColumns help"
            onClick={() => setShowHelp(false)}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent
          dividers
          ref={dialogContentRef}
          tabIndex={-1}
          id="invmixcolumns-dialog-desc"
        >
          <Box
            sx={{
              bgcolor: "#fff8e1ff",
              p: 2,
              borderRadius: 1,
              mt: 2,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              variant="body1"
              component="div"
              sx={{ mt: 1, width: "100%", maxWidth: 1000, whiteSpace: "pre-wrap" }}
            >
              {t(
                "train.practice.tooltips.invmixcolumns.description",
                `InvMixColumns Matrix:
Each column is multiplied by this matrix:
0E 0B 0D 09
09 0E 0B 0D
0D 09 0E 0B
0B 0D 09 0E

Each new byte is computed using Galois field multiplication with the inverse matrix coefficients.

Multiplication rules (GF(2^8)):
• 01 × X = X
• 02 × X = (X Shift Left). If MSB = 1, XOR with 1B (hex)
• 03 × X = (02 × X) ⊕ X
• For other coefficients, use repeated doubling and XOR`
              )}
            </Typography>
            <Typography
              variant="body1"
              component="div"
              sx={{ mt: 2, width: "100%", maxWidth: 1000, whiteSpace: "pre-wrap" }}
            >
              <strong>{t("train.practice.tooltips.invmixcolumns.hint", "Tips:")}</strong>
              {"\n"}
              {t(
                "train.practice.tooltips.invmixcolumns.hintContent",
                `• InvMixColumns reverses the MixColumns transformation
• Uses GF(2^8) multiplication with the inverse fixed matrix
• 02 × X = shift left and reduce by 1B if needed
• 03 × X = (02 × X) ⊕ X
• Every column is processed independently`
              )}
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default InvMixColumnsPractice;
