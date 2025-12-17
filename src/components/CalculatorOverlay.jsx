import React from "react";
import { Drawer, Box, Typography, IconButton, Button, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import "./CalculatorOverlay.css";

function toBigIntFrom(value, format) {
  try {
    if (!value) return null;
    if (format === "hex") {
      const v = value.replace(/\s+/g, "").toLowerCase();
      const cleaned = v.replace(/^0x/, "");
      if (!/^[0-9a-f]+$/.test(cleaned)) return null;
      return BigInt("0x" + cleaned);
    }
    // binary
    const v = value.replace(/\s+/g, "");
    const cleaned = v.replace(/^0b/, "");
    if (!/^[01]+$/.test(cleaned)) return null;
    return BigInt("0b" + cleaned);
  } catch (e) {
    return null;
  }
}

function bigintToBin(bn) {
  if (bn === null) return "";
  return bn.toString(2);
}

function bigintToHex(bn) {
  if (bn === null) return "";
  let s = bn.toString(16).toUpperCase();
  if (s.length % 2 === 1) s = "0" + s;
  return s;
}

function binaryToHexStr(bin) {
  const clean = bin.replace(/\s+/g, "");
  if (!/^[01]+$/.test(clean)) return "";
  const padded = clean.padStart(Math.ceil(clean.length / 4) * 4, "0");
  let res = BigInt("0b" + padded).toString(16).toUpperCase();
  if (res.length % 2 === 1) res = "0" + res;
  return res;
}



function CalculatorOverlay({ open, onClose }) {
  const [view, setView] = React.useState("xor");

  // XOR view state
  const [aVal, setAVal] = React.useState("");
  const [bVal, setBVal] = React.useState("");
  const [xorFormat, setXorFormat] = React.useState("hex"); // single selector for both inputs
  const [xorResult, setXorResult] = React.useState(null);

  // Binary->Hex state
  const [binIn, setBinIn] = React.useState("");
  const [binToHexOut, setBinToHexOut] = React.useState("");
  const [hexIn, setHexIn] = React.useState("");
  const [hexToBinOut, setHexToBinOut] = React.useState("");
  const MAX_HEX = 16; // hex chars
  const MAX_BIN = 64; // bits

  function sanitizeHexInput(input) {
    const cleaned = input.replace(/\s+/g, "").replace(/^0x/i, "");
    const only = cleaned.replace(/[^0-9a-fA-F]/g, "").toUpperCase();
    return only.slice(0, MAX_HEX);
  }

  function sanitizeBinInput(input) {
    const cleaned = input.replace(/\s+/g, "").replace(/^0b/i, "");
    const only = cleaned.replace(/[^01]/g, "");
    return only.slice(0, MAX_BIN);
  }

  React.useEffect(() => {
    // compute xor when inputs change using selected xorFormat
    const aBn = toBigIntFrom(aVal, xorFormat);
    const bBn = toBigIntFrom(bVal, xorFormat);
    if (aBn === null || bBn === null) {
      setXorResult(null);
      return;
    }
    const res = aBn ^ bBn;
    setXorResult(res);
  }, [aVal, bVal, xorFormat]);
  React.useEffect(() => {
    if (!binIn) return setBinToHexOut("");
    const out = binaryToHexStr(binIn);
    setBinToHexOut(out);
  }, [binIn]);

  React.useEffect(() => {
    if (!hexIn) return setHexToBinOut("");
    const bn = toBigIntFrom(hexIn, "hex");
    if (bn === null) return setHexToBinOut("");
    setHexToBinOut(bigintToBin(bn));
  }, [hexIn]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={() => {
        onClose();
      }}
      PaperProps={{
        sx: {
          width: { xs: "95vw", sm: 460, md: 520 },
          maxWidth: "100%",
          maxHeight: "90vh",
          zIndex: 1300,
          padding: 3,
          background: "#fff",
          overflow: "auto",
        },
      }}
    >
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6" align="left" gutterBottom sx={{ flex: 1 }}>
            Calculator
          </Typography>
          <IconButton onClick={() => onClose()} aria-label="Close calculator">
            <CloseIcon />
          </IconButton>
        </Box>

        <Box className="calc-tabs" sx={{ mb: 2 }}>
          <Button variant={view === "xor" ? "contained" : "outlined"} onClick={() => setView("xor")} sx={{ mr: 1 }}>
            Xor
          </Button>
          <Button variant={view === "binhex" ? "contained" : "outlined"} onClick={() => setView("binhex")} sx={{ mr: 1 }}>
            Binary to Hex
          </Button>
          <Button variant={view === "hexbin" ? "contained" : "outlined"} onClick={() => setView("hexbin")}>
            Hex to Binary
          </Button>
        </Box>

        {view === "xor" && (
          <Box>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 1, mb: 1 }}>
              <Button
                variant={xorFormat === "hex" ? "contained" : "outlined"}
                onClick={() => setXorFormat("hex")}
                sx={{
                  mr: 1,
                  backgroundColor: xorFormat === "hex" ? "#7c5fe6" : undefined,
                  color: xorFormat === "hex" ? "#fff" : undefined,
                  '&:hover': { backgroundColor: xorFormat === "hex" ? "#6f54d9" : undefined },
                }}
              >
                HEX
              </Button>
              <Button
                variant={xorFormat === "bin" ? "contained" : "outlined"}
                onClick={() => setXorFormat("bin")}
                sx={{
                  backgroundColor: xorFormat === "bin" ? "#7c5fe6" : undefined,
                  color: xorFormat === "bin" ? "#fff" : undefined,
                  '&:hover': { backgroundColor: xorFormat === "bin" ? "#6f54d9" : undefined },
                }}
              >
                BIN
              </Button>
            </Box>

            <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 1 }}>
              <TextField
                label="A"
                value={aVal}
                onChange={(e) => {
                  const v = e.target.value;
                  setAVal(xorFormat === "hex" ? sanitizeHexInput(v) : sanitizeBinInput(v));
                }}
                size="small"
                fullWidth
                helperText={xorFormat === "hex" ? `0-9,A-F — max ${MAX_HEX} chars` : `0 or 1 — max ${MAX_BIN} bits`}
              />
            </Box>

            <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 1 }}>
              <TextField
                label="B"
                value={bVal}
                onChange={(e) => {
                  const v = e.target.value;
                  setBVal(xorFormat === "hex" ? sanitizeHexInput(v) : sanitizeBinInput(v));
                }}
                size="small"
                fullWidth
                helperText={xorFormat === "hex" ? `0-9,A-F — max ${MAX_HEX} chars` : `0 or 1 — max ${MAX_BIN} bits`}
              />
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">Result:</Typography>
              <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                <TextField label="HEX" value={xorResult === null ? "" : bigintToHex(xorResult)} size="small" fullWidth InputProps={{ readOnly: true }} />
                <TextField label="BIN" value={xorResult === null ? "" : bigintToBin(xorResult)} size="small" fullWidth InputProps={{ readOnly: true }} />
              </Box>
            </Box>
          </Box>
        )}

        {view === "binhex" && (
          <Box>
            <Typography variant="subtitle1">Binary → Hex</Typography>
            <Box sx={{ mt: 1 }}>
              <TextField
                label="Binary input"
                value={binIn}
                onChange={(e) => setBinIn(sanitizeBinInput(e.target.value))}
                size="small"
                fullWidth
                helperText={`0 or 1 — max ${MAX_BIN} bits`}
              />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">Hex output:</Typography>
              <TextField label="HEX" value={binToHexOut || ""} size="small" fullWidth InputProps={{ readOnly: true }} sx={{ mt: 1 }} />
            </Box>
          </Box>
        )}

        {view === "hexbin" && (
          <Box>
            <Typography variant="subtitle1">Hex → Binary</Typography>
            <Box sx={{ mt: 1 }}>
              <TextField
                label="Hex input"
                value={hexIn}
                onChange={(e) => setHexIn(sanitizeHexInput(e.target.value))}
                size="small"
                fullWidth
                helperText={`0-9,A-F — max ${MAX_HEX} chars`}
              />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">Binary output:</Typography>
              <TextField label="BIN" value={hexToBinOut || ""} size="small" fullWidth InputProps={{ readOnly: true }} sx={{ mt: 1 }} />
            </Box>
          </Box>
        )}

      </Box>
    </Drawer>
  );
}

export default CalculatorOverlay;
