const translation = {
  common: {
    enterHex: "Enter your answers in hexadecimal format.",
  },
  nav: {
    stepByStep: "Step-By-Step",
    training: "Training",
    learnMore: "Learn More",
    sbox: "S-box",
    calculator: "Calculator",
  },
  calculatorOverlay: {
    title: "Calculator",
    tabs: {
      xor: "Xor",
      binhex: "Binary → Hex",
      hexbin: "Hex → Binary",
    },
    xor: {
      hexButton: "HEX",
      binButton: "BIN",
      inputA: "A",
      inputB: "B",
      resultHex: "HEX",
      resultBin: "BIN",
      helperHex: "0-9,A-F — max {{max}} chars",
      helperBin: "0 or 1 — max {{max}} bits",
      resultLabel: "Result:",
    },
    binhex: {
      title: "Binary → Hex",
      inputLabel: "Binary input",
      outputLabel: "HEX",
    },
    hexbin: {
      title: "Hex → Binary",
      inputLabel: "Hex input",
      outputLabel: "BIN",
      helperText: "0-9,A-F — max {{max}} chars",
    },
  },
  keyExpansion: {
    aes128: `Explanation (AES-128)\n\nStart with 4 words from the 128-bit key.\nTo compute each new word:\n- Copy the previous word.\n- If we are at a multiple of 4 (every 4th word):\n    Rotate the bytes left (RotWord).\n    Substitute each byte with the S-box (SubWord).\n    XOR the first byte with a round constant (Rcon).\n- XOR the result with the word 4 positions earlier.\n\nRepeat until you have 44 words (11 round keys).`,
    aes192: `Explanation (AES-192)\n\nStart with 6 words from the 192-bit key.\nFor each new word:\n- Take the previous word.\n- If we are at a multiple of 6:\n    Rotate bytes (RotWord).\n    Apply S-box substitution (SubWord).\n    XOR with a round constant (Rcon).\n- XOR the result with the word 6 positions back.\n\nContinue until you have 52 words (13 round keys).`,
    aes256: `Explanation (AES-256)\n\nStart with 8 words from the 256-bit key.\nFor each new word:\n- Take the previous word.\n- If we are at a multiple of 8 (every 8th word):\n    Rotate bytes (RotWord).\n    Substitute with the S-box (SubWord).\n    XOR with a round constant (Rcon).\n- Else if we are 4 words past a multiple of 8 (i mod 8 == 4):\n    Apply SubWord (S-box substitution only).\n- Otherwise, leave the word unchanged.\n- XOR the result with the word 8 positions back.\n\nContinue until you have 60 words (15 round keys).`,
  },
  pages: {
    stepByStep: {
      input: {
        title: "Exploring the Advanced Encryption Standard(AES)",
        description: `Welcome! 
This interactive tool will guide you through the AES algorithm step by step, 
making it easy to understand how each operation works. 
Use the AES Helper to get extra explanations, see what’s happening at every stage, 
and learn how to interact with the tool to explore all its features. 
Have fun learning and experimenting with AES!`,
        subtitle: {
          encrypt: "AES Encryption",
          decrypt: "AES Decryption",
        },
        selectModeLabel: "Select mode:",
        controls: {
          encryptButton: "ENCRYPTION",
          decryptButton: "DECRYPTION",
          submit: "Submit",
        },
        selectKeySizeLabel: "Select Key Size:",
        labels: {
          keySize: "Key Size:",
          plaintext: "Plaintext (english):",
          ciphertextHex: "Ciphertext (Hex):",
          key: "Key for AES (english):",
        },
        keySizeOptions: {
          128: "128 bits",
          192: "192 bits",
          256: "256 bits",
        },
      },
      errors: {
        plaintext: {
          tooLong: "Plaintext must be at most 16 characters",
          onlyASCII: "Only ASCII characters are allowed",
        },
        ciphertext: {
          onlyHex: "Only hexadecimal characters (0-9, A-F) are allowed",
          hexLength:
            "No blanks - Hex input must be exactly 32 hex characters (16 bytes)",
          base64Length: "Base64 must decode to exactly 16 bytes",
          invalidBase64: "Invalid Base64 string",
        },
        key: {
          exactLength: "Key must be exactly {{requiredLength}} characters long",
          onlyASCII: "Only ASCII characters are allowed",
        },
      },
      summary: {
        heading: "Input Summary",
        headingEncryptResultOverview: "Encryption Overview",
        headingDecryptResultOverview: "Decryption Overview",
        labels: {
          ciphertext: "Ciphertext",
          plaintext: "Plaintext (english)",
          plaintextHex: "Plaintext (Hex)",
          paddedPlaintextHex: "Padded plaintext (Hex)",
          keyHex: "Key for AES (Hex)",
          operationMode: "Operation mode",
          keySizeDisplay: "Key size",
        },
        tooltips: {
          ciphertext:
            "The ciphertext provided as input to the decryption process",
          plaintext: "The original plaintext entered by the user",
          plaintextDecrypt: "The decrypted plaintext",
          plaintextHex: "The hexadecimal representation of the plaintext",
          paddedPlaintextHex:
            "The plaintext after PKCS#7 padding has been applied to match AES’s required block size (16 bytes) in hexadecimal format.",
          key: "Key provided by the user",
          keyHex: "The hexadecimal representation of the input key",
          operationMode: "Encrypt or Decrypt mode selected by the user",
          keySize: "Selected key size in bits",
          plaintextEnglish: "Plaintext (english):",
          keyEnglish: "Key for AES (english):",
          keyEnglishHex: "Key for AES (Hex):",
          decryptedOutputHex: "Decrypted output in hexadecimal",
          encryptedOutputHex: "AES encrypted output in hexadecimal",
          decryptedOutputBase64: "Decrypted output encoded in Base64",
          encryptedOutputBase64: "AES encrypted output encoded in Base64",
        },
      },
      dynamic: {
        roundStep: "Round {{round}} - Step: {{step}}",
      },
      labels: {
        roundKey: "Round Key",
      },
      matrix: {
        shiftRowsTable: "ShiftRows Table",
        sbox: "S-Box",
        inverseSBox: "Inverse S-Box",
        sboxOverlay: {
          sboxTitle: "S-box (encryption)",
          sboxDescription:
            "The S-box(Substitution box) is a fixed lookup table used in AES to replace each byte with a different byte during the encryption process. It introduces non-linearity to make the cipher resistant to patterns and attacks. Each input byte(hex) selects a row and column in the S-box, the value at that position is the substituted (output) byte.",
          sboxHint:
            "Hint: Click any cell to highlight its row and column. The selected cell shows the substituted value for the corresponding input byte.",
          invSboxTitle: "Inverse S-box (decryption)",
          invSboxDescription:
            "The Inverse S-box(Substitution box) is a fixed lookup table used in AES during the decryption process to reverse the SubBytes transformation. Each input byte(hex) selects a row and column in the inverse S-box, the value at that position replaces the byte in the state. This step undoes the non-linear substitution applied during encryption and helps recover the original data.",
          invSboxHint:
            "Hint: Click any cell to highlight its row and column. The selected cell shows the output value for the corresponding input byte.",
        },
        inverseFixedMatrix: "Inverse Fixed Matrix",
        fixedMatrix: "Inverse Fixed Matrix",
        roundKey: "Round Key",
        currentState: "Current State",
        nextState: "Next State",
      },
      mixColumns: {
        fixedMatrix: "Fixed Matrix",
        inverseFixedMatrix: "Fixed Matrix",
        shifted: "Shifted",
        result: "Result",
        key: "Calculations",
        value: "Value",
      },
      sidebar: {
        input: "Input",
        keySchedule: "Key Schedule",
        result: "Result",
        steps: {
          SubBytes: "SubBytes",
          ShiftRows: "ShiftRows",
          MixColumns: "MixColumns",
          AddRoundKey: "AddRoundKey",
          InvShiftRows: "InvShiftRows",
          InvSubBytes: "InvSubBytes",
          InvMixColumns: "InvMixColumns",
          KeyExpansion: "Key Expansion",
          Result: "Result",
        },
      },
      keySchedule: {
        title: "Key Expansion",
        allRoundKeys: "All round keys (Matrix format)",
        roundLabel: "Round {{n}}",
        columns: {
          previousWord: "w[i-1]",
          offsetWordBefore: "w[i - {{offset}}]",
          currentWord: "Selected word",
          XOR: "XOR",
          Rotate: "Rotate",
          Substitute: "Substitute",
          Rotated: "Rotated",
          SubstitutedWord: "SubWord",
          Rcon: "Rcon",
          Equals: "Equals",
        },
        explanations: {
          case1: `Case 1 — Special transform (i % {{mod}} === 0)\n\nApply the following steps to the previous word (w[i-1]), in order:\n1. Rotate: move the first byte to the end.\n2. SubWord: substitute each byte using the S-box.\n3. XOR Rcon: XOR the result with the round constant (Rcon).\n4. XOR w[i - {{offset}}]: XOR the result with the word {{offset}} positions before (start of the previous round key) to produce w[i].`,
          case2: `Case 3 — Simple XOR\n\nw[i] = w[i - {{offset}}] XOR w[i - 1]`,
          case2_mid: `Case 2 — Mid-cycle SubWord (i % {{mod}} === {{mid}})\n\nApply the following step to the previous word (w[i-1]):\n1. SubWord: substitute each byte using the S-box.\n2. XOR w[i - {{offset}}]: XOR the result with the word {{offset}} positions before to produce w[i].`,
        },
      },
      //Not used, only helper texts below are used
      //       stepInfo: {
      //         addRoundKey: {
      //           title: "AddRoundKey",
      //           what: `AddRoundKey is the AES step where the 'Current State' matrix is combined with a 'Round Key' matrix using the XOR operation (⊕).

      // Both are 4×4 matrices of bytes, and each byte of the state is XORed with the byte in the same position of the round key.

      // The Round Key is derived from the original key through the key expansion process, and a different round key is used in each round.

      // What happens during decryption?

      // During decryption, AddRoundKey works exactly the same way as in encryption. The Current State is XORed with a Round Key using the XOR operation (⊕).
      // The difference is which round key is used: decryption applies the round keys in reverse order, starting from the last round key and ending with the initial one.`,
      //           how: `Click any byte in the Next State matrix (the output of AddRoundKey step).
      // • The corresponding byte in the 'Current State' and the matching byte in the active 'Round Key' are highlighted.
      // • The explanation panel displays the two input bytes (Current State and Round Key bytes) in hexadecimal and binary, the XOR operation used to combine them (for example, 3C ⊕ A7 = 9B), and the final result in both hexadecimal and binary.`,
      //         },
      //       },
      helper: {
        addRoundKey: {
          title: "AddRoundKey",
          what: `AddRoundKey is the AES step where the 'Current State' matrix is combined with a 'Round Key' matrix using the XOR operation (⊕).

Both are 4×4 matrices of bytes, and each byte of the state is XORed with the byte in the same position of the round key.

The Round Key is derived from the original key through the key expansion process, and a different round key is used in each round.

What happens during decryption?

During decryption, AddRoundKey works exactly the same way as in encryption. The Current State is XORed with a Round Key using the XOR operation (⊕).
The difference is which round key is used. Decryption applies the round keys in reverse order, starting from the last round key and ending with the initial one.`,
          how: `Click any byte in the Next State matrix (the output of AddRoundKey step).
• The corresponding byte in the 'Current State' and the matching byte in the active 'Round Key' are highlighted.
• The explanation panel displays the two input bytes (Current State and Round Key bytes) in hexadecimal and binary, the XOR operation used to combine them (for example, 3C ⊕ A7 = 9B), and the final result in both hexadecimal and binary.`,
        },
        roundLabel: "Round {{n}}",
        whatTitle: "What",
        howTitle: "How to interact",
        tabWhat: "What is it?",
        tabHow: "How to interact?",
        subBytes: {
          title: "SubBytes",
          what: `• SubBytes is a transformation where each byte of the AES state is replaced using a fixed lookup table called the S-box.

• For each byte, its hexadecimal value selects a row and column in the S-box, and the value found there becomes the new byte.

• The SubBytes step is the only non-linear transformation of the cipher.`,
          how: `Click any byte in the Current State to highlight it and display its corresponding value in the S-box panel.

• The first hexadecimal digit selects the S-box row
• The second selects the column
• The value at that position is the substituted byte`,
        },
        invSubBytes: {
          title: "InvSubBytes",
          what: `InvSubBytes is the inverse of the SubBytes step.
During decryption, each byte of the AES state is replaced using a fixed lookup table called the inverse S-box.
For each byte, its hexadecimal value selects a row and column in the inverse S-box, and the value found there becomes the new byte. 
This step reverses the non-linear substitution applied during encryption.`,
          how: `Click any byte in the Current State to highlight it and display its corresponding value in the inverse S-box panel.
• The first hexadecimal digit selects the S-box row
• The second selects the column
• The highlighted value at that position is the new byte`,
        },
        shiftRows: {
          title: "ShiftRows",
          what: `ShiftRows is an AES step where the bytes of the 'Current State' matrix are shifted cyclically to the left.

Each row of the 4×4 matrix is shifted by a different number of positions:
• The first row is not shifted
• The second row is shifted 1 position to the left
• The third row is shifted 2 positions to the left
• The fourth row is shifted 3 positions to the left`,
          how: `The stair-step shading indicates how far each row is shifted. 
    The purple cells in the Next State show the bytes after rotation, and the corresponding source bytes in the ShiftRows Table are also highlighted in purple, showing exactly which values were moved to produce the result.`,
        },
        invShiftRows: {
          title: "InvShiftRows",
          what: `InvShiftRows is the inverse of the ShiftRows step.
During decryption, each row of the 'Current State' matrix is shifted cyclically to the right to reverse the shifts that were applied during encryption:
• The first row is not shifted
• The second row is shifted 1 position to the right
• The third row is shifted 2 positions to the right
• The fourth row is shifted 3 positions to the right`,
          how: `The stair-step shading indicates how far each row is shifted. 
    The purple cells in the Next State show the bytes after rotation, and the corresponding source bytes in the ShiftRows Table are also highlighted in purple, showing exactly which values were moved to produce the result.`,
        },
        mixColumns: {
          title: "MixColumns",
          what: `In MixColumns, each column of the 'Current State' matrix (4 bytes) is treated as a vector and multiplied by the fixed 4×4 matrix using arithmetic in a special finite field called GF(2⁸).
    Note: MixColumns is applied in every encryption round except the final round.

1. The MixColumns Matrix

Each column [S₀ S₁ S₂ S₃]ᵀ is multiplied by this fixed matrix:

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

Multiplication in GF(2⁸) follows special finite-field rules, but for learning purposes it can be understood using the following practical rules:
• 01 × X = X
• 02 × X = Shift X left by 1 bit. If the the original byte’s most significant bit is 1 before shifting, XOR the shifted value with 1B (hex).
• 03 × X = (02 × X) ⊕ X`,
          how: `Click any byte in the 'Next State' matrix (the output of the MixColumns step).\n
    • This selects one output byte S′ and highlights the entire source column from the 'Current State' that was used to compute it.
    At the same time, the corresponding row of the 'Fixed Matrix' is highlighted to show the coefficients applied to each source byte.

    • The calculation panel displays the full computation: the individual finite-field multiplications (such as 02 × S₀, 03 × S₁, 01 × S₂, 01 × S₃), the intermediate XOR combinations performed step by step, and the final hexadecimal byte value produced by the column operation.`,
        },
        invMixColumns: {
          title: "InvMixColumns",
          what: `InvMixColumns is the inverse of the MixColumns step and is used during decryption.
In this step, each column of the 'Current State' matrix (4 bytes) is multiplied by the 4×4 fixed matrix, which reverses the mixing performed during encryption.

1. The InvMixColumns Matrix

Each column [S₀ S₁ S₂ S₃]ᵀ is multiplied by this fixed matrix:

| 0E | 0B | 0D | 09 |
| 09 | 0E | 0B | 0D |
| 0D | 09 | 0E | 0B |
| 0B | 0D | 09 | 0E |

The result is a new column [S′₀ S′₁ S′₂ S′₃]ᵀ where each byte is calculated as:

S′₀ = (0E × S₀) ⊕ (0B × S₁) ⊕ (0D × S₂) ⊕ (09 × S₃)
S′₁ = (09 × S₀) ⊕ (0E × S₁) ⊕ (0B × S₂) ⊕ (0D × S₃)
S′₂ = (0D × S₀) ⊕ (09 × S₁) ⊕ (0E × S₂) ⊕ (0B × S₃)
S′₃ = (0B × S₀) ⊕ (0D × S₁) ⊕ (09 × S₂) ⊕ (0E × S₃)

2. Multiplication Rules in GF(2⁸)

Multiplication in InvMixColumns also uses arithmetic in GF(2⁸).
For learning purposes, the multiplications can be broken down using combinations of shifts and XORs:

• 09 × X = (02 × (02 × (02 × X))) ⊕ X = 
(08 × X) ⊕ X

• 0B × X = (02 × (02 × (02 × X))) ⊕ (02 × X) ⊕ X = 
(08 × X) ⊕ (02 × X) ⊕ X

• 0D × X = (02 × (02 × (02 × X))) ⊕ (02 × (02 × X)) ⊕ X = 
(08 × X) ⊕ (04 × X) ⊕ X

• 0E × X = (02 × (02 × (02 × X))) ⊕ (02 × (02 × X)) ⊕ (02 × X) = 
(08 × X) ⊕ (04 × X) ⊕ (02 × X)

Note:
• 02 × X = Shift X left by 1 bit. If the he original byte’s most significant bit is 1 before shifting, XOR the shifted value with 1B (hex).`,
          how: `Click any byte in the 'Next State' matrix (the output of the MixColumns step).

• This selects one output byte S′ and highlights the entire source column from the 'Current State' that was used to compute it. At the same time, the corresponding row of the 'Inverse Fixed Matrix' is highlighted to show the coefficients applied to each source byte.

• The calculation panel visualizes how each multiplication is carried out at the bit level, showing binary representations, left shifts, conditional XOR with 1B, and intermediate results. 
Multiplications by values such as 09, 0B, 0D, and 0E are broken down into repeated ×02 operations so you can clearly follow the finite-field arithmetic.`,
        },
        keyExpansion: {
          title: "Key Expansion",
          what: `AES uses a different key for each encryption round.
The Key Schedule is the overall process AES uses to manage and generate all the round keys needed during encryption.
Key Expansion is the specific algorithm within the key schedule that computes these round keys from the original cipher key.

The original key is split into words (1 word = 4 bytes). New words are created one by one by combining previous words and,
at specific points, applying special transformations (byte rotation, S-box substitution, and a round constant).

The key size determines how often these special steps are applied:
- AES-128 (16 bytes / 4 words): A special transformation is applied every 4th word.
- AES-192 (24 bytes / 6 words): A special transformation is applied every 6th word.
- AES-256 (32 bytes / 8 words): A special transformation is applied every 8th word, with an extra S-box step halfway in each cycle.

AES always needs one round key per round plus one initial key.
Each round key is 4 words, so the total number of expanded words is:
- AES-128: 44 words
- AES-192: 52 words
- AES-256: 60 words

What happens during decryption?

Decryption uses the same expanded round keys, but they are applied in reverse order.
The key expansion process itself does not change, the keys are generated once and reused.
During decryption, AES applies the round keys from the last round key to the first, ensuring that each encryption step is correctly reversed.`,
          how: `Use the Key Expansion view to inspect how each round key is derived from the original key.

Current key size: AES-{{keySize}} ({{wordsPerKey}} words per round key).

In the Key Schedule view you can click any word (a 4-byte column) to inspect how it was generated. Words are grouped into round keys of {{wordsPerKey}} words, the special core transformation is applied every {{wordsPerKey}}th word. Click any byte inside a word to highlight the contributing previous words and transformations, making it easier to trace how that expanded word was derived.

These are the cases when computing a new word w[i]:

Case 1 — Special transform (i % {{mod}} === 0)
Apply the following steps to the previous word (w[i-1]), in order:
1. Rotate: move the first byte to the end.
2. SubWord: substitute each byte using the S-box.
3. XOR Rcon: XOR the result with the round constant (Rcon).
4. XOR w[i - {{offset}}]: XOR the result with the word {{offset}} positions before (start of the previous round key) to produce w[i].

Case 3 — Simple XOR
w[i] = w[i - {{offset}}] XOR w[i - 1]

Use the above rules with the current round key size (words per key = {{wordsPerKey}}).`,
        },
        inputBefore: {
          what: "This section serves as the algorithm's input area. Select the operation mode (Encryption or Decryption), specify the key size, enter the secret key, and provide the text to be encrypted or decrypted.",
          how: "Step 1: Choose mode (Encryption or Decryption). This determines whether the simulation runs the forward AES steps (Encryption) or the inverse steps (Decryption). \nFor Decryption you must use the same key size and key that were used to produce the ciphertext.\n\nStep 2: Select Key Size (128, 192, or 256 bits). The key size sets the expected key length and the number of AES rounds.\n\nStep 3: Enter the text to process. For Encryption, provide plaintext of up to 16 characters using the English alphabet (spaces and numbers are also allowed). For Decryption, provide the ciphertext as exactly 32 hexadecimal characters (no spaces allowed).\n\nStep 4: Enter the secret key that corresponds to the selected key size (16, 24, or 32 characters). For Decryption, this must be the original key that was used during encryption.\n\nStep 5: Click Submit to start the step-by-step simulation.",
        },
        inputAfter: {
          what: "This page summarizes all the parameters selected for the AES operation and shows how your input is prepared before the algorithm steps begin.",
          how: "This tool lets you explore the AES algorithm step by step, giving you full control over each round and operation. Use the navigation options below to move through the algorithm at your own pace and focus on the parts you want to understand.\n\n• Use the sidebar to select any AES round and jump directly to a specific step.\n\n• Use the Previous / Next Step buttons to move through the algorithm steps within the current round.\n\n• Use the Previous / Next Round buttons to navigate between AES rounds.\n\n• The Input button returns you to the input and configuration summary page.\n\n• The Final Round button takes you directly to the last round of the AES algorithm.\n\nEnjoy exploring AES!",
        },
        result: {
          what: "The step-by-step AES process has now been completed!\nThis page presents a complete overview of the AES outcome, showing how plaintext, ciphertext and key are processed and transformed into the final result.",
          how: "You have reached the end of the step-by-step AES process!\n\nIf you'd like to try again with different values, you can restart the process at any time by clicking the STEP-BY-STEP button in the navigation bar, or revisit any round and step to review how the algorithm works in detail.\n\nWhen you feel confident with the AES process, head over to the Training page to challenge yourself and practice the AES steps on your own.\nGood luck!",
        },
      },
      navigation: {
        input: "INPUT",
        previousRound: "PREVIOUS ROUND",
        previousStep: "PREVIOUS STEP",
        nextStep: "NEXT STEP",
        nextRound: "NEXT ROUND",
        finalRound: "FINAL ROUND",
        result: "RESULT",
        submit: "SUBMIT",
      },
      addRoundKey: {
        line: "Current State [{{r}}, {{c}}] XOR Round Key [{{r}}, {{c}}] = Result [{{r}}, {{c}}]",
        table: {
          state: "State",
          hex: "Hex",
          binary: "Binary",
        },
        currentState: "Current State [{{r}}, {{c}}]",
        roundKey: "Round Key [{{r}}, {{c}}]",
        nextState: "Next State [{{r}}, {{c}}]",
      },
    },
  },
  train: {
    title: "AES Training Center",
    welcome:
      "Welcome to the AES Training Center! Here you can practice each step of the AES algorithm in an interactive way. Choose an exercise below to get started and test your understanding. Need help along the way? Click the icon at any step to get guidance.",
    welcomeStart: `Welcome to the AES Training Center! 
Here you can practice each step of the AES algorithm in an interactive way. 
Choose an exercise below to get started and test your understanding. 
Need help along the way? Click the`,
    welcomeEnd: "icon at any step to get guidance.",
    selectStep: "Select a step to train on:",
    backToList: "Back to Exercise List",
    practice: {
      subbytes: "SubBytes", //name of buttons and title of practice page
      shiftrows: "ShiftRows ",
      mixcolumns: "MixColumns ",
      invmixcolumns: "InvMixColumns ",
      invshiftrows: "InvShiftRows ",
      addroundkey: "AddRoundKey ",
      keyexpansion: "Key Expansion",
      keyexpansionPage: {
        selectKeySize: "Select key size:",
        originalKey: "Original Key (words):",
        newKey: "New Key",
        expandedKeyWords: "Expanded Key Words (fill the blanks):",
        stepGuidance: "Step guidance — compute w[{{i}}]",
        rotate: "Rotate:",
        "rotate.desc": "move the first byte to the end.",
        subword: "SubWord:",
        "subword.desc": "substitute each byte using the S-box.",
        xorRcon: "XOR Rcon:",
        "xorRcon.desc": "XOR the result with the round constant (Rcon).",
        xorPrev: "XOR w[i - {{Nk}}]:",
        "xorPrev.desc":
          "XOR the result with the first word of the previous round key to produce w[i].",
        label: {
          rotword: "RotWord(w[i - 1])",
          subwordRcon: "SubWord XOR Rcon",
        },
        case: {
          special: {
            title: "Case 1 — Special transform (i % {{mod}} === 0)",
            intro: "Apply the following steps to the previous word, in order:",
          },
          subonly: {
            title: "Case 2 — Mid-cycle SubWord (i % {{mod}} === 4)",
            intro: "Apply the following steps to the previous word, in order:",
          },
          simple: {
            title: "Case 3 — Simple XOR",
            formula: "w[i] = w[i - {{offset}}] XOR w[i - 1]",
          },
        },
        resultDialog: {
          Congratulations: "Correct! Continue to the next word.",
          message: "You calculated all words of the expanded key.",
          continueButton: "Continue with New Key",
        },
        buttons: {
          check: "Check",
          show: "Show Solution",
          next: "Next word",
          checkRot: "Check",
          checkSub: "Check",
          checkRcon: "Check ",
        },
        resultXor: "Result XOR w[i - {{Nk}}] = w[{{i}}]",
        help: `AES uses a different key for each encryption round.
Key Expansion is the process that generates all these round keys from the original key.

The original key is split into words (1 word = 4 bytes).
New words are created one by one by combining previous words and, at specific points, applying special transformations (byte rotation, S-box substitution, and a round constant).

The key size determines how often these special steps are applied:
  • AES-128 (16 bytes / 4 words):
    A special transformation is applied every 4th word.
  • AES-192 (24 bytes / 6 words):
    A special transformation is applied every 6th word.
  • AES-256 (32 bytes / 8 words):
    AES-256 uses three cases when computing new words (special transform every 8th word, an extra SubWord-only step at i%8===4, and simple XOR otherwise).

There are three cases for AES-256 when computing a new word w[i]:

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

Case 3 — Simple XOR (all other words)
  - w[i] = w[i - 8] XOR w[i - 1]

Notes:
• AES requires one round key per round, plus one initial key.
• Each round key consists of 4 words 

The total number of expanded words generated is:
  • AES-128: 44 words
  • AES-192: 52 words
  • AES-256: 60 words`,
      },
      invsubbytes: "InvSubBytes ",
      applySubBytes:
        "Apply the SubBytes transformation by replacing each byte using the AES S-box lookup table",
      originalMatrix: "State Matrix (hex):",
      yourAnswers: "Enter Result (hex):",
      check: "Check Answers",
      showSolution: "Show Solution",
      next: "Next Example",
      correct: "Correct! Continue to the next example.",
      incorrect: "Some answers are incorrect. Please try again.",
      solutionMsg: "All correct answers are now filled.",
      "shiftrows.description":
        "Apply the ShiftRows transformation by cyclically shifting each row left by a specific offset.",
      "mixcolumns.description":
        "In MixColumns, each column of the original matrix (4 bytes) is multiplied by fixed matrix using arithmetic in GF(2⁸). Enter the resulting byte values for each cell after the MixColumns step. Note: You can use the helper below to see how each output is calculated.",
      "invmixcolumns.description":
        "InvMixColumns is the inverse of the MixColumns step and is used during AES decryption. In this step, each column of the original matrix (4 bytes) is multiplied by Fixed Matrix using arithmetic in GF(2⁸). Enter the resulting byte values for each cell after the InvMixColumns step. Note: You can use the helper below to see how each output is calculated.",
      "invshiftrows.description":
        "Apply the inverse ShiftRows transformation by cyclically rotating each row to the right by a specific offset.",
      "addroundkey.description":
        "Apply the AddRoundKey transformation by XORing each byte of the state matrix with the corresponding byte of the round key. Enter your answers in hexadecimal format.",
      "invsubbytes.description":
        "Apply the InvSubBytes transformation by replacing each byte using the AES inverse S-box lookup table",
      "mixcolumns.selectColumn": "Select which column to analyze:",
      "invmixcolumns.selectColumn": "Select which column to analyze:",
      "mixcolumns.outputLabel": "Enter Result (hex):",
      "invmixcolumns.outputLabel": "Enter Result (hex):",
      "mixcolumns.calculator": {
        title: "Step-by-Step MixColumns Calculation:",
        fixedMatrix: "Fixed Matrix:",
        selectedColumn: "Selected Column:",
        rowShow: "Please continue with the next calculation.",
        rowCorrect: "Correct! Please continue with the next calculation.",
        rowIncorrect: "Incorrect result. Please try again.",
        calculateOutput: "Calculate each output byte (row) for this column:",
        outputRow: "Output Row b",
        enterMultiplication:
          "Enter each multiplication result (hex), then XOR them to get the output byte.",
        column: "Column",
        check: "CHECK",
        show: "SHOW",
      },
      "invmixcolumns.calculator": {
        title: "Step-by-Step InvMixColumns Calculation:",
        fixedMatrix: "Fixed Matrix:",
        selectedColumn: "Selected Column:",
        calculateOutput:
          "Calculate each output byte(row) for the selected column:",
        outputRow: "Output Row b",
        enterMultiplication:
          "Enter each multiplication result (hex), then XOR them to get the output byte.",
        column: "Column",
        check: "CHECK",
        show: "SHOW",
      },
      tooltips: {
        subbytes: {
          title: "What is SubBytes?",
          description:
            "SubBytes is the step in AES where each byte is replaced with a new byte according to a predefined substitution table called the S-box. To perform this step, take the byte in hex: the first hex digit indicates the row in the S-box, and the second hex digit indicates the column. The value found at that position becomes the substituted byte.",
          hintStart: "Click the ", //icon
          hintEnd: " icon in the navbar to view the S-box lookup table.",
        },
        shiftrows: {
          title: "What is ShiftRows?",
          description: ` ShiftRows is a transposition step in AES. Each row of the state matrix is shifted left by a different offset: 
• Row 0: No shift, 
• Row 1: Shift left by 1, 
• Row 2: Shift left by 2, 
• Row 3: Shift left by 3. 
          
Enter the shifted values for each row in hexadecimal format.`,
        },
        mixcolumns: {
          title: "AES MixColumns – Step-by-Step Guide",
          description: `MixColumns Matrix:
Each column is multiplied by this matrix:
| 02 | 03 | 01 | 01 |
| 01 | 02 | 03 | 01 |
| 01 | 01 | 02 | 03 |
| 03 | 01 | 01 | 02 |

Each new byte is computed as:
• S′₀ = (02 × S₀) ⊕ (03 × S₁) ⊕ (01 × S₂) ⊕ (01 × S₃)
• S′₁ = (01 × S₀) ⊕ (02 × S₁) ⊕ (03 × S₂) ⊕ (01 × S₃)
• S′₂ = (01 × S₀) ⊕ (01 × S₁) ⊕ (02 × S₂) ⊕ (03 × S₃)
• S′₃ = (03 × S₀) ⊕ (01 × S₁) ⊕ (01 × S₂) ⊕ (02 × S₃)

Multiplication rules (GF(2^8)):
• 01 × X = X
• 02 × X = (X Shift Left). If MSB = 1, XOR with 1B (hex)
• 03 × X = (02 × X) ⊕ X`,
          hint: "Tips:",
          hintContent: `• XOR = bitwise addition without carry
• Every column is processed independently`,
        },
        invmixcolumns: {
          title: "AES InvMixColumns – Step-by-Step Guide",
          description: `InvMixColumns Matrix:
Each column is multiplied by this fixed matrix:
| 0E | 0B | 0D | 09 |
| 09 | 0E | 0B | 0D |
| 0D | 09 | 0E | 0B |
| 0B | 0D | 09 | 0E |

Each new byte is computed as:

• S′₀ = (0E × S₀) ⊕ (0B × S₁) ⊕ (0D × S₂) ⊕ (09 × S₃)
• S′₁ = (09 × S₀) ⊕ (0E × S₁) ⊕ (0B × S₂) ⊕ (0D × S₃)
• S′₂ = (0D × S₀) ⊕ (09 × S₁) ⊕ (0E × S₂) ⊕ (0B × S₃)
• S′₃ = (0B × S₀) ⊕ (0D × S₁) ⊕ (09 × S₂) ⊕ (0E × S₃)

Multiplication rules (GF(2^8)) for inverse coefficients:

• 09 × X = (02 × (02 × (02 × X))) ⊕ X = (08 × X) ⊕ X
• 0B × X = (02 × (02 × (02 × X))) ⊕ (02 × X) ⊕ X = (08 × X) ⊕ (02 × X) ⊕ X
• 0D × X = (02 × (02 × (02 × X))) ⊕ (02 × (02 × X)) ⊕ X = (08 × X) ⊕ (04 × X) ⊕ X
• 0E × X = (02 × (02 × (02 × X))) ⊕ (02 × (02 × X)) ⊕ (02 × X) = (08 × X) ⊕ (04 × X) ⊕ (02 × X)`,
          hint: "Notes:",
          hintContent: `• XOR = bitwise addition without carry
• 02 × X = (X Shift Left). If MSB = 1, XOR with 1B (hex)
• Use combinations of (02×) and XOR to compute 09, 0B, 0D, 0E products
• Every column is processed independently`,
        },
        invshiftrows: {
          title: "What is InvShiftRows?",
          description: ` InvShiftRows is the inverse transposition step in AES decryption. Each row of the original matrix is shifted right by a different offset: 
• Row 0: No shift, 
• Row 1: Shift right by 1 
• Row 2: Shift right by 2 
• Row 3: Shift right by 3
          
Enter the shifted values for each row in hexadecimal format.`,
        },
        invsubbytes: {
          title: "What is InvSubBytes?",
          description: `InvSubBytes is the inverse operation of SubBytes used in AES decryption. Each byte is replaced with a new byte according to a predefined substitution table called inverse S-box. 
          
To perform this step, take the byte in hex: 
  • the first hex digit indicates the row in the S-box
  • the second hex digit indicates the column. 
The value found at that position becomes the inverse-substituted byte.`,
          hint: "Hint:",
          hint_textStart:
            "Enter the substituted values in hexadecimal format. Click the ",
          hint_textEnd:
            " icon in the navigation bar to view the inverse S-box lookup table.",
        },
        addroundkey: {
          title: "What is AddRoundKey?",
          description:
            "AddRoundKey is a step in AES where each byte of the state matrix is combined with the corresponding byte of the round key using the XOR operation (⊕).",
          hint: "Hint:",
          hint_textStart:
            "Convert each byte to binary, perform XOR bit by bit, then convert back to hexadecimal. Click the",
          hint_textEnd: "icon in the navigation bar to open the converter.",
        },
        keyexpansion: {
          title: "What is Key Expansion?",
          description:
            "AES uses a different key for each encryption round. Key Expansion is the process that generates all these round keys from the original key. The original key is split into words (1 word = 4 bytes). New words are created one by one by combining previous words and, at specific points, applying special transformations (byte rotation, S-box substitution, and a round constant). The key size determines how often these special steps are applied: AES-128 (16 bytes / 4 words): A special transformation is applied every 4th word. AES-192 (24 bytes / 6 words): A special transformation is applied every 6th word. AES-256 (32 bytes / 8 words): AES-256 uses three cases when computing new words (special transform every 8th word, an extra SubWord-only step at i%8===4, and simple XOR otherwise).",
          hint: "Follow the key expansion algorithm carefully. Enter your answers in hexadecimal format.",
        },
      },
    },
  },
  tooltips: {
    keyexpansion: {
      title: "What is Key Expansion?",
      description: `AES uses a different key for each encryption round.
Key Expansion is the process that generates all these round keys from the original key.

The original key is split into words (1 word = 4 bytes).
New words are created one by one by combining previous words and, at specific points, applying special transformations (byte rotation, S-box substitution, and a round constant).`,
      hint: "Hint: Click the icon to view the full explanation.",
    },
  },
  keyexpansion_help: `AES uses a different key for each encryption round.
Key Expansion is the process that generates all these round keys from the original key.

The original key is split into words (1 word = 4 bytes).
New words are created one by one by combining previous words and, at specific points, applying special transformations (byte rotation, S-box substitution, and a round constant).`,
  learnMore: {
    pageTitle: "What is AES",
    pageSubtitle: "An approachable overview of AES and its main stages.",
    sections: {
      whatIsAES: {
        title: "What is AES",
        text: "AES (Advanced Encryption Standard) is a symmetric-key encryption algorithm that encrypts data in 128-bit blocks using a key of 128, 192, or 256 bits.",
        caption: "AES workflow: input → block processing → ciphertext.",
      },
      keySharing: {
        title: "How keys are shared",
        text: "Sender and receiver must share the same secret key through a secure channel before encrypted communication.",
        caption: "Symmetric key distribution (out-of-band secure channel).",
      },
      encryptionRounds: {
        title: "Encryption rounds",
        text: "AES performs a number of rounds involving SubBytes, ShiftRows, MixColumns and AddRoundKey. The final round omits MixColumns.",
        caption: "Encryption round sequence (high level).",
      },
      decryptionRounds: {
        title: "Decryption rounds",
        text: "Decryption applies the inverse operations in reverse order using the expanded key schedule.",
        caption: "Decryption round sequence (high level).",
      },
    },
    navigation: {
      upAriaLabel: "up",
      downAriaLabel: "down",
      sectionNavigation: "Section navigation",
    },
  },
};

export default translation;
