import React, { useState, useEffect } from 'react';
import { Leaf } from 'lucide-react';
import Navbar from './components/Navbar/Navbar';
import HomePage from './pages/HomePage/HomePage';
import ChatbotSection from './pages/ChatbotSection/ChatbotSection';
import Footer from './components/Footer/Footer';
import './App.css';
import CropPrediction from "./pages/DiseaseDetection/DiseasePrediction";
import CropRecommendationPage from "./pages/CropPrediction/CropPrediction";

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
            <CropRecommendationPage></CropRecommendationPage>
          </div>
        )}
        {activeSection === 'disease-detection' && (
          <div className="page-placeholder">
            <CropPrediction></CropPrediction>
          </div>
        )}
      </main>

    </div>
  );
};

export default App;
