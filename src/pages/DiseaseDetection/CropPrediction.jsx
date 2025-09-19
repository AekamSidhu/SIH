import { useState } from "react";
import "../DiseaseDetection/CropPrediction.css";

export default function CropPrediction() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setResult(null);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            alert("Please select a file first");
            return;
        }
        setLoading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const response = await fetch("http://localhost:8000/predict/", {
                method: "POST",
                body: formData,
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            setResult(data);
        } catch {
            setResult({ error: "Something went wrong!" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="crop-container">
            {/* Left: White window with image preview */}
            <div className="left-pane">
                <div className="white-window">
                    <input
                        type="file"
                        id="fileInput"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden-input"
                    />

                    {!preview ? (
                        <label htmlFor="fileInput" className="upload-trigger">
                            <img src="./cam.svg" alt="Upload" className="camera-icon" />
                            <p>Click to choose an image</p>
                        </label>
                    ) : (
                        <img
                            src={preview}
                            alt="Preview"
                            className="full-preview"
                            onClick={() => document.getElementById("fileInput").click()}
                        />
                    )}
                </div>

                {selectedFile && (
                    <button
                        onClick={handleUpload}
                        className="predict-btn"
                        disabled={loading}
                    >
                        {loading ? "Predicting…" : "Predict"}
                    </button>
                )}
            </div>

            {/* Right: Stats */}
            <div className="right-pane">
                {result ? (
                    <div className="stats-card">
                        <h2 className="stat-title">Prediction</h2>
                        <p className="stat-item">
                            <strong>Class:</strong> {result.predicted_class}
                        </p>
                        <p className="stat-item">
                            <strong>Confidence:</strong> {result.confidence}
                        </p>
                    </div>
                ) : (
                    <p className="placeholder-text">
                        Upload an image to view prediction details.
                    </p>
                )}
            </div>
        </div>
    );
}
