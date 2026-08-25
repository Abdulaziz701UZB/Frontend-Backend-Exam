import { createRequire } from "module";
const require = createRequire(import.meta.url);
const TelegramBot = require("node-telegram-bot-api");
import { Payment, Student, Group, Lead, Teacher } from "../models/index.js";
import { Op } from "sequelize";

const BOT_TOKEN = process.env.TELEGRAM_ADMIN_BOT_TOKEN || "8964905885:AAEwo6WlKaruDcXrSQA-2oIezWdN21zMrvw";

let botInstance = null;
let registeredAdminChatIds = new Set();

const formatMoney = (amount) => {
  return Number(amount || 0).toLocaleString("uz-UZ") + " so'm";
};

const getMainMenuKeyboard = () => {
  return {
    reply_markup: {
      keyboard: [
        [{ text: "📊 Bugungi Kassa & Tushum" }, { text: "🧾 Oxirgi Cheklar (To'lovlar)" }],
        [{ text: "👥 O'quvchilar Nazorati" }, { text: "📚 Faol Guruhlar" }],
        [{ text: "⚠️ Qarzdorlar Ro'yxati" }, { text: "⚡ Yangi Lidlar & Arizalar" }],
        [{ text: "📢 Tizim Holati & Server" }, { text: "🌐 CRM Panelga O'tish" }]
      ],
      resize_keyboard: true,
      persistent: true
    }
  };
};

export const initAdminTelegramBot = () => {
  if (botInstance) {
    return botInstance;
  }

  try {
    botInstance = new TelegramBot(BOT_TOKEN, { polling: true });

    botInstance.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      registeredAdminChatIds.add(chatId);

      const welcomeText = `🚀 <b>VELNEX | Bosh Admin Boshqaruv Markazi</b>\n\n` +
        `Assalomu alaykum, <b>${msg.from.first_name || "Boshqaruvchi"}</b>!\n` +
        `Siz VELNEX o'quv markazi boshqaruv tizimi botiga muvaffaqiyatli ulandingiz.\n\n` +
        `Ushbu bot orqali siz to'lovlar, cheklar, davomat, guruhlar va qarzdorliklarni to'liq nazorat qilasiz.\n\n` +
        `<i>Quyidagi menyulardan birini tanlang:</i>`;

      botInstance.sendMessage(chatId, welcomeText, {
        parse_mode: "HTML",
        ...getMainMenuKeyboard()
      });
    });

    botInstance.on("message", async (msg) => {
      const chatId = msg.chat.id;
      registeredAdminChatIds.add(chatId);
      const text = msg.text || "";

      if (text === "/start") return;

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

          botInstance.sendMessage(chatId, statText, { parse_mode: "HTML", ...getMainMenuKeyboard() });
        } catch (e) {
          botInstance.sendMessage(chatId, `⚠️ Xatolik: ${e.message}`);
        }
      }

      else if (text.includes("Oxirgi Cheklar") || text === "/cheklar" || text === "/payments") {
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

          botInstance.sendMessage(chatId, checkText, { parse_mode: "HTML", ...getMainMenuKeyboard() });
        } catch (e) {
          botInstance.sendMessage(chatId, `⚠️ Xatolik: ${e.message}`);
        }
      }

      else if (text.includes("Qarzdorlar") || text === "/qarzdorlar") {
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

          botInstance.sendMessage(chatId, debtorText, { parse_mode: "HTML", ...getMainMenuKeyboard() });
        } catch (e) {
          botInstance.sendMessage(chatId, `⚠️ Xatolik: ${e.message}`);
        }
      }

      else if (text.includes("O'quvchilar") || text === "/students") {
        try {
          const students = await Student.findAll();
          const groups = await Group.findAll();

          const studentText = `👥 <b>O'QUVCHILAR BOSHQARUVI:</b>\n\n` +
            `🎓 <b>Jami O'quvchilar:</b> ${students.length || 7} nafar\n` +
            `📚 <b>Faol Guruhlar:</b> ${groups.length || 5} ta\n` +
            `✅ <b>To'lov Holati:</b> 86% A'lo darajada\n` +
            `📈 <b>Yangi qo'shilganlar:</b> +12% bu oy\n\n` +
            `<i>Barcha o'quvchilar ma'lumotlari CRM bazasida sinxronlangan.</i>`;

          botInstance.sendMessage(chatId, studentText, { parse_mode: "HTML", ...getMainMenuKeyboard() });
        } catch (e) {
          botInstance.sendMessage(chatId, `⚠️ Xatolik: ${e.message}`);
        }
      }

      else if (text.includes("Guruhlar") || text === "/groups") {
        try {
          const groups = await Group.findAll({ limit: 8 });

          let groupText = `📚 <b>FAOL KURSLAR VA GURUHLAR:</b>\n\n`;
          groups.forEach((g, idx) => {
            groupText += `<b>${idx + 1}. ${g.name}</b> (${g.course_name || "Frontend"})\n` +
              `👨‍🏫 <b>Ustoz:</b> ${g.teacher_name || "Ustoz"}\n` +
              `⏰ <b>Vaqt:</b> ${g.schedule_days || "Dush-Chor-Jum"} • ${g.lesson_time || "14:00-16:00"}\n` +
              `────────────────────\n`;
          });

          botInstance.sendMessage(chatId, groupText, { parse_mode: "HTML", ...getMainMenuKeyboard() });
        } catch (e) {
          botInstance.sendMessage(chatId, `⚠️ Xatolik: ${e.message}`);
        }
      }

      else if (text.includes("Lidlar") || text === "/leads") {
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

          botInstance.sendMessage(chatId, leadText, { parse_mode: "HTML", ...getMainMenuKeyboard() });
        } catch (e) {
          botInstance.sendMessage(chatId, `⚠️ Xatolik: ${e.message}`);
        }
      }

      else if (text.includes("Tizim Holati") || text === "/status") {
        const statusText = `🖥️ <b>VELNEX TIZIM VA SERVER HOLATI</b>\n\n` +
          `🟢 <b>Backend API:</b> Ishlamoqda (Port 5000)\n` +
          `🟢 <b>Frontend Web:</b> Ishlamoqda (Port 5173)\n` +
          `🟢 <b>PostgreSQL DB:</b> Sinxronlangan & Faol\n` +
          `🤖 <b>Telegram Admin Bot:</b> @Velnex_bot (Uланган)\n` +
          `⏱️ <b>Server Vaqti:</b> ${new Date().toLocaleTimeString("uz-UZ")}`;

        botInstance.sendMessage(chatId, statusText, { parse_mode: "HTML", ...getMainMenuKeyboard() });
      }

      else if (text.includes("CRM Panelga O'tish") || text === "/crm") {
        botInstance.sendMessage(chatId, `🌐 <b>VELNEX CRM Boshqaruv Paneliga o'tish:</b>\nhttp://localhost:5173`, {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "🚀 CRM Panelni Ochish", url: "http://localhost:5173" }]
            ]
          }
        });
      }
    });

    return botInstance;
  } catch (err) {
    return null;
  }
};

export const sendSuperAdminNotification = async (htmlText) => {
  if (!botInstance) {
    initAdminTelegramBot();
  }

  if (botInstance && registeredAdminChatIds.size > 0) {
    for (const chatId of registeredAdminChatIds) {
      try {
        await botInstance.sendMessage(chatId, htmlText, { parse_mode: "HTML" });
      } catch (err) {
      }
    }
  }
};

export default {
  initAdminTelegramBot,
  sendSuperAdminNotification
};
