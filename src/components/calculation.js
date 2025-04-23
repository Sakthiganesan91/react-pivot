export const groupBy = (data, rowKeys, columnKeys, values) => {
  if (!rowKeys.length && !columnKeys.length && !values.length) return data;

  if (!rowKeys.length && !columnKeys.length && values.length) {
    const measures = {};
    // values.forEach((value) => {
    //   measures[value] = data.reduce((total, item) => {
    //     return total + (parseFloat(item[value]) || 0);
    //   }, 0);
    // });
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
    return measures;
  }

  if (rowKeys.length && !columnKeys.length) {
    return {
      rows: groupByDimension(data, rowKeys, values),
      values: groupByCells(data, rowKeys, [], values),
      grandTotal: calculateGrandTotal(data, values),
    };
  }

  if (!rowKeys.length && columnKeys.length) {
    return {
      columns: groupByDimension(data, columnKeys, []),
      values: groupByCells(data, [], columnKeys, values),
      grandTotal: calculateGrandTotal(data, values),
    };
  }

  return {
    rows: groupByDimension(data, rowKeys, values),
    columns: groupByDimension(data, columnKeys, values),
    values: groupByCells(data, rowKeys, columnKeys, values),
    grandTotal: calculateGrandTotal(data, values),
  };
};

const groupByDimension = (data, keys, values) => {
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
      values.forEach((value) => {
        entry[value] = items.reduce((total, item) => {
          const parsed = parseFloat(item[value]);
          return total + (!isNaN(parsed) ? parsed : 1);
        }, 0);
      });
    }

    if (restKeys.length) {
      entry.children = groupByDimension(items, restKeys, values);
    }

    grouped.push(entry);
  }

  return grouped;
};

const groupByCells = (data, rowKeys, columnKeys, values) => {
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

    values.forEach((value) => {
      if (!cell.measures[value]) cell.measures[value] = 0;
      const parsed = parseFloat(item[value]);
      cell.measures[value] += !isNaN(parsed) ? parsed : 1;
    });
  });

  return cells;
};

const calculateGrandTotal = (data, values) => {
  const totals = {};

  values.forEach((value) => {
    totals[value] = data.reduce((sum, item) => {
      const parsed = parseFloat(item[value]);
      console.log(parsed);
      if (!isNaN(parsed)) {
        return sum + parsed;
      } else {
        return sum + 1;
      }
    }, 0);
  });

  console.log(totals);
  return totals;
};
