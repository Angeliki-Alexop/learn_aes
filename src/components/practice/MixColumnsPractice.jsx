import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  TextField,
  autocompleteClasses,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

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
    <Box sx={{ mt: 1, display: "flex", gap: 2, justifyContent: "center" }}>
      <TextField
        label="Hex (byte)"
        value={hex}
        onChange={(e) => fromHex(e.target.value)}
        size="small"
        placeholder="00"
        inputProps={{
          maxLength: 2,
          style: { textAlign: "center", fontFamily: "monospace" },
        }}
        helperText="Enter 2 hex digits (00–FF)"
        aria-label="hex-to-binary"
      />
      <TextField
        label="Binary (8 bits)"
        value={bin}
        onChange={(e) => fromBin(e.target.value)}
        size="small"
        placeholder="00000000"
        inputProps={{
          maxLength: 8,
          style: { textAlign: "center", fontFamily: "monospace" },
        }}
        helperText="Enter 8 bits"
        aria-label="binary-to-hex"
      />
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
        <Typography variant="h6">MixColumns Practice</Typography>
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
      {/* Quick, visible instruction box for clarity */}
      <Box sx={{ bgcolor: "#fff8e1ff", p: 2, borderRadius: 1, mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
          AES MixColumns – Step-by-Step Guide
        </Typography>
        <Typography variant="body1" component="div" sx={{ mt: 2 }}>
          The MixColumns step mixes each column of the 4×4 State matrix using
          multiplication in the finite field GF(2⁸).
          <br />
          <br />
          <strong> MixColumns Matrix:</strong>
          <br />
          Each column is multiplied by this matrix:
          <br />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 40px)",
              gap: 1,
              justifyContent: "flex-start",
              mt: 1,
            }}
          >
            {MIX_MATRIX.map((row, r) =>
              row.map((n, c) => (
                <Box
                  key={`quick-mix-${r}-${c}`}
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
          <br />
          Each new byte is computed as:
          <br />
          s′₀ = (02×s₀) ⊕ (03×s₁) ⊕ (01×s₂) ⊕ (01×s₃)
          <br />
          s′₁ = (01×s₀) ⊕ (02×s₁) ⊕ (03×s₂) ⊕ (01×s₃)
          <br />
          s′₂ = (01×s₀) ⊕ (01×s₁) ⊕ (02×s₂) ⊕ (03×s₃)
          <br />
          s′₃ = (03×s₀) ⊕ (01×s₁) ⊕ (01×s₂) ⊕ (02×s₃)
          <br />
          <br />
          <strong>Multiplication Rules in GF(2⁸):</strong>
          <br />
          • 01 × x = x<br />
          • 02 × x = (x Shift Left). If MSB = 1, XOR with 1B (hex).
          <br />
          • 03 × x = (02 × x) ⊕ x<br />
          <br />
          <strong>Tips:</strong>
          <br />
          • XOR = bitwise addition without carry.
          <br />
          • 02×x = shift left and reduce by 1B if needed.
          <br />
          • 03×x = (02×x) ⊕ x.
          <br />
          • Every column is processed independently.
          <br />
        </Typography>
        <HexBinConverter />
      </Box>
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
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" sx={{ mb: 1, textAlign: "center" }}>
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
      {/*(<Dialog open={showHelp} onClose={() => setShowHelp(false)}>
        <DialogTitle>What is MixColumns?</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            <b>MixColumns</b> is a diffusion step in AES. Each column of the
            state matrix is multiplied by a fixed matrix using arithmetic in
            GF(2⁸). This mixes the bytes in each column, increasing security.
            <br />
            <br />
            <b>Transformation:</b>
            <pre>
              | 2 3 1 1 | | a0 | | b0 | | 1 2 3 1 | x | a1 | = | b1 | | 1 1 2 3
              | | a2 | | b2 | | 3 1 1 2 | | a3 | | b3 |
            </pre>
            <b>GF(2⁸) multiplication:</b> Multiplication by 2 and 3 is performed
            using bitwise operations and modular reduction. Use the
            calculator/helper to see step-by-step calculations.
            <br />
            <br />
            <b>Task:</b> Enter the transformed values for each column in
            hexadecimal format.
          </Typography>
        </DialogContent>
      </Dialog>*/}
      <Dialog open={showHelp} onClose={() => setShowHelp(false)}>
        <DialogTitle>What is MixColumns?</DialogTitle>
        <DialogContent>
          <Typography gutterBottom sx={{ mb: 1 }}>
            <b>Overview</b>
            <br />
            MixColumns multiplies each 4‑byte column a = (a0, a1, a2, a3)^T by a
            fixed matrix to produce b = (b0, b1, b2, b3)^T. All arithmetic is in
            GF(2⁸).
          </Typography>

          <Box
            component="div"
            sx={{
              bgcolor: "#f5f5f5",
              p: 1,
              borderRadius: 1,
              fontFamily: "monospace",
              whiteSpace: "pre-wrap",
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
              Step-by-step (simple)
            </Typography>
            <Box component="ul" sx={{ pl: 3, mb: 1 }}>
              <li>
                <Typography variant="body2">
                  Pick one column. For each output byte, multiply each column
                  byte by the coefficient (2,3,1,1).
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Compute 0x02 × x using xtime(x): shift left one bit; if the
                  leftmost bit was 1, XOR the result with 0x1B.
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Compute 0x03 × x as xtime(x) ⊕ x. For 0x01 × x just copy x.
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  When you have the four intermediate bytes, XOR them (bitwise)
                  to get the output byte. Repeat for each output row.
                </Typography>
              </li>
            </Box>
            <Typography variant="body2" sx={{ mt: 1 }}>
              You can perform these operations in binary (shift and XOR are
              easier to see). Use the small converter on the page to translate a
              hex byte to binary and back while you work.
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MixColumnsPractice;
