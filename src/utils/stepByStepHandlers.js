import {
  keyExpansion,
  padPKCS7,
  addRoundKey,
  subBytes,
  shiftRows,
  mixColumns,
  invSubBytes,
  invShiftRows,
  invMixColumns,
} from "./aes_manual_v2.js";
import i18n from "i18next";

const encryptSteps = ["SubBytes", "ShiftRows", "MixColumns", "AddRoundKey"];
const encryptFinalRoundSteps = ["SubBytes", "ShiftRows", "AddRoundKey"];

const decryptSteps = [
  "InvShiftRows",
  "InvSubBytes",
  "AddRoundKey",
  "InvMixColumns",
];
const decryptFinalRoundSteps = ["InvShiftRows", "InvSubBytes", "AddRoundKey"];

export const generateStateMap = (
  initialPaddedState,
  roundKeys,
  totalRounds,
) => {
  const newStateMap = new Map();
  newStateMap.set(-2, [{ step: "Input", state: toHex(initialPaddedState) }]);
  newStateMap.set(-1, [
    { step: "Key Expansion", state: toHex(initialPaddedState) },
  ]);

  let currentState = initialPaddedState;

  for (let i = 0; i <= totalRounds; i++) {
    if (i === 0) {
      // Round 0
      currentState = addRoundKey(currentState, roundKeys[i]);
      newStateMap.set(i, [{ step: "AddRoundKey", state: toHex(currentState) }]);
    } else if (i === totalRounds) {
      // Final Round
      const roundSteps = encryptFinalRoundSteps.map((step) => {
        if (step === "SubBytes") {
          currentState = subBytes(currentState);
        } else if (step === "ShiftRows") {
          currentState = shiftRows(currentState);
        } else if (step === "AddRoundKey") {
          currentState = addRoundKey(currentState, roundKeys[i]);
        }
        return { step, state: toHex(currentState) };
      });
      newStateMap.set(i, roundSteps);
    } else {
      // Other Rounds
      const roundSteps = encryptSteps.map((step) => {
        if (step === "SubBytes") {
          currentState = subBytes(currentState);
        } else if (step === "ShiftRows") {
          currentState = shiftRows(currentState);
        } else if (step === "MixColumns") {
          currentState = mixColumns(currentState);
        } else if (step === "AddRoundKey") {
          currentState = addRoundKey(currentState, roundKeys[i]);
        }
        return { step, state: toHex(currentState) };
      });
      newStateMap.set(i, roundSteps);
    }
  }

  console.log(
    "newStateMap:",
    JSON.stringify(Array.from(newStateMap.entries()), null, 2),
  );
  return newStateMap;
};

// Build a state map for decryption that advances from ciphertext -> plaintext
export const generateDecryptStateMap = (
  initialCipherState,
  roundKeys,
  totalRounds,
) => {
  const newStateMap = new Map();
  newStateMap.set(-2, [{ step: "Input", state: toHex(initialCipherState) }]);
  newStateMap.set(-1, [
    { step: "Key Expansion", state: toHex(initialCipherState) },
  ]);

  let currentState = initialCipherState.slice();

  // Initial AddRoundKey with last round key (start of decryption)
  currentState = addRoundKey(currentState, roundKeys[totalRounds]);
  newStateMap.set(0, [{ step: "AddRoundKey", state: toHex(currentState) }]);

  // Main decryption rounds: create entries for rounds 1 .. totalRounds-1
  for (let i = 1; i <= totalRounds; i++) {
    const roundIndex = i; // visible round index increasing as we decrypt
    const stepsArr = [];

    if (i < totalRounds) {
      // Corresponds to decryption work for rounds Nr-1 .. 1
      currentState = invShiftRows(currentState);
      stepsArr.push({ step: "InvShiftRows", state: toHex(currentState) });

      currentState = invSubBytes(currentState);
      stepsArr.push({ step: "InvSubBytes", state: toHex(currentState) });

      // AddRoundKey uses the round key counting down: roundKeys[totalRounds - i]
      const rk = roundKeys[totalRounds - i];
      currentState = addRoundKey(currentState, rk);
      stepsArr.push({ step: "AddRoundKey", state: toHex(currentState) });

      // InvMixColumns
      currentState = invMixColumns(currentState);
      stepsArr.push({ step: "InvMixColumns", state: toHex(currentState) });
    } else {
      // Final decryption round (i === totalRounds)
      currentState = invShiftRows(currentState);
      stepsArr.push({ step: "InvShiftRows", state: toHex(currentState) });

      currentState = invSubBytes(currentState);
      stepsArr.push({ step: "InvSubBytes", state: toHex(currentState) });

      // Final AddRoundKey with roundKeys[0]
      currentState = addRoundKey(currentState, roundKeys[0]);
      stepsArr.push({ step: "AddRoundKey", state: toHex(currentState) });
    }

    newStateMap.set(roundIndex, stepsArr);
  }

  return newStateMap;
};

export const handleSubmitButtonClick = (
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
) => {
  let requiredLength = keySize === 128 ? 16 : keySize === 192 ? 24 : 32;
  if (tempKey.length !== requiredLength) {
    setKeyError(
      i18n.t("pages.stepByStep.errors.key.exactLength", { requiredLength }),
    );
    return;
  }
  setKeyError("");
  setInputText(tempInputText);
  setKey(tempKey);
  const initialState = tempInputText
    .split("")
    .map((char) => char.charCodeAt(0));
  const paddedState = padPKCS7(initialState, 16);
  setSidebarVisible(true);
  if (setHasSubmitted) setHasSubmitted(true);
  // Generate round keys
  const expandedKey = keyExpansion(
    tempKey.split("").map((char) => char.charCodeAt(0)),
    keySize,
  );
  const roundKeys = [];
  const totalRounds = keySize === 128 ? 10 : keySize === 192 ? 12 : 14;
  for (let i = 0; i <= totalRounds; i++) {
    roundKeys.push(expandedKey.slice(i * 16, (i + 1) * 16));
  }
  setRoundKeys(roundKeys);

  // Generate state map
  const newStateMap = generateStateMap(paddedState, roundKeys, totalRounds);

  // Set state map to newStateMap
  setStateMap(newStateMap);
};

export const handleNextRound = (
  currentRound,
  setCurrentRound,
  setCurrentStep,
  totalRounds,
  mode = "Encrypt",
) => {
  if (currentRound === -2) {
    setCurrentRound(-1);
    setCurrentStep("Key Expansion");
  } else if (currentRound === -1) {
    setCurrentRound(0);
    setCurrentStep("AddRoundKey");
  } else {
    const next = Math.min(currentRound + 1, totalRounds);
    setCurrentRound(next);
    // determine default first step for next round based on mode
    if (next === 0) setCurrentStep("AddRoundKey");
    else if (next === totalRounds)
      setCurrentStep(mode === "Encrypt" ? "SubBytes" : "InvShiftRows");
    else setCurrentStep(mode === "Encrypt" ? "SubBytes" : "InvShiftRows");
  }
};

export const handlePreviousRound = (
  currentRound,
  setCurrentRound,
  setCurrentStep,
  mode = "Encrypt",
) => {
  if (currentRound === -1) {
    setCurrentRound(-2);
    setCurrentStep("Input");
  } else if (currentRound === 0) {
    setCurrentRound(-1);
    setCurrentStep("Key Expansion");
  } else {
    const prev = Math.max(currentRound - 1, 0);
    setCurrentRound(prev);
    // set default step for previous round
    if (prev === 0) setCurrentStep("AddRoundKey");
    else setCurrentStep(mode === "Encrypt" ? "SubBytes" : "InvShiftRows");
  }
};

export const handleNextStep = (
  currentRound,
  currentStep,
  setCurrentStep,
  handleNextRound,
  totalRounds,
  stateMap,
) => {
  if (currentRound === -2 || currentRound === -1) {
    handleNextRound();
    return;
  }
  const roundSteps = (stateMap.get(currentRound) || []).map((s) => s.step);
  if (roundSteps.length === 0) {
    // fallback
    handleNextRound();
    return;
  }
  const currentIndex = roundSteps.indexOf(currentStep);
  if (currentIndex < roundSteps.length - 1) {
    setCurrentStep(roundSteps[currentIndex + 1]);
  } else if (currentRound < totalRounds) {
    handleNextRound();
  }
};

export const handlePreviousStep = (
  currentRound,
  currentStep,
  setCurrentStep,
  handlePreviousRound,
  totalRounds,
  stateMap,
) => {
  if (currentRound === -1 && currentStep === "Key Expansion") {
    handlePreviousRound();
    return;
  }
  if (currentRound === 0 && currentStep === "AddRoundKey") {
    handlePreviousRound();
    return;
  }
  const roundSteps = (stateMap.get(currentRound) || []).map((s) => s.step);
  if (roundSteps.length === 0) {
    handlePreviousRound();
    return;
  }
  const currentIndex = roundSteps.indexOf(currentStep);
  if (currentIndex > 0) {
    setCurrentStep(roundSteps[currentIndex - 1]);
  } else if (currentRound > -2) {
    handlePreviousRound();
  }
};

export const handleStepClick = (
  round,
  step,
  setCurrentRound,
  setCurrentStep,
) => {
  setCurrentRound(round);
  setCurrentStep(step);
};

export const handleFinalRound = (
  setCurrentRound,
  setCurrentStep,
  totalRounds,
) => {
  setCurrentRound(totalRounds);
  setCurrentStep("SubBytes");
};

export const handleInput = (setCurrentRound, setCurrentStep) => {
  setCurrentRound(-2);
  setCurrentStep("Input");
};

const toHex = (arr) => {
  return arr.map((byte) => byte.toString(16).padStart(2, "0")).join(" ");
};
