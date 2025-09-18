import React from 'react';
import './HomePage.css';

const HomePage = () => (
  <>
    <div className="home-page-bg"></div>
    <section className="home-page">
      <div className="home-main-content">
        <h1>Welcome to Krishi Vaani</h1>
        <h2> Always available, Always learning, Always farmer first</h2>
       
      </div>
    </section>
    <section className="about-section">
      <div className="about-content">
        <h2>About Krishi Vaani</h2>
        <ul>
          <li>AI-powered advisory platform, accessible via mobile app in regional language (Malayalam-first).</li>
          <li>Handles text, voice, and image queries (e.g., diseased crop photo).</li>
          <li>Powered by fine-tuned LLMs trained on agriculture datasets, weather APIs, and crop calendars.</li>
          <li>Smart escalation system routes unresolved queries to agri officers with context.</li>
          <li>Continuous learning loop from farmer feedback.</li>
        </ul>
        <h2>Innovation & Uniqueness</h2>
        <ul>
          <li>Multimodal AI support (voice, text, images) vs. text-only traditional systems.</li>
          <li>Context-aware intelligence: answers adapt by crop, region, and season.</li>
          <li>Escalation + Trust Loop improves officer efficiency by up to 40%.</li>
          <li>Self-learning, scalable system — becomes smarter with every query.</li>
          <li>always available, always learning, always farmer-first.</li>
        </ul>
      </div>
    </section>
  </>
);

export default HomePage;