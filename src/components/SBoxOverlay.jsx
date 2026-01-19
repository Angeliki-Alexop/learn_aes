import React from "react";
import { Drawer, Box, Typography, IconButton, Tabs, Tab } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { sBox, invSBox } from "../utils/aes_manual_v2";

function SBoxOverlay({ open, onClose }) {
  const [selected, setSelected] = React.useState(null);
  const [mode, setMode] = React.useState('sbox'); // 'sbox' or 'invsbox'

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
          width: { xs: "95vw", sm: 600, md: 800 },
          maxWidth: "100%",
          maxHeight: "90vh",
          zIndex: 1300,
          padding: 3,
          background: "#ffffff",
          overflow: "auto",
        },
      }}
    >
      <Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <Typography
              variant="h6"
              fontWeight="bold"
              align="left"
              gutterBottom
              sx={{ marginTop: -2 }}
            >
              AES S-box
            </Typography>
            <Tabs
              value={mode}
              onChange={(e, val) => { setMode(val); setSelected(null); }}
              aria-label="S-box pages"
              sx={{ ml: 2 }}
              textColor="primary"
              indicatorColor="primary"
              size="small"
            >
              <Tab label="S-Box" value="sbox" />
              <Tab label="Inverse S-Box" value="invsbox" />
            </Tabs>
          </Box>
          <IconButton
            onClick={() => {
              setSelected(null);
              onClose();
            }}
            aria-label="Close S-box"
            sx={{ marginTop: -2 }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
          <Typography variant="body1" gutterBottom>
          The {mode === 'sbox' ? 'S-box' : 'Inverse S-box'} (Substitution box) is a fixed lookup table used in AES to
          replace each byte with a different byte. It adds non-linearity, making
          the encryption resistant to patterns and attacks. Each byte is
          substituted independently by using its hexadecimal value to select a
          row and column in the table and the value found there becomes the new
          byte. Use the mode selector to switch between the forward S-box and the inverse lookup used during decryption.
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, mb: 1, fontStyle: "italic" }}>
          <strong>Hint:</strong> Click any cell to highlight its row and column.
          The selected cell shows the substituted value for the corresponding
          input byte.
        </Typography>
          <Box sx={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px",
                    background: "#eee",
                  }}
                ></th>
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
                    const table = mode === 'sbox' ? sBox : invSBox;
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
                        {table[idx].toString(16).padStart(2, "0").toUpperCase()}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Box>
    </Drawer>
  );
}

export default SBoxOverlay;
