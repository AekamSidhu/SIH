import React, { useEffect, useState } from "react";
import "./HomePage.css";
import Card from "../../components/Cards/Card";
import { useTranslation } from "react-i18next";

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
                    <div className="kv" style={{ filter: `opacity(${1 - 0.2 * blurPx})` }}>
                        <button className="kv-but">
                            <img src="./brain.svg" alt="" />
                            {t("home.start")}
                        </button>
                        <button className="kv-but">
                            <img src="./message.svg" alt="" />
                            {t("home.chat")}
                        </button>
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
