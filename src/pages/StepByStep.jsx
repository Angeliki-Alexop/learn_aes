import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const LightTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.white,
    color: "rgba(0, 0, 0, 0.87)",
    boxShadow: theme.shadows[1],
    fontSize: 15,
  },
}));
export const highlightColor = "rgba(128, 0, 128, "; // Purplish color (used by MatrixDisplay)
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
  generateDecryptStateMap,
} from "../utils/stepByStepHandlers";
import {
  padPKCS7,
  sBox,
  keyExpansion,
  unpadPKCS7,
} from "../utils/aes_manual_v2.js";
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
import FloatingInfo from "../components/FloatingInfo";
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
  const [tempInputError, setTempInputError] = useState("");

  const [keySize, setKeySize] = useState(128); // Now keySize is state
  const [stateMap, setStateMap] = useState(new Map());
  const [highlightedCell, setHighlightedCell] = useState(null); // State to track the highlighted cell
  const [highlightedCellValue, setHighlightedCellValue] = useState(""); // State to track the value of the highlighted cell
  const [highlightedColumnMixColumn, setHighlightedColumnMixColumn] =
    useState(null); // Track highlighted column index
  const [
    highlightedColumnValuesMixColumn,
    setHighlightedColumnValuesMixColumn,
  ] = useState([]); // Track values in highlighted column
  const [previousStepState, setPreviousStepState] = useState("");
  const [highlightedRowFixedMatrix, setHighlightedRowFixedMatrix] =
    useState(null);
  const algorithm = "ECB";
  const [mode, setMode] = useState("Encrypt");
  const [decryptFormat, setDecryptFormat] = useState("hex");

  const totalRounds = keySize === 128 ? 10 : keySize === 192 ? 12 : 14; // Determine total rounds based on key size

  // Listen for header-triggered reset events (clicking StepByStep in header)
  useEffect(() => {
    const resetHandler = () => {
      setCurrentRound(-2);
      setCurrentStep("Input");
      setHasSubmitted(false);
      setSidebarVisible(false);
      setRoundKeys([]);
      setStateMap(new Map());
      setHighlightedCell(null);
      setHighlightedCellValue("");
    };

    window.addEventListener("stepbystep-reset", resetHandler);
    return () => window.removeEventListener("stepbystep-reset", resetHandler);
  }, []);

  useEffect(() => {
    const roundSteps = stateMap.get(currentRound) || [];
    const stepIndex = roundSteps.findIndex((step) => step.step === currentStep);
    let prevState = "";

    // Compute initialState and paddedState for input summary logic
    let initialState;
    let paddedState;
    if (mode === "Decrypt") {
      try {
        if (decryptFormat === "hex") {
          const cleaned = inputText.replace(/\s+/g, "");
          initialState = cleaned.length
            ? cleaned.match(/.{1,2}/g).map((h) => parseInt(h, 16))
            : [];
        } else {
          const bin = atob(inputText || "");
          initialState = Array.from({ length: bin.length }, (_, i) =>
            bin.charCodeAt(i),
          );
        }
      } catch (e) {
        initialState = [];
      }
      paddedState = initialState.slice();
    } else {
      initialState = inputText.split("").map((char) => char.charCodeAt(0));
      paddedState = padPKCS7(initialState, 16);
    }

    if (stepIndex > 0) {
      prevState = roundSteps[stepIndex - 1]?.state || "";
    } else if (currentRound > 0) {
      const previousRoundSteps = stateMap.get(currentRound - 1) || [];
      const addRoundKeyStep = previousRoundSteps.find(
        (step) => step.step === "AddRoundKey",
      );
      prevState = addRoundKeyStep?.state || "";
    } else if (currentRound === 0) {
      prevState = toHex(paddedState);
    }

    setPreviousStepState(prevState);
  }, [currentRound, currentStep, stateMap, inputText, keySize]);

  const defaultKeyForSize = (size) => {
    if (size === 128) return "DefaultKey123456";
    if (size === 192) return "DefaultKeyForAES192Key!!";
    return "DefaultKeyForAES256Key0123456789";
  };

  const onFullSubmit = () => {
    // Do not submit if there's a validation error
    if (tempInputError) {
      setKeyError(tempInputError);
      return;
    }

    // For encryption ensure plaintext <= 16 chars
    if (mode === 'Encrypt' && tempInputText.length > 16) {
      setKeyError('Plaintext must be at most 16 characters');
      return;
    }

    handleSubmitButtonClick(
      tempKey,
      tempInputText,
      keySize,
      setKeyError,
      setInputText,
      setKey,
      setSidebarVisible,
      setRoundKeys,
      (sm) => setStateMap(sm),
      setHasSubmitted,
    );

    const totalRoundsLocal = keySize === 128 ? 10 : keySize === 192 ? 12 : 14;
    const expanded = keyExpansion(
      tempKey.split("").map((c) => c.charCodeAt(0)),
      keySize,
    );
    const rk = [];
    for (let i = 0; i <= totalRoundsLocal; i++)
      rk.push(expanded.slice(i * 16, (i + 1) * 16));

    if (mode === "Decrypt") {
      // Parse according to decryptFormat
      let cipherBytes = [];
      try {
        if (decryptFormat === "hex") {
          const cleaned = tempInputText.replace(/\s+/g, "");
          if (!/^[0-9a-fA-F]{32}$/.test(cleaned))
            throw new Error("Hex must be 32 hex chars");
          cipherBytes = cleaned.match(/.{1,2}/g).map((h) => parseInt(h, 16));
        } else {
          const bin = atob(tempInputText);
          cipherBytes = Array.from({ length: bin.length }, (_, i) =>
            bin.charCodeAt(i),
          );
          if (cipherBytes.length !== 16)
            throw new Error("Base64 must decode to 16 bytes");
        }
      } catch (e) {
        setKeyError(e.message);
        return;
      }

      const decryptMap = generateDecryptStateMap(
        cipherBytes,
        rk,
        totalRoundsLocal,
      );
      setStateMap(decryptMap);
    } else {
      const initialState = tempInputText
        .split("")
        .map((char) => char.charCodeAt(0));
      const padded = padPKCS7(initialState, 16);
      const encryptMap = generateStateMap(padded, rk, totalRoundsLocal);
      setStateMap(encryptMap);
    }
  };

  const toHex = (arr) => {
    return arr.map((byte) => byte.toString(16).padStart(2, "0")).join(" ");
  };

  const handleCellClick = (id, value, matrixId, rowIdx, colIdx) => {
    const roundSteps = stateMap.get(currentRound) || [];
    const stepIndex = roundSteps.findIndex((step) => step.step === currentStep);

    // Interpret input differently depending on mode for the Input Summary
    let initialState;
    let paddedState;
    if (mode === "Decrypt") {
      try {
        if (decryptFormat === "hex") {
          const cleaned = inputText.replace(/\s+/g, "");
          initialState = cleaned.length
            ? cleaned.match(/.{1,2}/g).map((h) => parseInt(h, 16))
            : [];
        } else {
          const bin = atob(inputText || "");
          initialState = Array.from({ length: bin.length }, (_, i) =>
            bin.charCodeAt(i),
          );
        }
      } catch (e) {
        initialState = [];
      }
      // ciphertext is already a single block; do not apply padding or show padded bytes
      paddedState = initialState.slice();
    } else {
      initialState = inputText.split("").map((char) => char.charCodeAt(0));
      paddedState = padPKCS7(initialState, 16);
    }
    // Used to reset highlights after we click a new cell
    // Remove highlight from all cells first
    const highlightedCells = document.querySelectorAll(
      ".highlighted, .highlighted_new",
    );
    highlightedCells.forEach((cell) => {
      cell.classList.remove("highlighted");
      cell.classList.remove("highlighted_new");
    });

    if (currentStep === "SubBytes") {
      if (matrixId === "previous") {
        setHighlightedCell(id);
        setHighlightedCellValue(value);
        const cellId = `current-${rowIdx}-${colIdx}`;
        const cell = document.getElementById(cellId);
        if (cell) {
          cell.classList.add("highlighted_new");
        }

        return;
      } else {
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
    if (
      (currentStep === "MixColumns" || currentStep === "InvMixColumns") &&
      matrixId === "previous"
    ) {
      // Do nothing if the clicked cell is from the previous state matrix during MixColumns/InvMixColumns step
      return;
    }
    if (currentStep === "MixColumns" || currentStep === "InvMixColumns") {
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
        const fixedMatrix =
          currentStep === "InvMixColumns"
            ? [
                ["0e", "0b", "0d", "09"],
                ["09", "0e", "0b", "0d"],
                ["0d", "09", "0e", "0b"],
                ["0b", "0d", "09", "0e"],
              ]
            : [
                ["02", "03", "01", "01"],
                ["01", "02", "03", "01"],
                ["01", "01", "02", "03"],
                ["03", "01", "01", "02"],
              ];
        const rowValues = fixedMatrix[rowIdx];
        console.log("Highlighted fixed matrix row values:", rowValues);

        // Get previous state matrix as 4x4 array
        const prevMatrix = formatAsMatrix(previousStepState);
        const colValues = prevMatrix.map((row) => row[colIdx]);
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
        highlightedCells.forEach((cell) => {
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
    highlightedCellValue,
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

    // Interpret input differently depending on mode for the Input Summary
    let initialState;
    let paddedState;
    if (mode === "Decrypt") {
      try {
        if (decryptFormat === "hex") {
          const cleaned = inputText.replace(/\s+/g, "");
          initialState = cleaned.length
            ? cleaned.match(/.{1,2}/g).map((h) => parseInt(h, 16))
            : [];
        } else {
          const bin = atob(inputText || "");
          initialState = Array.from({ length: bin.length }, (_, i) =>
            bin.charCodeAt(i),
          );
        }
      } catch (e) {
        initialState = [];
      }
      paddedState = initialState.slice();
    } else {
      initialState = inputText.split("").map((char) => char.charCodeAt(0));
      paddedState = padPKCS7(initialState, 16);
    }
    const resultState =
      stateMap.get(totalRounds)?.find((step) => step.step === "AddRoundKey")
        ?.state || "";

    // Prepare ShiftRows highlight coordinates for Next State. For InvShiftRows we
    // mirror the column indices so the highlighted cells match the inverse
    // (right-shift) visualization.
    const baseShiftHighlights = [
      [1, 3], // second row, col 3
      [2, 2], // third row, col 2
      [2, 3], // third row, col 3
      [3, 1], // fourth row, col 1
      [3, 2], // fourth row, col 2
      [3, 3], // fourth row, col 3
    ];

    const invShiftHighlights = baseShiftHighlights.map(([r, c]) => [r, 3 - c]);

    // If we're on the Input screen before the user has submitted, show
    // an introductory title and short description (based on selected mode).
    if (currentRound === -2 && currentStep === "Input" && !hasSubmitted) {
      const subtitle = mode === "Encrypt" ? "AES Encryption" : "AES Decryption";
      return (
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#661974",
            }}
          >
            Exploring the Advanced Encryption Standard (AES)
          </Typography>
          <Typography
            variant="body1"
            color="information"
            sx={{ maxWidth: 900, mx: "auto", mb: 2 }}
          >
            Welcome! This interactive tool will guide you through the AES
            algorithm step by step, making it easy to understand how each
            operation works. Use the AES Helper to get extra explanations, see
            what’s happening at every stage, and learn how to interact with the
            tool to explore all its features. Have fun learning and
            experimenting with AES!
          </Typography>
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 700, color: "text.primary", mb: 1 }}
          >
            {subtitle}
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              alignItems: "center",
            }}
          >
            <Typography variant="body1" color="information">
              Select the desired mode:
            </Typography>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Button
                variant={mode === "Encrypt" ? "contained" : "outlined"}
                color="primary"
                onClick={() => {
                  setMode("Encrypt");
                  setTempInputText("Test");
                  setTempKey(defaultKeyForSize(keySize));
                }}
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
                ENCRYPTION
              </Button>
              <Button
                variant={mode === "Decrypt" ? "contained" : "outlined"}
                color="primary"
                onClick={() => {
                  setMode("Decrypt");
                  setTempInputText("2aaeedcfd945964e2f4913d76b510257");
                  setTempKey(defaultKeyForSize(keySize));
                }}
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
                DECRYPTION
              </Button>
            </Box>
            {mode === "Decrypt" && (
              <Box
                sx={{ mt: 1, display: "flex", gap: 1, alignItems: "center" }}
              >
                <Typography variant="body2">Input format:</Typography>
                <Select
                  value={decryptFormat}
                  onChange={(e) => setDecryptFormat(e.target.value)}
                  size="small"
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value={"base64"}>Base64</MenuItem>
                  <MenuItem value={"hex"}>Hex</MenuItem>
                </Select>
              </Box>
            )}
            <Typography
              variant="body1"
              color="information"
              display="block"
              sx={{ mt: 1 }}
            >
              Select the desired Key Size:
            </Typography>
            <Box sx={{ mt: 1, width: 220 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="keysize-label">Key Size</InputLabel>
                <Select
                  labelId="keysize-label"
                  id="keysize-select"
                  value={keySize}
                  label="Key Size"
                  onChange={(e) => {
                    const newSize = Number(e.target.value);
                    setKeySize(newSize);
                    setTempKey(defaultKeyForSize(newSize));
                  }}
                >
                  <MenuItem value={128}>128 bits</MenuItem>
                  <MenuItem value={192}>192 bits</MenuItem>
                  <MenuItem value={256}>256 bits</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ width: "60%", maxWidth: 720, mt: 2 }}>
              <TextField
                label={
                  mode === "Encrypt"
                    ? "Plaintext (English)"
                    : "Ciphertext (Hex)"
                }
                value={tempInputText}
                onChange={(e) => {
                  const val = e.target.value;
                  if (mode === 'Encrypt') {
                    // limit plaintext to 16 characters
                    if (val.length > 16) {
                      setTempInputText(val.slice(0, 16));
                      setTempInputError('Plaintext must be at most 16 characters');
                    } else {
                      setTempInputText(val);
                      setTempInputError('');
                    }
                  } else {
                    // Decrypt mode: validate according to selected format
                    if (decryptFormat === 'hex') {
                      // allow only hex digits and optionally spaces; validate cleaned length
                      const cleaned = val.replace(/\s+/g, '');
                      if (/[^0-9a-fA-F\s]/.test(val)) {
                        setTempInputError('Only hexadecimal characters (0-9, A-F) are allowed');
                      } else if (cleaned.length > 32) {
                        setTempInputError('Hex input must be exactly 32 hex characters (16 bytes)');
                      } else if (cleaned.length !== 32) {
                        setTempInputError('Hex input must be exactly 32 hex characters (16 bytes)');
                      } else {
                        setTempInputError('');
                      }
                      // store as entered (spaces allowed)
                      setTempInputText(val);
                    } else {
                      // base64
                      setTempInputText(val);
                      try {
                        const bin = atob(val || '');
                        if (bin.length !== 16) {
                          setTempInputError('Base64 must decode to exactly 16 bytes');
                        } else {
                          setTempInputError('');
                        }
                      } catch (err) {
                        setTempInputError('Invalid Base64 string');
                      }
                    }
                  }
                }}
                variant="outlined"
                fullWidth
                margin="normal"
                error={Boolean(tempInputError)}
                helperText={tempInputError}
                inputProps={{ maxLength: mode === 'Encrypt' ? 16 : (decryptFormat === 'hex' ? 32 : 24) }}
              />
              <TextField
                label={
                  mode === "Encrypt"
                    ? "Key for AES (English)"
                    : "Key for AES (English)"
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
              <Box textAlign="center">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => onFullSubmit()}
                  sx={{ mt: 2 }}
                >
                  Submit
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      );
    }

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
          .join(""),
      );
    };

    const fixedMatrix = [
      ["02", "03", "01", "01"],
      ["01", "02", "03", "01"],
      ["01", "01", "02", "03"],
      ["03", "01", "01", "02"],
    ];

    if (currentRound === -2 && currentStep === "Input" && hasSubmitted) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Box sx={{ width: "100%", maxWidth: 920 }}>
            <Typography
              variant="h5"
              component="h2"
              align="center"
              gutterBottom
              sx={{
                fontWeight: 700,
                mb: 3,
              }}
            >
              Input Summary
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
                alignItems: "start",
                justifyContent: "center",
                mt: 2,
              }}
            >
              <Box
                sx={{
                  textAlign: "left",
                  border: "5px solid rgba(129, 18, 180, 0.08)",
                  borderRadius: 3,
                  p: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontWeight: 700 }}>
                    Plaintext (English)
                  </Typography>
                  <LightTooltip
                    title="The original plaintext message entered by the user"
                    placement="right-start"
                  >
                    <InfoOutlinedIcon fontSize="xsmall" color="action" />
                  </LightTooltip>
                </Box>
                <Typography>{inputText || "(empty)"}</Typography>

                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}
                >
                  <Typography sx={{ fontWeight: 700 }}>
                    Plaintext (Hex)
                  </Typography>
                  <LightTooltip
                    title="The hexadecimal representation of the plaintext"
                    placement="right-start"
                  >
                    <InfoOutlinedIcon fontSize="xsmall" color="action" />
                  </LightTooltip>
                </Box>
                <Typography sx={{ wordBreak: "break-word" }}>
                  {toHex(initialState)}
                </Typography>

                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}
                >
                  <Typography sx={{ fontWeight: 700 }}>
                    Padded plaintext (Hex)
                  </Typography>
                  <LightTooltip
                    title="The plaintext after PKCS#7 padding has been applied to match AES’s required block size (16 bytes) in hexadecimal format."
                    placement="top-start"
                  >
                    <InfoOutlinedIcon fontSize="xsmall" color="action" />
                  </LightTooltip>
                </Box>
                <Typography sx={{ wordBreak: "break-word" }}>
                  {toHex(paddedState)}
                </Typography>
              </Box>

              <Box
                sx={{
                  textAlign: "left",
                  border: "5px solid rgba(129, 18, 180, 0.08)",
                  borderRadius: 3,
                  p: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontWeight: 700 }}>
                    Key for AES (English)
                  </Typography>
                  <LightTooltip
                    title="The encryption key provided by the user for the AES encryption process"
                    placement="right-start"
                  >
                    <InfoOutlinedIcon fontSize="xsmall" color="action" />
                  </LightTooltip>
                </Box>
                <Typography>{key}</Typography>

                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}
                >
                  <Typography sx={{ fontWeight: 700 }}>
                    Key for AES (Hex)
                  </Typography>
                  <LightTooltip
                    title="The hexadecimal representation of the encryption key"
                    placement="top-start"
                  >
                    <InfoOutlinedIcon fontSize="xsmall" color="action" />
                  </LightTooltip>
                </Box>
                <Typography sx={{ wordBreak: "break-word" }}>
                  {toHex(key.split("").map((char) => char.charCodeAt(0)))}
                </Typography>

                {/* Commented out Cipher Mode info for simplicity. We can add it back later if Eui requests it.
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}
                >
                  <Typography sx={{ fontWeight: 700 }}>Cipher Mode</Typography>
                  <LightTooltip
                    title="AES block cipher mode being used (fixed)"
                    placement="right-start"
                  >
                    <InfoOutlinedIcon fontSize="xsmall" color="action" />
                  </LightTooltip>
                </Box>
                <Typography>{algorithm}</Typography> */}

                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}
                >
                  <Typography sx={{ fontWeight: 700 }}>
                    Operation mode
                  </Typography>
                  <LightTooltip
                    title="Encrypt or Decrypt mode selected by the user"
                    placement="right-start"
                  >
                    <InfoOutlinedIcon fontSize="xsmall" color="action" />
                  </LightTooltip>
                </Box>
                <Typography>{mode}</Typography>

                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}
                >
                  <Typography sx={{ fontWeight: 700 }}>Key size</Typography>
                  <LightTooltip
                    title="Selected key size in bits)"
                    placement="right-start"
                  >
                    <InfoOutlinedIcon fontSize="xsmall" color="action" />
                  </LightTooltip>
                </Box>
                <Typography>{keySize} bits</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      );
    } else if (currentRound === -1 && currentStep === "Key Expansion") {
      return (
        <Box>
          <Typography variant="h6" component="h2" align="center">
            Key Schedule - Key Expansion
          </Typography>
          {/* StepInfo removed. Floating info button available at bottom-right. */}
          <div className="key-expansion" style={{ marginTop: "24px" }}>
            <KeyExpansionMatrices
              roundKeys={roundKeys}
              toHex={toHex}
              keySize={keySize}
              mode={mode}
            />
          </div>
        </Box>
      );
    } else if (currentRound >= 0 && currentRound <= totalRounds) {
      // compute a display-friendly round label: in Decrypt mode we show totalRounds..0
      const displayRound =
        mode === "Decrypt" ? totalRounds - currentRound : currentRound;
      // select the correct round key index for display/use
      const roundKeyIndex =
        mode === "Decrypt" ? totalRounds - currentRound : currentRound;
      return (
        <Box>
          <Typography variant="h6" component="h2" align="center">
            Round {displayRound} - Step: {currentStep}
          </Typography>
          {/* Show plaintext (for Encrypt) or ciphertext (for Decrypt) under the heading */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 1, mb: 2 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                border: "1px solid rgba(129, 18, 180, 0.06)",
                borderRadius: 2,
                p: 2,
                minWidth: 320,
                maxWidth: "90%",
                background: "rgba(245, 246, 250, 0.6)",
              }}
            >
              {mode === "Encrypt" ? (
                <>
                  <Typography sx={{ fontWeight: 700 }}>Plaintext</Typography>
                  <Typography sx={{ wordBreak: "break-word", mt: 0.5, fontSize: "1rem" }}>
                    {inputText || "(empty)"}
                  </Typography>
                </>
              ) : (
                <>
                  <Typography sx={{ fontWeight: 700 }}>Ciphertext (Hex)</Typography>
                  <Typography sx={{ wordBreak: "break-word", mt: 0.5, fontSize: "0.95rem" }}>
                    {toHex(initialState)}
                  </Typography>
                </>
              )}
            </Box>
          </Box>
          {/* Step-specific information and interaction hints (StepInfo removed) */}
          <div
            className={`matrix-container ${
              currentStep === "ShiftRows" ? "shiftrows-step" : ""
            } ${currentStep === "MixColumns" ? "mixcolumns-step" : ""} ${
              currentStep === "AddRoundKey" ? "addroundkey-step" : ""
            }`}
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
              highlightedColumns={
                highlightedColumnMixColumn !== null
                  ? [highlightedColumnMixColumn]
                  : []
              }
              handleCellClick={handleCellClick}
              highlightedCellValue={highlightedCellValue}
            />
            {/* ShiftRows / InvShiftRows Table in the middle */}
            {(currentStep === "ShiftRows" ||
              currentStep === "InvShiftRows") && (
              <div className="matrix shiftrows-table">
                <table className="matrix-table">
                  <tbody>
                    {(() => {
                      const isInv = currentStep === "InvShiftRows";
                      // Convert previousStepState to 4x4 column-major matrix
                      const flat = previousStepState.split(" ").filter(Boolean);
                      // AES state is column-major: state[col][row]
                      const matrix = [0, 1, 2, 3].map((row) =>
                        [0, 1, 2, 3].map((col) => flat[col * 4 + row] || ""),
                      );
                      // Build the ShiftRows visualization (4x7)
                      return [0, 1, 2, 3].map((rowIdx) => (
                        <tr key={rowIdx}>
                          {[0, 1, 2, 3, 4, 5, 6].map((colIdx) => {
                            let cellValue = "";
                            // For inverse, mirror the column index horizontally so we can reuse the same placement logic
                            const colCheck = isInv ? 6 - colIdx : colIdx;
                            // Place the 4 values in shifted positions (visual sliding window)
                            if (colCheck === 3 - rowIdx)
                              cellValue = matrix[rowIdx][0];
                            else if (colCheck === 4 - rowIdx)
                              cellValue = matrix[rowIdx][1];
                            else if (colCheck === 5 - rowIdx)
                              cellValue = matrix[rowIdx][2];
                            else if (colCheck === 6 - rowIdx)
                              cellValue = matrix[rowIdx][3];

                            // Determine regions (outline is mirrored when inv)
                            const isOutlineRegion =
                              colCheck >= 3 && colCheck <= 6; // rightmost 4x4 in the checked coord system
                            const isShiftedOut = colCheck < 3 && !!cellValue; // values shifted outside the outline
                            const isEmptyInsideOutline =
                              isOutlineRegion && !cellValue; // gap left inside the outline

                            // Keep sizing in CSS; minimal inline style only
                            const baseStyle = {
                              padding: "6px 8px",
                              textAlign: "center",
                            };

                            // Outline cell: draw only the outer border of the 4x4 block
                            if (isOutlineRegion) {
                              const borderColor = "rgba(100,63,220,0.9)"; // purpleish outline
                              // Map back the edge checks to the displayed column indices
                              const displayLeft = isInv ? 0 : 3;
                              const displayRight = isInv ? 3 : 6;
                              const top =
                                rowIdx === 0
                                  ? `2px solid ${borderColor}`
                                  : "1px solid transparent";
                              const bottom =
                                rowIdx === 3
                                  ? `2px solid ${borderColor}`
                                  : "1px solid transparent";
                              const left =
                                colIdx === displayLeft
                                  ? `2px solid ${borderColor}`
                                  : "1px solid transparent";
                              const right =
                                colIdx === displayRight
                                  ? `2px solid ${borderColor}`
                                  : "1px solid transparent";

                              // purpleish background for EMPTY slots inside the outlined 4x4 (only these)
                              const emptyBg = isEmptyInsideOutline
                                ? "rgba(100,63,220,0.12)"
                                : "transparent";

                              return (
                                <td
                                  key={colIdx}
                                  className="shiftrows-cell shiftrows-outline-cell"
                                  style={{
                                    ...baseStyle,
                                    borderTop: top,
                                    borderBottom: bottom,
                                    borderLeft: left,
                                    borderRight: right,
                                    backgroundColor: emptyBg,
                                  }}
                                >
                                  {cellValue || ""}
                                </td>
                              );
                            }

                            // Outside area: DO NOT change background, only color the text for shifted-out values
                            const shiftedTextColor = isShiftedOut
                              ? "rgba(100,63,220,0.9)"
                              : undefined;

                            return (
                              <td
                                key={colIdx}
                                className="shiftrows-cell"
                                style={{
                                  ...baseStyle,
                                  color: shiftedTextColor,
                                  backgroundColor: "transparent",
                                }}
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
                <Typography
                  variant="caption"
                  align="center"
                  style={{ marginTop: 4 }}
                >
                  ShiftRows Table
                </Typography>
              </div>
            )}
            {/* Show S-Box between matrices only for SubBytes step */}
            {(currentStep === "SubBytes" || currentStep === "InvSubBytes") && (
              <div className="matrix sbox-matrix">
                <RenderSBox
                  sBox={sBox}
                  highlightedCellValue={highlightedCellValue}
                  title={
                    currentStep === "InvSubBytes" ? "Inverse S-Box" : "S-Box"
                  }
                  inverseLookup={currentStep === "InvSubBytes"}
                />
              </div>
            )}
            {currentStep === "MixColumns" && (
              <RenderFixedMatrix highlightedRow={highlightedRowFixedMatrix} />
            )}
            {currentStep === "InvMixColumns" && (
              <RenderFixedMatrix
                highlightedRow={highlightedRowFixedMatrix}
                matrix={[
                  ["0e", "0b", "0d", "09"],
                  ["09", "0e", "0b", "0d"],
                  ["0d", "09", "0e", "0b"],
                  ["0b", "0d", "09", "0e"],
                ]}
                title="Inverse Fixed Matrix"
              />
            )}

            {/* For AddRoundKey: show Round Key between Current State and Next State */}
            {currentStep === "AddRoundKey" && (
              <RenderMatrix
                hexString={toHex(roundKeys[roundKeyIndex] || [])}
                matrixId="roundKey"
                title="Round Key"
                highlightRows={false}
                highlightColumns={false}
                highlightedCell={highlightedCell}
                handleCellClick={handleCellClick}
                highlightedCellValue={highlightedCellValue}
              />
            )}

            <RenderMatrix
              hexString={stepState}
              matrixId="current"
              title="Next State"
              highlightRows={false}
              // Highlight columns for both ShiftRows and InvShiftRows so the
              // visual column markers remain consistent in either direction.
              highlightColumns={
                currentStep === "ShiftRows" || currentStep === "InvShiftRows"
              }
              highlightedCell={highlightedCell}
              handleCellClick={handleCellClick}
              highlightedCellValue={highlightedCellValue}
              shiftHighlights={
                currentStep === "ShiftRows"
                  ? baseShiftHighlights
                  : currentStep === "InvShiftRows"
                    ? invShiftHighlights
                    : []
              }
            />
          </div>
          <Box className="info-container" mt={2}>
            {/* removed the below typography that generates info when clicking any cell in current step */}
            {/* <Typography variant="body1" component="p" align="center">
              {generateExplanation(
                currentRound,
                currentStep,
                highlightedCell,
                highlightedCellValue
              )}
            </Typography> */}
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
                roundKeyIndex={roundKeyIndex}
                toHex={toHex}
              />
            )}
            {currentStep === "MixColumns" && (
              <MixColumnsExplanations
                selectedCellValue={highlightedCellValue}
                highlightedFixedMatrixRow={
                  highlightedRowFixedMatrix !== null
                    ? [
                        ["02", "03", "01", "01"],
                        ["01", "02", "03", "01"],
                        ["01", "01", "02", "03"],
                        ["03", "01", "01", "02"],
                      ][highlightedRowFixedMatrix]
                    : []
                }
                highlightedPrevStateColumn={highlightedColumnValuesMixColumn}
              />
            )}
            {currentStep === "InvMixColumns" && (
              <MixColumnsExplanations
                selectedCellValue={highlightedCellValue}
                highlightedFixedMatrixRow={
                  highlightedRowFixedMatrix !== null
                    ? [
                        ["0e", "0b", "0d", "09"],
                        ["09", "0e", "0b", "0d"],
                        ["0d", "09", "0e", "0b"],
                        ["0b", "0d", "09", "0e"],
                      ][highlightedRowFixedMatrix]
                    : []
                }
                highlightedPrevStateColumn={highlightedColumnValuesMixColumn}
                invMode={true}
              />
            )}
          </Box>
        </Box>
      );
    } else {
      return (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Box sx={{ width: "100%", maxWidth: 920 }}>
            <Typography
              variant="h5"
              component="h2"
              align="center"
              gutterBottom
              sx={{ fontWeight: 700, mb: 3 }}
            >
              Result Summary
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
                alignItems: "start",
                justifyContent: "center",
                mt: 2,
              }}
            >
              <Box
                sx={{
                  textAlign: "left",
                  border: "5px solid rgba(129, 18, 180, 0.08)",
                  borderRadius: 3,
                  p: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontWeight: 700 }}>
                    Plaintext (English)
                  </Typography>
                  <LightTooltip
                    title="The original plaintext message entered by the user"
                    placement="right-start"
                  >
                    <InfoOutlinedIcon fontSize="xsmall" color="action" />
                  </LightTooltip>
                </Box>
                <Typography sx={{ wordBreak: "break-word" }}>
                  {inputText || "(empty)"}
                </Typography>

                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}
                >
                  <Typography sx={{ fontWeight: 700 }}>
                    Padded Plaintext (Hex)
                  </Typography>
                  <LightTooltip
                    title="Plaintext after PKCS#7 padding, in hexadecimal format"
                    placement="right-start"
                  >
                    <InfoOutlinedIcon fontSize="xsmall" color="action" />
                  </LightTooltip>
                </Box>
                <Typography sx={{ wordBreak: "break-word" }}>
                  {toHex(paddedState)}
                </Typography>

                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}
                >
                  <Typography sx={{ fontWeight: 700 }}>
                    Key for AES (English)
                  </Typography>
                  <LightTooltip
                    title="The encryption key provided by the user"
                    placement="right-start"
                  >
                    <InfoOutlinedIcon fontSize="xsmall" color="action" />
                  </LightTooltip>
                </Box>
                <Typography sx={{ wordBreak: "break-word" }}>{key}</Typography>

                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}
                >
                  <Typography sx={{ fontWeight: 700 }}>
                    Key for AES (Hex)
                  </Typography>
                  <LightTooltip
                    title="The hexadecimal representation of the encryption key"
                    placement="right-start"
                  >
                    <InfoOutlinedIcon fontSize="xsmall" color="action" />
                  </LightTooltip>
                </Box>
                <Typography sx={{ wordBreak: "break-word" }}>
                  {toHex(key.split("").map((char) => char.charCodeAt(0)))}
                </Typography>
              </Box>

              <Box
                sx={{
                  textAlign: "left",
                  border: "5px solid rgba(129, 18, 180, 0.08)",
                  borderRadius: 3,
                  p: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontWeight: 700 }}>
                    Ciphertext (Hex)
                  </Typography>
                  <LightTooltip
                    title="AES encrypted output in hexadecimal"
                    placement="right-start"
                  >
                    <InfoOutlinedIcon fontSize="xsmall" color="action" />
                  </LightTooltip>
                </Box>
                <Typography sx={{ wordBreak: "break-word" }}>
                  {resultState}
                </Typography>

                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}
                >
                  <Typography sx={{ fontWeight: 700 }}>
                    Ciphertext (Base64)
                  </Typography>
                  <LightTooltip
                    title="AES encrypted output encoded in Base64"
                    placement="right-start"
                  >
                    <InfoOutlinedIcon fontSize="xsmall" color="action" />
                  </LightTooltip>
                </Box>
                <Typography sx={{ wordBreak: "break-word" }}>
                  {hexToBase64(resultState)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      );
    }
  };

  useEffect(() => {
    // Reset highlighted cell when step or round changes
    const highlightedCells = document.querySelectorAll(
      ".highlighted, .highlighted_new",
    );
    highlightedCells.forEach((cell) => {
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
          mode={mode}
          setMode={setMode}
          decryptFormat={decryptFormat}
          onFullSubmit={onFullSubmit}
          stateMap={stateMap}
          showInitialControls={false}
        />
        <FloatingInfo
          keySize={keySize}
          currentStep={currentStep}
          hasSubmitted={hasSubmitted}
        />
      </div>
    </div>
  );
}

export default StepByStep;
