import React, { useState, useEffect } from "react";
import axios from 'axios';
import {
    Leaf, Upload, MapPin, Calendar,
    Thermometer, Droplets, Sun, Wind, Phone
} from 'lucide-react';
import './DiseasePrediction.css';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "AIzaSyCAMWZbq1AsDu4qYGH_Gwntio7f9qIljL8" });

// ---- Gemini helper ----
async function askGemini(prompt) {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });
    return response.text;
}

export default function CropDiseasePredictionPage() {
    const [blurPx, setBlurPx] = useState(0);
    const [selectedCrop, setSelectedCrop] = useState('');
    const [plantPart, setPlantPart] = useState('');
    const [symptoms, setSymptoms] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [summaryLoading, setSummaryLoading] = useState(false);

    const crops = ['Rice', 'Wheat', 'Maize', 'Sugarcane', 'Cotton', 'Pulses', 'Vegetables', 'Fruits'];
    const plantParts = ['Leaves', 'Stem', 'Root', 'Fruit', 'Flowers', 'Whole Plant'];
    const [weatherData, setWeatherData] = useState({
        temperature: "N/A",
        humidity: "N/A",
        windspeed: "N/A",
        sunshine: "N/A",
        rainfall: "N/A"
    });
    // Handle scroll blur effect
    useEffect(() => {
        const handleScroll = () => {
            const y = window.scrollY;
            const maxScroll = 400;
            const maxBlur = 8;
            setBlurPx(Math.min((y / maxScroll) * maxBlur, maxBlur));
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await axios.get(
                        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation`
                    );
                    const hourly = response.data.hourly;
                    const lastIndex = hourly.time.length - 1;

                    const temperature = hourly.temperature_2m[lastIndex];
                    const humidity = hourly.relative_humidity_2m[lastIndex];
                    const windspeed = hourly.wind_speed_10m[lastIndex];
                    const rainfall = hourly.precipitation ? hourly.precipitation[lastIndex] : "0";

                    setWeatherData({
                        temperature,
                        humidity,
                        windspeed,
                        sunshine: "N/A",
                        rainfall
                    });


                } catch (error) {
                    console.error("Error fetching weather:", error);
                }
            }, (err) => {
                console.error("Geolocation error:", err);
            });
        }
    }, []);
    // Revoke preview URL to prevent memory leaks
    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPrediction(null);
            setSummary(null);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handlePrediction = async () => {
        if (!imageFile) {
            alert('Please select an image first');
            return;
        }

        setLoading(true);
        setSummary(null);

        const formData = new FormData();
        formData.append("file", imageFile);

        try {
            const response = await fetch("http://localhost:8000/predict/", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();

            const confidenceValue = normaliseConfidence(data.confidence);

            const pred = {
                disease: data.predicted_class || "Unknown Disease",
                confidence: confidenceValue,
                severity: determineSeverity(confidenceValue),
                affectedPart: plantPart || "General",
                precautions: generatePrecautions(data.predicted_class || ""),
                recommendations: generateRecommendations(data.predicted_class || "")
            };

            setPrediction(pred);

            // ---- call Gemini for summary ----
            setSummaryLoading(true);
            const prompt = `Summarize in 3-4 sentences: Explain what the disease "${pred.disease}" is,
its typical impact on ${selectedCrop || 'the crop'}, and give a short actionable tip please note i dont have much technical knowledge based on ${symptoms}.`;
            const geminiResp = await askGemini(prompt);
            setSummary(geminiResp);

        } catch (error) {
            console.error('Error:', error);
            setPrediction({
                error: "Something went wrong! Please check your connection and try again.",
                disease: "Analysis Failed",
                confidence: "0%",
                severity: "Unknown",
                affectedPart: plantPart || "General",
                precautions: [],
                recommendations: []
            });
        } finally {
            setLoading(false);
            setSummaryLoading(false);
        }
    };

    // --- helpers ---
    const normaliseConfidence = (conf) => {
        if (conf === null || conf === undefined) return "0%";
        if (typeof conf === "number") return `${conf.toFixed(1)}%`;
        if (typeof conf === "string" && conf.includes("%")) return conf;
        const n = parseFloat(conf);
        return isNaN(n) ? "0%" : `${n}%`;
    };

    const determineSeverity = (confidence) => {
        const n = parseFloat((confidence || "0").replace("%", ""));
        if (isNaN(n)) return "Unknown";
        if (n > 85) return "High";
        if (n > 60) return "Moderate";
        return "Low";
    };

    const generatePrecautions = (disease) => {
        const common = [
            "Remove affected leaves immediately",
            "Apply recommended fungicide",
            "Improve air circulation around plants"
        ];
        return (disease.toLowerCase().includes("blight"))
            ? [...common, "Apply copper-based fungicide spray", "Reduce irrigation frequency"]
            : common;
    };

    const generateRecommendations = (disease) => {
        const common = [
            "Monitor neighboring plants",
            "Use disease-resistant crop variety next season",
            "Maintain proper spacing for airflow"
        ];
        return (disease.toLowerCase().includes("rust"))
            ? [...common, "Apply preventive treatments during high-risk periods", "Remove alternate host plants nearby"]
            : common;
    };

    return (
        <div className="crop-disease-page-wrapper">
            {/* Hero */}
            <section className="hero-main-content" style={{ filter: `blur(${blurPx}px)` }}>
                <h1 style={{ opacity: 1 - 0.2 * blurPx }}>Crop Disease Prediction</h1>
                <h2 style={{ opacity: 1 - 0.2 * blurPx }}>Detect crop diseases early using AI-powered insights</h2>
                <div className="hero-buttons">
                    <button className="hero-btn"><Upload size={20}/> Start Analysis</button>
                    <button className="hero-btn"><Phone size={20}/> Get Expert Help</button>
                </div>
            </section>

            {/* Prediction Form */}
            <section className="prediction-section">
                <div className="prediction-content">
                    <div className="section-header">
                        <h2>Crop Disease Analysis</h2>
                        <h3>Upload crop image for AI-based disease detection</h3>
                    </div>

                    <div className="prediction-grid">
                        <div className="prediction-form">
                            <h3 className="form-title">Enter Crop Details</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label"><Leaf size={16}/> Select Crop</label>
                                    <select value={selectedCrop} onChange={e => setSelectedCrop(e.target.value)} className="form-input">
                                        <option value="">Choose crop</option>
                                        {crops.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Affected Plant Part</label>
                                    <select value={plantPart} onChange={e => setPlantPart(e.target.value)} className="form-input">
                                        <option value="">Select part</option>
                                        {plantParts.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Symptoms</label>
                                    <input type="text" value={symptoms} onChange={e => setSymptoms(e.target.value)} placeholder="Describe symptoms" className="form-input"/>
                                </div>
                            </div>

                            <div className="upload-section">
                                <label className="form-label"><Upload size={16}/> Upload Crop Image (Required)</label>
                                <div className="upload-area">
                                    <input type="file" accept="image/*" onChange={handleImageUpload} id="image-upload"/>
                                    {!preview ? (
                                        <label htmlFor="image-upload">
                                            <div className="upload-icon"><Upload size={48} color="#9ca3af"/></div>
                                            <p className="upload-text">Click to upload or drag and drop</p>
                                            <p className="upload-subtext">PNG, JPG up to 10MB</p>
                                        </label>
                                    ) : (
                                        <div>
                                            <img
                                                src={preview}
                                                alt="Preview"
                                                style={{ width:'100%', height:'200px', objectFit:'cover',
                                                    borderRadius:'12px', marginBottom:'10px', cursor:'pointer' }}
                                                onClick={() => document.getElementById('image-upload').click()}
                                            />
                                            <p className="uploaded-file">
                                                {imageFile?.name} - Click to change
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {prediction?.error && (
                                <div className="error-box">{prediction.error}</div>
                            )}

                            <button onClick={handlePrediction} disabled={loading || summaryLoading} className="predict-btn">
                                {loading ? "Analyzing..." : "Detect Disease"}
                            </button>
                        </div>

                        {/* Sidebar */}
                        <div className="sidebar">
                            <div className="weather-card">
                                <h3 className="card-title">Current Weather</h3>
                                <div className="weather-item temp"><Thermometer size={20}/> {weatherData.temperature}°C</div>
                                <div className="weather-item humidity"><Droplets size={20}/> {weatherData.humidity}% Humidity</div>
                                <div className="weather-item rainfall"><Droplets size={20}/> {weatherData.rainfall} mm Rain</div>
                                <div className="weather-item sunshine"><Wind size={20}/> {weatherData.windspeed} km/h Wind</div>
                            </div>
                            <div className="actions-card">
                                <h3 className="card-title">Quick Actions</h3>
                                <button className="action-btn action-disease">Disease Detection</button>
                                <button className="action-btn action-expert">Expert Consultation</button>
                                <button className="action-btn action-market">Market Info</button>
                            </div>
                            <div className="help-card">
                                <h3 className="help-title">Need Help?</h3>
                                <p className="help-text">Our agricultural experts are ready to assist you 24/7</p>
                                <button className="help-btn">Chat with Expert</button>
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    {prediction && !prediction.error && (
                        <div className="results-section">
                            <div className="results-card">
                                <h3 className="form-title">AI Prediction Results</h3>
                                <div className="results-stats">
                                    <div className="stat-card stat-green">
                                        <div>{prediction.disease}</div>
                                        <div>Disease</div>
                                    </div>
                                    <div className="stat-card stat-blue">
                                        <div>{prediction.confidence}</div>
                                        <div>Confidence</div>
                                    </div>
                                    <div className="stat-card stat-orange">
                                        <div>{prediction.severity}</div>
                                        <div>Severity</div>
                                    </div>
                                </div>

                                {/* Gemini Summary */}
                                {summaryLoading && <p>Generating summary…</p>}
                                {summary && (
                                    <div className="summary-box">
                                        <h4>About The Disease</h4>
                                        <p>{summary}</p>
                                    </div>
                                )}

                                <div className="results-details">
                                    <div className="details-section">
                                        <h4>Immediate Actions</h4>
                                        {(prediction.precautions || []).map((p,i) =>
                                            <div key={i} className="detail-item risk-item">{p}</div>
                                        )}
                                    </div>
                                    <div className="details-section">
                                        <h4>Recommendations</h4>
                                        {(prediction.recommendations || []).map((r,i) =>
                                            <div key={i} className="detail-item recommendation-item">{r}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
