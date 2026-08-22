import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEduAuth } from "../../context/EduAuthContext";
import { 
  HiBars3, 
  HiMagnifyingGlass, 
  HiCalendarDays, 
  HiLockClosed, 
  HiXMark, 
  HiKey,
  HiOutlineArrowRightOnRectangle
} from "react-icons/hi2";
import { FaCrown, FaChalkboardUser, FaGraduationCap } from "react-icons/fa6";
import { MdWavingHand } from "react-icons/md";
import "./Header.css";

const Header = ({ onToggleMobileMenu, onOpenCmdPalette }) => {
  const navigate = useNavigate();
  const {
    currentRole,
    switchRoleWithPassword,
    logout,
    user,
    authError,
    setAuthError,
    allAdmins,
    allTeachers,
    allStudents,
  } = useEduAuth();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [targetRole, setTargetRole] = useState("admin");
  const [targetUserId, setTargetUserId] = useState(201);
  const [passwordInput, setPasswordInput] = useState("");

  const currentDate = new Date().toLocaleDateString("uz-UZ", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const openAuthModal = (role) => {
    setTargetRole(role);
    setAuthError("");
    setPasswordInput("");

    if (role === "admin") setTargetUserId(201);
    else if (role === "teacher") setTargetUserId(allTeachers[0]?.id || 101);
    else setTargetUserId(allStudents[0]?.id || 1);

    setAuthModalOpen(true);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const success = switchRoleWithPassword(
      targetRole,
      passwordInput,
      targetUserId,
    );
    if (success) {
      setAuthModalOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getTargetUserList = () => {
    if (targetRole === "admin") return allAdmins || [];
    if (targetRole === "teacher") return allTeachers || [];
    return allStudents || [];
  };

  const displayName = user?.name || user?.fullName || "Abdulaziz Abdulhayev";
  const firstName = displayName.split(" ")[0] || "Abdulaziz";

  return (
    <header className="crm-header">
      <div className="crm-header-content">
        <div className="header-left-flex">
          <button
            className="mobile-hamburger-btn"
            onClick={onToggleMobileMenu}
            aria-label="Menuni ochish"
          >
            <HiBars3 />
          </button>
          <div className="header-welcome">
            <h1 className="header-greeting">
              Xush kelibsiz, {firstName}{" "}
              <span className="waving-hand-wrap" title="Salom!">
                <MdWavingHand className="waving-hand-icon" />
              </span>
            </h1>
            <p className="header-date">
              <HiCalendarDays style={{ verticalAlign: 'middle', marginRight: 4 }} /> {currentDate}
            </p>
          </div>
        </div>

        <div className="header-right-actions">
          <button
            className="cmd-trigger-btn"
            onClick={onOpenCmdPalette}
            title="Tezkor qidiruv modali (Ctrl + K)"
          >
            <HiMagnifyingGlass /> <span>Tezkor Qidiruv</span>{" "}
            <code className="cmd-kbd">Ctrl + K</code>
          </button>

          <div className="role-switcher-container">
            <span className="switcher-label">
              <HiLockClosed style={{ verticalAlign: 'middle', marginRight: 3 }} /> Rolga Kirish:
            </span>
            <div className="role-buttons">
              <button
                className={`role-btn ${currentRole === "admin" ? "active" : ""}`}
                onClick={() => openAuthModal("admin")}
                title="Admin sifati kiring (Parol so'raladi)"
              >
                <FaCrown /> Admin
              </button>
              <button
                className={`role-btn ${currentRole === "teacher" ? "active" : ""}`}
                onClick={() => openAuthModal("teacher")}
                title="O'qituvchi sifatida kiring (Parol so'raladi)"
              >
                <FaChalkboardUser /> O'qituvchi
              </button>
              <button
                className={`role-btn ${currentRole === "student" ? "active" : ""}`}
                onClick={() => openAuthModal("student")}
                title="O'quvchi sifatida kiring (Parol so'raladi)"
              >
                <FaGraduationCap /> O'quvchi
              </button>
            </div>
          </div>

          <div className="crm-user-profile">
            <div className="user-avatar-wrap">
              <span className="user-avatar-emoji">
                {currentRole === "admin" && <FaCrown />}
                {currentRole === "teacher" && <FaChalkboardUser />}
                {currentRole === "student" && <FaGraduationCap />}
              </span>
            </div>
            <div className="user-info-text">
              <p className="user-display-name">{displayName}</p>
              <p className="user-display-role">
                {user?.roleTitle || (currentRole === "teacher" ? "O'qituvchi" : currentRole === "student" ? "O'quvchi" : "Administrator")}
              </p>
            </div>
          </div>

          <button
            className="crm-logout-btn"
            onClick={handleLogout}
            title="Tizimdan chiqish (Log Out)"
          >
            <HiOutlineArrowRightOnRectangle className="logout-icon" />
            <span>Chiqish</span>
          </button>
        </div>
      </div>

      {authModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content card auth-modal-card">
            <div className="modal-header">
              <h2>
                <HiLockClosed style={{ marginRight: 6, verticalAlign: 'middle' }} />
                {targetRole === "admin"
                  ? "Admin Paneli Paroli"
                  : targetRole === "teacher"
                    ? "O'qituvchi Kabineti"
                    : "O'quvchi Kabineti"}
              </h2>
              <button
                className="close-modal-btn"
                onClick={() => setAuthModalOpen(false)}
                aria-label="Yopish"
              >
                <HiXMark />
              </button>
            </div>

            {authError && <div className="alert alert-error">{authError}</div>}

            <form onSubmit={handlePasswordSubmit} className="admin-modal-form">
              <div className="form-group">
                <label className="form-label">
                  Foydalanuvchini Tanlang:
                </label>
                <select
                  className="form-select"
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(parseInt(e.target.value))}
                >
                  {getTargetUserList().map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.fullName} (
                      {u.roleTitle ||
                        u.subject ||
                        u.groupName ||
                        "Foydalanuvchi"}
                      )
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Tizim Parolini Kiriting:</label>
                <input
                  type="password"
                  className="form-input"
                  required
                  placeholder="Parolni kiriting"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setAuthModalOpen(false)}
                >
                  Bekor qilish
                </button>
                <button type="submit" className="btn btn-primary">
                  <HiKey /> Kirish va Tasdiqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
