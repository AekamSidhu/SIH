import React, { useState, useEffect } from "react";
import {Leaf, Thermometer, Droplets, Sun, Wind, Phone, Upload} from 'lucide-react';
import './CropPrediction.css';
import axios from "axios";
import { GoogleGenAI } from "@google/genai";
import { useTranslation } from "react-i18next";

const ai = new GoogleGenAI({ apiKey: "AIzaSyCAMWZbq1AsDu4qYGH_Gwntio7f9qIljL8" });

async function askGemini(prompt) {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });
    return response.text;
}

export default function CropRecommendationPage() {
    const { t } = useTranslation();
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
    const [showModal, setShowModal] = useState(false);

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

    // Fetch weather data
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

                    setWeatherData({
                        temperature: hourly.temperature_2m[lastIndex],
                        humidity: hourly.relative_humidity_2m[lastIndex],
                        windspeed: hourly.wind_speed_10m[lastIndex],
                        sunshine: "N/A",
                        rainfall: hourly.precipitation ? hourly.precipitation[lastIndex] : "0"
                    });

                    setFormData(prev => ({
                        ...prev,
                        temperature: hourly.temperature_2m[lastIndex],
                        humidity: hourly.relative_humidity_2m[lastIndex],
                        rainfall: hourly.precipitation ? hourly.precipitation[lastIndex] : "0"
                    }));

                } catch (error) {
                    console.error("Error fetching weather:", error);
                }
            }, (err) => console.error("Geolocation error:", err));
        }
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePrediction = async () => {
        for (let key in formData) {
            if (!formData[key]) {
                alert(t("cropRecommendation.fillField", { field: key }));
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

            setSummaryLoading(true);
            const prompt = `${t("cropRecommendation.geminiPrompt", { crop: recommendedCrop, ...formData })}`;
            const geminiResp = await askGemini(prompt);
            setSummary(geminiResp);

            setShowModal(true); // Show modal after prediction
        } catch (error) {
            console.error("Error:", error);
            setPrediction(t("cropRecommendation.error"));
            setShowModal(true);
        } finally {
            setLoading(false);
            setSummaryLoading(false);
        }
    };

    return (
        <div className="crop-disease-page-wrapper">
            {/* Hero */}
            <section className="hero-main-content" style={{ filter: `blur(${blurPx}px)` }}>
                <h1 style={{ opacity: 1 - 0.2 * blurPx }}>{t("cropRecommendation.title")}</h1>
                <h2 style={{ opacity: 1 - 0.2 * blurPx }}>{t("cropRecommendation.subtitle")}</h2>
                <div className="hero-buttons">
                    <button className="hero-btn"><Upload size={20}/> {t('diseasePrediction.hero.start')}</button>
                    <button className="hero-btn"><Phone size={20}/> {t('diseasePrediction.hero.help')}</button>
                </div>
            </section>

            {/* Form */}
            <section className="prediction-section">
                <div className="prediction-content">
                    <div className="section-header">
                        <h2>{t("cropRecommendation.formTitle")}</h2>
                        <h3>{t("cropRecommendation.formSubtitle")}</h3>
                    </div>

                    <div className="prediction-grid">
                        <div className="prediction-form">
                            <div className="form-grid">
                                {["N","P","K","temperature","humidity","ph","rainfall"].map((field) => (
                                    <div key={field} className="form-group">
                                        <label className="form-label">{t(`cropRecommendation.fields.${field}`)}</label>
                                        <input
                                            type="number"
                                            step="any"
                                            name={field}
                                            value={formData[field]}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder={t(`cropRecommendation.fields.${field}`)}
                                        />
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handlePrediction}
                                disabled={loading}
                                className="predict-btn"
                            >
                                {loading ? t("cropRecommendation.loading") : t("cropRecommendation.getRecommendation")}
                            </button>
                        </div>

                        {/* Sidebar */}
                        <div className="sidebar">
                            <div className="weather-card">
                                <h3 className="card-title">{t("cropRecommendation.weatherTitle")}</h3>
                                <div className="weather-item temp"><Thermometer size={20}/> {weatherData.temperature}°C</div>
                                <div className="weather-item humidity"><Droplets size={20}/> {weatherData.humidity}% {t("cropRecommendation.humidity")}</div>
                                <div className="weather-item rainfall"><Droplets size={20}/> {weatherData.rainfall} mm {t("cropRecommendation.rain")}</div>
                                <div className="weather-item sunshine"><Wind size={20}/> {weatherData.windspeed} km/h {t("cropRecommendation.wind")}</div>
                            </div>

                            <div className="actions-card">
                                <h3 className="card-title">{t("cropRecommendation.quickActions")}</h3>
                                <button className="action-btn action-disease">{t("cropRecommendation.diseaseDetection")}</button>
                                <button className="action-btn action-expert">{t("cropRecommendation.expertConsultation")}</button>
                                <button className="action-btn action-market">{t("cropRecommendation.marketInfo")}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modal for prediction results */}
            {showModal && (
                <div className="modal show" onClick={(e) => { if (e.target.className.includes("modal")) setShowModal(false); }}>
                    <div className="modal-content">
                        <span className="close" onClick={() => setShowModal(false)}>&times;</span>
                        {prediction && <h3>{t("cropRecommendation.recommendedCrop")}</h3>}
                        {prediction && <p className="stat-card stat-green">{prediction}</p>}
                        {summaryLoading && <p>{t("cropRecommendation.generatingExplanation")}</p>}
                        {summary && (
                            <div className="summary-box">
                                <h4>{t("cropRecommendation.whyThisCrop")}</h4>
                                <p>{summary}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
