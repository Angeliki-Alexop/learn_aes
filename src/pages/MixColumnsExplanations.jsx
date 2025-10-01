import React from "react";
import { Box, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { MoveLeft, Equal, CirclePlus } from "lucide-react";
import { getMixColumnsTableData, getMixColumnsResultTable } from "./MixColumnsExplanationsHelper";

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
      {tables.map(table => (
        <Box
          key={table.key}
          className={`mixcolumns-table-${table.key}`}
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
                      fontSize: 14,
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
      ))}

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
              {resultTable.map((row, idx) => (
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
                      fontSize: 14,
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
      )}
    </Box>
  );
}