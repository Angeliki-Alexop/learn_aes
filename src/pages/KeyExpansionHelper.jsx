import { sBox, rCon } from "../utils/aes_manual_v2";

// Utility function for column explanations in key expansion
export function getColumnsForExplanations(matrixIdx, colIdx, roundKeys, toHex, keySize, formatAsMatrix) {
  const n = 4;
  const offset = keySize / 32;
  const columnDataMap = new Map();

  // Current word
  const currentMatrix = formatAsMatrix(toHex(roundKeys[matrixIdx]));
  columnDataMap.set(
    `current-${matrixIdx}-${colIdx}`,
    {
      column: "current word",
      matrix: matrixIdx,
      colidx: colIdx,
      data: currentMatrix.map(row => row[colIdx])
    }
  );
  // Previous word
  if (colIdx === 0 && matrixIdx > 0) {
    const prevMatrix = formatAsMatrix(toHex(roundKeys[matrixIdx - 1]));
    columnDataMap.set(
      `previous-${matrixIdx - 1}-${n - 1}`,
      {
        column: "previous word",
        matrix: matrixIdx - 1,
        colidx: n - 1,
        data: prevMatrix.map(row => row[n - 1])
      }
    );
  } else {
    columnDataMap.set(
      `previous-${matrixIdx}-${(colIdx - 1 + n) % n}`,
      {
        column: "previous word",
        matrix: matrixIdx,
        colidx: (colIdx - 1 + n) % n,
        data: currentMatrix.map(row => row[(colIdx - 1 + n) % n])
      }
    );
  }
  // offset word before
  if (offset === 4 && matrixIdx > 0) {
    const beforeMatrix = formatAsMatrix(toHex(roundKeys[matrixIdx - 1]));
    columnDataMap.set(
      `offset-${matrixIdx - 1}-${colIdx}`,
      {
        column: "offset word before",
        matrix: matrixIdx - 1,
        colidx: colIdx,
        data: beforeMatrix.map(row => row[colIdx])
      }
    );
  } else if (offset === 8 && matrixIdx > 1) {
    const beforeMatrix = formatAsMatrix(toHex(roundKeys[matrixIdx - 2]));
    columnDataMap.set(
      `offset-${matrixIdx - 2}-${colIdx}`,
      {
        column: "offset word before",
        matrix: matrixIdx - 2,
        colidx: colIdx,
        data: beforeMatrix.map(row => row[colIdx])
      }
    );
  } else if (offset === 6 && matrixIdx > 0 && colIdx < 2) {
    const targetCol = 2 + colIdx;
    const beforeMatrix = formatAsMatrix(toHex(roundKeys[matrixIdx - 2]));
    columnDataMap.set(
      `offset-${matrixIdx - 2}-${targetCol}`,
      {
        column: "offset word before",
        matrix: matrixIdx - 2,
        colidx: targetCol,
        data: beforeMatrix.map(row => row[targetCol])
      }
    );
  } else if (offset === 6 && matrixIdx > 0 && colIdx >= 2) {
    const targetCol = colIdx - 2;
    const beforeMatrix = formatAsMatrix(toHex(roundKeys[matrixIdx - 1]));
    columnDataMap.set(
      `offset-${matrixIdx - 1}-${targetCol}`,
      {
        column: "offset word before",
        matrix: matrixIdx - 1,
        colidx: targetCol,
        data: beforeMatrix.map(row => row[targetCol])
      }
    );
  }

  return columnDataMap;
}

// Utility function for calculating highlighted columns by matrix
export function getHighlightedColumnsByMatrix(matrixIdx, colIdx, keySize) {
  const n = 4;
  const offset = keySize / 32;
  let updated = {};
  updated[matrixIdx] = [colIdx];

  const prevCol = (colIdx - 1 + n) % n;
  if (colIdx === 0 && matrixIdx > 0) {
    updated[matrixIdx - 1] = [n - 1];
  } else {
    updated[matrixIdx].push(prevCol);
  }

  if (offset === 4 && matrixIdx > 0) {
    updated[matrixIdx - 1] = updated[matrixIdx - 1]
      ? [...updated[matrixIdx - 1], colIdx]
      : [colIdx];
  } else if (offset === 8 && matrixIdx > 1) {
    updated[matrixIdx - 2] = updated[matrixIdx - 2]
      ? [...updated[matrixIdx - 2], colIdx]
      : [colIdx];
  } else if (offset === 6 && matrixIdx > 0 && colIdx < 2) {
    const targetCol = 2 + colIdx;
    updated[matrixIdx - 2] = updated[matrixIdx - 2]
      ? [...updated[matrixIdx - 2], targetCol]
      : [targetCol];
  } else if (offset === 6 && matrixIdx > 0 && colIdx >= 2) {
    const targetCol = colIdx - 2;
    updated[matrixIdx - 1] = updated[matrixIdx - 1]
      ? [...updated[matrixIdx - 1], targetCol]
      : [targetCol];
  }

  return updated;
}
// Utility function to get visual explanation columns correct
export function getExplanationColumns({ matrixIdx, colIdx, sortedColumns, keySize }) {
  const n = 4;
  const offset = keySize / 32;
  const isSpecialCol = ((colIdx + matrixIdx * n) % offset) === 0;

  const xorEntry = { column: "XOR", matrix: null, colidx: null, data: ["", "XOR", "", ""] };
  const rotateEntry = { column: "Rotate", matrix: null, colidx: null, data: ["", "Rotate", "", ""] };
  const subEntry = { column: "Substitute", matrix: null, colidx: null, data: ["", "Substitute", "", ""] };
  const equalsEntry = { column: "Equals", matrix: null, colidx: null, data: ["", "=", "", ""] };

  // Rotated word
  const prevWord = sortedColumns[0].data;
  const roratedWordData = [prevWord[1], prevWord[2], prevWord[3], prevWord[0]];
  const roratedWord = {
    column: "Rotated Word",
    matrix: sortedColumns[0].matrix,
    colidx: sortedColumns[0].colidx,
    data: roratedWordData
  };

  // Substituted word
  const subbedWordData = roratedWordData.map(byte =>
    typeof byte === "string"
      ? sBox[parseInt(byte, 16)].toString(16).padStart(2, "0")
      : sBox[byte].toString(16).padStart(2, "0")
  );
  const subbedWord = {
    column: "Substituted Word",
    matrix: sortedColumns[0].matrix,
    colidx: sortedColumns[0].colidx,
    data: subbedWordData
  };

  // Rcon word
  const rconIndex = Math.floor((colIdx + matrixIdx * n) / offset);
  const rconValue = rCon[rconIndex];
  const rconWord = {
    column: "Rcon",
    matrix: null,
    colidx: null,
    data: [
      rconValue ? rconValue.toString(16).padStart(2, "0") : "00",
      "00",
      "00",
      "00"
    ]
  };

  // Build the explanation columns
  return isSpecialCol
    ? [
        sortedColumns[0],
        rotateEntry,
        roratedWord,
        subEntry,
        subbedWord,
        xorEntry,
        sortedColumns[1],
        xorEntry,
        rconWord,
        equalsEntry,
        sortedColumns[2]
      ]
    : [
        sortedColumns[0],
        xorEntry,
        sortedColumns[1],
        xorEntry,
        sortedColumns[2]
      ];
}