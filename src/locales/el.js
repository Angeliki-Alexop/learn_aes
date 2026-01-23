const translation = {
  nav: {
    stepByStep: 'Βήμα-βήμα',
    training: 'Εκπαίδευση',
    learnMore: 'Μάθετε περισσότερα',
    sbox: 'S-box',
    calculator: 'Υπολογιστής',
  },
  keyExpansion: {
    aes128: `Επεξήγηση (AES-128)\n\nΞεκινήστε με 4 λέξεις από το κλειδί των 128-bit.\nΓια κάθε νέα λέξη:\n- Αντιγράψτε την προηγούμενη λέξη.\n- Αν είμαστε σε πολλαπλάσιο του 4 (κάθε 4η λέξη):\n    Περιστρέψτε τα bytes αριστερά (RotWord).\n    Αντικαταστήστε κάθε byte με το S-box (SubWord).\n    Κάντε XOR το πρώτο byte με το round constant (Rcon).\n- Κάντε XOR το αποτέλεσμα με τη λέξη 4 θέσεις πριν.\n\nΕπαναλάβετε μέχρι να έχετε 44 λέξεις (11 round keys).`,
    aes192: `Επεξήγηση (AES-192)\n\nΞεκινήστε με 6 λέξεις από το κλειδί των 192-bit.\nΓια κάθε νέα λέξη:\n- Πάρτε την προηγούμενη λέξη.\n- Αν είμαστε σε πολλαπλάσιο του 6:\n    Περιστρέψτε τα bytes (RotWord).\n    Εφαρμόστε αντικατάσταση S-box (SubWord).\n    Κάντε XOR με το round constant (Rcon).\n- Κάντε XOR το αποτέλεσμα με τη λέξη 6 θέσεις πριν.\n\nΣυνεχίστε μέχρι να έχετε 52 λέξεις (13 round keys).`,
    aes256: `Επεξήγηση (AES-256)\n\nΞεκινήστε με 8 λέξεις από το κλειδί των 256-bit.\nΓια κάθε νέα λέξη:\n- Πάρτε την προηγούμενη λέξη.\n- Αν είμαστε σε πολλαπλάσιο του 8 (κάθε 8η λέξη):\n    Περιστρέψτε τα bytes (RotWord).\n    Αντικαταστήστε με το S-box (SubWord).\n    Κάντε XOR με το round constant (Rcon).\n- Εναλλακτικά, αν είμαστε 4 λέξεις μετά από πολλαπλάσιο του 8 (i mod 8 == 4):\n    Εφαρμόστε SubWord (μόνο αντικατάσταση S-box).\n- Διαφορετικά, αφήστε τη λέξη ως έχει.\n- Κάντε XOR το αποτέλεσμα με τη λέξη 8 θέσεις πριν.\n\nΣυνεχίστε μέχρι να έχετε 60 λέξεις (15 round keys).`,
  },
  pages: {
    stepByStep: {
      input: {
        title: 'Εξερευνώντας το Πρότυπο Advanced Encryption Standard (AES)',
        description:
          'Καλώς ήρθατε! Αυτό το διαδραστικό εργαλείο θα σας καθοδηγήσει βήμα-βήμα στο αλγόριθμο AES, κάνοντας εύκολο να καταλάβετε πώς λειτουργεί κάθε λειτουργία. Χρησιμοποιήστε το AES Helper για επιπλέον εξηγήσεις, δείτε τι συμβαίνει σε κάθε στάδιο και μάθετε πώς να αλληλεπιδράτε με το εργαλείο για να εξερευνήσετε όλες τις δυνατότητες.',
        subtitle: {
          encrypt: 'Κρυπτογράφηση AES',
          decrypt: 'Αποκρυπτογράφηση AES',
        },
        selectModeLabel: 'Επιλέξτε τη λειτουργία:',
        controls: {
          encryptButton: 'ΚΡΥΠΤΟΓΡΑΦΗΣΗ',
          decryptButton: 'ΑΠΟΚΡΥΠΤΟΓΡΑΦΗΣΗ',
          submit: 'Υποβολή',
        },
        selectKeySizeLabel: 'Επιλέξτε το μέγεθος κλειδιού:',
        labels: {
          keySize: 'Μέγεθος Κλειδιού',
          plaintext: 'Κείμενο (plaintext)',
          ciphertextHex: 'Κρυπτοκείμενο (Hex)',
          key: 'Κλειδί για AES',
        },
        keySizeOptions: {
          '128': '128 bits',
          '192': '192 bits',
          '256': '256 bits',
        },
      },
      errors: {
        plaintext: {
          tooLong: 'Το plaintext πρέπει να έχει το πολύ 16 χαρακτήρες',
        },
        ciphertext: {
          onlyHex: 'Επιτρέπονται μόνο δεκαεξαδικοί χαρακτήρες (0-9, A-F)',
          hexLength: 'Το Hex πρέπει να είναι ακριβώς 32 δεκαεξαδικοί χαρακτήρες (16 bytes)',
          base64Length: 'Το Base64 πρέπει να αποκωδικοποιεί σε ακριβώς 16 bytes',
          invalidBase64: 'Μη έγκυρο Base64 string',
        },
      },
      summary: {
        heading: 'Περίληψη εισόδου',
        labels: {
          ciphertext: 'Κρυπτοκείμενο',
          plaintext: 'Κείμενο (plaintext)',
          plaintextHex: 'Κείμενο (Hex)',
          paddedPlaintextHex: 'Προσθαφαιρημένο κείμενο (Hex)',
          keyHex: 'Κλειδί για AES (Hex)',
          operationMode: 'Λειτουργία λειτουργίας',
          keySizeDisplay: 'Μέγεθος κλειδιού',
        },
        tooltips: {
          ciphertext: 'Το κρυπτοκείμενο που παρέχεται ως είσοδος στη διαδικασία αποκρυπτογράφησης',
          plaintext: 'Το αρχικό κείμενο που εισήγαγε ο χρήστης',
          plaintextHex: 'Η δεκαεξαδική αναπαράσταση του κειμένου',
          paddedPlaintextHex: 'Το κείμενο μετά την εφαρμογή PKCS#7 για να ταιριάξει το μέγεθος μπλοκ του AES (16 bytes) σε δεκαεξαδική μορφή.',
          key: 'Κλειδί που παρέχεται από τον χρήστη',
          operationMode: 'Επιλεγμένη λειτουργία Encrypt ή Decrypt',
          keySize: 'Επιλεγμένο μέγεθος κλειδιού σε bits',
        },
      },
      dynamic: {
        roundStep: 'Γύρος {{round}} - Βήμα: {{step}}',
      },
      labels: {
        roundKey: 'Round Key',
      },
      matrix: {
        shiftRowsTable: 'Πίνακας ShiftRows',
        sbox: 'S-Box',
        inverseSBox: 'Αντίστροφο S-Box',
  inverseFixedMatrix: 'Αντίστροφη Σταθερό Μητρώο',
  fixedMatrix: 'Σταθερό Μητρώο',
        roundKey: 'Round Key',
        currentState: 'Τρέχουσα Κατάσταση',
        nextState: 'Επόμενη Κατάσταση',
      },
      sidebar: {
        input: 'Είσοδος',
        keySchedule: 'Key Schedule',
        result: 'Αποτέλεσμα',
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
      navigation: {
        input: 'ΕΙΣΟΔΟΣ',
        previousRound: 'ΠΡΟΗΓΟΥΜΕΝΟΣ ΓΥΡΟΣ',
        previousStep: 'ΠΡΟΗΓΟΥΜΕΝΟ ΒΗΜΑ',
        nextStep: 'ΕΠΟΜΕΝΟ ΒΗΜΑ',
        nextRound: 'ΕΠΟΜΕΝΟΣ ΓΥΡΟΣ',
  finalRound: 'ΤΕΛΕΥΤΑΙΟΣ ΓΥΡΟΣ',
  result: 'ΑΠΟΤΕΛΕΣΜΑ',
        submit: 'ΥΠΟΒΟΛΗ',
      },
      addRoundKey: {
        line: 'Current State [{{r}}, {{c}}] XOR Round Key [{{r}}, {{c}}] = Result [{{r}}, {{c}}]',
        table: {
          state: 'Κατάσταση',
          hex: 'Hex',
          binary: 'Δυαδικό',
        },
        currentState: 'Τρέχουσα Κατάσταση [{{r}}, {{c}}]',
        roundKey: 'Round Key [{{r}}, {{c}}]',
        nextState: 'Επόμενη Κατάσταση [{{r}}, {{c}}]'
      },
      keySchedule: {
        title: 'Key Schedule - Key Expansion',
        allRoundKeys: 'Όλα τα round keys (μορφή μητρώου)',
        roundLabel: 'Γύρος {{n}}',
        columns: {
          previousWord: 'w[i-1]',
          offsetWordBefore: 'w[i - {{offset}}]',
          currentWord: 'Επιλεγμένη λέξη',
          XOR: 'XOR',
          Rotate: 'Περιστροφή',
          Substitute: 'Αντικατάσταση',
          Rotated: 'Περιστραμμένη λέξη',
          SubstitutedWord: 'SubWord',
          Rcon: 'Rcon',
          Equals: 'Ισούται',
        },
        explanations: {
          case1: `Case 1 — (i % {{mod}} === 0)\n\nΕφαρμόζουμε τα παρακάτω στη λέξη w[i-1]:\n1. Περιστροφή: μετακινήστε το πρώτο byte στο τέλος.\n2. Αντικατάσταση (SubWord): αντικαταστήστε κάθε byte με το S-box.\n3. XOR Rcon: XOR με το round constant (Rcon).\n4. XOR w[i - {{offset}}]: XOR με τη λέξη {{offset}} θέσεις πριν για να προκύψει w[i].`,
          case2: `Case 2 — Απλό XOR\n\nw[i] = w[i - {{offset}}] XOR w[i - 1]`,
          case2_mid: `Case 2 — Ενδιάμεσο κύκλου SubWord (i % {{mod}} === {{mid}})\n\nΕφαρμόζουμε: SubWord στο w[i-1] και μετά XOR με w[i - {{offset}}] για να προκύψει w[i].`,
        },
        
      },
    },
  },
};

export default translation;

