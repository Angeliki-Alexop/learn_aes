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
import CloseIcon from "@mui/icons-material/Close";
import { Grid3x3 } from "lucide-react";

import { sBox } from "../../utils/aes_manual_v2";

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
        <Typography variant="h5">SubBytes Practice</Typography>
        <IconButton onClick={() => setShowHelp(true)}>
          <HelpOutlineIcon />
        </IconButton>
      </Box>
      <Typography variant="body2" sx={{ mb: 2, textAlign: "center" }}>
        Apply the SubBytes transformation by replacing each byte using the AES
        S-box lookup table. Enter your answers in hexadecimal format.
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
            Enter SubBytes output (hex):
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 1,
            }}
          >
            {userAnswers.map((row, r) =>
              row.map((val, c) => (
                <Box
                  key={`ans-${r}-${c}`}
                  sx={{
                    border: incorrectCells[r][c]
                      ? "2px solid #d32f2f"
                      : showSolution
                      ? "2px solid #1976d2"
                      : "1px solid #ccc",
                    borderRadius: 1,
                    p: 1,
                    textAlign: "center",
                    bgcolor: showSolution ? "#e3f2fd" : "#f5f5f5",
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
                      },
                    }}
                    disabled={showSolution}
                    size="small"
                    sx={{
                      width: 56,
                      bgcolor: showSolution ? "#e3f2fd" : undefined,
                      "& .MuiInputBase-input": {
                        color: showSolution ? "#1976d2" : undefined,
                        fontWeight: showSolution ? "bold" : undefined,
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
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <strong>What is SubBytes?</strong>
          <IconButton onClick={() => setShowHelp(false)} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            SubBytes is the step in AES where each byte is replaced with a new
            byte according to a predefined substitution table called the S-box.
            To perform this step, take the byte in hex: the first hex digit
            indicates the row in the S-box, and the second hex digit indicates
            the column. The value found at that position becomes the substituted
            byte.
          </Typography>
          <Typography
            variant="body2"
            sx={{
              mt: 3,
              fontStyle: "italic",
            }}
          >
            <strong>Hint:</strong> Enter the substituted values in hexadecimal
            format. Click the{" "}
            <Grid3x3
              size={18}
              style={{
                display: "inline-block",
                verticalAlign: "middle",
                margin: "0 4px",
              }}
            />{" "}
            icon in the navbar to view the S-box lookup table.
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SubBytesPractice;
