import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useEduAuth } from "../../context/EduAuthContext";
import { useToast } from "../../context/ToastContext";
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
  HiOutlineArrowTopRightOnSquare,
  HiOutlineSpeakerWave,
  HiOutlineSpeakerXMark,
  HiOutlineDevicePhoneMobile,
  HiOutlinePaperAirplane,
  HiOutlineExclamationTriangle,
  HiOutlineChartBar,
  HiOutlineChatBubbleLeftRight,
  HiOutlineCheckBadge,
  HiOutlineChevronDown,
  HiOutlineArrowPath
} from "react-icons/hi2";
import { FaCrown, FaChalkboardUser, FaGraduationCap, FaTelegram } from "react-icons/fa6";
import { MdWavingHand } from "react-icons/md";
import "./Header.css";
const DEFAULT_TEST_NOTIFICATIONS = [
  {
    id: 1,
    type: "unlock", // 1. Qabul / Rad qilish & 3. O'qituvchiga javob
    title: "Davomat Qulfini Ochish So'rovi",
    message: "F-12 guruhi o'qituvchisi (Abdulaziz) 03-Avgust darsini ochishni so'radi. Sabab: 'Baho kiritish unutilgan'.",
    time: "5 daqiqa oldin",
    dateKey: "today",
    group: "F-12 Guruh",
    targetDate: "2026-08-03",
    status: "pending", // pending | approved | rejected
    read: false,
    link: "/attendance/G-101"
  },
  {
    id: 2,
    type: "conflict", // 15. Xona / O'qituvchi To'qnashuvi
    title: "Xona To'qnashuvi Ogohlantirishi",
    message: "2-Xonada 14:00 da bir vaqtda 2 ta guruh (F-12 va Backend NodeJS) darsi belgilangan!",
    time: "15 daqiqa oldin",
    dateKey: "today",
    read: false,
    link: "/rooms"
  },
  {
    id: 3,
    type: "schedule", // 14. Darsga Jonli Countdown
    title: "Dars Eslatmasi (Yaqinlashmoqda)",
    message: "Frontend ReactJS guruhi darsi boshlanishiga oz vaqt qoldi (2-Xona).",
    time: "Bugun 14:00",
    dateKey: "today",
    targetTime: "14:00",
    read: false,
    link: "/attendance/G-101"
  },
  {
    id: 4,
    type: "payment", // 2. To'lov + SMS/Telegram
    title: "Yangi To'lov Qabul Qilindi",
    message: "Abdulaziz Abdulhayev (Frontend kursi) 450,000 so'm to'lov qildi.",
    time: "25 daqiqa oldin",
    dateKey: "today",
    studentName: "Abdulaziz Abdulhayev",
    amount: "450,000 so'm",
    read: false,
    link: "/payments"
  },
  {
    id: 5,
    type: "student",
    title: "Yangi O'quvchi Ro'yxatdan O'tdi",
    message: "Rustam Qodirov 'Frontend ReactJS' guruhiga muvaffaqiyatli qo'shildi.",
    time: "Kecha 18:40",
    dateKey: "yesterday",
    read: true,
    link: "/students"
  },
  {
    id: 6,
    type: "unlock",
    title: "O'tilgan Darsni Qayta Baholash So'rovi",
    message: "Backend NodeJS guruhi o'qituvchisi (Sarvar) 01-Avgust imtihon bahosini to'g'irlash uchun ruxsat so'radi.",
    time: "3 kun oldin",
    dateKey: "week",
    group: "NodeJS Guruh",
    targetDate: "2026-08-01",
    status: "approved",
    read: true,
    link: "/attendance/G-101"
  }
];

const Header = ({ onToggleMobileMenu, onOpenCmdPalette }) => {
  const navigate = useNavigate();
  const toast = useToast();
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

  // 19. Ovozli Signal (Apple Web Audio API Chime)
  const [soundEnabled, setSoundEnabled] = useState(true);

  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      console.log("Audio play error", e);
    }
  };

  // 18. Haftalik Xulosa (Weekly Digest) ko'rsatish
  const [showWeeklyDigest, setShowWeeklyDigest] = useState(true);

  // 10. Sana Bo'yicha Filtr
  const [dateFilter, setDateFilter] = useState("all"); // all | today | yesterday | week

  // 3. O'qituvchiga Javob Yozish State
  const [replyingNotifId, setReplyingNotifId] = useState(null);
  const [quickReplyText, setQuickReplyText] = useState("");

  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState("all");
  const [notifications, setNotifications] = useState(DEFAULT_TEST_NOTIFICATIONS);

  // Sinov Ma'lumotlarini Qayta Yuklash
  const handleReloadDemoData = () => {
    setNotifications(DEFAULT_TEST_NOTIFICATIONS);
    setNotifFilter("all");
    setDateFilter("all");
    playChime();
    toast.success("🔄 8 ta sinov bildirishnomalari muvaffaqiyatli yuklandi!");
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // 1. Modal Ichidan To'g'ridan-to'g'ri Qabul Qilish (Approve)
  const handleApproveUnlock = (notifId, groupName, date) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notifId ? { ...n, status: "approved", read: true } : n
      )
    );
    playChime();
    toast.success(`✅ "${groupName}" guruhining ${date} darsi qulfi muvaffaqiyatli ochildi! O'qituvchiga ruxsat berildi.`);
  };

  // 1. Rad etish (Reject)
  const handleRejectUnlock = (notifId) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notifId ? { ...n, status: "rejected", read: true } : n
      )
    );
    playChime();
    toast.info("❌ So'rov rad etildi va o'qituvchiga xabar qilindi.");
  };

  // 2. Bir bosishda Telegram Botga yuborish
  const handleSendTelegram = (notif) => {
    playChime();
    toast.success(`📲 Telegram bot orqali rasmiy xabarnoma muvaffaqiyatli jo'natildi!`);
  };

  // 2. Bir bosishda SMS yuborish
  const handleSendSMS = (notif) => {
    playChime();
    toast.success(`📩 Ota-onasiga SMS xabarnoma muvaffaqiyatli yuborildi!`);
  };

  // 3. O'qituvchiga Javob Yuborish
  const handleSendQuickReply = (notifId) => {
    if (!quickReplyText.trim()) return;
    toast.success(`💬 O'qituvchiga javob yuborildi: "${quickReplyText}"`);
    playChime();
    setReplyingNotifId(null);
    setQuickReplyText("");
  };

  // 14. Jonli Countdown hisoblash (Live Lesson Countdown)
  const getLiveCountdownText = (targetTimeStr = "14:00") => {
    const parts = targetTimeStr.split(":");
    if (parts.length !== 2) return "Tez orada";
    const [targetH, targetM] = parts.map(Number);
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const targetMins = targetH * 60 + targetM;
    const diff = targetMins - currentMins;

    if (diff > 0 && diff <= 120) {
      const h = Math.floor(diff / 60);
      const m = diff % 60;
      return h > 0 ? `⏳ ${h}s ${m}m qoldi` : `⏳ ${m} daqiqa qoldi`;
    } else if (diff <= 0 && diff >= -120) {
      return `⚡ Dars ketmoqda (${Math.abs(diff)}m)`;
    }
    return `⏰ Soat ${targetTimeStr} da`;
  };

  const filteredNotifs = notifications.filter((n) => {
    // Category filter
    if (notifFilter === "unread" && n.read) return false;
    if (notifFilter === "unlock" && n.type !== "unlock") return false;
    if (notifFilter === "payment" && n.type !== "payment") return false;
    if (notifFilter === "schedule" && n.type !== "schedule") return false;
    if (notifFilter === "conflict" && n.type !== "conflict") return false;

    // 10. Date filter
    if (dateFilter === "today" && n.dateKey !== "today") return false;
    if (dateFilter === "yesterday" && n.dateKey !== "yesterday") return false;
    if (dateFilter === "week" && n.dateKey !== "today" && n.dateKey !== "yesterday") return false;

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

      {/* BILDIRISHNOMALAR MARKAZI MODALI (TOP 8 IMKONIYAT) */}
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
                    So'rovlar, to'lovlar, to'qnashuvlar va jonli dars eslatmalari
                  </p>
                </div>
              </div>
              <div className="notif-modal-header-actions">
                {/* 19. Ovozli Signal Toggle */}
                <button
                  type="button"
                  className={`btn-header-action-icon btn-sound-toggle ${soundEnabled ? "sound-on" : "sound-off"}`}
                  onClick={() => {
                    setSoundEnabled(!soundEnabled);
                    if (!soundEnabled) playChime();
                  }}
                  title={soundEnabled ? "Ovozli signal yoqilgan (O'chirish)" : "Ovozli signal o'chirilgan (Yoqish)"}
                >
                  {soundEnabled ? <HiOutlineSpeakerWave /> : <HiOutlineSpeakerXMark />}
                </button>

                {/* Demo Data Reload Button */}
                <button
                  type="button"
                  className="btn-header-action-icon btn-reload-demo"
                  onClick={handleReloadDemoData}
                  title="8 ta sinov bildirishnomasini qayta yuklash"
                >
                  <HiOutlineArrowPath />
                </button>

                {/* Faqat Tick (Barchasi o'qildi) */}
                {unreadCount > 0 && (
                  <button
                    type="button"
                    className="btn-header-action-icon btn-mark-all-read"
                    onClick={() => {
                      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                      playChime();
                    }}
                    title="Barcha xabarlarni o'qilgan deb belgilash"
                  >
                    <HiOutlineCheck />
                  </button>
                )}

                {notifications.length > 0 && (
                  <button
                    type="button"
                    className="btn-header-action-icon btn-clear-notifs"
                    onClick={() => {
                      setNotifications([]);
                      playChime();
                    }}
                    title="Bildirishnomalarni tozalash"
                  >
                    <HiOutlineTrash />
                  </button>
                )}

                <button
                  type="button"
                  className="btn-header-action-icon btn-close-notif-modal"
                  onClick={() => setIsNotifModalOpen(false)}
                  title="Yopish (Esc)"
                >
                  <HiXMark />
                </button>
              </div>
            </div>

            {/* Category Filter Tabs */}
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
                className={`notif-tab-btn ${notifFilter === "conflict" ? "active" : ""}`}
                onClick={() => setNotifFilter("conflict")}
              >
                To'qnashuvlar ⚠️
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

            {/* 10. Sana Bo'yicha Filtr Pillslari (Date Filter Row) */}
            <div className="crm-notif-date-filter-row">
              <span className="date-filter-label">Sana:</span>
              <div className="date-filter-chips">
                <button
                  type="button"
                  className={`date-chip ${dateFilter === "all" ? "active" : ""}`}
                  onClick={() => setDateFilter("all")}
                >
                  Hammasi
                </button>
                <button
                  type="button"
                  className={`date-chip ${dateFilter === "today" ? "active" : ""}`}
                  onClick={() => setDateFilter("today")}
                >
                  Bugun
                </button>
                <button
                  type="button"
                  className={`date-chip ${dateFilter === "yesterday" ? "active" : ""}`}
                  onClick={() => setDateFilter("yesterday")}
                >
                  Kecha
                </button>
                <button
                  type="button"
                  className={`date-chip ${dateFilter === "week" ? "active" : ""}`}
                  onClick={() => setDateFilter("week")}
                >
                  Shu hafta
                </button>
              </div>

              {/* 18. Haftalik Xulosa Toggle */}
              <button
                type="button"
                className={`btn-toggle-digest ${showWeeklyDigest ? "active" : ""}`}
                onClick={() => setShowWeeklyDigest(!showWeeklyDigest)}
                title="Haftalik qisqa hisobotni ko'rish/yashirish"
              >
                <HiOutlineChartBar /> Haftalik Xulosa
              </button>
            </div>

            {/* 18. Haftalik Qisqacha Xulosa (Weekly Digest Summary Card) */}
            {showWeeklyDigest && (
              <div className="crm-weekly-digest-banner">
                <div className="digest-col">
                  <span className="digest-label">📈 O'rtacha Davomat</span>
                  <span className="digest-val text-green">94.2%</span>
                </div>
                <div className="digest-col">
                  <span className="digest-label">💰 Haftalik Tushum</span>
                  <span className="digest-val text-blue">8,450,000 so'm</span>
                </div>
                <div className="digest-col">
                  <span className="digest-label">👥 Faol O'quvchilar</span>
                  <span className="digest-val">128 ta</span>
                </div>
                <div className="digest-col">
                  <span className="digest-label">⚡ Darslar Soni</span>
                  <span className="digest-val">32 ta</span>
                </div>
              </div>
            )}

            {/* Notifications List Body */}
            <div className="crm-notif-modal-body">
              {filteredNotifs.length === 0 ? (
                <div className="notif-modal-empty">
                  <div className="empty-bell-circle">
                    <HiOutlineBell />
                  </div>
                  <h4>Hozircha bildirishnomalar yo'q</h4>
                  <p>Yangi dars so'rovlari va to'lovlar shu yerda paydo bo'ladi</p>
                  <button
                    type="button"
                    className="btn-load-demo-notifs"
                    onClick={handleReloadDemoData}
                  >
                    <HiOutlineArrowPath /> ⚡ 8 ta Sinov Xabarlarini Yuklash
                  </button>
                </div>
              ) : (
                <div className="notif-modal-cards-list">
                  {filteredNotifs.map((notif) => (
                    <div
                      key={notif.id}
                      className={`notif-modal-card-item ${!notif.read ? "is-unread" : ""} type-${notif.type}`}
                      onClick={() => {
                        setNotifications((prev) =>
                          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
                        );
                      }}
                    >
                      <div className={`notif-card-icon-wrap type-${notif.type}`}>
                        {notif.type === "unlock" ? (
                          <HiLockClosed />
                        ) : notif.type === "conflict" ? (
                          <HiOutlineExclamationTriangle />
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
                          <div className="notif-title-badge-flex">
                            <span className="notif-card-title">{notif.title}</span>
                            {notif.type === "unlock" && (
                              <span className={`status-pill pill-${notif.status || "pending"}`}>
                                {notif.status === "approved"
                                  ? "✓ Ruxsat berildi"
                                  : notif.status === "rejected"
                                  ? "✕ Rad etildi"
                                  : "⏳ Kutilmoqda"}
                              </span>
                            )}
                            {/* 14. Jonli Countdown Nishoni */}
                            {notif.type === "schedule" && (
                              <span className="countdown-pill-badge">
                                {getLiveCountdownText(notif.targetTime || "14:00")}
                              </span>
                            )}
                            {/* 15. To'qnashuv Qizil Nishoni */}
                            {notif.type === "conflict" && (
                              <span className="conflict-pill-badge">
                                ⚠️ Shoshilinch To'qnashuv
                              </span>
                            )}
                          </div>
                          <span className="notif-card-time">{notif.time}</span>
                        </div>

                        <p className="notif-card-msg">{notif.message}</p>

                        {/* 1. Modal Ichidan To'g'ridan-to'g'ri Qabul / Rad qilish (Unlock requests) */}
                        {notif.type === "unlock" && notif.status !== "approved" && notif.status !== "rejected" && (
                          <div className="notif-action-btn-row" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              className="btn-quick-approve"
                              onClick={() => handleApproveUnlock(notif.id, notif.group || "Guruh", notif.targetDate || "Dars")}
                            >
                              <HiOutlineCheckBadge /> Qabul qilish & Ochish
                            </button>
                            <button
                              type="button"
                              className="btn-quick-reject"
                              onClick={() => handleRejectUnlock(notif.id)}
                            >
                              <HiXMark /> Rad etish
                            </button>
                            {/* 3. O'qituvchiga Javob Qoldirish Toggle */}
                            <button
                              type="button"
                              className="btn-quick-reply-toggle"
                              onClick={() => setReplyingNotifId(replyingNotifId === notif.id ? null : notif.id)}
                            >
                              <HiOutlineChatBubbleLeftRight /> Javob yozish
                            </button>
                          </div>
                        )}

                        {/* 3. O'qituvchiga Tezkor Javob Qoldirish Formasi */}
                        {replyingNotifId === notif.id && (
                          <div className="notif-quick-reply-box" onClick={(e) => e.stopPropagation()}>
                            <div className="quick-reply-chips">
                              <span
                                className="reply-chip"
                                onClick={() => setQuickReplyText("18:00 gacha ochildi, baholarni kiriting.")}
                              >
                                "18:00 gacha ochildi"
                              </span>
                              <span
                                className="reply-chip"
                                onClick={() => setQuickReplyText("Davomat tekshirildi va tasdiqlandi.")}
                              >
                                "Davomat tasdiqlandi"
                              </span>
                              <span
                                className="reply-chip"
                                onClick={() => setQuickReplyText("Sababini batafsilroq yozing.")}
                              >
                                "Batafsil yozing"
                              </span>
                            </div>
                            <div className="quick-reply-input-wrap">
                              <input
                                type="text"
                                className="quick-reply-input"
                                placeholder="O'qituvchiga xabar yozing..."
                                value={quickReplyText}
                                onChange={(e) => setQuickReplyText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSendQuickReply(notif.id);
                                }}
                              />
                              <button
                                type="button"
                                className="btn-send-reply"
                                onClick={() => handleSendQuickReply(notif.id)}
                              >
                                <HiOutlinePaperAirplane />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* 2. Bir bosishda Telegram Bot & SMS yuborish (To'lov va boshqalar) */}
                        {notif.type === "payment" && (
                          <div className="notif-action-btn-row" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              className="btn-action-tg"
                              onClick={() => handleSendTelegram(notif)}
                              title="Telegram bot orqali o'quvchiga chek yuborish"
                            >
                              <FaTelegram /> Botga Chek Yuborish
                            </button>
                            <button
                              type="button"
                              className="btn-action-sms"
                              onClick={() => handleSendSMS(notif)}
                              title="Ota-onasiga SMS xabarnoma jo'natish"
                            >
                              <HiOutlineDevicePhoneMobile /> Ota-onaga SMS
                            </button>
                          </div>
                        )}

                        {/* 15. To'qnashuv uchun harakat tugmasi */}
                        {notif.type === "conflict" && (
                          <div className="notif-action-btn-row" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              className="btn-resolve-conflict"
                              onClick={() => {
                                setIsNotifModalOpen(false);
                                navigate(notif.link || "/rooms");
                              }}
                            >
                              Xonani Boshqarish / Jadvalni Ko'rish <HiOutlineArrowTopRightOnSquare />
                            </button>
                          </div>
                        )}

                        {/* Link hint */}
                        {notif.link && notif.type !== "conflict" && notif.type !== "unlock" && (
                          <div className="notif-card-footer-action">
                            <span
                              className="notif-link-hint"
                              onClick={() => {
                                setIsNotifModalOpen(false);
                                navigate(notif.link);
                              }}
                            >
                              Sahifaga o'tish <HiOutlineArrowTopRightOnSquare />
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
                <span className="live-status-dot"></span> Bildirishnomalar markazi faol & avto-sinxronlanadi
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
