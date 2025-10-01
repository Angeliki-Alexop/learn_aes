import React, { useState } from "react";
import {
  Button,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Grid,
  TextField,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

import { sBox } from "../utils/aes_manual_v2";

function getRandomMatrix() {
  return Array.from({ length: 4 }, () =>
    Array.from({ length: 4 }, () => Math.floor(Math.random() * 256))
  );
}

function applySBox(matrix) {
  return matrix.map((row) =>
    row.map((byte) => {
      return sBox[byte];
    })
  );
}

const SubBytesPractice = () => {
  const [inputMatrix, setInputMatrix] = useState(getRandomMatrix());
  const [userAnswers, setUserAnswers] = useState(
    Array(4)
      .fill()
      .map(() => Array(4).fill(""))
  );
  const [showSolution, setShowSolution] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const solution = applySBox(inputMatrix);
  const [incorrectCells, setIncorrectCells] = useState(
    Array(4)
      .fill()
      .map(() => Array(4).fill(false))
  );
  const handleInputChange = (r, c, value) => {
    const updated = userAnswers.map((row) => [...row]);
    updated[r][c] = value;
    setUserAnswers(updated);
  };

  const handleCheck = () => {
    let correct = true;
    const newIncorrect = Array(4)
      .fill()
      .map(() => Array(4).fill(false));
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (parseInt(userAnswers[r][c], 16) !== solution[r][c]) {
          correct = false;
          newIncorrect[r][c] = true;
        }
      }
    }
    setIncorrectCells(newIncorrect);
    setFeedback(correct ? "Correct!" : "Some answers are incorrect.");
  };

  const handleShowSolution = () => {
    setShowSolution(true);
    setFeedback(null);
    setIncorrectCells(
      Array(4)
        .fill()
        .map(() => Array(4).fill(false))
    );
  };

  const handleNext = () => {
    setInputMatrix(getRandomMatrix());
    setUserAnswers(
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
        maxWidth: 400,
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
        <Typography variant="h6">SubBytes Practice</Typography>
        <IconButton onClick={() => setShowHelp(true)}>
          <HelpOutlineIcon />
        </IconButton>
      </Box>
      <Typography variant="body2" sx={{ mb: 1 }}>
        Original Matrix (hex):
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 1,
          mb: 2,
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
      <Typography variant="body2" sx={{ mb: 1 }}>
        Enter SubBytes output (hex):
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 1,
          mb: 2,
        }}
      >
        {userAnswers.map((row, r) =>
          row.map((val, c) => (
            <Box
              key={`ans-${r}-${c}`}
              sx={{
                border: incorrectCells[r][c]
                  ? "2px solid #d32f2f"
                  : "1px solid #ccc",
                borderRadius: 1,
                p: 1,
                textAlign: "center",
                bgcolor: "#f5f5f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 48,
              }}
            >
              <TextField
                value={
                  showSolution
                    ? solution[r][c].toString(16).padStart(2, "0").toUpperCase()
                    : val
                }
                onChange={(e) => handleInputChange(r, c, e.target.value)}
                inputProps={{
                  maxLength: 2,
                  style: { textAlign: "center", textTransform: "uppercase" },
                }}
                disabled={showSolution}
                size="small"
                sx={{ width: 56 }}
              />
            </Box>
          ))
        )}
      </Box>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
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
        <Button variant="text" onClick={handleNext}>
          Next Example
        </Button>
      </Box>
      {feedback && (
        <Typography
          color={feedback === "Correct!" ? "success.main" : "error.main"}
        >
          {feedback}
        </Typography>
      )}
      {showSolution && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            SubBytes Output Matrix:
          </Typography>
          <Grid container spacing={1} sx={{ mb: 2 }}>
            {solution.map((row, r) =>
              row.map((val, c) => (
                <Grid item xs={3} key={`sol-${r}-${c}`}>
                  <Box
                    sx={{
                      border: "1px solid #1976d2",
                      borderRadius: 1,
                      p: 1,
                      textAlign: "center",
                      bgcolor: "#e3f2fd",
                      fontWeight: "bold",
                    }}
                  >
                    {val.toString(16).padStart(2, "0").toUpperCase()}
                  </Box>
                </Grid>
              ))
            )}
          </Grid>
        </Box>
      )}
      <Dialog open={showHelp} onClose={() => setShowHelp(false)}>
        <DialogTitle>What is SubBytes?</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            SubBytes is a non-linear byte substitution step in AES. Each byte in
            the state matrix is replaced using a fixed S-box lookup table. To
            solve, find the S-box value for each byte (row = high nibble, col =
            low nibble).
          </Typography>
          <Typography variant="body2">
            Enter the substituted values in hexadecimal format. Use the S-box to
            look up each byte.
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SubBytesPractice;
