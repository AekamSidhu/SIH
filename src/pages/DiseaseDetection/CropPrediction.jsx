import { useState } from "react";
import "../DiseaseDetection/CropPrediction.css";

export default function CropPrediction({ activeSection }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log("File selected:", file);   // ✅ debug
            setSelectedFile(file);
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            alert("Please select a file first");
            return;
        }

        console.log("Uploading file:", selectedFile.name); // ✅ debug
        setLoading(true);

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const response = await fetch("http://localhost:8000/predict/", {
                method: "POST",
                body: formData,
            });

            console.log("Response status:", response.status); // ✅ debug

            if (!response.ok) {
                const text = await response.text();
                console.error("Server returned error:", text); // ✅ debug
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log("Response JSON:", data); // ✅ debug
            setResult(data);
        } catch (error) {
            console.error("Upload error:", error); // ✅ debug
            setResult({ error: "Something went wrong!" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="img-container">
                <input type="file" id="fileInput" onChange={handleFileChange} />
                <label htmlFor="fileInput" className="file-upload-btn">
                    <img src="./cam.svg" alt="Upload" />
                </label>
            </div>

            {selectedFile && (
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <p>Selected: {selectedFile.name}</p>
                    <button onClick={handleUpload} className="kv-but">
                        {loading ? "Uploading..." : "Upload"}
                    </button>
                </div>
            )}

            {result && (
                <div className="result-container" style={{ marginTop: "30px", textAlign: "center" }}>
                    <h3>Result:</h3>
                    <pre style={{ background: "#f4f4f4", padding: "1rem", borderRadius: "12px" }}>
            {JSON.stringify(result, null, 2)}
          </pre>
                </div>
            )}
        </div>
    );
}
