import { useState } from "react";
import PivotTableFields from "./PivotTableFields";

import PivotTable from "./PivotTable";
import { groupBy } from "./calculation";

const TableDisplay = ({ data, headers }) => {
  const [tableRows, setTableRows] = useState([]);
  const [newData, setNewData] = useState([]);
  const [valueRows, setValueRows] = useState([]);
  const [columnValues, setColumnValues] = useState([]);
  const [filters, setFilters] = useState([]);
  const [method, setMethod] = useState([]);

  const getRows = (
    rows = [],
    columns = [],
    values = [],
    aggregrationMethod = "add"
  ) => {
    setTableRows(rows);
    setColumnValues(columns);
    setValueRows(values);
    setMethod(aggregrationMethod);
    const groupedData = groupBy(
      data,
      rows,
      columns,
      values,
      aggregrationMethod
    );
    setNewData(groupedData);
  };

  return (
    <div className="border border -3 rounded-3 my-1">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <PivotTable data={newData} method={method} />
            {/* <button onClick={() => getRows()}>Click</button> */}
          </div>
        </div>

        <div className="row">
          <div className="col-6">
            <div className="col-12">
              <PivotTableFields
                headers={headers}
                setTableRows={getRows}
                setValueRows={setValueRows}
                setColumnValues={setColumnValues}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableDisplay;
