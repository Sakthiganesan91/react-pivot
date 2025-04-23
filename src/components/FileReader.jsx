import Papa from "papaparse";

export default function FileReader({ setData, setHeaders }) {
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Ensure it's a CSV
    if (file.type !== "text/csv") {
      alert("Please upload a valid CSV file.");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,

      complete: (results) => {
        const data = results.data;
        const headers = results.meta.fields;

        setData(data);
        setHeaders(headers);
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
      },
    });
  };

  return (
    <div>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="form-control "
      />
    </div>
  );
}
