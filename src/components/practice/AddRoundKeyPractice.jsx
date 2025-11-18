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
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CloseIcon from "@mui/icons-material/Close";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

// Helper to generate random 4x4 matrix
function getRandomMatrix() {
  return Array.from({ length: 4 }, () =>
    Array.from({ length: 4 }, () => Math.floor(Math.random() * 256))
  );
}

// Helper to apply AddRoundKey transformation (XOR operation)
function addRoundKey(state, roundKey) {
  return state.map((row, r) => row.map((val, c) => val ^ roundKey[r][c]));
}

// Hex to Binary converter component
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

const AddRoundKeyPractice = () => {
  const [stateMatrix, setStateMatrix] = useState(getRandomMatrix());
  const [roundKeyMatrix, setRoundKeyMatrix] = useState(getRandomMatrix());
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
  const [focusedCell, setFocusedCell] = useState(null); // Track focused cell {row, col}

  const solution = addRoundKey(stateMatrix, roundKeyMatrix);

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
    const newState = getRandomMatrix();
    const newKey = getRandomMatrix();
    setStateMatrix(newState);
    setRoundKeyMatrix(newKey);
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
        <Typography variant="h5">AddRoundKey Practice</Typography>
        <IconButton onClick={() => setShowHelp(true)}>
          <HelpOutlineIcon />
        </IconButton>
      </Box>
      <Typography variant="body2" sx={{ mb: 2, textAlign: "center" }}>
        Apply the AddRoundKey transformation by XORing each byte of the state
        matrix with the corresponding byte of the round key. Enter your answers
        in hexadecimal format.
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 4,
          justifyContent: "center",
          alignItems: "flex-start",
          mb: 2,
        }}
      >
        {/* State Matrix */}
        <Box sx={{ width: 300 }}>
          <Typography variant="body2" sx={{ mb: 1, textAlign: "center" }}>
            State Matrix (hex):
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 1,
            }}
          >
            {stateMatrix.map((row, r) =>
              row.map((val, c) => (
                <Box
                  key={`state-${r}-${c}`}
                  sx={{
                    border:
                      focusedCell?.row === r && focusedCell?.col === c
                        ? "2px solid #1976d2"
                        : "1px solid #ccc",
                    borderRadius: 1,
                    p: 1,
                    textAlign: "center",
                    bgcolor:
                      focusedCell?.row === r && focusedCell?.col === c
                        ? "#e3f2fd"
                        : "#f5f5f5",
                    minHeight: 48,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    transition: "all 0.2s ease",
                  }}
                >
                  {val.toString(16).padStart(2, "0").toUpperCase()}
                </Box>
              ))
            )}
          </Box>
        </Box>

        {/* XOR Symbol */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 240,
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            ⊕
          </Typography>
        </Box>

        {/* Round Key Matrix */}
        <Box sx={{ width: 300 }}>
          <Typography variant="body2" sx={{ mb: 1, textAlign: "center" }}>
            Round Key (hex):
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 1,
            }}
          >
            {roundKeyMatrix.map((row, r) =>
              row.map((val, c) => (
                <Box
                  key={`key-${r}-${c}`}
                  sx={{
                    border:
                      focusedCell?.row === r && focusedCell?.col === c
                        ? "2px solid #1976d2"
                        : "1px solid #ccc",
                    borderRadius: 1,
                    p: 1,
                    textAlign: "center",
                    bgcolor:
                      focusedCell?.row === r && focusedCell?.col === c
                        ? "#fff8e1"
                        : "#fff3e0",
                    minHeight: 48,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    transition: "all 0.2s ease",
                  }}
                >
                  {val.toString(16).padStart(2, "0").toUpperCase()}
                </Box>
              ))
            )}
          </Box>
        </Box>

        {/* Equals Symbol */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 240,
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            =
          </Typography>
        </Box>

        {/* User Output Matrix */}
        <Box sx={{ width: 300 }}>
          <Typography variant="body2" sx={{ mb: 1, textAlign: "center" }}>
            Enter Result (hex):
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 1,
            }}
          >
            {userMatrix.map((row, r) =>
              row.map((val, c) => (
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
                    onFocus={() => setFocusedCell({ row: r, col: c })}
                    onBlur={() => setFocusedCell(null)}
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
              ))
            )}
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
          All correct answers are now filled in the Result Matrix above.
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

      <Dialog open={showHelp} onClose={() => setShowHelp(false)}>
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <strong>What is AddRoundKey?</strong>
          <IconButton onClick={() => setShowHelp(false)} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            AddRoundKey is a step in AES where each byte of the state matrix is
            combined with the corresponding byte of the round key using the XOR
            operation (⊕).
          </Typography>

          <Typography variant="body2" sx={{ mt: 3, fontStyle: "italic" }}>
            <strong>Hint:</strong> Convert each byte to binary, perform XOR bit
            by bit, then convert back to hexadecimal. You can use the converter
            below.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <HexBinConverter />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AddRoundKeyPractice;
