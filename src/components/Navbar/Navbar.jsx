import React, { useState } from 'react';
import { Phone, Menu, X, Leaf } from 'lucide-react';
import './Navbar.css';
import LanguageToggle from "../Lang/LanguageToggle";
import axios from 'axios';

const Navbar = ({ activeSection, navigateToSection, isScrolled, isMenuOpen, setIsMenuOpen }) => {
    const [expertInfo, setExpertInfo] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Fetch nearest expert using navigator.geolocation
    const handleEmergencyClick = async () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        setLoading(true);

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;

            try {
                // Reverse geocode to get city
                const geoResponse = await axios.get('https://nominatim.openstreetmap.org/reverse', {
                    params: {
                        lat: latitude,
                        lon: longitude,
                        format: 'json'
                    },
                    headers: {
                        'Accept-Language': 'en',
                        'User-Agent': 'KrishiVaaniApp/1.0'
                    }
                });

                const address = geoResponse.data.address;
                const city = address.city || address.town || address.village || address.county || "Unknown";

                // Call your FastAPI endpoint with city
                const response = await axios.get('http://127.0.0.1:8001/recommend_experts', {
                    params: {
                        location: city,
                        limit: 1
                    }
                });

                setExpertInfo(response.data[0]);
                setIsModalOpen(true);
            } catch (err) {
                console.error(err);
                alert("Failed to fetch expert information.");
            } finally {
                setLoading(false);
            }
        }, (err) => {
            alert("Unable to retrieve your location.");
            setLoading(false);
        });
    };

    return (
        <>
            <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
                <div className="nav-container">
                    <div className="nav-brand" onClick={() => navigateToSection('home')}>
                        <div className="logo">
                            <LanguageToggle />
                            <div className="logo-icon">
                                <Leaf className="w-8 h-8" />
                            </div>
                            <div className="logo-text">
                                <span className="brand-name">Krishi Vaani</span>
                                <span className="brand-tagline">कृषि वाणी</span>
                            </div>
                        </div>
                    </div>

                    <div className="nav-menu">
                        <button className={`nav-link ${activeSection === 'home' ? 'active' : ''}`} onClick={() => navigateToSection('home')}>Home</button>
                        <button className={`nav-link ${activeSection === 'crop-prediction' ? 'active' : ''}`} onClick={() => navigateToSection('crop-prediction')}>Crop Prediction</button>
                        <button className={`nav-link ${activeSection === 'disease-detection' ? 'active' : ''}`} onClick={() => navigateToSection('disease-detection')}>Disease Detection</button>
                        <button className={`nav-link ${activeSection === 'chatbot' ? 'active' : ''}`} onClick={() => navigateToSection('chatbot')}>Expert Chat</button>
                    </div>

                    <div className="nav-actions">
                        <button className="emergency-btn" onClick={handleEmergencyClick}>
                            <Phone className="w-4 h-4" />
                            {loading ? "Loading..." : "Emergency: 1800-180-1551"}
                        </button>
                    </div>

                    <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="mobile-menu">
                    <button onClick={() => navigateToSection('home')}>Home</button>
                    <button onClick={() => navigateToSection('crop-prediction')}>Crop Prediction</button>
                    <button onClick={() => navigateToSection('disease-detection')}>Disease Detection</button>
                    <button onClick={() => navigateToSection('chatbot')}>Expert Chat</button>
                </div>
            )}

            {/* Emergency Modal */}
            {isModalOpen && expertInfo && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2>Nearest Agricultural Expert</h2>
                        <p><strong>Name:</strong> {expertInfo.name}</p>
                        <p><strong>Address:</strong> {expertInfo.address}</p>
                        {expertInfo.phone && <p><strong>Phone:</strong> {expertInfo.phone}</p>}
                        {expertInfo.email && <p><strong>Email:</strong> {expertInfo.email}</p>}
                        {expertInfo.specialization && <p><strong>Specialization:</strong> {expertInfo.specialization}</p>}
                        <button onClick={() => setIsModalOpen(false)}>Close</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
