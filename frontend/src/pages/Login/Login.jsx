import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEduAuth } from "../../context/EduAuthContext";
import {
  HiLockClosed,
  HiOutlineDevicePhoneMobile,
  HiEye,
  HiEyeSlash,
  HiArrowRightOnRectangle,
  HiExclamationCircle,
  HiShieldCheck,
  HiQrCode,
  HiSun,
  HiMoon,
  HiXMark,
  HiArrowTopRightOnSquare,
  HiLanguage
} from "react-icons/hi2";
import { FaTelegram } from "react-icons/fa6";
import "./Login.css";

const TRANSLATIONS = {
  uz: {
    subtitle: "Tizimga kirish uchun telefon raqamingiz va parolingizni kiriting",
    phoneLabel: "Telefon raqami:",
    passwordLabel: "Tizim paroli:",
    contactAdmin: "Admin bilan bog'lanish (@Abdulaziz7o1)",
    universalPassword: "Universal parol:",
    or: "yoki",
    signIn: "Tizimga Kirish",
    checking: "Tekshirilmoqda...",
    qrBtn: "QR Kod orqali kirish (Admin Bot)",
    qrTitle: "Admin Bot QR Kod orqali Kirish",
    qrStep1: "1. Telegram ilovasida @VelnexAdminBot ni oching.",
    qrStep2: "2. Botdagi /login buyrug'ini yuboring yoki kamerangiz bilan QR kodni skanerlang.",
    openBot: "Admin Botni Telegramda Ochish",
    lightMode: "Yorug'",
    darkMode: "Tungi",
    lengthError: "Iltimos, 9 xonali telefon raqamingizni to'liq kiriting!"
  },
  ru: {
    subtitle: "Введите номер телефона и пароль для входа в систему",
    phoneLabel: "Номер телефона:",
    passwordLabel: "Пароль системы:",
    contactAdmin: "Связаться с админом (@Abdulaziz7o1)",
    universalPassword: "Универсальный пароль:",
    or: "или",
    signIn: "Войти в систему",
    checking: "Проверка...",
    qrBtn: "Вход по QR-коду (Admin Bot)",
    qrTitle: "Вход через Telegram Admin Bot по QR-коду",
    qrStep1: "1. Откройте @VelnexAdminBot в Telegram.",
    qrStep2: "2. Отправьте /login или отсканируйте QR-код камерой.",
    openBot: "Открыть Admin Bot в Telegram",
    lightMode: "Светлая",
    darkMode: "Тёмная",
    lengthError: "Пожалуйста, введите полный 9-значный номер телефона!"
  },
  en: {
    subtitle: "Enter your phone number and password to log in",
    phoneLabel: "Phone number:",
    passwordLabel: "System password:",
    contactAdmin: "Contact Admin (@Abdulaziz7o1)",
    universalPassword: "Universal password:",
    or: "or",
    signIn: "Sign In",
    checking: "Checking...",
    qrBtn: "QR Code Login (Admin Bot)",
    qrTitle: "Admin Bot QR Code Login",
    qrStep1: "1. Open @VelnexAdminBot in Telegram.",
    qrStep2: "2. Send /login command or scan QR code with camera.",
    openBot: "Open Admin Bot in Telegram",
    lightMode: "Light",
    darkMode: "Dark",
    lengthError: "Please enter your full 9-digit phone number!"
  }
};

const Login = () => {
  const navigate = useNavigate();
  const { login, authError } = useEduAuth();

  const [lang, setLang] = useState(() => {
    return localStorage.getItem("velnex_lang") || "uz";
  });

  const [phoneDigits, setPhoneDigits] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const [showQrModal, setShowQrModal] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    return localStorage.getItem("velnex_theme") === "dark" || document.body.classList.contains("dark-theme");
  });

  useEffect(() => {
    if (isDarkTheme) {
      document.body.classList.add("dark-theme");
      localStorage.setItem("velnex_theme", "dark");
    } else {
      document.body.classList.remove("dark-theme");
      localStorage.setItem("velnex_theme", "light");
    }
  }, [isDarkTheme]);

  const handleLangChange = (selectedLang) => {
    setLang(selectedLang);
    localStorage.setItem("velnex_lang", selectedLang);
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.uz;

  const toggleTheme = () => {
    setIsDarkTheme((prev) => !prev);
  };

  const format9DigitsOnly = (input) => {
    let digits = input.replace(/\D/g, "");
    if (digits.startsWith("998")) {
      digits = digits.slice(3);
    }
    digits = digits.slice(0, 9);

    let res = "";
    if (digits.length > 0) res += digits.slice(0, 2);
    if (digits.length > 2) res += " " + digits.slice(2, 5);
    if (digits.length > 5) res += " " + digits.slice(5, 7);
    if (digits.length > 7) res += " " + digits.slice(7, 9);
    return res;
  };

  const handlePhoneChange = (e) => {
    setLocalError("");
    const formatted = format9DigitsOnly(e.target.value);
    setPhoneDigits(formatted);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLocalError("");

    const cleanDigits = phoneDigits.replace(/\D/g, "");
    if (cleanDigits.length < 9) {
      setLocalError(t.lengthError);
      return;
    }

    const fullPhone = `+998 ${phoneDigits.trim()}`;
    setIsLoading(true);
    setTimeout(() => {
      const success = login(fullPhone, password);
      setIsLoading(false);
      if (success) {
        navigate("/dashboard");
      }
    }, 350);
  };

  const activeErrorMessage = localError || authError;

  return (
    <div className="login-page-wrapper">
      <div className="login-top-controls">
        <div className="login-lang-switch-group">
          <HiLanguage className="lang-icon" />
          <button
            type="button"
            className={`login-lang-btn ${lang === "uz" ? "active" : ""}`}
            onClick={() => handleLangChange("uz")}
          >
            UZ
          </button>
          <button
            type="button"
            className={`login-lang-btn ${lang === "ru" ? "active" : ""}`}
            onClick={() => handleLangChange("ru")}
          >
            RU
          </button>
          <button
            type="button"
            className={`login-lang-btn ${lang === "en" ? "active" : ""}`}
            onClick={() => handleLangChange("en")}
          >
            EN
          </button>
        </div>

        <button
          type="button"
          className="login-floating-theme-btn"
          onClick={toggleTheme}
          title={isDarkTheme ? t.lightMode : t.darkMode}
        >
          {isDarkTheme ? <HiSun className="theme-icon sun" /> : <HiMoon className="theme-icon moon" />}
          <span>{isDarkTheme ? t.lightMode : t.darkMode}</span>
        </button>
      </div>

      <div className="login-card-container">
        <div className="login-brand-header">
          <div className="login-logo-badge">
            <img src="/velnex-logo.png" alt="VELNEX" className="login-logo-img" />
          </div>
          <h1 className="login-system-title">VELNEX</h1>
          <p className="login-system-subtitle">
            {t.subtitle}
          </p>
        </div>

        {activeErrorMessage && (
          <div className="login-alert-error">
            <HiExclamationCircle className="alert-icon" />
            <span>{activeErrorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="login-form">
          <div className="login-form-group">
            <label className="login-form-label">
              <HiOutlineDevicePhoneMobile className="inline-icon-xs" />
              {t.phoneLabel}
            </label>
            <div className="login-phone-input-group">
              <span className="phone-prefix-badge">+998</span>
              <input
                type="tel"
                className="login-phone-input-field"
                placeholder=""
                value={phoneDigits}
                onChange={handlePhoneChange}
                onFocus={() => setIsPhoneFocused(true)}
                onBlur={() => setIsPhoneFocused(false)}
                maxLength={12}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="login-form-group">
            <label className="login-form-label">
              <HiLockClosed className="inline-icon-xs" />
              {t.passwordLabel}
            </label>
            <div className="login-password-input-wrap">
              <input
                type={showPassword ? "text" : "password"}
                className="login-form-input"
                placeholder=""
                value={password}
                onChange={(e) => {
                  setLocalError("");
                  setPassword(e.target.value);
                }}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                required
              />
              <button
                type="button"
                className="login-password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <HiEyeSlash /> : <HiEye />}
              </button>
            </div>
          </div>

          <div className="login-support-row">
            <div className={`login-tiny-mascot ${isPasswordFocused ? (showPassword ? "mascot-peek" : "mascot-hide") : (isPhoneFocused ? "mascot-look-down" : "mascot-normal")}`}>
              <svg className="mascot-svg" viewBox="0 0 110 90" width="38" height="32">
                <circle cx="55" cy="45" r="35" fill="#4f46e5" />
                <circle cx="55" cy="45" r="31" fill="#6366f1" />
                
                {/* Left Eye */}
                <circle cx="42" cy="42" r="11" fill="#ffffff" />
                <circle className="mascot-pupil left" cx="42" cy={isPhoneFocused ? "46" : "42"} r="5.5" fill="#0f172a" />
                <circle cx="40" cy={isPhoneFocused ? "44" : "40"} r="2" fill="#ffffff" />
                
                {/* Right Eye */}
                <circle cx="68" cy="42" r="11" fill="#ffffff" />
                <circle className="mascot-pupil right" cx="68" cy={isPhoneFocused ? "46" : "42"} r="5.5" fill="#0f172a" />
                <circle cx="66" cy={isPhoneFocused ? "44" : "40"} r="2" fill="#ffffff" />

                {/* Smile */}
                <path d="M 48 58 Q 55 64 62 58" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />

                {/* Cheeks */}
                <circle cx="32" cy="50" r="3.5" fill="rgba(244, 114, 182, 0.7)" />
                <circle cx="78" cy="50" r="3.5" fill="rgba(244, 114, 182, 0.7)" />

                {/* Hands for covering eyes */}
                <g className="mascot-hand left-hand">
                  <rect x="25" y="28" width="26" height="24" rx="12" fill="#3730a3" stroke="#4338ca" strokeWidth="2" />
                </g>
                <g className="mascot-hand right-hand">
                  <rect x="59" y="28" width="26" height="24" rx="12" fill="#3730a3" stroke="#4338ca" strokeWidth="2" />
                </g>
              </svg>
            </div>

            <a
              href="https://t.me/Abdulaziz7o1"
              target="_blank"
              rel="noopener noreferrer"
              className="login-contact-admin-link"
              title="Telegram"
            >
              <FaTelegram className="tg-link-icon" />
              <span>{t.contactAdmin}</span>
              <HiArrowTopRightOnSquare className="tg-arrow-icon" />
            </a>
          </div>

          <div className="login-credentials-hint">
            <HiShieldCheck className="hint-icon" />
            <span>{t.universalPassword} <strong>10102013</strong> {t.or} <strong>1010201300</strong></span>
          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <span>{t.checking}</span>
            ) : (
              <>
                <HiArrowRightOnRectangle />
                <span>{t.signIn}</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="login-qr-open-btn"
            onClick={() => setShowQrModal(true)}
          >
            <HiQrCode className="qr-btn-icon" />
            <span>{t.qrBtn}</span>
          </button>
        </form>

        <div className="login-footer-info">
          <span>VELNEX • PostgreSQL & Express REST API</span>
        </div>
      </div>

      {showQrModal && (
        <div className="login-qr-modal-backdrop" onClick={() => setShowQrModal(false)}>
          <div className="login-qr-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="login-qr-modal-header">
              <div className="qr-header-title-wrap">
                <HiQrCode className="qr-header-icon" />
                <h3>{t.qrTitle}</h3>
              </div>
              <button
                className="login-qr-close-btn"
                onClick={() => setShowQrModal(false)}
                aria-label="Close"
              >
                <HiXMark />
              </button>
            </div>

            <div className="login-qr-modal-body">
              <div className="qr-code-frame">
                <div className="qr-simulated-box">
                  <svg className="qr-matrix-svg" viewBox="0 0 200 200" width="180" height="180">
                    <rect width="200" height="200" fill="#ffffff" />
                    <rect x="15" y="15" width="50" height="50" fill="#0f172a" rx="8" />
                    <rect x="25" y="25" width="30" height="30" fill="#ffffff" rx="4" />
                    <rect x="33" y="33" width="14" height="14" fill="#4f46e5" />
                    <rect x="135" y="15" width="50" height="50" fill="#0f172a" rx="8" />
                    <rect x="145" y="25" width="30" height="30" fill="#ffffff" rx="4" />
                    <rect x="153" y="33" width="14" height="14" fill="#4f46e5" />
                    <rect x="15" y="135" width="50" height="50" fill="#0f172a" rx="8" />
                    <rect x="25" y="145" width="30" height="30" fill="#ffffff" rx="4" />
                    <rect x="33" y="153" width="14" height="14" fill="#4f46e5" />
                    <circle cx="90" cy="30" r="5" fill="#334155" />
                    <circle cx="110" cy="30" r="5" fill="#334155" />
                    <circle cx="80" cy="50" r="6" fill="#334155" />
                    <circle cx="100" cy="50" r="6" fill="#334155" />
                    <circle cx="120" cy="50" r="6" fill="#334155" />
                    <circle cx="30" cy="90" r="5" fill="#334155" />
                    <circle cx="50" cy="90" r="5" fill="#334155" />
                    <circle cx="30" cy="110" r="5" fill="#334155" />
                    <circle cx="50" cy="110" r="5" fill="#334155" />
                    <circle cx="150" cy="90" r="5" fill="#334155" />
                    <circle cx="170" cy="90" r="5" fill="#334155" />
                    <circle cx="150" cy="110" r="5" fill="#334155" />
                    <circle cx="170" cy="110" r="5" fill="#334155" />
                    <circle cx="90" cy="150" r="5" fill="#334155" />
                    <circle cx="110" cy="150" r="5" fill="#334155" />
                    <circle cx="90" cy="170" r="5" fill="#334155" />
                    <circle cx="110" cy="170" r="5" fill="#334155" />
                    <circle cx="130" cy="150" r="5" fill="#334155" />
                    <circle cx="150" cy="170" r="5" fill="#334155" />
                    <circle cx="170" cy="150" r="5" fill="#334155" />
                    <rect x="75" y="75" width="50" height="50" fill="#ffffff" rx="10" />
                    <image href="/velnex-logo.png" x="80" y="80" width="40" height="40" />
                  </svg>
                </div>
              </div>

              <div className="qr-instructions">
                <p className="qr-step-text">
                  {t.qrStep1}
                </p>
                <p className="qr-step-text">
                  {t.qrStep2}
                </p>
              </div>

              <div className="qr-modal-actions">
                <a
                  href="https://t.me/VelnexAdminBot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-open-telegram-bot"
                >
                  <FaTelegram className="tg-modal-icon" />
                  <span>{t.openBot}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
