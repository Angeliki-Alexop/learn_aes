import React, { useState, useEffect } from "react";
import { Typography, Box, IconButton } from "@mui/material";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Sidebar from "../components/Sidebar";
import {
  handleSubmitButtonClick,
  handleNextRound,
  handlePreviousRound,
  handleNextStep,
  handlePreviousStep,
  handleStepClick,
  handleFinalRound,
  handleInput,
  generateStateMap,
} from "../utils/stepByStepHandlers";
import { padPKCS7, sBox } from "../utils/aes_manual_v2.js";
import { formatAsMatrix, toHex, hexToText, hexToBase64 } from "../utils/stepByStepUtils";
import { RenderMatrix, RenderFixedMatrix, RenderSBox } from "./MatrixDisplay";
import { RenderExplanation } from "./StepExplanations";
import { StepNavigation } from "./StepNavigation";
import "./../styles/StepByStep.css";

export const highlightColor = "rgba(128, 0, 128, "; // Purplish color

const steps = ["SubBytes", "ShiftRows", "MixColumns", "AddRoundKey"];
const finalRoundSteps = ["SubBytes", "ShiftRows", "AddRoundKey"];




function StepByStep() {
  const [currentRound, setCurrentRound] = useState(-2); // Start from -2 to include Input and KeySchedule
  const [currentStep, setCurrentStep] = useState("Input");
  const [roundKeys, setRoundKeys] = useState([]);
  const [inputText, setInputText] = useState("Test");
  const [key, setKey] = useState("DefaultKey123456");
  const [currentState, setCurrent] = useState([]);
  const [newState, setNewState] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(false); // Sidebar hidden by default
  const [hasSubmitted, setHasSubmitted] = useState(false); // Track if user has submitted input. Usefull to hide sidebar toggle button
  const [keyError, setKeyError] = useState("");
  const [tempInputText, setTempInputText] = useState(inputText);
  const [tempKey, setTempKey] = useState(key);

  const [stateMap, setStateMap] = useState(new Map());
  const [highlightedCell, setHighlightedCell] = useState(null); // State to track the highlighted cell
  const [highlightedCellValue, setHighlightedCellValue] = useState(""); // State to track the value of the highlighted cell
  const algorithm = "ECB";
  const keySize = 128; // Change this value to 192 or 256 to test different key sizes
  const mode = "Encode";

  const totalRounds = keySize === 128 ? 10 : keySize === 192 ? 12 : 14; // Determine total rounds based on key size

  const toHex = (arr) => {
    return arr.map((byte) => byte.toString(16).padStart(2, "0")).join(" ");
  };

  const handleCellClick = (id, value, matrixId) => {
    const roundSteps = stateMap.get(currentRound) || [];
    const stepIndex = roundSteps.findIndex((step) => step.step === currentStep);

    if (currentStep === "SubBytes" && matrixId === "current") {
      // Do nothing if the clicked cell is from the current state matrix during SubBytes step
      return;
    }

    console.log(id);
    const cell = document.getElementById(id);
    if (highlightedCell === id) {
      // If the clicked cell is already highlighted, remove the highlight
      if (cell) {
        cell.classList.remove("highlighted");
      }
      setHighlightedCell(null);
      setHighlightedCellValue("");
    } else {
      // If another cell is highlighted, remove its highlight
      if (highlightedCell) {
        const previousCell = document.getElementById(highlightedCell);
        if (previousCell) {
          previousCell.classList.remove("highlighted");
        }
      }
      // Highlight the clicked cell
      if (cell) {
        cell.classList.add("highlighted");
      }
      setHighlightedCell(id);
      setHighlightedCellValue(value);
    }
  };

  const generateExplanation = (
    currentRound,
    currentStep,
    highlightedCell,
    highlightedCellValue
  ) => {
    if (highlightedCell && highlightedCell.startsWith("current")) {
      return `Round ${currentRound}, Step ${currentStep}: Selected Cell Value: ${highlightedCellValue}`;
    }
    //return `Round ${currentRound}, Step ${currentStep}: No Cell Selected`;
  };

  const renderContent = () => {
    const roundSteps = stateMap.get(currentRound) || [];
    const stepIndex = roundSteps.findIndex((step) => step.step === currentStep);
    const stepState = roundSteps[stepIndex]?.state || "";
    let previousStepState = "";

    const initialState = inputText.split("").map((char) => char.charCodeAt(0));
    const paddedState = padPKCS7(initialState, 16);
    const resultState =
      stateMap.get(totalRounds)?.find((step) => step.step === "AddRoundKey")
        ?.state || "";

    const hexToText = (hex) => {
      return hex
        .split(" ")
        .map((byte) => String.fromCharCode(parseInt(byte, 16)))
        .join("");
    };

    const hexToBase64 = (hex) => {
      return btoa(
        hex
          .split(" ")
          .map((byte) => String.fromCharCode(parseInt(byte, 16)))
          .join("")
      );
    };

    if (stepIndex > 0) {
      previousStepState = roundSteps[stepIndex - 1]?.state || "";
    } else if (currentRound > 0) {
      const previousRoundSteps = stateMap.get(currentRound - 1) || [];
      const addRoundKeyStep = previousRoundSteps.find(
        (step) => step.step === "AddRoundKey"
      );
      previousStepState = addRoundKeyStep?.state || "";
    } else if (currentRound === 0) {
      previousStepState = toHex(paddedState);
    }

    const fixedMatrix = [
      ["02", "03", "01", "01"],
      ["01", "02", "03", "01"],
      ["01", "01", "02", "03"],
      ["03", "01", "01", "02"],
    ];




    if (currentRound === -2 && currentStep === "Input") {
      return (
        <Box>
          <Typography variant="h6" component="h2" align="center">
            Input Values
          </Typography>
          <Typography variant="body1" component="p" align="center">
            Text: {inputText}
          </Typography>
          <Typography variant="body1" component="p" align="center">
            Text (Hex): {toHex(initialState)}
          </Typography>
          <Typography variant="body1" component="p" align="center">
            Padded Text (Hex): {toHex(paddedState)}
          </Typography>
          <Typography variant="body1" component="p" align="center">
            Key: {key}
          </Typography>
          <Typography variant="body1" component="p" align="center">
            Key (Hex): {toHex(key.split("").map((char) => char.charCodeAt(0)))}
          </Typography>
          <Typography variant="body1" component="p" align="center">
            Algorithm: {algorithm}
          </Typography>
          <Typography variant="body1" component="p" align="center">
            Key Size: {keySize} bits
          </Typography>
          <Typography variant="body1" component="p" align="center">
            Mode: {mode}
          </Typography>
        </Box>
      );
    } else if (currentRound === -1 && currentStep === "Key Expansion") {
      return (
        <Box>
          <Typography variant="h6" component="h2" align="center">
            Key Schedule - Key Expansion
          </Typography>
          <Typography variant="body1" component="p" align="center">
            Input Key: {toHex(key.split("").map((char) => char.charCodeAt(0)))}
          </Typography>
          {roundKeys.map((roundKey, index) => (
            <Typography
              key={index}
              variant="body1"
              component="p"
              align="center"
            >
              Round {index} Key: {toHex(roundKey)}
            </Typography>
          ))}
        </Box>
      );
    } else if (currentRound >= 0 && currentRound <= totalRounds) {
      return (
        <Box>
          <Typography variant="h6" component="h2" align="center">
            Round {currentRound} - Step: {currentStep}
          </Typography>
          <div className="matrix-container">
            <RenderMatrix
              hexString={previousStepState}
              matrixId="previous"
              title="Previous State"
              highlightRows={currentStep === "ShiftRows"}
              highlightColumns={false}
              highlightedCell={highlightedCell}
              handleCellClick={handleCellClick}
              highlightedCellValue={highlightedCellValue}
            />
            {currentStep === "MixColumns" && <RenderFixedMatrix />}
            <RenderMatrix
              hexString={stepState}
              matrixId="current"
              title="Current State"
              highlightRows={false}
              highlightColumns={currentStep === "ShiftRows"}
              highlightedCell={highlightedCell}
              handleCellClick={handleCellClick}
              highlightedCellValue={highlightedCellValue}
            />
            {currentStep === "AddRoundKey" && (
              <RenderMatrix
                hexString={toHex(roundKeys[currentRound])}
                matrixId="roundKey"
                title="Round Key"
                highlightRows={false}
                highlightColumns={false}
                highlightedCell={highlightedCell}
                handleCellClick={handleCellClick}
                highlightedCellValue={highlightedCellValue}
              />
            )}
          </div>
          <Box className="info-container" mt={2}>
            <Typography variant="body1" component="p" align="center">
              {generateExplanation(
                currentRound,
                currentStep,
                highlightedCell,
                highlightedCellValue
              )}
            </Typography>
            {currentStep === "SubBytes" && (
              <RenderSBox sBox={sBox} highlightedCellValue={highlightedCellValue} />
            )}
            {currentStep === "AddRoundKey" && (
              <RenderExplanation
                currentStep={currentStep}
                highlightedCell={highlightedCell}
                previousStepState={previousStepState}
                roundKeys={roundKeys}
                currentRound={currentRound}
                toHex={toHex}
              />
            )}
          </Box>
        </Box>
      );
    } else {
      return (
        <Box>
          <Typography variant="h6" component="h2" align="center">
            Result
          </Typography>
          <Typography variant="body1" component="p" align="center">
            Input Text Padded (Hex): {toHex(paddedState)}
          </Typography>
          <Typography variant="body1" component="p" align="center">
            Input Text Padded: {hexToText(toHex(paddedState))}
          </Typography>
          <Typography variant="body1" component="p" align="center">
            Key (Hex): {toHex(key.split("").map((char) => char.charCodeAt(0)))}
          </Typography>
          <Typography variant="body1" component="p" align="center">
            Result (Hex): {resultState}
          </Typography>
          <Typography variant="body1" component="p" align="center">
            Result (Base64): {hexToBase64(resultState)}
          </Typography>
        </Box>
      );
    }
  };

  useEffect(() => {
    // Reset highlighted cell when step or round changes
    if (highlightedCell) {
      const previousCell = document.getElementById(highlightedCell);
      if (previousCell) {
        previousCell.classList.remove("highlighted");
      }
      setHighlightedCell(null);
      setHighlightedCellValue("");
    }
  }, [currentRound, currentStep]);

  return (
    <div className="stepbystep-container" style={{ display: 'flex', flexDirection: 'row', position: 'relative' }}>
      {/* Sidebar and toggle button only after submit */}
      {hasSubmitted && (
        <>
          {sidebarVisible && (
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch' }}>
              <Sidebar
                currentRound={currentRound}
                currentStep={currentStep}
                inputText={inputText}
                aeskey={key}
                algorithm={algorithm}
                keySize={keySize}
                mode={mode}
                setCurrentRound={setCurrentRound}
                setCurrentStep={setCurrentStep}
                handleStepClick={(round, step) =>
                  handleStepClick(round, step, setCurrentRound, setCurrentStep)
                }
              />
              {/* Hide button at right edge of sidebar */}
              <IconButton
                aria-label="hide sidebar"
                onClick={() => setSidebarVisible(false)}
                style={{
                  position: 'absolute',
                  left:232, // 200px (width) + 16px (padding left) + 16px (padding right) of sidebar
                  top: 16,
                  zIndex: 100,
                  color: '#643fdc',
                  background: 'rgba(213,0,125,0.08)',
                  borderRadius: 8,
                  boxShadow: '0 2px 8px rgba(213,0,125,0.08)',
                }}
                size="small"
              >
                <ChevronLeftIcon />
              </IconButton>
            </div>
          )}
          {/* Show button when sidebar is hidden */}
          {!sidebarVisible && (
            <IconButton
              aria-label="show sidebar"
              onClick={() => setSidebarVisible(true)}
              style={{
                position: 'absolute',
                left: 0,
                top: 16,
                zIndex: 100,
                color: '#643fdc',
                background: 'rgba(213,0,125,0.08)',
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(213,0,125,0.08)',
              }}
              size="small"
            >
              <ChevronRightIcon />
            </IconButton>
          )}
        </>
      )}
      {/* Main content */}
      <div className="content responsive-content">
        {renderContent()}
        <StepNavigation
          currentRound={currentRound}
          currentStep={currentStep}
          keyError={keyError}
          tempInputText={tempInputText}
          setTempInputText={setTempInputText}
          tempKey={tempKey}
          setTempKey={setTempKey}
          handleSubmitButtonClick={handleSubmitButtonClick}
          keySize={keySize}
          setKeyError={setKeyError}
          setInputText={setInputText}
          setKey={setKey}
          setSidebarVisible={setSidebarVisible}
          setRoundKeys={setRoundKeys}
          setStateMap={setStateMap}
          sidebarVisible={sidebarVisible}
          handleInput={handleInput}
          setCurrentRound={setCurrentRound}
          setCurrentStep={setCurrentStep}
          handleStepClick={handleStepClick}
          handlePreviousRound={handlePreviousRound}
          handlePreviousStep={handlePreviousStep}
          totalRounds={totalRounds}
          handleNextStep={handleNextStep}
          handleNextRound={handleNextRound}
          handleFinalRound={handleFinalRound}
          setHasSubmitted={setHasSubmitted}
        />
      </div>
    </div>
  );
}

export default StepByStep;