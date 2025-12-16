import React, { useState, useEffect, useRef } from "react";
import "./FloatingInfo.css";
import { STEP_INFO } from "../stepInformation/StepInfo";
import infoImg from "../assets/aes_info_image.png";

export default function FloatingInfo({ keySize = 128, currentStep = null }) {
  const [open, setOpen] = useState(false);
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
      const extra = `Current key size: AES-${keySize} (${wordsPerKey} words per round key).\n\nIn the Key Schedule view you can click any word (a 4-byte column) to inspect how it was generated. Words are grouped into round keys of ${wordsPerKey} words; the special core transformation is applied every ${wordsPerKey}th word. Click any byte inside a word to highlight the contributing previous words and transformations, making it easier to trace how that expanded word was derived.\n\nThere are two cases when computing a new word w[i]:\n\nCase 1 — Special transform (i % ${wordsPerKey} === 0)\nApply the following steps to the previous word (w[i-1]), in order:\n  1. Rotate: move the first byte to the end.\n  2. SubWord: substitute each byte using the S-box.\n  3. XOR Rcon: XOR the result with the round constant (Rcon).\n  4. XOR w[i - ${wordsPerKey}]: XOR the result with the word ${wordsPerKey} positions before (start of the previous round key) to produce w[i].\n\nCase 2 — Simple XOR\n  w[i] = w[i - ${wordsPerKey}] XOR w[i - 1]\n\nUse the above rules with the current round key size (words per key = ${wordsPerKey}).`;

      how = how + "\n\n" + extra;
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

  // phrasing for input/result
  const minimalForInput = {
    what: "This is the input of the algorithm. Enter plaintext and key values here before running the step-by-step simulation.",
    how: "Before submitting: edit the Input values and select the Key Size. After submitting: use the sidebar or the navigation buttons (Previous/Next Step, Previous/Next Round) to move through the rounds and steps.",
  };
  const minimalForResult = {
    what: "Step-by-step AES has ended.",
    how: "You can review the final state or restart from the Input step.",
  };

  const renderWhat = () => {
    if (currentStep === "Input") return minimalForInput.what;
    if (currentStep === "Result") return minimalForResult.what;
    return info ? info.what : "";
  };

  const renderHow = () => {
    if (currentStep === "Input") return minimalForInput.how;
    if (currentStep === "Result") return minimalForResult.how;
    if (!info) return "";
    // for Key Expansion append dynamic text
    if (currentStep === "Key Expansion") return buildHow(currentStep);
    return info.how || "";
  };

  return (
    <>
      <button
        className="floating-info-button"
        aria-label="Open info"
        onClick={() => setOpen((s) => !s)}
      >
        <img src={infoImg} alt="info" className="floating-info-img" />
      </button>

      {open && (
        <div className="floating-info-panel" role="dialog" aria-modal="false" ref={panelRef}>
          <button className="floating-info-close" onClick={() => setOpen(false)}>✕</button>
          <div className="floating-info-body">
            <div className="floating-info-section">
              <div className="floating-info-section-title">What is it</div>
              <div className="floating-info-section-content" style={{ whiteSpace: "pre-line" }}>
                {renderWhat()}
              </div>
            </div>

            <div className="floating-info-section">
              <div className="floating-info-section-title">How to interact</div>
              <div className="floating-info-section-content" style={{ whiteSpace: "pre-line" }}>
                {renderHow()}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
