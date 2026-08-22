import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEduAuth } from "../../context/EduAuthContext";
import {
  HiBolt,
  HiLockClosed,
  HiEye,
  HiEyeSlash,
  HiArrowRightOnRectangle,
  HiSparkles,
  HiCheckCircle,
  HiExclamationCircle,
  HiShieldCheck,
  HiOutlineUser
} from "react-icons/hi2";
import { FaCrown, FaChalkboardUser, FaGraduationCap } from "react-icons/fa6";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { login, authError, setAuthError, allAdmins, allTeachers, allStudents } = useEduAuth();

  const [selectedRole, setSelectedRole] = useState("admin");
  const [selectedUserId, setSelectedUserId] = useState(201);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setAuthError("");
    if (role === "admin") setSelectedUserId(201);
    else if (role === "teacher") setSelectedUserId(allTeachers[0]?.id || 101);
    else setSelectedUserId(allStudents[0]?.id || 1);
  };

  const getUserList = () => {
    if (selectedRole === "admin") return allAdmins || [];
    if (selectedRole === "teacher") return allTeachers || [];
    return allStudents || [];
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      const success = login(selectedRole, password, selectedUserId);
      setIsLoading(false);
      if (success) {
        navigate("/");
      }
    }, 400);
  };

  const fillDemoPassword = () => {
    setPassword("10102013");
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
            O'quv Markazini Avtomatlashtirish va Boshqarish Tizimi
          </p>
        </div>

        {authError && (
          <div className="login-alert-error">
            <HiExclamationCircle className="alert-icon" />
            <span>{authError}</span>
          </div>
        )}

        <div className="login-role-tabs">
          <button
            type="button"
            className={`role-tab-btn ${selectedRole === "admin" ? "active" : ""}`}
            onClick={() => handleRoleChange("admin")}
          >
            <FaCrown />
            <span>Admin</span>
          </button>
          <button
            type="button"
            className={`role-tab-btn ${selectedRole === "teacher" ? "active" : ""}`}
            onClick={() => handleRoleChange("teacher")}
          >
            <FaChalkboardUser />
            <span>O'qituvchi</span>
          </button>
          <button
            type="button"
            className={`role-tab-btn ${selectedRole === "student" ? "active" : ""}`}
            onClick={() => handleRoleChange("student")}
          >
            <FaGraduationCap />
            <span>O'quvchi</span>
          </button>
        </div>

        <form onSubmit={handleLoginSubmit} className="login-form">
          <div className="login-form-group">
            <label className="login-form-label">
              <HiOutlineUser style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Foydalanuvchini tanlang:
            </label>
            <select
              className="login-form-select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(parseInt(e.target.value))}
            >
              {getUserList().map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name || u.fullName} ({u.roleTitle || u.subject || u.groupName || "Foydalanuvchi"})
                </option>
              ))}
            </select>
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
                onClick={fillDemoPassword}
              >
                <HiSparkles style={{ verticalAlign: 'middle', marginRight: 2 }} />
                Parolni to'ldirish
              </button>
            </div>
            <div className="login-password-input-wrap">
              <input
                type={showPassword ? "text" : "password"}
                className="login-form-input"
                placeholder="Parolni kiriting (masalan: 10102013)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
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
            <span>Universal kirish paroli: <strong>10102013</strong> yoki <strong>1010201300</strong></span>
          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Kirilmoqda...</span>
            ) : (
              <>
                <HiArrowRightOnRectangle />
                <span>Tizimga Kirish</span>
              </>
            )}
          </button>
        </form>

        <div className="login-footer-info">
          <span>EduControl CRM • PostgreSQL & Express API bilan to'liq integratsiya qilingan</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
