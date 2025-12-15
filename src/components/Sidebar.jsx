import React from 'react';
import { Typography, List, ListItem, ListItemText, Box } from '@mui/material';
import './../styles/Sidebar.css';
const steps = ['SubBytes', 'ShiftRows', 'MixColumns', 'AddRoundKey'];
const finalRoundSteps = ['SubBytes', 'ShiftRows', 'AddRoundKey'];
function Sidebar({ currentRound, currentStep, inputText, aesKey, algorithm, keySize, mode, setCurrentRound, setCurrentStep }) {
  const totalRounds = keySize === 128 ? 10 : keySize === 192 ? 12 : 14; // Determine total rounds based on key size
  const handleStepClick = (round, step) => {
    if (round < 0) {
      setCurrentRound(round);
      setCurrentStep(step);
    } else if (round >= 0 && round < totalRounds) {
      setCurrentRound(round);
      setCurrentStep(step);
    } else if (round === totalRounds) {
      setCurrentRound(totalRounds);
      setCurrentStep(step);
    }
    else if (round === totalRounds + 1) {
      setCurrentRound(totalRounds + 1);
      setCurrentStep(step);
    }
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
      <Box id="round_zero_box" className="round-box" mb={2}>
        <Typography
          variant="h6"
          component="h2"
          align="center"
          onClick={() => { setCurrentRound(0); setCurrentStep('AddRoundKey'); }}
          style={{ cursor: 'pointer' }}
        >
          Round 0
        </Typography>
        {/* Only show the steps list when this round is active */}
        {currentRound === 0 && (
          <List>
            <ListItem
              className={currentStep === 'AddRoundKey' && currentRound === 0 ? 'active-step' : ''}
              onClick={() => { setCurrentRound(0); setCurrentStep('AddRoundKey'); }}
            >
              <ListItemText primary="AddRoundKey" />
            </ListItem>
          </List>
        )}
      </Box>
      {/* Render rounds 1 .. totalRounds-1 individually. Each round shows its steps only when it's the active round. */}
      {Array.from({ length: Math.max(0, totalRounds - 1) }, (_, i) => i + 1).map((round) => (
        <Box key={round} id={`round_${round}_box`} className="round-box" mb={2}>
          <Typography variant="h6" component="h2" align="center" onClick={() => { setCurrentRound(round); /* default to first step when opening a round */ setCurrentStep(round === totalRounds ? finalRoundSteps[0] : steps[0]); }} style={{ cursor: 'pointer' }}>
            Round {round}
          </Typography>
          {/* Only show the steps list when this round is active */}
          {currentRound === round && (
            <List>
              {(round === totalRounds ? finalRoundSteps : steps).map((step, index) => (
                <ListItem key={index} className={currentStep === step && currentRound === round ? 'active-step' : ''} onClick={() => { setCurrentRound(round); setCurrentStep(step); }}>
                  <ListItemText primary={step} />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      ))}

      {/* Final Round - totalRounds (rendered explicitly in case totalRounds===1) */}
      <Box id="final_round_box" className="round-box" mb={2}>
        <Typography variant="h6" component="h2" align="center" onClick={() => { setCurrentRound(totalRounds); setCurrentStep(finalRoundSteps[0]); }} style={{ cursor: 'pointer' }}>
          Final Round ({totalRounds})
        </Typography>
        {currentRound === totalRounds && (
          <List>
            {finalRoundSteps.map((step, index) => (
              <ListItem key={index} className={currentStep === step && currentRound === totalRounds ? 'active-step' : ''} onClick={() => { setCurrentRound(totalRounds); setCurrentStep(step); }}>
                <ListItemText primary={step} />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
      <Box id="result_box" className={`round-box ${currentStep === 'Result' ? 'active-step' : ''}`} mb={2} onClick={() => handleStepClick(totalRounds + 1, 'Result')}>
        <Typography variant="h6" component="h2" align="center">
          Result
        </Typography>
      </Box>
    </div>
  );
}
export default Sidebar;