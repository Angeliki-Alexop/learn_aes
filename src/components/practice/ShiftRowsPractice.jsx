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
import { useTranslation } from "react-i18next";

// Helper to generate random 4x4 matrix
function getRandomMatrix() {
  return Array.from({ length: 4 }, () =>
    Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)),
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
  const { t } = useTranslation();
  const [inputMatrix, setInputMatrix] = useState(getRandomMatrix());
  const [userRows, setUserRows] = useState(
    Array(4)
      .fill()
      .map(() => Array(4).fill("")),
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
    row.map((val) => val.toString(16).padStart(2, "0").toUpperCase()),
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
        ? t("train.practice.correct", "Correct!")
        : t(
            "train.practice.incorrect",
            "Some rows are incorrect. Please check the highlighted rows and try again.",
          ),
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
        .map(() => Array(4).fill("")),
    );
    setShowSolution(false);
    setFeedback(null);
    setIncorrectRows([false, false, false, false]);
  };

  return (
    <Box
      sx={{
        maxWidth: { xs: "100%", sm: 700 },
        mx: "auto",
        mt: 2,
        boxShadow: 2,
        background: "#fff",
        borderRadius: 2,
        p: { xs: 1, sm: 2 },
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
        <Typography variant="h5" sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}>
          {t("train.practice.shiftrows", "ShiftRows Practice")}
        </Typography>
        <IconButton onClick={() => setShowHelp(true)}>
          <HelpOutlineIcon />
        </IconButton>
      </Box>
      <Typography variant="body1" sx={{ mb: 2, textAlign: "center", fontSize: { xs: "0.875rem", sm: "1rem" } }}>
        {t(
          "train.practice.shiftrows.description",
          "Apply the ShiftRows transformation by cyclically shifting each row left by a specific offset.",
        )}
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 2, sm: 4 },
          justifyContent: "center",
          alignItems: { xs: "center", sm: "flex-start" },
          mb: 2,
        }}
      >
        {/* Original Matrix */}
        <Box sx={{ width: { xs: "100%", sm: 318 }, maxWidth: 318 }}>
          <Typography variant="body2" sx={{ mb: 1, textAlign: "center", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
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
        {/* User Output Matrix */}
        <Box
          sx={{
            width: { xs: "100%", sm: 318 },
            maxWidth: 318,
          }}
        >
          <Typography variant="body2" sx={{ mb: 1, textAlign: "center", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
            {t("train.practice.yourAnswers", "Enter ShiftRows output (hex):")}
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
                      feedback === t("train.practice.correct", "Correct!")
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
                          feedback === t("train.practice.correct", "Correct!")
                            ? "#2e7d32"
                            : showSolution
                              ? "#1976d2"
                              : undefined,
                        background:
                          feedback === t("train.practice.correct", "Correct!")
                            ? "#c8e6c9"
                            : showSolution
                              ? "#e3f2fd"
                              : undefined,
                        opacity: 1,
                        WebkitTextFillColor:
                          feedback === t("train.practice.correct", "Correct!")
                            ? "#2e7d32"
                            : showSolution
                              ? "#1976d2"
                              : undefined,
                      },
                    }}
                    disabled={showSolution}
                    size="small"
                    sx={{
                      width: { xs: 40, sm: 56 },
                      bgcolor:
                        feedback === t("train.practice.correct", "Correct!")
                          ? "#c8e6c9"
                          : showSolution
                            ? "#e3f2fd"
                            : undefined,
                      "& .MuiInputBase-input.Mui-disabled": {
                        color:
                          feedback === t("train.practice.correct", "Correct!")
                            ? "#2e7d32"
                            : showSolution
                              ? "#1976d2"
                              : undefined,
                        fontWeight: "bold",
                        opacity: 1,
                        WebkitTextFillColor:
                          feedback === t("train.practice.correct", "Correct!")
                            ? "#2e7d32"
                            : showSolution
                              ? "#1976d2"
                              : undefined,
                        background:
                          feedback === t("train.practice.correct", "Correct!")
                            ? "#c8e6c9"
                            : showSolution
                              ? "#e3f2fd"
                              : undefined,
                      },
                    }}
                  />
                </Box>
              )),
            )}
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
            "All correct answers are now filled in the User Output Matrix above.",
          )}
        </Typography>
      )}
      <Box sx={{ 
        display: "flex", 
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "center", 
        gap: { xs: 1, sm: 2 }, 
        mb: 2,
        px: { xs: 1, sm: 0 }
      }}>
        <Button
          variant="contained"
          onClick={handleCheck}
          disabled={showSolution}
          fullWidth={{ xs: true, sm: false }}
          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
        >
          {t("train.practice.check", "Check Answers")}
        </Button>
        <Button 
          variant="outlined" 
          onClick={handleShowSolution}
          fullWidth={{ xs: true, sm: false }}
          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
        >
          {t("train.practice.showSolution", "Show Solution")}
        </Button>
        <Button 
          variant="contained" 
          color="secondary" 
          onClick={handleNext}
          fullWidth={{ xs: true, sm: false }}
          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
        >
          {t("train.practice.next", "Next Example")}
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
          <strong>
            {t("train.practice.tooltips.shiftrows.title", "What is ShiftRows?")}
          </strong>
          <IconButton onClick={() => setShowHelp(false)} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom sx={{ whiteSpace: "pre-line" }}>
            {t("train.practice.tooltips.shiftrows.description")}
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ShiftRowsPractice;
