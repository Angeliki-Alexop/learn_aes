import React, { useState, useEffect } from 'react';
import { Button, TextField, Box, Typography, Select, MenuItem, Paper, Divider } from '@mui/material';
import { padPKCS7, unpadPKCS7, keyExpansion, aesDecryptStepByStep } from '../utils/aes_manual_v2';
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
  const [decryptFormat, setDecryptFormat] = useState('base64');
  // custom inputs state for encrypt/decrypt sections
  const [encInput, setEncInput] = useState(hardcodedTests[0].inputText);
  const [decInput, setDecInput] = useState('');
  const [generatedDecrypts, setGeneratedDecrypts] = useState([]);

  const runTestCase = (tc) => {
    // Shared validation
    if (!tc.inputText || tc.inputText.length === 0) {
      return { name: tc.name, pass: false, message: 'Input must not be empty.' };
    }

    try {
      const totalRounds = tc.keySize === 128 ? 10 : tc.keySize === 192 ? 12 : 14;
      const expandedKey = keyExpansion(tc.key.split('').map((ch) => ch.charCodeAt(0)), tc.keySize);
      const roundKeys = [];
      for (let i = 0; i <= totalRounds; i++) {
        roundKeys.push(expandedKey.slice(i * 16, (i + 1) * 16));
      }

      const requiredKeyLen = tc.keySize === 128 ? 16 : tc.keySize === 192 ? 24 : 32;
      if (!tc.key || tc.key.length !== requiredKeyLen) {
        return { name: tc.name, pass: false, message: `Key must be exactly ${requiredKeyLen} characters long` };
      }

      if (tc.action === 'encrypt') {
        if (tc.inputText.length > 16) return { name: tc.name, pass: false, message: 'Input larger than 16 chars not supported.' };
        const initialState = tc.inputText.split('').map((ch) => ch.charCodeAt(0));
        const padded = padPKCS7(initialState, 16);
        const stepsMap = generateStateMap(padded, roundKeys, totalRounds);
        let stepsCount = 0;
        for (const [round, stepsArr] of stepsMap.entries()) if (round >= 0) stepsCount += stepsArr.length;
        const expectedCount = 4 * estimateRounds(tc.keySize);
        const pass = stepsCount === expectedCount;
        const lastRoundSteps = stepsMap.get(totalRounds) || [];
        const lastStep = lastRoundSteps[lastRoundSteps.length - 1] || null;
  return { name: tc.name, pass, message: pass ? `Steps: ${stepsCount}` : `Unexpected steps length ${stepsCount} (expected ${expectedCount})`, details: { stepsCount, expectedCount, lastStep, key: tc.key } };
      }

      // decrypt
      let inputBytes;
      if (tc.format === 'hex') {
        const hexRe = /^[0-9a-fA-F]{32}$/;
        if (!hexRe.test(tc.inputText)) return { name: tc.name, pass: false, message: 'Hex must be 32 hex characters (16 bytes).' };
        inputBytes = tc.inputText.match(/.{1,2}/g).map((h) => parseInt(h, 16));
      } else {
        // base64
        try {
          const binary = atob(tc.inputText);
          inputBytes = Array.from({ length: binary.length }, (_, i) => binary.charCodeAt(i));
        } catch (e) {
          return { name: tc.name, pass: false, message: 'Invalid base64 input.' };
        }
        if (inputBytes.length !== 16) return { name: tc.name, pass: false, message: 'Decoded base64 must be 16 bytes.' };
      }

      const steps = aesDecryptStepByStep(inputBytes, tc.key, tc.keySize);
      const expectedCount = 4 * estimateRounds(tc.keySize);
      const lastStep = steps[steps.length - 1] || null;

      // Convert last step state to byte array
      let decryptedBytes = [];
      if (lastStep && lastStep.state) {
        if (Array.isArray(lastStep.state)) {
          decryptedBytes = lastStep.state.map(h => parseInt(h, 16));
        } else if (typeof lastStep.state === 'string') {
          const hexStr = lastStep.state.replace(/\s+/g, '');
          decryptedBytes = hexStr.match(/.{1,2}/g).map(h => parseInt(h, 16));
        }
      }

      const unpadded = unpadPKCS7(decryptedBytes, 16);
      const plaintext = unpadded && unpadded.length > 0 ? String.fromCharCode(...unpadded) : '';

      // If originalBytes provided (generated tests), assert equality after unpad
      let contentMatches = true;
      if (tc.originalBytes && Array.isArray(tc.originalBytes)) {
        const a = tc.originalBytes;
        const b = unpadded;
        if (!Array.isArray(b) || a.length !== b.length) contentMatches = false;
        else {
          for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) { contentMatches = false; break; }
        }
      }

      const pass = Array.isArray(steps) && steps.length === expectedCount && contentMatches;
      const message = pass ? `Decrypt OK, steps: ${steps.length}` : `Decrypt failed (steps ${steps.length}, expected ${expectedCount})${tc.originalBytes ? ', content mismatch' : ''}`;
      return { name: tc.name, pass, message, details: { stepsCount: steps.length, expectedCount, lastStep, key: tc.key, decryptedBytes, unpadded, plaintext } };
    } catch (err) {
      return { name: tc.name, pass: false, message: `Exception: ${err.message}` };
    }
  };

  // Build generated encrypt+decrypt entries from hardcodedTests
  const buildGeneratedEntries = () => {
    const generated = [];
    const decryptsForDisplay = [];

    for (let idx = 0; idx < hardcodedTests.length; idx++) {
      const t = hardcodedTests[idx];
      // encrypt test entry
      generated.push({ ...t, action: 'encrypt' });

      // compute ciphertext using same flow
      const initialState = t.inputText.split('').map((ch) => ch.charCodeAt(0));
      const padded = padPKCS7(initialState, 16);
      const totalRounds = t.keySize === 128 ? 10 : t.keySize === 192 ? 12 : 14;
      const expandedKey = keyExpansion(t.key.split('').map((ch) => ch.charCodeAt(0)), t.keySize);
      const roundKeys = [];
      for (let i = 0; i <= totalRounds; i++) {
        roundKeys.push(expandedKey.slice(i * 16, (i + 1) * 16));
      }
      const stepsMap = generateStateMap(padded, roundKeys, totalRounds);
      const finalRound = stepsMap.get(totalRounds) || [];
      const last = finalRound[finalRound.length - 1];
      // `last.state` is stored as a string like "63 7c ..." (toHex output).
      const hexStr = typeof last.state === 'string' ? last.state.replace(/\s+/g, '') : (Array.isArray(last.state) ? last.state.join('') : String(last.state));
      const bytes = hexStr.match(/.{1,2}/g).map((h) => parseInt(h, 16));
      const binary = String.fromCharCode(...bytes);
      const b64 = btoa(binary);

      // alternate formats: even idx -> hex, odd idx -> base64
      // include original plaintext bytes for later assertion
      const originalBytes = t.inputText.split('').map((ch) => ch.charCodeAt(0));
      if (idx % 2 === 0) {
        generated.push({ name: `${t.name} decrypt-hex`, inputText: hexStr, key: t.key, keySize: t.keySize, action: 'decrypt', format: 'hex', originalBytes });
        decryptsForDisplay.push({ name: `${t.name} decrypt-hex`, inputText: hexStr, format: 'hex', keySize: t.keySize, key: t.key });
      } else {
        generated.push({ name: `${t.name} decrypt-b64`, inputText: b64, key: t.key, keySize: t.keySize, action: 'decrypt', format: 'base64', originalBytes });
        decryptsForDisplay.push({ name: `${t.name} decrypt-b64`, inputText: b64, format: 'base64', keySize: t.keySize, key: t.key });
      }
    }

    return { generated, decryptsForDisplay };
  };

  const runAll = () => {
    const { generated, decryptsForDisplay } = buildGeneratedEntries();
    setGeneratedDecrypts(decryptsForDisplay);
    const out = generated.map((tc) => runTestCase(tc));
    setResults(out);
  };

  // Precompute generated decrypt examples so they're visible before clicking the button
  useEffect(() => {
    const { decryptsForDisplay } = buildGeneratedEntries();
    setGeneratedDecrypts(decryptsForDisplay);
  }, []);

  const runCustom = (useMode) => {
    const tc = { name: 'Custom', inputText, key, keySize, mode: useMode || mode };
    const out = [runTestCase(tc)];
    setResults(out);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5">Hidden Test Runner</Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>This page is intentionally unlinked. Use it to run quick unit-style checks of the step-by-step AES implementation.</Typography>

      <Paper sx={{ p: 2, mb: 2 }} elevation={1}>
        <Typography variant="subtitle1">Hardcoded Encrypt tests</Typography>
        <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
          <Button variant="contained" onClick={runAll}>Run all hardcoded tests</Button>
        </Box>
        <Divider sx={{ my: 1 }} />
        {hardcodedTests.map((t, i) => (
          <Box key={i} sx={{ mb: 1 }}>
            <Typography variant="body2">{t.name} — input: "{t.inputText}" keySize: {t.keySize}</Typography>
          </Box>
        ))}
        {generatedDecrypts.length > 0 && (
          <>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2">Generated decrypt examples</Typography>
            {generatedDecrypts.map((d, i) => (
              <Box key={`g-${i}`} sx={{ mb: 1 }}>
                <Typography variant="body2">{d.name} — {d.format}: "{d.inputText}" keySize: {d.keySize}</Typography>
              </Box>
            ))}
          </>
        )}
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }} elevation={1}>
        <Typography variant="subtitle1">Encrypt custom</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
          <TextField label="Plaintext (up to 16 chars)" value={encInput} onChange={(e) => setEncInput(e.target.value)} sx={{ minWidth: 260 }} />
          <TextField label="Key" value={key} onChange={(e) => setKey(e.target.value)} sx={{ minWidth: 260 }} />
          <Select value={keySize} onChange={(e) => setKeySize(Number(e.target.value))}>
            <MenuItem value={128}>128</MenuItem>
            <MenuItem value={192}>192</MenuItem>
            <MenuItem value={256}>256</MenuItem>
          </Select>
          <Button variant="contained" onClick={() => {
            const tc = { name: 'Custom Encrypt', inputText: encInput, key, keySize, action: 'encrypt' };
            setResults([runTestCase(tc)]);
          }}>Run encrypt</Button>
        </Box>
        <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>Note: plaintext will be PKCS#7 padded to 16 bytes.</Typography>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }} elevation={1}>
        <Typography variant="subtitle1">Decrypt custom</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
          <Select value={decryptFormat} onChange={(e) => setDecryptFormat(e.target.value)} sx={{ minWidth: 120 }}>
            <MenuItem value={'base64'}>Base64</MenuItem>
            <MenuItem value={'hex'}>Hex</MenuItem>
          </Select>
          <TextField label="Encrypted (base64 or hex)" value={decInput} onChange={(e) => setDecInput(e.target.value)} sx={{ minWidth: 260 }} />
          <TextField label="Key" value={key} onChange={(e) => setKey(e.target.value)} sx={{ minWidth: 260 }} />
          <Select value={keySize} onChange={(e) => setKeySize(Number(e.target.value))}>
            <MenuItem value={128}>128</MenuItem>
            <MenuItem value={192}>192</MenuItem>
            <MenuItem value={256}>256</MenuItem>
          </Select>
          <Button variant="contained" onClick={() => {
            const tc = { name: 'Custom Decrypt', inputText: decInput, key, keySize, action: 'decrypt', format: decryptFormat };
            setResults([runTestCase(tc)]);
          }}>Run decrypt</Button>
        </Box>
        <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>Note: provide base64 or hex of a single 16-byte encrypted block.</Typography>
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
              {r.details && typeof r.details.plaintext !== 'undefined' && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption">Decrypted plaintext: "{r.details.plaintext}"</Typography>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}
