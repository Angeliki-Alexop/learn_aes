import React from "react";
import "./StepInfo.css";

// Mapping of step keys to title + description + interaction hints
const STEP_INFO = {
  "Key Expansion": {
    title: "Key Expansion",
    description:
      "Generates the round keys from the main AES key. Each round uses a different 16-byte round key.",
    hint:
      "Tip: Use the Key Schedule panel on the left to view each round's key. Click a round to jump to its key expansion view.",
  },
  SubBytes: {
    title: "SubBytes",
    description:
      "Each byte of the state is substituted using the AES S-box. This provides non-linearity.",
    hint:
      "Interaction: Click a byte in the Current State to see its S-box output and explanation. Click a byte in the S-box to inspect mapping.",
  },
  ShiftRows: {
    title: "ShiftRows",
    description:
      "Rows of the state are cyclically shifted to the left by different offsets. This provides diffusion across columns.",
    hint:
      "Interaction: Hover or click the table to see how bytes are moved. The visual shows a sliding window with the shifted result in the outlined 4x4.",
  },
  MixColumns: {
    title: "MixColumns",
    description:
      "Each column of the state is transformed by a fixed polynomial multiplication. This mixes bytes within a column.",
    hint:
      "Interaction: Click a byte in the Next State to highlight the corresponding column. The fixed matrix row will be shown and intermediate values displayed.",
  },
  AddRoundKey: {
    title: "AddRoundKey",
    description:
      "The state is XORed with the round key. This combines the key material into the state for each round.",
    hint:
      "Interaction: Click bytes in the Current State or Round Key to see the XOR result and how the Next State is computed.",
  },
  Input: {
    title: "Input",
    description: "The plaintext input shown before encryption begins.",
    hint: "Interaction: Edit the Input Text in the controller below and submit to regenerate the state and key schedule.",
  },
};

export default function StepInfo({ currentStep, currentRound }) {
  const info = STEP_INFO[currentStep] || {
    title: currentStep,
    description: "This step has no additional information.",
    hint: "",
  };

  return (
    <div className="stepinfo-root">
      <div className="stepinfo-content">
        <div className="stepinfo-left">
          <h3 className="stepinfo-title">{info.title}</h3>
          <p className="stepinfo-description">{info.description}</p>
        </div>
        <div className="stepinfo-right">
          <p className="stepinfo-hint">{info.hint}</p>
          {typeof currentRound === "number" && currentRound >= 0 && (
            <p className="stepinfo-round">Round: {currentRound}</p>
          )}
        </div>
      </div>
    </div>
  );
}
