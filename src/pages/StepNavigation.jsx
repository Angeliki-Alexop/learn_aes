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
  setKeySize,
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
  mode,
  setMode,
  setHasSubmitted,
  hasSubmitted,
  showInitialControls = true,
}) {
  const defaultKeyForSize = (size) => {
    if (size === 128) return "DefaultKey123456";
    if (size === 192) return "DefaultKeyForAES192Key!!";
    return "DefaultKeyForAES256Key0123456789";
  };
  return (
    <Box
      mt={2}
      display="flex"
      justifyContent="center"
      alignItems="center"
      className="buttons-container"
    >
      {/* Show only the submit button before submission */}
      {currentRound === -2 && !hasSubmitted && showInitialControls && (
        <Box
          id="input_text_key"
          display="flex"
          flexDirection="column"
          alignItems="center"
          width="50%"
        >
          {/* Mode buttons with Key Size Selector in the middle */}
          <Box display="flex" flexDirection="row" alignItems="center" mb={2}>
            <Button
              variant={mode === "Encrypt" ? "contained" : "outlined"}
              color={mode === "Encrypt" ? "primary" : "inherit"}
              onClick={() => {
                setMode("Encrypt");
                setTempInputText("Test");
                setTempKey(defaultKeyForSize(keySize));
              }}
              style={{ marginRight: 8 }}
              sx={
                mode === "Encrypt"
                  ? {
                      backgroundColor: "#9c27b0",
                      color: "#fff",
                      "&:hover": { backgroundColor: "#87219a" },
                    }
                  : {}
              }
            >
              Encryption
            </Button>
            <Box display="flex" alignItems="center" sx={{ mx: 1 }}>
              <label htmlFor="key-size-select" style={{ marginRight: 8 }}>
                Key Size:
              </label>
              <select
                id="key-size-select"
                value={keySize}
                onChange={(e) => setKeySize(Number(e.target.value))}
                style={{ padding: "4px 8px", fontSize: "1rem" }}
              >
                <option value={128}>128 bits</option>
                <option value={192}>192 bits</option>
                <option value={256}>256 bits</option>
              </select>
            </Box>
            <Button
              variant={mode === "Decrypt" ? "contained" : "outlined"}
              color={mode === "Decrypt" ? "primary" : "inherit"}
              onClick={() => {
                setMode("Decrypt");
                setTempInputText("AA==");
                setTempKey(defaultKeyForSize(keySize));
              }}
              style={{ marginLeft: 8 }}
              sx={
                mode === "Decrypt"
                  ? {
                      backgroundColor: "#9c27b0",
                      color: "#fff",
                      "&:hover": { backgroundColor: "#87219a" },
                    }
                  : {}
              }
            >
              Decryption
            </Button>
          </Box>
          <TextField
            label={
              mode === "Encrypt"
                ? "Enter Plain Text to Encrypt"
                : "AES Encrypted Text"
            }
            value={tempInputText}
            onChange={(e) => setTempInputText(e.target.value)}
            variant="outlined"
            fullWidth
            margin="normal"
            inputProps={{ maxLength: 64 }}
          />
          <TextField
            label={
              mode === "Encrypt"
                ? "Enter Secret Key"
                : "Enter Secret Key used for Encryption"
            }
            value={tempKey}
            onChange={(e) => setTempKey(e.target.value)}
            variant="outlined"
            fullWidth
            margin="normal"
            error={!!keyError}
            helperText={keyError}
            inputProps={{
              maxLength: keySize === 128 ? 16 : keySize === 192 ? 24 : 32,
            }}
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
                setHasSubmitted,
                mode.toLowerCase()
              )
            }
            style={{ marginTop: "16px" }}
          >
            Submit
          </Button>
        </Box>
      )}
      {/* Show navigation buttons only after submit */}
      {hasSubmitted && (
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
              handlePreviousRound(currentRound, setCurrentRound, setCurrentStep)
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
                totalRounds,
                mode.toLowerCase()
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
                totalRounds,
                mode.toLowerCase()
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
          {/* Show Result button only when we're on the final round's last step (AddRoundKey) */}
          {currentRound === totalRounds && currentStep === "AddRoundKey" && (
            <Button
              variant="contained"
              color="secondary"
              style={{ margin: "8px", backgroundColor: "#7c5fe6" }}
              onClick={() => {
                // move past the last round so StepByStep shows the Result screen
                setCurrentRound(totalRounds + 1);
                setCurrentStep("Result");
              }}
            >
              Result
            </Button>
          )}
        </>
      )}
    </Box>
  );
}
