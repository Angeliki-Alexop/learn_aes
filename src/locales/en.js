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
    },
  },
};

export default translation;
