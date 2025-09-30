import React, { useState } from "react";
import { Container, Typography, Button, Box, Tabs, Tab } from "@mui/material";

// Placeholder components for exercises
const SubBytesPractice = () => <div>SubBytes Practice (Coming Soon)</div>;
const ShiftRowsPractice = () => <div>ShiftRows Practice (Coming Soon)</div>;
const MixColumnsPractice = () => <div>MixColumns Practice (Coming Soon)</div>;
const AddRoundKeyPractice = () => <div>AddRoundKey Practice (Coming Soon)</div>;
const KeyExpansionPractice = () => (
  <div>Key Expansion Practice (Coming Soon)</div>
);

function Train() {
  const [category, setCategory] = useState(0); // 0: Practice, 1: Quiz
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
    <Container>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ textAlign: "center", mt: 4, mb: 4 }}
      >
        AES Training Center
      </Typography>
      <Tabs
        value={category}
        onChange={(_, val) => {
          setCategory(val);
          setSelectedExercise(null);
        }}
        sx={{ mb: 3 }}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        centered={false}
      >
        <Tab label="Practice: Solve AES steps yourself!" />
        <Tab label="Quiz: Test your theoretical understanding!" />
      </Tabs>
      {category === 0 ? (
        !selectedExercise ? (
          <Box>
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
            <Button onClick={() => setSelectedExercise(null)} sx={{ mb: 2 }}>
              &larr; Back to Exercise List
            </Button>
            {exercises.find((ex) => ex.key === selectedExercise)?.component}
          </Box>
        )
      ) : (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ textAlign: "center" }}>
            Quiz: Test your theoretical understanding!
          </Typography>
          <Typography variant="body1" gutterBottom sx={{ textAlign: "center" }}>
            Multiple choice and theory quizzes about AES will appear here.
            (Coming Soon)
          </Typography>
        </Box>
      )}
    </Container>
  );
}

export default Train;
