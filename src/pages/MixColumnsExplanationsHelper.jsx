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
  // include "01" so we also show its explanatory table
  const allowed = new Set(["01", "02", "03"]);
  const counts = {}; // track occurrences per fixed value
  const tables = [];

  mappedValues.forEach((pair, idx) => {
    const { fixed, prev } = pair;
    if (!allowed.has(fixed)) return;

    // increment occurrence count and build a unique key/name if needed
    counts[fixed] = (counts[fixed] || 0) + 1;
    const occ = counts[fixed];
    const key = occ > 1 ? `${fixed}-${occ}` : fixed;
    // use the actual algebraic expression as the displayed heading
    const name = `${fixed} * ${prev}`;

    const prevBin = groupBinary(toBinary(prev));

    // Special-case for 01: it's just the value itself
    if (fixed === "01") {
      const rows = [
        ["Value", prev],
        ["Binary", prevBin],
        [`equals 01*${prev}`, prevBin],
      ];
      // include fixed so the UI can color-code per operator
      tables.push({ name, rows, key, fixed });
      return;
    }

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
      ["Shifted:mixColumns", shiftedBin],
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

    // include fixed so the UI can color-code per operator
    tables.push({ name, rows, key, fixed });
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

  // Add the last two rows for the selected cell
  if (selectedCellValue) {
    rows.push([
      "XOR",
      ""
    ]);
    rows.push([
      "equals",
      groupBinary(toBinary(selectedCellValue))
    ]);
  }

  return rows;
}

// Inverse MixColumns helpers: inverse coefficients are 0e, 0b, 0d, 09 for the first row
function mulBy(hex, factor) {
  // Perform GF(2^8) multiplication by decomposing into xtime shifts
  const aHex = hex;
  const aInt = parseInt(aHex, 16);

  // xtime: multiply by x (i.e. 2) in GF(2^8)
  const xtime = (h) => {
    const v = parseInt(h, 16);
    const hi = (v & 0x80) !== 0;
    let shifted = (v << 1) & 0xff;
    if (hi) shifted ^= 0x1b;
    return shifted.toString(16).padStart(2, '0');
  };

  const a2 = xtime(aHex);
  const a4 = xtime(a2);
  const a8 = xtime(a4);

  const xorHexLocal = (h1, h2) => {
    const v1 = parseInt(h1, 16);
    const v2 = parseInt(h2, 16);
    return (v1 ^ v2).toString(16).padStart(2, '0');
  };

  const f = parseInt(factor, 16);
  let resHex = '00';
  // Known decompositions:
  // 0x09 => a8 ^ a
  // 0x0b => a8 ^ a2 ^ a
  // 0x0d => a8 ^ a4 ^ a
  // 0x0e => a8 ^ a4 ^ a2
  if (f === 0x09) {
    resHex = xorHexLocal(a8, aHex);
  } else if (f === 0x0b) {
    resHex = xorHexLocal(xorHexLocal(a8, a2), aHex);
  } else if (f === 0x0d) {
    resHex = xorHexLocal(xorHexLocal(a8, a4), aHex);
  } else if (f === 0x0e) {
    resHex = xorHexLocal(xorHexLocal(a8, a4), a2);
  } else {
    // Fallback: naive galois multiply loop (shouldn't be needed for our supported factors)
    let aa = aInt;
    let bb = parseInt(factor, 16);
    let p = 0;
    for (let i = 0; i < 8; i++) {
      if (bb & 1) p ^= aa;
      const hi = aa & 0x80;
      aa = (aa << 1) & 0xff;
      if (hi) aa ^= 0x1b;
      bb >>= 1;
    }
    resHex = p.toString(16).padStart(2, '0');
  }

  return resHex;
}

export function getInvMixColumnsTableData(mappedValues) {
  // inverse fixed coefficients to show: 0e, 0b, 0d, 09
  const coeffs = ["0e", "0b", "0d", "09"];
  const tables = [];
  mappedValues.forEach((pair, idx) => {
    const { fixed, prev } = pair;
    // For inverse we explain one coefficient per previous-byte using the inverse coeffs order
    const c = coeffs[idx];
    const name = `${c} * ${prev}`;

    // Build detailed xtime components
    const a = prev;
    const xtime = (h) => {
      const v = parseInt(h, 16);
      const hi = (v & 0x80) !== 0;
      let shifted = (v << 1) & 0xff;
      if (hi) shifted ^= 0x1b;
      return shifted.toString(16).padStart(2, '0');
    };

    // compute sequential xtime steps with both shifted (pre-1b) and result (post-1b)
    const xtimeStep = (hex) => {
      const v = parseInt(hex, 16);
      const shifted = ((v << 1) & 0xff).toString(16).padStart(2, '0');
      const overflowFlag = (v & 0x80) !== 0;
      const result = overflowFlag ? xorHex(shifted, '1b') : shifted;
      return { shifted, result, overflowFlag };
    };

    const step2 = xtimeStep(a);
    const step4 = xtimeStep(step2.result);
    const step8 = xtimeStep(step4.result);

    const compA = groupBinary(toBinary(a));
    const compShift2 = groupBinary(toBinary(step2.shifted));
    const comp2 = groupBinary(toBinary(step2.result));
    const compShift4 = groupBinary(toBinary(step4.shifted));
    const comp4 = groupBinary(toBinary(step4.result));
    const compShift8 = groupBinary(toBinary(step8.shifted));
    const comp8 = groupBinary(toBinary(step8.result));

    // result of full multiply by the coefficient
    const res = mulBy(prev, c);
    const resBin = groupBinary(toBinary(res));

    const rows = [];
    rows.push(["Value", a]);
    rows.push(["Binary", compA]);

  // 2*a sequence
  rows.push(["Shifted:mixColumns", compShift2]);
  if (step2.overflowFlag) rows.push(["1B", groupBinary(toBinary('1b'))]);
  // mark the completed 2* value for slight highlight
  rows.push([`= 2*${a}`, comp2, { highlight: true }]);

  // 4*a sequence (shift of previous result)
  rows.push(["Shifted:mixColumns", compShift4]);
  if (step4.overflowFlag) rows.push(["1B", groupBinary(toBinary('1b'))]);
  // mark the completed 4* value for slight highlight
  rows.push([`= 4*${a}`, comp4, { highlight: true }]);

  // 8*a sequence
  rows.push(["Shifted:mixColumns", compShift8]);
  if (step8.overflowFlag) rows.push(["1B", groupBinary(toBinary('1b'))]);
  // mark the completed 8* value for slight highlight
  rows.push([`= 8*${a}`, comp8, { highlight: true }]);

    // blank separator row
    rows.push(["", ""]);

    // show components that are used for this coefficient (in descending order)
    const f = parseInt(c, 16);
  const comps = [];
  if (f & 0x08) comps.push({ label: `8*${a}`, value: comp8 });
  if (f & 0x04) comps.push({ label: `4*${a}`, value: comp4 });
  if (f & 0x02) comps.push({ label: `2*${a}`, value: comp2 });
  if (f & 0x01) comps.push({ label: `1*${a}`, value: compA });

    comps.forEach(cmp => rows.push([cmp.label, cmp.value]));

    // XOR combine row and final result
    rows.push(["XOR", ""]);
    rows.push(["equals", resBin]);

    tables.push({ name, rows, key: `${idx}-${c}`, fixed: c });
  });
  return tables;
}

export function getInvMixColumnsResultTable(mappedValues, selectedCellValue) {
  const rows = [];
  // coefficients order for inverse first row
  const coeffs = ["0e", "0b", "0d", "09"];
  mappedValues.forEach((pair, idx) => {
    const { prev } = pair;
    const c = coeffs[idx];
    const res = mulBy(prev, c);
  rows.push([`${c} * ${prev}`, groupBinary(toBinary(res))]);
  // store res for combined XOR
  rows._vals = rows._vals || [];
  rows._vals.push(res);
  });

  // Final combined XOR / equals row (concise)
  // compute combined XOR of the four results (if present)
  let combinedHex = null;
  if (rows._vals && rows._vals.length > 0) {
    let acc = 0;
    rows._vals.forEach(h => { acc ^= parseInt(h, 16); });
    combinedHex = acc.toString(16).padStart(2, '0');
  }

  if (selectedCellValue) {
    rows.push(["XOR", ""]);
    rows.push(["equals", groupBinary(toBinary(selectedCellValue))]);
  } else if (combinedHex) {
    rows.push(["XOR", ""]);
    rows.push(["equals", groupBinary(toBinary(combinedHex))]);
  }

  return rows;
}