import React from "react";
import { Box, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { MoveLeft, Equal, CirclePlus } from "lucide-react";
import { getMixColumnsTableData, getMixColumnsResultTable } from "./MixColumnsExplanationsHelper";

// color mapping for operators
const OP_COLORS = {
  "01": "#6b7280", // neutral gray
  "02": "#2563eb", // blue (shift)
  "03": "#7c3aed", // purple (shift + xor)
};

function renderLabel(label) {
  if (label.startsWith("Shifted")) {
    return (
      <span>
        <MoveLeft size={18} style={{ verticalAlign: "middle", marginRight: 4 }} /> Shifted
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
}) {
  const mappedValues = highlightedFixedMatrixRow.map((fixedVal, idx) => ({
    fixed: fixedVal,
    prev: highlightedPrevStateColumn[idx],
  }));

  const tables = getMixColumnsTableData(mappedValues);
  const resultTable = getMixColumnsResultTable(mappedValues, selectedCellValue);

  const isBinary = (val) => typeof val === "string" && /^[01]{4} [01]{4}$/.test(val);

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
      {tables.map(table => {
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
              {table.rows.map((row, idx) => (
                <TableRow key={idx}>
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
                    {renderLabel(row[0])}
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
              ))}
            </TableBody>
          </Table>
        </Box>
        )
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
                  Result
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="center" sx={{ fontSize: 14 }}>Key</TableCell>
                <TableCell align="center" sx={{ fontSize: 14 }}>Value</TableCell>
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
                    {renderLabel(row[0])}
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
                )
              })}
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
  );
}