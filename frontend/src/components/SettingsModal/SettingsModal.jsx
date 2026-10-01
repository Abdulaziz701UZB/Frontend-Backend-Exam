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
} from "react-icons/hi2";
import { FaCrown, FaChalkboardUser, FaGraduationCap } from "react-icons/fa6";
import "./SettingsModal.css";

const SettingsModal = ({ isOpen, onClose }) => {
  const toast = useToast();
  const { user, currentRole, changePassword, updateProfile } = useEduAuth();
  const { isDark, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState("security"); // "security" | "profile" | "center" | "notifications"

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isSubmittingPass, setIsSubmittingPass] = useState(false);

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

  const passStrength = getPasswordStrength(newPassword);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.warning("Hozirgi parolingizni kiriting!");
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      toast.warning("Yangi parol kamida 4 ta belgidan iborat bo'lishi kerak!");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Yangi parollar bir-biriga mos kelmadi! Qaytadan tekshiring.");
      return;
    }

    setIsSubmittingPass(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      const res = changePassword(currentPassword, newPassword);
      if (res.success) {
        toast.success("Parol muvaffaqiyatli yangilandi va saqlandi! 🔐✅");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Parolni yangilashda xatolik yuz berdi!");
    } finally {
      setIsSubmittingPass(false);
    }
  };

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
            className={`settings-tab-btn ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            <HiOutlineKey /> Xavfsizlik & Parol
          </button>
          <button
            type="button"
            className={`settings-tab-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <HiOutlineUser /> Profil Ma'lumotlari
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
            <HiOutlineBell /> Bildirishnoma & Tizim
          </button>
        </div>

        {/* Content Body */}
        <div className="settings-modal-body">
          {/* TAB 1: XAVFSIZLIK & YANGI PAROL */}
          {activeTab === "security" && (
            <form onSubmit={handlePasswordSubmit} className="settings-form">
              <div className="settings-info-alert">
                <HiOutlineShieldCheck className="alert-shield-icon" />
                <div>
                  <strong>Parolni Yangilash Xavfsizligi</strong>
                  <p>
                    Yangi parolingiz saqlangandan so'ng, keyingi barcha kirishlarda va ruxsat berishlarda aynan yangi parolingiz amal qiladi.
                  </p>
                </div>
              </div>

              <div className="settings-form-group">
                <label className="settings-label">
                  Hozirgi Parol: <span className="text-danger">*</span>
                </label>
                <div className="settings-input-wrap">
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    className="settings-input"
                    placeholder="Hozirgi parolingizni kiriting"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn-eye-toggle"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    tabIndex={-1}
                  >
                    {showCurrentPass ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
                  </button>
                </div>
                <small className="settings-hint">Standart dastlabki parol: <code>10102013</code></small>
              </div>

              <div className="settings-form-row">
                <div className="settings-form-group flex-1">
                  <label className="settings-label">
                    Yangi Parol: <span className="text-danger">*</span>
                  </label>
                  <div className="settings-input-wrap">
                    <input
                      type={showNewPass ? "text" : "password"}
                      className="settings-input"
                      placeholder="Kamida 4 ta belgi"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="btn-eye-toggle"
                      onClick={() => setShowNewPass(!showNewPass)}
                      tabIndex={-1}
                    >
                      {showNewPass ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
                    </button>
                  </div>

                  {newPassword && (
                    <div className="password-strength-container">
                      <div className="strength-bar-bg">
                        <div
                          className={`strength-bar-fill ${passStrength.colorClass}`}
                          style={{ width: `${passStrength.score}%` }}
                        ></div>
                      </div>
                      <span className={`strength-label ${passStrength.colorClass}`}>
                        Daraja: {passStrength.label}
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
                      type={showConfirmPass ? "text" : "password"}
                      className="settings-input"
                      placeholder="Yangi parolni tasdiqlang"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="btn-eye-toggle"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      tabIndex={-1}
                    >
                      {showConfirmPass ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
                    </button>
                  </div>

                  {confirmPassword && (
                    <div className="match-status-hint">
                      {newPassword === confirmPassword ? (
                        <span className="text-emerald font-semibold">✓ Parollar mos keldi</span>
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
                  disabled={isSubmittingPass || (newPassword && newPassword !== confirmPassword)}
                >
                  {isSubmittingPass ? (
                    <>
                      <span className="settings-mini-spinner"></span> Saqlanmoqda...
                    </>
                  ) : (
                    <>
                      <HiOutlineKey /> Yangi Parolni Saqlash
                    </>
                  )}
                </button>
              </div>
            </form>
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
