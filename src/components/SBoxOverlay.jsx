import React from "react";
import { Drawer, Box, Typography, IconButton, Tabs, Tab } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { sBox, invSBox } from "../utils/aes_manual_v2";
import { useTranslation } from 'react-i18next';

function SBoxOverlay({ open, onClose }) {
  const { t } = useTranslation();
  const [selected, setSelected] = React.useState(null);
  const [mode, setMode] = React.useState("sbox"); // 'sbox' or 'invsbox'

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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flex: 1,
              mb: 2,
            }}
          >
            <Tabs
              value={mode}
              onChange={(e, val) => {
                setMode(val);
                setSelected(null);
              }}
              aria-label="S-box pages"
              sx={{ ml: 0 }}
              textColor="primary"
              indicatorColor="primary"
              size="medium"
            >
              <Tab label="Forward S-box (encryption)" value="sbox" />
              <Tab label="Inverse S-box (decryption)" value="invsbox" />
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
        {mode === "sbox" ? (
          <>
            <Typography variant="body1" gutterBottom>
              {t('pages.stepByStep.matrix.sboxOverlay.sboxDescription')}
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 1, mb: 1, fontStyle: "italic" }}
            >
              <strong>{t('pages.stepByStep.matrix.sboxOverlay.sboxHint')}</strong>
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="body1" gutterBottom>
              {t('pages.stepByStep.matrix.sboxOverlay.invSboxDescription')}
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 1, mb: 1, fontStyle: "italic" }}
            >
              <strong>{t('pages.stepByStep.matrix.sboxOverlay.invSboxHint')}</strong>
            </Typography>
          </>
        )}
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
                    const table = mode === "sbox" ? sBox : invSBox;
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
