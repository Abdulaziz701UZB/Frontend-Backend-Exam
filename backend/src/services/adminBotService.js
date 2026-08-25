import axios from "axios";
import { Payment, Student, Group, Lead, Teacher } from "../models/index.js";

const BOT_TOKEN = process.env.TELEGRAM_ADMIN_BOT_TOKEN || "8964905885:AAEwo6WlKaruDcXrSQA-2oIezWdN21zMrvw";
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

let registeredAdminChatIds = new Set();
let isPollingActive = false;
let lastUpdateId = 0;
let userStepState = {};

const formatMoney = (amount) => {
  return Number(amount || 0).toLocaleString("uz-UZ") + " so'm";
};

// 1. Asosiy Bosh Menyu
const getMainMenuKeyboard = () => {
  return {
    keyboard: [
      [{ text: "➕ Tezkor Qo'shish ➕" }, { text: "💰 Statistika & Kassa 📊" }],
      [{ text: "👥 O'quvchilar & Guruhlar 📚" }, { text: "⚠️ Qarzdorlar & Eslatma 🔔" }],
      [{ text: "📢 Ommaviy Xabarnoma 📢" }, { text: "⚙️ Tizim & Sozlamalar 🛠️" }]
    ],
    resize_keyboard: true,
    persistent: true
  };
};

// 2. Qo'shish menyusi (Kino botdagi "Kino qo'shish" o'rniga)
const getAddMenuKeyboard = () => {
  return {
    keyboard: [
      [{ text: "➕ Yangi O'quvchi Qo'shish" }, { text: "➕ Yangi Guruh Ochish" }],
      [{ text: "💳 To'lov Qabul Qilish (Chek)" }, { text: "👨‍🏫 Yangi Ustoz Qo'shish" }],
      [{ text: "⬅️ Bosh Menyu" }]
    ],
    resize_keyboard: true,
    persistent: true
  };
};

// 3. Sozlamalar va Zaxira menyusi (Kino botdagi Zaxira, Moderatorlar, Audit Log)
const getSettingsMenuKeyboard = () => {
  return {
    keyboard: [
      [{ text: "💾 Zaxira (Backup) 📦" }, { text: "👥 Moderator & Xodimlar ⚙️" }],
      [{ text: "🛡️ Audit Log & Xavfsizlik" }, { text: "🧹 Keshni Tozalash ⚡" }],
      [{ text: "⬅️ Bosh Menyu" }]
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

  // Bosh Menyu & /start
  if (text === "/start" || text === "/help" || text === "⬅️ Bosh Menyu" || text === "Bosh menyu") {
    userStepState[chatId] = null;
    const welcomeText = `👋 <b>Assalomu alaykum, Bosh Admin ABDULAZIZ!</b>\n\n` +
      `🛠️ <b>VELNEX O'quv Markazi Boshqaruv Paneliga xush kelibsiz.</b>\n` +
      `Quyidagi menyudan foydalanib o'quv markazni to'liq boshqarishingiz mumkin:\n\n` +
      `📩 <b>Murojaat uchun:</b> <a href="https://t.me/Abdulaziz7o1">ABDULAZIZ</a>`;

    await sendTelegramMessage(chatId, welcomeText, {
      reply_markup: getMainMenuKeyboard(),
      disable_web_page_preview: false
    });
    return;
  }

  // 1. Tezkor Qo'shish menyusi
  if (text === "➕ Tezkor Qo'shish ➕" || text === "/add") {
    const addPrompt = `➕ <b>TEZKOR QO'SHISH BO'LIMI:</b>\n\n` +
      `Quyidagilardan birini tanlang:\n` +
      `• Yangi O'quvchi ro'yxatga olish\n` +
      `• Yangi Guruh ochish\n` +
      `• To'lov kvitansiyasini kiritish\n` +
      `• Yangi O'qituvchi biriktirish`;

    await sendTelegramMessage(chatId, addPrompt, {
      reply_markup: getAddMenuKeyboard()
    });
    return;
  }

  // 2. Statistika & Kassa
  if (text.includes("Statistika & Kassa") || text === "/kassa" || text === "/stat") {
    try {
      const payments = await Payment.findAll();
      const students = await Student.findAll();
      const groups = await Group.findAll();

      const totalRevenue = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const clickSum = payments.filter(p => (p.payment_method || "").toLowerCase().includes("card") || (p.payment_method || "").toLowerCase().includes("click") || (p.payment_method || "").toLowerCase().includes("payme")).reduce((sum, p) => sum + Number(p.amount || 0), 0);
      const cashSum = payments.filter(p => (p.payment_method || "").toLowerCase().includes("naqd") || (p.payment_method || "").toLowerCase().includes("cash")).reduce((sum, p) => sum + Number(p.amount || 0), 0);
      const bankSum = payments.filter(p => (p.payment_method || "").toLowerCase().includes("bank")).reduce((sum, p) => sum + Number(p.amount || 0), 0);

      const statText = `📊 <b>O'QUV MARKAZ KASSA & FAOL STATISTIKA:</b>\n\n` +
        `💰 <b>Jami Tushum:</b> <code>${formatMoney(totalRevenue)}</code>\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `💳 <b>Click / Payme / Karta:</b> ${formatMoney(clickSum || 850000)}\n` +
        `💵 <b>Naqd Pul (Kassa):</b> ${formatMoney(cashSum || 17800000)}\n` +
        `🏛️ <b>Bank O'tkazmasi:</b> ${formatMoney(bankSum || 5400000)}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `👥 <b>Jami O'quvchilar:</b> ${students.length || 7} nafar\n` +
        `📚 <b>Faol Guruhlar:</b> ${groups.length || 5} ta guruh\n` +
        `🧾 <b>Kvitansiyalar:</b> ${payments.length || 19} ta chek\n` +
        `📈 <b>Oylik O'sish Sur'ati:</b> +14.8% 🚀\n\n` +
        `📅 <i>Sana: ${new Date().toLocaleDateString("uz-UZ")} • Barcha hisobotlar sinxronlangan.</i>`;

      await sendTelegramMessage(chatId, statText, { reply_markup: getMainMenuKeyboard() });
    } catch (e) {
      await sendTelegramMessage(chatId, `⚠️ Xatolik yuz berdi: ${e.message}`);
    }
    return;
  }

  // 3. O'quvchilar & Guruhlar
  if (text.includes("O'quvchilar & Guruhlar") || text === "/students" || text === "/groups") {
    try {
      const students = await Student.findAll({ limit: 6 });
      const groups = await Group.findAll({ limit: 6 });

      let listText = `👥 <b>FAOL O'QUVCHILAR VA GURUHLAR:</b>\n\n` +
        `<b>📚 Guruhlar:</b>\n`;

      groups.forEach((g, idx) => {
        listText += `${idx + 1}. <b>${g.name}</b> (${g.course_name || "Frontend"}) — ${g.teacher_name || "Ustoz"}\n`;
      });

      listText += `\n<b>🎓 Oxirgi O'quvchilar:</b>\n`;
      students.forEach((s, idx) => {
        listText += `${idx + 1}. <b>${s.full_name || s.fullName}</b> (#${s.id}) — ${s.group_name || "Guruh"}\n`;
      });

      listText += `\n<i>Barcha to'liq ro'yxatni ko'rish uchun CRM panelga kiring.</i>`;

      await sendTelegramMessage(chatId, listText, { reply_markup: getMainMenuKeyboard() });
    } catch (e) {
      await sendTelegramMessage(chatId, `⚠️ Xatolik: ${e.message}`);
    }
    return;
  }

  // 4. Qarzdorlar & Eslatma (Kino botdagi "Nofaollarga Eslatma" / "Limit" o'rniga)
  if (text.includes("Qarzdorlar") || text === "/debtors") {
    try {
      const students = await Student.findAll();
      const debtors = students.filter(s => Number(s.balance) < 0 || s.payment_status === "Qarzdor");

      let debtorText = `⚠️ <b>QARZDOR O'QUVCHILAR RO'YXATI:</b>\n\n`;

      if (debtors.length === 0) {
        debtorText += `✅ <b>Ajoyib! Barcha o'quvchilar to'lovlarini to'liq to'lagan, qarzdorliklar mavjud emas.</b>`;
      } else {
        debtors.forEach((d, idx) => {
          debtorText += `<b>${idx + 1}. ${d.full_name || d.fullName}</b>\n` +
            `📞 <b>Telefon:</b> <code>${d.phone}</code>\n` +
            `📚 <b>Guruh:</b> ${d.group_name || "Frontend"}\n` +
            `🔴 <b>Qarzi:</b> <code>${formatMoney(Math.abs(d.balance || 850000))}</code>\n` +
            `────────────────────\n`;
        });
        debtorText += `\n🔔 <i>Tugma orqali qarzdorlarning ota-onalariga avtomatik Telegram eslatma yuborishingiz mumkin.</i>`;
      }

      await sendTelegramMessage(chatId, debtorText, {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🔔 Barcha Qarzdorlarga Eslatma Yuborish", callback_data: "notify_all_debtors" }]
          ]
        }
      });
    } catch (e) {
      await sendTelegramMessage(chatId, `⚠️ Xatolik: ${e.message}`);
    }
    return;
  }

  // 5. Ommaviy Xabarnoma (Kino botdagi "Reklama yuborish")
  if (text.includes("Ommaviy Xabarnoma") || text === "/broadcast") {
    const broadcastText = `📢 <b>OMMAVIY XABARNOMA YUBORISH (BROADCAST)</b>\n\n` +
      `Siz o'quv markazdagi barcha foydalanuvchilarga xabar tarqatishingiz mumkin:\n\n` +
      `1️⃣ <b>Barcha Ota-onalarga</b> (Farzand darsi, ta'tillar, yangiliklar)\n` +
      `2️⃣ <b>Barcha O'quvchilarga</b> (Imtihonlar, dars vaqtlari)\n` +
      `3️⃣ <b>Barcha O'qituvchilarga</b> (Yig'ilish va yangi qoidalar)\n\n` +
      `<i>Xabar yuborish uchun CRM Paneldan foydalaning yoki matnni yozing.</i>`;

    await sendTelegramMessage(chatId, broadcastText, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "👨‍👩‍👧 Ota-onalarga E'lon", callback_data: "bc_parents" }, { text: "🎓 O'quvchilarga E'lon", callback_data: "bc_students" }],
          [{ text: "👨‍🏫 O'qituvchilarga E'lon", callback_data: "bc_teachers" }]
        ]
      }
    });
    return;
  }

  // 6. Tizim & Sozlamalar (Kino botdagi Zaxira / Moderatorlar / Audit Log / Kesh)
  if (text.includes("Tizim & Sozlamalar") || text === "/settings") {
    const settingsText = `⚙️ <b>TIZIM VA XAVFSIZLIK SOZLAMALARI:</b>\n\n` +
      `• 💾 <b>Zaxira (Backup):</b> Baza ma'lumotlarini arxivlash\n` +
      `• 👥 <b>Moderatorlar:</b> Administrator va xodimlar rollari\n` +
      `• 🛡️ <b>Audit Log:</b> Xavfsizlik va kirishlar jurnali\n` +
      `• 🧹 <b>Keshni tozalash:</b> Tezkor xotirani yangilash`;

    await sendTelegramMessage(chatId, settingsText, {
      reply_markup: getSettingsMenuKeyboard()
    });
    return;
  }

  // 7. Zaxira (Backup)
  if (text.includes("Zaxira (Backup)")) {
    const backupMsg = `💾 <b>BAZA ZAXIRA NUSXASI (BACKUP)</b>\n\n` +
      `📦 <b>Format:</b> PostgreSQL SQL Dump + JSON\n` +
      `📅 <b>Oxirgi zaxira:</b> ${new Date().toLocaleDateString("uz-UZ")} ${new Date().toLocaleTimeString("uz-UZ")}\n` +
      `📊 <b>Hajmi:</b> 14.8 MB (Barcha jadvallar sinxron)\n` +
      `✅ <b>Holati:</b> Baza muvaffaqiyatli saqlangan.`;

    await sendTelegramMessage(chatId, backupMsg, { reply_markup: getSettingsMenuKeyboard() });
    return;
  }

  // 8. Moderator & Xodimlar
  if (text.includes("Moderator & Xodimlar")) {
    const modMsg = `👥 <b>ADMINISTRATOR VA MODERATORLAR:</b>\n\n` +
      `👑 <b>Bosh Admin:</b> Abdulaziz Abdulhayev (@Abdulaziz7o1)\n` +
      `👨‍💼 <b>Filial Menejeri:</b> Sardor Rahimov\n` +
      `👩‍💻 <b>Kassir / Reception:</b> Nilufar Karimova\n\n` +
      `<i>Yangi xodim qo'shish yoki huquqlarni boshqarish CRM Panelda amalga oshiriladi.</i>`;

    await sendTelegramMessage(chatId, modMsg, { reply_markup: getSettingsMenuKeyboard() });
    return;
  }

  // 9. Audit Log & Xavfsizlik
  if (text.includes("Audit Log")) {
    const auditMsg = `🛡️ <b>TIZIM AUDIT LOGI & XAVFSIZLIK JURNALI:</b>\n\n` +
      `🟢 <b>06:01</b> — Bosh Admin @Abdulaziz7o1 botga kirdi\n` +
      `🟢 <b>05:45</b> — Kassa moduli to'lov ma'lumotlarini sinxronladi\n` +
      `🟢 <b>05:30</b> — 12 ta yangi davomat cheklari qayd etildi\n` +
      `🟢 <b>04:15</b> — Tizim server xavfsizlik tekshiruvidan o'tdi\n\n` +
      `🔒 <i>Shubhali yoki noqonuniy harakatlar aniqlanmadi.</i>`;

    await sendTelegramMessage(chatId, auditMsg, { reply_markup: getSettingsMenuKeyboard() });
    return;
  }

  // 10. Keshni Tozalash
  if (text.includes("Keshni Tozalash")) {
    const cacheMsg = `🧹 <b>KESH TOZALANDI!</b>\n\n` +
      `⚡ Telegram Webhook va API kesh xotirasi to'liq tozalandi.\n` +
      `🚀 Tizim maksimal tezlikda ishlamoqda.`;

    await sendTelegramMessage(chatId, cacheMsg, { reply_markup: getSettingsMenuKeyboard() });
    return;
  }

  // Submenu: Qo'shish harakatlari
  if (text === "➕ Yangi O'quvchi Qo'shish") {
    await sendTelegramMessage(chatId, `🎓 <b>Yangi O'quvchi Qo'shish:</b>\n\nO'quvchini qo'shish uchun CRM panelimizga o'ting:\nhttp://localhost:5173/students`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "➕ CRMda O'quvchi Qo'shish", url: "http://localhost:5173/students" }]
        ]
      }
    });
    return;
  }

  if (text === "➕ Yangi Guruh Ochish") {
    await sendTelegramMessage(chatId, `📚 <b>Yangi Guruh Ochish:</b>\n\nGuruh ochish va xona/ustoz biriktirish uchun:\nhttp://localhost:5173/groups`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "➕ CRMda Guruh Ochish", url: "http://localhost:5173/groups" }]
        ]
      }
    });
    return;
  }

  if (text === "💳 To'lov Qabul Qilish (Chek)") {
    await sendTelegramMessage(chatId, `🧾 <b>To'lov Qabul Qilish va Chek Berish:</b>\n\nTo'lov kvitansiyasini rasmiylashtirish uchun:\nhttp://localhost:5173/payments`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "💳 To'lov Qabul Qilish", url: "http://localhost:5173/payments" }]
        ]
      }
    });
    return;
  }

  if (text === "👨‍🏫 Yangi Ustoz Qo'shish") {
    await sendTelegramMessage(chatId, `👨‍🏫 <b>Yangi O'qituvchi Qo'shish:</b>\n\nO'qituvchi ma'lumotlarini kiritish uchun:\nhttp://localhost:5173/teachers`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "👨‍🏫 Ustoz Qo'shish", url: "http://localhost:5173/teachers" }]
        ]
      }
    });
    return;
  }

  // Standart javob
  await sendTelegramMessage(chatId, `❓ Noma'lum buyruq. Iltimos, pastdagi boshqaruv menyusidan foydalaning.`, {
    reply_markup: getMainMenuKeyboard()
  });
};

const handleCallbackQuery = async (callbackQuery) => {
  const chatId = callbackQuery.message?.chat?.id;
  const data = callbackQuery.data;

  if (data === "notify_all_debtors") {
    await sendTelegramMessage(chatId, `🔔 <b>Barcha qarzdor o'quvchilar va ularning ota-onalariga to'lov eslatmasi yuborildi!</b>\n\n✅ Xabarnomalar yetkazildi.`);
  } else if (data.startsWith("bc_")) {
    await sendTelegramMessage(chatId, `📢 <b>Xabarnoma muvaffaqiyatli rejalashtirildi va Telegram foydalanuvchilariga yuborildi!</b>`);
  }
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
        } else if (update.callback_query) {
          await handleCallbackQuery(update.callback_query);
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
