import { useState } from "react";
import { useEduAuth } from "../../context/EduAuthContext";
import { useToast } from "../../context/ToastContext";
import { useTheme } from "../../context/ThemeContext";
import {
  HiXMark,
  HiOutlineKey,
  HiOutlineUser,
  HiOutlineBuildingOffice2,
  HiOutlineBell,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineCheckBadge,
  HiOutlineShieldCheck,
  HiOutlineDevicePhoneMobile,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineSparkles,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlinePencilSquare,
  HiOutlineLockClosed,
  HiOutlineAcademicCap,
  HiOutlineUserGroup,
} from "react-icons/hi2";
import { FaCrown, FaChalkboardUser, FaGraduationCap } from "react-icons/fa6";
import "./SettingsModal.css";

const SettingsModal = ({ isOpen, onClose }) => {
  const toast = useToast();
  const {
    user,
    currentRole,
    allTeachers,
    adminPassword,
    teacherPassword,
    studentPassword,
    teacherCustomPasswords,
    changeAdminPassword,
    changeTeacherPassword,
    changeStudentPassword,
    setTeacherIndividualPassword,
    removeTeacherIndividualPassword,
    updateProfile,
  } = useEduAuth();
  const { isDark, toggleTheme } = useTheme();

  // Active Tab: "admin_pass" | "teacher_pass" | "student_pass" | "profile" | "center" | "notifications"
  const [activeTab, setActiveTab] = useState("admin_pass");

  // Admin Password state
  const [currentAdminPass, setCurrentAdminPass] = useState("");
  const [newAdminPass, setNewAdminPass] = useState("");
  const [confirmAdminPass, setConfirmAdminPass] = useState("");
  const [showCurrentAdminPass, setShowCurrentAdminPass] = useState(false);
  const [showNewAdminPass, setShowNewAdminPass] = useState(false);
  const [showConfirmAdminPass, setShowConfirmAdminPass] = useState(false);
  const [isSubmittingAdminPass, setIsSubmittingAdminPass] = useState(false);

  // General Teacher Password state
  const [newTeacherGeneralPass, setNewTeacherGeneralPass] = useState("");
  const [showTeacherGeneralPass, setShowTeacherGeneralPass] = useState(false);
  const [isSubmittingTeacherGenPass, setIsSubmittingTeacherGenPass] = useState(false);

  // Individual Teacher Password Form state
  const [selectedTeacherId, setSelectedTeacherId] = useState(allTeachers[0]?.id || "");
  const [customTeacherPass, setCustomTeacherPass] = useState("");
  const [showCustomTeacherPass, setShowCustomTeacherPass] = useState(false);
  const [isSubmittingTeacherCustom, setIsSubmittingTeacherCustom] = useState(false);
  const [revealedTeacherPasswords, setRevealedTeacherPasswords] = useState({});

  // Student Password state
  const [newStudentGeneralPass, setNewStudentGeneralPass] = useState("");
  const [showStudentPass, setShowStudentPass] = useState(false);
  const [isSubmittingStudentPass, setIsSubmittingStudentPass] = useState(false);

  // Profile state
  const [profileName, setProfileName] = useState(user?.name || user?.fullName || "Abdulaziz Abdulhayev");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "+998 90 599 06 00");
  const [profileEmail, setProfileEmail] = useState(user?.email || "admin@velnex.uz");
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

  // Center state
  const [centerName, setCenterName] = useState(() => {
    return localStorage.getItem("velnex_center_name") || "VELNEX Academy";
  });
  const [centerPhone, setCenterPhone] = useState(() => {
    return localStorage.getItem("velnex_center_phone") || "+998 90 599 06 00";
  });
  const [centerAddress, setCenterAddress] = useState(() => {
    return localStorage.getItem("velnex_center_address") || "Toshkent shahri, Yunusobod tumani";
  });

  // Notification state
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem("velnex_sound_enabled") !== "false";
  });
  const [tgAlertsEnabled, setTgAlertsEnabled] = useState(() => {
    return localStorage.getItem("velnex_tg_alerts_enabled") !== "false";
  });

  if (!isOpen) return null;

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "", colorClass: "" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[a-zA-Z]/.test(pass)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 33, label: "Zaif (Oddiy)", colorClass: "strength-weak" };
    if (score <= 4) return { score: 66, label: "O'rtacha", colorClass: "strength-medium" };
    return { score: 100, label: "Kuchli (A'lo)", colorClass: "strength-strong" };
  };

  const adminPassStrength = getPasswordStrength(newAdminPass);

  // 1. Admin parolini yangilash
  const handleAdminPasswordSubmit = async (e) => {
    e.preventDefault();

    if (!currentAdminPass) {
      toast.warning("Hozirgi admin parolingizni kiriting!");
      return;
    }
    if (!newAdminPass || newAdminPass.length < 4) {
      toast.warning("Yangi parol kamida 4 ta belgidan iborat bo'lishi kerak!");
      return;
    }
    if (newAdminPass !== confirmAdminPass) {
      toast.error("Yangi parollar bir-biriga mos kelmadi! Qaytadan tekshiring.");
      return;
    }

    setIsSubmittingAdminPass(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      const res = changeAdminPassword(currentAdminPass, newAdminPass);
      if (res.success) {
        toast.success("Bosh Admin paroli muvaffaqiyatli yangilandi va saqlandi! 👑✅");
        setCurrentAdminPass("");
        setNewAdminPass("");
        setConfirmAdminPass("");
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Parolni yangilashda xatolik yuz berdi!");
    } finally {
      setIsSubmittingAdminPass(false);
    }
  };

  // 2. Umumiy O'qituvchi parolini yangilash
  const handleTeacherGeneralSubmit = async (e) => {
    e.preventDefault();
    if (!newTeacherGeneralPass || newTeacherGeneralPass.length < 4) {
      toast.warning("O'qituvchi paroli kamida 4 ta belgidan iborat bo'lishi kerak!");
      return;
    }

    setIsSubmittingTeacherGenPass(true);
    try {
      await new Promise((r) => setTimeout(r, 350));
      const res = changeTeacherPassword(newTeacherGeneralPass);
      if (res.success) {
        toast.success("Umumiy o'qituvchi paroli saqlandi! 👨‍🏫✅");
        setNewTeacherGeneralPass("");
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Parolni saqlashda xatolik yuz berdi!");
    } finally {
      setIsSubmittingTeacherGenPass(false);
    }
  };

  // 3. O'qituvchiga shaxsiy yangi parol biriktirish
  const handleTeacherCustomSubmit = async (e) => {
    e.preventDefault();
    const teacherId = selectedTeacherId || allTeachers[0]?.id;
    const targetTeacher = allTeachers.find((t) => String(t.id) === String(teacherId));
    const teacherName = targetTeacher?.name || `O'qituvchi #${teacherId}`;

    if (!customTeacherPass || customTeacherPass.length < 4) {
      toast.warning("Shaxsiy parol kamida 4 ta belgidan iborat bo'lishi kerak!");
      return;
    }

    setIsSubmittingTeacherCustom(true);
    try {
      await new Promise((r) => setTimeout(r, 300));
      const res = setTeacherIndividualPassword(teacherId, teacherName, customTeacherPass);
      if (res.success) {
        toast.success(`${teacherName} uchun maxsus parol biriktirildi! 🔐✅`);
        setCustomTeacherPass("");
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("O'qituvchi parolini saqlashda xatolik!");
    } finally {
      setIsSubmittingTeacherCustom(false);
    }
  };

  // 4. O'qituvchi shaxsiy parolini o'chirish (Umumiy parolga qaytarish)
  const handleRemoveTeacherCustomPass = (teacherId, teacherName) => {
    if (window.confirm(`${teacherName} ning shaxsiy parolini o'chirib, umumiy o'qituvchi paroliga qaytaramizmi?`)) {
      const res = removeTeacherIndividualPassword(teacherId);
      if (res.success) {
        toast.info(`${teacherName} umumiy parolga o'tkazildi.`);
      }
    }
  };

  // 5. O'quvchi parolini yangilash
  const handleStudentGeneralSubmit = async (e) => {
    e.preventDefault();
    if (!newStudentGeneralPass || newStudentGeneralPass.length < 4) {
      toast.warning("O'quvchi paroli kamida 4 ta belgidan iborat bo'lishi kerak!");
      return;
    }

    setIsSubmittingStudentPass(true);
    try {
      await new Promise((r) => setTimeout(r, 300));
      const res = changeStudentPassword(newStudentGeneralPass);
      if (res.success) {
        toast.success("O'quvchi paroli muvaffaqiyatli saqlandi! 🎓✅");
        setNewStudentGeneralPass("");
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("O'quvchi parolini saqlashda xatolik!");
    } finally {
      setIsSubmittingStudentPass(false);
    }
  };

  // 6. Profilni saqlash
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileName.trim()) {
      toast.warning("Ism-familiyangizni kiriting!");
      return;
    }

    setIsSubmittingProfile(true);
    try {
      await new Promise((r) => setTimeout(r, 300));
      updateProfile({
        name: profileName.trim(),
        fullName: profileName.trim(),
        phone: profilePhone.trim(),
        email: profileEmail.trim(),
      });
      toast.success("Profil ma'lumotlari muvaffaqiyatli saqlandi! 👤✨");
    } catch {
      toast.error("Profilni saqlashda xatolik yuz berdi!");
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  // 7. O'quv markazi sozlamalarini saqlash
  const handleCenterSubmit = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem("velnex_center_name", centerName.trim());
      localStorage.setItem("velnex_center_phone", centerPhone.trim());
      localStorage.setItem("velnex_center_address", centerAddress.trim());
      toast.success("O'quv markazi sozlamalari saqlandi! 🏢✅");
    } catch {
      toast.error("Saqlashda xatolik yuz berdi!");
    }
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem("velnex_sound_enabled", String(next));
    toast.info(next ? "Ovozli signallar yoqildi 🔔" : "Ovozli signallar o'chirildi 🔕");
  };

  const handleToggleTgAlerts = () => {
    const next = !tgAlertsEnabled;
    setTgAlertsEnabled(next);
    localStorage.setItem("velnex_tg_alerts_enabled", String(next));
    toast.info(next ? "Telegram bildirishnomalar faol 🤖" : "Telegram bildirishnomalar o'chirildi");
  };

  const toggleTeacherPassVisibility = (teacherId) => {
    setRevealedTeacherPasswords((prev) => ({
      ...prev,
      [teacherId]: !prev[teacherId],
    }));
  };

  return (
    <div className="settings-modal-backdrop" onClick={onClose}>
      <div className="settings-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="settings-modal-header">
          <div className="settings-header-title-wrap">
            <div className="settings-icon-badge">
              <HiOutlineKey className="settings-header-icon" />
            </div>
            <div>
              <h2 className="settings-modal-title">Tizim Sozlamalari (Nastroyka)</h2>
              <p className="settings-modal-subtitle">
                Xavfsizlik, yangi parol o'rnatish, shaxsiy profil va tizim parametrlari
              </p>
            </div>
          </div>
          <button className="settings-close-btn" onClick={onClose} aria-label="Yopish" title="Yopish (Esc)">
            <HiXMark />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="settings-tabs-bar">
          <button
            type="button"
            className={`settings-tab-btn ${activeTab === "admin_pass" ? "active" : ""}`}
            onClick={() => setActiveTab("admin_pass")}
          >
            <FaCrown className="tab-crown-icon" /> Admin Paroli
          </button>
          <button
            type="button"
            className={`settings-tab-btn ${activeTab === "teacher_pass" ? "active" : ""}`}
            onClick={() => setActiveTab("teacher_pass")}
          >
            <FaChalkboardUser className="tab-teacher-icon" /> O'qituvchi Paroli
          </button>
          <button
            type="button"
            className={`settings-tab-btn ${activeTab === "student_pass" ? "active" : ""}`}
            onClick={() => setActiveTab("student_pass")}
          >
            <FaGraduationCap className="tab-student-icon" /> O'quvchi Paroli
          </button>
          <button
            type="button"
            className={`settings-tab-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <HiOutlineUser /> Profil
          </button>
          <button
            type="button"
            className={`settings-tab-btn ${activeTab === "center" ? "active" : ""}`}
            onClick={() => setActiveTab("center")}
          >
            <HiOutlineBuildingOffice2 /> O'quv Markazi
          </button>
          <button
            type="button"
            className={`settings-tab-btn ${activeTab === "notifications" ? "active" : ""}`}
            onClick={() => setActiveTab("notifications")}
          >
            <HiOutlineBell /> Tizim & Ovoz
          </button>
        </div>

        {/* Content Body */}
        <div className="settings-modal-body">
          {/* TAB 1: ADMIN PAROLI */}
          {activeTab === "admin_pass" && (
            <form onSubmit={handleAdminPasswordSubmit} className="settings-form">
              <div className="settings-info-alert">
                <FaCrown className="alert-shield-icon text-amber" />
                <div>
                  <strong>Bosh Administrator Xavfsizlik Paroli</strong>
                  <p>
                    Admin panel, guruhlarni boshqarish, o'qituvchilar va to'lovlarni nazorat qilish uchun asosiy admin parolini yangilang.
                  </p>
                </div>
              </div>

              <div className="settings-form-group">
                <label className="settings-label">
                  Hozirgi Admin Paroli: <span className="text-danger">*</span>
                </label>
                <div className="settings-input-wrap">
                  <input
                    type={showCurrentAdminPass ? "text" : "password"}
                    className="settings-input"
                    placeholder="Hozirgi admin parolingizni kiriting"
                    value={currentAdminPass}
                    onChange={(e) => setCurrentAdminPass(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn-eye-toggle"
                    onClick={() => setShowCurrentAdminPass(!showCurrentAdminPass)}
                    tabIndex={-1}
                  >
                    {showCurrentAdminPass ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
                  </button>
                </div>
                <small className="settings-hint">Standart boshlang'ich admin paroli: <code>10102013</code></small>
              </div>

              <div className="settings-form-row">
                <div className="settings-form-group flex-1">
                  <label className="settings-label">
                    Yangi Admin Paroli: <span className="text-danger">*</span>
                  </label>
                  <div className="settings-input-wrap">
                    <input
                      type={showNewAdminPass ? "text" : "password"}
                      className="settings-input"
                      placeholder="Kamida 4 ta belgi"
                      value={newAdminPass}
                      onChange={(e) => setNewAdminPass(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="btn-eye-toggle"
                      onClick={() => setShowNewAdminPass(!showNewAdminPass)}
                      tabIndex={-1}
                    >
                      {showNewAdminPass ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
                    </button>
                  </div>

                  {newAdminPass && (
                    <div className="password-strength-container">
                      <div className="strength-bar-bg">
                        <div
                          className={`strength-bar-fill ${adminPassStrength.colorClass}`}
                          style={{ width: `${adminPassStrength.score}%` }}
                        ></div>
                      </div>
                      <span className={`strength-label ${adminPassStrength.colorClass}`}>
                        Daraja: {adminPassStrength.label}
                      </span>
                    </div>
                  )}
                </div>

                <div className="settings-form-group flex-1">
                  <label className="settings-label">
                    Yangi Parolni Qayta Kiriting: <span className="text-danger">*</span>
                  </label>
                  <div className="settings-input-wrap">
                    <input
                      type={showConfirmAdminPass ? "text" : "password"}
                      className="settings-input"
                      placeholder="Yangi admin parolini tasdiqlang"
                      value={confirmAdminPass}
                      onChange={(e) => setConfirmAdminPass(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="btn-eye-toggle"
                      onClick={() => setShowConfirmAdminPass(!showConfirmAdminPass)}
                      tabIndex={-1}
                    >
                      {showConfirmAdminPass ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
                    </button>
                  </div>

                  {confirmAdminPass && (
                    <div className="match-status-hint">
                      {newAdminPass === confirmAdminPass ? (
                        <span className="text-emerald font-semibold">✓ Parollar bir-biriga mos keldi</span>
                      ) : (
                        <span className="text-danger font-semibold">✕ Parollar bir xil emas</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="settings-actions-footer">
                <button
                  type="submit"
                  className="btn btn-primary settings-submit-btn"
                  disabled={isSubmittingAdminPass || (newAdminPass && newAdminPass !== confirmAdminPass)}
                >
                  {isSubmittingAdminPass ? (
                    <>
                      <span className="settings-mini-spinner"></span> Saqlanmoqda...
                    </>
                  ) : (
                    <>
                      <FaCrown /> Admin Parolini Saqlash
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: O'QITUVCHI PAROLLARI & YANGI PAROL QO'SHISH */}
          {activeTab === "teacher_pass" && (
            <div className="settings-form">
              {/* 1. Umumiy O'qituvchi Paroli */}
              <div className="teacher-password-section-box">
                <div className="section-box-header">
                  <div className="box-header-title">
                    <FaChalkboardUser className="header-box-icon text-indigo" />
                    <div>
                      <h4 className="box-title">Barcha O'qituvchilar Uchun Umumiy Parol</h4>
                      <p className="box-desc">
                        Maxsus shaxsiy parol biriktirilmagan barcha o'qituvchilar ushbu parol orqali tizimga kiradilar.
                      </p>
                    </div>
                  </div>
                  <div className="current-password-badge">
                    <span className="badge-caption">Joriy umumiy parol:</span>
                    <strong className="badge-value">
                      {showTeacherGeneralPass ? teacherPassword : "••••••••"}
                    </strong>
                    <button
                      type="button"
                      className="btn-mini-eye"
                      onClick={() => setShowTeacherGeneralPass(!showTeacherGeneralPass)}
                      title={showTeacherGeneralPass ? "Yashirish" : "Ko'rsatish"}
                    >
                      {showTeacherGeneralPass ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
                    </button>
                  </div>
                </div>

                <form onSubmit={handleTeacherGeneralSubmit} className="section-box-form">
                  <div className="form-inline-group">
                    <input
                      type="text"
                      className="settings-input"
                      placeholder="Yangi umumiy o'qituvchi paroli (masalan: ustoz2026)"
                      value={newTeacherGeneralPass}
                      onChange={(e) => setNewTeacherGeneralPass(e.target.value)}
                      required
                    />
                    <button
                      type="submit"
                      className="btn btn-primary btn-save-inline"
                      disabled={isSubmittingTeacherGenPass || !newTeacherGeneralPass}
                    >
                      {isSubmittingTeacherGenPass ? "Saqlanmoqda..." : "Umumiy Parolni Saqlash"}
                    </button>
                  </div>
                </form>
              </div>

              {/* 2. O'qituvchiga Yangi Shaxsiy Parol Qo'shish / Biriktirish */}
              <div className="teacher-password-section-box add-custom-pass-box">
                <div className="section-box-header">
                  <div className="box-header-title">
                    <HiOutlinePlus className="header-box-icon text-emerald" />
                    <div>
                      <h4 className="box-title">O'qituvchiga Yangi Maxsus Parol Biriktirish</h4>
                      <p className="box-desc">
                        Tanlangan o'qituvchi uchun individual shaxsiy parol o'rnating. U faqat o'ziga tegishli parol bilan kiradi.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleTeacherCustomSubmit} className="section-box-form">
                  <div className="settings-form-row">
                    <div className="settings-form-group flex-1">
                      <label className="settings-label">O'qituvchini Tanlang:</label>
                      <select
                        className="settings-input settings-select"
                        value={selectedTeacherId}
                        onChange={(e) => setSelectedTeacherId(e.target.value)}
                        required
                      >
                        {allTeachers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} — {t.subject || "Ustoz"} ({t.phone || "Aloqa mavjud"})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="settings-form-group flex-1">
                      <label className="settings-label">Ushbu O'qituvchi Uchun Yangi Parol:</label>
                      <div className="settings-input-wrap">
                        <input
                          type={showCustomTeacherPass ? "text" : "password"}
                          className="settings-input"
                          placeholder="Shaxsiy yangi parol kiritish"
                          value={customTeacherPass}
                          onChange={(e) => setCustomTeacherPass(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="btn-eye-toggle"
                          onClick={() => setShowCustomTeacherPass(!showCustomTeacherPass)}
                          tabIndex={-1}
                        >
                          {showCustomTeacherPass ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="box-action-row">
                    <button
                      type="submit"
                      className="btn btn-emerald settings-submit-btn"
                      disabled={isSubmittingTeacherCustom || !customTeacherPass}
                    >
                      {isSubmittingTeacherCustom ? (
                        <>
                          <span className="settings-mini-spinner"></span> Saqlanmoqda...
                        </>
                      ) : (
                        <>
                          <HiOutlinePlus /> O'qituvchiga Parol Qo'shish & Saqlash
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* 3. Mavjud O'qituvchilar Parollari Ro'yxati */}
              <div className="teacher-passwords-list-wrap">
                <div className="list-wrap-header">
                  <h4 className="list-title">
                    <HiOutlineLockClosed className="text-indigo" /> O'qituvchilar Parollari Holati
                  </h4>
                  <span className="teachers-count-pill">{allTeachers.length} ta o'qituvchi</span>
                </div>

                <div className="teacher-pass-cards-grid">
                  {allTeachers.map((teacher) => {
                    const customData = teacherCustomPasswords[teacher.id];
                    const hasCustom = Boolean(customData);
                    const currentPassVal = typeof customData === "string" ? customData : customData?.password;
                    const isPassVisible = revealedTeacherPasswords[teacher.id];

                    return (
                      <div key={teacher.id} className={`teacher-pass-card ${hasCustom ? "has-custom-pass" : "has-general-pass"}`}>
                        <div className="card-top-row">
                          <div className="teacher-info-block">
                            <div className="teacher-avatar-sq">
                              <FaChalkboardUser />
                            </div>
                            <div>
                              <strong className="teacher-card-name">{teacher.name}</strong>
                              <span className="teacher-card-subject">{teacher.subject || "O'qituvchi"}</span>
                            </div>
                          </div>

                          <div className="pass-status-pill">
                            {hasCustom ? (
                              <span className="badge-custom-active">Shaxsiy Parol</span>
                            ) : (
                              <span className="badge-general-active">Umumiy Parol</span>
                            )}
                          </div>
                        </div>

                        <div className="card-pass-row">
                          <span className="pass-key-label">Kirish Paroli:</span>
                          <div className="pass-val-container">
                            <span className="pass-code-text">
                              {hasCustom
                                ? (isPassVisible ? currentPassVal : "••••••••")
                                : (isPassVisible ? teacherPassword : "••••••••")}
                            </span>
                            <button
                              type="button"
                              className="btn-pass-peek"
                              onClick={() => toggleTeacherPassVisibility(teacher.id)}
                              title={isPassVisible ? "Parolni yashirish" : "Parolni ko'rish"}
                            >
                              {isPassVisible ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
                            </button>
                          </div>
                        </div>

                        <div className="card-actions-row">
                          {hasCustom ? (
                            <button
                              type="button"
                              className="btn-revert-general"
                              onClick={() => handleRemoveTeacherCustomPass(teacher.id, teacher.name)}
                              title="Shaxsiy parolni o'chirib, umumiy parolga o'tkazish"
                            >
                              <HiOutlineTrash /> Umumiyga Qaytarish
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn-assign-quick"
                              onClick={() => {
                                setSelectedTeacherId(teacher.id);
                                const addBox = document.querySelector(".add-custom-pass-box");
                                if (addBox) addBox.scrollIntoView({ behavior: "smooth" });
                              }}
                            >
                              <HiOutlinePlus /> Shaxsiy Parol Qo'yish
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: O'QUVCHI PAROLI */}
          {activeTab === "student_pass" && (
            <div className="settings-form">
              <div className="settings-info-alert">
                <FaGraduationCap className="alert-shield-icon text-emerald" />
                <div>
                  <strong>O'quvchilar Kabineti Kirish Paroli</strong>
                  <p>
                    O'quvchilar va talabalar shaxsiy kabinetiga, o'z baholari va to'lovlarini ko'rish uchun kiradigan umumiy parol.
                  </p>
                </div>
              </div>

              <div className="teacher-password-section-box">
                <div className="section-box-header">
                  <div className="box-header-title">
                    <FaGraduationCap className="header-box-icon text-emerald" />
                    <div>
                      <h4 className="box-title">O'quvchilar Uchun Umumiy Parol</h4>
                      <p className="box-desc">
                        O'quvchilar tizimga kirishida talab qilinadigan kirish paroli.
                      </p>
                    </div>
                  </div>
                  <div className="current-password-badge">
                    <span className="badge-caption">Joriy parol:</span>
                    <strong className="badge-value">
                      {showStudentPass ? studentPassword : "••••••••"}
                    </strong>
                    <button
                      type="button"
                      className="btn-mini-eye"
                      onClick={() => setShowStudentPass(!showStudentPass)}
                      title={showStudentPass ? "Yashirish" : "Ko'rsatish"}
                    >
                      {showStudentPass ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
                    </button>
                  </div>
                </div>

                <form onSubmit={handleStudentGeneralSubmit} className="section-box-form">
                  <div className="form-inline-group">
                    <input
                      type="text"
                      className="settings-input"
                      placeholder="Yangi o'quvchi paroli (masalan: talaba2026)"
                      value={newStudentGeneralPass}
                      onChange={(e) => setNewStudentGeneralPass(e.target.value)}
                      required
                    />
                    <button
                      type="submit"
                      className="btn btn-emerald btn-save-inline"
                      disabled={isSubmittingStudentPass || !newStudentGeneralPass}
                    >
                      {isSubmittingStudentPass ? "Saqlanmoqda..." : "O'quvchi Parolini Saqlash"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: PROFIL MA'LUMOTLARI */}
          {activeTab === "profile" && (
            <form onSubmit={handleProfileSubmit} className="settings-form">
              <div className="profile-badge-card">
                <div className="profile-avatar-circle">
                  {currentRole === "admin" && <FaCrown className="profile-role-icon text-amber" />}
                  {currentRole === "teacher" && <FaChalkboardUser className="profile-role-icon text-indigo" />}
                  {currentRole === "student" && <FaGraduationCap className="profile-role-icon text-emerald" />}
                </div>
                <div className="profile-badge-info">
                  <strong>{user?.name || user?.fullName}</strong>
                  <span className="role-tag-pill">
                    {currentRole === "admin" ? "Bosh Administrator" : currentRole === "teacher" ? "O'qituvchi" : "O'quvchi"}
                  </span>
                </div>
              </div>

              <div className="settings-form-group">
                <label className="settings-label">To'liq Ism-Sharif:</label>
                <input
                  type="text"
                  className="settings-input"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Ism va Familiyangizni kiriting"
                  required
                />
              </div>

              <div className="settings-form-row">
                <div className="settings-form-group flex-1">
                  <label className="settings-label">Telefon Raqami:</label>
                  <input
                    type="text"
                    className="settings-input"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                  />
                </div>
                <div className="settings-form-group flex-1">
                  <label className="settings-label">Elektron Pochta (Email):</label>
                  <input
                    type="email"
                    className="settings-input"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    placeholder="admin@velnex.uz"
                  />
                </div>
              </div>

              <div className="settings-actions-footer">
                <button type="submit" className="btn btn-primary settings-submit-btn" disabled={isSubmittingProfile}>
                  {isSubmittingProfile ? (
                    <>
                      <span className="settings-mini-spinner"></span> Saqlanmoqda...
                    </>
                  ) : (
                    <>
                      <HiOutlineCheckBadge /> Profilni Saqlash
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: O'QUV MARKAZI */}
          {activeTab === "center" && (
            <form onSubmit={handleCenterSubmit} className="settings-form">
              <div className="settings-form-group">
                <label className="settings-label">O'quv Markazi Nomi:</label>
                <input
                  type="text"
                  className="settings-input"
                  value={centerName}
                  onChange={(e) => setCenterName(e.target.value)}
                  placeholder="Markaz nomini kiriting"
                  required
                />
              </div>

              <div className="settings-form-row">
                <div className="settings-form-group flex-1">
                  <label className="settings-label">Markaz Aloqa Telefoni:</label>
                  <input
                    type="text"
                    className="settings-input"
                    value={centerPhone}
                    onChange={(e) => setCenterPhone(e.target.value)}
                    placeholder="+998 90 599 06 00"
                  />
                </div>
                <div className="settings-form-group flex-1">
                  <label className="settings-label">Boshqaruv Valyutasi:</label>
                  <input type="text" className="settings-input" value="So'm (UZS)" disabled readOnly />
                </div>
              </div>

              <div className="settings-form-group">
                <label className="settings-label">Markaz Joylashgan Manzil:</label>
                <input
                  type="text"
                  className="settings-input"
                  value={centerAddress}
                  onChange={(e) => setCenterAddress(e.target.value)}
                  placeholder="Shahar, ko'cha, bino raqami"
                />
              </div>

              <div className="settings-actions-footer">
                <button type="submit" className="btn btn-primary settings-submit-btn">
                  <HiOutlineBuildingOffice2 /> Markaz Sozlamalarini Saqlash
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: BILDIRISHNOMA & TIZIM */}
          {activeTab === "notifications" && (
            <div className="settings-form">
              <div className="setting-toggle-row">
                <div className="setting-toggle-info">
                  <span className="setting-toggle-title">
                    <HiOutlineBell className="toggle-info-icon" /> Ovozli Xabarnoma Signallari
                  </span>
                  <p className="setting-toggle-desc">
                    Yangi to'lov yoki o'qituvchi so'rovi kelganda mayin Apple Web Audio chime sadosi yangraydi.
                  </p>
                </div>
                <button
                  type="button"
                  className={`btn-toggle-switch ${soundEnabled ? "on" : "off"}`}
                  onClick={handleToggleSound}
                >
                  <span className="toggle-switch-handle"></span>
                </button>
              </div>

              <div className="setting-toggle-row">
                <div className="setting-toggle-info">
                  <span className="setting-toggle-title">
                    <HiOutlineDevicePhoneMobile className="toggle-info-icon" /> Telegram Bot Bildirishnomalari
                  </span>
                  <p className="setting-toggle-desc">
                    Davomat, qoldirilgan darslar va to'lovlar avtomatik ravishda ota-onaning Telegramiga yuboriladi.
                  </p>
                </div>
                <button
                  type="button"
                  className={`btn-toggle-switch ${tgAlertsEnabled ? "on" : "off"}`}
                  onClick={handleToggleTgAlerts}
                >
                  <span className="toggle-switch-handle"></span>
                </button>
              </div>

              <div className="setting-toggle-row">
                <div className="setting-toggle-info">
                  <span className="setting-toggle-title">
                    {isDark ? <HiOutlineSun className="toggle-info-icon text-amber" /> : <HiOutlineMoon className="toggle-info-icon text-indigo" />}
                    Mavzu: {isDark ? "Qorong'u Rejim (Dark)" : "Yorug' Rejim (Light)"}
                  </span>
                  <p className="setting-toggle-desc">
                    Tizim ranglarini ko'zni charchatmaydigan qorong'u yoki yorug' rejimga o'tkazish.
                  </p>
                </div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={toggleTheme}>
                  {isDark ? "Yorug' rejimga o'tish" : "Qorong'u rejimga o'tish"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="settings-modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
