const translation = {
  "nav": {
    "stepByStep": "Step-By-Step",
    "training": "Training",
    "learnMore": "Learn More",
    "sbox": "S-box",
    "calculator": "Calculator"
  },
  "keyExpansion": {
    "aes128": `Explanation (AES-128)\n\nStart with 4 words from the 128-bit key.\nTo compute each new word:\n- Copy the previous word.\n- If we are at a multiple of 4 (every 4th word):\n    Rotate the bytes left (RotWord).\n    Substitute each byte with the S-box (SubWord).\n    XOR the first byte with a round constant (Rcon).\n- XOR the result with the word 4 positions earlier.\n\nRepeat until you have 44 words (11 round keys).`,
    "aes192": `Explanation (AES-192)\n\nStart with 6 words from the 192-bit key.\nFor each new word:\n- Take the previous word.\n- If we are at a multiple of 6:\n    Rotate bytes (RotWord).\n    Apply S-box substitution (SubWord).\n    XOR with a round constant (Rcon).\n- XOR the result with the word 6 positions back.\n\nContinue until you have 52 words (13 round keys).`,
    "aes256": `Explanation (AES-256)\n\nStart with 8 words from the 256-bit key.\nFor each new word:\n- Take the previous word.\n- If we are at a multiple of 8 (every 8th word):\n    Rotate bytes (RotWord).\n    Substitute with the S-box (SubWord).\n    XOR with a round constant (Rcon).\n- Else if we are 4 words past a multiple of 8 (i mod 8 == 4):\n    Apply SubWord (S-box substitution only).\n- Otherwise, leave the word unchanged.\n- XOR the result with the word 8 positions back.\n\nContinue until you have 60 words (15 round keys).`
  }
}

export default translation;
