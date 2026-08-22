import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEduAuth } from "../../context/EduAuthContext";
import {
  HiBolt,
  HiLockClosed,
  HiOutlineEnvelope,
  HiEye,
  HiEyeSlash,
  HiArrowRightOnRectangle,
  HiSparkles,
  HiExclamationCircle,
  HiShieldCheck
} from "react-icons/hi2";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { login, authError, setAuthError } = useEduAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      const success = login(email, password);
      setIsLoading(false);
      if (success) {
        navigate("/");
      }
    }, 350);
  };

  const fillDemoCredentials = () => {
    setEmail("admin@educontrol.uz");
    setPassword("10102013");
    setAuthError("");
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card-container">
        <div className="login-brand-header">
          <div className="login-logo-badge">
            <HiBolt className="login-logo-icon" />
          </div>
          <h1 className="login-system-title">EduControl CRM</h1>
          <p className="login-system-subtitle">
            Tizimga kirish uchun Email va parolingizni kiriting
          </p>
        </div>

        {authError && (
          <div className="login-alert-error">
            <HiExclamationCircle className="alert-icon" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="login-form">
          <div className="login-form-group">
            <label className="login-form-label">
              <HiOutlineEnvelope style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Elektron pochta (Email):
            </label>
            <div className="login-input-wrap">
              <input
                type="email"
                className="login-form-input"
                placeholder="Elektron pochtangizni kiriting (admin@educontrol.uz)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="login-form-group">
            <div className="login-label-row">
              <label className="login-form-label">
                <HiLockClosed style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Tizim paroli:
              </label>
              <button
                type="button"
                className="login-quick-fill-btn"
                onClick={fillDemoCredentials}
              >
                <HiSparkles style={{ verticalAlign: 'middle', marginRight: 2 }} />
                Avto-to'ldirish
              </button>
            </div>
            <div className="login-password-input-wrap">
              <input
                type={showPassword ? "text" : "password"}
                className="login-form-input"
                placeholder="Parolingizni kiriting"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          <span>EduControl CRM • PostgreSQL & Express REST API</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
