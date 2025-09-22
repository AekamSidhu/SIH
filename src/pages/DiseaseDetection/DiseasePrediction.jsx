import React, { useState, useEffect } from "react";
import { Leaf, Upload, MapPin, Calendar, Thermometer, Droplets, Sun, Wind, Phone } from 'lucide-react';
import './DiseasePrediction.css';

export default function CropDiseasePredictionPage() {
  const [blurPx, setBlurPx] = useState(0);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [plantPart, setPlantPart] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const crops = ['Rice', 'Wheat', 'Maize', 'Sugarcane', 'Cotton', 'Pulses', 'Vegetables', 'Fruits'];
  const plantParts = ['Leaves', 'Stem', 'Root', 'Fruit', 'Flowers', 'Whole Plant'];

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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPrediction(null);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handlePrediction = async () => {
    if (!imageFile) {
      alert('Please select an image first');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", imageFile);

    try {
      const response = await fetch("http://localhost:8000/predict/", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      // Format the API response to match our UI structure
      setPrediction({
        disease: data.predicted_class || "Unknown Disease",
        confidence: data.confidence || "N/A",
        severity: determineSeverity(data.confidence),
        affectedPart: plantPart || "General",
        precautions: generatePrecautions(data.predicted_class),
        recommendations: generateRecommendations(data.predicted_class)
      });
    } catch (error) {
      console.error('Error:', error);
      setPrediction({
        error: "Something went wrong! Please check your connection and try again.",
        disease: "Analysis Failed",
        confidence: "0%",
        severity: "Unknown",
        affectedPart: plantPart || "General"
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to process API response
  const determineSeverity = (confidence) => {
    if (!confidence) return "Unknown";
    const conf = parseFloat(confidence.replace('%', ''));
    if (conf > 85) return "High";
    if (conf > 60) return "Moderate";
    return "Low";
  };

  const generatePrecautions = (disease) => {
    const commonPrecautions = [
      "Remove affected leaves immediately",
      "Apply recommended fungicide",
      "Improve air circulation around plants"
    ];
    
    if (disease && disease.toLowerCase().includes('blight')) {
      return [
        ...commonPrecautions,
        "Apply copper-based fungicide spray",
        "Reduce irrigation frequency"
      ];
    }
    
    return commonPrecautions;
  };

  const generateRecommendations = (disease) => {
    const commonRecommendations = [
      "Monitor neighboring plants",
      "Use disease-resistant crop variety next season",
      "Maintain proper spacing for airflow"
    ];
    
    if (disease && disease.toLowerCase().includes('rust')) {
      return [
        ...commonRecommendations,
        "Apply preventive treatments during high-risk periods",
        "Remove alternate host plants nearby"
      ];
    }
    
    return commonRecommendations;
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
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover',
                          borderRadius: '12px',
                          marginBottom: '10px',
                          cursor: 'pointer'
                        }}
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
                <div style={{
                  color: '#dc2626',
                  background: '#fef2f2',
                  padding: '16px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  border: '1px solid #fecaca'
                }}>
                  {prediction.error}
                </div>
              )}

              <button onClick={handlePrediction} disabled={loading} className="predict-btn">
                {loading ? "Analyzing..." : "Detect Disease"}
              </button>
            </div>

            {/* Sidebar */}
            <div className="sidebar">
              <div className="weather-card">
                <h3 className="card-title">Weather Info</h3>
                <div className="weather-item temp"><Thermometer size={20}/> 28°C</div>
                <div className="weather-item humidity"><Droplets size={20}/> 65% Humidity</div>
                <div className="weather-item rainfall"><Wind size={20}/> 10mm Rainfall</div>
                <div className="weather-item sunshine"><Sun size={20}/> 6h Sunlight</div>
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
                <div className="results-details">
                  <div className="details-section">
                    <h4>Immediate Actions</h4>
                    {prediction.precautions.map((p,i) => (
                      <div key={i} className="detail-item risk-item">{p}</div>
                    ))}
                  </div>
                  <div className="details-section">
                    <h4>Recommendations</h4>
                    {prediction.recommendations.map((r,i) => (
                      <div key={i} className="detail-item recommendation-item">{r}</div>
                    ))}
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