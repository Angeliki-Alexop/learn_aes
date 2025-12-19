import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { keyExpansion, sBox, rCon } from "../../utils/aes_manual_v2";

function getRandomKeyBytes(keySize) {
  return new Array(keySize / 8)
    .fill(0)
    .map(() => Math.floor(Math.random() * 256));
}

function bytesToHexArray(bytes) {
  return bytes.map((b) => b.toString(16).padStart(2, "0").toUpperCase());
}

function wordsFromBytes(bytes) {
  const words = [];
  for (let i = 0; i < bytes.length; i += 4) words.push(bytes.slice(i, i + 4));
  return words;
}

const KeyExpansionPractice = () => {
  const [keySize, setKeySize] = useState(128);
  const [keyBytes, setKeyBytes] = useState(getRandomKeyBytes(128));
  const [expandedKeyBytes, setExpandedKeyBytes] = useState([]);
  const [userWords, setUserWords] = useState([]);
  const [incorrect, setIncorrect] = useState([]);
  const [showHelp, setShowHelp] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

  const [currentWord, setCurrentWord] = useState(null);
  const [stepUserWord, setStepUserWord] = useState(["", "", "", ""]);
  const [stepIncorrect, setStepIncorrect] = useState([
    false,
    false,
    false,
    false,
  ]);
  const [rotUser, setRotUser] = useState(["", "", "", ""]);
  const [subUser, setSubUser] = useState(["", "", "", ""]);
  const [rotIncorrect, setRotIncorrect] = useState([
    false,
    false,
    false,
    false,
  ]);
  const [subIncorrect, setSubIncorrect] = useState([
    false,
    false,
    false,
    false,
  ]);
  const [rotCorrect, setRotCorrect] = useState(false);
  const [subCorrect, setSubCorrect] = useState(false);
  const [rconUser, setRconUser] = useState(["", "", "", ""]);
  const [rconIncorrect, setRconIncorrect] = useState([
    false,
    false,
    false,
    false,
  ]);
  const [rconCorrect, setRconCorrect] = useState(false);
  const rotRefs = useRef([]);
  const subRefs = useRef([]);
  const rconRefs = useRef([]);
  const stepRefs = useRef([]);

  const Nk = keySize / 32;
  const Nr = Nk + 6;
  const totalWords = 4 * (Nr + 1);
  const expandedWords = wordsFromBytes(expandedKeyBytes);

  // Clear intermediate inputs (Rot/Sub/Rcon) when the current word changes
  useEffect(() => {
    setRotUser(["", "", "", ""]);
    setSubUser(["", "", "", ""]);
    setRconUser(["", "", "", ""]);

    setRotIncorrect([false, false, false, false]);
    setSubIncorrect([false, false, false, false]);
    setRconIncorrect([false, false, false, false]);

    setRotCorrect(false);
    setSubCorrect(false);
    setRconCorrect(false);
  }, [currentWord]);

  useEffect(() => {
    const expanded = keyExpansion(keyBytes.slice(), keySize);
    setExpandedKeyBytes(expanded);

    const initialWords = [];
    const keyWords = wordsFromBytes(keyBytes);
    for (let i = 0; i < totalWords; i++) {
      if (i < Nk)
        initialWords.push(bytesToHexArray(keyWords[i] || [0, 0, 0, 0]));
      else initialWords.push(["", "", "", ""]);
    }
    setUserWords(initialWords);
    setIncorrect(
      Array(totalWords)
        .fill()
        .map(() => [false, false, false, false])
    );
    // reset step mode pointers
    setCurrentWord(Nk);
  }, [keyBytes, keySize]);

  // derived helpers and handlers
  const rotWord = (word) => {
    if (!word || word.length < 4) return [0, 0, 0, 0];
    return [word[1], word[2], word[3], word[0]];
  };

  const subWord = (word) => {
    if (!word) return [0, 0, 0, 0];
    return word.map((b) => sBox[b]);
  };

  const getExpectedWord = (idx) => {
    if (!expandedWords || !expandedWords[idx]) return null;
    return expandedWords[idx];
  };

  const getCaseKind = (i) => {
    if (!Number.isFinite(Nk)) return "simple";
    if (Nk === 8) {
      if (i % Nk === 0) return "special"; // rotate + sub + rcon
      if (i % Nk === 4) return "subonly"; // sub (no rotate)
      return "simple"; // plain xor
    }
    // Nk = 4 or 6: only special when i % Nk === 0
    return i % Nk === 0 ? "special" : "simple";
  };

  const renderBytesAsCells = (bytes) => {
    if (!bytes || !Array.isArray(bytes)) return null;
    return (
      <Box
        sx={{
          display: "flex",
          gap: 1,
          flexWrap: "nowrap",
          justifyContent: "center",
          overflowX: "auto",
        }}
      >
        {bytes.map((b, i) => (
          <Box
            key={`cell-${i}`}
            sx={{
              border: "1px solid #ccc",
              borderRadius: 1,
              p: 0.5,
              minWidth: 48,
              textAlign: "center",
              bgcolor: "#fff",
            }}
          >
            <Typography sx={{ fontFamily: "monospace", fontSize: 13 }}>
              {b.toString(16).padStart(2, "0").toUpperCase()}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

  const renderHexCells = (
    hexArray = ["", "", "", ""],
    errorArray = [false, false, false, false]
  ) => {
    return (
      <Box
        sx={{
          display: "flex",
          gap: 1,
          flexWrap: "nowrap",
          justifyContent: "center",
          overflowX: "auto",
        }}
      >
        {Array.from({ length: 4 }).map((__, i) => {
          const v =
            hexArray && hexArray[i]
              ? hexArray[i].toString().padStart(2, "0")
              : "--";
          const isErr = errorArray && errorArray[i];
          return (
            <Box
              key={`hex-cell-${i}`}
              sx={{
                border: isErr ? "1px solid #f44336" : "1px solid #ccc",
                borderRadius: 1,
                p: 0.5,
                minWidth: 48,
                textAlign: "center",
                bgcolor: "#fff",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "monospace",
                  fontSize: 13,
                  color: isErr ? "#b00020" : "inherit",
                }}
              >
                {v.toUpperCase()}
              </Typography>
            </Box>
          );
        })}
      </Box>
    );
  };

  const handleStepInputChange = (idx, value) => {
    const copy = [...stepUserWord];
    copy[idx] = (value || "").toUpperCase();
    setStepUserWord(copy);
  };

  const handleStepCheck = () => {
    const expected = getExpectedWord(currentWord);
    if (!expected) return;
    const newIncorrect = [false, false, false, false];
    let ok = true;
    for (let i = 0; i < 4; i++) {
      const v = parseInt(stepUserWord[i] || "", 16);
      if (isNaN(v) || v !== expected[i]) {
        newIncorrect[i] = true;
        ok = false;
      }
    }
    setStepIncorrect(newIncorrect);
    if (ok) {
      // merge into userWords
      const updated = userWords.map((w) => [...w]);
      updated[currentWord] = expected.map((b) =>
        b.toString(16).padStart(2, "0").toUpperCase()
      );
      setUserWords(updated);
      // mark correct visually by auto-advancing to next word and locking this one
      const next = (currentWord || Nk) + 1;
      if (next < totalWords) {
        setCurrentWord(next);
        setStepUserWord(["", "", "", ""]);
        setStepIncorrect([false, false, false, false]);
        // focus first input of the new target after render
        setTimeout(() => {
          try {
            stepRefs.current[0] &&
              stepRefs.current[0].focus &&
              stepRefs.current[0].focus();
          } catch (e) {}
        }, 0);
      } else {
        // last word completed
        setStepUserWord(["", "", "", ""]);
        setStepIncorrect([false, false, false, false]);
        setShowComplete(true);
      }
    }
  };

  const handleInputChange = (wi, bi, value) => {
    const copy = userWords.map((w) => [...w]);
    copy[wi][bi] = (value || "").toUpperCase();
    setUserWords(copy);
  };

  const handleRegenerate = () => {
    setKeyBytes(getRandomKeyBytes(keySize));

    // clear all intermediate inputs and validation state
    setRotUser(["", "", "", ""]);
    setSubUser(["", "", "", ""]);
    setRotIncorrect([false, false, false, false]);
    setSubIncorrect([false, false, false, false]);
    setRotCorrect(false);
    setSubCorrect(false);
    setRconUser(["", "", "", ""]);
    setRconIncorrect([false, false, false, false]);
    setRconCorrect(false);
    setStepUserWord(["", "", "", ""]);
    setStepIncorrect([false, false, false, false]);
    setIncorrect(
      Array(totalWords)
        .fill()
        .map(() => [false, false, false, false])
    );
    setUserWords(
      Array(totalWords)
        .fill()
        .map(() => ["", "", "", ""])
    );
    setCurrentWord(Nk);
  };

  const handleChangeSize = (e, newSize) => {
    if (!newSize) return;
    setKeySize(newSize);
    setKeyBytes(getRandomKeyBytes(newSize));
    // clear intermediate inputs and validation when changing key size
    setRotUser(["", "", "", ""]);
    setSubUser(["", "", "", ""]);
    setRotIncorrect([false, false, false, false]);
    setSubIncorrect([false, false, false, false]);
    setRotCorrect(false);
    setSubCorrect(false);
    setRconUser(["", "", "", ""]);
    setRconIncorrect([false, false, false, false]);
    setRconCorrect(false);
    setStepUserWord(["", "", "", ""]);
    setStepIncorrect([false, false, false, false]);
    setIncorrect(
      Array(4 * (newSize / 32 + 1))
        .fill()
        .map(() => [false, false, false, false])
    );
    setUserWords(
      Array(4 * (newSize / 32 + 1))
        .fill()
        .map(() => ["", "", "", ""])
    );
  };

  const handleRotInputChange = (idx, value) => {
    const copy = [...rotUser];
    copy[idx] = (value || "").toUpperCase();
    setRotUser(copy);
  };

  const handleSubInputChange = (idx, value) => {
    const copy = [...subUser];
    copy[idx] = (value || "").toUpperCase();
    setSubUser(copy);
  };

  const handleRconInputChange = (idx, value) => {
    const copy = [...rconUser];
    copy[idx] = (value || "").toUpperCase();
    setRconUser(copy);
  };

  const handleCheckRot = () => {
    const prev = expandedWords[currentWord - 1];
    if (!prev) return;
    const caseKind = getCaseKind(currentWord);
    if (caseKind !== "special") return; // rot only applies to special case
    const expected = rotWord(prev);
    const newIncorrect = [false, false, false, false];
    let ok = true;
    for (let i = 0; i < 4; i++) {
      const v = parseInt(rotUser[i] || "", 16);
      if (isNaN(v) || v !== expected[i]) {
        newIncorrect[i] = true;
        ok = false;
      }
    }
    setRotIncorrect(newIncorrect);
    setRotCorrect(ok);
    if (ok) {
      // lock rot inputs and move focus to first sub input
      setTimeout(() => {
        try {
          subRefs.current[0] &&
            subRefs.current[0].focus &&
            subRefs.current[0].focus();
        } catch (e) {}
      }, 0);
    }
  };

  const handleCheckSub = () => {
    const prev = expandedWords[currentWord - 1];
    if (!prev) return;
    const caseKind = getCaseKind(currentWord);
    let expectedSub;
    if (caseKind === "special") {
      const expectedRot = rotWord(prev);
      expectedSub = subWord(expectedRot);
    } else if (caseKind === "subonly") {
      expectedSub = subWord(prev);
    } else {
      return; // no sub step for simple case
    }
    const newIncorrect = [false, false, false, false];
    let ok = true;
    for (let i = 0; i < 4; i++) {
      const v = parseInt(subUser[i] || "", 16);
      if (isNaN(v) || v !== expectedSub[i]) {
        newIncorrect[i] = true;
        ok = false;
      }
    }
    setSubIncorrect(newIncorrect);
    setSubCorrect(ok);
    if (ok) {
      // move focus to first step input
      setTimeout(() => {
        try {
          rconRefs.current[0] &&
            rconRefs.current[0].focus &&
            rconRefs.current[0].focus();
        } catch (e) {}
      }, 0);
    }
  };

  const handleCheckRcon = () => {
    const prev = expandedWords[currentWord - 1];
    if (!prev) return;
    const caseKind = getCaseKind(currentWord);
    if (caseKind !== "special") return; // Rcon only for special case
    const expectedRot = rotWord(prev);
    const expectedSub = subWord(expectedRot);
    const roundIndex = Math.floor(currentWord / Nk);
    const rc = typeof rCon[roundIndex] !== "undefined" ? rCon[roundIndex] : 0;
    const expectedRcon = expectedSub.map((b, i) => (i === 0 ? b ^ rc : b));
    const newIncorrect = [false, false, false, false];
    let ok = true;
    for (let i = 0; i < 4; i++) {
      const v = parseInt(rconUser[i] || "", 16);
      if (isNaN(v) || v !== expectedRcon[i]) {
        newIncorrect[i] = true;
        ok = false;
      }
    }
    setRconIncorrect(newIncorrect);
    setRconCorrect(ok);
    if (ok) {
      setTimeout(() => {
        try {
          stepRefs.current[0] &&
            stepRefs.current[0].focus &&
            stepRefs.current[0].focus();
        } catch (e) {}
      }, 0);
    }
  };

  const handleShowRcon = () => {
    const prev = expandedWords[currentWord - 1];
    if (!prev) return;
    const caseKind = getCaseKind(currentWord);
    if (caseKind !== "special") return; // only relevant for special
    const expectedRot = rotWord(prev);
    const expectedSub = subWord(expectedRot);
    const roundIndex = Math.floor(currentWord / Nk);
    const rc = typeof rCon[roundIndex] !== "undefined" ? rCon[roundIndex] : 0;
    const expectedRcon = expectedSub.map((b, i) => (i === 0 ? b ^ rc : b));
    const r = expectedRcon.map((b) =>
      b.toString(16).padStart(2, "0").toUpperCase()
    );
    setRconUser(r);
    setRconIncorrect([false, false, false, false]);
    setRconCorrect(true);
    setTimeout(() => {
      try {
        stepRefs.current[0] &&
          stepRefs.current[0].focus &&
          stepRefs.current[0].focus();
      } catch (e) {}
    }, 0);
  };

  const handleShowRot = () => {
    const prev = expandedWords[currentWord - 1];
    if (!prev) return;
    const caseKind = getCaseKind(currentWord);
    if (caseKind !== "special") return; // rot only for special case
    const r = rotWord(prev).map((b) =>
      b.toString(16).padStart(2, "0").toUpperCase()
    );
    setRotUser(r);
    setRotIncorrect([false, false, false, false]);
    setRotCorrect(true);
    setTimeout(() => {
      try {
        subRefs.current[0] &&
          subRefs.current[0].focus &&
          subRefs.current[0].focus();
      } catch (e) {}
    }, 0);
  };

  const handleShowSub = () => {
    const prev = expandedWords[currentWord - 1];
    if (!prev) return;
    const caseKind = getCaseKind(currentWord);
    let sBytes;
    if (caseKind === "special") sBytes = subWord(rotWord(prev));
    else if (caseKind === "subonly") sBytes = subWord(prev);
    else return; // nothing to show for simple case
    const s = sBytes.map((b) => b.toString(16).padStart(2, "0").toUpperCase());
    setSubUser(s);
    setSubIncorrect([false, false, false, false]);
    setSubCorrect(true);
    setTimeout(() => {
      try {
        stepRefs.current[0] &&
          stepRefs.current[0].focus &&
          stepRefs.current[0].focus();
      } catch (e) {}
    }, 0);
  };

  // validate whether the current step input matches the expected word
  const isStepComplete = () => {
    const expected = getExpectedWord(currentWord);
    if (!expected) return false;
    for (let i = 0; i < 4; i++) {
      const v = parseInt(stepUserWord[i] || "", 16);
      if (isNaN(v) || v !== expected[i]) return false;
    }
    return true;
  };

  const handleStepNext = () => {
    if (!isStepComplete()) return; // prevent advancing until current word is correct
    // persist the shown/correct step values into the grid
    const updated = userWords.map((w) => [...w]);
    updated[currentWord] = stepUserWord.map((v) =>
      (v || "").toString().padStart(2, "0").toUpperCase()
    );
    setUserWords(updated);

    const next = (currentWord || Nk) + 1;
    if (next < totalWords) {
      setCurrentWord(next);
      setStepUserWord(["", "", "", ""]);
      setStepIncorrect([false, false, false, false]);
    } else {
      setStepUserWord(["", "", "", ""]);
      setStepIncorrect([false, false, false, false]);
      setShowComplete(true);
    }
  };

  // current case kind for rendering (special / subonly / simple)
  const caseKind = currentWord !== null ? getCaseKind(currentWord) : null;

  const handleStepShow = () => {
    const expected = getExpectedWord(currentWord);
    if (!expected) return;
    setStepUserWord(
      expected.map((b) => b.toString(16).padStart(2, "0").toUpperCase())
    );
    setStepIncorrect([false, false, false, false]);
    // reveal intermediate values depending on case
    const prev = expandedWords[currentWord - 1];
    const caseKind = getCaseKind(currentWord);
    if (prev) {
      if (caseKind === "special") {
        const expectedRot = rotWord(prev);
        const expectedSub = subWord(expectedRot);
        const r = expectedRot.map((b) =>
          b.toString(16).padStart(2, "0").toUpperCase()
        );
        const s = expectedSub.map((b) =>
          b.toString(16).padStart(2, "0").toUpperCase()
        );
        setRotUser(r);
        setSubUser(s);
        setRotIncorrect([false, false, false, false]);
        setSubIncorrect([false, false, false, false]);
        setRotCorrect(true);
        setSubCorrect(true);

        // compute and reveal SubWord XOR Rcon
        const roundIndex = Math.floor(currentWord / Nk);
        const rc =
          typeof rCon[roundIndex] !== "undefined" ? rCon[roundIndex] : 0;
        const expectedRcon = expectedSub.map((b, i) => (i === 0 ? b ^ rc : b));
        const rconHex = expectedRcon.map((b) =>
          b.toString(16).padStart(2, "0").toUpperCase()
        );
        setRconUser(rconHex);
        setRconIncorrect([false, false, false, false]);
        setRconCorrect(true);
      } else if (caseKind === "subonly") {
        // reveal only SubWord (no rotate, no rcon)
        const expectedSub = subWord(prev);
        const s = expectedSub.map((b) =>
          b.toString(16).padStart(2, "0").toUpperCase()
        );
        setRotUser(["", "", "", ""]);
        setRotIncorrect([false, false, false, false]);
        setRotCorrect(false);
        setSubUser(s);
        setSubIncorrect([false, false, false, false]);
        setSubCorrect(true);
        setRconUser(["", "", "", ""]);
        setRconIncorrect([false, false, false, false]);
        setRconCorrect(false);
      } else {
        // simple case: nothing to reveal, focus step input
        setRotUser(["", "", "", ""]);
        setSubUser(["", "", "", ""]);
        setRconUser(["", "", "", ""]);
      }
      // focus the step inputs after revealing everything (or none)
      setTimeout(() => {
        try {
          stepRefs.current[0] &&
            stepRefs.current[0].focus &&
            stepRefs.current[0].focus();
        } catch (e) {}
      }, 0);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5">Key Expansion Practice</Typography>
        <Box>
          <IconButton onClick={() => setShowHelp(true)}>
            <HelpOutlineIcon />
          </IconButton>
        </Box>
      </Box>

      <Box
        sx={{
          mt: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="body2" sx={{ mb: 1, textAlign: "center" }}>
          Select key size:
        </Typography>
        <ToggleButtonGroup
          value={keySize}
          exclusive
          onChange={handleChangeSize}
          size="small"
        >
          <ToggleButton value={128}>128</ToggleButton>
          <ToggleButton value={192}>192</ToggleButton>
          <ToggleButton value={256}>256</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2">Original Key (words):</Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(Nk, 8)}, 1fr)`,
            gap: 1,
            mt: 1,
          }}
        >
          {wordsFromBytes(keyBytes).map((w, i) => (
            <Box
              key={`kw-${i}`}
              sx={{
                border: "1px solid #ccc",
                borderRadius: 1,
                p: 1,
                bgcolor: "#f5f5f5",
              }}
            >
              <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>
                w[{i}]
              </Typography>
              <Typography sx={{ fontFamily: "monospace" }}>
                {bytesToHexArray(w).join(" ")}
              </Typography>
            </Box>
          ))}
        </Box>
        <Box sx={{ display: "flex", justifyContent: "Left", mt: 1 }}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleRegenerate}
          >
            New Key
          </Button>
        </Box>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2">
          Expanded Key Words (fill the blanks):
        </Typography>
        {currentWord !== null && (
          <Box
            sx={{ border: "1px solid #e0e0e0", p: 2, borderRadius: 1, mt: 1 }}
          >
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              Step guidance — compute w[{currentWord}]
            </Typography>
            <Box sx={{ mt: 1 }}>
              {caseKind === "special" ? (
                <Box
                  sx={{
                    bgcolor: "#f0f7ff",
                    p: 2,
                    borderRadius: 1,
                    border: "1px solid #e3f2fd",
                  }}
                >
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Case 1 — Special transform (i % {Nk} === 0)
                  </Typography>
                  <Typography variant="body2">
                    Apply the following steps to the previous word, in order:
                  </Typography>
                  <Box component="ol" sx={{ pl: 3, mt: 1 }}>
                    <Box component="li" sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        <strong>Rotate:</strong> move the first byte to the end.
                      </Typography>
                    </Box>
                    <Box component="li" sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        <strong>SubWord:</strong> substitute each byte using the
                        S-box.
                      </Typography>
                    </Box>
                    <Box component="li" sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        <strong>XOR Rcon:</strong> XOR the result with the round
                        constant (Rcon).
                      </Typography>
                    </Box>
                    <Box component="li">
                      <Typography variant="body2">
                        <strong>XOR w[i - {Nk}]:</strong> XOR the result with
                        the first word of the previous round key to produce
                        w[i].
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ) : caseKind === "subonly" ? (
                <Box
                  sx={{
                    bgcolor: "#fff7e6",
                    p: 2,
                    borderRadius: 1,
                    border: "1px solid #fff0d6",
                  }}
                >
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Case 2 — Mid-cycle SubWord (i % {Nk} === 4)
                  </Typography>
                  <Typography variant="body2">
                    Apply the following steps to the previous word, in order:
                  </Typography>
                  <Box component="ol" sx={{ pl: 3, mt: 1 }}>
                    <Box component="li" sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        <strong>SubWord:</strong> substitute each byte using the
                        S-box.
                      </Typography>
                    </Box>
                    <Box component="li">
                      <Typography variant="body2">
                        <strong>XOR w[i - {Nk}]:</strong> XOR the result with
                        the first word of the previous round key to produce
                        w[i].
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ) : (
                <Box
                  sx={{
                    bgcolor: "#f7fff0",
                    p: 2,
                    borderRadius: 1,
                    border: "1px solid #e8f5e9",
                  }}
                >
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Case 3 — Simple XOR
                  </Typography>
                  <Box component="ol" sx={{ pl: 3, mt: 1 }}>
                    <Box component="li">
                      <Typography variant="body2">
                        w[i] = w[i - {Nk}] XOR w[i - 1]
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                mt: 2,
                alignItems: "center",
              }}
            >
              {caseKind === "special" ? (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 3,
                      justifyContent: "center",
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <Box
                      sx={{
                        border: "1px solid #ccc",
                        borderRadius: 1,
                        p: 1,
                        minWidth: 200,
                        textAlign: "center",
                        bgcolor: "#fff",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ textAlign: "center", mb: 1 }}
                      >
                        w[i - {Nk}]
                      </Typography>
                      <Box sx={{ display: "flex", justifyContent: "center" }}>
                        {expandedWords[currentWord - Nk] ? (
                          renderBytesAsCells(expandedWords[currentWord - Nk])
                        ) : (
                          <Typography sx={{ fontFamily: "monospace" }}>
                            - - - -
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        border: "1px solid #ccc",
                        borderRadius: 1,
                        p: 1,
                        minWidth: 200,
                        textAlign: "center",
                        bgcolor: "#fff",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ textAlign: "center", mb: 1 }}
                      >
                        w[i - 1]
                      </Typography>
                      <Box sx={{ display: "flex", justifyContent: "center" }}>
                        {expandedWords[currentWord - 1] ? (
                          renderBytesAsCells(expandedWords[currentWord - 1])
                        ) : (
                          <Typography sx={{ fontFamily: "monospace" }}>
                            - - - -
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        border: "1px solid #ccc",
                        borderRadius: 1,
                        p: 1,
                        minWidth: 100,
                        textAlign: "center",
                        bgcolor: "#fff",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ textAlign: "center", mb: 1 }}
                      >
                        Rcon
                      </Typography>
                      <Box sx={{ display: "flex", justifyContent: "center" }}>
                        {typeof rCon[Math.floor(currentWord / Nk)] !==
                        "undefined" ? (
                          renderBytesAsCells([
                            rCon[Math.floor(currentWord / Nk)],
                          ])
                        ) : (
                          <Typography sx={{ fontFamily: "monospace" }}>
                            00
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="body2">RotWord(w[i - 1])</Typography>
                    <Box sx={{ fontFamily: "monospace", mt: 0.5 }}>
                      {caseKind === "special" ? (
                        <Box sx={{ display: "flex", gap: 1 }}>
                          {Array.from({ length: 4 }).map((__, ri) => (
                            <TextField
                              key={`rot-${ri}`}
                              value={rotUser[ri]}
                              onChange={(e) =>
                                handleRotInputChange(ri, e.target.value)
                              }
                              inputRef={(el) => (rotRefs.current[ri] = el)}
                              inputProps={{
                                maxLength: 2,
                                style: {
                                  textTransform: "uppercase",
                                  fontFamily: "monospace",
                                  fontSize: 13,
                                  textAlign: "center",
                                },
                              }}
                              size="small"
                              error={rotIncorrect[ri]}
                              disabled={rotCorrect}
                              sx={{
                                width: 64,
                                ...(rotCorrect
                                  ? {
                                      "& .MuiInputBase-input": {
                                        backgroundColor: "#e8f5e9",
                                      },
                                    }
                                  : {}),
                              }}
                            />
                          ))}
                          <Button variant="contained" onClick={handleCheckRot}>
                            Check Rot
                          </Button>
                          <Button variant="contained" onClick={handleShowRot}>
                            Show
                          </Button>
                        </Box>
                      ) : expandedWords[currentWord - 1] ? (
                        renderBytesAsCells(
                          rotWord(expandedWords[currentWord - 1])
                        )
                      ) : (
                        <Typography sx={{ fontFamily: "monospace" }}>
                          - - - -
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="body2">SubWord</Typography>
                    <Box sx={{ fontFamily: "monospace", mt: 0.5 }}>
                      {caseKind === "special" ? (
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {Array.from({ length: 4 }).map((__, si) => (
                            <TextField
                              key={`sub-${si}`}
                              value={subUser[si]}
                              onChange={(e) =>
                                handleSubInputChange(si, e.target.value)
                              }
                              inputRef={(el) => (subRefs.current[si] = el)}
                              inputProps={{
                                maxLength: 2,
                                style: {
                                  textTransform: "uppercase",
                                  fontFamily: "monospace",
                                  fontSize: 13,
                                  textAlign: "center",
                                },
                              }}
                              size="small"
                              error={subIncorrect[si]}
                              disabled={!rotCorrect || subCorrect}
                              sx={{
                                width: 64,
                                ...(subCorrect
                                  ? {
                                      "& .MuiInputBase-input": {
                                        backgroundColor: "#e8f5e9",
                                      },
                                    }
                                  : {}),
                              }}
                            />
                          ))}
                          <Button
                            variant="contained"
                            onClick={handleCheckSub}
                            disabled={!rotCorrect}
                          >
                            Check Sub
                          </Button>
                          <Button
                            variant="contained"
                            onClick={handleShowSub}
                            disabled={!rotCorrect}
                          >
                            Show
                          </Button>
                        </Box>
                      ) : caseKind === "subonly" ? (
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {Array.from({ length: 4 }).map((__, si) => (
                            <TextField
                              key={`sub-${si}`}
                              value={subUser[si]}
                              onChange={(e) =>
                                handleSubInputChange(si, e.target.value)
                              }
                              inputRef={(el) => (subRefs.current[si] = el)}
                              inputProps={{
                                maxLength: 2,
                                style: {
                                  textTransform: "uppercase",
                                  fontFamily: "monospace",
                                  fontSize: 13,
                                  textAlign: "center",
                                },
                              }}
                              size="small"
                              error={subIncorrect[si]}
                              disabled={subCorrect}
                              sx={{ width: 64 }}
                            />
                          ))}
                          <Button variant="contained" onClick={handleCheckSub}>
                            Check Sub
                          </Button>
                          <Button variant="contained" onClick={handleShowSub}>
                            Show
                          </Button>
                        </Box>
                      ) : expandedWords[currentWord - 1] ? (
                        renderBytesAsCells(
                          subWord(rotWord(expandedWords[currentWord - 1]))
                        )
                      ) : (
                        <Typography sx={{ fontFamily: "monospace" }}>
                          - - - -
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="body2">SubWord XOR Rcon</Typography>
                    <Box sx={{ fontFamily: "monospace", mt: 0.5 }}>
                      {caseKind === "special" ? (
                        <Box
                          sx={{ display: "flex", gap: 1, alignItems: "center" }}
                        >
                          {Array.from({ length: 4 }).map((__, ri) => (
                            <TextField
                              key={`rcon-${ri}`}
                              value={rconUser[ri]}
                              onChange={(e) =>
                                handleRconInputChange(ri, e.target.value)
                              }
                              inputRef={(el) => (rconRefs.current[ri] = el)}
                              inputProps={{
                                maxLength: 2,
                                style: {
                                  textTransform: "uppercase",
                                  fontFamily: "monospace",
                                  fontSize: 13,
                                  textAlign: "center",
                                },
                              }}
                              size="small"
                              error={rconIncorrect[ri]}
                              disabled={!subCorrect || rconCorrect}
                              sx={{
                                width: 64,
                                ...(rconCorrect
                                  ? {
                                      "& .MuiInputBase-input": {
                                        backgroundColor: "#e8f5e9",
                                      },
                                    }
                                  : {}),
                              }}
                            />
                          ))}
                          <Button
                            variant="contained"
                            onClick={handleCheckRcon}
                            disabled={!subCorrect}
                          >
                            Check Rcon
                          </Button>
                          <Button
                            variant="contained"
                            onClick={handleShowRcon}
                            disabled={!subCorrect}
                          >
                            Show
                          </Button>
                        </Box>
                      ) : (
                        <Typography sx={{ fontFamily: "monospace" }}>
                          - - - -
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Box
                    sx={{ display: "flex", justifyContent: "center", mt: 2 }}
                  >
                    <Box sx={{ display: "inline-block" }}>
                      <Typography variant="body2">
                        Result XOR w[i - {Nk}] = w[{currentWord}]
                      </Typography>
                      <Box sx={{ fontFamily: "monospace", mt: 0.5 }}>
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            alignItems: "center",
                            justifyContent: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          {Array.from({ length: 4 }).map((__, bi) => (
                            <TextField
                              key={`step-input-${bi}`}
                              value={stepUserWord[bi]}
                              onChange={(e) =>
                                handleStepInputChange(bi, e.target.value)
                              }
                              inputRef={(el) => (stepRefs.current[bi] = el)}
                              inputProps={{
                                maxLength: 2,
                                style: {
                                  textTransform: "uppercase",
                                  fontFamily: "monospace",
                                  fontSize: 13,
                                  textAlign: "center",
                                },
                              }}
                              size="small"
                              error={stepIncorrect[bi]}
                              disabled={
                                caseKind === "special"
                                  ? !rconCorrect
                                  : caseKind === "subonly"
                                  ? !subCorrect
                                  : false
                              }
                              sx={{ width: 64 }}
                            />
                          ))}
                          <Button
                            variant="contained"
                            onClick={handleStepCheck}
                            disabled={
                              caseKind === "special"
                                ? !rconCorrect
                                : caseKind === "subonly"
                                ? !subCorrect
                                : false
                            }
                          >
                            Check
                          </Button>
                          <Button variant="outlined" onClick={handleStepShow}>
                            Show
                          </Button>
                          <Button
                            onClick={handleStepNext}
                            disabled={!isStepComplete()}
                          >
                            Next
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </>
              ) : (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 3,
                      justifyContent: "flex-start",
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <Box
                      sx={{
                        border: "1px solid #ccc",
                        borderRadius: 1,
                        p: 1,
                        minWidth: 200,
                        textAlign: "center",
                        bgcolor: "#fff",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ textAlign: "center", mb: 1 }}
                      >
                        w[i - {Nk}]
                      </Typography>
                      <Box sx={{ display: "flex", justifyContent: "center" }}>
                        {expandedWords[currentWord - Nk] ? (
                          renderBytesAsCells(expandedWords[currentWord - Nk])
                        ) : (
                          <Typography sx={{ fontFamily: "monospace" }}>
                            - - - -
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        border: "1px solid #ccc",
                        borderRadius: 1,
                        p: 1,
                        minWidth: 200,
                        textAlign: "center",
                        bgcolor: "#fff",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ textAlign: "center", mb: 1 }}
                      >
                        w[i - 1]
                      </Typography>
                      <Box sx={{ display: "flex", justifyContent: "center" }}>
                        {expandedWords[currentWord - 1] ? (
                          renderBytesAsCells(expandedWords[currentWord - 1])
                        ) : (
                          <Typography sx={{ fontFamily: "monospace" }}>
                            - - - -
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>

                  {caseKind === "subonly" && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mt: 1,
                        mb: 2,
                      }}
                    >
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        SubWord
                      </Typography>
                      <Box
                        sx={{ display: "flex", gap: 1, alignItems: "center" }}
                      >
                        {Array.from({ length: 4 }).map((__, si) => (
                          <TextField
                            key={`subonly-step-${si}`}
                            value={subUser[si]}
                            onChange={(e) =>
                              handleSubInputChange(si, e.target.value)
                            }
                            inputRef={(el) => (subRefs.current[si] = el)}
                            inputProps={{
                              maxLength: 2,
                              style: {
                                textTransform: "uppercase",
                                fontFamily: "monospace",
                                fontSize: 13,
                                textAlign: "center",
                              },
                            }}
                            size="small"
                            error={subIncorrect[si]}
                            disabled={subCorrect}
                            sx={{
                              width: 64,
                              '& .MuiOutlinedInput-root': {
                                bgcolor:
                                  subCorrect && keySize === 256
                                    ? '#e8f5e9'
                                    : '#fff',
                              },
                            }}
                          />
                        ))}
                        <Button
                          variant="contained"
                          onClick={handleCheckSub}
                          sx={{ ml: 1 }}
                        >
                          Check Sub
                        </Button>
                        <Button
                          variant="contained"
                          onClick={handleShowSub}
                          sx={{ ml: 1 }}
                        >
                          Show
                        </Button>
                      </Box>
                    </Box>
                  )}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mt: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ minWidth: 200 }}>
                      w[i - {Nk}] XOR w[i - 1] = w[{currentWord}]
                    </Typography>
                    <Box sx={{ fontFamily: "monospace", mt: 0 }}>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          alignItems: "center",
                          justifyContent: "flex-start",
                          flexWrap: "wrap",
                        }}
                      >
                        {Array.from({ length: 4 }).map((__, bi) => (
                          <TextField
                            key={`step-input-${bi}`}
                            value={stepUserWord[bi]}
                            onChange={(e) =>
                              handleStepInputChange(bi, e.target.value)
                            }
                            inputRef={(el) => (stepRefs.current[bi] = el)}
                            inputProps={{
                              maxLength: 2,
                              style: {
                                textTransform: "uppercase",
                                fontFamily: "monospace",
                                fontSize: 13,
                                textAlign: "center",
                              },
                            }}
                            size="small"
                            error={stepIncorrect[bi]}
                            sx={{ width: 64 }}
                          />
                        ))}
                        <Button variant="contained" onClick={handleStepCheck}>
                          Check
                        </Button>
                        <Button variant="outlined" onClick={handleStepShow}>
                          Show
                        </Button>
                        <Button
                          onClick={handleStepNext}
                          disabled={!isStepComplete()}
                        >
                          Next
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          </Box>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(4, minmax(0, 1fr))`,
            gap: 1,
            mt: 1,
            mb: 2,
            justifyContent: "center",
            justifyItems: "center",
            width: "100%",
          }}
        >
          {/* show words from w[0] up to the current target w[currentWord] (inclusive) */}
          {(() => {
            const end =
              currentWord !== null
                ? Math.min(currentWord, totalWords - 1)
                : Nk - 1;
            const count = end + 1; // number of words to render starting from 0
            return Array.from({ length: count }).map((__, idx) => {
              const wi = idx;
              const isCompleted =
                userWords[wi] &&
                expandedWords[wi] &&
                userWords[wi].every(
                  (b, bi) =>
                    b ===
                    expandedWords[wi][bi]
                      .toString(16)
                      .padStart(2, "0")
                      .toUpperCase()
                );
              const isSourceA = currentWord !== null && wi === currentWord - Nk;
              const isSourceB = currentWord !== null && wi === currentWord - 1;
              const isTarget = currentWord !== null && wi === currentWord;
              return (
                <Box
                  key={`ew-${wi}`}
                  sx={{
                    border: "1px solid #ccc",
                    borderRadius: 1,
                    p: 1,
                    boxSizing: "border-box",
                    width: "100%",
                    overflow: "hidden",
                    bgcolor:
                      wi < Nk
                        ? "#f5f5f5"
                        : isTarget
                        ? "#e3f2fd"
                        : isCompleted
                        ? "#e8f5e9"
                        : isSourceA
                        ? "#e8f5e9"
                        : isSourceB
                        ? "#fff8e1"
                        : "#fff",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ display: "block", mb: 0.5 }}
                  >
                    w[{wi}]
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {isTarget
                      ? renderHexCells(stepUserWord, stepIncorrect)
                      : userWords[wi]
                      ? renderHexCells(
                          userWords[wi],
                          incorrect[wi] || [false, false, false, false]
                        )
                      : renderHexCells(
                          ["", "", "", ""],
                          [false, false, false, false]
                        )}
                  </Box>
                </Box>
              );
            });
          })()}
        </Box>
      </Box>

      {/* Full-mode controls removed — step mode uses its own Check/Show/Next */}

      <Dialog
        open={showHelp}
        onClose={() => setShowHelp(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          What is Key Expansion?
          <IconButton
            aria-label="close"
            onClick={() => setShowHelp(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography component="div" sx={{ whiteSpace: "pre-wrap" }}>
            {`AES uses a different key for each encryption round.
  Key Expansion is the process that generates all these round keys from the original key.

  The original key is split into words (1 word = 4 bytes).
  New words are created one by one by combining previous words and, at specific points, applying special transformations (byte rotation, S-box substitution, and a round constant).

  The key size determines how often these special steps are applied:
    - AES-128 (16 bytes / 4 words):
      A special transformation is applied every 4th word.
    - AES-192 (24 bytes / 6 words):
      A special transformation is applied every 6th word.
    - AES-256 (32 bytes / 8 words):
      AES-256 uses three cases when computing new words (special transform every 8th word, an extra SubWord-only step at i%8===4, and simple XOR otherwise).

  There are three cases for AES-256 when computing a new word w[i]:

  Case 1 — Special transform (i % 8 === 0)
  Apply the following steps to the previous word (w[i-1]), in order:
    1. Rotate: move the first byte to the end.
    2. SubWord: substitute each byte using the S-box.
    3. XOR Rcon: XOR the result with the round constant (Rcon).
    4. XOR w[i - 8]: XOR the result with the first word of the previous round key to produce w[i].

  Case 2 — Mid-cycle SubWord (i % 8 === 4)
  Apply the following step to the previous word (w[i-1]):
    1. SubWord: substitute each byte using the S-box.
    2. XOR w[i - 8]: XOR the result with the word 8 positions before to produce w[i].

  Case 3 — Simple XOR (all other words)
    w[i] = w[i - 8] XOR w[i - 1]

  AES always needs one round key per round plus one initial key.
  Each round key is 4 words, so the total number of expanded words is:
    - AES-128: 44 words
    - AES-192: 52 words
    - AES-256: 60 words`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHelp(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={showComplete}
        onClose={() => setShowComplete(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>Congratulations!</span>
          <IconButton
            aria-label="close"
            size="small"
            onClick={() => setShowComplete(false)}
            sx={{ ml: 1 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography>You calculated all words of the expanded key.</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => {
              setShowComplete(false);
              handleRegenerate();
            }}
          >
            Continue with New Key
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KeyExpansionPractice;
