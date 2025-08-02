import React from "react";
import { Box, Button, TextField } from "@mui/material";

export function StepNavigation({
  currentRound,
  currentStep,
  keyError,
  tempInputText,
  setTempInputText,
  tempKey,
  setTempKey,
  handleSubmitButtonClick,
  keySize,
  setKeyError,
  setInputText,
  setKey,
  setSidebarVisible,
  setRoundKeys,
  setStateMap,
  sidebarVisible,
  handleInput,
  setCurrentRound,
  setCurrentStep,
  handleStepClick,
  handlePreviousRound,
  handlePreviousStep,
  totalRounds,
  handleNextStep,
  handleNextRound,
  handleFinalRound,
  setHasSubmitted
}) {
  return (
    <Box
      mt={2}
      display="flex"
      justifyContent="center"
      alignItems="center"
      className="buttons-container"
    >
      {currentRound === -2 && (
        <Box
          id="input_text_key"
          className="input-box"
          display="flex"
          flexDirection="column"
          alignItems="center"
          width="50%"
        >
          <TextField
            label="Input Text"
            value={tempInputText}
            onChange={(e) => setTempInputText(e.target.value)}
            variant="outlined"
            fullWidth
            margin="normal"
            inputProps={{ maxLength: 16 }}
          />
          <TextField
            label="Key"
            value={tempKey}
            onChange={(e) => setTempKey(e.target.value)}
            variant="outlined"
            fullWidth
            margin="normal"
            error={!!keyError}
            helperText={keyError}
            inputProps={{ maxLength: 16 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() =>
              handleSubmitButtonClick(
                tempKey,
                tempInputText,
                keySize,
                setKeyError,
                setInputText,
                setKey,
                setSidebarVisible,
                setRoundKeys,
                setStateMap,
                setHasSubmitted
              )
            }
            style={{ marginTop: "16px" }}
          >
            Submit
          </Button>
        </Box>
      )}
      {sidebarVisible && (
        <>
          <Button
            variant="contained"
            style={{
              backgroundColor: "#4b0082",
              color: "white",
              margin: "8px",
            }}
            onClick={() => handleInput(setCurrentRound, setCurrentStep)}
            disabled={currentRound === -2 && currentStep === "Input"}
          >
            Input
          </Button>
          <Button
            variant="contained"
            color="primary"
            style={{ margin: "8px" }}
            onClick={() =>
              handlePreviousRound(
                currentRound,
                setCurrentRound,
                setCurrentStep
              )
            }
            disabled={currentRound <= 0}
          >
            Previous Round
          </Button>
          <Button
            variant="contained"
            color="primary"
            style={{ margin: "8px" }}
            onClick={() =>
              handlePreviousStep(
                currentRound,
                currentStep,
                setCurrentStep,
                () =>
                  handlePreviousRound(
                    currentRound,
                    setCurrentRound,
                    setCurrentStep
                  ),
                totalRounds
              )
            }
            disabled={currentRound === -2 && currentStep === "Input"}
          >
            Previous Step
          </Button>
          <Button
            variant="contained"
            color="primary"
            style={{ margin: "8px" }}
            onClick={() =>
              handleNextStep(
                currentRound,
                currentStep,
                setCurrentStep,
                () =>
                  handleNextRound(
                    currentRound,
                    setCurrentRound,
                    setCurrentStep,
                    totalRounds
                  ),
                totalRounds
              )
            }
            disabled={
              currentRound >= totalRounds &&
              (currentStep === "AddRoundKey" || currentStep === "Result")
            }
          >
            Next Step
          </Button>
          <Button
            variant="contained"
            color="primary"
            style={{ margin: "8px" }}
            onClick={() =>
              handleNextRound(
                currentRound,
                setCurrentRound,
                setCurrentStep,
                totalRounds
              )
            }
            disabled={currentRound >= totalRounds}
          >
            Next Round
          </Button>
          <Button
            variant="contained"
            color="secondary"
            style={{ margin: "8px" }}
            onClick={() =>
              handleFinalRound(setCurrentRound, setCurrentStep, totalRounds)
            }
            disabled={currentRound >= totalRounds}
          >
            Final Round
          </Button>
        </>
      )}
    </Box>
  );
}
