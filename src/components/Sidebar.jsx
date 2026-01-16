import React from 'react';
import { Typography, List, ListItem, ListItemText, Box } from '@mui/material';
import './../styles/Sidebar.css';
const stepsEncrypt = ['SubBytes', 'ShiftRows', 'MixColumns', 'AddRoundKey'];
const finalRoundStepsEncrypt = ['SubBytes', 'ShiftRows', 'AddRoundKey'];
const stepsDecrypt = ['InvShiftRows', 'InvSubBytes', 'AddRoundKey', 'InvMixColumns'];
const finalRoundStepsDecrypt = ['InvShiftRows', 'InvSubBytes', 'AddRoundKey'];
function Sidebar({ currentRound, currentStep, inputText, aesKey, algorithm, keySize, mode, setCurrentRound, setCurrentStep }) {
  const totalRounds = keySize === 128 ? 10 : keySize === 192 ? 12 : 14; // Determine total rounds based on key size
  const handleStepClick = (displayRound, step) => {
    // displayRound is the visual label (may be reversed in Decrypt mode)
    if (displayRound < 0) {
      setCurrentRound(displayRound);
      setCurrentStep(step);
      return;
    }
    // map visual label -> internal state key
    const stateKey = mode === 'Decrypt' ? totalRounds - displayRound : displayRound;
    setCurrentRound(stateKey);
    setCurrentStep(step);
  };
  return (
    <div className="sidebar">
      <Box id="input_box" className={`round-box ${currentStep === 'Input' ? 'active-step' : ''}`} mb={2} onClick={() => handleStepClick(-2, 'Input')}>
        <Typography variant="h6" component="h2" align="center">
          Input
        </Typography>
      </Box>
      <Box id="key_schedule_box" className="round-box" mb={2}>
        <Typography
          variant="h6"
          component="h2"
          align="center"
          onClick={() => { setCurrentRound(-1); setCurrentStep('Key Expansion'); }}
          style={{ cursor: 'pointer' }}
        >
          Key Schedule
        </Typography>
        {/* Only show Key Expansion when Key Schedule is active */}
        {currentRound === -1 && (
          <List>
            <ListItem className={currentStep === 'Key Expansion' && currentRound === -1 ? 'active-step' : ''} onClick={() => { setCurrentRound(-1); setCurrentStep('Key Expansion'); }}>
              <ListItemText primary="Key Expansion" />
            </ListItem>
          </List>
        )}
      </Box>
      {/* Round boxes (visual order depends on mode) */}
      {(() => {
        const displayRounds = mode === 'Decrypt'
          ? Array.from({ length: totalRounds + 1 }, (_, i) => totalRounds - i) // [totalRounds, ..., 0]
          : Array.from({ length: totalRounds + 1 }, (_, i) => i); // [0, 1, ..., totalRounds]
        return displayRounds.map((displayRound) => {
          const stateKey = mode === 'Decrypt' ? totalRounds - displayRound : displayRound;
          // Determine which steps to show for this internal stateKey
          let stepsToShow = [];
          if (stateKey === 0) {
            // first round (internal 0) only has AddRoundKey
            stepsToShow = ['AddRoundKey'];
          } else if (stateKey === totalRounds) {
            // final round uses the final-round step set
            stepsToShow = mode === 'Decrypt' ? finalRoundStepsDecrypt : finalRoundStepsEncrypt;
          } else {
            // middle rounds use the full steps (encrypt/decrypt variants)
            stepsToShow = mode === 'Decrypt' ? stepsDecrypt : stepsEncrypt;
          }
          const defaultStep = stepsToShow[0];
          return (
            <Box key={displayRound} id={`round_${displayRound}_box`} className="round-box" mb={2}>
              <Typography
                variant="h6"
                component="h2"
                align="center"
                onClick={() => { handleStepClick(displayRound, defaultStep); }}
                style={{ cursor: 'pointer' }}
              >
                Round {displayRound}
              </Typography>
              {/* Show steps for the linked stateKey */}
              {currentRound === stateKey && (
                <List>
                  {stepsToShow.map((step, index) => (
                    <ListItem
                      key={index}
                      className={currentStep === step && currentRound === stateKey ? 'active-step' : ''}
                      onClick={() => { handleStepClick(displayRound, step); }}
                    >
                      <ListItemText primary={step} />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          );
        });
      })()}
      {/* Result box */}
      <Box id="result_box" className={`round-box ${currentStep === 'Result' ? 'active-step' : ''}`} mb={2} onClick={() => handleStepClick(totalRounds + 1, 'Result')}>
        <Typography variant="h6" component="h2" align="center">
          Result
        </Typography>
      </Box>
    </div>
  );
}
export default Sidebar;