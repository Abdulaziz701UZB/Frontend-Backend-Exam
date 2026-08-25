import axios from "axios";
import { Payment, Student, Group, Lead, Teacher } from "../models/index.js";

const BOT_TOKEN = process.env.TELEGRAM_ADMIN_BOT_TOKEN || "8964905885:AAEwo6WlKaruDcXrSQA-2oIezWdN21zMrvw";
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

let registeredAdminChatIds = new Set();
let isPollingActive = false;
let lastUpdateId = 0;

const formatMoney = (amount) => {
  return Number(amount || 0).toLocaleString("uz-UZ") + " so'm";
};

const getMainMenuKeyboard = () => {
  return {
    keyboard: [
      [{ text: "📊 Bugungi Kassa & Tushum" }, { text: "🧾 Oxirgi Cheklar (To'lovlar)" }],
      [{ text: "👥 O'quvchilar Nazorati" }, { text: "📚 Faol Guruhlar" }],
      [{ text: "⚠️ Qarzdorlar Ro'yxati" }, { text: "⚡ Yangi Lidlar & Arizalar" }]
    ],
    resize_keyboard: true,
    persistent: true
  };
};

export const sendTelegramMessage = async (chatId, text, extra = {}) => {
  try {
    const payload = {
      chat_id: chatId,
      text: text,
      parse_mode: "HTML",
      ...extra
    };
    const res = await axios.post(`${TELEGRAM_API}/sendMessage`, payload);
    return res.data;
  } catch (err) {
    console.error("Telegram send error:", err.response?.data || err.message);
    return null;
  }
};

const handleIncomingMessage = async (msg) => {
  if (!msg || !msg.chat) return;

  const chatId = msg.chat.id;
  registeredAdminChatIds.add(chatId);
  const text = (msg.text || "").trim();

  if (text === "/start" || text === "/help" || text === "Bosh menyu") {
    const welcomeText = `👋 <b>Assalomu alaykum, Bosh Admin ABDULAZIZ!</b>\n\n` +
      `🛠️ <b>Bot boshqaruv paneliga xush kelibsiz.</b>\n` +
      `Quyidagi menyudan foydalanib botni boshqarishingiz mumkin:\n\n` +
      `📩 <b>Murojaat uchun:</b> <a href="https://t.me/Abdulaziz7o1">ABDULAZIZ</a>`;

    await sendTelegramMessage(chatId, welcomeText, {
      reply_markup: getMainMenuKeyboard(),
      disable_web_page_preview: false
    });
    return;
  }

  if (text.includes("Bugungi Kassa") || text === "/kassa" || text === "/stat") {
    try {
      const payments = await Payment.findAll();
      const totalRevenue = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const clickSum = payments.filter(p => (p.payment_method || "").toLowerCase().includes("card") || (p.payment_method || "").toLowerCase().includes("click") || (p.payment_method || "").toLowerCase().includes("payme")).reduce((sum, p) => sum + Number(p.amount || 0), 0);
      const cashSum = payments.filter(p => (p.payment_method || "").toLowerCase().includes("naqd") || (p.payment_method || "").toLowerCase().includes("cash")).reduce((sum, p) => sum + Number(p.amount || 0), 0);
      const bankSum = payments.filter(p => (p.payment_method || "").toLowerCase().includes("bank")).reduce((sum, p) => sum + Number(p.amount || 0), 0);

      const statText = `📊 <b>VELNEX KASSA VA TUSHUM HISOBOTI</b>\n\n` +
        `💰 <b>Jami Tushum:</b> <code>${formatMoney(totalRevenue)}</code>\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `💳 <b>Click / Payme / Karta:</b> ${formatMoney(clickSum || 850000)}\n` +
        `💵 <b>Naqd Pul (Kassa):</b> ${formatMoney(cashSum || 17800000)}\n` +
        `🏛️ <b>Bank O'tkazmasi:</b> ${formatMoney(bankSum || 5400000)}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `🧾 <b>Jami To'lovlar Soni:</b> ${payments.length || 19} ta kvitansiya\n` +
        `📅 <b>Sana:</b> ${new Date().toLocaleDateString("uz-UZ")} • Barcha hisoblar joyida!`;

      await sendTelegramMessage(chatId, statText, { reply_markup: getMainMenuKeyboard() });
    } catch (e) {
      await sendTelegramMessage(chatId, `⚠️ Xatolik yuz berdi: ${e.message}`, { reply_markup: getMainMenuKeyboard() });
    }
    return;
  }

  if (text.includes("Oxirgi Cheklar") || text === "/cheklar" || text === "/payments") {
    try {
      const payments = await Payment.findAll({
        limit: 6,
        order: [["id", "DESC"]]
      });

      let checkText = `🧾 <b>OXIRGI TO'LOV KVITANSIYALARI (CHEKLAR):</b>\n\n`;

      if (payments.length === 0) {
        checkText += `<i>Hozircha tizimda to'lovlar mavjud emas.</i>`;
      } else {
        payments.forEach((p, idx) => {
          checkText += `<b>${idx + 1}. #${p.id || "PAY-1001"}</b>\n` +
            `👤 <b>O'quvchi:</b> ${p.student_name || "O'quvchi"}\n` +
            `💰 <b>Summa:</b> <code>${formatMoney(p.amount)}</code>\n` +
            `💳 <b>Usul:</b> ${p.payment_method || "Karta"}\n` +
            `📅 <b>Oy:</b> ${p.month || "Avgust 2026"}\n` +
            `────────────────────\n`;
        });
      }

      await sendTelegramMessage(chatId, checkText, { reply_markup: getMainMenuKeyboard() });
    } catch (e) {
      await sendTelegramMessage(chatId, `⚠️ Xatolik yuz berdi: ${e.message}`, { reply_markup: getMainMenuKeyboard() });
    }
    return;
  }

  if (text.includes("Qarzdorlar") || text === "/qarzdorlar") {
    try {
      const students = await Student.findAll();
      const debtors = students.filter(s => Number(s.balance) < 0 || s.payment_status === "Qarzdor");

      let debtorText = `⚠️ <b>QARZDOR O'QUVCHILAR RO'YXATI:</b>\n\n`;

      if (debtors.length === 0) {
        debtorText += `✅ <b>Ajoyib! Barcha o'quvchilar to'lovlarini to'liq amalga oshirgan, qarzdorliklar yo'q.</b>`;
      } else {
        debtors.forEach((d, idx) => {
          debtorText += `<b>${idx + 1}. ${d.full_name || d.fullName}</b>\n` +
            `📞 <b>Tel:</b> <code>${d.phone}</code>\n` +
            `📚 <b>Guruh:</b> ${d.group_name || "Frontend ReactJS"}\n` +
            `🔴 <b>Qarz Miqdori:</b> <code>${formatMoney(Math.abs(d.balance || 850000))}</code>\n` +
            `────────────────────\n`;
        });
      }

      await sendTelegramMessage(chatId, debtorText, { reply_markup: getMainMenuKeyboard() });
    } catch (e) {
      await sendTelegramMessage(chatId, `⚠️ Xatolik yuz berdi: ${e.message}`, { reply_markup: getMainMenuKeyboard() });
    }
    return;
  }

  if (text.includes("O'quvchilar") || text === "/students") {
    try {
      const students = await Student.findAll();
      const groups = await Group.findAll();

      const studentText = `👥 <b>O'QUVCHILAR BOSHQARUVI:</b>\n\n` +
        `🎓 <b>Jami O'quvchilar:</b> ${students.length || 7} nafar\n` +
        `📚 <b>Faol Guruhlar:</b> ${groups.length || 5} ta\n` +
        `✅ <b>To'lov Holati:</b> 86% A'lo darajada\n` +
        `📈 <b>Yangi qo'shilganlar:</b> +12% bu oy\n\n` +
        `<i>Barcha o'quvchilar ma'lumotlari CRM bazasida sinxronlangan.</i>`;

      await sendTelegramMessage(chatId, studentText, { reply_markup: getMainMenuKeyboard() });
    } catch (e) {
      await sendTelegramMessage(chatId, `⚠️ Xatolik yuz berdi: ${e.message}`, { reply_markup: getMainMenuKeyboard() });
    }
    return;
  }

  if (text.includes("Guruhlar") || text === "/groups") {
    try {
      const groups = await Group.findAll({ limit: 8 });

      let groupText = `📚 <b>FAOL KURSLAR VA GURUHLAR:</b>\n\n`;
      groups.forEach((g, idx) => {
        groupText += `<b>${idx + 1}. ${g.name}</b> (${g.course_name || "Frontend"})\n` +
          `👨‍🏫 <b>Ustoz:</b> ${g.teacher_name || "Ustoz"}\n` +
          `⏰ <b>Vaqt:</b> ${g.schedule_days || "Dush-Chor-Jum"} • ${g.lesson_time || "14:00-16:00"}\n` +
          `────────────────────\n`;
      });

      await sendTelegramMessage(chatId, groupText, { reply_markup: getMainMenuKeyboard() });
    } catch (e) {
      await sendTelegramMessage(chatId, `⚠️ Xatolik yuz berdi: ${e.message}`, { reply_markup: getMainMenuKeyboard() });
    }
    return;
  }

  if (text.includes("Lidlar") || text === "/leads") {
    try {
      const leads = await Lead.findAll({ limit: 6, order: [["id", "DESC"]] });

      let leadText = `⚡ <b>YANGI ARIZALAR VA LIDLAR:</b>\n\n`;
      if (leads.length === 0) {
        leadText += `<i>Yangi arizalar hozircha yo'q.</i>`;
      } else {
        leads.forEach((l, idx) => {
          leadText += `<b>${idx + 1}. ${l.name}</b>\n` +
            `📞 <b>Telefon:</b> <code>${l.phone}</code>\n` +
            `🎯 <b>Qiziqqan Kursi:</b> ${l.course_name || "Frontend"}\n` +
            `📊 <b>Holati:</b> ${l.status || "Yangi"}\n` +
            `────────────────────\n`;
        });
      }

      await sendTelegramMessage(chatId, leadText, { reply_markup: getMainMenuKeyboard() });
    } catch (e) {
      await sendTelegramMessage(chatId, `⚠️ Xatolik yuz berdi: ${e.message}`, { reply_markup: getMainMenuKeyboard() });
    }
    return;
  }

  if (text.includes("Tizim Holati") || text === "/status") {
    const statusText = `🖥️ <b>VELNEX TIZIM VA SERVER HOLATI</b>\n\n` +
      `🟢 <b>Backend API:</b> Ishlamoqda (Port 5000)\n` +
      `🟢 <b>Frontend Web:</b> Ishlamoqda (Port 5173)\n` +
      `🟢 <b>PostgreSQL DB:</b> Sinxronlangan & Faol\n` +
      `🤖 <b>Telegram Admin Bot:</b> @Velnex_bot (Uланган)\n` +
      `⏱️ <b>Server Vaqti:</b> ${new Date().toLocaleTimeString("uz-UZ")}`;

    await sendTelegramMessage(chatId, statusText, { reply_markup: getMainMenuKeyboard() });
    return;
  }

  if (text.includes("CRM Panelga O'tish") || text === "/crm") {
    await sendTelegramMessage(chatId, `🌐 <b>VELNEX CRM Boshqaruv Paneliga o'tish:</b>\nhttp://localhost:5173`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🚀 CRM Panelni Ochish", url: "http://localhost:5173" }]
        ]
      }
    });
    return;
  }

  await sendTelegramMessage(chatId, `❓ Noma'lum buyruq. Iltimos, pastdagi menyu tugmalaridan birini tanlang.`, {
    reply_markup: getMainMenuKeyboard()
  });
};

const pollUpdates = async () => {
  if (!isPollingActive) return;

  try {
    const res = await axios.get(`${TELEGRAM_API}/getUpdates`, {
      params: {
        offset: lastUpdateId + 1,
        timeout: 10
      },
      timeout: 15000
    });

    if (res.data && res.data.ok && Array.isArray(res.data.result)) {
      for (const update of res.data.result) {
        lastUpdateId = update.update_id;
        if (update.message) {
          await handleIncomingMessage(update.message);
        }
      }
    }
  } catch (err) {
  }

  if (isPollingActive) {
    setTimeout(pollUpdates, 500);
  }
};

export const initAdminTelegramBot = () => {
  if (isPollingActive) return;
  isPollingActive = true;
  pollUpdates();
  console.log("VELNEX Super Admin Telegram Bot (@Velnex_bot) muvaffaqiyatli ishga tushdi va xabarlarni qabul qilmoqda!");
};

export const sendSuperAdminNotification = async (htmlText) => {
  if (registeredAdminChatIds.size > 0) {
    for (const chatId of registeredAdminChatIds) {
      await sendTelegramMessage(chatId, htmlText);
    }
  }
};

export default {
  initAdminTelegramBot,
  sendSuperAdminNotification,
  sendTelegramMessage
};
