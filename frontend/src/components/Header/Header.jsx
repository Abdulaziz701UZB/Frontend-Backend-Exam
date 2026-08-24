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

  const getFormattedDate = () => {
    const d = new Date();
    const months = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];
    const days = ["Yak", "Dush", "Sesh", "Chor", "Pay", "Juma", "Shan"];
    return `${d.getDate()}-${months[d.getMonth()]}, ${d.getFullYear()} (${days[d.getDay()]})`;
  };

  const formattedDate = getFormattedDate();

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
        <div className="crm-header-main-row">
          <div className="header-left-flex">
            <button
              className="mobile-hamburger-btn"
              onClick={onToggleMobileMenu}
              aria-label="Menuni ochish"
            >
              <HiBars3 />
            </button>

            <div className="crm-user-profile">
              <div className="user-avatar-wrap">
                <span className="user-avatar-emoji">
                  {currentRole === "admin" && <FaCrown />}
                  {currentRole === "teacher" && <FaChalkboardUser />}
                  {currentRole === "student" && <FaGraduationCap />}
                </span>
              </div>
              <div className="user-info-text">
                <div className="header-greeting-row">
                  <span className="user-display-name">
                    Xush kelibsiz, {firstName}
                  </span>
                  <span className="waving-hand-wrap">
                    <MdWavingHand className="waving-hand-icon" />
                  </span>
                </div>
                <span className="header-date-text">
                  <HiCalendarDays className="inline-icon-xs" />
                  {formattedDate}
                </span>
              </div>
            </div>
          </div>

          <div className="header-right-actions">
            <button
              className="cmd-trigger-btn"
              onClick={onOpenCmdPalette}
              title="Tezkor qidiruv modali (Ctrl + K)"
            >
              <HiMagnifyingGlass />
              <span className="cmd-text-label">Tezkor Qidiruv</span>
              <code className="cmd-kbd">Ctrl + K</code>
            </button>

            <div className="role-switcher-container desktop-only-roles">
              <div className="role-buttons">
                <button
                  className={`role-btn ${currentRole === "admin" ? "active" : ""}`}
                  onClick={() => openAuthModal("admin")}
                  title="Admin sifatida kiring"
                >
                  <FaCrown /> <span>Admin</span>
                </button>
                <button
                  className={`role-btn ${currentRole === "teacher" ? "active" : ""}`}
                  onClick={() => openAuthModal("teacher")}
                  title="O'qituvchi sifatida kiring"
                >
                  <FaChalkboardUser /> <span>O'qituvchi</span>
                </button>
                <button
                  className={`role-btn ${currentRole === "student" ? "active" : ""}`}
                  onClick={() => openAuthModal("student")}
                  title="O'quvchi sifatida kiring"
                >
                  <FaGraduationCap /> <span>O'quvchi</span>
                </button>
              </div>
            </div>

            <button
              className="crm-logout-btn"
              onClick={handleLogout}
              title="Tizimdan chiqish"
            >
              <HiOutlineArrowRightOnRectangle className="logout-icon" />
              <span className="logout-text">Chiqish</span>
            </button>
          </div>
        </div>

        <div className="header-mobile-roles-row">
          <div className="role-switcher-container mobile-role-container">
            <div className="role-buttons">
              <button
                className={`role-btn ${currentRole === "admin" ? "active" : ""}`}
                onClick={() => openAuthModal("admin")}
              >
                <FaCrown /> <span>Admin</span>
              </button>
              <button
                className={`role-btn ${currentRole === "teacher" ? "active" : ""}`}
                onClick={() => openAuthModal("teacher")}
              >
                <FaChalkboardUser /> <span>O'qituvchi</span>
              </button>
              <button
                className={`role-btn ${currentRole === "student" ? "active" : ""}`}
                onClick={() => openAuthModal("student")}
              >
                <FaGraduationCap /> <span>O'quvchi</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {authModalOpen && (
        <div className="modal-overlay" onClick={() => setAuthModalOpen(false)}>
          <div className="modal-content card auth-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <HiLockClosed className="inline-icon-sm" />
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
