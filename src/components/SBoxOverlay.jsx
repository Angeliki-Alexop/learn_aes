import React from "react";
import { Drawer, Box, Typography } from "@mui/material";
import { sBox } from "../utils/aes_manual_v2";

function SBoxOverlay({ open, onClose }) {
  const [selected, setSelected] = React.useState(null);

  const handleCellClick = (row, col) => {
    setSelected({ row, col });
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={() => {
        setSelected(null);
        onClose();
      }}
      PaperProps={{
        sx: {
          width: 800,
          zIndex: 1300,
          padding: 3,
          background: "#fff",
        },
      }}
    >
      <Box>
        <Typography variant="h6" align="center" gutterBottom>
          AES S-box
        </Typography>
        <Box sx={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ccc", padding: "8px", background: "#eee" }}></th>
                {Array.from({ length: 16 }, (_, i) => (
                  <th
                    key={i}
                    style={{
                      border: "1px solid #ccc",
                      padding: "8px",
                      background:
                        selected && selected.col === i ? "#ffe082" : "#eee",
                      textAlign: "center",
                      cursor: "pointer",
                    }}
                  >
                    {i.toString(16).toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 16 }, (_, row) => (
                <tr key={row}>
                  <th
                    style={{
                      border: "1px solid #ccc",
                      padding: "8px",
                      background:
                        selected && selected.row === row ? "#ffe082" : "#eee",
                      textAlign: "center",
                      cursor: "pointer",
                    }}
                  >
                    {row.toString(16).toUpperCase()}
                  </th>
                  {Array.from({ length: 16 }, (_, col) => {
                    const idx = row * 16 + col;
                    const isSelected =
                      selected && selected.row === row && selected.col === col;
                    const isRow =
                      selected && selected.row === row && !isSelected;
                    const isCol =
                      selected && selected.col === col && !isSelected;
                    return (
                      <td
                        key={col}
                        onClick={() => handleCellClick(row, col)}
                        style={{
                          border: "1px solid #ccc",
                          padding: "8px",
                          textAlign: "center",
                          background: isSelected
                            ? "#ffd54f"
                            : isRow || isCol
                            ? "#fff9c4"
                            : "#f5f5f5",
                          fontFamily: "monospace",
                          cursor: "pointer",
                          transition: "background 0.2s",
                        }}
                      >
                        {sBox[idx].toString(16).padStart(2, "0").toUpperCase()}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
                <Box sx={{ mt: 3 }}>
          <Typography variant="body1" gutterBottom>
            The AES S-box (Substitution box) is a fundamental component in the AES encryption algorithm. 
            It provides non-linearity by substituting each byte of the input with another value, 
            making cryptanalysis more difficult.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Hint:</strong> Click any cell to highlight its row and column. 
            The selected cell shows the substituted value for the corresponding input byte.
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
}

export default SBoxOverlay;