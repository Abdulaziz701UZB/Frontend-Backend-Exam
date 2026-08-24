import { useState, useEffect } from "react";
import { telegramApi } from "../../services/api";
import {
  HiOutlinePaperAirplane,
  HiOutlineBellAlert,
  HiOutlineDevicePhoneMobile,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineKey,
  HiOutlineGlobeAlt,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineInformationCircle,
  HiOutlineBolt,
  HiOutlineSparkles
} from "react-icons/hi2";
import { FaTelegram, FaCrown, FaChalkboardUser, FaGraduationCap, FaPeopleRoof } from "react-icons/fa6";
import "./TelegramBot.css";

const TelegramBot = () => {
  const [botsConfig, setBotsConfig] = useState({
    parentBot: {
      id: "parent",
      name: "Ota-onalar Boti",
      token: "",
      username: "@VelnexParentBot",
      description: "Farzand davomati, to'lov cheklari va baholarni ota-onaga yetkazish",
      isEnabled: true,
    },
    studentBot: {
      id: "student",
      name: "O'quvchilar Boti & WebApp",
      token: "",
      username: "@VelnexStudentBot",
      description: "Dars jadvali, uyga vazifalar va WebApp shaxsiy kabinet",
      isEnabled: true,
    },
    teacherBot: {
      id: "teacher",
      name: "O'qituvchilar Boti",
      token: "",
      username: "@VelnexTeacherBot",
      description: "Tezkor davomat olish, guruhlar ro'yxati va oylik maosh",
      isEnabled: true,
    },
    adminBot: {
      id: "admin",
      name: "Bosh Admin & Rahbar Boti",
      token: "",
      adminChatId: "",
      username: "@VelnexAdminBot",
      description: "Yangi arizalar (Lidlar) signali, kechki kunlik hisobot va ommaviy e'lonlar",
      isEnabled: true,
    },
    autoNotifyAttendance: true,
    autoNotifyPayment: true,
    autoNotifyLead: true,
    autoNotifyDailyReport: true,
    webAppUrl: "http://localhost:5173",
  });

  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [broadcastText, setBroadcastText] = useState("");
  const [targetBotKey, setTargetBotKey] = useState("all");
  const [isSending, setIsSending] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState("");

  const loadStatus = async () => {
    try {
      setLoading(true);
      const data = await telegramApi.getStatus();
      if (data.config) setBotsConfig(data.config);
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

  const handleBotFieldChange = (botKey, field, value) => {
    setBotsConfig((prev) => ({
      ...prev,
      [botKey]: {
        ...prev[botKey],
        [field]: value,
      },
    }));
  };

  const saveIndividualBot = async (botKey) => {
    try {
      await telegramApi.updateConfig(botsConfig);
      const botName = botsConfig[botKey]?.name || "Bot";
      setAlertSuccess(`"${botName}" sozlamalari muvaffaqiyatli saqlandi!`);
      setTimeout(() => setAlertSuccess(""), 3500);
      loadStatus();
    } catch (err) {
      alert("Xatolik: " + err.message);
    }
  };

  const handleToggle = async (key) => {
    const updated = { ...botsConfig, [key]: !botsConfig[key] };
    setBotsConfig(updated);
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
      const res = await telegramApi.sendBroadcast(broadcastText, targetBotKey);
      setAlertSuccess(`Xabarnoma ${res.sentCount || users.length} ta foydalanuvchiga yuborildi!`);
      setBroadcastText("");
      setTimeout(() => setAlertSuccess(""), 3500);
      loadStatus();
    } catch (err) {
      alert("Xatolik: " + err.message);
    } finally {
      setIsSending(false);
    }
  };

  const triggerTestNotification = async (botKey, type) => {
    try {
      await telegramApi.sendTestNotification(type, { botKey });
      setAlertSuccess(`"${type}" bo'yicha test xabari muvaffaqiyatli jo'natildi!`);
      setTimeout(() => setAlertSuccess(""), 3000);
      loadStatus();
    } catch (err) {
      alert("Test yuborishda xatolik: " + err.message);
    }
  };

  const renderBotCard = (botKey, icon, iconClass, specificInputs = null) => {
    const bot = botsConfig[botKey] || {};
    const hasToken = Boolean(bot.token && bot.token.trim() !== "");

    return (
      <div className="bot-card-box">
        <div className="bot-card-header">
          <div className="bot-header-left">
            <div className={`bot-icon-circle ${iconClass}`}>{icon}</div>
            <div className="bot-title-area">
              <h3>{bot.name}</h3>
              <p>{bot.description}</p>
            </div>
          </div>
          <span
            className={`token-status-pill ${
              hasToken ? "status-active-bot" : "status-waiting-bot"
            }`}
          >
            {hasToken ? "Token Ulangan" : "Token Kutilmoqda"}
          </span>
        </div>

        <div className="bot-card-form">
          <div className="form-group mb-0">
            <label className="form-label text-xs">
              <HiOutlineKey className="inline-icon-xs" />
              BotFather Token (Bo'sh qoldirilgan - tokeningizni kiriting):
            </label>
            <input
              type="text"
              className="form-input"
              placeholder=""
              value={bot.token || ""}
              onChange={(e) =>
                handleBotFieldChange(botKey, "token", e.target.value)
              }
            />
          </div>

          <div className="form-group mb-0">
            <label className="form-label text-xs">
              <HiOutlineGlobeAlt className="inline-icon-xs" />
              Bot Username:
            </label>
            <input
              type="text"
              className="form-input"
              placeholder=""
              value={bot.username || ""}
              onChange={(e) =>
                handleBotFieldChange(botKey, "username", e.target.value)
              }
            />
          </div>

          {specificInputs}
        </div>

        <div className="bot-card-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => triggerTestNotification(botKey, "GENERAL")}
          >
            <HiOutlineSparkles /> Test Xabar
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => saveIndividualBot(botKey)}
          >
            <HiOutlineCheckCircle /> Sozlamani Saqlash
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="telegram-page">
      <div className="page-header-flex">
        <div>
          <h1 className="page-title">
            <FaTelegram className="title-icon-blue" />
            13. 4 ta Alohida Telegram Botlar Boshqaruvi
          </h1>
          <p className="page-subtitle">
            Ota-onalar, O'quvchilar, O'qituvchilar va Bosh Admin uchun 4 ta mustaqil bot tokenlarini sozlash
          </p>
        </div>
      </div>

      {alertSuccess && (
        <div className="alert alert-success">
          <HiOutlineCheckCircle className="inline-icon-sm" />
          {alertSuccess}
        </div>
      )}

      <div className="bot-guide-card">
        <div className="flex items-center gap-2">
          <HiOutlineInformationCircle className="bot-guide-header-icon" />
          <strong className="bot-guide-title">BotFather dan 4 ta Bot ochish bo'yicha qisqa yo'riqnoma:</strong>
        </div>
        <div className="guide-steps-grid">
          <div className="guide-step-item">
            <div className="step-num">1</div>
            <strong>Telegramda @BotFather ga kiring</strong>
            <p>Qidiruvdan rasmiy ko'k belgili <code>@BotFather</code> botini topib <code>/start</code> bosing.</p>
          </div>
          <div className="guide-step-item">
            <div className="step-num">2</div>
            <strong>/newbot buyrug'ini yuboring</strong>
            <p>Bot nomini va unikal username deb kiriting.</p>
          </div>
          <div className="guide-step-item">
            <div className="step-num">3</div>
            <strong>Tokenni nusxalab bu yerga qo'ying</strong>
            <p>Berilgan HTTP API tokenni (<i>78912...:AAF...</i>) pastdagi tegishli bot qatoriga qo'yib saqlang.</p>
          </div>
        </div>
      </div>

      <div className="four-bots-grid">
        {renderBotCard(
          "parentBot",
          <FaPeopleRoof />,
          "icon-parent"
        )}

        {renderBotCard(
          "studentBot",
          <FaGraduationCap />,
          "icon-student"
        )}

        {renderBotCard(
          "teacherBot",
          <FaChalkboardUser />,
          "icon-teacher"
        )}

        {renderBotCard(
          "adminBot",
          <FaCrown />,
          "icon-admin",
          <div className="form-group mb-0">
            <label className="form-label text-xs">
              <FaCrown className="inline-icon-xs" />
              Admin Telegram Chat ID:
            </label>
            <input
              type="text"
              className="form-input"
              placeholder=""
              value={botsConfig.adminBot?.adminChatId || ""}
              onChange={(e) =>
                handleBotFieldChange("adminBot", "adminChatId", e.target.value)
              }
            />
          </div>
        )}
      </div>

      <div className="telegram-grid-2">
        <div className="card">
          <h3 className="section-title">
            <HiOutlineBellAlert className="title-icon-indigo" />
            Avtomatik Xabarnoma Triggerlari
          </h3>
          <p className="text-muted text-sm mb-4">
            O'quv markazidagi muhim hodisalar yuz berganda botlar orqali avtomatik
            yuboriladigan xabarlar
          </p>

          <div className="triggers-list">
            <div className="trigger-item">
              <div className="trigger-info">
                <strong>To'lov qabul qilinganda kvitansiya</strong>
                <p>Ota-ona va o'quvchiga darhol PDF / chek yuboriladi</p>
              </div>
              <button
                type="button"
                className={`switch-toggle ${
                  botsConfig.autoNotifyPayment ? "active" : ""
                }`}
                onClick={() => handleToggle("autoNotifyPayment")}
              >
                <span className="switch-circle"></span>
              </button>
            </div>

            <div className="trigger-item">
              <div className="trigger-info">
                <strong>Davomatda "Kelmadi" belgilanganda</strong>
                <p>Ota-onaga dars qoldirilgani haqida ogohlantirish</p>
              </div>
              <button
                type="button"
                className={`switch-toggle ${
                  botsConfig.autoNotifyAbsence ? "active" : ""
                }`}
                onClick={() => handleToggle("autoNotifyAbsence")}
              >
                <span className="switch-circle"></span>
              </button>
            </div>

            <div className="trigger-item">
              <div className="trigger-info">
                <strong>Yangi Lid tushganda Admin botiga</strong>
                <p>Sayt yoki telegramdan yangi murojaat tushsa admin xabardor bo'ladi</p>
              </div>
              <button
                type="button"
                className={`switch-toggle ${
                  botsConfig.autoNotifyLead ? "active" : ""
                }`}
                onClick={() => handleToggle("autoNotifyLead")}
              >
                <span className="switch-circle"></span>
              </button>
            </div>

            <div className="trigger-item">
              <div className="trigger-info">
                <strong>Kunlik umumiy hisobot</strong>
                <p>Har kuni 20:00 da markaz kunlik tushum va davomat xulosasi</p>
              </div>
              <button
                type="button"
                className={`switch-toggle ${
                  botsConfig.autoNotifyDailyReport ? "active" : ""
                }`}
                onClick={() => handleToggle("autoNotifyDailyReport")}
              >
                <span className="switch-circle"></span>
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="section-title">
            <HiOutlinePaperAirplane className="title-icon-indigo" />
            Ommaviy Xabarnoma Yuborish (Broadcast)
          </h3>

          <form onSubmit={handleSendBroadcast}>
            <div className="form-group">
              <label className="form-label">Qaysi Bot Auditoriyasiga:</label>
              <select
                className="form-select"
                value={targetBotKey}
                onChange={(e) => setTargetBotKey(e.target.value)}
              >
                <option value="all">Barcha 4 ta Bot Foydalanuvchilariga</option>
                <option value="parentBot">Faqat Ota-onalar Botiga</option>
                <option value="studentBot">Faqat O'quvchilar Botiga</option>
                <option value="teacherBot">Faqat O'qituvchilar Botiga</option>
                <option value="adminBot">Faqat Admin Botiga</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Xabarnoma Matni (HTML qo'llab-quvvatlanadi):</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder=""
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg btn-block-mobile"
              disabled={isSending}
            >
              <HiOutlinePaperAirplane />
              {isSending ? "Yuborilmoqda..." : "Telegramga Yuborish"}
            </button>
          </form>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">
          <HiOutlineClock className="title-icon-indigo" />
          So'nggi Telegram Xabarlari Logi
        </h3>
        <div className="telegram-logs-wrap">
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
                <div className="log-top-row">
                  <span className={`log-type-tag ${tagClass}`}>
                    {log.bot || "Bot"}: {log.type}
                  </span>
                  <span className="log-date-text">{log.date}</span>
                </div>
                <div className="log-message-body">
                  <strong>{log.text}</strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TelegramBot;
