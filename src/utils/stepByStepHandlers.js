import { keyExpansion, padPKCS7, addRoundKey, subBytes, shiftRows, mixColumns, invSubBytes, invShiftRows, invMixColumns } from './aes_manual_v2.js';

const steps = ['SubBytes', 'ShiftRows', 'MixColumns', 'AddRoundKey'];
const finalRoundSteps = ['SubBytes', 'ShiftRows', 'AddRoundKey'];

// local hex helper to avoid depending on toHex being declared later
const hex = (arr) => {
  return arr.map((byte) => byte.toString(16).padStart(2, '0')).join(' ');
};

export const generateStateMap = (initialPaddedState, roundKeys, totalRounds, mode = 'encrypt') => {
  // Build canonical step descriptors and then convert into the Map shape the UI expects
  const descriptors = buildSteps(initialPaddedState, roundKeys, totalRounds, mode);

  const newStateMap = new Map();
  newStateMap.set(-2, [{ step: 'Input', state: hex(initialPaddedState) }]);
  newStateMap.set(-1, [{ step: 'Key Expansion', state: hex(initialPaddedState) }]);

  // Group descriptors by round into arrays of { step, state }
  for (const d of descriptors) {
  const entry = { step: d.op, state: d.outputState };
    if (!newStateMap.has(d.round)) newStateMap.set(d.round, []);
    newStateMap.get(d.round).push(entry);
  }

  console.log('newStateMap (from descriptors):', JSON.stringify(Array.from(newStateMap.entries()), null, 2));
  return newStateMap;
};

// Build canonical step descriptors for encrypt/decrypt modes
export const buildSteps = (initialPaddedState, roundKeys, totalRounds, mode = 'encrypt') => {
  const descriptors = [];
  const clone = (arr) => arr.slice();

  if (mode === 'encrypt') {
    let state = clone(initialPaddedState);
    // Round 0 AddRoundKey
    const out0 = addRoundKey(clone(state), roundKeys[0]);
    descriptors.push({ id: `0-AddRoundKey`, op: 'AddRoundKey', title: 'Add Round Key', short: 'XOR with round key', details: '', round: 0, roundKeyIndex: 0, inputState: hex(state), outputState: hex(out0) });
    state = out0;

    for (let r = 1; r <= totalRounds; r++) {
      if (r !== totalRounds) {
        // SubBytes
        const inSb = clone(state);
        const outSb = subBytes(inSb);
        descriptors.push({ id: `${r}-SubBytes`, op: 'SubBytes', title: 'Sub Bytes', short: 'Substitute using S-box', details: '', round: r, inputState: hex(inSb), outputState: hex(outSb) });
        state = outSb;

        // ShiftRows
        const inSr = clone(state);
        const outSr = shiftRows(inSr);
        descriptors.push({ id: `${r}-ShiftRows`, op: 'ShiftRows', title: 'Shift Rows', short: 'Rotate rows', details: '', round: r, inputState: hex(inSr), outputState: hex(outSr) });
        state = outSr;

        // MixColumns
        const inMc = clone(state);
        const outMc = mixColumns(inMc);
        descriptors.push({ id: `${r}-MixColumns`, op: 'MixColumns', title: 'Mix Columns', short: 'Mix columns using GF(2^8)', details: '', round: r, inputState: hex(inMc), outputState: hex(outMc) });
        state = outMc;

        // AddRoundKey
        const inArk = clone(state);
        const outArk = addRoundKey(inArk, roundKeys[r]);
        descriptors.push({ id: `${r}-AddRoundKey`, op: 'AddRoundKey', title: 'Add Round Key', short: 'XOR with round key', details: '', round: r, roundKeyIndex: r, inputState: hex(inArk), outputState: hex(outArk) });
        state = outArk;
      } else {
        // Final round: SubBytes -> ShiftRows -> AddRoundKey
        const inSb = clone(state);
        const outSb = subBytes(inSb);
        descriptors.push({ id: `${r}-SubBytes`, op: 'SubBytes', title: 'Sub Bytes', short: 'Substitute using S-box', details: '', round: r, inputState: hex(inSb), outputState: hex(outSb) });
        state = outSb;

        const inSr = clone(state);
        const outSr = shiftRows(inSr);
        descriptors.push({ id: `${r}-ShiftRows`, op: 'ShiftRows', title: 'Shift Rows', short: 'Rotate rows', details: '', round: r, inputState: hex(inSr), outputState: hex(outSr) });
        state = outSr;

        const inArk = clone(state);
        const outArk = addRoundKey(inArk, roundKeys[r]);
        descriptors.push({ id: `${r}-AddRoundKey`, op: 'AddRoundKey', title: 'Add Round Key', short: 'XOR with round key', details: '', round: r, roundKeyIndex: r, inputState: hex(inArk), outputState: hex(outArk) });
        state = outArk;
      }
    }
  } else {
    // decrypt
    let state = clone(initialPaddedState);
    // Initial AddRoundKey with last round key
    const inInit = clone(state);
    const outInit = addRoundKey(inInit, roundKeys[totalRounds]);
    descriptors.push({ id: `${totalRounds}-AddRoundKey`, op: 'AddRoundKey', title: 'Add Round Key', short: 'Initial XOR with last round key', details: '', round: totalRounds, roundKeyIndex: totalRounds, inputState: hex(inInit), outputState: hex(outInit) });
    state = outInit;

    for (let r = totalRounds - 1; r >= 1; r--) {
      const inIsr = clone(state);
      const outIsr = invShiftRows(inIsr);
      descriptors.push({ id: `${r}-InvShiftRows`, op: 'InvShiftRows', title: 'Inv Shift Rows', short: 'Inverse rotate rows', details: '', round: r, inputState: hex(inIsr), outputState: hex(outIsr) });
      state = outIsr;

      const inIsb = clone(state);
      const outIsb = invSubBytes(inIsb);
      descriptors.push({ id: `${r}-InvSubBytes`, op: 'InvSubBytes', title: 'Inv Sub Bytes', short: 'Inverse S-box substitution', details: '', round: r, inputState: hex(inIsb), outputState: hex(outIsb) });
      state = outIsb;

      const inArk = clone(state);
      const outArk = addRoundKey(inArk, roundKeys[r]);
      descriptors.push({ id: `${r}-AddRoundKey`, op: 'AddRoundKey', title: 'Add Round Key', short: 'XOR with round key', details: '', round: r, roundKeyIndex: r, inputState: hex(inArk), outputState: hex(outArk) });
      state = outArk;

      const inImc = clone(state);
      const outImc = invMixColumns(inImc);
      descriptors.push({ id: `${r}-InvMixColumns`, op: 'InvMixColumns', title: 'Inv Mix Columns', short: 'Inverse mix columns', details: '', round: r, inputState: hex(inImc), outputState: hex(outImc) });
      state = outImc;
    }

    // Final round (round 0)
    const inFsr = clone(state);
    const outFsr = invShiftRows(inFsr);
    descriptors.push({ id: `0-InvShiftRows`, op: 'InvShiftRows', title: 'Inv Shift Rows', short: 'Inverse rotate rows', details: '', round: 0, inputState: hex(inFsr), outputState: hex(outFsr) });
    state = outFsr;

    const inFsb = clone(state);
    const outFsb = invSubBytes(inFsb);
    descriptors.push({ id: `0-InvSubBytes`, op: 'InvSubBytes', title: 'Inv Sub Bytes', short: 'Inverse S-box substitution', details: '', round: 0, inputState: hex(inFsb), outputState: hex(outFsb) });
    state = outFsb;

    const inFark = clone(state);
    const outFark = addRoundKey(inFark, roundKeys[0]);
    descriptors.push({ id: `0-AddRoundKey`, op: 'AddRoundKey', title: 'Add Round Key', short: 'Final XOR with round key', details: '', round: 0, roundKeyIndex: 0, inputState: hex(inFark), outputState: hex(outFark) });
    state = outFark;
  }

  return descriptors;
};

export const handleSubmitButtonClick = (tempKey, tempInputText, keySize, setKeyError, setInputText, setKey, setSidebarVisible, setRoundKeys, setStateMap, setHasSubmitted, mode = 'encrypt') => {
  let requiredLength = keySize === 128 ? 16 : keySize === 192 ? 24 : 32;
  if (tempKey.length !== requiredLength) {
    setKeyError(`Key must be exactly ${requiredLength} characters long`);
    return;
  }
  setKeyError('');
  setInputText(tempInputText);
  setKey(tempKey);
  // Build initial byte state depending on mode
  let initialStateBytes = [];
  if (mode === 'decrypt') {
    const t = (tempInputText || '').trim();
    const cleanNoSpaces = t.replace(/\s+/g, '');
    const hexOnly = /^[0-9a-fA-F\s]+$/.test(t) && cleanNoSpaces.length % 2 === 0 && cleanNoSpaces.length > 0;
    try {
      if (hexOnly) {
        for (let i = 0; i < cleanNoSpaces.length; i += 2) {
          initialStateBytes.push(parseInt(cleanNoSpaces.substr(i, 2), 16));
        }
      } else {
        if (typeof atob === 'function') {
          const decoded = atob(t);
          for (let i = 0; i < decoded.length; i++) initialStateBytes.push(decoded.charCodeAt(i));
        } else {
          // Node environment fallback
          const buf = Buffer.from(t, 'base64');
          initialStateBytes = Array.from(buf);
        }
      }
    } catch (e) {
      // Fallback to raw text
      initialStateBytes = t.split('').map(c => c.charCodeAt(0));
    }
    // Ensure exactly one block (16 bytes) for step-by-step UI
    if (initialStateBytes.length < 16) {
      initialStateBytes = initialStateBytes.concat(Array(16 - initialStateBytes.length).fill(0));
    }
    initialStateBytes = initialStateBytes.slice(0, 16);
  } else {
    initialStateBytes = (tempInputText || '').split('').map(char => char.charCodeAt(0));
  }
  const paddedState = padPKCS7(initialStateBytes, 16);
  setSidebarVisible(true);
  if (setHasSubmitted) setHasSubmitted(true);
  // Generate round keys
  const expandedKey = keyExpansion(tempKey.split('').map(char => char.charCodeAt(0)), keySize);
  const roundKeys = [];
  const totalRounds = keySize === 128 ? 10 : keySize === 192 ? 12 : 14;
  for (let i = 0; i <= totalRounds; i++) {
    roundKeys.push(expandedKey.slice(i * 16, (i + 1) * 16));
  }
  setRoundKeys(roundKeys);

  // Generate state map
  const newStateMap = generateStateMap(paddedState, roundKeys, totalRounds, mode);

  // Set state map to newStateMap
  setStateMap(newStateMap);
};

export const handleNextRound = (currentRound, setCurrentRound, setCurrentStep, totalRounds) => {
  if (currentRound === -2) {
    setCurrentRound(-1);
    setCurrentStep('Key Expansion');
  } else if (currentRound === -1) {
    setCurrentRound(0);
    setCurrentStep('AddRoundKey');
  } else {
    setCurrentRound((prev) => Math.min(prev + 1, totalRounds));
    setCurrentStep('SubBytes');
  }
};

export const handlePreviousRound = (currentRound, setCurrentRound, setCurrentStep) => {
  if (currentRound === -1) {
    setCurrentRound(-2);
    setCurrentStep('Input');
  } else if (currentRound === 0) {
    setCurrentRound(-1);
    setCurrentStep('Key Expansion');
  } else {
    setCurrentRound((prev) => Math.max(prev - 1, 0));
    setCurrentStep('AddRoundKey');
  }
};

// Return the step list for a given round depending on mode
const getStepsForRound = (round, totalRounds, mode = 'encrypt') => {
  if (round === 0) {
    return mode === 'encrypt' ? ['AddRoundKey'] : ['InvShiftRows', 'InvSubBytes', 'AddRoundKey'];
  }
  if (round === totalRounds) {
    return mode === 'encrypt' ? finalRoundSteps : ['AddRoundKey'];
  }
  // middle rounds
  return mode === 'encrypt' ? steps : ['InvShiftRows', 'InvSubBytes', 'AddRoundKey', 'InvMixColumns'];
};

export const handleNextStep = (currentRound, currentStep, setCurrentStep, handleNextRound, totalRounds, mode = 'encrypt') => {
  if (currentRound === -2 || currentRound === -1) {
    handleNextRound();
  } else {
    const currentSteps = getStepsForRound(currentRound, totalRounds, mode);
    const currentIndex = currentSteps.indexOf(currentStep);
    if (currentIndex < currentSteps.length - 1) {
      setCurrentStep(currentSteps[currentIndex + 1]);
    } else if (currentRound < totalRounds) {
      handleNextRound();
    }
  }
};

export const handlePreviousStep = (currentRound, currentStep, setCurrentStep, handlePreviousRound, totalRounds, mode = 'encrypt') => {
  if (currentRound === -1 && currentStep === 'Key Expansion') {
    handlePreviousRound();
  } else if (currentRound === 0 && currentStep === 'AddRoundKey') {
    handlePreviousRound();
  } else {
    const currentSteps = getStepsForRound(currentRound, totalRounds, mode);
    const currentIndex = currentSteps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(currentSteps[currentIndex - 1]);
    } else if (currentRound > -2) {
      handlePreviousRound();
    }
  }
};

export const handleStepClick = (round, step, setCurrentRound, setCurrentStep) => {
  setCurrentRound(round);
  setCurrentStep(step);
};

export const handleFinalRound = (setCurrentRound, setCurrentStep, totalRounds) => {
  setCurrentRound(totalRounds);
  setCurrentStep('SubBytes');
};

export const handleInput = (setCurrentRound, setCurrentStep) => {
  setCurrentRound(-2);
  setCurrentStep('Input');
};

const toHex = (arr) => {
  return arr.map(byte => byte.toString(16).padStart(2, '0')).join(' ');
};