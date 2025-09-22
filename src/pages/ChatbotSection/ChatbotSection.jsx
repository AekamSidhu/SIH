import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';
import {
    MessageCircle, Send, Bot, User, Mic, MicOff, 
    Thermometer, Droplets, Wind, Phone, Upload
} from 'lucide-react';
import './ChatbotSection.css';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "AIzaSyCAMWZbq1AsDu4qYGH_Gwntio7f9qIljL8" });

// ---- Gemini helper ----
async function askGemini(prompt) {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error('Gemini API error:', error);
        return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
    }
}

export default function AIChatbotPage() {
    const [blurPx, setBlurPx] = useState(0);
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            content: 'Hello! I\'m your AI agricultural assistant. I can help you with crop diseases, farming techniques, weather advice, and more. How can I assist you today?',
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef(null);
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

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: inputMessage.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const prompt = `You are an AI agricultural assistant. Please provide helpful, accurate information about farming, crops, diseases, weather, and agricultural practices. User question: ${userMessage.content}`;
            const response = await askGemini(prompt);
            
            const botMessage = {
                id: Date.now() + 1,
                type: 'bot',
                content: response,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = {
                id: Date.now() + 1,
                type: 'bot',
                content: 'I apologize, but I encountered an error while processing your request. Please try again.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const toggleVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Speech recognition is not supported in your browser');
            return;
        }

        if (isListening) {
            setIsListening(false);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        setIsListening(true);

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInputMessage(transcript);
            setIsListening(false);
        };

        recognition.onerror = () => {
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    };

    const quickQuestions = [
        "What are common rice diseases?",
        "How to improve soil fertility?",
        "Best time to plant wheat?",
        "Organic pest control methods"
    ];

    return (
        <div className="crop-disease-page-wrapper">
            {/* Hero */}
            <section className="hero-main-content" style={{ filter: `blur(${blurPx}px)` }}>
                <h1 style={{ opacity: 1 - 0.2 * blurPx }}>AI Agricultural Assistant</h1>
                <h2 style={{ opacity: 1 - 0.2 * blurPx }}>Get instant expert advice for all your farming needs</h2>
                <div className="hero-buttons">
                    <button className="hero-btn"><MessageCircle size={20}/> Start Chatting</button>
                    <button className="hero-btn"><Phone size={20}/> Get Expert Help</button>
                </div>
            </section>

            {/* Chat Section */}
            <section className="prediction-section">
                <div className="prediction-content">
                    <div className="section-header">
                        <h2>AI Chat Assistant</h2>
                        <h3>Ask me anything about agriculture, crops, diseases, and farming techniques</h3>
                    </div>

                    <div className="prediction-grid">
                        <div className="prediction-form">
                            <h3 className="form-title">Chat with AI Assistant</h3>
                            
                            {/* Chat Messages */}
                            <div className="chat-container">
                                <div className="messages-container">
                                    {messages.map((message) => (
                                        <div key={message.id} className={`message ${message.type}-message`}>
                                            <div className="message-avatar">
                                                {message.type === 'bot' ? <Bot size={20} /> : <User size={20} />}
                                            </div>
                                            <div className="message-content">
                                                <div className="message-text">{message.content}</div>
                                                <div className="message-time">{formatTime(message.timestamp)}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="message bot-message">
                                            <div className="message-avatar">
                                                <Bot size={20} />
                                            </div>
                                            <div className="message-content">
                                                <div className="typing-indicator">
                                                    <div className="typing-dot"></div>
                                                    <div className="typing-dot"></div>
                                                    <div className="typing-dot"></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Quick Questions */}
                                <div className="quick-questions">
                                    <h4>Quick Questions:</h4>
                                    <div className="quick-buttons">
                                        {quickQuestions.map((question, index) => (
                                            <button
                                                key={index}
                                                className="quick-btn"
                                                onClick={() => setInputMessage(question)}
                                            >
                                                {question}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Input Area */}
                                <div className="input-container">
                                    <div className="input-wrapper">
                                        <textarea
                                            value={inputMessage}
                                            onChange={(e) => setInputMessage(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Ask me about farming, crop diseases, weather advice..."
                                            className="chat-input"
                                            rows="2"
                                            disabled={isLoading}
                                        />
                                        <div className="input-actions">
                                            <button
                                                className={`voice-btn ${isListening ? 'listening' : ''}`}
                                                onClick={toggleVoiceInput}
                                                disabled={isLoading}
                                            >
                                                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                                            </button>
                                            <button
                                                className="send-btn"
                                                onClick={handleSendMessage}
                                                disabled={isLoading || !inputMessage.trim()}
                                            >
                                                <Send size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
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
                </div>
            </section>
        </div>
    );
}