import React, { useState, useEffect } from "react";
import { Typography, Box, IconButton } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
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
import {
  formatAsMatrix,
  toHex,
  hexToText,
  hexToBase64,
} from "../utils/stepByStepUtils";
import { RenderMatrix, RenderFixedMatrix, RenderSBox } from "./MatrixDisplay";
import { RenderExplanation } from "./StepExplanations";
import { StepNavigation } from "./StepNavigation";
import KeyExpansionMatrices from "./KeyExpansionMatrices";
import "./../styles/StepByStep.css";
import MixColumnsExplanations from "./MixColumnsExplanations";

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

  const [keySize, setKeySize] = useState(128); // Now keySize is state
  const [stateMap, setStateMap] = useState(new Map());
  const [highlightedCell, setHighlightedCell] = useState(null); // State to track the highlighted cell
  const [highlightedCellValue, setHighlightedCellValue] = useState(""); // State to track the value of the highlighted cell
  const [highlightedColumnMixColumn, setHighlightedColumnMixColumn] = useState(null); // Track highlighted column index
  const [highlightedColumnValuesMixColumn, setHighlightedColumnValuesMixColumn] = useState([]); // Track values in highlighted column
  const [previousStepState, setPreviousStepState] = useState("");
  const [highlightedRowFixedMatrix, setHighlightedRowFixedMatrix] = useState(null);
  const algorithm = "ECB";
  const mode = "Encode";

  const totalRounds = keySize === 128 ? 10 : keySize === 192 ? 12 : 14; // Determine total rounds based on key size
  
  useEffect(() => {
    // Reset MixColumns highlights when step or round changes
    setHighlightedColumnMixColumn(null);
    setHighlightedRowFixedMatrix(null);
    setHighlightedColumnValuesMixColumn([]);
  }, [currentStep, currentRound]);

  // Set default key when keySize changes
  useEffect(() => {
    let defaultKey = "";
    if (keySize === 128) defaultKey = "DefaultKey123456"; // 16 chars
    else if (keySize === 192) defaultKey = "DefaultKeyForAES192Key!!"; // 24 chars
    else if (keySize === 256) defaultKey = "DefaultKeyForAES256Key0123456789"; // 32 chars
    setKey(defaultKey);
    setTempKey(defaultKey);
  }, [keySize]);

  // Update previousStepState whenever round/step/stateMap/inputText/keySize changes
  useEffect(() => {
    const roundSteps = stateMap.get(currentRound) || [];
    const stepIndex = roundSteps.findIndex((step) => step.step === currentStep);
    let prevState = "";

    const initialState = inputText.split("").map((char) => char.charCodeAt(0));
    const paddedState = padPKCS7(initialState, 16);

    if (stepIndex > 0) {
      prevState = roundSteps[stepIndex - 1]?.state || "";
    } else if (currentRound > 0) {
      const previousRoundSteps = stateMap.get(currentRound - 1) || [];
      const addRoundKeyStep = previousRoundSteps.find(
        (step) => step.step === "AddRoundKey"
      );
      prevState = addRoundKeyStep?.state || "";
    } else if (currentRound === 0) {
      prevState = toHex(paddedState);
    }

    setPreviousStepState(prevState);
  }, [currentRound, currentStep, stateMap, inputText, keySize]);

  const toHex = (arr) => {
    return arr.map((byte) => byte.toString(16).padStart(2, "0")).join(" ");
  };

  const handleCellClick = (id, value, matrixId, rowIdx, colIdx) => {
    const roundSteps = stateMap.get(currentRound) || [];
    const stepIndex = roundSteps.findIndex((step) => step.step === currentStep);

    const initialState = inputText.split("").map((char) => char.charCodeAt(0));
    const paddedState = padPKCS7(initialState, 16);
    // Used to reset highlights after we click a new cell
    // Remove highlight from all cells first
    const highlightedCells = document.querySelectorAll(".highlighted, .highlighted_new");
      highlightedCells.forEach(cell => {
      cell.classList.remove("highlighted");
      cell.classList.remove("highlighted_new");
    });

    if (currentStep === "SubBytes") {
      if( matrixId === "previous" ){
        setHighlightedCell(id);
        setHighlightedCellValue(value);
        const cellId = `current-${rowIdx}-${colIdx}`;
        const cell = document.getElementById(cellId);
        if (cell) {
          cell.classList.add("highlighted_new"); 
        }

        return;
      }
      else{
            // Get the corresponding cell from the previous state matrix
        
        const prevId = `previous-${rowIdx}-${colIdx}`;
        const prevMatrix = formatAsMatrix(previousStepState);
        const prevValue = prevMatrix[rowIdx][colIdx];
        setHighlightedCell(prevId);
        setHighlightedCellValue(prevValue);
        const cellId = `current-${rowIdx}-${colIdx}`;
        const cell = document.getElementById(cellId);
        if (cell) {
          cell.classList.add("highlighted_new"); 
        }

        return;
      }
    }
    if (currentStep === "MixColumns" && matrixId === "previous") {
      // Do nothing if the clicked cell is from the previous state matrix during MixColumns step
      return;
    }
    if (currentStep === "MixColumns") {
      if (matrixId === "previous") {
        return;
      }
      if (matrixId === "current") {
        setHighlightedCell(id);
        setHighlightedCellValue(value);
        setHighlightedColumnMixColumn(colIdx);

        // Highlight row in fixed matrix
        setHighlightedRowFixedMatrix(rowIdx);

        // Log the values of the highlighted row in the fixed matrix
        const fixedMatrix = [
          ["02", "03", "01", "01"],
          ["01", "02", "03", "01"],
          ["01", "01", "02", "03"],
          ["03", "01", "01", "02"],
        ];
        const rowValues = fixedMatrix[rowIdx];
        console.log("Highlighted fixed matrix row values:", rowValues);

        // Get previous state matrix as 4x4 array
        const prevMatrix = formatAsMatrix(previousStepState);
        const colValues = prevMatrix.map(row => row[colIdx]);
        setHighlightedColumnValuesMixColumn(colValues);
        console.log("Highlighted column values:", colValues);
        return;
      }
    }

    // Default cell highlight logic
    const cell = document.getElementById(id);
    if (highlightedCell === id) {
      // If the clicked cell is already highlighted, remove the highlight
      if (cell) {
        cell.classList.remove("highlighted");
      }
      setHighlightedCell(null);
      setHighlightedCellValue("");
    } else {
      if (highlightedCell) {
        const highlightedCells = document.querySelectorAll(".highlighted");
        highlightedCells.forEach(cell => {
          cell.classList.remove("highlighted");
        });
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
          <div className="key-expansion" style={{ marginTop: "24px" }}>
            <KeyExpansionMatrices roundKeys={roundKeys} toHex={toHex} />
          </div>
        </Box>
      );
    } else if (currentRound >= 0 && currentRound <= totalRounds) {
      return (
        <Box>
          <Typography variant="h6" component="h2" align="center">
            Round {currentRound} - Step: {currentStep}
          </Typography>
          <div
            className="matrix-container"
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap", 
              alignItems: "flex-start",
              justifyContent: "space-between",
              width: "100%",
              gap: "32px", // Optional: adjust spacing between items
            }}
          >
            <RenderMatrix
              hexString={previousStepState}
              matrixId="previous"
              title="Current State"
              highlightRows={currentStep === "ShiftRows"}
              highlightColumns={false}
              highlightedCell={highlightedCell}
              highlightedColumns={highlightedColumnMixColumn !== null ? [highlightedColumnMixColumn] : []}
              handleCellClick={handleCellClick}
              highlightedCellValue={highlightedCellValue}
            />
            {/* ShiftRows Table in the middle */}
            {currentStep === "ShiftRows" && (
            <div className="matrix shiftrows-table">
              <table className="matrix-table">
                <tbody>
                  {(() => {
                    // Convert previousStepState to 4x4 column-major matrix
                    const flat = previousStepState.split(" ").filter(Boolean);
                    // AES state is column-major: state[col][row]
                    const matrix = [0, 1, 2, 3].map(row =>
                      [0, 1, 2, 3].map(col => flat[col * 4 + row] || "")
                    );
                    // Build the ShiftRows visualization (4x7)
                    return [0, 1, 2, 3].map(rowIdx => (
                      <tr key={rowIdx}>
                        {[0, 1, 2, 3, 4, 5, 6].map((colIdx) => {
                          let cellValue = "";
                          // Place the 4 values in shifted positions (visual sliding window)
                          if (colIdx === 3 - rowIdx) cellValue = matrix[rowIdx][0];
                          else if (colIdx === 4 - rowIdx) cellValue = matrix[rowIdx][1];
                          else if (colIdx === 5 - rowIdx) cellValue = matrix[rowIdx][2];
                          else if (colIdx === 6 - rowIdx) cellValue = matrix[rowIdx][3];

                          // Now highlight the rightmost 4x4 region (columns 3..6) with an outline only
                          const isOriginalRegion = colIdx >= 3 && colIdx <= 6;
                          const baseStyle = {
                            padding: "6px 8px",
                            textAlign: "center",
                            minWidth: 16,
                            height: 30,
                          };

                          if (isOriginalRegion) {
                            // draw only the outer border of the 4x4 block
                            const borderColor = "rgba(100,63,220,0.9)";
                            const top = rowIdx === 0 ? `2px solid ${borderColor}` : "1px solid transparent";
                            const bottom = rowIdx === 3 ? `2px solid ${borderColor}` : "1px solid transparent";
                            const left = colIdx === 3 ? `2px solid ${borderColor}` : "1px solid transparent";
                            const right = colIdx === 6 ? `2px solid ${borderColor}` : "1px solid transparent";
                            return (
                              <td
                                key={colIdx}
                                style={{
                                  ...baseStyle,
                                  borderTop: top,
                                  borderBottom: bottom,
                                  borderLeft: left,
                                  borderRight: right,
                                  backgroundColor: "transparent" // no fill, outline only
                                }}
                              >
                                {cellValue || ""}
                              </td>
                            );
                          }

                          const normalCellStyle = { ...baseStyle, border: "1px solid #e6e6e6" };

                          return (
                            <td
                              key={colIdx}
                              style={normalCellStyle}
                            >
                              {cellValue || ""}
                            </td>
                          );
                        })}
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
              <Typography variant="caption" align="center" style={{ marginTop: 4 }}>
                ShiftRows Table
              </Typography>
            </div>
          )}
            {/* Show S-Box between matrices only for SubBytes step */}
            {currentStep === "SubBytes" && (
              <div className="matrix sbox-matrix">
                <RenderSBox
                  sBox={sBox}
                  highlightedCellValue={highlightedCellValue}
                />
              </div>
            )}
            {currentStep === "MixColumns" && (
              <RenderFixedMatrix highlightedRow={highlightedRowFixedMatrix} />
            )}
            <RenderMatrix
              hexString={stepState}
              matrixId="current"
              title="Next State"
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
            {/* {currentStep === "SubBytes" && (
              <RenderSBox
                sBox={sBox}
                highlightedCellValue={highlightedCellValue}
              />
            )} */}
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
            {currentStep === "MixColumns" && (
              <MixColumnsExplanations
                selectedCellValue={highlightedCellValue}
                highlightedFixedMatrixRow={highlightedRowFixedMatrix !== null ? [
                  ["02", "03", "01", "01"],
                  ["01", "02", "03", "01"],
                  ["01", "01", "02", "03"],
                  ["03", "01", "01", "02"],
                ][highlightedRowFixedMatrix] : []}
                highlightedPrevStateColumn={highlightedColumnValuesMixColumn}
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
  const highlightedCells = document.querySelectorAll(".highlighted, .highlighted_new");
  highlightedCells.forEach(cell => {
    cell.classList.remove("highlighted");
    cell.classList.remove("highlighted_new");
  });
  setHighlightedCell(null);
  setHighlightedCellValue("");
}, [currentRound, currentStep, stateMap, inputText, keySize]);

  return (
    <div
      className="stepbystep-container"
      style={{ display: "flex", flexDirection: "row", position: "relative" }}
    >
      {/* Sidebar and toggle button only after submit */}
      {hasSubmitted && (
        <>
          {sidebarVisible && (
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "stretch",
              }}
            >
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
                  position: "absolute",
                  left: 232, // 200px (width) + 16px (padding left) + 16px (padding right) of sidebar
                  top: 16,
                  zIndex: 100,
                  color: "#643fdc",
                  background: "rgba(213,0,125,0.08)",
                  borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(213,0,125,0.08)",
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
                position: "absolute",
                left: 0,
                top: 16,
                zIndex: 100,
                color: "#643fdc",
                background: "rgba(213,0,125,0.08)",
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(213,0,125,0.08)",
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
          setKeySize={setKeySize}
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
          hasSubmitted={hasSubmitted}
        />
      </div>
    </div>
  );
}

export default StepByStep;