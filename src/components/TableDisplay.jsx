import React, { use, useState } from "react";
import PivotTableFields from "./PivotTableFields";

import PivotTable from "./PivotTable";
import { groupBy } from "./calculation";
import { DndContext } from "@dnd-kit/core";

const TableDisplay = ({ data, headers }) => {
  const [tableRows, setTableRows] = useState([]);
  const [newData, setNewData] = useState([]);
  const [valueRows, setValueRows] = useState([]);
  const [columnValues, setColumnValues] = useState([]);
  const [filters, setFilters] = useState([]);

  const getRows = (rows = [], columns = [], values = []) => {
    setTableRows(rows);
    setColumnValues(columns);
    setValueRows(values);
    const groupedData = groupBy(data, rows, columns, values);
    setNewData(groupedData);
    console.log("Something");
    console.log(groupedData);
  };
  const addItemsToFilters = (e) => {
    console.log("Drag End Event:", e);

    console.log(e);

    const newItem = e.active.data.current?.title;
    console.log("New Item:", newItem);
    console.log("Dropped Over:", e.over);

    // if (!e.over) {
    //   console.warn("Dropped outside of a droppable area.");
    //   return;
    // }

    if (e.over?.id !== newItem || !newItem) return;

    if (!filters.includes(newItem)) {
      setFilters((prev) => [...prev, newItem]);
    }
  };

  return (
    <div className="border border -3 rounded-3 my-1">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <PivotTable data={newData} />
            {/* <button onClick={() => getRows()}>Click</button> */}
          </div>
        </div>

        <div className="row">
          <div className="col-6">
            <DndContext onDragEnd={addItemsToFilters}>
              <div className="col-12">
                <PivotTableFields
                  headers={headers}
                  setTableRows={getRows}
                  setValueRows={setValueRows}
                  setColumnValues={setColumnValues}
                />
              </div>
            </DndContext>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableDisplay;
