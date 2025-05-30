import { useState } from "react";

const aggregations = ["add", "average", "count", "max", "min"];

const PivotTableFields = ({
  headers,
  setTableRows,
  setValueRows,
  setColumnValues,
}) => {
  const [rows, setRows] = useState([]);
  const [values, setValues] = useState([]);
  const [columns, setColumns] = useState([]);
  const [aggregationMethod, setAggregationMethod] = useState("add");
  const [draggedField, setDraggedField] = useState(null);

  const usedFields = [...rows, ...values, ...columns];
  const availableFields = headers
    ? headers.filter((header) => !usedFields.includes(header))
    : [];

  const updatePivotFields = (
    newRows,
    newColumns,
    newValues,
    newAggregation
  ) => {
    setTableRows(newRows, newColumns, newValues, newAggregation);
    setColumnValues(newColumns);
    setValueRows(newValues);
  };

  const handleDragStart = (e, field) => {
    setDraggedField(field);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, dropZone) => {
    e.preventDefault();

    if (!draggedField) return;

    const newRows = rows.filter((r) => r !== draggedField);
    const newColumns = columns.filter((c) => c !== draggedField);
    const newValues = values.filter((v) => v !== draggedField);

    let updatedRows = newRows;
    let updatedColumns = newColumns;
    let updatedValues = newValues;

    if (dropZone === "rows") {
      updatedRows = [...newRows, draggedField];
    } else if (dropZone === "columns") {
      updatedColumns = [...newColumns, draggedField];
    } else if (dropZone === "values") {
      updatedValues = [...newValues, draggedField];
    }

    setRows(updatedRows);
    setColumns(updatedColumns);
    setValues(updatedValues);

    updatePivotFields(
      updatedRows,
      updatedColumns,
      updatedValues,
      aggregationMethod
    );
    setDraggedField(null);
  };

  const handleRemove = (field, fromZone) => {
    let updatedRows = rows;
    let updatedColumns = columns;
    let updatedValues = values;

    if (fromZone === "rows") {
      updatedRows = rows.filter((r) => r !== field);
      setRows(updatedRows);
    } else if (fromZone === "columns") {
      updatedColumns = columns.filter((c) => c !== field);
      setColumns(updatedColumns);
    } else if (fromZone === "values") {
      updatedValues = values.filter((v) => v !== field);
      setValues(updatedValues);
    }

    updatePivotFields(
      updatedRows,
      updatedColumns,
      updatedValues,
      aggregationMethod
    );
  };

  const handleAggregationChange = (event) => {
    const method = event.target.value;
    setAggregationMethod(method);
    updatePivotFields(rows, columns, values, method);
  };

  if (!headers || headers.length === 0) {
    return <p>No headers found. Please import CSV file.</p>;
  }

  return (
    <div className="border border-2 p-3">
      <div className="mb-4">
        <p className="fw-bold">Fields</p>
        <div className="d-flex flex-wrap gap-2">
          {availableFields.map((field) => (
            <div
              key={field}
              draggable
              onDragStart={(e) => handleDragStart(e, field)}
              className="border rounded px-2 mb-2"
              style={{ cursor: "grab" }}
            >
              {field[0].toUpperCase() + field.slice(1)}
            </div>
          ))}
        </div>
      </div>

      <div className="row">
        <div className="col-4">
          <p className="fw-bold">Rows</p>
          <div
            className="border rounded p-3"
            style={{ minHeight: "100px" }}
            onDrop={(e) => handleDrop(e, "rows")}
            onDragOver={handleDragOver}
          >
            {rows.length === 0 ? (
              <p className="text-muted">Rows</p>
            ) : (
              rows.map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="d-flex align-items-center"
                >
                  <span>{item[0].toUpperCase() + item.slice(1)}</span>
                  <button
                    type="button"
                    className="btn btn-sm fw-bold"
                    onClick={() => handleRemove(item, "rows")}
                  >
                    X
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="col-4">
          <p className="fw-bold">Columns</p>
          <div
            className="border rounded p-3"
            style={{ minHeight: "100px" }}
            onDrop={(e) => handleDrop(e, "columns")}
            onDragOver={handleDragOver}
          >
            {columns.length === 0 ? (
              <p className="text-muted">Columns</p>
            ) : (
              columns.map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className=" d-flex align-items-center"
                >
                  <span>{item[0].toUpperCase() + item.slice(1)}</span>
                  <button
                    type="button"
                    className="btn btn-sm fw-bold"
                    onClick={() => handleRemove(item, "columns")}
                  >
                    X
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="col-4">
          <p className="fw-bold">Values</p>
          <div
            className="border rounded p-3"
            style={{ minHeight: "100px" }}
            onDrop={(e) => handleDrop(e, "values")}
            onDragOver={handleDragOver}
          >
            {values.length === 0 ? (
              <p className="text-muted">Values</p>
            ) : (
              values.map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="d-flex align-items-center"
                >
                  <span>{item[0].toUpperCase() + item.slice(1)}</span>
                  <button
                    type="button"
                    className="btn btn-sm fw-bold"
                    onClick={() => handleRemove(item, "values")}
                  >
                    X
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <div className="row my-3">
        <div className="col-3">
          <p className="fw-bold">Aggregation</p>
          <div className="d-flex">
            {aggregations.map((method) => (
              <div key={method} className="d-flex">
                <div>
                  <input
                    type="radio"
                    name="aggregation"
                    id={method}
                    value={method}
                    checked={aggregationMethod === method}
                    onChange={handleAggregationChange}
                  />
                </div>
                <div>
                  <label htmlFor={method} className="mx-2">
                    {method[0].toUpperCase() + method.slice(1)}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PivotTableFields;
