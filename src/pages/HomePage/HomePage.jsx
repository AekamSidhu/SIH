import React, { useEffect, useState } from "react";
import "./HomePage.css";
import Card from "../../components/Cards/Card";

const HomePage = () => {
    // store blur intensity in pixels
    const [blurPx, setBlurPx] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const y = window.scrollY;

            // Map scroll distance to blur value
            const maxScroll = 400; // how far until max blur
            const maxBlur = 8;     // maximum blur in px
            const newBlur = Math.min((y / maxScroll) * maxBlur, maxBlur);

            setBlurPx(newBlur);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            <div className="home-page-bg"></div>

            <section className="home-page">
                {/* Apply blur dynamically */}
                <div
                    className="home-main-content"
                    style={{ filter: `blur(${blurPx}px)` }}
                >
                    <h1 style={{ filter: `opacity(${1-0.2*blurPx})` }}>Welcome to Krishi Vaani</h1>
                    <h2 style={{ filter: `opacity(${1-0.2*blurPx})` }}>Always available, Always learning, Always farmer first</h2>
                    <div className="kv"
                         style={{ filter: `opacity(${1-0.2*blurPx})` }}>
                        <button className="kv-but">
                            <img src="./brain.svg" alt="" />
                            Start Crop Analysis
                        </button>
                        <button className="kv-but">
                            <img src="./message.svg" alt="" />
                            Chat With Expert
                        </button>
                    </div>
                </div>
            </section>

            <section className="about-section">
                <div className="about-content">
                    <h2>About Krishi Vaani</h2>
                    <h3>
                        Empowering farmers with cutting-edge AI technology and expert
                        guidance
                    </h3>

                    <div className="cards">
                        <Card
                            title="Mobile-First Platform"
                            image="./mob.svg"
                            info="AI-powered advisory platform, accessible via mobile app in regional language (Malayalam-first)."
                        />
                        <Card
                            title="Multi-Modal Support"
                            image="./cam.svg"
                            info="Handles text, voice, and image queries (e.g., diseased crop photo) with advanced AI processing."
                        />
                        <Card
                            title="Expert Network"
                            image="./web.svg"
                            info="Connect with agricultural experts and get personalized advice for your specific farming needs."
                        />
                    </div>

                    <div className="stats">
                        <div className="stats-content">
                            <h1>10K+</h1>
                            <h2>Active Farmers</h2>
                        </div>
                        <div className="stats-content">
                            <h1>95%</h1>
                            <h2>Accuracy Rate</h2>
                        </div>
                        <div className="stats-content">
                            <h1>24/7</h1>
                            <h2>Support Available</h2>
                        </div>
                        <div className="stats-content">
                            <h1>50+</h1>
                            <h2>Crop Types</h2>
                        </div>
                    </div>

                    <div className="footer">

                    </div>
                </div>
            </section>
        </>
    );
};

export default HomePage;
