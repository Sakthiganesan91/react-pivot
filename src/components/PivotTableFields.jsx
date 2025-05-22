import React, { useState, useCallback } from "react";

const FieldSelector = React.memo(({ title, headers, selected, onChange }) => (
  <div className="col-4">
    <p className="fw-bold">{title}</p>
    {headers.map((header) => (
      <div key={header}>
        <input
          type="checkbox"
          name={header}
          id={`${title}-${header}`}
          checked={selected.includes(header)}
          onChange={onChange}
        />
        <label htmlFor={`${title}-${header}`} className="mx-2">
          {header[0].toUpperCase() + header.slice(1)}
        </label>
      </div>
    ))}
  </div>
));

const aggregrations = ["add", "average", "count", "max", "min"];

const PivotTableFields = React.memo(
  ({ headers, setTableRows, setValueRows, setColumnValues }) => {
    const [rows, setRows] = useState([]);
    const [values, setValues] = useState([]);
    const [columns, setColumns] = useState([]);
    const [aggregrationMethod, setAggregationMethod] = useState("add");

    const rowChangeHandler = useCallback(
      (event) => {
        const name = event.target.name;
        const isChecked = event.target.checked;

        const updated = isChecked
          ? [...rows, name]
          : rows.filter((r) => r !== name);

        setRows(updated);
        setTableRows(updated, columns, values, aggregrationMethod);
      },
      [rows, columns, values, aggregrationMethod]
    );

    const columnChangeHandler = useCallback(
      (event) => {
        const name = event.target.name;
        const isChecked = event.target.checked;

        const updated = isChecked
          ? [...columns, name]
          : columns.filter((c) => c !== name);

        setColumns(updated);
        setColumnValues(updated);
        setTableRows(rows, updated, values, aggregrationMethod);
      },
      [columns, rows, values, aggregrationMethod, setColumnValues]
    );

    const valuesChangeHandler = useCallback(
      (event) => {
        const name = event.target.name;
        const isChecked = event.target.checked;

        const updated = isChecked
          ? [...values, name]
          : values.filter((v) => v !== name);

        setValues(updated);
        setValueRows(updated);
        setTableRows(rows, columns, updated, aggregrationMethod);
      },
      [values, rows, columns, aggregrationMethod, setValueRows]
    );

    const aggregationMethodHandler = useCallback(
      (event) => {
        const method = event.target.value;
        setAggregationMethod(method);
        setTableRows(rows, columns, values, method);
      },
      [rows, columns, values]
    );

    if (!headers || headers.length === 0) {
      return <p>No headers found. Please import CSV file.</p>;
    }

    return (
      <div className="border border-2 p-3">
        <div className="row">
          <FieldSelector
            title="Rows"
            headers={headers}
            selected={rows}
            onChange={rowChangeHandler}
          />
          <FieldSelector
            title="Columns"
            headers={headers}
            selected={columns}
            onChange={columnChangeHandler}
          />
          <FieldSelector
            title="Values"
            headers={headers}
            selected={values}
            onChange={valuesChangeHandler}
          />
        </div>

        <div className="row my-3">
          <div className="col-3">
            <p className="fw-bold">Aggregation Methods</p>
            {aggregrations.map((method) => (
              <div key={method}>
                <input
                  type="radio"
                  name="aggregation"
                  id={method}
                  value={method}
                  checked={aggregrationMethod === method}
                  onChange={aggregationMethodHandler}
                />
                <label htmlFor={method} className="mx-2">
                  {method[0].toUpperCase() + method.slice(1)}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

export default PivotTableFields;
