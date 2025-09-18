import React, { useState, useEffect } from 'react';
import { Leaf } from 'lucide-react';
import Navbar from './components/Navbar/Navbar';
import HomePage from './pages/HomePage/HomePage';
import ChatbotSection from './pages/ChatbotSection/ChatbotSection';
import Footer from './components/Footer/Footer';
import './App.css';

const App = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigateToSection = (section) => {
    setActiveSection(section);
    setIsMenuOpen(false);
  };

  return (
    <div className="krishi-vaani-app">
      <Navbar 
        activeSection={activeSection}
        navigateToSection={navigateToSection}
        isScrolled={isScrolled}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
      />

      <main className="main-content">
        {activeSection === 'home' && <HomePage navigateToSection={navigateToSection} />}
        {activeSection === 'chatbot' && <ChatbotSection />}
        {activeSection === 'crop-prediction' && (
          <div className="page-placeholder">
            <h1>Crop Prediction System</h1>
            <p>Crop prediction functionality would be integrated here</p>
          </div>
        )}
        {activeSection === 'disease-detection' && (
          <div className="page-placeholder">
            <h1>Disease Detection System</h1>
            <p>Disease detection functionality would be integrated here</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;
