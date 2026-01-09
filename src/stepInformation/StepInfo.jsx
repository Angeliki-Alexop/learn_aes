import React from "react";
import "./StepInfo.css";

// Rich informational content for each step: what, how
export const STEP_INFO = {
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
    how: ``,
  },
  SubBytes: {
    title: "SubBytes",
    what: `SubBytes is a transformation where each byte of the AES state is replaced independently using a fixed lookup table called the S-box.
For each byte, its hexadecimal value selects a row and column in the S-box, and the value found there becomes the new byte. 
The SubBytes step is the only non-linear transformation of the cipher.`,
    how: `Click any byte in the Current State to highlight it and display its corresponding value in the S-box panel. 
    The first hexadecimal digit selects the S-box row, the second selects the column, and the value at that position is the substituted byte.`,
  },
  ShiftRows: {
    what: `ShiftRows is a transformation where the rows of the AES state are cyclically shifted to the left.
The first row is not shifted, the second row is shifted by one byte, the third by two bytes, and the fourth by three bytes.`,
    how: `The stair-step shading indicates how far each row is shifted. 
    The purple cells in the Next State show the bytes after rotation, and the corresponding source bytes in the ShiftRows Table are also highlighted in purple, showing exactly which values were moved to produce the result.`,
  },
  MixColumns: {
    what: `In MixColumns, each column of the AES state matrix (4 bytes) is treated as a vector and multiplied by a fixed 4×4 matrix using arithmetic in a special finite field called GF(2⁸).
    Note: MixColumns is applied in every encryption round except the final round.

1. The MixColumns Matrix

Each column [S₀ S₁ S₂ S₃]ᵀ is multiplied by this matrix:

| 02 | 03 | 01 | 01 |
| 01 | 02 | 03 | 01 |
| 01 | 01 | 02 | 03 |
| 03 | 01 | 01 | 02 |

The result is a new column [S′₀ S′₁ S′₂ S′₃]ᵀ where each byte is calculated as:

S′₀ = (02 × S₀) ⊕ (03 × S₁) ⊕ (01 × S₂) ⊕ (01 × S₃)
S′₁ = (01 × S₀) ⊕ (02 × S₁) ⊕ (03 × S₂) ⊕ (01 × S₃)
S′₂ = (01 × S₀) ⊕ (01 × S₁) ⊕ (02 × S₂) ⊕ (03 × S₃)
S′₃ = (03 × S₀) ⊕ (01 × S₁) ⊕ (01 × S₂) ⊕ (02 × S₃)

Each new byte is a combination of all four original bytes in the column.

2. Multiplication Rules in GF(2⁸)

AES multiplication uses a special finite field, but for learning, you can follow these practical rules:
• 01 × X = X
• 02 × X = Shift X left by 1 bit. If the he original byte’s most significant bit is 1 before shifting, XOR the shifted value with 1B (hex).
• 03 × X = (02 × X) ⊕ X
Note: All XOR operations are bitwise addition without carry.`,
    how: `1. Click any byte in the 'Next State' matrix (the output of the MixColumns step).\n
    • This selects one output byte S′ and highlights the entire source column from the 'Current State' that was used to compute it.
    At the same time, the corresponding row of the 'Fixed Matrix' is highlighted to show the coefficients applied to each source byte.

    • The calculation panel displays the full computation: the individual finite-field multiplications (such as 02 × S₀, 03 × S₁, 01 × S₂, 01 × S₃), the intermediate XOR combinations performed step by step, and the final hexadecimal byte value produced by the column operation.`,
  },
  AddRoundKey: {
    what: `AddRoundKey is the AES step where the 'Current State' matrix is combined with a 'Round Key' matrix using the XOR operation (⊕). 
    
    Both are 4×4 matrices of bytes, and each byte of the state is XORed with the byte in the same position of the round key. 
    
    The Round Key is a 128-bit key derived from the original cipher key through the key expansion process, and a different round key is used in each round. 
    
    Note: AddRoundKey is applied once before the first round and at the end of every encryption round.`,
    how: `1. Click any byte in the Next State matrix (the output of AddRoundKey step).
     • The corresponding byte in the 'Current State' and the matching byte in the active 'Round Key' are highlighted. 
     • The explanation panel displays the two input bytes (Current State and Round Key bytes) in hexadecimal and binary, the XOR operation used to combine them (for example, 3C ⊕ A7 = 9B), and the final result in both hexadecimal and binary.`,
  },
};

function Section({ title, content }) {
  return (
    <div className="stepinfo-section">
      <h4 className="stepinfo-section-title">{title}</h4>
      <div
        className="stepinfo-section-content"
        style={{ whiteSpace: "pre-line", lineHeight: 1.4 }}
      >
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
    let extra = `Current key size: AES-${keySize} (${wordsPerKey} words per round key).

  In the Key Schedule view you can click any word (a 4-byte column) to inspect how it was generated. Words are grouped into round keys of ${wordsPerKey} words; the special core transformation is applied every ${wordsPerKey}th word. Click any byte inside a word to highlight the contributing previous words and transformations, making it easier to trace how that expanded word was derived.
`;

    if (wordsPerKey === 8) {
      extra += `
  There are three cases when computing a new word w[i]:

  Case 1 — Special transform (i % 8 === 0)
  Apply the following steps to the previous word (w[i-1]), in order:
    1. Rotate: move the first byte to the end.
    2. SubWord: substitute each byte using the S-box.
    3. XOR Rcon: XOR the result with the round constant (Rcon).
    4. XOR w[i - 8]: XOR the result with the first word of the previous round key to produce w[i].

  Case 2 — Mid-cycle SubWord (i % 8 === 4)
  Apply the following step to the previous word (w[i-1]):
    1. SubWord: substitute each byte using the S-box.
    2. XOR w[i - 8]: XOR the result with the word 8 positions before to produce w[i].
  

  Case 3 — Simple XOR
    w[i] = w[i - 8] XOR w[i - 1]

  Use the above rules with the current round key size (words per key = ${wordsPerKey}).`;
    } else {
      extra += `
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
    }

    howContent = howContent + extra;

    return (
      <div className="stepinfo-root">
        <h3 className="stepinfo-title">What is {currentStep}?</h3>
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
}
