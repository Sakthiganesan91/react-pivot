import { DndContext, useDroppable } from "@dnd-kit/core";
import React, { useState } from "react";
import { useDraggable } from "@dnd-kit/core";

import { CSS } from "@dnd-kit/utilities";

const DraggableHeader = (props) => {
  const { header } = props;
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: header,
    data: { title: header },
  });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      {...attributes}
      {...listeners}
    >
      {header}
    </div>
  );
};
const FilterDrop = (props) => {
  const { filter } = props;
  const { setNodeRef } = useDroppable({
    id: filter,
  });

  return (
    <>
      <div ref={setNodeRef}>
        {
          <label htmlFor={filter} className="mx-2">
            {filter[0].toUpperCase() + filter.slice(1, filter.length)}
          </label>
        }
      </div>
    </>
  );
};
const PivotTableFields = ({
  headers,
  setTableRows,
  setValueRows,
  setColumnValues,
}) => {
  const [rows, setRows] = useState([]);
  const [values, setValues] = useState([]);
  const [columns, setColumns] = useState([]);
  const [filters, setFilters] = useState([]);

  const columnChangeHandler = (event) => {
    const columnName = event.target.name;
    const isChecked = event.target.checked;

    let updatedColumns = [];

    if (isChecked) {
      updatedColumns = [...columns, columnName];
    } else {
      updatedColumns = columns.filter((column) => column !== columnName);
    }

    setColumns(updatedColumns);
    setColumnValues(updatedColumns);

    setTableRows(rows, updatedColumns, values);
  };

  const rowChangeHandler = (event) => {
    const rowName = event.target.name;
    const isChecked = event.target.checked;

    let updatedRows = [];

    if (isChecked) {
      updatedRows = [...rows, rowName];
    } else {
      updatedRows = rows.filter((row) => row !== rowName);
    }

    setRows(updatedRows);
    setTableRows(updatedRows, columns, values);
  };

  const valuesChangeHandler = (event) => {
    const valueName = event.target.name;
    const isChecked = event.target.checked;

    let updatedValues = [];

    if (isChecked) {
      updatedValues = [...values, valueName];
    } else {
      updatedValues = values.filter((value) => value !== valueName);
    }

    setValues(updatedValues);
    setValueRows(updatedValues);
    setTableRows(rows, columns, updatedValues);
  };

  if (headers.length <= 0) return "No Headers found. Please import csv file";
  return (
    <>
      <div className="border border-2 ">
        <div className="row my-2">
          {/* <div className="col-6">
            <p>Filters</p>
            {filters.map((filter) => (
              <FilterDrop filter={filter} />
            ))}
          </div> */}
        </div>
        <div className="row">
          <div className="col-4">
            <p>Rows</p>
            {headers.map((header) => (
              <div key={header}>
                <input
                  type="checkbox"
                  name={header}
                  id={header}
                  value={header}
                  onChange={rowChangeHandler}
                />
                <label htmlFor={header} className="mx-2">
                  {header[0].toUpperCase() + header.slice(1, header.length)}
                </label>
              </div>
            ))}
          </div>
          <div className="col-4">
            <p>Columns</p>
            {headers.map((header) => (
              <div key={header}>
                <input
                  type="checkbox"
                  name={header}
                  id={header}
                  value={header}
                  onChange={columnChangeHandler}
                />
                <label htmlFor={header} className="mx-2">
                  {header[0].toUpperCase() + header.slice(1, header.length)}
                </label>
              </div>
            ))}
          </div>
          <div className="col-4">
            <p>Values</p>
            {headers.map((header) => (
              <div key={header}>
                <input
                  type="checkbox"
                  name={header}
                  id={header}
                  value={header}
                  onChange={valuesChangeHandler}
                />
                <label htmlFor={header} className="mx-2">
                  {header[0].toUpperCase() + header.slice(1, header.length)}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="row"></div>
      </div>
    </>
  );
};

export default PivotTableFields;
