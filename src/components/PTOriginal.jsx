// import React from "react";

// const PivotTable = ({ data }) => {
//   const { rows = [], columns = [], values = [], grandTotal = {} } = data || {};

//   const flattenRows = (rows, parentKey = "", titles = []) => {
//     if (!Array.isArray(rows)) return [];
//     return rows.flatMap((row) => {
//       const fullKey = parentKey ? `${parentKey}|${row.key}` : row.key;
//       const fullTitles = [...titles, row.title || row.key];
//       if (row.children) {
//         return flattenRows(row.children, fullKey, fullTitles);
//       }

//       return [{ rowKey: fullKey, rowTitles: fullTitles }];
//     });
//   };

//   const rowData = flattenRows(rows);

//   const flattenColumns = (cols, parentKey = "") => {
//     if (!Array.isArray(cols)) return [];
//     return cols.flatMap((col) => {
//       const fullKey = parentKey ? `${parentKey}|${col.key}` : col.key;
//       if (col.children) {
//         return flattenColumns(col.children, fullKey);
//       }
//       return [{ key: fullKey, title: col.title || col.key }];
//     });
//   };

//   const columnHeaders = flattenColumns(columns);

//   const measureKeys =
//     typeof values !== "function"
//       ? Array.from(
//           new Set(values.flatMap((v) => Object.keys(v.measures || {})))
//         )
//       : [];

//   const getCell = (rKey, cKey = "") => {
//     if (columnHeaders.length === 0) {
//       return values.find((v) => v.rowKey === rKey)?.measures || {};
//     }
//     return (
//       values.find((v) => v.rowKey === rKey && v.colKey === cKey)?.measures || {}
//     );
//   };

//   return (
//     <div>
//       <table border="1">
//         <thead>
//           <tr>
//             {rowData.length === 0 &&
//               columnHeaders.length === 0 &&
//               measureKeys.length > 0 && (
//                 <>
//                   {measureKeys.map((key, idx) => (
//                     <th key={`value-header-${idx}`}>{key}</th>
//                   ))}
//                 </>
//               )}

//             {rowData.length > 0 &&
//               rowData[0].rowTitles.map((_, i) => (
//                 <th key={`row-title-${i}`}>Row</th>
//               ))}
//             {columnHeaders.map((col, idx) => (
//               <th key={`col-header-${idx}`}>{col.title}</th>
//             ))}
//             {columnHeaders.length === 0 &&
//               measureKeys.map((k, i) => <th key={`val-only-${i}`}></th>)}
//           </tr>
//         </thead>
//         <tbody>
//           {rowData.map(({ rowKey, rowTitles }, i) => {
//             const cells = [];

//             rowTitles.forEach((title, level) => {
//               const shouldRender =
//                 i === 0 ||
//                 rowData[i - 1].rowTitles[level] !== title ||
//                 !rowData[i - 1].rowTitles
//                   .slice(0, level)
//                   .every((val, idx) => val === rowTitles[idx]);

//               if (shouldRender) {
//                 const rowSpan = rowData
//                   .slice(i)
//                   .filter(
//                     (r) =>
//                       r.rowTitles.slice(0, level + 1).join("|") ===
//                       rowTitles.slice(0, level + 1).join("|")
//                   ).length;

//                 cells.push(
//                   <td key={`row-${i}-col-${level}`} rowSpan={rowSpan}>
//                     {title}
//                   </td>
//                 );
//               }
//             });

//             const valueCells =
//               columnHeaders.length > 0
//                 ? columnHeaders.map((col, j) => {
//                     const measures = getCell(rowKey, col.key);

//                     return (
//                       <td key={`cell-${i}-${j}`}>
//                         {measureKeys.map((k) => (
//                           <div key={k}>
//                             <strong>{k}:</strong> {measures[k] ?? 0}
//                           </div>
//                         ))}
//                       </td>
//                     );
//                   })
//                 : [
//                     <td key={`val-${i}`} colSpan={measureKeys.length}>
//                       {measureKeys.map((k) => (
//                         <div key={k}>
//                           <strong>{k}:</strong> {getCell(rowKey, "")[k] ?? 0}
//                         </div>
//                       ))}
//                     </td>,
//                   ];

//             return <tr key={`row-${i}`}>{[...cells, ...valueCells]}</tr>;
//           })}
//         </tbody>

//         <tfoot>
//           {Object.entries(grandTotal).map((grandValues) => {
//             return (
//               <td>
//                 {grandValues[0]} - {grandValues[1]}
//               </td>
//             );
//           })}
//         </tfoot>
//       </table>
//     </div>
//   );
// };

// export default PivotTable;

// import React from "react";

// const PivotTable = ({ data }) => {
//   const { rows = [], columns = [], values = [], grandTotal = {} } = data || {};

//   const flattenRows = (rows, parentKey = "", titles = []) => {
//     if (!Array.isArray(rows)) return [];
//     return rows.flatMap((row) => {
//       const fullKey = parentKey ? `${parentKey}|${row.key}` : row.key;
//       const fullTitles = [...titles, row.title || row.key];
//       if (row.children) {
//         return flattenRows(row.children, fullKey, fullTitles);
//       }

//       return [{ rowKey: fullKey, rowTitles: fullTitles }];
//     });
//   };

//   const rowData = flattenRows(rows);

//   const flattenColumns = (cols, parentKey = "") => {
//     if (!Array.isArray(cols)) return [];
//     return cols.flatMap((col) => {
//       const fullKey = parentKey ? `${parentKey}|${col.key}` : col.key;
//       if (col.children) {
//         return flattenColumns(col.children, fullKey);
//       }
//       return [{ key: fullKey, title: col.title || col.key }];
//     });
//   };

//   const columnHeaders = flattenColumns(columns);

//   const measureKeys = (() => {
//     if (Array.isArray(values)) {
//       return Array.from(
//         new Set(values.flatMap((v) => Object.keys(v.measures || {})))
//       );
//     } else if (typeof values === "object" && values !== null) {
//       return Object.keys(values); // grand total case
//     }
//     return [];
//   })();

//   const getCell = (rKey, cKey = "") => {
//     if (columnHeaders.length === 0) {
//       return values.find((v) => v.rowKey === rKey)?.measures || {};
//     }
//     return (
//       values.find((v) => v.rowKey === rKey && v.colKey === cKey)?.measures || {}
//     );
//   };

//   return (
//     <div>
//       <table border="1">
//         <thead>
//           <tr>
//             {rowData.length > 0 &&
//               rowData[0].rowTitles.map((_, i) => (
//                 <th key={`row-title-${i}`}>Row</th>
//               ))}

//             {columnHeaders.map((col) => (
//               <React.Fragment key={col.key}>
//                 {measureKeys.map((k) => (
//                   <th key={`${col.key}-${k}`}>
//                     {col.title} - {k}
//                   </th>
//                 ))}
//               </React.Fragment>
//             ))}

//             {columnHeaders.length === 0 &&
//               measureKeys.map((k, i) => (
//                 <th key={`measure-header-${i}`}>{k}</th>
//               ))}
//           </tr>
//         </thead>
//         <tbody>
//           {rowData.length === 0 &&
//             columnHeaders.length === 0 &&
//             measureKeys.length > 0 && (
//               <tr>
//                 {measureKeys.map((key, i) => (
//                   <td key={`grand-value-${i}`}>{grandTotal[key] ?? 0}</td>
//                 ))}
//               </tr>
//             )}
//           {rowData.map(({ rowKey, rowTitles }, i) => {
//             const cells = [];

//             rowTitles.forEach((title, level) => {
//               const shouldRender =
//                 i === 0 ||
//                 rowData[i - 1].rowTitles[level] !== title ||
//                 !rowData[i - 1].rowTitles
//                   .slice(0, level)
//                   .every((val, idx) => val === rowTitles[idx]);

//               if (shouldRender) {
//                 const rowSpan = rowData
//                   .slice(i)
//                   .filter(
//                     (r) =>
//                       r.rowTitles.slice(0, level + 1).join("|") ===
//                       rowTitles.slice(0, level + 1).join("|")
//                   ).length;

//                 cells.push(
//                   <td key={`row-${i}-col-${level}`} rowSpan={rowSpan}>
//                     {title}
//                   </td>
//                 );
//               }
//             });

//             const valueCells =
//               columnHeaders.length > 0
//                 ? columnHeaders.flatMap((col, j) =>
//                     measureKeys.map((k, idx) => {
//                       const measures = getCell(rowKey, col.key);
//                       return (
//                         <td key={`cell-${i}-${j}-${idx}`}>
//                           {measures[k] ?? 0}
//                         </td>
//                       );
//                     })
//                   )
//                 : measureKeys.map((k, j) => (
//                     <td key={`cell-${i}-${j}`}>
//                       {getCell(rowKey, "")[k] ?? 0}
//                     </td>
//                   ));

//             return <tr key={`row-${i}`}>{[...cells, ...valueCells]}</tr>;
//           })}
//         </tbody>

//         <tfoot>
//           {Object.entries(grandTotal).length > 0 && (
//             <tr>
//               {rowData[0]?.rowTitles.map((_, i) => (
//                 <td key={`footer-label-${i}`} />
//               ))}
//               {columnHeaders.length > 0
//                 ? columnHeaders.flatMap((col) =>
//                     measureKeys.map((k) => (
//                       <td key={`footer-${col.key}-${k}`}>
//                         {grandTotal[`${col.key}|${k}`] ?? 0}
//                       </td>
//                     ))
//                   )
//                 : measureKeys.map((k) => (
//                     <td key={`footer-${k}`}>{grandTotal[k] ?? 0}</td>
//                   ))}
//             </tr>
//           )}
//         </tfoot>
//       </table>
//     </div>
//   );
// };

// export default PivotTable;
// import React from "react";

// const PivotTable = ({ data }) => {
//   const { rows = [], columns = [], values = [] } = data || {};

//   const flattenRows = (rows, parentKey = "", titles = []) => {
//     if (!Array.isArray(rows)) return [];
//     return rows.flatMap((row) => {
//       const fullKey = parentKey ? `${parentKey}|${row.key}` : row.key;
//       const fullTitles = [...titles, row.title || row.key];
//       if (row.children) {
//         return flattenRows(row.children, fullKey, fullTitles);
//       }
//       return [{ rowKey: fullKey, rowTitles: fullTitles }];
//     });
//   };

//   const rowData = flattenRows(rows);

//   const flattenColumns = (cols, parentKey = "") => {
//     if (!Array.isArray(cols)) return [];
//     return cols.flatMap((col) => {
//       const fullKey = parentKey ? `${parentKey}|${col.key}` : col.key;
//       if (col.children) {
//         return flattenColumns(col.children, fullKey);
//       }
//       return [{ key: fullKey, title: col.title || col.key }];
//     });
//   };

//   const measureKeys = Array.from(
//     new Set(
//       (Array.isArray(values) ? values : []).flatMap((v) =>
//         Object.keys(v.measures || {})
//       )
//     )
//   );

//   const getCell = (rKey, cKey = "") => {
//     if (columnHeaders.length === 0) {
//       return values.find((v) => v.rowKey === rKey)?.measures || {};
//     }
//     return (
//       values.find((v) => v.rowKey === rKey && v.colKey === cKey)?.measures || {}
//     );
//   };

//   const columnHeaders = flattenColumns(columns);

//   return (
//     <div>
//       <table border="1">
//         <thead>
//           <tr>
//             {rowData[0]?.rowTitles.map((_, i) => (
//               <th key={`row-label-${i}`}>Row Label</th>
//             ))}

//             {columnHeaders.length > 0 &&
//               (measureKeys.length > 0
//                 ? columnHeaders.flatMap((col) =>
//                     measureKeys.map((measure) => (
//                       <th key={`col-${col.key}-${measure}`}>
//                         {col.title} - {measure}
//                       </th>
//                     ))
//                   )
//                 : columnHeaders.map((col) => (
//                     <th key={`col-${col.key}`}>{col.title}</th>
//                   )))}

//             {columnHeaders.length === 0 &&
//               measureKeys.length > 0 &&
//               measureKeys.map((measure) => (
//                 <th key={`measure-${measure}`}>{measure}</th>
//               ))}
//           </tr>
//         </thead>

//         <tbody>
//           {rowData.map(({ rowKey, rowTitles }, i) => {
//             const cells = [];

//             rowTitles.forEach((title, level) => {
//               const shouldRender =
//                 i === 0 ||
//                 rowData[i - 1].rowTitles[level] !== title ||
//                 !rowData[i - 1].rowTitles
//                   .slice(0, level)
//                   .every((val, idx) => val === rowTitles[idx]);

//               if (shouldRender) {
//                 const rowSpan = rowData
//                   .slice(i)
//                   .filter(
//                     (r) =>
//                       r.rowTitles.slice(0, level + 1).join("|") ===
//                       rowTitles.slice(0, level + 1).join("|")
//                   ).length;

//                 cells.push(
//                   <td key={`row-${i}-${level}`} rowSpan={rowSpan}>
//                     {title}
//                   </td>
//                 );
//               }
//             });

//             const valueCells =
//               columnHeaders.length > 0
//                 ? columnHeaders.flatMap((col) =>
//                     measureKeys.map((measure) => {
//                       const cell = getCell(rowKey, col.key);
//                       const val = cell[measure];
//                       return (
//                         <td key={`cell-${i}-${col.key}-${measure}`}>
//                           {typeof val === "number"
//                             ? val.toFixed(2)
//                             : typeof val === "string" && val.trim() !== ""
//                             ? val
//                             : ""}
//                         </td>
//                       );
//                     })
//                   )
//                 : measureKeys.map((measure) => {
//                     const cell = getCell(rowKey, "");
//                     const val = cell[measure];
//                     return (
//                       <td key={`cell-${i}-${measure}`}>
//                         {typeof val === "number"
//                           ? val.toFixed(2)
//                           : typeof val === "string" && val.trim() !== ""
//                           ? val
//                           : ""}
//                       </td>
//                     );
//                   });

//             return <tr key={`row-${i}`}>{[...cells, ...valueCells]}</tr>;
//           })}
//         </tbody>

//         <tfoot>
//           {measureKeys.length > 0 && (
//             <tr>
//               {rowData[0]?.rowTitles.map((_, i) => (
//                 <td key={`footer-label-${i}`}>Total</td>
//               ))}

//               {columnHeaders.length > 0
//                 ? columnHeaders.flatMap((col) =>
//                     measureKeys.map((measure) => {
//                       const matchingValues = values.filter(
//                         (v) => v.colKey === col.key
//                       );
//                       let sum = 0;
//                       let count = 0;
//                       matchingValues.forEach((v) => {
//                         const val = v.measures?.[measure];
//                         if (typeof val === "number") sum += val;
//                         else if (typeof val === "string" && val.trim() !== "")
//                           count++;
//                       });

//                       return (
//                         <td key={`footer-${col.key}-${measure}`}>
//                           {sum > 0
//                             ? sum.toFixed(2)
//                             : count > 0
//                             ? `${count}x`
//                             : ""}
//                         </td>
//                       );
//                     })
//                   )
//                 : measureKeys.map((measure) => {
//                     let sum = 0;
//                     let count = 0;
//                     values.forEach((v) => {
//                       const val = v.measures?.[measure];
//                       if (typeof val === "number") sum += val;
//                       else if (typeof val === "string" && val.trim() !== "")
//                         count++;
//                     });

//                     return (
//                       <td key={`footer-${measure}`}>
//                         {sum > 0
//                           ? sum.toFixed(2)
//                           : count > 0
//                           ? `${count}x`
//                           : ""}
//                       </td>
//                     );
//                   })}
//             </tr>
//           )}
//         </tfoot>
//       </table>
//     </div>
//   );
// };

// export default PivotTable;
