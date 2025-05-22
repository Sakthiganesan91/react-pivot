// import { useMemo } from "react";
// import { flattenColumns, flattenRows } from "./calculation";

// const PivotTable = ({ data, method }) => {
//   const { rows = [], columns = [], values = [] } = data || {};

//   const rowData = useMemo(() => flattenRows(rows), [rows]);
//   const columnHeaders = useMemo(() => flattenColumns(columns), [columns]);
//   const measureKeys =
//     typeof values !== "function" &&
//     Array.from(
//       new Set((values || []).flatMap((v) => Object.keys(v.measures || {})))
//     );

//   const getCell = (rKey, cKey = "") => {
//     if (columnHeaders.length === 0) {
//       return values.find((v) => v.rowKey === rKey)?.measures || {};
//     }
//     return (
//       values.find((v) => v.rowKey === rKey && v.colKey === cKey)?.measures || {}
//     );
//   };

//   const buildColumnHeaderRows = () => {
//     const maxDepth = Math.max(...columnHeaders.map((ch) => ch.titles.length));
//     const rows = Array.from({ length: maxDepth }, () => []);
//     columnHeaders.forEach((col) => {
//       for (let i = 0; i < maxDepth; i++) {
//         //if (rows[i].includes(col.titles[i])) continue;
//         rows[i].push(col.titles[i] || "");
//       }
//     });

//     return rows;
//   };

//   const columnHeaderRows = buildColumnHeaderRows();

//   return (
//     <table border="1" className="table">
//       <thead className="table-danger">
//         <tr>
//           {columnHeaderRows.length === 0 &&
//             rowData[0]?.rowTitles.map((_, i) => (
//               <th key={`row-header-placeholder-${i}`}>Row {i + 1}</th>
//             ))}
//           {columnHeaderRows.length === 0 &&
//             columnHeaders.length === 0 &&
//             measureKeys &&
//             measureKeys.map((measure) => <th key={measure}>{measure}</th>)}
//         </tr>
//         {columnHeaderRows.map((row, i) => (
//           <tr key={`col-header-${i}`}>
//             {i === 0 &&
//               rowData[0]?.rowTitles.map((_, j) => (
//                 <th
//                   key={`row-header-placeholder-${j}`}
//                   rowSpan={columnHeaders.length}
//                 >
//                   Row {j + 1}
//                 </th>
//               ))}
//             {row.map((col, j) => (
//               <th key={`col-${i}-${j}`} colSpan={measureKeys.length}>
//                 {col}
//               </th>
//             ))}
//           </tr>
//         ))}
//         {measureKeys.length > 0 && (
//           <tr>
//             {columnHeaders.length > 0 &&
//               columnHeaders.map((col) =>
//                 measureKeys.map((measure) => (
//                   <th key={`${col.key}-${measure}`}>{measure}</th>
//                 ))
//               )}
//           </tr>
//         )}
//       </thead>

//       <tbody>
//         {rowData.map(({ rowKey, rowTitles }, i) => {
//           const cells = [];

//           rowTitles.forEach((title, level) => {
//             const shouldRender =
//               i === 0 ||
//               rowData[i - 1].rowTitles[level] !== title ||
//               !rowData[i - 1].rowTitles
//                 .slice(0, level)
//                 .every((val, idx) => val === rowTitles[idx]);

//             if (shouldRender) {
//               const rowSpan = rowData
//                 .slice(i)
//                 .filter(
//                   (r) =>
//                     r.rowTitles.slice(0, level + 1).join("|") ===
//                     rowTitles.slice(0, level + 1).join("|")
//                 ).length;

//               cells.push(
//                 <td key={`row-${i}-${level}`} rowSpan={rowSpan}>
//                   {title}
//                 </td>
//               );
//             }
//           });

//           const valueCells =
//             columnHeaders.length > 0
//               ? columnHeaders.map((col) =>
//                   measureKeys.map((measure) => (
//                     // <td key={`${rowKey}-${col.key}-${measure}`}>
//                     //   {getCell(rowKey, col.key)[measure]?.toFixed(2) || ""}
//                     // </td>
//                     <td key={`${rowKey}-${col.key}-${measure}`}>
//                       {typeof getCell(rowKey, col.key)[measure] === "object"
//                         ? getCell(rowKey, col.key)[measure].sum /
//                             getCell(rowKey, col.key)[measure].count?.toFixed(
//                               2
//                             ) || ""
//                         : getCell(rowKey, col.key)[measure]?.toFixed(2) || ""}
//                     </td>
//                   ))
//                 )
//               : measureKeys.map((measure) => {
//                   const cell = getCell(rowKey, "");

//                   const val = cell[measure];
//                   return (
//                     <td key={`cell-${i}-${measure}`}>
//                       {typeof val === "object"
//                         ? (val.sum / val.count).toFixed(2) || ""
//                         : typeof val === "number"
//                         ? val.toFixed(2)
//                         : typeof val === "string" && val.trim() !== ""
//                         ? val
//                         : ""}
//                     </td>
//                   );
//                 });

//           return <tr key={`row-${i}`}>{[...cells, ...valueCells]}</tr>;
//         })}
//       </tbody>
//       <tfoot>
//         {measureKeys.length > 0 && (
//           <tr>
//             {rowData.length > 0 && (
//               <td colSpan={rowData[0]?.rowTitles.length}>Total</td>
//             )}

//             {columnHeaders.length > 0
//               ? columnHeaders.flatMap((col) =>
//                   measureKeys.map((measure) => {
//                     const matchingValues = values.filter(
//                       (v) => v.colKey === col.key
//                     );
//                     let sum = 0;
//                     let count = 0;

//                     matchingValues.forEach((v) => {
//                       const val = v.measures?.[measure];

//                       if (typeof val === "number") sum += val;
//                       else if (typeof val === "object") {
//                         sum = val.sum;
//                         count = val.count;
//                       } else if (typeof val === "string" && val.trim() !== "")
//                         count++;
//                     });

//                     return (
//                       <td key={`footer-${col.key}-${measure}`}>
//                         {method === "average"
//                           ? sum / count
//                           : sum > 0
//                           ? sum.toFixed(2)
//                           : count > 0
//                           ? `${count}x`
//                           : ""}
//                       </td>
//                     );
//                   })
//                 )
//               : measureKeys.map((measure) => {
//                   let sum = 0;
//                   let count = 0;
//                   values.forEach((v) => {
//                     const val = v.measures?.[measure];
//                     console.log(val);
//                     if (typeof val === "number") sum += val;
//                     else if (typeof val === "object") {
//                       sum += val.sum;
//                       count += val.count;
//                     } else if (typeof val === "string" && val.trim() !== "")
//                       count++;
//                   });

//                   return (
//                     <td key={`footer-${measure}`}>
//                       {method === "average"
//                         ? sum / count
//                         : sum > 0
//                         ? sum.toFixed(2)
//                         : count > 0
//                         ? `${count}x`
//                         : ""}
//                     </td>
//                   );
//                 })}
//           </tr>
//         )}
//       </tfoot>
//     </table>
//   );
// };

// export default PivotTable;
