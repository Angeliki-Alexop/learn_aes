// Utility functions for StepByStep
export const formatAsMatrix = (hexString) => {
  const bytes = hexString.split(" ");
  const matrix = [[], [], [], []];
  for (let i = 0; i < 16; i++) {
    matrix[i % 4][Math.floor(i / 4)] = bytes[i];
  }
  return matrix;
};

export const toHex = (arr) => {
  return arr.map((byte) => byte.toString(16).padStart(2, "0")).join(" ");
};

export const hexToText = (hex) => {
  return hex
    .split(" ")
    .map((byte) => String.fromCharCode(parseInt(byte, 16)))
    .join("");
};

export const hexToBase64 = (hex) => {
  return btoa(
    hex
      .split(" ")
      .map((byte) => String.fromCharCode(parseInt(byte, 16)))
      .join("")
  );
};