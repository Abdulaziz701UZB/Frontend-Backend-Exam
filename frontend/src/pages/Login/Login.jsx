import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEduAuth } from "../../context/EduAuthContext";
import {
  HiBolt,
  HiLockClosed,
  HiOutlineDevicePhoneMobile,
  HiEye,
  HiEyeSlash,
  HiArrowRightOnRectangle,
  HiExclamationCircle,
  HiShieldCheck
} from "react-icons/hi2";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { login, authError } = useEduAuth();

  const [phoneDigits, setPhoneDigits] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState("");

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
      <div className="login-card-container">
        <div className="login-brand-header">
          <div className="login-logo-badge">
            <HiBolt className="login-logo-icon" />
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
        </form>

        <div className="login-footer-info">
          <span>VELNEX • PostgreSQL & Express REST API</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
