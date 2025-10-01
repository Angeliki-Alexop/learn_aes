function toBinary(hex) {
  return parseInt(hex, 16).toString(2).padStart(8, "0");
}

function groupBinary(binStr) {
  return binStr.slice(0, 4) + " " + binStr.slice(4);
}

function shiftLeft(hex) {
  const val = parseInt(hex, 16);
  const shifted = (val << 1) & 0xFF;
  return shifted.toString(16).padStart(2, "0");
}

function xorHex(hex1, hex2) {
  const val1 = parseInt(hex1, 16);
  const val2 = parseInt(hex2, 16);
  const xor = val1 ^ val2;
  return xor.toString(16).padStart(2, "0");
}

export function getMixColumnsTableData(mappedValues) {
  const allowed = new Set(["02", "03"]);
  const seen = new Set();
  const tables = [];

  mappedValues.forEach(pair => {
    const { fixed, prev } = pair;
    if (!allowed.has(fixed) || seen.has(fixed)) return;
    seen.add(fixed);

    const prevBin = groupBinary(toBinary(prev));
    const shiftedHex = shiftLeft(prev);
    const shiftedBin = groupBinary(toBinary(shiftedHex));
    const xorBin = groupBinary(toBinary("1B"));

    // XOR shiftedHex with 1B
    const equalsHex = xorHex(shiftedHex, "1B");
    const equalsBin = groupBinary(toBinary(equalsHex));

    // For table 03: XOR prev with shiftedHex
    let xorWithShiftedBin = "";
    if (fixed === "03") {
      const xorWithShiftedHex = xorHex(prev, shiftedHex);
      xorWithShiftedBin = groupBinary(toBinary(xorWithShiftedHex));
    }

    // Check for overflow: if highest bit of prev is 1
    const prevInt = parseInt(prev, 16);
    const overflow = (prevInt & 0x80) !== 0;

    // Table rows: label | value
    const rows = [
      ["Value", prev],
      ["Binary", prevBin],
      ["Shifted", shiftedBin],
    ];
    if (overflow) {
      rows.push(["XOR 1B", xorBin]);
      rows.push([`equals 2*${prev}`, equalsBin]);
    } else {
      rows.push([`equals 2*${prev}`, shiftedBin]);
    }

    // Conditionally add extra rows for table 03
    if (fixed === "03") {
      rows.push(["XOR", prevBin]);
      rows.push([`equals 3*${prev}`, xorWithShiftedBin]);
    }

    tables.push({
      name: `Table for ${fixed}`,
      rows,
      key: fixed,
    });
  });

  return tables;
}

export function getMixColumnsResultTable(mappedValues, selectedCellValue) {
  const rows = mappedValues.map(pair => {
    const { fixed, prev } = pair;
    const prevBin = groupBinary(toBinary(prev));
    const shiftedHex = shiftLeft(prev);
    const shiftedBin = groupBinary(toBinary(shiftedHex));
    const equalsHex = xorHex(shiftedHex, "1B");
    const equalsBin = groupBinary(toBinary(equalsHex));
    const prevInt = parseInt(prev, 16);
    const overflow = (prevInt & 0x80) !== 0;

    let resultBin;
    if (fixed === "03") {
      const xorWithShiftedHex = xorHex(prev, shiftedHex);
      const xorWithShiftedBin = groupBinary(toBinary(xorWithShiftedHex));
      resultBin = xorWithShiftedBin;
    } else if (fixed === "02") {
      resultBin = overflow ? equalsBin : shiftedBin;
    } else {
      resultBin = prevBin;
    }

    return [
      `${fixed} * ${prev}`,
      resultBin
    ];
  });

  // Add the last row for the selected cell
  if (selectedCellValue) {
    rows.push([
      "XOR equals",
      groupBinary(toBinary(selectedCellValue))
    ]);
  }

  return rows;
}