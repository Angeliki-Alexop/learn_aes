import React, { useState, useEffect, useRef } from "react";
import "./FloatingInfo.css";
import { useTranslation } from "react-i18next";
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

  const { t } = useTranslation();

  const buildHow = (stepKey) => {
    let how = t(`pages.stepByStep.stepInfo.${stepKey && stepKey.toLowerCase().replace(/\s+/g,'')}.how`, "");
    if (!how) {
      // fallback to short generic how if not provided
      how = t(`pages.stepByStep.stepInfo.${stepKey}.how`, "") || "";
    }

    if (stepKey === "Key Expansion") {
      const wordsPerKey = keySize === 128 ? 4 : keySize === 192 ? 6 : 8;
      const header = t("pages.stepByStep.stepInfo.keyExpansion.howHeader", {
        keySize,
        wordsPerKey,
      });
      const extraKey = wordsPerKey === 8 ? "threeCases" : "twoCases";
      const extra = t(`pages.stepByStep.stepInfo.keyExpansion.cases.${extraKey}`, {
        wordsPerKey,
        mod: wordsPerKey,
        offset: wordsPerKey,
        mid: 4,
      });
      how = [how, header, extra].filter(Boolean).join("\n\n");
    }
    return how;
  };

  // Determine the info to show based on currentStep
  const showInfoFor = (step) => {
    if (!step) return null;
    if (step === "Input" || step === "Result") return null;
    // look up titles/what/how from translation keys
    const keyMap = {
      "Key Expansion": "keyExpansion",
      SubBytes: "subBytes",
      ShiftRows: "shiftRows",
      InvSubBytes: "invSubBytes",
      InvShiftRows: "invShiftRows",
      InvMixColumns: "invMixColumns",
      MixColumns: "mixColumns",
      AddRoundKey: "addRoundKey",
    };
    const k = keyMap[step];
    if (!k) return null;
    return {
      title: t(`pages.stepByStep.stepInfo.${k}.title`, step),
      what: t(`pages.stepByStep.stepInfo.${k}.what`, ""),
      how: t(`pages.stepByStep.stepInfo.${k}.how`, ""),
    };
  };

  const info = showInfoFor(currentStep);

  // phrasing for input/result (before and after submit)
  const minimalForInputBefore = {
    what: "This section serves as the algorithm’s input area. Select the operation mode (Encryption or Decryption), specify the key size, enter the secret key, and provide the text to be encrypted or decrypted.",
    how: "Step 1: Choose mode (Encryption or Decryption). This determines whether the simulation runs the forward AES steps (Encryption) or the inverse steps (Decryption). For Decryption you must use the same key size and key that were used to produce the ciphertext.\n\nStep 2: Select Key Size (128, 192, or 256 bits). The key size sets the expected key length and the number of AES rounds.\n\nStep 3: Enter the text to process. For Encryption provide plaintext and for Decryption provide ciphertext.\n\n Step 4: Enter the secret key matching the selected key size. The key must have the correct length for the chosen size (e.g., 128-bit = 32 hex characters). For Decryption this must be the original key used during encryption.\n\n Step 5: Click Submit to start the step‑by‑step simulation. ",
  };

  const minimalForInputAfter = {
    what: "This page summarizes all the parameters selected for the AES operation and shows how your input is prepared before the algorithm steps begin.",
    how: "This tool lets you explore the AES algorithm step by step, giving you full control over each round and operation. Use the navigation options below to move through the algorithm at your own pace and focus on the parts you want to understand.\n\n • Use the sidebar to select any AES round and jump directly to a specific step.\n\n • Use the Previous / Next Step buttons to move through the algorithm steps within the current round.\n\n • Use the Previous / Next Round buttons to navigate between AES rounds.\n\n • The Input button returns you to the input and configuration summary page.\n\n • The Final Round button takes you directly to the last round of the AES algorithm.\n\nEnjoy exploring AES!",
  };
  const minimalForResult = {
    what: "The step-by-step AES process has now been completed!\n This page presents a complete overview of the AES outcome, showing how plaintext, ciphertext and key are processed and transformed into the final result.",
    how: "You have reached the end of the step-by-step AES process!\n\n If you’d like to try again with different values, you can restart the process at any time by clicking the STEP-BY-STEP button in the navigation bar, or revisit any round and step to review how the algorithm works in detail.\n\n When you feel confident with the AES process, head over to the Training page to challenge yourself and practice the AES steps on your own.\n Good luck!",
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
