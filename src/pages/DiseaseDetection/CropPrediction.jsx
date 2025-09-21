import { useState, useEffect } from "react";
import "../DiseaseDetection/CropPrediction.css";
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({apiKey: "AIzaSyCAMWZbq1AsDu4qYGH_Gwntio7f9qIljL8"});

async function askgemini({input}) {

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Give A Quick Short 100-150 words But To The Point Summary About The Following Crop Disease ${input} And About It's Seriousness What Actions To Be Taken`,
    });
    return response.text;
}


export default function CropPrediction() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false); // NEW
    const [res,setres] = useState("");


    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setResult(null);
            setPreview(URL.createObjectURL(file));
        }
    };

    // Automatically upload as soon as a file is selected
    useEffect(() => {
        if (!selectedFile) return;

        const uploadImage = async () => {
            setLoading(true);
            setAnalyzing(true); // start analyzing animation immediately
            const formData = new FormData();
            formData.append("file", selectedFile);

            try {
                const response = await fetch("http://localhost:8000/predict/", {
                    method: "POST",
                    body: formData,
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                const rep = await askgemini({input:data.predicted_class});
                await setres(rep);

                // delay 2–3 seconds before showing result
                setTimeout(() => {
                    setResult(data);
                    setAnalyzing(false);
                }, 2500);
            } catch {
                setTimeout(() => {
                    setResult({ error: "Something went wrong!" });
                    setAnalyzing(false);
                }, 0);
            } finally {
                setLoading(false);
            }
        };

        uploadImage();
    }, [selectedFile]);

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

                    {loading && (
                        <p className="upload-status">Uploading…</p>
                    )}
                </div>
            </div>

            {/* Right: Stats */}
            <div className={'right'}>
            <div className="right-pane">
                {analyzing && (
                    <div className="analyzing-box">
                        <div className="spinner" />
                        <p>Analyzing image…</p>
                    </div>
                )}

                {!analyzing && result && (
                    <div className="stats-card">
                        <h2 className="stat-title">Results</h2>
                        {result.error ? (
                            <p className="stat-item error">{result.error}</p>
                        ) : (
                            <>
                                <p className="stat-item">
                                    <h2>Disease Class: {result.predicted_class}</h2>
                                </p>
                                <p className="stat-item">
                                    <h2>Confidence: {result.confidence}</h2>
                                </p>
                                <p className="stat-item">
                                    {res?(
                                        <>
                                        <h2>About The Disease:</h2>
                                            <div className="dinfo">
                                        <p className={'disease'}>{res}</p>
                                            </div>
                                        </>
                                    ):(
                                        <h2>About The Disease:</h2>
                                    )}
                                </p>
                            </>
                        )}
                    </div>
                )}

                {!analyzing && !result && !loading && (
                    <p className="placeholder-text">
                        Upload an image to view prediction details.
                    </p>
                )}
            </div>
        </div>
        </div>
    );
}
