import React from "react";
import "./StepInfo.css";
import { useTranslation } from "react-i18next";

function Section({ title, content }) {
  return (
    <div className="stepinfo-section">
      <h4 className="stepinfo-section-title">{title}</h4>
      <div
        className="stepinfo-section-content"
        style={{ whiteSpace: "pre-line", lineHeight: 1.4 }}
      >
        {content}
      </div>
    </div>
  );
}

const STEP_KEY_MAP = {
  KeyExpansion: "keyExpansion",
  SubBytes: "subBytes",
  ShiftRows: "shiftRows",
  InvSubBytes: "invSubBytes",
  InvShiftRows: "invShiftRows",
  InvMixColumns: "invMixColumns",
  MixColumns: "mixColumns",
  AddRoundKey: "addRoundKey",
};

export default function StepInfo({ currentStep, currentRound, keySize }) {
  const { t } = useTranslation();

  if (!currentStep || !STEP_KEY_MAP[currentStep]) return null;

  const key = STEP_KEY_MAP[currentStep];
  const title = t(
    `pages.stepByStep.helper.${key}.title`,
    t(`pages.stepByStep.stepInfo.${key}.title`, `What is ${currentStep}?`),
  );

  const what = t(
    `pages.stepByStep.helper.${key}.what`,
    t(`pages.stepByStep.stepInfo.${key}.what`, ""),
  );
  let how = t(
    `pages.stepByStep.helper.${key}.how`,
    t(`pages.stepByStep.stepInfo.${key}.how`, ""),
  );

  if (currentStep === "KeyExpansion") {
    const wordsPerKey = keySize === 128 ? 4 : keySize === 192 ? 6 : 8;
    const extraKey = wordsPerKey === 8 ? "threeCases" : "twoCases";
    const extra = t(
      `pages.stepByStep.stepInfo.keyExpansion.cases.${extraKey}`,
      { wordsPerKey, mod: wordsPerKey, offset: wordsPerKey, mid: 4 },
    );
    const header = t("pages.stepByStep.stepInfo.keyExpansion.howHeader", {
      keySize,
      wordsPerKey,
    });
    how = `${how}\n\n${header}\n\n${extra}`;
  }

  return (
    <div className="stepinfo-root">
      <h3 className="stepinfo-title">{title}</h3>
      {typeof currentRound === "number" && currentRound >= 0 && (
        <p className="stepinfo-round">
          {t(
            "pages.stepByStep.helper.roundLabel",
            t("pages.stepByStep.stepInfo.roundLabel", { n: currentRound }),
          )}
        </p>
      )}
      <div className="stepinfo-content two-cols">
        <div className="stepinfo-left-col">
          <Section
            title={t(
              "pages.stepByStep.helper.whatTitle",
              t("pages.stepByStep.stepInfo.whatTitle", "What"),
            )}
            content={what}
          />
        </div>
        <div className="stepinfo-right-col">
          <Section
            title={t(
              "pages.stepByStep.helper.howTitle",
              t("pages.stepByStep.stepInfo.howTitle", "How to interact"),
            )}
            content={how}
          />
        </div>
      </div>
    </div>
  );
}
