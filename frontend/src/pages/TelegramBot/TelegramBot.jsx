import { useState, useEffect } from "react";
import { telegramApi } from "../../services/api";
import {
  HiOutlinePaperAirplane,
  HiOutlineBellAlert,
  HiOutlineDevicePhoneMobile,
  HiOutlineCheckBadge,
  HiOutlineUserGroup,
  HiOutlineSparkles,
  HiOutlineDocumentCheck,
  HiOutlineClock,
  HiOutlineBolt,
  HiOutlineCheckCircle,
  HiOutlineKey,
  HiOutlineGlobeAlt,
  HiOutlineArrowTopRightOnSquare
} from "react-icons/hi2";
import { FaTelegram, FaCrown, FaChalkboardUser, FaGraduationCap } from "react-icons/fa6";
import "./TelegramBot.css";

const TelegramBot = () => {
  const [botConfig, setBotConfig] = useState({
    token: "7891234567:AAFakeDemoTokenEduControlBotUzbekistan",
    adminChatId: "123456789",
    botUsername: "@EduControlDemoBot",
    isEnabled: true,
    webAppUrl: "http://localhost:5173",
    autoNotifyAttendance: true,
    autoNotifyPayment: true,
    autoNotifyLead: true,
    autoNotifyDailyReport: true,
  });

  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [broadcastText, setBroadcastText] = useState("");
  const [targetRole, setTargetRole] = useState("all");
  const [isSending, setIsSending] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState("");

  const loadStatus = async () => {
    try {
      setLoading(true);
      const data = await telegramApi.getStatus();
      if (data.config) setBotConfig(data.config);
      if (data.logs) setLogs(data.logs);
      if (data.users) setUsers(data.users);
    } catch (err) {
      console.error("Telegram status load error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleToggle = async (key) => {
    const updated = { ...botConfig, [key]: !botConfig[key] };
    setBotConfig(updated);
    try {
      await telegramApi.updateConfig(updated);
    } catch (err) {
      alert("Sozlamani saqlashda xatolik: " + err.message);
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    try {
      setIsSending(true);
      const res = await telegramApi.sendBroadcast(broadcastText, targetRole);
      setAlertSuccess(`Xabarnoma ${res.sentCount || users.length} ta foydalanuvchiga muvaffaqiyatli yuborildi!`);
      setBroadcastText("");
      setTimeout(() => setAlertSuccess(""), 3500);
      loadStatus();
    } catch (err) {
      alert("Xatolik: " + err.message);
    } finally {
      setIsSending(false);
    }
  };

  const triggerTestNotification = async (type) => {
    try {
      await telegramApi.sendTestNotification(type);
      setAlertSuccess(`"${type}" bo'yicha test bildirishnomasi Telegram orqali yuborildi!`);
      setTimeout(() => setAlertSuccess(""), 3000);
      loadStatus();
    } catch (err) {
      alert("Test yuborishda xatolik: " + err.message);
    }
  };

  return (
    <div className="telegram-page">
      <div className="page-header-flex">
        <div>
          <h1 className="page-title">
            <FaTelegram style={{ verticalAlign: 'middle', marginRight: 8, color: '#0284c7' }} />
            Telegram Bot va WebApp Boshqaruvi
          </h1>
          <p className="page-subtitle">
            Ota-onalar, o'quvchilar va o'qituvchilarga avtomatik davomat, to'lov kvitansiyalari va kunlik hisobotlarni Telegram orqali yuborish
          </p>
        </div>
      </div>

      {alertSuccess && (
        <div className="alert alert-success">
          <HiOutlineCheckCircle style={{ verticalAlign: 'middle', marginRight: 6 }} />
          {alertSuccess}
        </div>
      )}

      <div className="telegram-hero-card">
        <div className="telegram-hero-info">
          <div className="telegram-hero-icon-wrap">
            <FaTelegram />
          </div>
          <div className="telegram-hero-text">
            <h2>EduControl Rasmiy Telegram Boti</h2>
            <p>Bot holati: <strong>Faol va ulangan</strong> • WebApp integratsiyasi yoqilgan</p>
            <div className="bot-tag-pill">
              <HiOutlineGlobeAlt /> {botConfig.botUsername} • {users.length} ta faol a'zo
            </div>
          </div>
        </div>

        <a
          href={`https://t.me/${botConfig.botUsername.replace('@', '')}`}
          target="_blank"
          rel="noreferrer"
          className="btn btn-secondary btn-lg"
        >
          <HiOutlineArrowTopRightOnSquare /> Botni Ochish (t.me)
        </a>
      </div>

      <div className="telegram-grid-2">
        <div className="card">
          <h3 className="section-title">
            <HiOutlineBellAlert style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Avtomatik Xabarnoma Triggerlari
          </h3>
          <p className="text-muted text-sm mb-4">
            Tizimda hodisa ro'y berganda Telegram orqali avtomatik bildirishnoma yuborish:
          </p>

          <div className="auto-toggle-row">
            <div className="auto-toggle-text">
              <strong>Davomatda Ota-onaga Xabar</strong>
              <span>O'quvchi keldi/kelmadi belgilanganda 1 soniyada xabar boradi</span>
            </div>
            <button
              type="button"
              className={`switch-toggle ${botConfig.autoNotifyAttendance ? "active" : ""}`}
              onClick={() => handleToggle("autoNotifyAttendance")}
            >
              <span className="switch-circle"></span>
            </button>
          </div>

          <div className="auto-toggle-row">
            <div className="auto-toggle-text">
              <strong>To'lov Kvitansiyasi (Chek)</strong>
              <span>To'lov qabul qilinganda ota-ona va o'quvchiga chek yuboriladi</span>
            </div>
            <button
              type="button"
              className={`switch-toggle ${botConfig.autoNotifyPayment ? "active" : ""}`}
              onClick={() => handleToggle("autoNotifyPayment")}
            >
              <span className="switch-circle"></span>
            </button>
          </div>

          <div className="auto-toggle-row">
            <div className="auto-toggle-text">
              <strong>Yangi Lid (Ariza) Signali</strong>
              <span>Sayt yoki botdan yangi mijoz murojaat qilganda adminga xabar</span>
            </div>
            <button
              type="button"
              className={`switch-toggle ${botConfig.autoNotifyLead ? "active" : ""}`}
              onClick={() => handleToggle("autoNotifyLead")}
            >
              <span className="switch-circle"></span>
            </button>
          </div>

          <div className="auto-toggle-row">
            <div className="auto-toggle-text">
              <strong>Kechki Kunlik Moliyaviy Hisobot</strong>
              <span>Har kuni soat 21:00 da rahbarga kunlik tushum va qatnashuv xulosasi</span>
            </div>
            <button
              type="button"
              className={`switch-toggle ${botConfig.autoNotifyDailyReport ? "active" : ""}`}
              onClick={() => handleToggle("autoNotifyDailyReport")}
            >
              <span className="switch-circle"></span>
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="section-title">
            <HiOutlineSparkles style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Jonli Test Simulyatori
          </h3>
          <p className="text-muted text-sm mb-4">
            Bot qanday xabarlar yuborishini tekshirish uchun test signalini bosing:
          </p>

          <div className="test-buttons-grid">
            <button
              type="button"
              className="test-btn"
              onClick={() => triggerTestNotification("ATTENDANCE")}
            >
              <HiOutlineDocumentCheck style={{ color: '#16a34a', fontSize: 18 }} />
              <span>Davomat Xabari Test</span>
            </button>

            <button
              type="button"
              className="test-btn"
              onClick={() => triggerTestNotification("PAYMENT")}
            >
              <HiOutlineCheckBadge style={{ color: '#0284c7', fontSize: 18 }} />
              <span>To'lov Kvitansiyasi Test</span>
            </button>

            <button
              type="button"
              className="test-btn"
              onClick={() => triggerTestNotification("LEAD")}
            >
              <HiOutlineBolt style={{ color: '#d97706', fontSize: 18 }} />
              <span>Yangi Lid Signali Test</span>
            </button>

            <button
              type="button"
              className="test-btn"
              onClick={() => triggerTestNotification("GENERAL")}
            >
              <HiOutlinePaperAirplane style={{ color: '#8b5cf6', fontSize: 18 }} />
              <span>Umumiy Eslatma Test</span>
            </button>
          </div>

          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-bold text-main mb-2">
              <HiOutlineDevicePhoneMobile style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Telegram WebApp Integratsiyasi
            </h4>
            <p className="text-xs text-muted">
              Ushbu CRM Telegram WebApp sifatida to'liq moslashtirilgan. O'quvchi bot ichida <strong>"📱 WebApp-ni Ochish"</strong> tugmasini bosganda butun kabinetini Telegramdan chiqmasdan boshqarishi mumkin.
            </p>
          </div>
        </div>
      </div>

      <div className="telegram-grid-2">
        <div className="card">
          <h3 className="section-title">
            <HiOutlinePaperAirplane style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Ommaviy Xabarnoma Yuborish (Broadcast)
          </h3>
          <p className="text-muted text-sm mb-4">
            Barcha yoki alohida guruh foydalanuvchilariga bir zumda e'lon yuboring:
          </p>

          <form onSubmit={handleSendBroadcast}>
            <div className="form-group">
              <label className="form-label">Kimlarga yuborilsin:</label>
              <select
                className="form-select"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              >
                <option value="all">Barcha Ulangan Foydalanuvchilarga</option>
                <option value="parent">Faqat Ota-onalarga</option>
                <option value="student">Faqat O'quvchilarga</option>
                <option value="teacher">Faqat O'qituvchilarga</option>
                <option value="admin">Faqat Administratorlarga</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Xabarnoma Matni (HTML qo'llab-quvvatlanadi):</label>
              <textarea
                className="form-textarea"
                rows="4"
                placeholder="E'lon matnini kiriting... masalan: Hurmatli o'quvchilar, ertaga bayram munosabati bilan barcha darslar qoldiriladi!"
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={isSending}
            >
              <HiOutlinePaperAirplane />
              {isSending ? "Yuborilmoqda..." : "Telegramga Yuborish"}
            </button>
          </form>
        </div>

        <div className="card">
          <h3 className="section-title">
            <HiOutlineClock style={{ verticalAlign: 'middle', marginRight: 6 }} />
            So'nggi Telegram Xabarlari Logi
          </h3>
          <p className="text-muted text-sm mb-4">
            Bot orqali yuborilgan oxirgi bildirishnomalar ro'yxati:
          </p>

          <div className="telegram-logs-wrap" style={{ maxHeight: 290, overflowY: 'auto' }}>
            {logs.map((log) => {
              const tagClass =
                log.type === "PAYMENT"
                  ? "log-payment"
                  : log.type === "ATTENDANCE"
                  ? "log-attendance"
                  : log.type === "LEAD"
                  ? "log-lead"
                  : "log-message";

              return (
                <div key={log.id} className="telegram-log-item">
                  <div>
                    <span className={`log-type-tag ${tagClass}`} style={{ marginRight: 8 }}>
                      {log.type}
                    </span>
                    <strong>{log.text}</strong>
                  </div>
                  <span className="text-xs text-muted">{log.date}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelegramBot;
