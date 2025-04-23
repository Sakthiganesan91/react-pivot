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

  const rowData = flattenRows(rows);
  console.log(rowData);

  const flattenColumns = (cols, parentKey = "") => {
    if (!Array.isArray(cols)) return [];
    return cols.flatMap((col) => {
      const fullKey = parentKey ? `${parentKey}|${col.key}` : col.key;
      if (col.children) {
        return flattenColumns(col.children, fullKey);
      }
      return [{ key: fullKey, title: col.title || col.key }];
    });
  };

  const measureKeys = Array.from(
    new Set(
      (Array.isArray(values) ? values : []).flatMap((v) =>
        Object.keys(v.measures || {})
      )
    )
  );

  const getCell = (rKey, cKey = "") => {
    if (columnHeaders.length === 0) {
      return values.find((v) => v.rowKey === rKey)?.measures || {};
    }
    return (
      values.find((v) => v.rowKey === rKey && v.colKey === cKey)?.measures || {}
    );
  };

  const columnHeaders = flattenColumns(columns);

  return (
    <div>
      <table border="1">
        <thead>
          <tr>
            {rowData[0]?.rowTitles.map((_, i) => (
              <th key={`row-label-${i}`}>Row Label</th>
            ))}

            {columnHeaders.length > 0 &&
              (measureKeys.length > 0
                ? columnHeaders.flatMap((col) =>
                    measureKeys.map((measure) => (
                      <th key={`col-${col.key}-${measure}`}>
                        {col.title} - {measure}
                      </th>
                    ))
                  )
                : columnHeaders.map((col) => (
                    <th key={`col-${col.key}`}>{col.title}</th>
                  )))}

            {columnHeaders.length === 0 &&
              measureKeys.length > 0 &&
              measureKeys.map((measure) => (
                <th key={`measure-${measure}`}>{measure}</th>
              ))}
          </tr>
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
                ? columnHeaders.flatMap((col) =>
                    measureKeys.map((measure) => {
                      const cell = getCell(rowKey, col.key);
                      const val = cell[measure];
                      return (
                        <td key={`cell-${i}-${col.key}-${measure}`}>
                          {typeof val === "number"
                            ? val.toFixed(2)
                            : typeof val === "string" && val.trim() !== ""
                            ? val
                            : ""}
                        </td>
                      );
                    })
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
                        {sum > 0
                          ? sum.toFixed(2)
                          : count > 0
                          ? `${count}x`
                          : ""}
                      </td>
                    );
                  })}
            </tr>
          )}
        </tfoot>
      </table>
    </div>
  );
};

export default PivotTable;
