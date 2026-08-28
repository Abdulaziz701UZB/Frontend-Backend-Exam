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
const DEFAULT_ADMIN_NOTIFICATIONS = [
  {
    id: "adm_1",
    role: "admin",
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
    id: "adm_2",
    role: "admin",
    type: "conflict", // 15. Xona / O'qituvchi To'qnashuvi
    title: "Xona To'qnashuvi Ogohlantirishi",
    message: "2-Xonada 14:00 da bir vaqtda 2 ta guruh (F-12 va Backend NodeJS) darsi belgilangan!",
    time: "15 daqiqa oldin",
    dateKey: "today",
    read: false,
    link: "/rooms"
  },
  {
    id: "adm_3",
    role: "admin",
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
    id: "adm_4",
    role: "admin",
    type: "student",
    title: "Yangi O'quvchi Ro'yxatdan O'tdi",
    message: "Rustam Qodirov 'Frontend ReactJS' guruhiga muvaffaqiyatli qo'shildi.",
    time: "Kecha 18:40",
    dateKey: "yesterday",
    read: true,
    link: "/students"
  },
  {
    id: "adm_5",
    role: "admin",
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

const DEFAULT_TEACHER_NOTIFICATIONS = [
  {
    id: "tch_1",
    role: "teacher",
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
    id: "tch_2",
    role: "teacher",
    type: "unlock_approved",
    title: "✅ Dars Qulfi Ochildi (Ruxsat Berildi)",
    message: "Administrator 01-Avgust darsi bo'yicha baholash so'rovingizni tasdiqladi va darsni ochdi.",
    time: "Kecha 17:15",
    dateKey: "yesterday",
    group: "Frontend ReactJS",
    targetDate: "2026-08-01",
    status: "approved",
    read: false,
    link: "/attendance/G-101"
  },
  {
    id: "tch_3",
    role: "teacher",
    type: "homework",
    title: "📝 Yangi Uy Vazifasi Topshirildi",
    message: "Sardor Alimov 'JavaScript Promises & Async/Await' mavzusi bo'yicha uy vazifasini tekshirish uchun topshirdi.",
    time: "Bugun 11:30",
    dateKey: "today",
    read: false,
    link: "/homework"
  },
  {
    id: "tch_4",
    role: "teacher",
    type: "reply",
    title: "💬 Administratordan Xabar",
    message: "Admin: 'Davomat tasdiqlandi, bugun soat 18:00 gacha kiritishingiz mumkin.'",
    time: "2 soat oldin",
    dateKey: "today",
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

  // 19. Ovozli Qo'ng'iroq Signali (Real Ting-Ting Crystal Brass Bell Chime)
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isBellRinging, setIsBellRinging] = useState(false);

  const playBellChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // 3-bosqichli jarangdor qo'ng'iroq chalinishi: "Ting... Ting... Ting..."
      const notes = [
        { time: 0, freq: 1174.66, dur: 0.35, vol: 0.18 }, // D6
        { time: 0.13, freq: 1567.98, dur: 0.45, vol: 0.24 }, // G6
        { time: 0.26, freq: 1760.00, dur: 0.75, vol: 0.28 }, // A6
      ];

      notes.forEach((n) => {
        const osc = ctx.createOscillator();
        const overtone = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(n.freq, ctx.currentTime + n.time);

        overtone.type = "triangle";
        overtone.frequency.setValueAtTime(n.freq * 2, ctx.currentTime + n.time);

        gain.gain.setValueAtTime(0.001, ctx.currentTime + n.time);
        gain.gain.exponentialRampToValueAtTime(n.vol, ctx.currentTime + n.time + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + n.time + n.dur);

        osc.connect(gain);
        overtone.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + n.time);
        overtone.start(ctx.currentTime + n.time);
        osc.stop(ctx.currentTime + n.time + n.dur);
        overtone.stop(ctx.currentTime + n.time + n.dur);
      });
    } catch (e) {
      console.log("Audio play error", e);
    }
  };

  const triggerBellRing = () => {
    setIsBellRinging(true);
    playBellChime();
    setTimeout(() => setIsBellRinging(false), 1200);
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

  // Bildirishnomalarni yuklash va roli bo'yicha qat'iy ajratish
  const getInitialNotifications = () => {
    try {
      const saved = localStorage.getItem("velnex_all_notifications_v3");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [...DEFAULT_ADMIN_NOTIFICATIONS, ...DEFAULT_TEACHER_NOTIFICATIONS];
  };

  const [allNotifications, setAllNotifications] = useState(getInitialNotifications);

  // Avtomatik saqlash
  useEffect(() => {
    try {
      localStorage.setItem("velnex_all_notifications_v3", JSON.stringify(allNotifications));
    } catch (e) {}
  }, [allNotifications]);

  // Real-vaqtda boshqa joydan yangi xabar kelganda qabul qilish va qo'ng'iroqni chalish
  useEffect(() => {
    const handleNewNotif = (e) => {
      try {
        const saved = localStorage.getItem("velnex_all_notifications_v3");
        if (saved) {
          setAllNotifications(JSON.parse(saved));
        }
        const target = e.detail?.targetRole;
        if (!target || target === currentRole) {
          triggerBellRing();
        }
      } catch (err) {
        console.error(err);
      }
    };

    window.addEventListener("velnex_new_notification", handleNewNotif);
    window.addEventListener("storage", handleNewNotif);
    return () => {
      window.removeEventListener("velnex_new_notification", handleNewNotif);
      window.removeEventListener("storage", handleNewNotif);
    };
  }, [currentRole, soundEnabled]);

  // ROL BO'YICHA FILTRLASH:
  // Admin faqat o'zining xabarlarini ko'radi (role: "admin")
  // O'qituvchi faqat o'zining xabarlarini ko'radi (role: "teacher")
  const activeRole = currentRole === "teacher" ? "teacher" : "admin";
  const notifications = allNotifications.filter(
    (n) => (n.role || "admin") === activeRole
  );

  // Sinov Ma'lumotlarini Qayta Yuklash
  const handleReloadDemoData = () => {
    const freshData = [...DEFAULT_ADMIN_NOTIFICATIONS, ...DEFAULT_TEACHER_NOTIFICATIONS];
    setAllNotifications(freshData);
    try {
      localStorage.setItem("velnex_all_notifications_v3", JSON.stringify(freshData));
    } catch (e) {}
    setNotifFilter("all");
    setDateFilter("all");
    triggerBellRing();
    toast.success(`🔄 ${activeRole === "teacher" ? "O'qituvchi" : "Administrator"} uchun sinov bildirishnomalari yuklandi!`);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // 1. Modal Ichidan To'g'ridan-to'g'ri Qabul Qilish (Approve)
  const handleApproveUnlock = (notifId, groupName, date) => {
    const newTeacherNotif = {
      id: `tch_unlock_${Date.now()}`,
      role: "teacher",
      type: "unlock_approved",
      title: "✅ Dars Qulfi Ochildi (Ruxsat Berildi)",
      message: `Administrator "${groupName}" guruhining ${date} darsini ochdi! Endi bemalol davomat va baholarni kiritishingiz mumkin.`,
      time: "Hozirgina",
      dateKey: "today",
      group: groupName,
      targetDate: date,
      status: "approved",
      read: false,
      link: `/attendance/${groupName}`
    };

    setAllNotifications((prev) => {
      const updated = prev.map((n) =>
        n.id === notifId ? { ...n, status: "approved", read: true } : n
      );
      return [newTeacherNotif, ...updated];
    });

    triggerBellRing();

    // 1. Synchronize to localStorage velnex_unlock_requests
    try {
      const saved = localStorage.getItem("velnex_unlock_requests");
      const parsed = saved ? JSON.parse(saved) : {};
      
      const keysToSave = [
        `G-101_${date}`,
        `F-12_${date}`,
        `F-12 Guruh_${date}`,
        `${groupName}_${date}`,
        date
      ];
      keysToSave.forEach((k) => {
        parsed[k] = {
          status: "approved",
          approvedAt: new Date().toISOString(),
          groupName,
          date
        };
      });
      localStorage.setItem("velnex_unlock_requests", JSON.stringify(parsed));

      // 2. Dispatch Live Events
      window.dispatchEvent(new CustomEvent("velnex_unlock_updated", {
        detail: { groupName, date, status: "approved" }
      }));
      window.dispatchEvent(new CustomEvent("velnex_new_notification", {
        detail: { targetRole: "teacher" }
      }));
    } catch (e) {
      console.error("Unlock localStorage error", e);
    }

    toast.success(`✅ "${groupName}" guruhining ${date} darsi qulfi ochildi! O'qituvchiga xabarnoma jo'natildi.`);
  };

  // 1. Rad etish (Reject) - Ochilmasin va O'qituvchiga Xabar Borsin!
  const handleRejectUnlock = (notifId, groupName, date) => {
    const newTeacherNotif = {
      id: `tch_reject_${Date.now()}`,
      role: "teacher",
      type: "unlock_rejected",
      title: "❌ Dars Ochish So'rovi Rad Etildi",
      message: `Administrator "${groupName || "Dars"}" guruhining ${date || ""} darsini ochish so'rovingizni rad etdi. Dars qulflangan holatda qoladi.`,
      time: "Hozirgina",
      dateKey: "today",
      group: groupName,
      targetDate: date,
      status: "rejected",
      read: false,
      link: `/attendance/${groupName || "G-101"}`
    };

    setAllNotifications((prev) => {
      const updated = prev.map((n) =>
        n.id === notifId ? { ...n, status: "rejected", read: true } : n
      );
      return [newTeacherNotif, ...updated];
    });

    triggerBellRing();

    // Persist rejection so date REMAINS LOCKED
    try {
      const saved = localStorage.getItem("velnex_unlock_requests");
      const parsed = saved ? JSON.parse(saved) : {};
      const keysToSave = [
        `G-101_${date}`,
        `F-12_${date}`,
        `F-12 Guruh_${date}`,
        `${groupName}_${date}`,
        date
      ].filter(Boolean);

      keysToSave.forEach((k) => {
        parsed[k] = {
          status: "rejected",
          rejectedAt: new Date().toISOString(),
          groupName,
          date
        };
      });
      localStorage.setItem("velnex_unlock_requests", JSON.stringify(parsed));

      window.dispatchEvent(new CustomEvent("velnex_unlock_updated", {
        detail: { groupName, date, status: "rejected" }
      }));
      window.dispatchEvent(new CustomEvent("velnex_new_notification", {
        detail: { targetRole: "teacher" }
      }));
    } catch (e) {
      console.error("Reject error", e);
    }

    toast.info(`❌ "${groupName || "Dars"}" darsini ochish so'rovi rad etildi va dars qulfi ochilmadi.`);
  };

  // 2. Bir bosishda Telegram Botga yuborish
  const handleSendTelegram = (notif) => {
    triggerBellRing();
    toast.success(`📲 Telegram bot orqali rasmiy xabarnoma muvaffaqiyatli jo'natildi!`);
  };

  // 2. Bir bosishda SMS yuborish
  const handleSendSMS = (notif) => {
    triggerBellRing();
    toast.success(`📩 Ota-onasiga SMS xabarnoma muvaffaqiyatli yuborildi!`);
  };

  // 3. O'qituvchiga Javob Yuborish
  const handleSendQuickReply = (notifId, notif) => {
    if (!quickReplyText.trim()) return;

    const newTeacherNotif = {
      id: `tch_reply_${Date.now()}`,
      role: "teacher",
      type: "reply",
      title: "💬 Administratordan Javob",
      message: `Admin: "${quickReplyText}" (${notif?.group || "Dars so'rovi"})`,
      time: "Hozirgina",
      dateKey: "today",
      read: false,
      link: notif?.link || "/attendance/G-101"
    };

    setAllNotifications((prev) => [newTeacherNotif, ...prev]);
    triggerBellRing();

    try {
      window.dispatchEvent(new CustomEvent("velnex_new_notification", {
        detail: { targetRole: "teacher" }
      }));
    } catch (e) {}

    toast.success(`💬 O'qituvchiga javob yuborildi: "${quickReplyText}"`);
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
              className={`crm-notif-btn ${isNotifModalOpen ? "active" : ""} ${isBellRinging ? "bell-button-ringing" : ""}`}
              onClick={() => setIsNotifModalOpen(true)}
              title="Bildirishnomalar markazini ochish"
            >
              <HiOutlineBell className={`notif-icon ${isBellRinging ? "bell-icon-ringing" : ""}`} />
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

      {/* Password Modal */}
      {authModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setAuthModalOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="admin-icon-badge">
                <HiOutlineLockClosed />
              </div>
              <div>
                <h3>{targetRole === "admin" ? "Administrator" : targetRole === "teacher" ? "O'qituvchi" : "O'quvchi"} Paneliga O'tish</h3>
                <p>Ushbu profilga kirish uchun parolni kiriting</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="admin-auth-form">
              {targetRole === "teacher" && (
                <div className="admin-field-group">
                  <label>O'qituvchini tanlang</label>
                  <select
                    className="admin-input-select"
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                  >
                    {allTeachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName || t.name} ({t.subject || "Ustoz"})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {targetRole === "student" && (
                <div className="admin-field-group">
                  <label>O'quvchini tanlang</label>
                  <select
                    className="admin-input-select"
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                  >
                    {allStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.fullName || s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="admin-field-group">
                <label>Parolni kiriting</label>
                <input
                  type="password"
                  className="admin-input-text"
                  placeholder="Parolni kiriting (Masalan: admin123 yoki 123456)"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setAuthModalOpen(false)}>Bekor qilish</button>
                <button type="submit" className="btn-confirm">Kirish</button>
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
                  <HiOutlineBell className={`modal-bell-svg ${isBellRinging ? "bell-icon-ringing" : ""}`} />
                </div>
                <div>
                  <h3 className="notif-modal-title">
                    {currentRole === "teacher" ? "O'qituvchi Bildirishnomalari" : "Administrator Bildirishnomalari"}
                  </h3>
                  <p className="notif-modal-subtitle">
                    {currentRole === "teacher"
                      ? "Dars eslatmalari, ruxsat javoblari va uy vazifalari"
                      : "Dars so'rovlari, to'lovlar, to'qnashuvlar va markaz statistikasi"}
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
                  title="Sinov bildirishnomalarini qayta yuklash"
                >
                  <HiOutlineArrowPath />
                </button>

                {/* Faqat Tick (Barchasi o'qildi) */}
                {unreadCount > 0 && (
                  <button
                    type="button"
                    className="btn-header-action-icon btn-mark-all-read"
                    onClick={() => {
                      setNotifications((prev) =>
                        prev.map((n) => ((n.role || "admin") === currentRole ? { ...n, read: true } : n))
                      );
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
                      setNotifications((prev) => prev.filter((n) => (n.role || "admin") !== currentRole));
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

              {currentRole === "admin" ? (
                <>
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
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className={`notif-tab-btn ${notifFilter === "schedule" ? "active" : ""}`}
                    onClick={() => setNotifFilter("schedule")}
                  >
                    Dars Eslatmalari
                  </button>
                  <button
                    type="button"
                    className={`notif-tab-btn ${notifFilter === "unlock" ? "active" : ""}`}
                    onClick={() => setNotifFilter("unlock")}
                  >
                    Ruxsat Xabarlari
                  </button>
                  <button
                    type="button"
                    className={`notif-tab-btn ${notifFilter === "homework" ? "active" : ""}`}
                    onClick={() => setNotifFilter("homework")}
                  >
                    Uy Vazifalari
                  </button>
                </>
              )}
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
                {currentRole === "admin" ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <div className="digest-col">
                      <span className="digest-label">📊 Guruh Davomati</span>
                      <span className="digest-val text-green">96.8%</span>
                    </div>
                    <div className="digest-col">
                      <span className="digest-label">⚡ O'tilgan Darslar</span>
                      <span className="digest-val text-blue">18 ta dars</span>
                    </div>
                    <div className="digest-col">
                      <span className="digest-label">🎓 O'quvchilar</span>
                      <span className="digest-val">24 ta</span>
                    </div>
                    <div className="digest-col">
                      <span className="digest-label">📝 Vazifalar Tekshiruvi</span>
                      <span className="digest-val text-green">100% (Hammasi)</span>
                    </div>
                  </>
                )}
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
                  <p>Yangi xabarlar va eslatmalar shu yerda paydo bo'ladi</p>
                  <button
                    type="button"
                    className="btn-load-demo-notifs"
                    onClick={handleReloadDemoData}
                  >
                    <HiOutlineArrowPath /> ⚡ Sinov Xabarlarini Yuklash
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
                        ) : notif.type === "unlock_approved" ? (
                          <HiOutlineCheckBadge style={{ color: "#16a34a" }} />
                        ) : notif.type === "unlock_rejected" ? (
                          <HiXMark style={{ color: "#dc2626" }} />
                        ) : notif.type === "conflict" ? (
                          <HiOutlineExclamationTriangle />
                        ) : notif.type === "payment" ? (
                          <HiOutlineCurrencyDollar />
                        ) : notif.type === "schedule" ? (
                          <HiOutlineClock />
                        ) : notif.type === "homework" ? (
                          <HiOutlineDocumentCheck />
                        ) : (
                          <HiOutlineChatBubbleLeftRight />
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
                            {notif.type === "unlock_approved" && (
                              <span className="status-pill pill-approved">✓ Ochildi</span>
                            )}
                            {notif.type === "unlock_rejected" && (
                              <span className="status-pill pill-rejected">✕ Rad etildi</span>
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

                        {/* 1. Modal Ichidan To'g'ridan-to'g'ri Qabul / Rad qilish (Faqat Administrator uchun) */}
                        {currentRole === "admin" && notif.type === "unlock" && notif.status !== "approved" && notif.status !== "rejected" && (
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
                              onClick={() => handleRejectUnlock(notif.id, notif.group, notif.targetDate)}
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
                                  if (e.key === "Enter") handleSendQuickReply(notif.id, notif);
                                }}
                              />
                              <button
                                type="button"
                                className="btn-send-reply"
                                onClick={() => handleSendQuickReply(notif.id, notif)}
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
                <span className="live-status-dot"></span> {currentRole === "teacher" ? "O'qituvchi" : "Administrator"} bildirishnomalar markazi faol
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
