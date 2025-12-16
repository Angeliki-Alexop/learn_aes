import React, { useState } from "react";
import { Container, Typography, Button, Box } from "@mui/material";
import "./../styles/Train.css";
import SubBytesPractice from "../components/practice/SubBytesPractice";
import ShiftRowsPractice from "../components/practice/ShiftRowsPractice";
import MixColumnsPractice from "../components/practice/MixColumnsPractice";
import AddRoundKeyPractice from "../components/practice/AddRoundKeyPractice";
import KeyExpansionPractice from "../components/practice/KeyExpansionPractice";

function Train() {
  const [activePage, setActivePage] = useState("practice"); // default to practice landing
  const [selectedExercise, setSelectedExercise] = useState(null);

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
                  sx={{ textAlign: "center", mb: 3, maxWidth: 600, mx: "auto" }}
                >
                  Welcome to the AES Training Center! Here you can practice each
                  step of the AES algorithm interactively. Select an exercise
                  below to get started!
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
