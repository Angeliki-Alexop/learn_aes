import React from "react";
import { Box, Typography } from "@mui/material";
import { CirclePlus } from 'lucide-react';

// Explanation rendering for AddRoundKey step
export function RenderExplanation({
  currentStep,
  highlightedCell,
  previousStepState,
  roundKeys,
  currentRound,
  toHex,
}) {
  if (currentStep === "AddRoundKey" && highlightedCell) {
    const parts = highlightedCell.split("-");
    const rowIndex = Number(parts[1]);
    const colIndex = Number(parts[2]);
    const previousStateArray = previousStepState.split(" ");
    const roundKeyArray = toHex(roundKeys[currentRound]).split(" ");

    const previousValueHex =
      previousStateArray[colIndex * 4 + rowIndex] || "00";
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

    // Group binaries as 4-4 for readability (e.g. "1111 0010")
    const groupBits = (bits) => {
      if (!bits || bits.length !== 8) return bits;
      return bits.slice(0, 4) + " " + bits.slice(4);
    };

    const previousValueBitsGrouped = groupBits(previousValueBits);
    const roundKeyValueBitsGrouped = groupBits(roundKeyValueBits);
    const resultValueBitsGrouped = groupBits(resultValueBits);

    return (
      <Box textAlign="center">
        <Typography
          variant="body1"
          component="p"
          sx={{ fontWeight: "bold", color: "#7b1fa2", mb: 1 }}
        >
          {`Previous State [${rowIndex}, ${colIndex}] XOR Round Key [${rowIndex}, ${colIndex}] = Result [${rowIndex}, ${colIndex}]`}
        </Typography>

        <table
          style={{
            margin: "0 auto",
            borderCollapse: "collapse",
            width: "360px",
            maxWidth: "100%",
            textAlign: "left",
          }}
        >
          <thead>
            <tr>
              <th style={{ border: "1px solid #d3c7e8", padding: "6px", background: "rgba(123,31,162,0.06)", color: "#4a148c" }}>State</th>
              <th style={{ border: "1px solid #d3c7e8", padding: "6px", background: "rgba(123,31,162,0.06)", color: "#4a148c" }}>Hex</th>
              <th style={{ border: "1px solid #d3c7e8", padding: "6px", background: "rgba(123,31,162,0.06)", color: "#4a148c" }}>Binary</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: "1px solid #d3c7e8", padding: "6px" }}>Current State [{rowIndex}, {colIndex}]</td>
              <td style={{ border: "1px solid #d3c7e8", padding: "6px", fontFamily: "monospace" }}>{previousValueHex}</td>
              <td style={{ border: "1px solid #d3c7e8", padding: "6px", fontFamily: "monospace" }}>{previousValueBitsGrouped}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #d3c7e8", padding: "6px" }}>Round Key [{rowIndex}, {colIndex}]</td>
              <td style={{ border: "1px solid #d3c7e8", padding: "6px", fontFamily: "monospace" }}>{roundKeyValueHex}</td>
              <td style={{ border: "1px solid #d3c7e8", padding: "6px", fontFamily: "monospace" }}>{roundKeyValueBitsGrouped}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #d3c7e8", padding: "6px", textAlign: "center" }}>
                <CirclePlus size={18} color="#7b1fa2" />
              </td>
              <td style={{ border: "1px solid #d3c7e8", padding: "6px" }} />
              <td style={{ border: "1px solid #d3c7e8", padding: "6px" }} />
            </tr>
            <tr>
              <td style={{ border: "1px solid #d3c7e8", padding: "6px" }}>Next State [{rowIndex}, {colIndex}]</td>
              <td style={{ border: "1px solid #d3c7e8", padding: "6px", fontFamily: "monospace" }}>{resultValueHex}</td>
              <td style={{ border: "1px solid #d3c7e8", padding: "6px", fontFamily: "monospace" }}>{resultValueBitsGrouped}</td>
            </tr>
          </tbody>
        </table>
      </Box>
    );
  }
  return null;
}
