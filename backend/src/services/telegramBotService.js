import axios from "axios";
import { Student, Teacher, Group, Payment, Attendance, Lead } from "../models/index.js";

let BOT_CONFIG = {
  token: process.env.TELEGRAM_BOT_TOKEN || "7891234567:AAFakeDemoTokenEduControlBotUzbekistan",
  adminChatId: process.env.TELEGRAM_ADMIN_CHAT_ID || "123456789",
  botUsername: "@EduControlDemoBot",
  isEnabled: true,
  webAppUrl: "http://localhost:5173",
  autoNotifyAttendance: true,
  autoNotifyPayment: true,
  autoNotifyLead: true,
  autoNotifyDailyReport: true,
};

let CONNECTED_USERS = [
  { chatId: "998905990600", name: "Abdulaziz Abdulhayev", role: "admin", phone: "+998 90 599 06 00", joinedDate: "2026-08-20" },
  { chatId: "998901234567", name: "Rustam Mahmudov (Ota-ona)", role: "parent", phone: "+998 90 123 45 67", joinedDate: "2026-08-21" },
  { chatId: "998939876543", name: "Diyorbek Toshmatov", role: "student", phone: "+998 93 987 65 43", joinedDate: "2026-08-22" },
];

let BOT_LOGS = [
  { id: 1, type: "PAYMENT", text: "850,000 so'm to'lov kvitansiyasi ota-onaga yuborildi", date: "2026-08-23 18:30" },
  { id: 2, type: "ATTENDANCE", text: "Abdulaziz Abdulhayev darsga kelganligi haqida xabar berildi", date: "2026-08-23 14:05" },
  { id: 3, type: "LEAD", text: "Yangi lid: Jasurbek Rustamov (+998905990600) adminga uzatildi", date: "2026-08-23 11:20" },
];

export const getBotConfig = () => ({ ...BOT_CONFIG, connectedCount: CONNECTED_USERS.length });
export const getBotLogs = () => BOT_LOGS;
export const getConnectedUsers = () => CONNECTED_USERS;

export const updateBotConfig = (newConfig) => {
  BOT_CONFIG = { ...BOT_CONFIG, ...newConfig };
  return BOT_CONFIG;
};

export const sendTelegramRawMessage = async (chatId, text, replyMarkup = null) => {
  const logItem = {
    id: Date.now(),
    type: "MESSAGE",
    text: `Chat [${chatId}]: ${text.slice(0, 70)}...`,
    date: new Date().toISOString().replace("T", " ").slice(0, 16),
  };
  BOT_LOGS.unshift(logItem);
  if (BOT_LOGS.length > 50) BOT_LOGS.pop();

  if (!BOT_CONFIG.token || BOT_CONFIG.token.includes("FakeDemo")) {
    return { success: true, mode: "simulation", message: "Demo rejimda xabar muvaffaqiyatli qayd etildi" };
  }

  try {
    const url = `https://api.telegram.org/bot${BOT_CONFIG.token}/sendMessage`;
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

export const broadcastMessage = async (text, targetRole = "all") => {
  const recipients = CONNECTED_USERS.filter(
    (u) => targetRole === "all" || u.role === targetRole
  );

  for (const user of recipients) {
    await sendTelegramRawMessage(user.chatId, text);
  }

  return {
    success: true,
    sentCount: recipients.length,
    targetRole,
  };
};

export const notifyAttendanceChange = async (studentName, status, groupName, date) => {
  if (!BOT_CONFIG.autoNotifyAttendance) return;

  const statusText =
    status === "Present"
      ? "✅ <b>Darsga Yetib Keldi</b>"
      : status === "Absent"
      ? "❌ <b>Darsga Kelmadi (Sababsiz)</b>"
      : "⏳ <b>Uzrli Sabab Bilan Darsda Yo'q</b>";

  const message = `🔔 <b>DAVOMAT BILDIRISHNOMASI</b>\n\n` +
    `👤 <b>O'quvchi:</b> ${studentName}\n` +
    `📚 <b>Guruh:</b> ${groupName || "Frontend ReactJS"}\n` +
    `📅 <b>Sana:</b> ${date}\n` +
    `📊 <b>Holati:</b> ${statusText}\n\n` +
    `<i>EduControl Avtomatlashtirilgan Ta'lim Tizimi</i>`;

  const logItem = {
    id: Date.now(),
    type: "ATTENDANCE",
    text: `${studentName} uchun davomat xabari: ${status}`,
    date: new Date().toISOString().replace("T", " ").slice(0, 16),
  };
  BOT_LOGS.unshift(logItem);

  for (const user of CONNECTED_USERS) {
    await sendTelegramRawMessage(user.chatId, message);
  }
};

export const notifyPaymentReceived = async (studentName, amount, month, paymentMethod) => {
  if (!BOT_CONFIG.autoNotifyPayment) return;

  const formattedAmount = Number(amount).toLocaleString() + " so'm";
  const message = `🧾 <b>TO'LOV QABUL QILINDI!</b>\n\n` +
    `👤 <b>O'quvchi:</b> ${studentName}\n` +
    `💰 <b>To'lov Summasi:</b> ${formattedAmount}\n` +
    `📅 <b>Oy:</b> ${month}\n` +
    `💳 <b>To'lov Usuli:</b> ${paymentMethod || "Karta (Click)"}\n\n` +
    `<i>To'lovingiz uchun minnatdorchilik bildiramiz! Sizning kvitansiyangiz tizimda saqlandi.</i>`;

  const logItem = {
    id: Date.now(),
    type: "PAYMENT",
    text: `${studentName} to'lovi: ${formattedAmount}`,
    date: new Date().toISOString().replace("T", " ").slice(0, 16),
  };
  BOT_LOGS.unshift(logItem);

  for (const user of CONNECTED_USERS) {
    await sendTelegramRawMessage(user.chatId, message);
  }
};

export const notifyNewLeadReceived = async (leadName, phone, courseName) => {
  if (!BOT_CONFIG.autoNotifyLead) return;

  const message = `⚡ <b>YANGI ARIZA (LID) KELIB TUSHDI!</b>\n\n` +
    `👤 <b>Mijoz:</b> ${leadName}\n` +
    `📞 <b>Telefon:</b> <code>${phone}</code>\n` +
    `🎯 <b>Qiziqayotgan Kurs:</b> ${courseName || "Frontend ReactJS"}\n` +
    `⏰ <b>Kelgan Vaqti:</b> ${new Date().toLocaleTimeString()}\n\n` +
    `👉 <i>Administratorga zudlik bilan aloqaga chiqish tavsiya etiladi!</i>`;

  const logItem = {
    id: Date.now(),
    type: "LEAD",
    text: `Yangi ariza: ${leadName} (${phone})`,
    date: new Date().toISOString().replace("T", " ").slice(0, 16),
  };
  BOT_LOGS.unshift(logItem);

  const adminUsers = CONNECTED_USERS.filter((u) => u.role === "admin");
  for (const admin of adminUsers) {
    await sendTelegramRawMessage(admin.chatId, message);
  }
};

export const handleIncomingTelegramUpdate = async (update) => {
  if (!update || !update.message) return { status: "ignored" };

  const msg = update.message;
  const chatId = msg.chat.id;
  const text = (msg.text || "").trim();
  const userName = msg.from.first_name || "Foydalanuvchi";

  if (!CONNECTED_USERS.some((u) => u.chatId === chatId.toString())) {
    CONNECTED_USERS.push({
      chatId: chatId.toString(),
      name: `${userName} ${msg.from.last_name || ""}`.trim(),
      role: "student",
      phone: "+998 90 ...",
      joinedDate: new Date().toISOString().split("T")[0],
    });
  }

  if (text.startsWith("/start")) {
    const welcome = `Assalomu alaykum, <b>${userName}</b>!\n\n` +
      `🏫 <b>EduControl CRM & LMS Rasmiy Botiga xush kelibsiz!</b>\n\n` +
      `Ushbu bot orqali dars jadvali, farzandingiz davomati, to'lovlar va uyga vazifalarni to'g'ridan-to'g'ri Telegram orqali boshqarishingiz mumkin.\n\n` +
      `Quyidagi bo'limlardan birini tanlang:`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: "👨‍👩‍👦 Ota-ona Kabineti", callback_data: "menu_parent" },
          { text: "🎓 O'quvchi Kabineti", callback_data: "menu_student" },
        ],
        [
          { text: "👨‍🏫 O'qituvchi Paneli", callback_data: "menu_teacher" },
          { text: "👑 Bosh Admin Hisoboti", callback_data: "menu_admin" },
        ],
        [
          { text: "📱 Telegram WebApp-ni Ochish", web_app: { url: BOT_CONFIG.webAppUrl } },
        ],
      ],
    };

    return sendTelegramRawMessage(chatId, welcome, keyboard);
  }

  if (text === "/hisobot" || text.includes("Hisobot")) {
    const reportText = `📊 <b>KUNLIK MOLIYAVIY VA DAVOMAT HISOBOTI</b>\n\n` +
      `💰 <b>Bugungi tushum:</b> 14,250,000 so'm (16 ta to'lov)\n` +
      `👥 <b>Jami o'quvchilar davomati:</b> 96% qatnashuv\n` +
      `⚡ <b>Yangi arizalar (Lidlar):</b> 6 ta\n` +
      `⚠️ <b>Qarzdorlik holatlari:</b> 3 ta o'quvchi\n\n` +
      `<i>EduControl Real-time Database Snapshot</i>`;

    return sendTelegramRawMessage(chatId, reportText);
  }

  if (text === "/jadval" || text.includes("Jadval")) {
    const scheduleText = `📅 <b>SIZNING DARS JADVALINGIZ:</b>\n\n` +
      `🔹 <b>Kurs:</b> Frontend ReactJS (F-12 Guruh)\n` +
      `⏰ <b>Vaqt:</b> Dushanba - Chorshanba - Juma (14:00 - 16:00)\n` +
      `🏢 <b>Xona:</b> 201-xona (Kompyuter zali)\n` +
      `👨‍🏫 <b>Ustoz:</b> Abdulaziz Abdulhayev\n\n` +
      `<i>Keyingi dars: Bugun soat 14:00 da boshlanadi!</i>`;

    return sendTelegramRawMessage(chatId, scheduleText);
  }

  const defaultReply = `Sizning so'rovingiz qabul qilindi: "<b>${text}</b>"\n\n` +
    `Bosh menyuni ko'rish uchun /start buyrug'ini bosing.`;
  return sendTelegramRawMessage(chatId, defaultReply);
};

export default {
  getBotConfig,
  updateBotConfig,
  getBotLogs,
  getConnectedUsers,
  sendTelegramRawMessage,
  broadcastMessage,
  notifyAttendanceChange,
  notifyPaymentReceived,
  notifyNewLeadReceived,
  handleIncomingTelegramUpdate,
};
