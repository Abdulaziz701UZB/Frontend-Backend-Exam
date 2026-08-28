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
  HiOutlineClock,
  HiOutlineCheck,
  HiOutlineTrash,
  HiOutlineUser,
  HiOutlineArrowTopRightOnSquare
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

  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState("all");
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "unlock",
      title: "Davomat So'rovi",
      message: "F-12 guruhi o'qituvchisi 03-Avgust darsi uchun qulfni ochish so'rovini yubordi.",
      time: "5 daqiqa oldin",
      read: false,
      link: "/attendance"
    },
    {
      id: 2,
      type: "payment",
      title: "Yangi To'lov Qabul Qilindi",
      message: "Abdulaziz Abdulhayev (Frontend kursi) 450,000 so'm to'lov qildi.",
      time: "25 daqiqa oldin",
      read: false,
      link: "/payments"
    },
    {
      id: 3,
      type: "schedule",
      title: "Dars Eslatmasi",
      message: "14:00 da Frontend ReactJS guruhi darsi boshlanadi (2-Xona).",
      time: "1 soat oldin",
      read: true,
      link: "/attendance"
    },
    {
      id: 4,
      type: "student",
      title: "Yangi O'quvchi Ro'yxatdan O'tdi",
      message: "Rustam Qodirov 'Frontend ReactJS' guruhiga qo'shildi.",
      time: "Bugun 09:15",
      read: true,
      link: "/students"
    }
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifs = notifications.filter((n) => {
    if (notifFilter === "unread") return !n.read;
    if (notifFilter === "unlock") return n.type === "unlock";
    if (notifFilter === "payment") return n.type === "payment";
    if (notifFilter === "schedule") return n.type === "schedule";
    return true;
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isNotifModalOpen) {
        setIsNotifModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isNotifModalOpen]);

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
              type="button"
              className={`crm-notif-btn ${isNotifModalOpen ? "active" : ""}`}
              onClick={() => setIsNotifModalOpen(true)}
              title="Bildirishnomalar markazini ochish"
            >
              <HiOutlineBell className="notif-icon" />
              {unreadCount > 0 && <span className="notif-badge-count">{unreadCount}</span>}
            </button>

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

      {/* BILDIRISHNOMALAR MARKAZI MODALI */}
      {isNotifModalOpen && (
        <div className="crm-notif-modal-backdrop" onClick={() => setIsNotifModalOpen(false)}>
          <div className="crm-notif-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="crm-notif-modal-header">
              <div className="notif-modal-title-group">
                <div className="notif-modal-icon-badge">
                  <HiOutlineBell className="modal-bell-svg" />
                </div>
                <div>
                  <h3 className="notif-modal-title">Bildirishnomalar Markazi</h3>
                  <p className="notif-modal-subtitle">
                    O'quv markazi so'rovlari, to'lovlar va dars eslatmalari
                  </p>
                </div>
              </div>
              <div className="notif-modal-header-actions">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    className="btn-mark-all-read"
                    onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
                    title="Barcha xabarlarni o'qilgan deb belgilash"
                  >
                    <HiOutlineCheck /> Barchasi o'qildi
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    type="button"
                    className="btn-clear-notifs"
                    onClick={() => setNotifications([])}
                    title="Bildirishnomalarni tozalash"
                  >
                    <HiOutlineTrash />
                  </button>
                )}
                <button
                  type="button"
                  className="btn-close-notif-modal"
                  onClick={() => setIsNotifModalOpen(false)}
                  title="Yopish (Esc)"
                >
                  <HiXMark />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="crm-notif-modal-tabs">
              <button
                type="button"
                className={`notif-tab-btn ${notifFilter === "all" ? "active" : ""}`}
                onClick={() => setNotifFilter("all")}
              >
                Barchasi ({notifications.length})
              </button>
              <button
                type="button"
                className={`notif-tab-btn ${notifFilter === "unread" ? "active" : ""}`}
                onClick={() => setNotifFilter("unread")}
              >
                O'qilmagan ({unreadCount})
              </button>
              <button
                type="button"
                className={`notif-tab-btn ${notifFilter === "unlock" ? "active" : ""}`}
                onClick={() => setNotifFilter("unlock")}
              >
                Davomat So'rovlari
              </button>
              <button
                type="button"
                className={`notif-tab-btn ${notifFilter === "payment" ? "active" : ""}`}
                onClick={() => setNotifFilter("payment")}
              >
                To'lovlar
              </button>
              <button
                type="button"
                className={`notif-tab-btn ${notifFilter === "schedule" ? "active" : ""}`}
                onClick={() => setNotifFilter("schedule")}
              >
                Dars Eslatmalari
              </button>
            </div>

            {/* Notifications List Body */}
            <div className="crm-notif-modal-body">
              {filteredNotifs.length === 0 ? (
                <div className="notif-modal-empty">
                  <div className="empty-bell-circle">
                    <HiOutlineBell />
                  </div>
                  <h4>Hozircha bildirishnomalar yo'q</h4>
                  <p>Yangi dars so'rovlari va to'lovlar shu yerda paydo bo'ladi</p>
                </div>
              ) : (
                <div className="notif-modal-cards-list">
                  {filteredNotifs.map((notif) => (
                    <div
                      key={notif.id}
                      className={`notif-modal-card-item ${!notif.read ? "is-unread" : ""}`}
                      onClick={() => {
                        setNotifications((prev) =>
                          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
                        );
                        if (notif.link) {
                          setIsNotifModalOpen(false);
                          navigate(notif.link);
                        }
                      }}
                    >
                      <div className={`notif-card-icon-wrap type-${notif.type}`}>
                        {notif.type === "unlock" ? (
                          <HiLockClosed />
                        ) : notif.type === "payment" ? (
                          <HiOutlineCurrencyDollar />
                        ) : notif.type === "schedule" ? (
                          <HiOutlineClock />
                        ) : (
                          <HiOutlineUser />
                        )}
                      </div>

                      <div className="notif-card-details">
                        <div className="notif-card-top-row">
                          <span className="notif-card-title">{notif.title}</span>
                          <span className="notif-card-time">{notif.time}</span>
                        </div>
                        <p className="notif-card-msg">{notif.message}</p>
                        {notif.link && (
                          <div className="notif-card-footer-action">
                            <span className="notif-link-hint">
                              O'tish <HiOutlineArrowTopRightOnSquare />
                            </span>
                          </div>
                        )}
                      </div>

                      {!notif.read && <span className="notif-unread-glow-dot"></span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="crm-notif-modal-footer">
              <div className="notif-footer-hint">
                <span className="live-status-dot"></span> Bildirishnomalar real-vaqtda sinxronlanadi
              </div>
              <button
                type="button"
                className="btn-modal-close-footer"
                onClick={() => setIsNotifModalOpen(false)}
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
