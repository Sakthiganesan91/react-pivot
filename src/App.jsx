import { useState } from "react";

import "./App.css";
import FileReader from "./components/FileReader";
import TableDisplay from "./components/TableDisplay";

function App() {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);

  return (
    <div className="m-1">
      <div className="d-flex justify-content-center py-2 rounded-3">
        <div>
          <p className="h5">Choose a CSV File </p>
          <FileReader setData={setData} setHeaders={setHeaders} />
        </div>
      </div>

      <TableDisplay data={data} headers={headers} />
    </div>
  );
}

export default App;
