import axios from "axios";

let BOTS_CONFIG = {
  parentBot: {
    id: "parent",
    name: "Ota-onalar Boti",
    token: process.env.TELEGRAM_PARENT_BOT_TOKEN || "",
    username: "@EduControlParentBot",
    description: "Farzand davomati, to'lov cheklari va baholarni ota-onaga yetkazish",
    isEnabled: true,
  },
  studentBot: {
    id: "student",
    name: "O'quvchilar Boti & WebApp",
    token: process.env.TELEGRAM_STUDENT_BOT_TOKEN || "",
    username: "@EduControlStudentBot",
    description: "Dars jadvali, uyga vazifalar va WebApp shaxsiy kabinet",
    isEnabled: true,
  },
  teacherBot: {
    id: "teacher",
    name: "O'qituvchilar Boti",
    token: process.env.TELEGRAM_TEACHER_BOT_TOKEN || "",
    username: "@EduControlTeacherBot",
    description: "Tezkor davomat olish, guruhlar ro'yxati va oylik maosh",
    isEnabled: true,
  },
  adminBot: {
    id: "admin",
    name: "Bosh Admin & Rahbar Boti",
    token: process.env.TELEGRAM_ADMIN_BOT_TOKEN || "",
    adminChatId: process.env.TELEGRAM_ADMIN_CHAT_ID || "",
    username: "@EduControlAdminBot",
    description: "Yangi arizalar (Lidlar) signali, kechki kunlik hisobot va ommaviy e'lonlar",
    isEnabled: true,
  },
  autoNotifyAttendance: true,
  autoNotifyPayment: true,
  autoNotifyLead: true,
  autoNotifyDailyReport: true,
  webAppUrl: "http://localhost:5173",
};

let CONNECTED_USERS = [
  { chatId: "998905990600", name: "Abdulaziz Abdulhayev", role: "admin", phone: "+998 90 599 06 00", joinedDate: "2026-08-20", bot: "Admin Bot" },
  { chatId: "998901234567", name: "Rustam Mahmudov (Ota-ona)", role: "parent", phone: "+998 90 123 45 67", joinedDate: "2026-08-21", bot: "Ota-onalar Boti" },
  { chatId: "998939876543", name: "Diyorbek Toshmatov", role: "student", phone: "+998 93 987 65 43", joinedDate: "2026-08-22", bot: "O'quvchilar Boti" },
  { chatId: "998901112233", name: "Sardor Rahimov (Ustoz)", role: "teacher", phone: "+998 90 111 22 33", joinedDate: "2026-08-22", bot: "O'qituvchilar Boti" },
];

let BOT_LOGS = [
  { id: 1, bot: "Ota-onalar Boti", type: "PAYMENT", text: "850,000 so'm to'lov kvitansiyasi ota-onaga yuborildi", date: "2026-08-23 18:30" },
  { id: 2, bot: "Ota-onalar Boti", type: "ATTENDANCE", text: "Abdulaziz darsga kelganligi haqida xabar berildi", date: "2026-08-23 14:05" },
  { id: 3, bot: "Admin Bot", type: "LEAD", text: "Yangi lid: Jasurbek Rustamov (+998905990600) adminga uzatildi", date: "2026-08-23 11:20" },
];

export const getBotsConfig = () => ({
  ...BOTS_CONFIG,
  connectedCount: CONNECTED_USERS.length,
});

export const getBotLogs = () => BOT_LOGS;
export const getConnectedUsers = () => CONNECTED_USERS;

export const updateBotsConfig = (newConfig) => {
  BOTS_CONFIG = {
    ...BOTS_CONFIG,
    ...newConfig,
    parentBot: { ...BOTS_CONFIG.parentBot, ...(newConfig.parentBot || {}) },
    studentBot: { ...BOTS_CONFIG.studentBot, ...(newConfig.studentBot || {}) },
    teacherBot: { ...BOTS_CONFIG.teacherBot, ...(newConfig.teacherBot || {}) },
    adminBot: { ...BOTS_CONFIG.adminBot, ...(newConfig.adminBot || {}) },
  };
  return BOTS_CONFIG;
};

export const sendBotRawMessage = async (botKey, chatId, text, replyMarkup = null) => {
  const targetBot = BOTS_CONFIG[botKey] || BOTS_CONFIG.adminBot;
  const botName = targetBot.name || "Telegram Bot";

  const logItem = {
    id: Date.now(),
    bot: botName,
    type: "MESSAGE",
    text: `[${chatId}]: ${text.slice(0, 70)}...`,
    date: new Date().toISOString().replace("T", " ").slice(0, 16),
  };
  BOT_LOGS.unshift(logItem);
  if (BOT_LOGS.length > 60) BOT_LOGS.pop();

  if (!targetBot.token || targetBot.token.trim() === "") {
    return {
      success: true,
      mode: "ready_for_token",
      bot: botName,
      message: `${botName} uchun Token hali kiritilmagan. Sozlamalardan BotFather tokenini kiriting.`,
    };
  }

  try {
    const url = `https://api.telegram.org/bot${targetBot.token.trim()}/sendMessage`;
    const payload = {
      chat_id: chatId,
      text: text,
      parse_mode: "HTML",
    };
    if (replyMarkup) payload.reply_markup = replyMarkup;
    const res = await axios.post(url, payload);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, error: err.response?.data?.description || err.message };
  }
};

export const broadcastToBot = async (botKey, text) => {
  const roleMap = {
    parentBot: "parent",
    studentBot: "student",
    teacherBot: "teacher",
    adminBot: "admin",
  };

  const targetRole = roleMap[botKey];
  const recipients = CONNECTED_USERS.filter(
    (u) => !targetRole || u.role === targetRole || botKey === "all"
  );

  for (const user of recipients) {
    await sendBotRawMessage(botKey === "all" ? "adminBot" : botKey, user.chatId, text);
  }

  return {
    success: true,
    sentCount: recipients.length,
    botKey,
  };
};

export const notifyAttendanceChange = async (studentName, status, groupName, date) => {
  if (!BOTS_CONFIG.autoNotifyAttendance) return;

  const statusText =
    status === "Present"
      ? "✅ <b>Darsga Yetib Keldi</b>"
      : status === "Absent"
      ? "❌ <b>Darsga Kelmadi (Sababsiz)</b>"
      : "⏳ <b>Uzrli Sabab Bilan Darsda Yo'q</b>";

  const message = `🔔 <b>OTA-ONA BILDIRISHNOMASI</b>\n\n` +
    `👤 <b>Farzandingiz:</b> ${studentName}\n` +
    `📚 <b>Guruh:</b> ${groupName || "Frontend ReactJS"}\n` +
    `📅 <b>Sana:</b> ${date}\n` +
    `📊 <b>Holati:</b> ${statusText}\n\n` +
    `<i>EduControl Ota-onalar Avtomatlashtirilgan Boti</i>`;

  const logItem = {
    id: Date.now(),
    bot: "Ota-onalar Boti",
    type: "ATTENDANCE",
    text: `${studentName} davomati: ${status}`,
    date: new Date().toISOString().replace("T", " ").slice(0, 16),
  };
  BOT_LOGS.unshift(logItem);

  const parentUsers = CONNECTED_USERS.filter((u) => u.role === "parent");
  for (const p of parentUsers) {
    await sendBotRawMessage("parentBot", p.chatId, message);
  }
};

export const notifyPaymentReceived = async (studentName, amount, month, paymentMethod) => {
  if (!BOTS_CONFIG.autoNotifyPayment) return;

  const formattedAmount = Number(amount).toLocaleString() + " so'm";
  const message = `🧾 <b>TO'LOV KVITANSIYASI (CHEK)</b>\n\n` +
    `👤 <b>O'quvchi:</b> ${studentName}\n` +
    `💰 <b>Summa:</b> ${formattedAmount}\n` +
    `📅 <b>Davr:</b> ${month}\n` +
    `💳 <b>Usul:</b> ${paymentMethod || "Karta (Click)"}\n\n` +
    `<i>To'lovingiz qabul qilindi. EduControl tizimi orqali tasdiqlangan.</i>`;

  const logItem = {
    id: Date.now(),
    bot: "Ota-onalar Boti",
    type: "PAYMENT",
    text: `${studentName} to'lovi: ${formattedAmount}`,
    date: new Date().toISOString().replace("T", " ").slice(0, 16),
  };
  BOT_LOGS.unshift(logItem);

  const parentAndStudents = CONNECTED_USERS.filter((u) => u.role === "parent" || u.role === "student");
  for (const u of parentAndStudents) {
    await sendBotRawMessage(u.role === "parent" ? "parentBot" : "studentBot", u.chatId, message);
  }
};

export const notifyNewLeadReceived = async (leadName, phone, courseName) => {
  if (!BOTS_CONFIG.autoNotifyLead) return;

  const message = `⚡ <b>YANGI ARIZA (LID) KELDI!</b>\n\n` +
    `👤 <b>Mijoz:</b> ${leadName}\n` +
    `📞 <b>Telefon:</b> <code>${phone}</code>\n` +
    `🎯 <b>Kurs:</b> ${courseName || "Frontend ReactJS"}\n` +
    `⏰ <b>Vaqti:</b> ${new Date().toLocaleTimeString()}\n\n` +
    `👉 <i>Boshqaruvchi, iltimos mijozga tezkor qo'ng'iroq qiling!</i>`;

  const logItem = {
    id: Date.now(),
    bot: "Admin Bot",
    type: "LEAD",
    text: `Yangi ariza: ${leadName} (${phone})`,
    date: new Date().toISOString().replace("T", " ").slice(0, 16),
  };
  BOT_LOGS.unshift(logItem);

  const adminUsers = CONNECTED_USERS.filter((u) => u.role === "admin");
  for (const admin of adminUsers) {
    await sendBotRawMessage("adminBot", admin.chatId, message);
  }
};

export default {
  getBotsConfig,
  updateBotsConfig,
  getBotLogs,
  getConnectedUsers,
  sendBotRawMessage,
  broadcastToBot,
  notifyAttendanceChange,
  notifyPaymentReceived,
  notifyNewLeadReceived,
};
