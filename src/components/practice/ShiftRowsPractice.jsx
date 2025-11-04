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

// Helper to generate random 4x4 matrix
function getRandomMatrix() {
  return Array.from({ length: 4 }, () =>
    Array.from({ length: 4 }, () => Math.floor(Math.random() * 256))
  );
}

// Helper to apply ShiftRows transformation
function shiftRows(matrix) {
  return [
    matrix[0], // Row 0: no shift
    [...matrix[1].slice(1), matrix[1][0]], // Row 1: shift left by 1
    [...matrix[2].slice(2), ...matrix[2].slice(0, 2)], // Row 2: shift left by 2
    [...matrix[3].slice(3), ...matrix[3].slice(0, 3)], // Row 3: shift left by 3
  ];
}

const ShiftRowsPractice = () => {
  const [inputMatrix, setInputMatrix] = useState(getRandomMatrix());
  const [userRows, setUserRows] = useState(
    Array(4)
      .fill()
      .map(() => Array(4).fill(""))
  );
  const [showSolution, setShowSolution] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [incorrectRows, setIncorrectRows] = useState([
    false,
    false,
    false,
    false,
  ]);
  const [showHelp, setShowHelp] = useState(false);

  const solution = shiftRows(inputMatrix).map((row) =>
    row.map((val) => val.toString(16).padStart(2, "0").toUpperCase())
  );

  // Handle input change for each cell
  const handleInputChange = (rowIdx, colIdx, value) => {
    const updated = userRows.map((row) => [...row]);
    updated[rowIdx][colIdx] = value.toUpperCase();
    setUserRows(updated);
  };

  // Check answers
  const handleCheck = () => {
    let correct = true;
    const newIncorrect = [false, false, false, false];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (userRows[r][c] !== solution[r][c]) {
          correct = false;
          newIncorrect[r] = true;
          break;
        }
      }
    }
    setIncorrectRows(newIncorrect);
    setFeedback(
      correct
        ? "Correct!"
        : "Some rows are incorrect. Please check the highlighted rows and try again."
    );
  };

  // Show solution
  const handleShowSolution = () => {
    setShowSolution(true);
    setUserRows(solution);
    setIncorrectRows([false, false, false, false]);
    setFeedback(null);
  };

  // Next example
  const handleNext = () => {
    const newMatrix = getRandomMatrix();
    setInputMatrix(newMatrix);
    setUserRows(
      Array(4)
        .fill()
        .map(() => Array(4).fill(""))
    );
    setShowSolution(false);
    setFeedback(null);
    setIncorrectRows([false, false, false, false]);
  };

  return (
    <Box
      sx={{
        maxWidth: 700,
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
        <Typography variant="h6">ShiftRows Practice</Typography>
        <IconButton onClick={() => setShowHelp(true)}>
          <HelpOutlineIcon />
        </IconButton>
      </Box>
      <Box
        sx={{
          display: "flex",
          gap: 4,
          justifyContent: "center",
          alignItems: "flex-start",
          mb: 2,
        }}
      >
        {/* Original Matrix */}
        <Box sx={{ width: 318 }}>
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
        {/* User Output Matrix */}
        <Box
          sx={{
            width: 318,
          }}
        >
          <Typography variant="body2" sx={{ mb: 1, textAlign: "center" }}>
            Enter ShiftRows output (hex):
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 1,
            }}
          >
            {userRows.map((row, r) =>
              row.map((val, c) => (
                <Box
                  key={`ans-${r}-${c}`}
                  sx={{
                    border: incorrectRows[r]
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
      <Dialog open={showHelp} onClose={() => setShowHelp(false)}>
        <DialogTitle>What is ShiftRows?</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            ShiftRows is a transposition step in AES. Each row of the state
            matrix is shifted left by a different offset:
            <ul>
              <li>Row 0: No shift</li>
              <li>Row 1: Shift left by 1</li>
              <li>Row 2: Shift left by 2</li>
              <li>Row 3: Shift left by 3</li>
            </ul>
            Enter the shifted values for each row in hexadecimal format.
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ShiftRowsPractice;
