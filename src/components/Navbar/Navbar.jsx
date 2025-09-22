import React from 'react';
import { Phone, Menu, X, Leaf } from 'lucide-react';
import './Navbar.css';
import LanguageToggle from "../Lang/LanguageToggle";

const Navbar = ({ activeSection, navigateToSection, isScrolled, isMenuOpen, setIsMenuOpen }) => {
  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="nav-brand" onClick={() => navigateToSection('home')}>
            <div className="logo">
              <div className="logo-icon">
                <Leaf className="w-8 h-8" />
              </div>
                <LanguageToggle></LanguageToggle>
              <div className="logo-text">
                <span className="brand-name">Krishi Vaani</span>
                <span className="brand-tagline">कृषि वाणी</span>
              </div>
            </div>
          </div>

          <div className="nav-menu">
            <button 
              className={`nav-link ${activeSection === 'home' ? 'active' : ''}`}
              onClick={() => navigateToSection('home')}
            >
              Home
            </button>
            <button 
              className={`nav-link ${activeSection === 'crop-prediction' ? 'active' : ''}`}
              onClick={() => navigateToSection('crop-prediction')}
            >
              Crop Prediction
            </button>
            <button 
              className={`nav-link ${activeSection === 'disease-detection' ? 'active' : ''}`}
              onClick={() => navigateToSection('disease-detection')}
            >
              Disease Detection
            </button>
            <button 
              className={`nav-link ${activeSection === 'chatbot' ? 'active' : ''}`}
              onClick={() => navigateToSection('chatbot')}
            >
              Expert Chat
            </button>
          </div>

          <div className="nav-actions">
            <button className="emergency-btn">
              <Phone className="w-4 h-4" />
              Emergency: 1800-180-1551
            </button>
          </div>

          <button 
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
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
    </>
  );
};

export default Navbar;