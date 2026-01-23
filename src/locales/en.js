const translation = {
  nav: {
    stepByStep: 'Step-By-Step',
    training: 'Training',
    learnMore: 'Learn More',
    sbox: 'S-box',
    calculator: 'Calculator',
  },
  keyExpansion: {
    aes128: `Explanation (AES-128)\n\nStart with 4 words from the 128-bit key.\nTo compute each new word:\n- Copy the previous word.\n- If we are at a multiple of 4 (every 4th word):\n    Rotate the bytes left (RotWord).\n    Substitute each byte with the S-box (SubWord).\n    XOR the first byte with a round constant (Rcon).\n- XOR the result with the word 4 positions earlier.\n\nRepeat until you have 44 words (11 round keys).`,
    aes192: `Explanation (AES-192)\n\nStart with 6 words from the 192-bit key.\nFor each new word:\n- Take the previous word.\n- If we are at a multiple of 6:\n    Rotate bytes (RotWord).\n    Apply S-box substitution (SubWord).\n    XOR with a round constant (Rcon).\n- XOR the result with the word 6 positions back.\n\nContinue until you have 52 words (13 round keys).`,
    aes256: `Explanation (AES-256)\n\nStart with 8 words from the 256-bit key.\nFor each new word:\n- Take the previous word.\n- If we are at a multiple of 8 (every 8th word):\n    Rotate bytes (RotWord).\n    Substitute with the S-box (SubWord).\n    XOR with a round constant (Rcon).\n- Else if we are 4 words past a multiple of 8 (i mod 8 == 4):\n    Apply SubWord (S-box substitution only).\n- Otherwise, leave the word unchanged.\n- XOR the result with the word 8 positions back.\n\nContinue until you have 60 words (15 round keys).`,
  },
  pages: {
    stepByStep: {
      input: {
        title: 'Exploring the Advanced Encryption Standard (AES)',
        description:
          "Welcome! This interactive tool will guide you through the AES algorithm step by step, making it easy to understand how each operation works. Use the AES Helper to get extra explanations, see what’s happening at every stage, and learn how to interact with the tool to explore all its features. Have fun learning and experimenting with AES!",
        subtitle: {
          encrypt: 'AES Encryption',
          decrypt: 'AES Decryption',
        },
        selectModeLabel: 'Select the desired mode:',
        controls: {
          encryptButton: 'ENCRYPTION',
          decryptButton: 'DECRYPTION',
          submit: 'Submit',
        },
        selectKeySizeLabel: 'Select the desired Key Size:',
        labels: {
          keySize: 'Key Size',
          plaintext: 'Plaintext (english)',
          ciphertextHex: 'Ciphertext (Hex)',
          key: 'Key for AES (english)',
        },
        keySizeOptions: {
          '128': '128 bits',
          '192': '192 bits',
          '256': '256 bits',
        },
      },
      errors: {
        plaintext: {
          tooLong: 'Plaintext must be at most 16 characters',
        },
        ciphertext: {
          onlyHex: 'Only hexadecimal characters (0-9, A-F) are allowed',
          hexLength: 'Hex input must be exactly 32 hex characters (16 bytes)',
          base64Length: 'Base64 must decode to exactly 16 bytes',
          invalidBase64: 'Invalid Base64 string',
        },
      },
      summary: {
        heading: 'Input Summary',
        labels: {
          ciphertext: 'Ciphertext',
          plaintext: 'Plaintext (english)',
          plaintextHex: 'Plaintext (Hex)',
          paddedPlaintextHex: 'Padded plaintext (Hex)',
          keyHex: 'Key for AES (Hex)',
          operationMode: 'Operation mode',
          keySizeDisplay: 'Key size',
        },
        tooltips: {
          ciphertext: 'The ciphertext provided as input to the decryption process',
          plaintext: 'The original plaintext message entered by the user',
          plaintextHex: 'The hexadecimal representation of the plaintext',
          paddedPlaintextHex:
            "The plaintext after PKCS#7 padding has been applied to match AES’s required block size (16 bytes) in hexadecimal format.",
          key: 'Key provided by the user',
          operationMode: 'Encrypt or Decrypt mode selected by the user',
          keySize: 'Selected key size in bits',
        },
      },
      dynamic: {
        roundStep: 'Round {{round}} - Step: {{step}}',
      },
      labels: {
        roundKey: 'Round Key',
      },
      matrix: {
        shiftRowsTable: 'ShiftRows Table',
        sbox: 'S-Box',
        inverseSBox: 'Inverse S-Box',
  inverseFixedMatrix: 'Inverse Fixed Matrix',
  fixedMatrix: 'Fixed Matrix',
        roundKey: 'Round Key',
        currentState: 'Current State',
        nextState: 'Next State',
      },
      sidebar: {
        input: 'Input',
        keySchedule: 'Key Schedule',
        result: 'Result',
        steps: {
          SubBytes: 'SubBytes',
          ShiftRows: 'ShiftRows',
          MixColumns: 'MixColumns',
          AddRoundKey: 'AddRoundKey',
          InvShiftRows: 'InvShiftRows',
          InvSubBytes: 'InvSubBytes',
          InvMixColumns: 'InvMixColumns',
          'Key Expansion': 'Key Expansion',
          Result: 'Result',
        }
      },
      keySchedule: {
        title: 'Key Schedule - Key Expansion',
        allRoundKeys: 'All round keys (Matrix format)',
        roundLabel: 'Round {{n}}',
        columns: {
          previousWord: 'w[i-1]',
          offsetWordBefore: 'w[i - {{offset}}]',
          currentWord: 'Selected word',
          XOR: 'XOR',
          Rotate: 'Rotate',
          Substitute: 'Substitute',
          Rotated: 'Rotated',
          SubstitutedWord: 'SubWord',
          Rcon: 'Rcon',
          Equals: 'Equals',
        },
        explanations: {
          case1: `Case 1 — (i % {{mod}} === 0)\n\nApply the following steps to the previous word (w[i-1]), in order:\n1. Rotate: move the first byte to the end.\n2. SubWord: substitute each byte using the S-box.\n3. XOR Rcon: XOR the result with the round constant (Rcon).\n4. XOR w[i - {{offset}}]: XOR the result with the word {{offset}} positions before to produce w[i].`,
          case2: `Case 2 — Simple XOR\n\nw[i] = w[i - {{offset}}] XOR w[i - 1]`,
          case2_mid: `Case 2 — Mid-cycle SubWord (i % {{mod}} === {{mid}})\n\nApply the following step to the previous word (w[i-1]):\n1. SubWord: substitute each byte using the S-box.\n2. XOR w[i - {{offset}}]: XOR the result with the word {{offset}} positions before to produce w[i].`,
        },
      },
      stepInfo: {
        addRoundKey: {
          title: 'AddRoundKey',
          what: `AddRoundKey is the AES step where the 'Current State' matrix is combined with a 'Round Key' matrix using the XOR operation (⊕).

Both are 4×4 matrices of bytes, and each byte of the state is XORed with the byte in the same position of the round key.

The Round Key is derived from the original key through the key expansion process, and a different round key is used in each round.

What happens during decryption?

During decryption, AddRoundKey works exactly the same way as in encryption. The Current State is XORed with a Round Key using the XOR operation (⊕).
The difference is which round key is used: decryption applies the round keys in reverse order, starting from the last round key and ending with the initial one.`,
          how: `Click any byte in the Next State matrix (the output of AddRoundKey step).
• The corresponding byte in the 'Current State' and the matching byte in the active 'Round Key' are highlighted.
• The explanation panel displays the two input bytes (Current State and Round Key bytes) in hexadecimal and binary, the XOR operation used to combine them (for example, 3C ⊕ A7 = 9B), and the final result in both hexadecimal and binary.`,
        }
      },
      helper: {
        addRoundKey: {
          title: 'AddRoundKey',
          what: `AddRoundKey is the AES step where the 'Current State' matrix is combined with a 'Round Key' matrix using the XOR operation (⊕).

Both are 4×4 matrices of bytes, and each byte of the state is XORed with the byte in the same position of the round key.

The Round Key is derived from the original key through the key expansion process, and a different round key is used in each round.

What happens during decryption?

During decryption, AddRoundKey works exactly the same way as in encryption. The Current State is XORed with a Round Key using the XOR operation (⊕).
The difference is which round key is used: decryption applies the round keys in reverse order, starting from the last round key and ending with the initial one.`,
          how: `Click any byte in the Next State matrix (the output of AddRoundKey step).
• The corresponding byte in the 'Current State' and the matching byte in the active 'Round Key' are highlighted.
• The explanation panel displays the two input bytes (Current State and Round Key bytes) in hexadecimal and binary, the XOR operation used to combine them (for example, 3C ⊕ A7 = 9B), and the final result in both hexadecimal and binary.`,
        }
        ,
        roundLabel: 'Round {{n}}',
        whatTitle: 'What',
        howTitle: 'How to interact',
        tabWhat: 'What is it?',
        tabHow: 'How to interact?'
  ,
  subBytes: {
    title: 'SubBytes',
    what: `SubBytes is a transformation where each byte of the AES state is replaced independently using a fixed lookup table called the S-box.

For each byte, its hexadecimal value selects a row and column in the S-box, and the value found there becomes the new byte.

The SubBytes step is the only non-linear transformation of the cipher.`,
    how: `Click any byte in the Current State to highlight it and display its corresponding value in the S-box panel.
The first hexadecimal digit selects the S-box row, the second selects the column, and the value at that position is the substituted byte.`,
  },
  invSubBytes: {
    title: 'InvSubBytes',
    what: `InvSubBytes is the inverse of the SubBytes step.

During decryption, each byte of the AES state is replaced independently using a fixed lookup table called the inverse S-box.

For each byte, its hexadecimal value selects a row and column in the inverse S-box, and the value found there becomes the new byte. This step reverses the non-linear substitution applied during encryption.`,
    how: `Click any byte in the Current State to highlight it and display its corresponding value in the inverse S-box panel.
The first hexadecimal digit selects the inverse S-box row, the second selects the column, and the highlighted value at that position is the new byte.`,
  },
  shiftRows: {
    title: 'ShiftRows',
    what: `ShiftRows is an AES step where the bytes of the state matrix are shifted cyclically to the left.

Each row of the 4×4 matrix is shifted by a different number of positions:
• The first row is not shifted
• The second row is shifted 1 position to the left
• The third row is shifted 2 positions to the left
• The fourth row is shifted 3 positions to the left

This is a simple but important operation that spreads data across the matrix.`,
    how: `Observe how each row of the matrix is shifted by a specific number of positions to the left. The positions that leave the right side return to the left side (circular shift).`,
  },
  invShiftRows: {
    title: 'InvShiftRows',
    what: `InvShiftRows is the inverse of the ShiftRows step.

During decryption, the bytes of the state matrix are shifted cyclically to the right to reverse the shifts that were applied during encryption:
• The first row is not shifted
• The second row is shifted 1 position to the right
• The third row is shifted 2 positions to the right
• The fourth row is shifted 3 positions to the right`,
    how: `Observe how each row of the matrix is shifted by a specific number of positions to the right to reverse the leftward shift of the encryption stage.`,
  },
  mixColumns: {
    title: 'MixColumns',
    what: `MixColumns is an AES step where each column of the state matrix is multiplied by a fixed matrix using arithmetic in the Galois field GF(2^8).

This is a linear transformation that mixes bytes within each column, increasing the diffusion of cryptographic data.`,
    how: `Click any byte in the result (Next State) to see how it was calculated using the given column and the fixed MixColumns matrix.`,
  },
  invMixColumns: {
    title: 'InvMixColumns',
    what: `InvMixColumns is the inverse of the MixColumns step.

During decryption, each column of the state matrix is multiplied by the inverse matrix using arithmetic in the Galois field GF(2^8) to reverse the mixing that was applied during encryption.`,
    how: `Click any byte in the result (Next State) to see how it was calculated using the given column and the inverse MixColumns matrix.`,
  }
      },
      navigation: {
        input: 'INPUT',
        previousRound: 'PREVIOUS ROUND',
        previousStep: 'PREVIOUS STEP',
        nextStep: 'NEXT STEP',
        nextRound: 'NEXT ROUND',
  finalRound: 'FINAL ROUND',
  result: 'RESULT',
        submit: 'SUBMIT',
      }
      ,
      addRoundKey: {
        line: 'Current State [{{r}}, {{c}}] XOR Round Key [{{r}}, {{c}}] = Result [{{r}}, {{c}}]',
        table: {
          state: 'State',
          hex: 'Hex',
          binary: 'Binary',
        },
        currentState: 'Current State [{{r}}, {{c}}]',
        roundKey: 'Round Key [{{r}}, {{c}}]',
        nextState: 'Next State [{{r}}, {{c}}]'
      }
    },
  },
};

export default translation;
