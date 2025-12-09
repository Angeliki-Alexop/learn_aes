import React, { useState } from "react";
import { Container, Typography, Button, Box } from "@mui/material";
import "./../styles/Train.css";
import SubBytesPractice from "../components/practice/SubBytesPractice";
import ShiftRowsPractice from "../components/practice/ShiftRowsPractice";
import MixColumnsPractice from "../components/practice/MixColumnsPractice";
import AddRoundKeyPractice from "../components/practice/AddRoundKeyPractice";
import KeyExpansionPractice from "../components/practice/KeyExpansionPractice";

function Train() {
  const [activePage, setActivePage] = useState(null); // null, "practice", "quiz"
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
        {!activePage && (
          <>
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
              step of the AES algorithm interactively, or test your theoretical
              understanding with quizzes. Choose "Practice" to solve AES steps
              yourself, or "Quiz" to answer theory questions.
            </Typography>
            <Box
              sx={{ display: "flex", justifyContent: "center", gap: 4, mb: 4 }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => setActivePage("practice")}
              >
                Practice: Solve AES steps yourself!
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => setActivePage("quiz")}
              >
                Quiz: Test your theoretical understanding!
              </Button>
            </Box>
          </>
        )}
        {activePage === "practice" && (
          <>
            {!selectedExercise ? (
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-start",
                    mt: 2,
                    mb: 2,
                  }}
                >
                  <Button
                    onClick={() => setActivePage(null)}
                    variant="contained"
                  >
                    &larr; Back
                  </Button>
                </Box>
                <Typography
                  variant="h4"
                  component="h1"
                  gutterBottom
                  sx={{ textAlign: "center", mb: 5 }}
                >
                  Solve AES steps yourself!
                </Typography>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ textAlign: "center", mb: 3 }}
                >
                  Select an exercise to begin:
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
        {activePage === "quiz" && (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                mt: 2,
                mb: 2,
              }}
            >
              <Button onClick={() => setActivePage(null)} variant="contained">
                &larr; Back
              </Button>
            </Box>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{ textAlign: "center", mb: 3 }}
            >
              Quiz: Test your theoretical understanding!
            </Typography>
            <Typography
              variant="body1"
              gutterBottom
              sx={{ textAlign: "center" }}
            >
              Multiple choice and theory quizzes about AES will appear here.
              (Coming Soon)
            </Typography>
          </Box>
        )}
      </Container>
    </div>
  );
}

export default Train;
