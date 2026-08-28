import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useEduAuth } from "../../context/EduAuthContext";
import { 
  HiBars3, 
  HiMagnifyingGlass, 
  HiCalendarDays, 
  HiLockClosed, 
  HiXMark, 
  HiKey,
  HiOutlineArrowRightOnRectangle,
  HiOutlineBell,
  HiOutlineCurrencyDollar,
  HiOutlineClock
} from "react-icons/hi2";
import { FaCrown, FaChalkboardUser, FaGraduationCap } from "react-icons/fa6";
import { MdWavingHand } from "react-icons/md";
import "./Header.css";

const Header = ({ onToggleMobileMenu, onOpenCmdPalette }) => {
  const navigate = useNavigate();
  const notifRef = useRef(null);
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

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "unlock",
      title: "Davomat So'rovi",
      message: "F-12 guruhi o'qituvchisi 03-Avgust darsini ochishni so'radi",
      time: "5 daqiqa oldin",
      read: false
    },
    {
      id: 2,
      type: "payment",
      title: "Yangi To'lov",
      message: "Abdulaziz Abdulhayev 450,000 so'm to'lov qildi",
      time: "25 daqiqa oldin",
      read: false
    },
    {
      id: 3,
      type: "schedule",
      title: "Dars Eslatmasi",
      message: "14:00 da Frontend ReactJS guruhi darsi boshlanadi",
      time: "1 soat oldin",
      read: true
    }
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    if (notificationsOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [notificationsOpen]);

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

            <div className="crm-notif-wrapper" ref={notifRef}>
              <button
                type="button"
                className={`crm-notif-btn ${notificationsOpen ? "active" : ""}`}
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                title="Bildirishnomalar"
              >
                <HiOutlineBell className="notif-icon" />
                {unreadCount > 0 && <span className="notif-badge-count">{unreadCount}</span>}
              </button>

              {notificationsOpen && (
                <div className="crm-notif-dropdown" onClick={(e) => e.stopPropagation()}>
                  <div className="crm-notif-header">
                    <div className="notif-header-left">
                      <span className="notif-title">Bildirishnomalar</span>
                      {unreadCount > 0 && <span className="notif-unread-pill">{unreadCount} yangi</span>}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        className="notif-mark-read-btn"
                        onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
                      >
                        Barchasi o'qildi
                      </button>
                    )}
                  </div>

                  <div className="crm-notif-list">
                    {notifications.length === 0 ? (
                      <div className="notif-empty-state">
                        <HiOutlineBell className="notif-empty-icon" />
                        <p>Yangi bildirishnomalar yo'q</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`notif-item ${!notif.read ? "unread" : ""}`}
                          onClick={() => {
                            setNotifications((prev) =>
                              prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
                            );
                          }}
                        >
                          <div className={`notif-type-icon icon-${notif.type}`}>
                            {notif.type === "unlock" ? (
                              <HiLockClosed />
                            ) : notif.type === "payment" ? (
                              <HiOutlineCurrencyDollar />
                            ) : (
                              <HiOutlineClock />
                            )}
                          </div>
                          <div className="notif-content">
                            <div className="notif-item-top">
                              <span className="notif-item-title">{notif.title}</span>
                              <span className="notif-time">{notif.time}</span>
                            </div>
                            <p className="notif-desc">{notif.message}</p>
                          </div>
                          {!notif.read && <span className="notif-blue-dot"></span>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              className="crm-logout-btn"
              onClick={handleLogout}
              title="Tizimdan chiqish"
            >
              <HiOutlineArrowRightOnRectangle className="logout-icon" />
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
                  placeholder="Admin parolini kiriting"
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
