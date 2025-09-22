// src/components/LanguageToggle.jsx
import { useTranslation } from "react-i18next";

export default function LanguageToggle() {
    const { i18n } = useTranslation();
    const toggleLanguage = () => {
        i18n.changeLanguage(i18n.language === "en" ? "ml" : "en");
    };
    return (
        <button onClick={toggleLanguage} className="lang-toggle">
            {i18n.language === "en" ? "മലയാളം" : "English"}
        </button>
    );
}
