const keyExpansion = {
  aes128: `Explanation (AES-128)

Start with 4 words from the 128-bit key.
To compute each new word:
- Copy the previous word.
- If we are at a multiple of 4 (every 4th word):
    Rotate the bytes left (RotWord).
    Substitute each byte with the S-box (SubWord).
    XOR the first byte with a round constant (Rcon).
- XOR the result with the word 4 positions earlier.

Repeat until you have 44 words (11 round keys).`,

  aes192: `Explanation (AES-192)

Start with 6 words from the 192-bit key.
For each new word:
- Take the previous word.
- If we are at a multiple of 6:
    Rotate bytes (RotWord).
    Apply S-box substitution (SubWord).
    XOR with a round constant (Rcon).
- XOR the result with the word 6 positions back.

Continue until you have 52 words (13 round keys).`,

  aes256: `Explanation (AES-256)

Start with 8 words from the 256-bit key.
For each new word:
- Take the previous word.
- If we are at a multiple of 8 (every 8th word):
    Rotate bytes (RotWord).
    Substitute with the S-box (SubWord).
    XOR with a round constant (Rcon).
- Else if we are 4 words past a multiple of 8 (i mod 8 == 4):
    Apply SubWord (S-box substitution only).
- Otherwise, leave the word unchanged.
- XOR the result with the word 8 positions back.

Continue until you have 60 words (15 round keys).`,
};

export default { keyExpansion };
