import React, { useState } from "react";
import { useEffect } from "react";
import { Container, Typography, Button, Box } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      label: t("train.practice.subbytes", "SubBytes Practice"),
      component: <SubBytesPractice />,
    },
    {
      key: "shiftrows",
      label: t("train.practice.shiftrows", "ShiftRows Practice"),
      component: <ShiftRowsPractice />,
    },
    {
      key: "invshiftrows",
      label: t("train.practice.invshiftrows", "InvShiftRows Practice"),
      component: <InvShiftRowsPractice />,
    },
    {
      key: "mixcolumns",
      label: t("train.practice.mixcolumns", "MixColumns Practice"),
      component: <MixColumnsPractice />,
    },
    {
      key: "invmixcolumns",
      label: t("train.practice.invmixcolumns", "InvMixColumns Practice"),
      component: <InvMixColumnsPractice />,
    },
    {
      key: "invsubbytes",
      label: t("train.practice.invsubbytes", "InvSubBytes Practice"),
      component: <InvSubBytesPractice />,
    },
    {
      key: "addroundkey",
      label: t("train.practice.addroundkey", "AddRoundKey Practice"),
      component: <AddRoundKeyPractice />,
    },
    {
      key: "keyexpansion",
      label: t("train.practice.keyexpansion", "Key Expansion Practice"),
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
                  {t("train.title", "AES Training Center")}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    textAlign: "center",
                    mb: 3,
                    maxWidth: 800,
                    mx: "auto",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {t(
                    "train.welcomeStart",
                    "Welcome to the AES Training Center! Here you can practice each step of the AES algorithm in an interactive way. Choose an exercise below to get started and test your understanding. Need help along the way? Click the",
                  )}{" "}
                  <HelpOutlineIcon
                    sx={{
                      fontSize: "1.2em",
                      verticalAlign: "middle",
                      mx: 0.5,
                      color: "black",
                    }}
                  />{" "}
                  {t("train.welcomeEnd", "icon at any step to get guidance.")}
                </Typography>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ textAlign: "center", mb: 3 }}
                >
                  {t("train.selectStep", "Select a step to train on:")}
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
              <Box sx={{ px: { xs: 1, sm: 0 } }}>
                <Button
                  onClick={() => setSelectedExercise(null)}
                  sx={{ mt: 3, mb: 1, textTransform: "none" }}
                  variant="contained"
                  fullWidth={{ xs: true, sm: false }}
                >
                  {t("train.backToList", "Back to Exercise List")}
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
