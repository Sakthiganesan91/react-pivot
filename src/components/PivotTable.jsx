import React from "react";

const PivotTable = ({ data }) => {
  const { rows = [], columns = [], values = [] } = data || {};

  const flattenRows = (rows, parentKey = "", titles = []) => {
    if (!Array.isArray(rows)) return [];
    return rows.flatMap((row) => {
      const fullKey = parentKey ? `${parentKey}|${row.key}` : row.key;
      const fullTitles = [...titles, row.title || row.key];
      if (row.children) {
        return flattenRows(row.children, fullKey, fullTitles);
      }
      return [{ rowKey: fullKey, rowTitles: fullTitles }];
    });
  };

  const flattenColumns = (cols, parentKey = "", titles = []) => {
    if (!Array.isArray(cols)) return [];
    return cols.flatMap((col) => {
      const fullKey = parentKey ? `${parentKey}|${col.key}` : col.key;
      const fullTitles = [...titles, col.title || col.key];
      if (col.children) {
        return flattenColumns(col.children, fullKey, fullTitles);
      }
      return [{ key: fullKey, titles: fullTitles }];
    });
  };

  const rowData = flattenRows(rows);
  const columnHeaders = flattenColumns(columns);
  const measureKeys =
    typeof values !== "function" &&
    Array.from(
      new Set((values || []).flatMap((v) => Object.keys(v.measures || {})))
    );

  const getCell = (rKey, cKey = "") => {
    if (columnHeaders.length === 0) {
      return values.find((v) => v.rowKey === rKey)?.measures || {};
    }
    return (
      values.find((v) => v.rowKey === rKey && v.colKey === cKey)?.measures || {}
    );
  };

  const buildColumnHeaderRows = () => {
    const maxDepth = Math.max(...columnHeaders.map((ch) => ch.titles.length));
    const rows = Array.from({ length: maxDepth }, () => []);
    columnHeaders.forEach((col) => {
      for (let i = 0; i < maxDepth; i++) {
        //if (rows[i].includes(col.titles[i])) continue;
        rows[i].push(col.titles[i] || "");
      }
    });

    return rows;
  };

  const columnHeaderRows = buildColumnHeaderRows();

  console.log(rowData);
  console.log(measureKeys);
  console.log(columnHeaderRows);

  return (
    <table border="1" style={{ borderCollapse: "collapse", width: "100%" }}>
      <thead>
        <tr>
          {columnHeaderRows.length === 0 &&
            rowData[0]?.rowTitles.map((_, i) => (
              <th key={`row-header-placeholder-${i}`}>Row Label {i + 1}</th>
            ))}
          {columnHeaderRows.length === 0 &&
            columnHeaders.length === 0 &&
            measureKeys.map((measure) => <th key={measure}>{measure}</th>)}
        </tr>
        {columnHeaderRows.map((row, i) => (
          <tr key={`col-header-${i}`}>
            {i === 0 &&
              rowData[0]?.rowTitles.map((_, j) => (
                <th
                  key={`row-header-placeholder-${j}`}
                  rowSpan={rowData.length}
                >
                  Row Label {j + 1}
                </th>
              ))}
            {row.map((col, j) => (
              <th key={`col-${i}-${j}`} colSpan={measureKeys.length}>
                {col}
              </th>
            ))}
          </tr>
        ))}
        {measureKeys.length > 0 && (
          <tr>
            {columnHeaders.length > 0 &&
              columnHeaders.map((col) =>
                measureKeys.map((measure) => (
                  <th key={`${col.key}-${measure}`}>{measure}</th>
                ))
              )}
          </tr>
        )}
      </thead>

      <tbody>
        {rowData.map(({ rowKey, rowTitles }, i) => {
          const cells = [];

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
                .filter(
                  (r) =>
                    r.rowTitles.slice(0, level + 1).join("|") ===
                    rowTitles.slice(0, level + 1).join("|")
                ).length;

              cells.push(
                <td key={`row-${i}-${level}`} rowSpan={rowSpan}>
                  {title}
                </td>
              );
            }
          });

          const valueCells =
            columnHeaders.length > 0
              ? columnHeaders.map((col) =>
                  measureKeys.map((measure) => (
                    <td key={`${rowKey}-${col.key}-${measure}`}>
                      {getCell(rowKey, col.key)[measure] || ""}
                    </td>
                  ))
                )
              : measureKeys.map((measure) => {
                  const cell = getCell(rowKey, "");
                  const val = cell[measure];
                  return (
                    <td key={`cell-${i}-${measure}`}>
                      {typeof val === "number"
                        ? val.toFixed(2)
                        : typeof val === "string" && val.trim() !== ""
                        ? val
                        : ""}
                    </td>
                  );
                });

          return <tr key={`row-${i}`}>{[...cells, ...valueCells]}</tr>;
        })}
      </tbody>
      <tfoot>
        {measureKeys.length > 0 && (
          <tr>
            {rowData[0]?.rowTitles.map((_, i) => (
              <td key={`footer-label-${i}`}>Total</td>
            ))}

            {columnHeaders.length > 0
              ? columnHeaders.flatMap((col) =>
                  measureKeys.map((measure) => {
                    const matchingValues = values.filter(
                      (v) => v.colKey === col.key
                    );
                    let sum = 0;
                    let count = 0;
                    matchingValues.forEach((v) => {
                      const val = v.measures?.[measure];
                      if (typeof val === "number") sum += val;
                      else if (typeof val === "string" && val.trim() !== "")
                        count++;
                    });

                    return (
                      <td key={`footer-${col.key}-${measure}`}>
                        {sum > 0
                          ? sum.toFixed(2)
                          : count > 0
                          ? `${count}x`
                          : ""}
                      </td>
                    );
                  })
                )
              : measureKeys.map((measure) => {
                  let sum = 0;
                  let count = 0;
                  values.forEach((v) => {
                    const val = v.measures?.[measure];
                    if (typeof val === "number") sum += val;
                    else if (typeof val === "string" && val.trim() !== "")
                      count++;
                  });

                  return (
                    <td key={`footer-${measure}`}>
                      {sum > 0 ? sum.toFixed(2) : count > 0 ? `${count}x` : ""}
                    </td>
                  );
                })}
          </tr>
        )}
      </tfoot>
    </table>
  );
};

export default PivotTable;
