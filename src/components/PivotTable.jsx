import { useMemo, useCallback } from "react";
import { flattenColumns, flattenRows } from "./calculation";

const PivotTable = ({ data, method }) => {
  const { rows = [], columns = [], values = [] } = data || {};
  const rowTotals = data.rowTotals;
  const grandTotal = data.grandTotal;

  const rowData = useMemo(() => flattenRows(rows), [rows]);
  const columnHeaders = useMemo(() => flattenColumns(columns), [columns]);

  const getRowTotalCell = (rowKey, rowTotals) => {
    const cell = rowTotals?.find((c) => c.rowKey === rowKey);
    return cell ? cell.measures : {};
  };
  const measureKeys = useMemo(() => {
    if (typeof values === "function") return [];
    return Array.from(
      new Set((values || []).flatMap((v) => Object.keys(v.measures || {})))
    );
  }, [values]);

  const cellDataMap = useMemo(() => {
    const map = new Map();
    if (typeof values === "function") return [];
    values.forEach((v) => {
      const key =
        columnHeaders.length === 0 ? v.rowKey : `${v.rowKey}|${v.colKey}`;
      map.set(key, v.measures || {});
    });
    return map;
  }, [values, columnHeaders.length]);

  const getCell = useCallback(
    (rKey, cKey = "") => {
      const key = columnHeaders.length === 0 ? rKey : `${rKey}|${cKey}`;
      return cellDataMap.get(key) || {};
    },
    [cellDataMap, columnHeaders.length]
  );

  const columnHeaderRows = useMemo(() => {
    if (columnHeaders.length === 0) return [];

    const maxDepth = Math.max(...columnHeaders.map((ch) => ch.titles.length));
    const rows = Array.from({ length: maxDepth }, () => []);

    columnHeaders.forEach((col) => {
      for (let i = 0; i < maxDepth; i++) {
        rows[i].push(col.titles[i] || "");
      }
    });

    return rows;
  }, [columnHeaders]);

  const formatCellValue = useCallback((val) => {
    if (typeof val === "object" && val !== null) {
      return val.count > 0 ? (val.sum / val.count).toFixed(2) : "";
    }
    if (typeof val === "number") {
      return val.toFixed(2);
    }
    if (typeof val === "string" && val.trim() !== "") {
      return val;
    }
    return "";
  }, []);

  const footerAggregations = useMemo(() => {
    const aggregations = new Map();

    if (columnHeaders.length > 0) {
      columnHeaders.forEach((col) => {
        measureKeys.forEach((measure) => {
          const matchingValues = values.filter((v) => v.colKey === col.key);
          let sum = 0;
          let count = 0;

          matchingValues.forEach((v) => {
            const val = v.measures?.[measure];
            if (typeof val === "number") {
              sum += val;
              count++;
            } else if (typeof val === "object" && val !== null) {
              sum += val.sum || 0;
              count += val.count || 0;
            } else if (typeof val === "string" && val.trim() !== "") {
              count++;
            }
          });

          aggregations.set(`${col.key}-${measure}`, { sum, count });
        });
      });
    } else {
      measureKeys.forEach((measure) => {
        let sum = 0;
        let count = 0;

        values.forEach((v) => {
          const val = v.measures?.[measure];
          if (typeof val === "number") {
            sum += val;
            count++;
          } else if (typeof val === "object" && val !== null) {
            sum += val.sum || 0;
            count += val.count || 0;
          } else if (typeof val === "string" && val.trim() !== "") {
            count++;
          }
        });

        aggregations.set(measure, { sum, count });
      });
    }

    return aggregations;
  }, [values, columnHeaders, measureKeys]);

  const formatFooterValue = useCallback(
    (sum, count) => {
      if (method === "average") {
        return count > 0 ? (sum / count).toFixed(2) : "";
      }
      return sum > 0 ? sum.toFixed(2) : count > 0 ? `${count}x` : "";
    },
    [method]
  );

  if (!data || (!rows.length && !columns.length && !values.length)) {
    return <div>No data available</div>;
  }

  const aggValues = {};

  rowTotals.forEach((row) => {
    Object.entries(row.measures).forEach(([measure, value]) => {
      const val =
        typeof value === "number" ? value : parseFloat(value.sum ?? value);

      if (!aggValues[measure]) {
        aggValues[measure] = {
          sum: 0,
          count: 0,
          max: -Infinity,
          min: Infinity,
        };
      }

      aggValues[measure].sum += value.sum ?? val;
      aggValues[measure].count += value.count ?? 1;
      aggValues[measure].max = Math.max(aggValues[measure].max, val);
      aggValues[measure].min = Math.min(aggValues[measure].min, val);
    });
  });

  return (
    <table border="1" className="table">
      <thead className="table-danger">
        {columnHeaderRows.length === 0 && (
          <tr>
            {rowData[0]?.rowTitles.map((_, i) => (
              <th key={`row-header-${i}`}>Row {i + 1}</th>
            ))}
            {columnHeaders.length === 0 &&
              measureKeys.map((measure) => <th key={measure}>{measure}</th>)}
          </tr>
        )}
        {columnHeaderRows.map((row, i) => (
          <tr key={`col-header-${i}`}>
            {i === 0 &&
              rowData[0]?.rowTitles.map((_, j) => (
                <th
                  key={`row-header-${j}`}
                  rowSpan={
                    columnHeaderRows.length + (measureKeys.length > 0 ? 1 : 0)
                  }
                >
                  Row {j + 1}
                </th>
              ))}
            {row.map((col, j) => {
              const shouldRenderColumn =
                j === 0 ||
                row[j - 1] !== col ||
                !columnHeaders[j - 1]?.key
                  .split("|")
                  .slice(0, i + 1)
                  .every(
                    (val, idx) => val === columnHeaders[j]?.key.split("|")[idx]
                  );

              if (!shouldRenderColumn) return null;

              const colSpan = row.slice(j).findIndex(
                (c, idx) =>
                  idx > 0 &&
                  (c !== col ||
                    !columnHeaders[j + idx]?.key
                      .split("|")
                      .slice(0, i + 1)
                      .every(
                        (val, vidx) =>
                          val === columnHeaders[j]?.key.split("|")[vidx]
                      ))
              );

              const actualColSpan = colSpan === -1 ? row.length - j : colSpan;
              const finalColSpan = actualColSpan * (measureKeys.length || 1);

              return (
                <th key={`col-${i}-${j}`} colSpan={finalColSpan}>
                  {col}
                </th>
              );
            })}
            {i === 0 &&
              measureKeys.map((measure) => (
                <th
                  key={`row-total-${measure}`}
                  className="row-total-header"
                  rowSpan={columnHeaderRows.length + 1}
                >
                  Total {measure}
                </th>
              ))}
          </tr>
        ))}

        {measureKeys.length > 0 && columnHeaders.length > 0 && (
          <tr>
            {columnHeaders.flatMap((col) =>
              measureKeys.map((measure) => (
                <th key={`${col.key}-${measure}`}>{measure}</th>
              ))
            )}
          </tr>
        )}
      </thead>

      <tbody>
        {rowData.map(({ rowKey, rowTitles }, i) => {
          const rowCells = [];

          rowTitles.forEach((title, level) => {
            const shouldRender =
              i === 0 ||
              rowData[i - 1].rowTitles[level] !== title ||
              !rowData[i - 1].rowTitles
                .slice(0, level)
                .every((val, idx) => val === rowTitles[idx]);

            if (shouldRender) {
              const rowSpan = rowData
                .slice(i)
                .findIndex(
                  (r, idx) =>
                    idx > 0 &&
                    r.rowTitles.slice(0, level + 1).join("|") !==
                      rowTitles.slice(0, level + 1).join("|")
                );

              const actualRowSpan =
                rowSpan === -1 ? rowData.length - i : rowSpan;

              rowCells.push(
                <td key={`row-${i}-${level}`} rowSpan={actualRowSpan}>
                  {title}
                </td>
              );
            }
          });

          const valueCells =
            columnHeaders.length > 0
              ? columnHeaders.flatMap((col) =>
                  measureKeys.map((measure) => {
                    const cellData = getCell(rowKey, col.key);
                    return (
                      <td key={`${rowKey}-${col.key}-${measure}`}>
                        {formatCellValue(cellData[measure])}
                      </td>
                    );
                  })
                )
              : measureKeys.map((measure) => {
                  const cellData = getCell(rowKey, "");
                  return (
                    <td key={`cell-${i}-${measure}`}>
                      {formatCellValue(cellData[measure])}
                    </td>
                  );
                });

          const rowTotalCells = measureKeys.map((measure) => {
            const rowTotalData = getRowTotalCell(rowKey, rowTotals);
            return (
              <td key={`${rowKey}-total-${measure}`} className="row-total-cell">
                {formatCellValue(rowTotalData[measure])}
              </td>
            );
          });

          return columnHeaderRows.length > 0 ? (
            <tr key={`row-${i}`}>
              {[...rowCells, ...valueCells, ...rowTotalCells]}
            </tr>
          ) : (
            <tr key={`row-${i}`}>{[...rowCells, ...valueCells]}</tr>
          );
        })}
      </tbody>

      {measureKeys.length > 0 && (
        <tfoot>
          <tr>
            {rowData.length > 0 && (
              <td colSpan={rowData[0]?.rowTitles.length || 1}>Total</td>
            )}

            {columnHeaders.length > 0
              ? columnHeaders.flatMap((col) =>
                  measureKeys.map((measure) => {
                    const agg = footerAggregations.get(
                      `${col.key}-${measure}`
                    ) || { sum: 0, count: 0 };
                    return (
                      <td key={`footer-${col.key}-${measure}`}>
                        {formatFooterValue(agg.sum, agg.count)}
                      </td>
                    );
                  })
                )
              : measureKeys.map((measure) => {
                  const agg = footerAggregations.get(measure) || {
                    sum: 0,
                    count: 0,
                  };
                  return (
                    <td key={`footer-${measure}`}>
                      {formatFooterValue(agg.sum, agg.count)}
                    </td>
                  );
                })}
            {columnHeaderRows.length > 0 &&
              measureKeys.map((measure) => {
                return (
                  <td key={`grand-total-${measure}`}>
                    {method === "average"
                      ? (
                          aggValues[measure].sum / aggValues[measure].count
                        ).toFixed(2)
                      : method === "max"
                      ? aggValues[measure].max
                      : method === "min"
                      ? aggValues[measure].min
                      : formatCellValue(grandTotal[measure])}
                  </td>
                );
              })}
          </tr>
        </tfoot>
      )}
    </table>
  );
};

export default PivotTable;
