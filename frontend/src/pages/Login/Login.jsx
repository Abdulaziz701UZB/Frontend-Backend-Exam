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
  HiArrowTopRightOnSquare
} from "react-icons/hi2";
import { FaTelegram } from "react-icons/fa6";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { login, authError } = useEduAuth();

  const [phoneDigits, setPhoneDigits] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      setLocalError("Iltimos, 9 xonali telefon raqamingizni to'liq kiriting!");
      return;
    }

    const fullPhone = `+998 ${phoneDigits.trim()}`;
    setIsLoading(true);
    setTimeout(() => {
      const success = login(fullPhone, password);
      setIsLoading(false);
      if (success) {
        navigate("/");
      }
    }, 350);
  };

  const activeErrorMessage = localError || authError;

  return (
    <div className="login-page-wrapper">
      <button
        type="button"
        className="login-floating-theme-btn"
        onClick={toggleTheme}
        title={isDarkTheme ? "Yorug' rejimga o'tish" : "Tungi rejimga o'tish"}
      >
        {isDarkTheme ? <HiSun className="theme-icon sun" /> : <HiMoon className="theme-icon moon" />}
        <span>{isDarkTheme ? "Yorug' Rejim" : "Tungi Rejim"}</span>
      </button>

      <div className="login-card-container">
        <div className="login-brand-header">
          <div className="login-logo-badge">
            <img src="/velnex-logo.png" alt="VELNEX" className="login-logo-img" />
          </div>
          <h1 className="login-system-title">VELNEX</h1>
          <p className="login-system-subtitle">
            Tizimga kirish uchun telefon raqamingiz va parolingizni kiriting
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
              Telefon raqami:
            </label>
            <div className="login-phone-input-group">
              <span className="phone-prefix-badge">+998</span>
              <input
                type="tel"
                className="login-phone-input-field"
                placeholder=""
                value={phoneDigits}
                onChange={handlePhoneChange}
                maxLength={12}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="login-form-group">
            <label className="login-form-label">
              <HiLockClosed className="inline-icon-xs" />
              Tizim paroli:
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
            <a
              href="https://t.me/Abdulaziz7o1"
              target="_blank"
              rel="noopener noreferrer"
              className="login-contact-admin-link"
              title="Admin bilan Telegram orqali bog'lanish"
            >
              <FaTelegram className="tg-link-icon" />
              <span>Admin bilan bog'lanish (@Abdulaziz7o1)</span>
              <HiArrowTopRightOnSquare className="tg-arrow-icon" />
            </a>
          </div>

          <div className="login-credentials-hint">
            <HiShieldCheck className="hint-icon" />
            <span>Universal parol: <strong>10102013</strong> yoki <strong>1010201300</strong></span>
          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Tekshirilmoqda...</span>
            ) : (
              <>
                <HiArrowRightOnRectangle />
                <span>Tizimga Kirish</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="login-qr-open-btn"
            onClick={() => setShowQrModal(true)}
          >
            <HiQrCode className="qr-btn-icon" />
            <span>QR Kod orqali kirish (Admin Bot)</span>
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
                <h3>Admin Bot QR Kod orqali Kirish</h3>
              </div>
              <button
                className="login-qr-close-btn"
                onClick={() => setShowQrModal(false)}
                aria-label="Yopish"
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
                  1. Telegram ilovasida <strong>@VelnexAdminBot</strong> ni oching.
                </p>
                <p className="qr-step-text">
                  2. Botdagi <strong>/login</strong> buyrug'ini yuboring yoki kamerangiz bilan QR kodni skanerlang.
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
                  <span>Admin Botni Telegramda Ochish</span>
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
