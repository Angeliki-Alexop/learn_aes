import React from "react";
import "./StepInfo.css";

// Rich informational content for each step: what, why, how
const STEP_INFO = {
  "Key Expansion": {
    title: "Key Expansion",
    what: `Key Expansion (also called the key schedule) transforms the initial AES key into a series of round keys. Each round of AES uses one round key which is 16 bytes (for AES-128). The algorithm expands the single input key into (Nr + 1) round keys where Nr is the number of rounds.`,
    why: `Without a different round key at each round, the cipher would be much easier to analyze. The key schedule ensures the key material is mixed and varied across rounds so that each round contributes uniquely to the final ciphertext.`,
    how: `Use the Key Schedule panel to the left to inspect all generated round keys. Click any round to jump to that round's view. You can compare the Round Key bytes with the Current State to understand how AddRoundKey will combine them.`,
  },
  SubBytes: {
    title: "SubBytes",
    what: `SubBytes replaces every byte in the state with a substitute byte using a fixed substitution table called the S-box. The S-box was designed to be non-linear and resistant to known cryptographic attacks.`,
    why: `This substitution introduces non-linearity into AES, preventing attackers from modelling the cipher as a simple linear system. It's a key reason AES is secure against differential and linear cryptanalysis.`,
    how: `Click any byte in the Current State to highlight it and show the corresponding S-box output in the S-box panel. You can then click entries in the S-box to see which input bytes map to that output.`,
  },
  ShiftRows: {
    title: "ShiftRows",
    what: `ShiftRows cyclically shifts the rows of the state. The first row is left intact, the second row shifts by one byte, third by two, and fourth by three (for AES-128). The operation repositions bytes so columns mix data from different rows in the next step.`,
    why: `This step provides inter-column diffusion. When combined with MixColumns, it ensures that a change to a single input byte affects many output bytes after a few rounds.`,
    how: `The visual shows a sliding window: the outlined 4x4 area is the state after shifting. Hover or click to see which original bytes move into each position. Use this to trace how a byte flows through the round.`,
  },
  MixColumns: {
    title: "MixColumns",
    what: `MixColumns treats each column as a four-term polynomial and multiplies it by a fixed polynomial modulo x^4 + 1. In practice this is implemented by multiplying bytes in GF(2^8) with constants (02, 03, 01, 01), which combines column bytes together.`,
    why: `MixColumns provides strong intra-column diffusion so that a small change in a column influences all four bytes of that column. Together with ShiftRows it spreads the influence of each input byte across the entire state over multiple rounds.`,
    how: `Click any byte in the Next State (after MixColumns) to highlight its source column in the previous state and the corresponding row in the fixed MixColumns matrix. The component will display intermediate byte values so you can follow the multiplication and XOR steps.`,
  },
  AddRoundKey: {
    title: "AddRoundKey",
    what: `AddRoundKey XORs the current state with a round-specific key. XOR is a reversible bitwise operation which combines the key material directly into the state bytes.`,
    why: `This is the only step that uses the actual key material in each round. Because XOR is reversible, the proper round keys are necessary to recover the original plaintext during decryption.`,
    how: `Click bytes in the Current State or the Round Key to see the XOR operation and the resulting Next State. Comparing Current State and Round Key byte-by-byte helps understand how the next state is computed.`,
  },
  Input: {
    title: "Input",
    what: `The Input section shows the plaintext that will be processed by AES. The plaintext is converted to bytes and padded using PKCS#7 to fill a 16-byte block for AES-128.`,
    why: `Understanding how your plaintext is padded and represented as bytes is important: small differences in input produce very different ciphertexts due to avalanche properties of AES.`,
    how: `Edit the input text in the controller below the visualization, select the key size, and submit to regenerate the padded state and the round key schedule. The Input view shows the original text and its hex representation.`,
  },
};

function Section({ title, content }) {
  return (
    <div className="stepinfo-section">
      <h4 className="stepinfo-section-title">{title}</h4>
      <p className="stepinfo-section-content">{content}</p>
    </div>
  );
}

export default function StepInfo({ currentStep, currentRound }) {
  const info = STEP_INFO[currentStep] || null;

  if (!info) {
    return null;
  }

  return (
    <div className="stepinfo-root">
      <div className="stepinfo-content">
        <div className="stepinfo-left">
          <h3 className="stepinfo-title">{info.title}</h3>
          <Section title="What" content={info.what} />
          <Section title="Why it matters" content={info.why} />
        </div>
        <div className="stepinfo-right">
          <Section title="How to interact" content={info.how} />
          {typeof currentRound === "number" && currentRound >= 0 && (
            <p className="stepinfo-round">Round: {currentRound}</p>
          )}
        </div>
      </div>
    </div>
  );
}
