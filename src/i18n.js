import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: {
                    home: {
                        title: "Welcome to Krishi Vaani",
                        subtitle: "Always available, Always learning, Always farmer first",
                        start: "Start Crop Analysis",
                        chat: "Chat With Expert",
                        aboutTitle: "About Krishi Vaani",
                        aboutSubtitle: "Empowering farmers with cutting-edge AI technology and expert guidance",
                        cards: {
                            mobile: { title: "Mobile-First Platform", info: "AI-powered advisory platform, accessible via mobile app in regional language (Malayalam-first)." },
                            multi: { title: "Multi-Modal Support", info: "Handles text, voice, and image queries (e.g., diseased crop photo) with advanced AI processing." },
                            expert: { title: "Expert Network", info: "Connect with agricultural experts and get personalized advice for your specific farming needs." }
                        },
                        stats: { farmers: "Active Farmers", accuracy: "Accuracy Rate", support: "Support Available", crops: "Crop Types" }
                    },
                    cropRecommendation: {
                        title: "Crop Recommendation",
                        subtitle: "Find the best crop for your farm based on soil & weather",
                        formTitle: "Crop Recommendation Form",
                        formSubtitle: "Enter your soil and environmental parameters",
                        getRecommendation: "Get Recommendation",
                        loading: "Calculating...",
                        recommendedCrop: "Recommended Crop",
                        generatingExplanation: "Generating explanation…",
                        whyThisCrop: "Why this crop?",
                        weatherTitle: "Current Weather",
                        humidity: "Humidity",
                        rain: "Rain",
                        wind: "Wind",
                        quickActions: "Quick Actions",
                        diseaseDetection: "Disease Detection",
                        expertConsultation: "Expert Consultation",
                        marketInfo: "Market Info",
                        fillField: "Please fill {{field}}",
                        geminiPrompt: "'{{crop}}' Explain why this crop is best based on N={{N}}, P={{P}}, K={{K}}, temperature={{temperature}}°C, humidity={{humidity}}%, pH={{ph}}, rainfall={{rain}}mm. Explain in simple terms for a farmer in 100-150 words.",
                        fields: { N: "N", P: "P", K: "K", temperature: "Temperature", humidity: "Humidity", ph: "pH", rainfall: "Rainfall" },
                        error: "Prediction failed. Please try again."
                    },
                    diseasePrediction: {
                        hero: {
                            title: "Crop Disease Prediction",
                            subtitle: "Detect crop diseases early using AI-powered insights",
                            start: "Start Analysis",
                            help: "Get Expert Help"
                        },
                        form: {
                            title: "Crop Disease Analysis",
                            subtitle: "Upload crop image for AI-based disease detection",
                            enterDetails: "Enter Crop Details",
                            crop: "Select Crop",
                            chooseCrop: "Choose crop",
                            part: "Affected Plant Part",
                            selectPart: "Select part",
                            symptoms: "Symptoms",
                            symptomsPlaceholder: "Describe symptoms",
                            upload: "Upload Crop Image (Required)",
                            clickUpload: "Click to upload or drag and drop",
                            fileTypes: "PNG, JPG up to 10MB",
                            clickChange: "Click to change",
                            analyze: "Detect Disease",
                            unknown: "Unknown Disease",
                            general: "General",
                            error: "Something went wrong! Please try again."
                        },
                        summary: {
                            title: "About The Disease",
                            generating: "Generating summary…"
                        },
                        weather: {
                            title: "Current Weather",
                            humidity: "Humidity",
                            rainfall: "Rain",
                            wind: "Wind"
                        },
                        results: {
                            disease: "Disease",
                            confidence: "Confidence",
                            severity: "Severity",
                            precautions: "Immediate Actions",
                            recommendations: "Recommendations"
                        },
                        severity: {
                            high: "High",
                            moderate: "Moderate",
                            low: "Low",
                            unknown: "Unknown"
                        },
                        precautions: {
                            precaution1: "Remove affected leaves immediately",
                            precaution2: "Apply recommended fungicide",
                            precaution3: "Improve air circulation around plants",
                            precaution4: "Apply copper-based fungicide spray",
                            precaution5: "Reduce irrigation frequency"
                        },
                        recommendations: {
                            recommendation1: "Monitor neighboring plants",
                            recommendation2: "Use disease-resistant crop variety next season",
                            recommendation3: "Maintain proper spacing for airflow",
                            recommendation4: "Apply preventive treatments during high-risk periods",
                            recommendation5: "Remove alternate host plants nearby"
                        }
                    }
                }
            },
            ml: {
                translation: {
                    home: {
                        title: "കൃഷി വാണിയിൽ സ്വാഗതം",
                        subtitle: "എപ്പോഴും ലഭ്യമാണ്, എപ്പോഴും പഠിക്കുന്നു, എപ്പോഴും കർഷിക്ക് മുൻതൂക്കം",
                        start: "പയർ വിശകലനം തുടങ്ങുക",
                        chat: "വിദഗ്ധരുമായി ചാറ്റ് ചെയ്യുക",
                        aboutTitle: "കൃഷി വാണി കുറിച്ച്",
                        aboutSubtitle: "നൂതന AI സാങ്കേതിക വിദ്യയും വിദഗ്ധ ഉപദേശവും കർഷികൾക്ക് പ്രാപ്യമാക്കുന്നു",
                        cards: {
                            mobile: { title: "മൊബൈൽ-ഫസ്റ്റ് പ്ലാറ്റ്‌ഫോം", info: "AI-പ്രചോദിത ഉപദേശം പ്ലാറ്റ്‌ഫോം, റീജണൽ ഭാഷയിൽ മൊബൈൽ ആപ്പിലൂടെ ലഭ്യമാകും (മലയാളം-ഫസ്റ്റ്)." },
                            multi: { title: "മൾട്ടി-മോഡൽ സപ്പോർട്ട്", info: "ടെക്‌സ്‌റ്റ്, വോയ്സ്, ഇമേജ് ക്വെറിയുകൾ (ഉദാ: രോഗ ബാധിത പയർ ചിത്രം) പരമാവധി AI പ്രോസസ്സിംഗിനൊപ്പം കൈകാര്യം ചെയ്യുന്നു." },
                            expert: { title: "വിദഗ്ധരുടെ നെറ്റ്‌വർക്ക്", info: "കർഷകരുടെ പ്രത്യേക ആവശ്യങ്ങൾക്ക് വ്യക്തിഗത ഉപദേശം ലഭിക്കാൻ കൃഷി വിദഗ്ധരുമായി ബന്ധപ്പെടുക." }
                        },
                        stats: { farmers: "സജീവ കർഷികൾ", accuracy: "ശുദ്ധിമാനം", support: "സപ്പോർട്ട് ലഭ്യമാണ്", crops: "പയർ തരങ്ങൾ" }
                    },
                    cropRecommendation: {
                        title: "പയർ ശുപാർശ",
                        subtitle: "മണ്ണ് & കാലാവസ്ഥ അടിസ്ഥാനമാക്കി നിങ്ങളുടെ കർഷിക്കുള്ള ഏറ്റവും മികച്ച പയർ കണ്ടെത്തുക",
                        formTitle: "പയർ ശുപാർശ ഫോമുകൾ",
                        formSubtitle: "നിങ്ങളുടെ മണ്ണ്, പരിസ്ഥിതി സൂചകങ്ങൾ നൽകുക",
                        getRecommendation: "ശുപാർശ ലഭിക്കുക",
                        loading: "ഗണിക്കുന്നത്...",
                        recommendedCrop: "ശുപാർശ ചെയ്ത പയർ",
                        generatingExplanation: "വിവരണം സൃഷ്ടിക്കുന്നു…",
                        whyThisCrop: "ഈ പയർ എതുകൊണ്ട്?",
                        weatherTitle: "നിലവിലെ കാലാവസ്ഥ",
                        humidity: "ആർദ്രത",
                        rain: "മഴ",
                        wind: "കാറ്റ്",
                        quickActions: "ക്ഷണപ്രവർത്തനങ്ങൾ",
                        diseaseDetection: "രോഗം കണ്ടെത്തൽ",
                        expertConsultation: "വിദഗ്ധരുടെ ഉപദേശം",
                        marketInfo: "മാർക്കറ്റ് വിവരങ്ങൾ",
                        fillField: "ദയവായി {{field}} പൂരിപ്പിക്കുക",
                        geminiPrompt: "'{{crop}}' ഈ മണ്ണ്, കാലാവസ്ഥാ സാഹചര്യങ്ങൾ: N={{N}}, P={{P}}, K={{K}}, താപനില={{temperature}}°C, ആർദ്രത={{humidity}}%, pH={{ph}}, മഴ={{rain}}mm എന്നിവയുടെ അടിസ്ഥാനത്തിൽ ഏറ്റവും മികച്ച പയർ എങ്കിൽ എന്തുകൊണ്ടാണ് എന്ന് വിശദീകരിക്കുക. കർഷികൾക്ക് എളുപ്പത്തിൽ മനസ്സിലാകുന്ന തരത്തിൽ 100-150 വാക്കിൽ വിശദീകരിക്കുക.",
                        fields: { N: "നൈട്രജൻ (N)", P: "ഫോസ്ഫറസ് (P)", K: "പൊട്ടാസ്യം (K)", temperature: "താപനില", humidity: "ആർദ്രത", ph: "മണ്ണ് pH", rainfall: "മഴ" },
                        error: "ശുപാർശ പരാജയപ്പെട്ടു. ദയവായി വീണ്ടും ശ്രമിക്കുക."
                    },
                    diseasePrediction: {
                        hero: {
                            title: "പയർ രോഗ പ്രവചനങ്ങൾ",
                            subtitle: "AI സൃഷ്ടിക്കുന്ന സൂചനകൾ ഉപയോഗിച്ച് പയർ രോഗങ്ങൾ മുൻ‌കൂട്ടി കണ്ടെത്തുക",
                            start: "വിശകലനം തുടങ്ങുക",
                            help: "വിദഗ്ധ സഹായം ലഭിക്കുക"
                        },
                        form: {
                            title: "പയർ രോഗ വിശകലനം",
                            subtitle: "AI അടിസ്ഥാനത്തിലുള്ള പയർ രോഗ കണ്ടെത്തലിന് പയർ ചിത്രം അപ്ലോഡ് ചെയ്യുക",
                            enterDetails: "പയർ വിവരങ്ങൾ നൽകുക",
                            crop: "പയർ തിരഞ്ഞെടുക്കുക",
                            chooseCrop: "പയർ തിരഞ്ഞെടുക്കുക",
                            part: "ഭാഗം ബാധിതമാണ്",
                            selectPart: "ഭാഗം തിരഞ്ഞെടുക്കുക",
                            symptoms: "ലക്ഷണങ്ങൾ",
                            symptomsPlaceholder: "ലക്ഷണങ്ങൾ വിവരണം ചെയ്യുക",
                            upload: "പയർ ചിത്രം അപ്ലോഡ് ചെയ്യുക (ആവശ്യമാണ്)",
                            clickUpload: "അപ്ലോഡ് ചെയ്യാൻ ക്ലിക്ക് ചെയ്യുക അല്ലെങ്കിൽ ഡ്രാഗ് & ഡ്രോപ്പ് ചെയ്യുക",
                            fileTypes: "PNG, JPG, 10MB വരെ",
                            clickChange: "മാറ്റാൻ ക്ലിക്ക് ചെയ്യുക",
                            analyze: "രോഗം കണ്ടെത്തുക",
                            unknown: "അജ്ഞാത രോഗം",
                            general: "പൊതു",
                            error: "തെറ്റായി! ദയവായി വീണ്ടും ശ്രമിക്കുക."
                        },
                        summary: {
                            title: "രോഗത്തെ കുറിച്ച്",
                            generating: "സംഗ്രഹം സൃഷ്ടിക്കുന്നു…"
                        },
                        weather: {
                            title: "നിലവിലെ കാലാവസ്ഥ",
                            humidity: "ആർദ്രത",
                            rainfall: "മഴ",
                            wind: "കാറ്റ്"
                        },
                        results: {
                            disease: "രോഗം",
                            confidence: "വിശ്വാസ്യത",
                            severity: "പ്രാധാന്യം",
                            precautions: "തലക്കെട്ട് നടപടികൾ",
                            recommendations: "ശുപാർശകൾ"
                        },
                        severity: {
                            high: "ഉയർന്നത്",
                            moderate: "മിതമായത്",
                            low: "കുറഞ്ഞത്",
                            unknown: "അജ്ഞാതം"
                        },
                        precautions: {
                            precaution1: "ബാധിത ഇലകൾ ഉടൻ നീക്കം ചെയ്യുക",
                            precaution2: "ശിപാർശ ചെയ്ത ഫംഗിസൈഡ് പ്രയോഗിക്കുക",
                            precaution3: "ചുറ്റുമുള്ള വായു സഞ്ചാരം മെച്ചപ്പെടുത്തുക",
                            precaution4: "താമ്ര-അടിസ്ഥാന ഫംഗിസൈഡ് സ്പ്രേ പ്രയോഗിക്കുക",
                            precaution5: "സിച്ഛനം കുറയ്ക്കുക"
                        },
                        recommendations: {
                            recommendation1: "പുറപ്പുറത്തെ പയറുകൾ നിരീക്ഷിക്കുക",
                            recommendation2: "അടുത്ത സീസണിൽ രോഗ-പ്രതിരോധ പയർ വർഗ്ഗം ഉപയോഗിക്കുക",
                            recommendation3: "വായു സഞ്ചാരത്തിനായി ശരിയായ ഇടം പാലിക്കുക",
                            recommendation4: "ഉയർന്ന-പങ്കെടുപ്പ് കാലത്ത് പ്രതിരോധ ചികിത്സകൾ പ്രയോഗിക്കുക",
                            recommendation5: "സമീപവാസി അതേ ഹോസ്റ്റ് പ്ലാന്റുകൾ നീക്കം ചെയ്യുക"
                        }
                    }
                }
            },
            hi: {
                translation: {
                    home: {
                        title: "कृषि वाणी में आपका स्वागत है",
                        subtitle: "हमेशा उपलब्ध, हमेशा सीखते हुए, हमेशा किसान पहले",
                        start: "फसल विश्लेषण शुरू करें",
                        chat: "विशेषज्ञ से चैट करें",
                        aboutTitle: "कृषि वाणी के बारे में",
                        aboutSubtitle: "किसानों को अत्याधुनिक एआई तकनीक और विशेषज्ञ मार्गदर्शन के साथ सशक्त बनाना",
                        cards: {
                            mobile: { title: "मोबाइल-फर्स्ट प्लेटफॉर्म", info: "एआई-संचालित सलाहकार प्लेटफॉर्म, क्षेत्रीय भाषा में मोबाइल ऐप के माध्यम से सुलभ (मलयालम-प्रथम)।" },
                            multi: { title: "मल्टी-मोडल सपोर्ट", info: "उन्नत एआई प्रसंस्करण के साथ टेक्स्ट, आवाज और छवि प्रश्नों (जैसे, रोगग्रस्त फसल का फोटो) को संभालता है।" },
                            expert: { title: "विशेषज्ञ नेटवर्क", info: "कृषि विशेषज्ञों से जुड़ें और अपनी विशिष्ट खेती की जरूरतों के लिए व्यक्तिगत सलाह प्राप्त करें।" }
                        },
                        stats: { farmers: "सक्रिय किसान", accuracy: "सटीकता दर", support: "सहायता उपलब्ध", crops: "फसल के प्रकार" }
                    },
                    cropRecommendation: {
                        title: "फ़सल सिफ़ारिश",
                        subtitle: "मिट्टी और मौसम के आधार पर अपने खेत के लिए सबसे अच्छी फ़सल खोजें",
                        formTitle: "फ़सल सिफ़ारिश फ़ॉर्म",
                        formSubtitle: "अपनी मिट्टी और पर्यावरणीय पैरामीटर दर्ज करें",
                        getRecommendation: "सिफ़ारिश प्राप्त करें",
                        loading: "गणना हो रही है...",
                        recommendedCrop: "अनुशंसित फ़सल",
                        generatingExplanation: "स्पष्टीकरण उत्पन्न हो रहा है...",
                        whyThisCrop: "यह फ़सल क्यों?",
                        weatherTitle: "वर्तमान मौसम",
                        humidity: "आर्द्रता",
                        rain: "बारिश",
                        wind: "हवा",
                        quickActions: "त्वरित कार्रवाई",
                        diseaseDetection: "रोग निदान",
                        expertConsultation: "विशेषज्ञ परामर्श",
                        marketInfo: "बाजार की जानकारी",
                        fillField: "कृपया {{field}} भरें",
                        geminiPrompt: "'{{crop}}' समझाएं कि यह फसल N={{N}}, P={{P}}, K={{K}}, तापमान={{temperature}}°C, आर्द्रता={{humidity}}%, pH={{ph}}, वर्षा={{rain}}mm के आधार पर सबसे अच्छी क्यों है। 100-150 शब्दों में एक किसान के लिए सरल शब्दों में समझाएं।",
                        fields: { N: "एन", P: "पी", K: "के", temperature: "तापमान", humidity: "आर्द्रता", ph: "पीएच", rainfall: "वर्षा" },
                        error: "सिफारिश विफल रही। कृपया पुनः प्रयास करें।"
                    },
                    diseasePrediction: {
                        hero: {
                            title: "फसल रोग निदान",
                            subtitle: "एआई-संचालित अंतर्दृष्टि का उपयोग करके फसल रोगों का शीघ्र पता लगाएं",
                            start: "विश्लेषण शुरू करें",
                            help: "विशेषज्ञ सहायता प्राप्त करें"
                        },
                        form: {
                            title: "फसल रोग विश्लेषण",
                            subtitle: "एआई-आधारित रोग निदान के लिए फसल की छवि अपलोड करें",
                            enterDetails: "फसल का विवरण दर्ज करें",
                            crop: "फसल चुनें",
                            chooseCrop: "फसल चुनें",
                            part: "प्रभावित पौधा भाग",
                            selectPart: "भाग चुनें",
                            symptoms: "लक्षण",
                            symptomsPlaceholder: "लक्षणों का वर्णन करें",
                            upload: "फसल की छवि अपलोड करें (आवश्यक)",
                            clickUpload: "अपलोड करने के लिए क्लिक करें या खींचें और छोड़ें",
                            fileTypes: "पीएनजी, जेपीजी 10एमबी तक",
                            clickChange: "बदलने के लिए क्लिक करें",
                            analyze: "रोग का पता लगाएं",
                            unknown: "अज्ञात रोग",
                            general: "सामान्य",
                            error: "कुछ गलत हो गया! कृपया पुनः प्रयास करें।"
                        },
                        summary: {
                            title: "रोग के बारे में",
                            generating: "सारांश बना रहा है..."
                        },
                        weather: {
                            title: "वर्तमान मौसम",
                            humidity: "आर्द्रता",
                            rainfall: "बारिश",
                            wind: "हवा"
                        },
                        results: {
                            disease: "रोग",
                            confidence: "सटीकता",
                            severity: "गंभीरता",
                            precautions: "तत्काल कार्रवाई",
                            recommendations: "सिफारिशें"
                        },
                        severity: {
                            high: "उच्च",
                            moderate: "मध्यम",
                            low: "कम",
                            unknown: "अज्ञात"
                        },
                        precautions: {
                            precaution1: "प्रभावित पत्तियों को तुरंत हटा दें",
                            precaution2: "अनुशंसित कवकनाशी लागू करें",
                            precaution3: "पौधों के आसपास हवा का संचार सुधारें",
                            precaution4: "तांबा आधारित कवकनाशी स्प्रे लागू करें",
                            precaution5: "सिंचाई की आवृत्ति कम करें"
                        },
                        recommendations: {
                            recommendation1: "पड़ोसी पौधों की निगरानी करें",
                            recommendation2: "अगले सीजन में रोग प्रतिरोधी फसल किस्म का उपयोग करें",
                            recommendation3: "हवा के प्रवाह के लिए उचित दूरी बनाए रखें",
                            recommendation4: "उच्च जोखिम वाली अवधि के दौरान निवारक उपचार लागू करें",
                            recommendation5: "आस-पास के वैकल्पिक मेजबान पौधों को हटा दें"
                        }
                    }
                }
            }
        },
        lng: "en",
        fallbackLng: "en",
        interpolation: { escapeValue: false },
    });

export default i18n;