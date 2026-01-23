import React from "react";
import { Box, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { MoveLeft, Equal, CirclePlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getMixColumnsTableData, getMixColumnsResultTable, getInvMixColumnsTableData, getInvMixColumnsResultTable } from "./MixColumnsExplanationsHelper";

// color palette used across the site (avoid repeating hex literals)
const PALETTE = {
  "01": "#6b7280", // neutral gray
  "02": "#2563eb", // blue (shift)
  "03": "#7c3aed", // purple (shift + xor)
};

// color mapping for operators - reuse palette and add one new color for inverse
const OP_COLORS = {
  ...PALETTE,
  // inverse coefficients: reuse the three palette colors and add one extra
  "0e": PALETTE["02"],
  "0b": PALETTE["03"],
  "0d": PALETTE["01"],
  "09": "#059669", // the single additional color
};

function renderLabel(label, t) {
  if (label === "Value") {
    const valueText = t("pages.stepByStep.mixColumns.value", "Value");
    return valueText;
  }
  if (label.startsWith("Shifted")) {
    const shiftedText = t("pages.stepByStep.mixColumns.shifted", "Shifted");
    return (
      <span>
        <MoveLeft size={18} style={{ verticalAlign: "middle", marginRight: 4 }} /> {shiftedText}
      </span>
    );
  }
  if (label.startsWith("equals")) {
    const rest = label.replace("equals", "").trim();
    return (
      <span>
        <Equal size={18} style={{ verticalAlign: "middle", marginRight: 4 }} /> {rest}
      </span>
    );
  }
  if (label === "XOR equals") {
    return (
      <span>
        <CirclePlus size={18} style={{ verticalAlign: "middle", marginRight: 2 }} />
        <Equal size={18} style={{ verticalAlign: "middle", marginRight: 4 }} />
        equals
      </span>
    );
  }
  if (label === "XOR" || label.startsWith("XOR")) {
    const rest = label.replace("XOR", "").trim();
    return (
      <span>
        <CirclePlus size={18} style={{ verticalAlign: "middle", marginRight: 4 }} /> {rest}
      </span>
    );
  }
  return label;
}

export default function MixColumnsExplanations({
  selectedCellValue,
  highlightedFixedMatrixRow,
  highlightedPrevStateColumn,
  invMode = false,
}) {
  const { t } = useTranslation();
  const mappedValues = highlightedFixedMatrixRow.map((fixedVal, idx) => ({
    fixed: fixedVal,
    prev: highlightedPrevStateColumn[idx],
  }));

  const tables = invMode ? getInvMixColumnsTableData(mappedValues) : getMixColumnsTableData(mappedValues);
  const resultTable = invMode ? getInvMixColumnsResultTable(mappedValues, selectedCellValue) : getMixColumnsResultTable(mappedValues, selectedCellValue);

  const isBinary = (val) => typeof val === "string" && /^[01]{4} [01]{4}$/.test(val);

  // Determine where the final calculation block starts for each table so we can
  // pad shorter ones so the final XOR/equals rows begin at the same height.
  const finalStartIndexFor = (table) => {
    const rows = table.rows || [];
    const blankIdx = rows.findIndex((r) => r[0] === "");
    if (blankIdx !== -1) return blankIdx + 1;
    const xorIdx = rows.findIndex((r) => typeof r[0] === "string" && r[0].startsWith("XOR"));
    if (xorIdx !== -1) return xorIdx;
    return rows.length;
  };

  const finalStarts = tables.map(finalStartIndexFor);
  const maxFinalStart = finalStarts.length ? Math.max(...finalStarts) : 0;

  return (
    <Box
      className="mixcolumns-explanation-container"
      mt={2}
      sx={{
        display: "flex",
        gap: "32px",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        ml: "50px",
      }}
    >
      {/* Heading */}
      <Box sx={{ width: "100%", display: "flex", justifyContent: "center", mb: 2 }}>
        <span style={{ fontWeight: "bold", fontSize: 18 }}>
          {mappedValues.map((pair, idx) => (
            <span key={idx}>
              {pair.fixed} * {pair.prev}
              {idx < mappedValues.length - 1 ? " + " : ""}
            </span>
          ))}
          {selectedCellValue && (
            <>
              {" = "}
              {selectedCellValue}
            </>
          )}
        </span>
      </Box>
      {tables.map((table) => {
        const fixed = table.fixed || (table.name || "").split("*")[0].trim();
        const color = OP_COLORS[fixed] || "#374151";
        return (
          <Box
            key={table.key}
            className={`mixcolumns-table-${table.key}`}
            sx={{
              minWidth: 180,
              flex: "0 0 180px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              borderLeft: `4px solid ${color}`,
              pl: 1.25,
              borderRadius: 1,
            }}
          >
            <Table
              size="small"
              sx={{
                minWidth: 60,
                width: "auto",
                flex: "0 0 auto",
                tableLayout: "fixed",
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell align="center" colSpan={2} sx={{ fontWeight: "bold", fontSize: 14, color }}>
                    {table.name}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(() => {
                  const rows = table.rows || [];
                  const finalStart = finalStartIndexFor(table);
                  const padCount = Math.max(0, maxFinalStart - finalStart);
                  const rendered = [];

                  for (let i = 0; i < finalStart; i++) {
                    const row = rows[i];
                    const meta = (row && row[2]) || {};
                    rendered.push(
                      <TableRow key={`r-${i}`} sx={meta.highlight ? { backgroundColor: "rgba(0,0,0,0.03)" } : {}}>
                        <TableCell
                          align="center"
                          sx={{
                            fontSize: 14,
                            minWidth: "80px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            fontWeight: meta.highlight ? 600 : 400,
                          }}
                        >
                          {renderLabel(row[0], t)}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            fontSize: isBinary(row[1]) ? 12 : 14,
                            fontFamily: isBinary(row[1])
                              ? "ui-monospace, SFMono-Regular, Menlo, monospace"
                              : "inherit",
                            minWidth: "80px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            fontWeight: meta.highlight ? 700 : 400,
                          }}
                        >
                          {row[1]}
                        </TableCell>
                      </TableRow>
                    );
                  }

                  for (let p = 0; p < padCount; p++) {
                    rendered.push(
                      <TableRow key={`pad-${p}`} sx={{ height: 36 }}>
                        <TableCell sx={{ fontSize: 14 }} align="center">{"\u00A0"}</TableCell>
                        <TableCell sx={{ fontSize: 14 }} align="center">{"\u00A0"}</TableCell>
                      </TableRow>
                    );
                  }

                  for (let i = finalStart; i < rows.length; i++) {
                    const row = rows[i];
                    const meta = (row && row[2]) || {};
                    rendered.push(
                      <TableRow key={`r-${i}`} sx={meta.highlight ? { backgroundColor: "rgba(0,0,0,0.03)" } : {}}>
                        <TableCell
                          align="center"
                          sx={{
                            fontSize: 14,
                            minWidth: "80px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            fontWeight: meta.highlight ? 600 : 400,
                          }}
                        >
                          {renderLabel(row[0], t)}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            fontSize: isBinary(row[1]) ? 12 : 14,
                            fontFamily: isBinary(row[1])
                              ? "ui-monospace, SFMono-Regular, Menlo, monospace"
                              : "inherit",
                            minWidth: "80px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            fontWeight: meta.highlight ? 700 : 400,
                          }}
                        >
                          {row[1]}
                        </TableCell>
                      </TableRow>
                    );
                  }

                  return rendered;
                })()}
              </TableBody>
            </Table>
          </Box>
        );
      })}

      {/* Result Table */}
      {selectedCellValue && (
        <Box
          className="mixcolumns-table-result"
          sx={{
            minWidth: 180,
            flex: "0 0 180px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Table
            size="small"
            sx={{
              minWidth: 60,
              width: "auto",
              flex: "0 0 auto",
              tableLayout: "fixed",
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell align="center" colSpan={2} sx={{ fontWeight: "bold", fontSize: 14 }}>
                  {t("pages.stepByStep.mixColumns.result", "Result")}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="center" sx={{ fontSize: 14 }}>{t("pages.stepByStep.mixColumns.key", "Key")}</TableCell>
                <TableCell align="center" sx={{ fontSize: 14 }}>{t("pages.stepByStep.mixColumns.value", "Value")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {resultTable.map((row, idx) => {
                const maybeFixed = (row[0] || "").split("*")[0]?.trim();
                const rowColor = OP_COLORS[maybeFixed];
                return (
                  <TableRow
                    key={idx}
                    sx={{
                      ...(rowColor ? { "& td:first-of-type": { color: rowColor, fontWeight: 600 } } : {}),
                    }}
                  >
                    <TableCell
                      align="center"
                      sx={{
                        fontSize: 14,
                        minWidth: "80px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {renderLabel(row[0], t)}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontSize: isBinary(row[1]) ? 12 : 14,
                        fontFamily: isBinary(row[1])
                          ? "ui-monospace, SFMono-Regular, Menlo, monospace"
                          : "inherit",
                        minWidth: "80px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {row[1]}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
  );
}