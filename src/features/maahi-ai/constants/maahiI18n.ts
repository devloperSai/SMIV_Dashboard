// ─── MAAHI AI — Internationalisation ─────────────────────────────────────────
// Three languages: Marathi (mr) · English (en) · Hindi (hi)
// Add every UI string here; never hard-code text in components.

export type Lang = "mr" | "en" | "hi";

export const LANG_META: Record<
  Lang,
  { label: string; nativeLabel: string; flag: string; acceptHeader: string }
> = {
  mr: {
    label: "Marathi",
    nativeLabel: "मराठी",
    flag: "🇮🇳",
    acceptHeader: "mr",
  },
  en: {
    label: "English",
    nativeLabel: "English",
    flag: "🇬🇧",
    acceptHeader: "en",
  },
  hi: { label: "Hindi", nativeLabel: "हिंदी", flag: "🇮🇳", acceptHeader: "hi" },
};

export const DEFAULT_LANG: Lang = "mr";
export const LANG_STORAGE_KEY = "maahi_lang";

// ─── Translation map ──────────────────────────────────────────────────────────

export interface MaahiStrings {
  // ── Language picker
  langPickerTitle: string;
  langPickerSub: string;

  // ── Floating button
  btnTitle: string;
  btnSub: string;
  bubbleLine1: string;
  bubbleLine2: string;

  // ── Login page
  loginGreeting: string;
  loginSubLogin: string;
  loginSubRegister: string;
  loginSubForgot: string;
  loginTabLogin: string;
  loginTabRegister: string;
  loginEmailOrPhone: string;
  loginEmailPlaceholder: string;
  loginPassword: string;
  loginForgotLink: string;
  loginCTA: string;
  loginNewUserTitle: string;
  loginNewUserBody: string;

  // Register
  regName: string;
  regNamePlaceholder: string;
  regPhone: string;
  regPhonePlaceholder: string;
  regEmail: string;
  regVillage: string;
  regVillagePlaceholder: string;
  regVillageLoading: string;
  regPassword: string;
  regPasswordPlaceholder: string;
  regConfirmPassword: string;
  regConfirmPlaceholder: string;
  regCTA: string;
  regDisclaimer: string;

  // Forgot password
  forgotInfoBox: string;
  forgotEmailLabel: string;
  forgotCTA: string;
  forgotBack: string;
  forgotSentTitle: string;
  forgotSentBody: string;
  forgotSentBack: string;

  // ── Onboarding
  onboardingWelcome: string;
  onboardingVillage: string;
  onboardingNext: string;
  onboardingStart: string;
  onboardingSkip: string;

  // ── Chat header
  chatTitle: string;
  chatOnline: string;
  chatNewBtn: string;
  chatLogout: string;
  chatClose: string;

  // ── Welcome / home screen
  welcomeGreeting: string;
  welcomeSub: string;
  welcomeBody: string;
  welcomeStat1Val: string;
  welcomeStat1Label: string;
  welcomeStat2Val: string;
  welcomeStat2Label: string;
  welcomeStat3Val: string;
  welcomeStat3Label: string;
  awarenessLabel: string;
  startChatBtn: string;
  suggestionsLabel: string;
  todayLabel: string;

  // ── Input bar
  inputPlaceholder: string;
  inputHint: string;

  // ── New chat dialog
  newChatTitle: string;
  newChatBody: string;
  newChatCancel: string;
  newChatConfirm: string;

  // ── Sidebar
  sidebarBrand: string;
  sidebarBrandSub: string;
  sidebarNewChat: string;
  sidebarHistoryLabel: string;
  sidebarEmptyLine1: string;
  sidebarEmptyLine2: string;
  sidebarMsgCount: string; // "{n} संदेश" — use replace("{n}", count)
  sidebarDeleted: string;
  sidebarOnline: string;

  // ── Loading messages
  loading1: string;
  loading2: string;
  loading3: string;
  loading4: string;

  // ── Awareness cards
  card1Title: string;
  card1Body: string;
  card2Title: string;
  card2Body: string;
  card3Title: string;
  card3Body: string;
  card4Title: string;
  card4Body: string;

  // ── Suggestion chips
  chip1: string;
  chip2: string;
  chip3: string;
  chip4: string;
  chip5: string;
  chip6: string;

  // ── Onboarding slides
  slide1Title: string;
  slide1Sub: string;
  slide1Body: string;
  slide2Title: string;
  slide2Sub: string;
  slide2Body: string;
  slide3Title: string;
  slide3Sub: string;
  slide3List: string[];
  slide4Title: string;
  slide4Sub: string;
  slide4List: string[];
  slide5Title: string;
  slide5Sub: string;
  slide5Body: string;

  // ── Login left panel features
  feat1: string;
  feat2: string;
  feat3: string;
  feat4: string;
  statVal1: string;
  statLabel1: string;
  statVal2: string;
  statLabel2: string;
  statVal3: string;
  statLabel3: string;

  // ── Smart village
  smartVillage: string;
}

// ─── MARATHI ──────────────────────────────────────────────────────────────────
const mr: MaahiStrings = {
  langPickerTitle: "भाषा निवडा",
  langPickerSub: "तुमची पसंतीची भाषा निवडा",

  btnTitle: "Maahi AI सहाय्यक",
  btnSub: "बोला • Type • Ask Anything",
  bubbleLine1: "👋 मला काही विचारा! Ask me anything.",
  bubbleLine2: "मी माही AI — तुमचा स्मार्ट गाव सहाय्यक",

  loginGreeting: "नमस्कार! 🙏",
  loginSubLogin: "लॉगिन करा आणि MAAHI शी बोला",
  loginSubRegister: "नवीन खाते तयार करा — Create Account",
  loginSubForgot: "तुमच्या ईमेलवर रीसेट लिंक मिळवा",
  loginTabLogin: "लॉगिन · Sign In",
  loginTabRegister: "नोंदणी · Register",
  loginEmailOrPhone: "ईमेल किंवा फोन नंबर",
  loginEmailPlaceholder: "email किंवा phone",
  loginPassword: "पासवर्ड",
  loginForgotLink: "पासवर्ड विसरलात?",
  loginCTA: "🚀 लॉगिन करा — Sign In",
  loginNewUserTitle: "नवीन वापरकर्ता?",
  loginNewUserBody: 'वर "नोंदणी · Register" टॅब वापरून नवीन खाते तयार करा.',

  regName: "पूर्ण नाव",
  regNamePlaceholder: "आपले नाव",
  regPhone: "फोन नंबर",
  regPhonePlaceholder: "10 अंकी नंबर",
  regEmail: "ईमेल",
  regVillage: "गाव निवडा",
  regVillagePlaceholder: "गाव निवडा",
  regVillageLoading: "गाव लोड होत आहे...",
  regPassword: "पासवर्ड",
  regPasswordPlaceholder: "किमान 6 अक्षरे",
  regConfirmPassword: "पासवर्ड पुष्टी",
  regConfirmPlaceholder: "पुन्हा टाका",
  regCTA: "✅ नोंदणी करा — Register",
  regDisclaimer:
    "नोंदणी करून तुम्ही आमच्या अटी व शर्तींशी सहमत आहात. नवीन खाते Citizen / Read access सह तयार होईल.",

  forgotInfoBox: "📩 तुमच्या नोंदणीकृत ईमेलवर पासवर्ड रीसेट लिंक पाठवली जाईल.",
  forgotEmailLabel: "नोंदणीकृत ईमेल",
  forgotCTA: "📨 रीसेट लिंक पाठवा",
  forgotBack: "← परत जा",
  forgotSentTitle: "ईमेल पाठवले!",
  forgotSentBody: "वर पासवर्ड रीसेट लिंक पाठवली आहे. कृपया आपला इनबॉक्स तपासा.",
  forgotSentBack: "← लॉगिनकडे परत जा",

  onboardingWelcome: "नमस्कार! स्वागत आहे 🙏",
  onboardingVillage: "सातनवरी स्मार्ट व्हिलेज",
  onboardingNext: "पुढे →",
  onboardingStart: "🚀 सुरू करा — Let's Start!",
  onboardingSkip: "वगळा • Skip",

  chatTitle: "MAAHI AI — माही",
  chatOnline: "सदैव उपलब्ध • Always Online",
  chatNewBtn: "नवीन",
  chatLogout: "बाहेर",
  chatClose: "×",

  welcomeGreeting: "नमस्कार! 🙏",
  welcomeSub: "मी MAAHI — तुमचा AI सहाय्यक",
  welcomeBody:
    "तुम्ही मला मराठीत किंवा English मध्ये कोणताही प्रश्न विचारू शकता.",
  welcomeStat1Val: "24/7",
  welcomeStat1Label: "उपलब्ध",
  welcomeStat2Val: "मराठी",
  welcomeStat2Label: "& English",
  welcomeStat3Val: "100%",
  welcomeStat3Label: "मोफत",
  awarenessLabel: "MAAHI AI बद्दल जाणून घ्या",
  startChatBtn: "💬 संवाद सुरू करा",
  suggestionsLabel: "सामान्य प्रश्न",
  todayLabel: "आजचा संवाद",

  inputPlaceholder: "तुमचा प्रश्न विचारा...",
  inputHint: "Enter दाबा किंवा ↑ बटण वापरा • Shift+Enter नवीन ओळ",

  newChatTitle: "नवीन संवाद सुरू करायचा?",
  newChatBody: "सध्याचा संवाद इतिहासात जतन केला जाईल.",
  newChatCancel: "रद्द करा",
  newChatConfirm: "होय, सुरू करा",

  sidebarBrand: "MAAHI AI",
  sidebarBrandSub: "Smart Village AI",
  sidebarNewChat: "नवीन संवाद",
  sidebarHistoryLabel: "मागील संवाद",
  sidebarEmptyLine1: "अद्याप कोणताही",
  sidebarEmptyLine2: "संवाद नाही",
  sidebarMsgCount: "{n} संदेश",
  sidebarDeleted: "संवाद हटवला",
  sidebarOnline: "Online",

  loading1: "विचार करत आहे...",
  loading2: "माहिती शोधत आहे...",
  loading3: "उत्तर तयार करत आहे...",
  loading4: "प्रक्रिया होत आहे...",

  card1Title: "AI म्हणजे काय?",
  card1Body:
    "AI म्हणजे असा संगणक जो माणसासारखा विचार करतो, प्रश्न समजतो आणि उत्तर देतो.",
  card2Title: "MAAHI कशी मदत करते?",
  card2Body:
    "शेती, आरोग्य, हवामान, सरकारी योजना — कोणताही प्रश्न विचारा, लगेच उत्तर मिळेल.",
  card3Title: "स्मार्ट व्हिलेज",
  card3Body:
    "सातनवरी गावाच्या विकासासाठी तंत्रज्ञानाचा वापर — शेतकऱ्यांच्या जीवनात बदल.",
  card4Title: "सुरक्षित व विश्वासू",
  card4Body:
    "तुमची माहिती पूर्णपणे सुरक्षित. कोणतीही वैयक्तिक माहिती शेअर केली जात नाही.",

  chip1: "पिकाची माहिती",
  chip2: "सरकारी योजना",
  chip3: "हवामान अपडेट",
  chip4: "बाजारभाव",
  chip5: "पशु आरोग्य",
  chip6: "MAAHI म्हणजे काय?",

  slide1Title: "MAAHI AI म्हणजे काय?",
  slide1Sub: "What is MAAHI AI?",
  slide1Body:
    "MAAHI हा एक स्मार्ट AI सहाय्यक आहे — एक डिजिटल मित्र जो तुमचे प्रश्न समजतो आणि लगेच उत्तर देतो.",
  slide2Title: "AI म्हणजे नक्की काय?",
  slide2Sub: "What exactly is AI?",
  slide2Body:
    '"कृत्रिम बुद्धिमत्ता" — एक संगणक जो माणसासारखा विचार करतो. जसे अनुभवी शेतकरी सल्ला देतो — तसेच MAAHI देते!',
  slide3Title: "MAAHI कशात मदत करते?",
  slide3Sub: "How does MAAHI help?",
  slide3List: [
    "🌾 शेती सल्ला व पीक माहिती",
    "🌦️ हवामान व पाऊस अंदाज",
    "💰 बाजारभाव व सरकारी योजना",
    "🐄 पशु आरोग्य व पशुपालन",
    "🏥 आरोग्य व प्रथमोपचार",
    "📚 शिक्षण व शिष्यवृत्ती",
  ],
  slide4Title: "कसे वापरायचे?",
  slide4Sub: "How to use MAAHI AI?",
  slide4List: [
    "1️⃣ खाली चॅट बॉक्समध्ये प्रश्न लिहा",
    "2️⃣ मराठी किंवा English — दोन्ही चालतात",
    "3️⃣ Send बटण दाबा",
    "4️⃣ MAAHI लगेच उत्तर देईल",
    "5️⃣ जुने संवाद History मध्ये पाहता येतात",
  ],
  slide5Title: "विश्वास ठेवता येईल का?",
  slide5Sub: "Can you trust MAAHI?",
  slide5Body:
    "MAAHI तुमची माहिती सुरक्षित ठेवते. आजारपण किंवा कायदेशीर बाबींसाठी नेहमी तज्ञांचा सल्ला घ्या.",

  feat1: "शेती सल्ला",
  feat2: "हवामान",
  feat3: "योजना माहिती",
  feat4: "पशु आरोग्य",
  statVal1: "24/7",
  statLabel1: "उपलब्ध",
  statVal2: "मराठी",
  statLabel2: "& English",
  statVal3: "100%",
  statLabel3: "मोफत",
  smartVillage: "स्मार्ट व्हिलेज सहाय्यक",
};

// ─── ENGLISH ──────────────────────────────────────────────────────────────────
const en: MaahiStrings = {
  langPickerTitle: "Choose Language",
  langPickerSub: "Select your preferred language",

  btnTitle: "Maahi AI Assistant",
  btnSub: "Talk • Type • Ask Anything",
  bubbleLine1: "👋 Ask me anything!",
  bubbleLine2: "I'm Maahi AI — your Smart Village Assistant",

  loginGreeting: "Welcome! 🙏",
  loginSubLogin: "Sign in and chat with MAAHI",
  loginSubRegister: "Create a new account",
  loginSubForgot: "Get a reset link on your email",
  loginTabLogin: "Sign In",
  loginTabRegister: "Register",
  loginEmailOrPhone: "Email or Phone Number",
  loginEmailPlaceholder: "email or phone",
  loginPassword: "Password",
  loginForgotLink: "Forgot password?",
  loginCTA: "🚀 Sign In",
  loginNewUserTitle: "New User?",
  loginNewUserBody: 'Use the "Register" tab above to create a new account.',

  regName: "Full Name",
  regNamePlaceholder: "Your name",
  regPhone: "Phone Number",
  regPhonePlaceholder: "10-digit number",
  regEmail: "Email",
  regVillage: "Select Village",
  regVillagePlaceholder: "Select village",
  regVillageLoading: "Loading villages...",
  regPassword: "Password",
  regPasswordPlaceholder: "Min. 6 characters",
  regConfirmPassword: "Confirm Password",
  regConfirmPlaceholder: "Re-enter password",
  regCTA: "✅ Register",
  regDisclaimer:
    "By registering you agree to our terms. Account will be created with Citizen / Read access.",

  forgotInfoBox:
    "📩 A password reset link will be sent to your registered email.",
  forgotEmailLabel: "Registered Email",
  forgotCTA: "📨 Send Reset Link",
  forgotBack: "← Go back",
  forgotSentTitle: "Email Sent!",
  forgotSentBody:
    "A password reset link has been sent. Please check your inbox.",
  forgotSentBack: "← Back to Login",

  onboardingWelcome: "Welcome! 🙏",
  onboardingVillage: "Satnawari Smart Village",
  onboardingNext: "Next →",
  onboardingStart: "🚀 Let's Start!",
  onboardingSkip: "Skip",

  chatTitle: "MAAHI AI",
  chatOnline: "Always Online",
  chatNewBtn: "New",
  chatLogout: "Logout",
  chatClose: "×",

  welcomeGreeting: "Hello! 🙏",
  welcomeSub: "I'm MAAHI — your AI Assistant",
  welcomeBody: "You can ask me anything in Marathi, Hindi or English.",
  welcomeStat1Val: "24/7",
  welcomeStat1Label: "Available",
  welcomeStat2Val: "3",
  welcomeStat2Label: "Languages",
  welcomeStat3Val: "100%",
  welcomeStat3Label: "Free",
  awarenessLabel: "Learn About MAAHI AI",
  startChatBtn: "💬 Start Chat",
  suggestionsLabel: "Common Questions",
  todayLabel: "Today's Conversation",

  inputPlaceholder: "Ask your question...",
  inputHint: "Press Enter or ↑ to send • Shift+Enter for new line",

  newChatTitle: "Start a new chat?",
  newChatBody: "The current conversation will be saved in history.",
  newChatCancel: "Cancel",
  newChatConfirm: "Yes, Start",

  sidebarBrand: "MAAHI AI",
  sidebarBrandSub: "Smart Village AI",
  sidebarNewChat: "New Chat",
  sidebarHistoryLabel: "Previous Chats",
  sidebarEmptyLine1: "No conversations",
  sidebarEmptyLine2: "yet",
  sidebarMsgCount: "{n} messages",
  sidebarDeleted: "Chat deleted",
  sidebarOnline: "Online",

  loading1: "Thinking...",
  loading2: "Searching for information...",
  loading3: "Preparing answer...",
  loading4: "Processing...",

  card1Title: "What is AI?",
  card1Body:
    "AI is a computer that thinks like a human, understands questions and gives answers.",
  card2Title: "How does MAAHI help?",
  card2Body:
    "Farming, health, weather, government schemes — ask anything, get instant answers.",
  card3Title: "Smart Village",
  card3Body:
    "Using technology for Satnawari village development — transforming farmers' lives.",
  card4Title: "Safe & Trustworthy",
  card4Body:
    "Your information is completely secure. No personal data is shared with anyone.",

  chip1: "Crop Information",
  chip2: "Government Schemes",
  chip3: "Weather Update",
  chip4: "Market Prices",
  chip5: "Animal Health",
  chip6: "What is MAAHI?",

  slide1Title: "What is MAAHI AI?",
  slide1Sub: "Your Smart Village Assistant",
  slide1Body:
    "MAAHI is a smart AI assistant — a digital friend who understands your questions and answers instantly.",
  slide2Title: "What exactly is AI?",
  slide2Sub: "Artificial Intelligence explained",
  slide2Body:
    '"Artificial Intelligence" — a computer that thinks like a human. Just like an experienced farmer gives advice — that\'s what MAAHI does!',
  slide3Title: "How does MAAHI help?",
  slide3Sub: "What can I ask?",
  slide3List: [
    "🌾 Farming advice & crop info",
    "🌦️ Weather & rainfall forecast",
    "💰 Market prices & govt schemes",
    "🐄 Animal health & husbandry",
    "🏥 Health & first aid",
    "📚 Education & scholarships",
  ],
  slide4Title: "How to use MAAHI?",
  slide4Sub: "It's simple!",
  slide4List: [
    "1️⃣ Type your question in the chat box",
    "2️⃣ Marathi, Hindi or English — all work",
    "3️⃣ Press the Send button",
    "4️⃣ MAAHI will answer instantly",
    "5️⃣ View past chats in History",
  ],
  slide5Title: "Can you trust MAAHI?",
  slide5Sub: "Privacy & Safety",
  slide5Body:
    "MAAHI keeps your information safe. For illness or legal matters, always consult a professional.",

  feat1: "Farming Advice",
  feat2: "Weather",
  feat3: "Govt Schemes",
  feat4: "Animal Health",
  statVal1: "24/7",
  statLabel1: "Available",
  statVal2: "3",
  statLabel2: "Languages",
  statVal3: "100%",
  statLabel3: "Free",
  smartVillage: "Smart Village Assistant",
};

// ─── HINDI ────────────────────────────────────────────────────────────────────
const hi: MaahiStrings = {
  langPickerTitle: "भाषा चुनें",
  langPickerSub: "अपनी पसंदीदा भाषा चुनें",

  btnTitle: "Maahi AI सहायक",
  btnSub: "बोलें • टाइप करें • पूछें",
  bubbleLine1: "👋 कुछ भी पूछें!",
  bubbleLine2: "मैं माही AI — आपका स्मार्ट गाँव सहायक",

  loginGreeting: "नमस्ते! 🙏",
  loginSubLogin: "लॉगिन करें और MAAHI से बात करें",
  loginSubRegister: "नया खाता बनाएं",
  loginSubForgot: "अपने ईमेल पर रीसेट लिंक पाएं",
  loginTabLogin: "लॉगिन · Sign In",
  loginTabRegister: "पंजीकरण · Register",
  loginEmailOrPhone: "ईमेल या फोन नंबर",
  loginEmailPlaceholder: "email या phone",
  loginPassword: "पासवर्ड",
  loginForgotLink: "पासवर्ड भूल गए?",
  loginCTA: "🚀 लॉगिन करें",
  loginNewUserTitle: "नए उपयोगकर्ता?",
  loginNewUserBody: '"पंजीकरण" टैब का उपयोग करके नया खाता बनाएं।',

  regName: "पूरा नाम",
  regNamePlaceholder: "आपका नाम",
  regPhone: "फोन नंबर",
  regPhonePlaceholder: "10 अंकों का नंबर",
  regEmail: "ईमेल",
  regVillage: "गाँव चुनें",
  regVillagePlaceholder: "गाँव चुनें",
  regVillageLoading: "गाँव लोड हो रहा है...",
  regPassword: "पासवर्ड",
  regPasswordPlaceholder: "कम से कम 6 अक्षर",
  regConfirmPassword: "पासवर्ड पुष्टि",
  regConfirmPlaceholder: "दोबारा दर्ज करें",
  regCTA: "✅ पंजीकरण करें",
  regDisclaimer:
    "पंजीकरण करके आप हमारी शर्तों से सहमत हैं। खाता Citizen / Read access के साथ बनेगा।",

  forgotInfoBox: "📩 आपके पंजीकृत ईमेल पर पासवर्ड रीसेट लिंक भेजा जाएगा।",
  forgotEmailLabel: "पंजीकृत ईमेल",
  forgotCTA: "📨 रीसेट लिंक भेजें",
  forgotBack: "← वापस जाएं",
  forgotSentTitle: "ईमेल भेजा गया!",
  forgotSentBody: "पासवर्ड रीसेट लिंक भेजा गया है। कृपया अपना इनबॉक्स जांचें।",
  forgotSentBack: "← लॉगिन पर वापस जाएं",

  onboardingWelcome: "नमस्ते! स्वागत है 🙏",
  onboardingVillage: "सातनवरी स्मार्ट विलेज",
  onboardingNext: "आगे →",
  onboardingStart: "🚀 शुरू करें!",
  onboardingSkip: "छोड़ें",

  chatTitle: "MAAHI AI — माही",
  chatOnline: "हमेशा उपलब्ध",
  chatNewBtn: "नया",
  chatLogout: "बाहर",
  chatClose: "×",

  welcomeGreeting: "नमस्ते! 🙏",
  welcomeSub: "मैं MAAHI — आपका AI सहायक",
  welcomeBody: "आप मुझसे हिंदी, मराठी या English में कोई भी सवाल पूछ सकते हैं।",
  welcomeStat1Val: "24/7",
  welcomeStat1Label: "उपलब्ध",
  welcomeStat2Val: "3",
  welcomeStat2Label: "भाषाएं",
  welcomeStat3Val: "100%",
  welcomeStat3Label: "मुफ्त",
  awarenessLabel: "MAAHI AI के बारे में जानें",
  startChatBtn: "💬 बातचीत शुरू करें",
  suggestionsLabel: "सामान्य प्रश्न",
  todayLabel: "आज की बातचीत",

  inputPlaceholder: "अपना सवाल पूछें...",
  inputHint: "Enter दबाएं या ↑ बटन का उपयोग करें • Shift+Enter नई लाइन",

  newChatTitle: "नई बातचीत शुरू करें?",
  newChatBody: "मौजूदा बातचीत इतिहास में सहेजी जाएगी।",
  newChatCancel: "रद्द करें",
  newChatConfirm: "हाँ, शुरू करें",

  sidebarBrand: "MAAHI AI",
  sidebarBrandSub: "Smart Village AI",
  sidebarNewChat: "नई बातचीत",
  sidebarHistoryLabel: "पिछली बातचीत",
  sidebarEmptyLine1: "अभी तक कोई",
  sidebarEmptyLine2: "बातचीत नहीं",
  sidebarMsgCount: "{n} संदेश",
  sidebarDeleted: "बातचीत हटाई",
  sidebarOnline: "Online",

  loading1: "सोच रहा हूँ...",
  loading2: "जानकारी खोज रहा हूँ...",
  loading3: "जवाब तैयार कर रहा हूँ...",
  loading4: "प्रक्रिया हो रही है...",

  card1Title: "AI क्या है?",
  card1Body:
    "AI एक ऐसा कंप्यूटर है जो इंसान की तरह सोचता है, सवाल समझता है और जवाब देता है।",
  card2Title: "MAAHI कैसे मदद करती है?",
  card2Body:
    "खेती, स्वास्थ्य, मौसम, सरकारी योजनाएं — कोई भी सवाल पूछें, तुरंत जवाब मिलेगा।",
  card3Title: "स्मार्ट विलेज",
  card3Body:
    "सातनवरी गाँव के विकास के लिए तकनीक का उपयोग — किसानों के जीवन में बदलाव।",
  card4Title: "सुरक्षित और भरोसेमंद",
  card4Body:
    "आपकी जानकारी पूरी तरह सुरक्षित है। कोई भी व्यक्तिगत जानकारी साझा नहीं की जाती।",

  chip1: "फसल की जानकारी",
  chip2: "सरकारी योजनाएं",
  chip3: "मौसम अपडेट",
  chip4: "बाजार भाव",
  chip5: "पशु स्वास्थ्य",
  chip6: "MAAHI क्या है?",

  slide1Title: "MAAHI AI क्या है?",
  slide1Sub: "आपका स्मार्ट गाँव सहायक",
  slide1Body:
    "MAAHI एक स्मार्ट AI सहायक है — एक डिजिटल दोस्त जो आपके सवाल समझता है और तुरंत जवाब देता है।",
  slide2Title: "AI वास्तव में क्या है?",
  slide2Sub: "कृत्रिम बुद्धिमत्ता",
  slide2Body:
    '"कृत्रिम बुद्धिमत्ता" — एक कंप्यूटर जो इंसान की तरह सोचता है। जैसे अनुभवी किसान सलाह देता है — वैसे ही MAAHI देती है!',
  slide3Title: "MAAHI किसमें मदद करती है?",
  slide3Sub: "क्या पूछ सकते हैं?",
  slide3List: [
    "🌾 खेती सलाह और फसल जानकारी",
    "🌦️ मौसम और वर्षा का अनुमान",
    "💰 बाजार भाव और सरकारी योजनाएं",
    "🐄 पशु स्वास्थ्य और पशुपालन",
    "🏥 स्वास्थ्य और प्राथमिक चिकित्सा",
    "📚 शिक्षा और छात्रवृत्ति",
  ],
  slide4Title: "कैसे उपयोग करें?",
  slide4Sub: "बहुत आसान है!",
  slide4List: [
    "1️⃣ नीचे चैट बॉक्स में सवाल लिखें",
    "2️⃣ हिंदी, मराठी या English — सभी चलते हैं",
    "3️⃣ Send बटन दबाएं",
    "4️⃣ MAAHI तुरंत जवाब देगी",
    "5️⃣ पुरानी बातचीत History में देखें",
  ],
  slide5Title: "क्या MAAHI पर भरोसा कर सकते हैं?",
  slide5Sub: "गोपनीयता और सुरक्षा",
  slide5Body:
    "MAAHI आपकी जानकारी सुरक्षित रखती है। बीमारी या कानूनी मामलों के लिए हमेशा विशेषज्ञ से सलाह लें।",

  feat1: "खेती सलाह",
  feat2: "मौसम",
  feat3: "योजना जानकारी",
  feat4: "पशु स्वास्थ्य",
  statVal1: "24/7",
  statLabel1: "उपलब्ध",
  statVal2: "3",
  statLabel2: "भाषाएं",
  statVal3: "100%",
  statLabel3: "मुफ्त",
  smartVillage: "स्मार्ट विलेज सहायक",
};

// ─── Export ───────────────────────────────────────────────────────────────────

export const TRANSLATIONS: Record<Lang, MaahiStrings> = { mr, en, hi };

export const t = (lang: Lang): MaahiStrings => TRANSLATIONS[lang];
