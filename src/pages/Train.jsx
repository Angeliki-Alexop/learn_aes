import React, { useState } from "react";
import { Container, Typography, Button, Box } from "@mui/material";
import "./../styles/Train.css";
import SubBytesPractice from "../components/practice/SubBytesPractice";
import ShiftRowsPractice from "../components/practice/ShiftRowsPractice";
import MixColumnsPractice from "../components/practice/MixColumnsPractice";
// import AddRoundKeyPractice from "../components/practice/AddRoundKeyPractice";
// import KeyExpansionPractice from "../components/practice/KeyExpansionPractice";

// Placeholder components for exercises
//const SubBytesPractice = () => <div>SubBytes Practice (Coming Soon)</div>;
//const ShiftRowsPractice = () => <div>ShiftRows Practice (Coming Soon)</div>;
//const MixColumnsPractice = () => <div>MixColumns Practice (Coming Soon)</div>;
const AddRoundKeyPractice = () => <div>AddRoundKey Practice (Coming Soon)</div>;
const KeyExpansionPractice = () => (
  <div>Key Expansion Practice (Coming Soon)</div>
);

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
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ textAlign: "center", mt: 4, mb: 4 }}
        >
          {!activePage && "AES Training Center"}
          {activePage === "practice" &&
            !selectedExercise &&
            "Practice: Solve AES steps yourself!"}
          {activePage === "practice" &&
            selectedExercise &&
            exercises.find((ex) => ex.key === selectedExercise)?.label}
          {activePage === "quiz" &&
            "Quiz: Test your theoretical understanding!"}
        </Typography>
        {/* Explanation section */}
        {!activePage && (
          <Typography
            variant="body1"
            sx={{ textAlign: "center", mb: 3, maxWidth: 600, mx: "auto" }}
          >
            Welcome to the AES Training Center! Here you can practice each step
            of the AES algorithm interactively, or test your theoretical
            understanding with quizzes. Choose "Practice" to solve AES steps
            yourself, or "Quiz" to answer theory questions.
          </Typography>
        )}
        {!activePage && (
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
        )}
        {activePage === "practice" && (
          <>
            {!selectedExercise ? (
              <Box>
                <Button
                  onClick={() => setActivePage(null)}
                  sx={{ mb: 2 }}
                  variant="text"
                >
                  &larr; Back
                </Button>
                <Typography variant="h6" gutterBottom>
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
                  sx={{ mb: 2 }}
                  variant="text"
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
            <Button
              onClick={() => setActivePage(null)}
              sx={{ mb: 2 }}
              variant="text"
            >
              &larr; Back
            </Button>
            <Typography variant="h6" gutterBottom sx={{ textAlign: "center" }}>
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
