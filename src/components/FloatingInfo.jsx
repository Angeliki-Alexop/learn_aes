import React, { useState, useEffect, useRef } from "react";
import "./FloatingInfo.css";
import { STEP_INFO } from "../stepInformation/StepInfo";
import infoImg from "../assets/aes_info_image.png";

export default function FloatingInfo({
  keySize = 128,
  currentStep = null,
  hasSubmitted = false,
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("what");
  const panelRef = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (open && panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const buildHow = (stepKey) => {
    let how = (STEP_INFO[stepKey] && STEP_INFO[stepKey].how) || "";
    if (stepKey === "Key Expansion") {
      const wordsPerKey = keySize === 128 ? 4 : keySize === 192 ? 6 : 8;
      let extra = `Current key size: AES-${keySize} (${wordsPerKey} words per round key).\n\nIn the Key Schedule view you can click any word (a 4-byte column) to inspect how it was generated. Words are grouped into round keys of ${wordsPerKey} words; the special core transformation is applied every ${wordsPerKey}th word. Click any byte inside a word to highlight the contributing previous words and transformations, making it easier to trace how that expanded word was derived.\n`;

      if (wordsPerKey === 8) {
        extra += `\nThere are three cases when computing a new word w[i]:\n\nCase 1 — Special transform (i % 8 === 0)\nApply the following steps to the previous word (w[i-1]), in order:\n  1. Rotate: move the first byte to the end.\n  2. SubWord: substitute each byte using the S-box.\n  3. XOR Rcon: XOR the result with the round constant (Rcon).\n  4. XOR w[i - 8]: XOR the result with the first word of the previous round key to produce w[i].\n\nCase 2 — Mid-cycle SubWord (i % 8 === 4)\nApply the following step to the previous word (w[i-1]):\n  1. SubWord: substitute each byte using the S-box.\n2. XOR w[i - 8]: XOR the result with the word 8 positions before to produce w[i].\n\nCase 3 — Simple XOR (all other words)\n  w[i] = w[i - 8] XOR w[i - 1]\n\nUse the above rules with the current round key size (words per key = ${wordsPerKey}).`;
      } else {
        extra += `\nThere are two cases when computing a new word w[i]:\n\nCase 1 — Special transform (i % ${wordsPerKey} === 0)\nApply the following steps to the previous word (w[i-1]), in order:\n  1. Rotate: move the first byte to the end.\n  2. SubWord: substitute each byte using the S-box.\n  3. XOR Rcon: XOR the result with the round constant (Rcon).\n  4. XOR w[i - ${wordsPerKey}]: XOR the result with the word ${wordsPerKey} positions before (start of the previous round key) to produce w[i].\n\nCase 2 — Simple XOR\n  w[i] = w[i - ${wordsPerKey}] XOR w[i - 1]\n\nUse the above rules with the current round key size (words per key = ${wordsPerKey}).`;
      }

      how = how + "\n" + extra;
    }
    return how;
  };

  // Determine the info to show based on currentStep
  const showInfoFor = (step) => {
    if (!step) return null;
    if (step === "Input" || step === "Result") return null;
    return STEP_INFO[step] || null;
  };

  const info = showInfoFor(currentStep);

  // phrasing for input/result (before and after submit)
  const minimalForInputBefore = {
    what: "This section serves as the algorithm’s input area. Select the operation mode (Encryption or Decryption), specify the key size, enter the secret key, and provide the text to be encrypted or decrypted.",
    how: "Step 1: Choose mode (Encryption or Decryption). This determines whether the simulation runs the forward AES steps (Encryption) or the inverse steps (Decryption). For Decryption you must use the same key size and key that were used to produce the ciphertext.\n\nStep 2: Select Key Size (128, 192, or 256 bits). The key size sets the expected key length and the number of AES rounds.\n\nStep 3: Enter the text to process. For Encryption provide plaintext and for Decryption provide ciphertext.\n\n Step 4: Enter the secret key matching the selected key size. The key must have the correct length for the chosen size (e.g., 128-bit = 32 hex characters). For Decryption this must be the original key used during encryption.\n\n Step 5: Click Submit to start the step‑by‑step simulation. ",
  };

  const minimalForInputAfter = {
    what: "This page summarizes all the parameters selected for the AES operation and shows how your input is prepared before the algorithm steps begin.",
    how: "This tool lets you explore the AES algorithm step by step, giving you full control over each round and operation. Use the navigation options below to move through the algorithm at your own pace and focus on the parts you want to understand.\n\n • Use the sidebar to select any AES round and jump directly to a specific step (SubBytes, ShiftRows, MixColumns, or AddRoundKey).\n\n • Use the Previous / Next Step buttons to move through the algorithm steps within the current round.\n\n • Use the Previous / Next Round buttons to navigate between AES rounds.\n\n • The Input button returns you to the input and configuration summary page.\n\n • The Final Round button takes you directly to the last round of the AES algorithm.\n\nEnjoy exploring AES!",
  };
  const minimalForResult = {
    what: "The step-by-step AES process has now been completed!\n This page presents a complete overview of the AES encryption outcome, showing how the original input text and encryption key are processed and transformed into the final encrypted output.",
    how: "You have reached the end of the step-by-step AES process!\n\n If you’d like to try again with different values, you can restart the process at any time by clicking the STEPBYSTEP button in the navigation bar, or revisit any round and step to review how the algorithm works in detail.\n\n When you feel confident with the AES process, head over to the Train page to challenge yourself and practice the AES steps on your own.\n Good luck!",
  };

  const renderWhat = () => {
    if (currentStep === "Input")
      return hasSubmitted
        ? minimalForInputAfter.what
        : minimalForInputBefore.what;
    if (currentStep === "Result") return minimalForResult.what;
    return info ? info.what : "";
  };

  const renderHow = () => {
    if (currentStep === "Input")
      return hasSubmitted
        ? minimalForInputAfter.how
        : minimalForInputBefore.how;
    if (currentStep === "Result") return minimalForResult.how;
    if (!info) return "";
    // for Key Expansion append dynamic text
    if (currentStep === "Key Expansion") return buildHow(currentStep);
    return info.how || "";
  };

  return (
    <>
      <button
        className={`floating-info-button ${open ? "open-panel" : ""}`}
        aria-label="Open info"
        onClick={() => setOpen((s) => !s)}
      >
        <img src={infoImg} alt="info" className="floating-info-img" />
      </button>

      {open && (
        <div
          className="floating-info-panel"
          role="dialog"
          aria-modal="false"
          ref={panelRef}
        >
          <button
            className="floating-info-close"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
          <div className="floating-info-body">
            <div className="floating-info-tabs">
              <button
                type="button"
                className={`floating-info-tab ${
                  tab === "what" ? "active" : ""
                }`}
                onClick={() => setTab("what")}
              >
                What is it?
              </button>
              <button
                type="button"
                className={`floating-info-tab ${tab === "how" ? "active" : ""}`}
                onClick={() => setTab("how")}
              >
                How to interact?
              </button>
            </div>

            <div className="floating-info-section">
              <h4 className="floating-info-section-title">
                {tab === "what" ? "What is it?" : "How to interact?"}
              </h4>
              <div
                className="floating-info-section-content"
                style={{ whiteSpace: "pre-line" }}
              >
                {tab === "what" ? renderWhat() : renderHow()}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
