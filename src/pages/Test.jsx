import React, { useState } from 'react';
import { Button, TextField, Box, Typography, Select, MenuItem, Paper, Divider } from '@mui/material';
import { padPKCS7, keyExpansion } from '../utils/aes_manual_v2';
import { generateStateMap } from '../utils/stepByStepHandlers';

const hardcodedTests = [
  {
    name: 'AES-128 simple',
    inputText: 'abcdefghijklmnop', // 16 chars
    key: 'abcdefghijklmnop', // 16 chars
    keySize: 128,
  },
  {
    name: 'AES-192 simple',
    inputText: 'abcdefghijklmnop',
    key: 'abcdefghijklmnopqrstuvwx', // 24 chars
    keySize: 192,
  },
  {
    name: 'AES-256 simple',
    inputText: 'abcdefghijklmnop',
    key: 'abcdefghijklmnopqrstuvwxyzABCDEF', // 32 chars
    keySize: 256,
  },
];

function estimateRounds(keySize) {
  return keySize === 128 ? 10 : keySize === 192 ? 12 : 14;
}

export default function Test() {
  const [results, setResults] = useState([]);
  const [inputText, setInputText] = useState(hardcodedTests[0].inputText);
  const [key, setKey] = useState(hardcodedTests[0].key);
  const [keySize, setKeySize] = useState(hardcodedTests[0].keySize);

  const runTestCase = (tc) => {
    // Allow shorter inputs by padding them to 16 bytes using the same padPKCS7 used in StepByStep
    if (!tc.inputText || tc.inputText.length === 0) {
      return { name: tc.name, pass: false, message: 'Input must not be empty.' };
    }

    if (tc.inputText.length > 16) {
      return { name: tc.name, pass: false, message: 'Input larger than 16 characters is not supported by this quick tester.' };
    }

    try {
      // Convert to byte array, pad to 16 bytes, then convert back to string to reuse aesEncryptStepByStep's string input handling
      const initialState = tc.inputText.split('').map((ch) => ch.charCodeAt(0));
      const padded = padPKCS7(initialState, 16);
      const paddedString = String.fromCharCode(...padded);

      // Prepare expanded keys and state map the same way StepByStep does
      const expandedKey = keyExpansion(tc.key.split('').map((ch) => ch.charCodeAt(0)), tc.keySize);
      const totalRounds = tc.keySize === 128 ? 10 : tc.keySize === 192 ? 12 : 14;
      const roundKeys = [];
      for (let i = 0; i <= totalRounds; i++) {
        roundKeys.push(expandedKey.slice(i * 16, (i + 1) * 16));
      }

      const stepsMap = generateStateMap(padded, roundKeys, totalRounds);
      // Count total steps stored in the map (exclude Input and Key Expansion) for the 'expected' metric
      let stepsCount = 0;
      for (const [round, stepsArr] of stepsMap.entries()) {
        if (round >= 0) stepsCount += stepsArr.length;
      }
      const expectedCount = 4 * estimateRounds(tc.keySize);
      const pass = stepsCount === expectedCount;
      const lastRoundSteps = stepsMap.get(totalRounds) || [];
      const lastStep = lastRoundSteps[lastRoundSteps.length - 1] || null;
      return {
        name: tc.name,
        pass,
        message: pass ? `Steps: ${stepsCount} (expected ${expectedCount}).` : `Unexpected steps length ${stepsCount} (expected ${expectedCount}).`,
        details: { stepsCount, expectedCount, lastStep },
      };
    } catch (err) {
      return { name: tc.name, pass: false, message: `Exception: ${err.message}` };
    }
  };

  const runAll = () => {
    const out = hardcodedTests.map(runTestCase);
    setResults(out);
  };

  const runCustom = () => {
    const tc = { name: 'Custom', inputText, key, keySize };
    const out = [runTestCase(tc)];
    setResults(out);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5">Hidden Test Runner</Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>This page is intentionally unlinked. Use it to run quick unit-style checks of the step-by-step AES implementation.</Typography>

      <Paper sx={{ p: 2, mb: 2 }} elevation={1}>
        <Typography variant="subtitle1">Hardcoded tests</Typography>
        <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
          <Button variant="contained" onClick={runAll}>Run all hardcoded tests</Button>
        </Box>
        <Divider sx={{ my: 1 }} />
        {hardcodedTests.map((t, i) => (
          <Box key={i} sx={{ mb: 1 }}>
            <Typography variant="body2">{t.name} — input: "{t.inputText}" keySize: {t.keySize}</Typography>
          </Box>
        ))}
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }} elevation={1}>
        <Typography variant="subtitle1">Custom test</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
          <TextField label="Input (16 chars)" value={inputText} onChange={(e) => setInputText(e.target.value)} sx={{ minWidth: 260 }} />
          <TextField label="Key" value={key} onChange={(e) => setKey(e.target.value)} sx={{ minWidth: 260 }} />
          <Select value={keySize} onChange={(e) => setKeySize(Number(e.target.value))}>
            <MenuItem value={128}>128</MenuItem>
            <MenuItem value={192}>192</MenuItem>
            <MenuItem value={256}>256</MenuItem>
          </Select>
          <Button variant="contained" onClick={runCustom}>Run custom</Button>
        </Box>
        <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>Note: input must be exactly 16 characters (one AES block) for these tests.</Typography>
      </Paper>

      <Paper sx={{ p: 2 }} elevation={1}>
        <Typography variant="subtitle1">Results</Typography>
        <Box sx={{ mt: 1 }}>
          {results.length === 0 && <Typography variant="body2">No results yet.</Typography>}
          {results.map((r, i) => (
            <Box key={i} sx={{ mb: 1, p: 1, border: '1px solid #eee', borderRadius: 1, background: r.pass ? '#e8f5e9' : '#ffebee' }}>
              <Typography variant="body2"><strong>{r.name}</strong> — {r.pass ? 'PASS' : 'FAIL'}</Typography>
              <Typography variant="caption">{r.message}</Typography>
              {r.details && r.details.lastStep && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption">Last step state (hex): {Array.isArray(r.details.lastStep.state) ? r.details.lastStep.state.join(' ') : JSON.stringify(r.details.lastStep)}</Typography>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}
