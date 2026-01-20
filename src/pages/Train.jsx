import React, { useState } from "react";
import { useEffect } from "react";
import { Container, Typography, Button, Box } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import "./../styles/Train.css";
import SubBytesPractice from "../components/practice/SubBytesPractice";
import ShiftRowsPractice from "../components/practice/ShiftRowsPractice";
import MixColumnsPractice from "../components/practice/MixColumnsPractice";
import AddRoundKeyPractice from "../components/practice/AddRoundKeyPractice";
import KeyExpansionPractice from "../components/practice/KeyExpansionPractice";
import InvSubBytesPractice from "../components/practice/InvSubBytesPractice";

function Train() {
  const [activePage, setActivePage] = useState("practice"); // default to practice landing
  const [selectedExercise, setSelectedExercise] = useState(null);

  // Listen for header-triggered reset events (clicking Train in header)
  useEffect(() => {
    const resetHandler = () => {
      setActivePage("practice");
      setSelectedExercise(null);
    };

    window.addEventListener("train-reset", resetHandler);
    return () => window.removeEventListener("train-reset", resetHandler);
  }, []);

  const exercises = [
    {
      key: "subbytes",
      label: "SubBytes Practice",
      component: <SubBytesPractice />,
    },
    {
      key: "shiftrows",
      label: "ShiftRows Practice",
      component: <ShiftRowsPractice />,
    },
    {
      key: "mixcolumns",
      label: "MixColumns Practice",
      component: <MixColumnsPractice />,
    },
    {
      key: "invsubbytes",
      label: "InvSubBytes Practice",
      component: <InvSubBytesPractice />,
    },
    {
      key: "addroundkey",
      label: "AddRoundKey Practice",
      component: <AddRoundKeyPractice />,
    },
    {
      key: "keyexpansion",
      label: "Key Expansion Practice",
      component: <KeyExpansionPractice />,
    },
  ];

  return (
    <div className="train-content">
      <Container>
        {/* Landing now directly shows Practice exercises; removed choice buttons and Quiz */}
        {activePage === "practice" && (
          <>
            {!selectedExercise ? (
              <Box>
                <Typography
                  variant="h4"
                  component="h1"
                  gutterBottom
                  sx={{ textAlign: "center", mt: 4, mb: 4 }}
                >
                  AES Training Center
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ textAlign: "center", mb: 3, maxWidth: 800, mx: "auto" }}
                >
                  Welcome to the AES Training Center! Here you can practice each
                  step of the AES algorithm in an interactive way. Choose an
                  exercise below to get started and test your understanding.
                  Need help along the way? Click the{" "}
                  <HelpOutlineIcon
                    fontSize="small"
                    sx={{ ml: 0.1, mb: 0.3, verticalAlign: "middle" }}
                  />{" "}
                  icon at any step to get guidance.
                </Typography>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ textAlign: "center", mb: 3 }}
                >
                  Select a step to train on:
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    flexWrap: "wrap",
                    justifyContent: "center",
                  }}
                >
                  {exercises.map((ex) => (
                    <Button
                      key={ex.key}
                      variant="contained"
                      size="large"
                      color="secondary"
                      onClick={() => setSelectedExercise(ex.key)}
                    >
                      {ex.label}
                    </Button>
                  ))}
                </Box>
              </Box>
            ) : (
              <Box>
                <Button
                  onClick={() => setSelectedExercise(null)}
                  sx={{ mt: 3, mb: 1 }}
                  variant="contained"
                >
                  &larr; Back to Exercise List
                </Button>
                {exercises.find((ex) => ex.key === selectedExercise)?.component}
              </Box>
            )}
          </>
        )}
        {/* Quiz removed — Train landing now directly shows Practice exercises */}
      </Container>
    </div>
  );
}

export default Train;
