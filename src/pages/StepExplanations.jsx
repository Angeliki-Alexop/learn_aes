import React from "react";
import { Box, Typography } from "@mui/material";

// Explanation rendering for AddRoundKey step
export function RenderExplanation({
  currentStep,
  highlightedCell,
  previousStepState,
  roundKeys,
  currentRound,
  toHex
}) {
  if (currentStep === "AddRoundKey" && highlightedCell) {
    const parts = highlightedCell.split("-");
    const rowIndex = Number(parts[1]);
    const colIndex = Number(parts[2]);
    const previousStateArray = previousStepState.split(" ");
    const roundKeyArray = toHex(roundKeys[currentRound]).split(" ");

    const previousValueHex = previousStateArray[colIndex * 4 + rowIndex] || "00";
    const roundKeyValueHex = roundKeyArray[colIndex * 4 + rowIndex] || "00";
    const resultValueHex = (
      parseInt(previousValueHex, 16) ^ parseInt(roundKeyValueHex, 16)
    )
      .toString(16)
      .padStart(2, "0");

    const previousValueBits = parseInt(previousValueHex, 16)
      .toString(2)
      .padStart(8, "0");
    const roundKeyValueBits = parseInt(roundKeyValueHex, 16)
      .toString(2)
      .padStart(8, "0");
    const resultValueBits = (
      parseInt(previousValueHex, 16) ^ parseInt(roundKeyValueHex, 16)
    )
      .toString(2)
      .padStart(8, "0");

    return (
      <Box textAlign="center">
        <Typography variant="body1" component="p">
          {`Previous State [${rowIndex}, ${colIndex}] (Hex): ${previousValueHex}`}
        </Typography>
        <Typography variant="body1" component="p">
          {`Round Key [${rowIndex}, ${colIndex}] (Hex): ${roundKeyValueHex}`}
        </Typography>
        <Typography variant="body1" component="p">
          {`Result (Hex): ${previousValueHex} XOR ${roundKeyValueHex} = ${resultValueHex}`}
        </Typography>
        <br />
        <table style={{ margin: "0 auto", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={{ border: "1px solid black", padding: "5px" }}>
                Previous State [{rowIndex}, {colIndex}]
              </td>
              <td style={{ border: "1px solid black", padding: "5px" }}>
                {previousValueBits}
              </td>
            </tr>
            <tr>
              <td style={{ border: "1px solid black", padding: "5px" }}>
                Round Key [{rowIndex}, {colIndex}]
              </td>
              <td style={{ border: "1px solid black", padding: "5px" }}>
                {roundKeyValueBits}
              </td>
            </tr>
            <tr>
              <td style={{ border: "1px solid black", padding: "5px" }}>
                XOR
              </td>
              <td style={{ border: "1px solid black", padding: "5px" }}>
                {previousValueBits} XOR {roundKeyValueBits} = {resultValueBits}
              </td>
            </tr>
          </tbody>
        </table>
      </Box>
    );
  }
  return null;
}
