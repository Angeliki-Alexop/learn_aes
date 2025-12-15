import React from "react";
import "./StepInfo.css";

// Rich informational content for each step: what, why, how
const STEP_INFO = {
  "Key Expansion": {
    title: "What is Key Expansion?",
    what: `AES uses a different key for each encryption round. Key Expansion is the process that generates all these round keys from the original key.

The original key is split into words (1 word = 4 bytes). New words are created one by one by combining previous words and, 
at specific points, applying special transformations (byte rotation, S-box substitution, and a round constant).

The key size determines how often these special steps are applied:
  - AES-128 (16 bytes / 4 words):
    A special transformation is applied every 4th word.
  - AES-192 (24 bytes / 6 words):
    A special transformation is applied every 6th word.
  - AES-256 (32 bytes / 8 words):
    A special transformation is applied every 8th word, with an extra S-box 
    step halfway in each cycle.

AES always needs one round key per round plus one initial key.
Each round key is 4 words, so the total number of expanded words is:
  - AES-128: 44 words
  - AES-192: 52 words
  - AES-256: 60 words`,
    why: `Without a different round key at each round, the cipher would be much easier to analyze. The key schedule ensures the key material is mixed and varied across rounds so that each round contributes uniquely to the final ciphertext.`,
    how: ``,
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
  
};

function Section({ title, content }) {
  return (
    <div className="stepinfo-section">
      <h4 className="stepinfo-section-title">{title}</h4>
      <div className="stepinfo-section-content" style={{ whiteSpace: "pre-line", lineHeight: 1.4 }}>
        {content}
      </div>
    </div>
  );
}

export default function StepInfo({ currentStep, currentRound, keySize }) {
  const info = STEP_INFO[currentStep] || null;

  if (!info) {
    return null;
  }

  // Build a dynamic How-to text for Key Expansion that depends on keySize
  let howContent = info.how || "";
  if (currentStep === "Key Expansion") {
    const wordsPerKey = keySize === 128 ? 4 : keySize === 192 ? 6 : 8;
      const extra = `Current key size: AES-${keySize} (${wordsPerKey} words per round key).

  In the Key Schedule view you can click any word (a 4-byte column) to inspect how it was generated. Words are grouped into round keys of ${wordsPerKey} words; the special core transformation is applied every ${wordsPerKey}th word. Click any byte inside a word to highlight the contributing previous words and transformations, making it easier to trace how that expanded word was derived.

  There are two cases when computing a new word w[i]:

  Case 1 — Special transform (i % ${wordsPerKey} === 0)
  Apply the following steps to the previous word (w[i-1]), in order:
    1. Rotate: move the first byte to the end.
    2. SubWord: substitute each byte using the S-box.
    3. XOR Rcon: XOR the result with the round constant (Rcon).
    4. XOR w[i - ${wordsPerKey}]: XOR the result with the word ${wordsPerKey} positions before (start of the previous round key) to produce w[i].

  Case 2 — Simple XOR
    w[i] = w[i - ${wordsPerKey}] XOR w[i - 1]

  Use the above rules with the current round key size (words per key = ${wordsPerKey}).`;


    howContent = howContent + extra;
  }

  return (
    <div className="stepinfo-root">
      <h3 className="stepinfo-title">{info.title}</h3>
      {typeof currentRound === "number" && currentRound >= 0 && (
        <p className="stepinfo-round">Round: {currentRound}</p>
      )}
      <div className="stepinfo-content two-cols">
        <div className="stepinfo-left-col">
          <Section content={info.what} />
        </div>
        <div className="stepinfo-right-col">
          <Section title="How to interact" content={howContent} />
        </div>
      </div>
    </div>
  );
}
