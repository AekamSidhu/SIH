import React, { useState, useEffect } from "react";
import axios from 'axios';
import {
    Leaf, Upload, MapPin, Calendar,
    Thermometer, Droplets, Sun, Wind, Phone
} from 'lucide-react';
import './DiseasePrediction.css';
import { GoogleGenAI } from "@google/genai";
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n.js';
const ai = new GoogleGenAI({ apiKey: "AIzaSyCAMWZbq1AsDu4qYGH_Gwntio7f9qIljL8" });

async function askGemini(prompt, lang = "en") {
    let finalPrompt = prompt;

    if (lang === "ml") {
        finalPrompt += " [ഉത്തരം മലയാളത്തിൽ നൽകുക]";
    } else if (lang === "hi") {
        finalPrompt += " [उत्तर हिंदी में दें]";
    } // English is default, no change

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: finalPrompt,
    });

    return response.text;
}

export default function CropDiseasePredictionPage() {
    const { t } = useTranslation();

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

                    setWeatherData({ temperature, humidity, windspeed, sunshine: "N/A", rainfall });
                } catch (error) {
                    console.error("Error fetching weather:", error);
                }
            }, (err) => {
                console.error("Geolocation error:", err);
            });
        }
    }, []);

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
            alert(t('diseasePrediction.form.fillField', { field: t('diseasePrediction.form.upload') }));
            return;
        }

        setLoading(true);
        setSummary(null);

        const formData = new FormData();
        formData.append("file", imageFile);

        try {
            const response = await fetch("http://localhost:8000/predict_disease/", { method: "POST", body: formData });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            const confidenceValue = normaliseConfidence(data.confidence);

            const pred = {
                disease: data.predicted_class || t('diseasePrediction.form.unknown'),
                confidence: confidenceValue,
                severity: determineSeverity(confidenceValue),
                affectedPart: plantPart || t('diseasePrediction.form.general'),
                precautions: generatePrecautions(data.predicted_class || ""),
                recommendations: generateRecommendations(data.predicted_class || "")
            };

            setPrediction(pred);

            setSummaryLoading(true);
            const prompt = `Summarize in 3-4 sentences: Explain what the disease "${pred.disease}" is,
its typical impact on ${selectedCrop || t('diseasePrediction.form.general')}, and give a short actionable tip please note i dont have much technical knowledge based on ${symptoms}.`;

            const geminiResp = await askGemini(prompt,i18n.language);
            setSummary(geminiResp);

        } catch (error) {
            console.error('Error:', error);
            setPrediction({ error: t('diseasePrediction.form.error'), disease: t('diseasePrediction.form.unknown'), confidence: "0%", severity: t('diseasePrediction.severity.unknown'), affectedPart: plantPart || t('diseasePrediction.form.general'), precautions: [], recommendations: [] });
        } finally {
            setLoading(false);
            setSummaryLoading(false);
        }
    };

    const normaliseConfidence = (conf) => {
        if (!conf) return "0%";
        const n = parseFloat(conf.toString().replace("%",""));
        return isNaN(n) ? "0%" : `${n}%`;
    };

    const determineSeverity = (confidence) => {
        const n = parseFloat(confidence.replace("%","") || "0");
        if (isNaN(n)) return t('diseasePrediction.severity.unknown');
        if (n > 85) return t('diseasePrediction.severity.high');
        if (n > 60) return t('diseasePrediction.severity.moderate');
        return t('diseasePrediction.severity.low');
    };

    const generatePrecautions = (disease) => {
        const common = [
            t('diseasePrediction.precautions.precaution1'),
            t('diseasePrediction.precautions.precaution2'),
            t('diseasePrediction.precautions.precaution3')
        ];
        return disease.toLowerCase().includes("blight")
            ? [...common, t('diseasePrediction.precautions.precaution4'), t('diseasePrediction.precautions.precaution5')]
            : common;
    };

    const generateRecommendations = (disease) => {
        const common = [
            t('diseasePrediction.recommendations.recommendation1'),
            t('diseasePrediction.recommendations.recommendation2'),
            t('diseasePrediction.recommendations.recommendation3')
        ];
        return disease.toLowerCase().includes("rust")
            ? [...common, t('diseasePrediction.recommendations.recommendation4'), t('diseasePrediction.recommendations.recommendation5')]
            : common;
    };

    return (
        <div className="crop-disease-page-wrapper">
            <section className="hero-main-content" style={{ filter: `blur(${blurPx}px)` }}>
                <h1 style={{ opacity: 1 - 0.2 * blurPx }}>{t('diseasePrediction.hero.title')}</h1>
                <h2 style={{ opacity: 1 - 0.2 * blurPx }}>{t('diseasePrediction.hero.subtitle')}</h2>
                <div className="hero-buttons">
                    <button className="hero-btn"><Upload size={20}/> {t('diseasePrediction.hero.start')}</button>
                    <button className="hero-btn"><Phone size={20}/> {t('diseasePrediction.hero.help')}</button>
                </div>
            </section>

            <section className="prediction-section">
                <div className="prediction-content">
                    <div className="section-header">
                        <h2>{t('diseasePrediction.form.title')}</h2>
                        <h3>{t('diseasePrediction.form.subtitle')}</h3>
                    </div>

                    <div className="prediction-grid">
                        <div className="prediction-form">
                            <h3 className="form-title">{t('diseasePrediction.form.enterDetails')}</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label"><Leaf size={16}/> {t('diseasePrediction.form.crop')}</label>
                                    <select value={selectedCrop} onChange={e => setSelectedCrop(e.target.value)} className="form-input">
                                        <option value="">{t('diseasePrediction.form.chooseCrop')}</option>
                                        {crops.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t('diseasePrediction.form.part')}</label>
                                    <select value={plantPart} onChange={e => setPlantPart(e.target.value)} className="form-input">
                                        <option value="">{t('diseasePrediction.form.selectPart')}</option>
                                        {plantParts.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t('diseasePrediction.form.symptoms')}</label>
                                    <input type="text" value={symptoms} onChange={e => setSymptoms(e.target.value)} placeholder={t('diseasePrediction.form.symptomsPlaceholder')} className="form-input"/>
                                </div>
                            </div>

                            <div className="upload-section">
                                <label className="form-label"><Upload size={16}/> {t('diseasePrediction.form.upload')}</label>
                                <div className="upload-area">
                                    <input type="file" accept="image/*" onChange={handleImageUpload} id="image-upload"/>
                                    {!preview ? (
                                        <label htmlFor="image-upload">
                                            <div className="upload-icon"><Upload size={48} color="#9ca3af"/></div>
                                            <p className="upload-text">{t('diseasePrediction.form.clickUpload')}</p>
                                            <p className="upload-subtext">{t('diseasePrediction.form.fileTypes')}</p>
                                        </label>
                                    ) : (
                                        <div>
                                            <img src={preview} alt="Preview" style={{ width:'100%', height:'200px', objectFit:'cover', borderRadius:'12px', marginBottom:'10px', cursor:'pointer' }} onClick={() => document.getElementById('image-upload').click()}/>
                                            <p className="uploaded-file">{imageFile?.name} - {t('diseasePrediction.form.clickChange')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {prediction?.error && (
                                <div className="error-box">{prediction.error}</div>
                            )}

                            <button onClick={handlePrediction} disabled={loading || summaryLoading} className="predict-btn">
                                {loading ? t('cropRecommendation.loading') : t('diseasePrediction.form.analyze')}
                            </button>
                        </div>

                        <div className="sidebar">
                            <div className="weather-card">
                                <h3 className="card-title">{t('diseasePrediction.weather.title')}</h3>
                                <div className="weather-item temp"><Thermometer size={20}/> {weatherData.temperature}°C</div>
                                <div className="weather-item humidity"><Droplets size={20}/> {weatherData.humidity}% {t('diseasePrediction.weather.humidity')}</div>
                                <div className="weather-item rainfall"><Droplets size={20}/> {weatherData.rainfall} mm {t('diseasePrediction.weather.rainfall')}</div>
                                <div className="weather-item sunshine"><Wind size={20}/> {weatherData.windspeed} km/h {t('diseasePrediction.weather.wind')}</div>
                            </div>
                            <div className="actions-card">
                                <h3 className="card-title">{t('cropRecommendation.quickActions')}</h3>
                                <button className="action-btn action-disease">{t('cropRecommendation.diseaseDetection')}</button>
                                <button className="action-btn action-expert">{t('cropRecommendation.expertConsultation')}</button>
                                <button className="action-btn action-market">{t('cropRecommendation.marketInfo')}</button>
                            </div>
                            <div className="help-card">
                                <h3 className="help-title">{t('diseasePrediction.hero.help')}</h3>
                                <p className="help-text">{t('home.subtitle')}</p>
                                <button className="help-btn">{t('home.chat')}</button>
                            </div>
                        </div>
                    </div>

                    {prediction && !prediction.error && (
                        <div className="results-section">
                            <div className="results-card">
                                <h3 className="form-title">{t('diseasePrediction.results.disease')}</h3>
                                <div className="results-stats">
                                    <div className="stat-card stat-green">
                                        <div>{prediction.disease}</div>
                                        <div>{t('diseasePrediction.results.disease')}</div>
                                    </div>
                                    <div className="stat-card stat-blue">
                                        <div>{prediction.confidence}</div>
                                        <div>{t('diseasePrediction.results.confidence')}</div>
                                    </div>
                                    <div className="stat-card stat-orange">
                                        <div>{prediction.severity}</div>
                                        <div>{t('diseasePrediction.results.severity')}</div>
                                    </div>
                                </div>

                                {summaryLoading && <p>{t('diseasePrediction.summary.generating')}</p>}
                                {summary && (
                                    <div className="summary-box">
                                        <h4>{t('diseasePrediction.summary.title')}</h4>
                                        <p>{summary}</p>
                                    </div>
                                )}

                                <div className="results-details">
                                    <div className="details-section">
                                        <h4>{t('diseasePrediction.results.precautions')}</h4>
                                        {(prediction.precautions || []).map((p,i) => <div key={i} className="detail-item risk-item">{p}</div>)}
                                    </div>
                                    <div className="details-section">
                                        <h4>{t('diseasePrediction.results.recommendations')}</h4>
                                        {(prediction.recommendations || []).map((r,i) => <div key={i} className="detail-item recommendation-item">{r}</div>)}
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
