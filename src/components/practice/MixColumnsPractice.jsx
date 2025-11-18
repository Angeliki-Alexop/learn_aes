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

// AES MixColumns matrix
const MIX_MATRIX = [
  [2, 3, 1, 1],
  [1, 2, 3, 1],
  [1, 1, 2, 3],
  [3, 1, 1, 2],
];

// GF(2^8) multiplication helper
function xtime(a) {
  return ((a << 1) ^ (a & 0x80 ? 0x1b : 0)) & 0xff;
}
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
    Array.from({ length: 4 }, () => Math.floor(Math.random() * 256))
  );
}

// MixColumns transformation for one column
function mixColumn(col) {
  return MIX_MATRIX.map((row) =>
    row.reduce((acc, coef, i) => acc ^ gfMul(coef, col[i]), 0)
  );
}

// MixColumns for the whole state
function mixColumns(matrix) {
  // matrix: 4x4 state, columns are transformed
  const result = [];
  for (let c = 0; c < 4; c++) {
    const col = matrix.map((row) => row[c]);
    const mixed = mixColumn(col);
    for (let r = 0; r < 4; r++) {
      if (!result[r]) result[r] = [];
      result[r][c] = mixed[r];
    }
  }
  return result;
}

// Helper functions for formatting
function coefHex(n) {
  return "0x" + n.toString(16).padStart(2, "0").toUpperCase();
}

// --- GF(2⁸) calculator for a selected column ---
function MixColumnsCalculator({
  matrix,
  column,
  onCalcChange,
  calcValues,
  outputValue,
  onOutputChange,
}) {
  return (
    <Box sx={{ mt: 2, p: 2, bgcolor: "#f9fbe7", borderRadius: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Step-by-Step MixColumns Calculation (Selected Column)
      </Typography>
      <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mb: 2 }}>
        {/* Show the transformation matrix */}
        <Box>
          <Typography
            variant="body2"
            sx={{ fontWeight: "bold", mb: 1, textAlign: "center" }}
          >
            MixColumns Matrix
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
            {MIX_MATRIX.map((row, r) =>
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
                  {n.toString(16).padStart(2, "0").toUpperCase()}
                </Box>
              ))
            )}
          </Box>
        </Box>
        {/* Show the selected column values */}
        <Box>
          <Typography
            variant="body2"
            sx={{ fontWeight: "bold", mb: 1, textAlign: "center" }}
          >
            Selected Column
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
      {/* Step-by-step calculation for each output byte */}
      <Box>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Calculate each output byte (row) for this column:
        </Typography>
        {matrix.map((row, r) => (
          <Box
            key={r}
            sx={{ mb: 2, p: 1, bgcolor: "#e3f2fd", borderRadius: 1 }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: "bold", paddingBottom: 2 }}
            >
              Output Row b{r - 1 + 1}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              {row.map((coef, c) => (
                <React.Fragment key={c}>
                  <Typography variant="body2">
                    {coefHex(coef)} × {coefHex(column[c])} =
                  </Typography>
                  <TextField
                    value={calcValues[r][c]}
                    onChange={(e) => onCalcChange(r, c, e.target.value)}
                    size="small"
                    sx={{ width: 60 }}
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
                sx={{ width: 60 }}
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
              Enter each multiplication result (hex), then XOR them to get the
              output byte.
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// Small helper: convert a single byte between hex and binary (8 bits)
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

const MixColumnsPractice = () => {
  const [inputMatrix, setInputMatrix] = useState(getRandomMatrix());
  const [userMatrix, setUserMatrix] = useState(
    Array(4)
      .fill()
      .map(() => Array(4).fill(""))
  );
  const [showSolution, setShowSolution] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [incorrectCells, setIncorrectCells] = useState(
    Array(4)
      .fill()
      .map(() => Array(4).fill(false))
  );
  const [showHelp, setShowHelp] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState(0);
  const [calcValues, setCalcValues] = useState(
    Array(4)
      .fill()
      .map(() => Array(4).fill(""))
  );
  const [outputCalc, setOutputCalc] = useState(Array(4).fill(""));

  // Ref for dialog content to move focus when opened (accessibility)
  const dialogContentRef = useRef(null);

  useEffect(() => {
    if (showHelp && dialogContentRef.current) {
      // focus the dialog content so screen readers announce it and keyboard users land inside
      try {
        dialogContentRef.current.focus();
      } catch (e) {
        /* ignore focus errors */
      }
    }
  }, [showHelp]);

  const solution = mixColumns(inputMatrix);

  // Handle input change for each cell
  const handleInputChange = (rowIdx, colIdx, value) => {
    const updated = userMatrix.map((row) => [...row]);
    updated[rowIdx][colIdx] = value.toUpperCase();
    setUserMatrix(updated);
  };

  // Check answers
  const handleCheck = () => {
    let correct = true;
    const newIncorrect = Array(4)
      .fill()
      .map(() => Array(4).fill(false));
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (parseInt(userMatrix[r][c], 16) !== solution[r][c]) {
          correct = false;
          newIncorrect[r][c] = true;
        }
      }
    }
    setIncorrectCells(newIncorrect);
    setFeedback(
      correct
        ? "Correct!"
        : "Some answers are incorrect. Incorrect cells are highlighted. Try again!"
    );
  };

  // Show solution
  const handleShowSolution = () => {
    setShowSolution(true);
    setUserMatrix(
      solution.map((row) =>
        row.map((val) => val.toString(16).padStart(2, "0").toUpperCase())
      )
    );
    setIncorrectCells(
      Array(4)
        .fill()
        .map(() => Array(4).fill(false))
    );
    setFeedback(null);
  };

  // Next example
  const handleNext = () => {
    const newMatrix = getRandomMatrix();
    setInputMatrix(newMatrix);
    setUserMatrix(
      Array(4)
        .fill()
        .map(() => Array(4).fill(""))
    );
    setShowSolution(false);
    setFeedback(null);
    setIncorrectCells(
      Array(4)
        .fill()
        .map(() => Array(4).fill(false))
    );
    // Clear calculator intermediate and output fields when moving to next example
    setCalcValues(
      Array(4)
        .fill()
        .map(() => Array(4).fill(""))
    );
    setOutputCalc(Array(4).fill(""));
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
        <Typography variant="h5">MixColumns Practice</Typography>
        <IconButton onClick={() => setShowHelp(true)}>
          <HelpOutlineIcon />
        </IconButton>
      </Box>
      <Typography variant="body2" sx={{ mb: 2, textAlign: "center" }}>
        MixColumns transforms each column of the state matrix using matrix
        multiplication in GF(2⁸). Enter the result for each cell after
        MixColumns. You can use the helper below to see how each output is
        calculated.
      </Typography>
      {/* Quick instructions moved into dialog (use the Help icon to open) */}
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
            Original Matrix (hex):
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
              ))
            )}
          </Box>
        </Box>
        {/* MixColumns Matrix Display */}
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
            MixColumns Transformation Matrix:
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 32px)",
              gap: 1,
              mb: 1,
            }}
          >
            {/* First row */}
            <Box sx={{ border: "1px solid #ccc", p: 1, bgcolor: "#fff" }}>
              2
            </Box>
            <Box sx={{ border: "1px solid #ccc", p: 1, bgcolor: "#fff" }}>
              3
            </Box>
            <Box sx={{ border: "1px solid #ccc", p: 1, bgcolor: "#fff" }}>
              1
            </Box>
            <Box sx={{ border: "1px solid #ccc", p: 1, bgcolor: "#fff" }}>
              1
            </Box>
            {/* Second row */}
            <Box sx={{ border: "1px solid #ccc", p: 1, bgcolor: "#fff" }}>
              1
            </Box>
            <Box sx={{ border: "1px solid #ccc", p: 1, bgcolor: "#fff" }}>
              2
            </Box>
            <Box sx={{ border: "1px solid #ccc", p: 1, bgcolor: "#fff" }}>
              3
            </Box>
            <Box sx={{ border: "1px solid #ccc", p: 1, bgcolor: "#fff" }}>
              1
            </Box>
            {/* Third row */}
            <Box sx={{ border: "1px solid #ccc", p: 1, bgcolor: "#fff" }}>
              1
            </Box>
            <Box sx={{ border: "1px solid #ccc", p: 1, bgcolor: "#fff" }}>
              1
            </Box>
            <Box sx={{ border: "1px solid #ccc", p: 1, bgcolor: "#fff" }}>
              2
            </Box>
            <Box sx={{ border: "1px solid #ccc", p: 1, bgcolor: "#fff" }}>
              3
            </Box>
            {/* Fourth row */}
            <Box sx={{ border: "1px solid #ccc", p: 1, bgcolor: "#fff" }}>
              3
            </Box>
            <Box sx={{ border: "1px solid #ccc", p: 1, bgcolor: "#fff" }}>
              1
            </Box>
            <Box sx={{ border: "1px solid #ccc", p: 1, bgcolor: "#fff" }}>
              1
            </Box>
            <Box sx={{ border: "1px solid #ccc", p: 1, bgcolor: "#fff" }}>
              2
            </Box>
          </Box>
        </Box>

        {/* User Output Matrix (with row labels b0..b3) */}
        <Box sx={{ width: "auto" }}>
          <Typography variant="body2" sx={{ mb: 1, textAlign: "center" }}>
            Enter MixColumns output (hex):
          </Typography>

          {/* grid with a label column + 4 matrix columns */}
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
            {/* label column header placeholder */}
            {[0, 1, 2, 3].map((ci) => (
              <Box
                key={`col-head-${ci}`}
                sx={{
                  textAlign: "center",
                  fontWeight: "bold",
                  p: 1,
                }}
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
                        : showSolution
                        ? "2px solid #1976d2"
                        : feedback === "Correct!"
                        ? "2px solid #2e7d32"
                        : "1px solid #ccc",
                      borderRadius: 1,
                      p: 1,
                      textAlign: "center",
                      bgcolor:
                        feedback === "Correct!"
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
                      value={val}
                      onChange={(e) => handleInputChange(r, c, e.target.value)}
                      inputProps={{
                        maxLength: 2,
                        style: {
                          textAlign: "center",
                          textTransform: "uppercase",
                          fontWeight: "bold",
                          color:
                            feedback === "Correct!"
                              ? "#2e7d32"
                              : showSolution
                              ? "#1976d2"
                              : undefined,
                          background:
                            feedback === "Correct!"
                              ? "#c8e6c9"
                              : showSolution
                              ? "#e3f2fd"
                              : undefined,
                          opacity: 1,
                          WebkitTextFillColor:
                            feedback === "Correct!"
                              ? "#2e7d32"
                              : showSolution
                              ? "#1976d2"
                              : undefined,
                        },
                      }}
                      disabled={showSolution}
                      size="small"
                      sx={{
                        width: 56,
                        bgcolor:
                          feedback === "Correct!"
                            ? "#c8e6c9"
                            : showSolution
                            ? "#e3f2fd"
                            : undefined,
                        "& .MuiInputBase-input.Mui-disabled": {
                          color:
                            feedback === "Correct!"
                              ? "#2e7d32"
                              : showSolution
                              ? "#1976d2"
                              : undefined,
                          fontWeight: "bold",
                          opacity: 1,
                          WebkitTextFillColor:
                            feedback === "Correct!"
                              ? "#2e7d32"
                              : showSolution
                              ? "#1976d2"
                              : undefined,
                          background:
                            feedback === "Correct!"
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
          color={feedback === "Correct!" ? "success.main" : "error.main"}
          sx={{ textAlign: "center", mb: 2 }}
        >
          {feedback}
        </Typography>
      )}
      {showSolution && (
        <Typography variant="body2" sx={{ mb: 2, textAlign: "center" }}>
          All correct answers are now filled in the User Output Matrix above.
        </Typography>
      )}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 2 }}>
        <Button
          variant="contained"
          onClick={handleCheck}
          disabled={showSolution}
        >
          Check Answers
        </Button>
        <Button variant="outlined" onClick={handleShowSolution}>
          Show Solution
        </Button>
        <Button variant="contained" color="secondary" onClick={handleNext}>
          Next Example
        </Button>
      </Box>
      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" sx={{ mb: 3, textAlign: "center" }}>
          Select which column to analyze:
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 2 }}>
          {[0, 1, 2, 3].map((colIdx) => (
            <Button
              key={colIdx}
              variant={selectedColumn === colIdx ? "contained" : "outlined"}
              size="small"
              onClick={() => setSelectedColumn(colIdx)}
            >
              Column {colIdx + 1}
            </Button>
          ))}
        </Box>
        <MixColumnsCalculator
          matrix={MIX_MATRIX}
          column={inputMatrix.map((row) => row[selectedColumn])}
          calcValues={calcValues}
          onCalcChange={handleCalcChange}
          outputValue={outputCalc}
          onOutputChange={handleOutputChange}
        />
      </Box>
      <Dialog
        open={showHelp}
        onClose={() => setShowHelp(false)}
        fullWidth
        maxWidth="md"
        scroll="paper"
        aria-labelledby="mixcolumns-dialog-title"
        aria-describedby="mixcolumns-dialog-desc"
      >
        <DialogTitle
          id="mixcolumns-dialog-title"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          AES MixColumns – Step-by-Step Guide
          <IconButton
            aria-label="Close MixColumns help"
            onClick={() => setShowHelp(false)}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent
          id="mixcolumns-dialog-desc"
          dividers
          ref={dialogContentRef}
          tabIndex={-1}
        >
          {/* Expanded step-by-step quick instructions moved here */}
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
              sx={{ mt: 1, width: "100%", maxWidth: 720 }}
            >
              <strong>MixColumns Matrix:</strong>
              <br />
              Each column is multiplied by this matrix:
              <br />
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 40px)",
                  gap: 1,
                  mt: 1,
                  ml: 3,
                }}
              >
                {MIX_MATRIX.map((row, r) =>
                  row.map((n, c) => (
                    <Box
                      key={`quick-mix-${r}-${c}-dlg`}
                      sx={{
                        border: "1px solid #ccc",
                        p: 1,
                        bgcolor: "#fff8e1ff",
                        textAlign: "center",
                        fontFamily: "monospace",
                        fontWeight: "bold",
                        minWidth: 36,
                      }}
                    >
                      {n.toString(16).padStart(2, "0").toUpperCase()}
                    </Box>
                  ))
                )}
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="body1"
                  component="div"
                  sx={{ width: "100%", maxWidth: 720 }}
                >
                  <strong>Each new byte is computed as:</strong>
                </Typography>
                <Box component="pre" sx={{ m: 0 }}>
                  <code>{`
• S′₀ = (02 × S₀) ⊕ (03 × S₁) ⊕ (01 × S₂) ⊕ (01 × S₃)
• S′₁ = (01 × S₀) ⊕ (02 × S₁) ⊕ (03 × S₂) ⊕ (01 × S₃)
• S′₂ = (01 × S₀) ⊕ (01 × S₁) ⊕ (02 × S₂) ⊕ (03 × S₃)
• S′₃ = (03 × S₀) ⊕ (01 × S₁) ⊕ (01 × S₂) ⊕ (02 × S₃)
    `}</code>
                </Box>
                <Typography
                  variant="body1"
                  component="div"
                  sx={{ width: "100%", maxWidth: 720 }}
                >
                  <strong>Multiplication rules (GF(2^8)):</strong>
                </Typography>
                <Box component="pre" sx={{ m: 0 }}>
                  <code>{`
• 01 × X = X
• 02 × X = (X Shift Left). If MSB = 1, XOR with 1B (hex)
• 03 × X = (02 × X) ⊕ X
    `}</code>
                </Box>
                <Typography
                  variant="body1"
                  component="div"
                  sx={{ width: "100%", maxWidth: 720 }}
                >
                  <strong>Tips</strong>
                </Typography>
                <Box component="pre" sx={{ m: 0 }}>
                  <code>{`
• XOR = bitwise addition without carry
• 02 × X = shift left and reduce by 1B if needed
• 03 × X = (02 × X) ⊕ X
• Every column is processed independently
`}</code>
                </Box>
              </Box>
            </Typography>
            <Box sx={{ mt: 2 }}>
              <HexBinConverter />
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MixColumnsPractice;
