export const groupBy = (
  data,
  rowKeys,
  columnKeys,
  values,
  aggregationMethod
) => {
  if (!rowKeys.length && !columnKeys.length && !values.length) return data;

  if (!rowKeys.length && !columnKeys.length && values.length) {
    const measures = {};
    // values.forEach((value) => {
    //   measures[value] = data.reduce((total, item) => {
    //     return total + (parseFloat(item[value]) || 0);
    //   }, 0);
    // });

    switch (aggregationMethod) {
      case "add":
        values.forEach((value) => {
          measures[value] = data.reduce((sum, item) => {
            const parsed = parseFloat(item[value]);
            if (!isNaN(parsed)) {
              return sum + parsed;
            } else {
              return sum + 1;
            }
          }, 0);
        });

        break;
      case "count":
        values.forEach((value) => {
          measures[value] = data.reduce((sum, item) => {
            return sum + 1;
          }, 0);
        });

        break;

      case "max":
        values.forEach((value) => {
          if (!measures[value]) measures[value] = 0;
          const parsed = parseFloat(measures[value]);
          measures[value] = Math.max(measures[value], parsed);
        });
        break;

      case "min":
        values.forEach((value) => {
          if (!measures[value]) measures[value] = 999999999999999;
          const parsed = parseFloat(measures[value]);
          measures[value] = Math.min(measures[value], parsed);
        });
        break;
      default:
        break;
    }
    // values.forEach((value) => {
    //   measures[value] = data.reduce((sum, item) => {
    //     const parsed = parseFloat(item[value]);
    //     if (!isNaN(parsed)) {
    //       return sum + parsed;
    //     } else {
    //       return sum + 1;
    //     }
    //   }, 0);
    // });
    return measures;
  }

  if (rowKeys.length && !columnKeys.length) {
    return {
      rows: groupByDimension(data, rowKeys, values, aggregationMethod),
      values: groupByCells(data, rowKeys, [], values, aggregationMethod),
      grandTotal: calculateGrandTotal(data, values, aggregationMethod),
    };
  }

  if (!rowKeys.length && columnKeys.length) {
    return {
      columns: groupByDimension(data, columnKeys, [], aggregationMethod),
      values: groupByCells(data, [], columnKeys, values, aggregationMethod),
      grandTotal: calculateGrandTotal(data, values, aggregationMethod),
    };
  }

  return {
    rows: groupByDimension(data, rowKeys, values, aggregationMethod),
    columns: groupByDimension(data, columnKeys, values, aggregationMethod),
    values: groupByCells(data, rowKeys, columnKeys, values, aggregationMethod),
    grandTotal: calculateGrandTotal(data, values, aggregationMethod),
  };
};

const groupByDimension = (data, keys, values, aggregationMethod) => {
  if (!keys.length) return data;

  const [currentKey, ...restKeys] = keys;
  const map = new Map();

  data.forEach((item) => {
    const key = item[currentKey];
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(item);
  });

  const grouped = [];

  for (let [key, items] of map.entries()) {
    const entry = {
      [currentKey]: key,
      items,
      key: key,
    };

    if (values && values.length) {
      switch (aggregationMethod) {
        case "add":
          values.forEach((value) => {
            entry[value] = data.reduce((sum, item) => {
              const parsed = parseFloat(item[value]);
              if (!isNaN(parsed)) {
                return sum + parsed;
              } else {
                return sum + 1;
              }
            }, 0);
          });

          break;
        case "count":
          values.forEach((value) => {
            entry[value] = data.reduce((sum, item) => {
              return sum + 1;
            }, 0);
          });

          break;

        case "max":
          values.forEach((value) => {
            if (!entry[value]) entry[value] = 0;
            const parsed = parseFloat(entry[value]);
            entry[value] = Math.max(entry[value], parsed);
          });
          break;

        case "min":
          values.forEach((value) => {
            if (!entry[value]) entry[value] = 999999999999999;
            const parsed = parseFloat(entry[value]);
            entry[value] = Math.min(entry[value], parsed);
          });
          break;
        default:
          break;
      }
      // values.forEach((value) => {
      //   entry[value] = items.reduce((total, item) => {
      //     const parsed = parseFloat(item[value]);
      //     return total + (!isNaN(parsed) ? parsed : 1);
      //   }, 0);
      // });
    }

    if (restKeys.length) {
      entry.children = groupByDimension(items, restKeys, values);
    }

    grouped.push(entry);
  }

  return grouped;
};

const groupByCells = (data, rowKeys, columnKeys, values, aggregationMethod) => {
  const cells = [];

  data.forEach((item) => {
    const rowKey = rowKeys.map((key) => item[key]).join("|");

    const colKey = columnKeys.map((key) => item[key]).join("|");

    let cell = cells.find((c) => c.rowKey === rowKey && c.colKey === colKey);

    if (!cell) {
      cell = {
        rowKey,
        colKey,
        rowValues: {},
        colValues: {},
        measures: {},
      };

      rowKeys.forEach((key) => {
        cell.rowValues[key] = item[key];
      });

      columnKeys.forEach((key) => {
        cell.colValues[key] = item[key];
      });

      cells.push(cell);
    }

    switch (aggregationMethod) {
      case "add":
        values.forEach((value) => {
          if (!cell.measures[value]) cell.measures[value] = 0;
          const parsed = parseFloat(item[value]);
          cell.measures[value] += !isNaN(parsed) ? parsed : 1;
        });

        break;
      case "count":
        values.forEach((value) => {
          if (!cell.measures[value]) cell.measures[value] = 0;

          cell.measures[value] += 1;
        });

        break;

      case "average":
        values.forEach((value) => {
          if (!cell.measures[value]) {
            cell.measures[value] = { sum: 0, count: 0 };
          }

          const parsed = parseFloat(item[value]);
          if (!isNaN(parsed)) {
            cell.measures[value].sum += parsed;
            cell.measures[value].count += 1;
          }
        });
        break;

      case "max":
        values.forEach((value) => {
          if (!cell.measures[value]) cell.measures[value] = 0;
          const parsed = parseFloat(item[value]);
          if (!isNaN(parsed))
            cell.measures[value] = Math.max(cell.measures[value], parsed);
        });
        break;
      case "min":
        values.forEach((value) => {
          if (!cell.measures[value]) cell.measures[value] = Infinity;
          const parsed = parseFloat(item[value]);
          if (!isNaN(parsed))
            cell.measures[value] = Math.min(cell.measures[value], parsed);
        });
        break;
      default:
        break;
    }
    // values.forEach((value) => {
    //   if (!cell.measures[value]) cell.measures[value] = 0;
    //   const parsed = parseFloat(item[value]);
    //   cell.measures[value] += !isNaN(parsed) ? parsed : 1;
    // });
  });

  return cells;
};

const calculateGrandTotal = (data, values, aggregationMethod) => {
  const totals = {};

  switch (aggregationMethod) {
    case "add":
      values.forEach((value) => {
        totals[value] = data.reduce((sum, item) => {
          const parsed = parseFloat(item[value]);
          if (!isNaN(parsed)) {
            return sum + parsed;
          } else {
            return sum + 1;
          }
        }, 0);
      });

      break;
    case "count":
      values.forEach((value) => {
        totals[value] = data.reduce((sum, item) => {
          return sum + 1;
        }, 0);
      });

      break;

    case "max":
      values.forEach((value) => {
        if (!totals[value]) totals[value] = 0;
        const parsed = parseFloat(totals[value]);

        totals[value] = Math.max(totals[value], parsed);
      });
      break;
    case "min":
      values.forEach((value) => {
        if (!totals[value]) totals[value] = 999999999999999;
        const parsed = parseFloat(totals[value]);
        totals[value] = Math.min(totals[value], parsed);
      });
      break;
    default:
      break;
  }
  // values.forEach((value) => {
  //   totals[value] = data.reduce((sum, item) => {
  //     const parsed = parseFloat(item[value]);

  //     if (!isNaN(parsed)) {
  //       return sum + parsed;
  //     } else {
  //       return sum + 1;
  //     }
  //   }, 0);
  // });

  return totals;
};

export const flattenRows = (rows, parentKey = "", titles = []) => {
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

export const flattenColumns = (cols, parentKey = "", titles = []) => {
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
