import React, { useState, useEffect } from "react";
import { Leaf, Thermometer, Droplets, Sun, Wind, Phone } from 'lucide-react';
import './CropPrediction.css';
import axios from "axios";
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

export default function CropRecommendationPage() {
    const [blurPx, setBlurPx] = useState(0);
    const [formData, setFormData] = useState({
        N: "", P: "", K: "",
        temperature: "", humidity: "",
        ph: "", rainfall: ""
    });
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState(null);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [weatherData, setWeatherData] = useState({
        temperature: "N/A",
        humidity: "N/A",
        windspeed: "N/A",
        sunshine: "N/A",
        rainfall: "N/A"
    });

    // Blur effect on scroll
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

    // Fetch weather data based on user's location
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

                    setFormData(prev => ({
                        ...prev,
                        temperature,
                        humidity,
                        rainfall
                    }));

                } catch (error) {
                    console.error("Error fetching weather:", error);
                }
            }, (err) => {
                console.error("Geolocation error:", err);
            });
        }
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePrediction = async () => {
        for (let key in formData) {
            if (!formData[key]) {
                alert(`Please fill ${key}`);
                return;
            }
        }

        setLoading(true);
        setPrediction(null);
        setSummary(null);

        try {
            const response = await axios.post("http://localhost:8000/predict_crop", {
                N: parseFloat(formData.N),
                P: parseFloat(formData.P),
                K: parseFloat(formData.K),
                temperature: parseFloat(formData.temperature),
                humidity: parseFloat(formData.humidity),
                ph: parseFloat(formData.ph),
                rainfall: parseFloat(formData.rainfall)
            });

            const recommendedCrop = response.data.recommended_crop;
            setPrediction(recommendedCrop);

            // Generate Gemini summary explaining relevance
            setSummaryLoading(true);
            const prompt = `Explain why "${recommendedCrop}" is the best crop choice based on these soil and weather conditions: 
            N=${formData.N}, P=${formData.P}, K=${formData.K}, temperature=${formData.temperature}°C, humidity=${formData.humidity}%, 
            ph=${formData.ph}, rainfall=${formData.rainfall}mm. Explain in simple terms for a farmer why this recommendation makes sense and make the answer short 100-150 words.`;
            const geminiResp = await askGemini(prompt);
            setSummary(geminiResp);

        } catch (error) {
            console.error("Error:", error);
            setPrediction("Prediction failed. Please try again.");
        } finally {
            setLoading(false);
            setSummaryLoading(false);
        }
    };

    return (
        <div className="crop-disease-page-wrapper">
            {/* Hero */}
            <section className="hero-main-content" style={{ filter: `blur(${blurPx}px)` }}>
                <h1 style={{ opacity: 1 - 0.2 * blurPx }}>Crop Recommendation</h1>
                <h2 style={{ opacity: 1 - 0.2 * blurPx }}>Find the best crop for your farm based on soil & weather</h2>
            </section>

            {/* Form */}
            <section className="prediction-section">
                <div className="prediction-content">
                    <div className="section-header">
                        <h2>Crop Recommendation Form</h2>
                        <h3>Enter your soil and environmental parameters</h3>
                    </div>

                    <div className="prediction-grid">
                        <div className="prediction-form">
                            <div className="form-grid">
                                {["N","P","K","temperature","humidity","ph","rainfall"].map((field) => (
                                    <div key={field} className="form-group">
                                        <label className="form-label">{field}</label>
                                        <input
                                            type="number"
                                            step="any"
                                            name={field}
                                            value={formData[field]}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder={`Enter ${field}`}
                                        />
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handlePrediction}
                                disabled={loading}
                                className="predict-btn"
                            >
                                {loading ? "Calculating..." : "Get Recommendation"}
                            </button>

                            {prediction && (
                                <div className="results-section">
                                    <div className="results-card">
                                        <h3 className="form-title">Recommended Crop</h3>
                                        <div className="results-stats">
                                            <div className="stat-card stat-green">
                                                {prediction}
                                            </div>
                                        </div>

                                        {summaryLoading && <p>Generating explanation…</p>}
                                        {summary && (
                                            <div className="summary-box">
                                                <h4>Why this crop?</h4>
                                                <p>{summary}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
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

                            {/* Quick Actions */}
                            <div className="actions-card">
                                <h3 className="card-title">Quick Actions</h3>
                                <button className="action-btn action-disease">Disease Detection</button>
                                <button className="action-btn action-expert">Expert Consultation</button>
                                <button className="action-btn action-market">Market Info</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
