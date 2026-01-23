import React, { useState } from "react";
import { useEffect } from "react";
import { Container, Typography, Button, Box } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import "./../styles/Train.css";
import SubBytesPractice from "../components/practice/SubBytesPractice";
import ShiftRowsPractice from "../components/practice/ShiftRowsPractice";
import MixColumnsPractice from "../components/practice/MixColumnsPractice";
import InvMixColumnsPractice from "../components/practice/InvMixColumnsPractice";
import InvShiftRowsPractice from "../components/practice/InvShiftRowsPractice";
import AddRoundKeyPractice from "../components/practice/AddRoundKeyPractice";
import KeyExpansionPractice from "../components/practice/KeyExpansionPractice";
import InvSubBytesPractice from "../components/practice/InvSubBytesPractice";

function Train() {
  const [activePage, setActivePage] = useState("practice"); // default to practice landing
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [flags, setFlags] = useState({ enable_train_inverse_steps: true });

  // Listen for header-triggered reset events (clicking Train in header)
  useEffect(() => {
    const resetHandler = () => {
      setActivePage("practice");
      setSelectedExercise(null);
    };

    window.addEventListener("train-reset", resetHandler);
    return () => window.removeEventListener("train-reset", resetHandler);
  }, []);

  // Load feature flags (fall back to defaults above if file missing)
  useEffect(() => {
    let mounted = true;
    import("../feature_flags.js")
      .then((mod) => {
        if (mounted && mod && mod.default)
          setFlags((f) => ({ ...f, ...mod.default }));
      })
      .catch(() => {
        // ignore and keep defaults
      });

    return () => {
      mounted = false;
    };
  }, []);

  const allExercises = [
    {
      key: "subbytes",
      label: "SubBytes",
      component: <SubBytesPractice />,
    },
    {
      key: "shiftrows",
      label: "ShiftRows",
      component: <ShiftRowsPractice />,
    },
    {
      key: "invshiftrows",
      label: "InvShiftRows",
      component: <InvShiftRowsPractice />,
    },
    {
      key: "mixcolumns",
      label: "MixColumns",
      component: <MixColumnsPractice />,
    },
    {
      key: "invmixcolumns",
      label: "InvMixColumns",
      component: <InvMixColumnsPractice />,
    },
    {
      key: "invsubbytes",
      label: "InvSubBytes",
      component: <InvSubBytesPractice />,
    },
    {
      key: "addroundkey",
      label: "AddRoundKey",
      component: <AddRoundKeyPractice />,
    },
    {
      key: "keyexpansion",
      label: "Key Expansion",
      component: <KeyExpansionPractice />,
    },
  ];

  const exercises = allExercises.filter((ex) => {
    if (flags.enable_train_inverse_steps === false) {
      return !["invshiftrows", "invsubbytes", "invmixcolumns"].includes(ex.key);
    }
    return true;
  });

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
                {/* First row: main steps */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    flexWrap: "wrap",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  {[
                    "subbytes",
                    "shiftrows",
                    "mixcolumns",
                    "addroundkey",
                    "keyexpansion",
                  ].map((k) => {
                    const ex = exercises.find((e) => e.key === k);
                    return (
                      ex && (
                        <Button
                          key={ex.key}
                          variant="contained"
                          size="large"
                          color="secondary"
                          onClick={() => setSelectedExercise(ex.key)}
                          sx={{ textTransform: "none" }}
                        >
                          {ex.label}
                        </Button>
                      )
                    );
                  })}
                </Box>

                {/* Second row: inverse steps (hidden when feature flag disables inverse steps) */}
                {flags.enable_train_inverse_steps !== false && (
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      flexWrap: "wrap",
                      justifyContent: "center",
                    }}
                  >
                    {["invshiftrows", "invmixcolumns", "invsubbytes"].map(
                      (k) => {
                        const ex = exercises.find((e) => e.key === k);
                        return (
                          ex && (
                            <Button
                              key={ex.key}
                              variant="contained"
                              size="large"
                              color="secondary"
                              onClick={() => setSelectedExercise(ex.key)}
                              sx={{ textTransform: "none" }}
                            >
                              {ex.label}
                            </Button>
                          )
                        );
                      },
                    )}
                  </Box>
                )}
              </Box>
            ) : (
              <Box>
                <Button
                  onClick={() => setSelectedExercise(null)}
                  sx={{ mt: 3, mb: 1, textTransform: "none" }}
                  variant="contained"
                >
                  Back to Exercise List
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
