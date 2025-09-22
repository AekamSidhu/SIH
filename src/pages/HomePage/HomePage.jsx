import React, { useEffect, useState } from "react";
import "./HomePage.css";
import Card from "../../components/Cards/Card";
import { useTranslation } from "react-i18next";
import {Phone, Upload} from "lucide-react";

const HomePage = () => {

    const [blurPx, setBlurPx] = useState(0);
    const { t } = useTranslation();

    useEffect(() => {
        const handleScroll = () => {
            const y = window.scrollY;
            const maxScroll = 400;
            const maxBlur = 8;
            setBlurPx(Math.min((y / maxScroll) * maxBlur, maxBlur));
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            <div className="home-page-bg"></div>

            <section className="home-page">
                <div
                    className="home-main-content"
                    style={{ filter: `blur(${blurPx}px)` }}
                >
                    <h1 style={{ filter: `opacity(${1 - 0.2 * blurPx})` }}>
                        {t("home.title")}
                    </h1>
                    <h2 style={{ filter: `opacity(${1 - 0.2 * blurPx})` }}>
                        {t("home.subtitle")}
                    </h2>
                    <div className="hero-buttons">
                        <button className="hero-btn"><Upload size={20}/> {t('diseasePrediction.hero.start')}</button>
                        <button className="hero-btn"><Phone size={20}/> {t('diseasePrediction.hero.help')}</button>
                    </div>
                </div>
            </section>

            <section className="about-section">
                <div className="about-content">
                    <h2>{t("home.aboutTitle")}</h2>
                    <h3>{t("home.aboutSubtitle")}</h3>

                    <div className="cards">
                        <Card
                            title={t("home.cards.mobile.title")}
                            image="./mob.svg"
                            info={t("home.cards.mobile.info")}
                        />
                        <Card
                            title={t("home.cards.multi.title")}
                            image="./cam.svg"
                            info={t("home.cards.multi.info")}
                        />
                        <Card
                            title={t("home.cards.expert.title")}
                            image="./web.svg"
                            info={t("home.cards.expert.info")}
                        />
                    </div>
                    <div className="why">
                        <h1>
                        Why This Matters
                        </h1>
                        <p>
                        Kerala’s smallholder farmers face unique
                        challenges—unpredictable weather, changing soil
                        conditions, and limited access to timely, personalized
                        advice. Traditional one-size-fits-all advisories can’t address
                        each farm’s specific needs, and many farmers miss out on valuable
                        insights or government benefits because records aren’t maintained.
                        Krishi Vaani bridges this gap by acting as a digital farming companion.
                        It understands each farmer’s land, crops, and local conditions,
                        offers real-time Malayalam voice or text guidance, tracks daily activities,
                        and delivers proactive alerts—from weather warnings to market trends.
                        By combining AI with local knowledge, Krishi Vaani empowers farmers
                        to make smarter decisions, improve yields, and build a more sustainable future.
                        </p>
                    </div>
                    <div className="stats">
                        <div className="stats-content">
                            <h1>10K+</h1>
                            <h2>{t("home.stats.farmers")}</h2>
                        </div>
                        <div className="stats-content">
                            <h1>95%</h1>
                            <h2>{t("home.stats.accuracy")}</h2>
                        </div>
                        <div className="stats-content">
                            <h1>24/7</h1>
                            <h2>{t("home.stats.support")}</h2>
                        </div>
                        <div className="stats-content">
                            <h1>50+</h1>
                            <h2>{t("home.stats.crops")}</h2>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default HomePage;
