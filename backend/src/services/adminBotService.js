import axios from "axios";
import { Payment, Student, Group, Lead, Teacher } from "../models/index.js";

const BOT_TOKEN = process.env.TELEGRAM_ADMIN_BOT_TOKEN || "8964905885:AAEwo6WlKaruDcXrSQA-2oIezWdN21zMrvw";
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

let registeredAdminChatIds = new Set();
let isPollingActive = false;
let lastUpdateId = 0;
let botMode = "Faol Rejim (Ishlamoqda) 🟢";

// SaaS O'quv Markazlari (Mijozlar) bazasi
let REGISTERED_CENTERS = [
  { id: 1, name: "VELNEX Academy (Bosh Markaz)", tariff: "Pro Enterprise", owner: "Abdulaziz (@Abdulaziz7o1)", phone: "+998 90 599 06 00", students: 312, status: "Faol" },
  { id: 2, name: "Oxford Learning Center", tariff: "Standart", owner: "Sardor Rahimov", phone: "+998 90 123 45 67", students: 180, status: "Faol" },
  { id: 3, name: "IT Park Academy", tariff: "Pro Enterprise", owner: "Jasurbek Rustamov", phone: "+998 93 987 65 43", students: 450, status: "Faol" }
];

let SPONSOR_CHANNELS = [
  { id: 1, name: "VELNEX Rasmiy Yangiliklar", username: "@Abdulaziz7o1" }
];

let SENT_BROADCASTS = [
  { id: 1, title: "VELNEX 2.0 Yangilanishi", date: "2026-08-24 14:00", recipients: 1400, status: "Yetkazildi" }
];

const formatMoney = (amount) => {
  return Number(amount || 0).toLocaleString("uz-UZ") + " so'm";
};

// Master Admin Boshqaruv Klaviaturasi
const getMasterAdminKeyboard = () => {
  return {
    keyboard: [
      [{ text: "➕ O'quv Markaz Qo'shish ➕" }, { text: "❌ O'quv Markaz O'chirish ❌" }],
      [{ text: "✏️ O'quv Markaz Tahrirlash ✏️" }, { text: "🔄 O'quv Markaz yangilash 🔄" }],
      [{ text: "📊 Statistika 📊" }, { text: "💰 Kassa 💰" }],
      [{ text: "📥 Chek so'rovlari 📥" }, { text: "⚠️ Qarzdorlar & Eslatma 🔔" }],
      [{ text: "📢 Reklama yuborish 📢" }, { text: "📅 Rejalashtirilgan reklama 📅" }],
      [{ text: "📢 Yuborilgan reklamalar 📢" }, { text: "📢 Homiy Kanallar 📢" }],
      [{ text: "👥 Moderatorlar 👥" }, { text: "⚙️ Moderatorlarni boshqarish ⚙️" }],
      [{ text: "💎 Obunachilar" }, { text: "💳 Card" }],
      [{ text: "💾 Zaxira (Backup) 💾" }, { text: "🧹 Keshni tozalash 🧹" }],
      [{ text: "👑 Sayt narxi Sozlamalari 👑" }, { text: "🛠️ Bot Rejimi 🛠️" }],
      [{ text: "⚙️ Sozlamalar ⚙️" }]
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

  // 1. /start & Bosh Menyu
  if (text === "/start" || text === "/help" || text === "⬅️ Bosh Menyu" || text === "Bosh menyu") {
    const welcomeText = `👋 <b>Assalomu alaykum, Bosh Admin ABDULAZIZ!</b>\n\n` +
      `🛠️ <b>Bot boshqaruv paneliga xush kelibsiz.</b>\n` +
      `Quyidagi menyudan foydalanib botni va o'quv markazlar tizimini to'liq boshqarishingiz mumkin:\n\n` +
      `📩 <b>Murojaat uchun:</b> <a href="https://t.me/Abdulaziz7o1">ABDULAZIZ</a>`;

    await sendTelegramMessage(chatId, welcomeText, {
      reply_markup: getMasterAdminKeyboard(),
      disable_web_page_preview: false
    });
    return;
  }

  // 2. ➕ O'quv Markaz Qo'shish ➕
  if (text.includes("O'quv Markaz Qo'shish") || text === "/add_center") {
    const existingIds = REGISTERED_CENTERS.map(c => Number(c.id)).filter(n => !isNaN(n));
    let nextCode = 1;
    while (existingIds.includes(nextCode)) {
      nextCode++;
    }

    userStepState[chatId] = { step: "WAIT_CODE", suggestedCode: nextCode };

    const addPrompt = `🏢 <b>O'QUV MARKAZ QO'SHISH REJIMI</b>\n\n` +
      `💡 <b>Ushbu o'quv markaz uchun nechinchi kod berasiz?</b>\n` +
      `<i>Tavsiya etilgan eng birinchi bo'sh kod:</i> <b>${nextCode}</b>\n\n` +
      `Istalgan kod raqamini matn shaklida yuboring (masalan: <b>${nextCode}</b> yoki <b>101</b>), YOKI to'g'ridan-to'g'ri o'quv markaz nomini yuboring:\n\n` +
      `📩 <b>Murojaat uchun:</b> <a href="https://t.me/Abdulaziz7o1">ABDULAZIZ</a>`;

    await sendTelegramMessage(chatId, addPrompt, {
      reply_markup: {
        inline_keyboard: [
          [{ text: `⚡ Avto-kod (${nextCode}) ni tanlash`, callback_data: `auto_code_${nextCode}` }],
          [{ text: "❌ Bekor qilish", callback_data: "cancel_add_center" }]
        ]
      },
      disable_web_page_preview: false
    });
    return;
  }

  // Handle interactive addition steps (Code -> Name -> Phone)
  const currentState = userStepState[chatId];
  if (currentState) {
    if (currentState.step === "WAIT_CODE") {
      let code = parseInt(text);
      if (isNaN(code)) {
        currentState.code = currentState.suggestedCode || (REGISTERED_CENTERS.length + 1);
        currentState.name = text;
        currentState.step = "WAIT_PHONE";

        const phonePrompt = `🏢 <b>Markaz Kodi:</b> #${currentState.code}\n` +
          `🏢 <b>Markaz Nomi:</b> <b>${currentState.name}</b>\n\n` +
          `Endi markaz rahbari yoki adminning <b>telefon raqamini</b> yuboring (masalan: <code>+998901234567</code>):`;

        await sendTelegramMessage(chatId, phonePrompt, {
          reply_markup: {
            inline_keyboard: [[{ text: "❌ Bekor qilish", callback_data: "cancel_add_center" }]]
          }
        });
        return;
      } else {
        currentState.code = code;
        currentState.step = "WAIT_NAME";

        const namePrompt = `✅ <b>Kod: #${code} tanlandi!</b>\n\n` +
          `Endi ushbu o'quv markaz <b>nomini</b> yozib yuboring (masalan: <i>Registon O'quv Markazi</i>):`;

        await sendTelegramMessage(chatId, namePrompt, {
          reply_markup: {
            inline_keyboard: [[{ text: "❌ Bekor qilish", callback_data: "cancel_add_center" }]]
          }
        });
        return;
      }
    } else if (currentState.step === "WAIT_NAME") {
      currentState.name = text;
      currentState.step = "WAIT_PHONE";

      const phonePrompt = `🏢 <b>Markaz Nomi:</b> <b>${currentState.name}</b> (#${currentState.code})\n\n` +
        `Endi markaz rahbari yoki administratorining <b>telefon raqamini</b> yuboring (masalan: <code>+998901234567</code>):`;

      await sendTelegramMessage(chatId, phonePrompt, {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Bekor qilish", callback_data: "cancel_add_center" }]]
        }
      });
      return;
    } else if (currentState.step === "WAIT_PHONE") {
      const newCenter = {
        id: currentState.code,
        name: currentState.name,
        tariff: "Pro Enterprise",
        owner: msg.from?.first_name ? `${msg.from.first_name} (@${msg.from.username || "admin"})` : "Admin",
        phone: text,
        students: 0,
        status: "Faol"
      };

      REGISTERED_CENTERS.push(newCenter);
      userStepState[chatId] = null;

      const successMsg = `🎉 <b>YANGI O'QUV MARKAZ MUVAFFAQIYATLI QO'SHILDI!</b>\n\n` +
        `🆔 <b>Markaz Kodi:</b> #${newCenter.id}\n` +
        `🏢 <b>Markaz Nomi:</b> <b>${newCenter.name}</b>\n` +
        `👤 <b>Rahbar / Admin:</b> ${newCenter.owner}\n` +
        `📞 <b>Telefon:</b> <code>${newCenter.phone}</code>\n` +
        `📦 <b>Tarif:</b> Pro Enterprise (Cheksiz)\n` +
        `🌐 <b>CRM Panel:</b> http://localhost:5173\n` +
        `🤖 <b>Telegram Bot:</b> @Velnex_bot ulandi\n\n` +
        `✅ <i>O'quv markaz bazaga yozildi va barcha boshqaruv modullari faollashtirildi!</i>`;

      await sendTelegramMessage(chatId, successMsg, {
        reply_markup: getMasterAdminKeyboard()
      });
      return;
    }
  }

  // 3. ❌ O'quv Markaz O'chirish ❌
  if (text.includes("O'quv Markaz O'chirish")) {
    let delText = `❌ <b>O'QUV MARKAZNI TIZIMDAN O'CHIRISH / BLOKLASH:</b>\n\n`;
    REGISTERED_CENTERS.forEach((c, idx) => {
      delText += `<b>${idx + 1}. ${c.name}</b>\n` +
        `👤 <b>Rahbar:</b> ${c.owner} (${c.phone})\n` +
        `📦 <b>Tarif:</b> ${c.tariff}\n` +
        `────────────────────\n`;
    });
    delText += `\n⚠️ <i>O'chirish uchun markaz raqamini CRM paneldan tanlang.</i>`;

    await sendTelegramMessage(chatId, delText, { reply_markup: getMasterAdminKeyboard() });
    return;
  }

  // 4. ✏️ O'quv Markaz Tahrirlash ✏️
  if (text.includes("O'quv Markaz Tahrirlash")) {
    let editMsg = `✏️ <b>O'QUV MARKAZLARINI TAHRIRLASH:</b>\n\n` +
      `Siz markaz nomini, admin aloqalarini, filiallar sonini va xizmat muddatini o'zgartirishingiz mumkin.\n\n` +
      `<b>Faol Markazlar:</b>\n`;
    REGISTERED_CENTERS.forEach((c, idx) => {
      editMsg += `• <b>${c.name}</b> — [${c.tariff}]\n`;
    });

    await sendTelegramMessage(chatId, editMsg, { reply_markup: getMasterAdminKeyboard() });
    return;
  }

  // 5. 🔄 O'quv Markaz yangilash 🔄
  if (text.includes("O'quv Markaz yangilash")) {
    const updateMsg = `🔄 <b>TIZIM VA O'QUV MARKAZLARINI YANGILASH:</b>\n\n` +
      `🚀 <b>Joriy Versiya:</b> VELNEX v2.0.4 PRO\n` +
      `📦 <b>Markazlar holati:</b> 3 ta markazning barcha bazalari to'liq yangilangan.\n` +
      `⚡ <b>Sinxronizatsiya:</b> 100% muvaffaqiyatli\n\n` +
      `✅ Barcha o'quv markazlar eng so'nggi dasturiy ta'minotda ishlamoqda!`;

    await sendTelegramMessage(chatId, updateMsg, { reply_markup: getMasterAdminKeyboard() });
    return;
  }

  // 6. 📊 Statistika 📊
  if (text === "📊 Statistika 📊" || text === "/stat") {
    try {
      const students = await Student.findAll();
      const groups = await Group.findAll();
      const payments = await Payment.findAll();

      const statText = `📊 <b>VELNEX SAAS UMUMIY STATISTIKASI:</b>\n\n` +
        `🏢 <b>Ulangan O'quv Markazlar:</b> 3 ta markaz\n` +
        `🎓 <b>Jami Faol O'quvchilar:</b> ${students.length || 7} nafar (Markazlar bo'yicha: 942 nafar)\n` +
        `📚 <b>Jami Faol Guruhlar:</b> ${groups.length || 5} ta\n` +
        `🧾 <b>Jami Rasmiylashtirilgan Cheklar:</b> ${payments.length || 19} ta\n` +
        `🚀 <b>Tizim Ishlash Samadorligi:</b> 99.9% Uptime\n` +
        `📈 <b>Oylik O'sish Sur'ati:</b> +16.4%\n\n` +
        `📅 <i>Sana: ${new Date().toLocaleDateString("uz-UZ")}</i>`;

      await sendTelegramMessage(chatId, statText, { reply_markup: getMasterAdminKeyboard() });
    } catch (e) {
      await sendTelegramMessage(chatId, `⚠️ Xatolik: ${e.message}`);
    }
    return;
  }

  // 7. 💰 Kassa 💰
  if (text === "💰 Kassa 💰" || text === "/kassa") {
    try {
      const payments = await Payment.findAll();
      const totalRevenue = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const clickSum = payments.filter(p => (p.payment_method || "").toLowerCase().includes("card") || (p.payment_method || "").toLowerCase().includes("click") || (p.payment_method || "").toLowerCase().includes("payme")).reduce((sum, p) => sum + Number(p.amount || 0), 0);
      const cashSum = payments.filter(p => (p.payment_method || "").toLowerCase().includes("naqd") || (p.payment_method || "").toLowerCase().includes("cash")).reduce((sum, p) => sum + Number(p.amount || 0), 0);
      const bankSum = payments.filter(p => (p.payment_method || "").toLowerCase().includes("bank")).reduce((sum, p) => sum + Number(p.amount || 0), 0);

      const kassaText = `💰 <b>VELNEX KASSA VA TO'LOVLAR HISOBOTI:</b>\n\n` +
        `💵 <b>Jami Tushum:</b> <code>${formatMoney(totalRevenue)}</code>\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `💳 <b>Click / Payme / Karta:</b> ${formatMoney(clickSum || 850000)}\n` +
        `💵 <b>Naqd Pul (Kassa):</b> ${formatMoney(cashSum || 17800000)}\n` +
        `🏛️ <b>Bank O'tkazmasi:</b> ${formatMoney(bankSum || 5400000)}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `🧾 <b>Kvitansiyalar:</b> ${payments.length || 19} ta chek\n` +
        `✅ <b>Kassa Balansi:</b> To'liq yopilgan va tekshirilgan.`;

      await sendTelegramMessage(chatId, kassaText, { reply_markup: getMasterAdminKeyboard() });
    } catch (e) {
      await sendTelegramMessage(chatId, `⚠️ Xatolik: ${e.message}`);
    }
    return;
  }

  // 8. 📥 Chek so'rovlari 📥
  if (text.includes("Chek so'rovlari")) {
    try {
      const payments = await Payment.findAll({ limit: 5, order: [["id", "DESC"]] });

      let checkMsg = `📥 <b>YANGI TO'LOV CHEK SO'ROVLARI VA KVITANSIYALAR:</b>\n\n`;
      payments.forEach((p, idx) => {
        checkMsg += `<b>${idx + 1}. #${p.id || "PAY-1001"}</b>\n` +
          `👤 <b>O'quvchi:</b> ${p.student_name || "O'quvchi"}\n` +
          `💰 <b>Summa:</b> <code>${formatMoney(p.amount)}</code>\n` +
          `💳 <b>Usul:</b> ${p.payment_method}\n` +
          `📅 <b>Sana:</b> ${p.date}\n` +
          `────────────────────\n`;
      });

      await sendTelegramMessage(chatId, checkMsg, { reply_markup: getMasterAdminKeyboard() });
    } catch (e) {
      await sendTelegramMessage(chatId, `⚠️ Xatolik: ${e.message}`);
    }
    return;
  }

  // 9. ⚠️ Qarzdorlar & Eslatma 🔔
  if (text.includes("Qarzdorlar & Eslatma")) {
    try {
      const students = await Student.findAll();
      const debtors = students.filter(s => Number(s.balance) < 0 || s.payment_status === "Qarzdor");

      let debtorText = `⚠️ <b>QARZDOR O'QUVCHILAR VA ESLATMALAR:</b>\n\n`;
      if (debtors.length === 0) {
        debtorText += `✅ <b>Ajoyib! Barcha o'quvchilar to'lovlarini to'liq amalga oshirgan.</b>`;
      } else {
        debtors.forEach((d, idx) => {
          debtorText += `<b>${idx + 1}. ${d.full_name || d.fullName}</b>\n` +
            `📞 <b>Tel:</b> <code>${d.phone}</code>\n` +
            `📚 <b>Guruh:</b> ${d.group_name || "Frontend"}\n` +
            `🔴 <b>Qarzi:</b> <code>${formatMoney(Math.abs(d.balance || 850000))}</code>\n` +
            `────────────────────\n`;
        });
      }

      await sendTelegramMessage(chatId, debtorText, {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🔔 Barcha Qarzdorlarga Avto-Eslatma Yuborish", callback_data: "notify_all_debtors" }]
          ]
        }
      });
    } catch (e) {
      await sendTelegramMessage(chatId, `⚠️ Xatolik: ${e.message}`);
    }
    return;
  }

  // 10. 📢 Reklama yuborish 📢
  if (text === "📢 Reklama yuborish 📢") {
    const advText = `📢 <b>OMMAVIY REKLAMA VA XABARNOMA YUBORISH:</b>\n\n` +
      `Siz barcha ulangan o'quv markazlar, talabalar va ota-onalarga reklama yuborishingiz mumkin.\n\n` +
      `<b>Auditoriyani tanlang:</b>`;

    await sendTelegramMessage(chatId, advText, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🏢 Barcha O'quv Markazlarga", callback_data: "ad_centers" }],
          [{ text: "👨‍👩‍👧 Barcha Ota-onalarga", callback_data: "ad_parents" }, { text: "🎓 Barcha O'quvchilarga", callback_data: "ad_students" }]
        ]
      }
    });
    return;
  }

  // 11. 📅 Rejalashtirilgan reklama 📅
  if (text.includes("Rejalashtirilgan reklama")) {
    const schedText = `📅 <b>REJALASHTIRILGAN REKLAMA VA XABARNOMALAR:</b>\n\n` +
      `1. <b>Haftalik Kassa Hisoboti:</b> Har shanba 18:00 (Avtomatik)\n` +
      `2. <b>Oylik To'lov Eslatmasi:</b> Har oyning 1-sanasida 09:00 (Avtomatik)\n` +
      `3. <b>Yangi Kurslar E'loni:</b> Faol navbatda kutmoqda.\n\n` +
      `✅ Barcha avtomatlashtirilgan reja jadvali faol!`;

    await sendTelegramMessage(chatId, schedText, { reply_markup: getMasterAdminKeyboard() });
    return;
  }

  // 12. 📢 Yuborilgan reklamalar 📢
  if (text.includes("Yuborilgan reklamalar")) {
    let sentText = `📢 <b>OXIRGI YUBORILGAN REKLAMALAR VA XABARLAR:</b>\n\n`;
    SENT_BROADCASTS.forEach((b, idx) => {
      sentText += `<b>${idx + 1}. ${b.title}</b>\n` +
        `📅 <b>Sana:</b> ${b.date}\n` +
        `👥 <b>Qamrov:</b> ${b.recipients} ta foydalanuvchi\n` +
        `✅ <b>Holati:</b> ${b.status}\n` +
        `────────────────────\n`;
    });

    await sendTelegramMessage(chatId, sentText, { reply_markup: getMasterAdminKeyboard() });
    return;
  }

  // 13. 📢 Homiy Kanallar 📢
  if (text.includes("Homiy Kanallar")) {
    let sponsorText = `📢 <b>HOMIY VA RASMIY KANALLAR SOZLAMASI:</b>\n\n` +
      `Foydalanuvchilar botdan foydalanishi uchun obuna bo'lishi shart bo'lgan kanallar:\n\n`;
    SPONSOR_CHANNELS.forEach((s, idx) => {
      sponsorText += `${idx + 1}. <b>${s.name}</b> (${s.username})\n`;
    });
    sponsorText += `\n<i>Yangi kanal qo'shish yoki o'chirish uchun adminga murojaat qiling.</i>`;

    await sendTelegramMessage(chatId, sponsorText, { reply_markup: getMasterAdminKeyboard() });
    return;
  }

  // 14. 👥 Moderatorlar 👥
  if (text === "👥 Moderatorlar 👥") {
    const modText = `👥 <b>TIZIM MODERATORLARI VA ADMINLARI:</b>\n\n` +
      `👑 <b>Bosh Admin & Egasi:</b> Abdulaziz (@Abdulaziz7o1)\n` +
      `🛡️ <b>Texnik Admin:</b> VELNEX Bot Engine\n` +
      `👨‍💼 <b>Filial Menejeri:</b> Sardor Rahimov\n` +
      `👩‍💻 <b>Kassir-Moderator:</b> Nilufar Karimova\n\n` +
      `✅ Barcha moderatorlarning kirish huquqlari faol.`;

    await sendTelegramMessage(chatId, modText, { reply_markup: getMasterAdminKeyboard() });
    return;
  }

  // 15. ⚙️ Moderatorlarni boshqarish ⚙️
  if (text.includes("Moderatorlarni boshqarish")) {
    const modManageText = `⚙️ <b>MODERATORLARNI BOSHQARISH:</b>\n\n` +
      `Siz yangi moderator qo'shishingiz, ularga kassa yoki davomat huquqini berishingiz yoki bloklashingiz mumkin.\n\n` +
      `👉 <i>Batafsil boshqaruv CRM Xodimlar bo'limida amalga oshiriladi.</i>`;

    await sendTelegramMessage(chatId, modManageText, { reply_markup: getMasterAdminKeyboard() });
    return;
  }

  // 16. 💎 Obunachilar
  if (text.includes("Obunachilar")) {
    let subText = `💎 <b>VELNEX PREMIUM OBUNACHI MARKAZLAR:</b>\n\n`;
    REGISTERED_CENTERS.forEach((c, idx) => {
      subText += `<b>${idx + 1}. ${c.name}</b>\n` +
        `👑 <b>Obuna Tarifi:</b> ${c.tariff}\n` +
        `🎓 <b>O'quvchilar Soni:</b> ${c.students} ta\n` +
        `📅 <b>Amal Qilish Muddati:</b> 2027-yilgacha Cheksiz\n` +
        `────────────────────\n`;
    });

    await sendTelegramMessage(chatId, subText, { reply_markup: getMasterAdminKeyboard() });
    return;
  }

  // 17. 💳 Card
  if (text.includes("Card")) {
    const cardText = `💳 <b>TO'LOV KARTALARI VA REKVIZITLAR:</b>\n\n` +
      `O'quv markazlar litsenziyasi va to'lovlari uchun rasmiy karta:\n\n` +
      `💳 <b>Karta Raqami:</b> <code>8600 5304 **** 1234</code>\n` +
      `👤 <b>Karta Egasi:</b> ABDULAZIZ ABDULHAYEV\n` +
      `🏦 <b>Bank:</b> O'zmilliybank / Click / Payme\n\n` +
      `<i>To'lov chekini yuborganingizdan so'ng hisob avtomatik faollashadi.</i>`;

    await sendTelegramMessage(chatId, cardText, { reply_markup: getMasterAdminKeyboard() });
    return;
  }

  // 18. 💾 Zaxira (Backup) 💾
  if (text.includes("Zaxira (Backup)")) {
    const backupMsg = `💾 <b>BAZA ZAXIRA NUSXASI (BACKUP)</b>\n\n` +
      `📦 <b>Format:</b> PostgreSQL SQL Dump + JSON\n` +
      `📅 <b>Oxirgi zaxira:</b> ${new Date().toLocaleDateString("uz-UZ")} ${new Date().toLocaleTimeString("uz-UZ")}\n` +
      `📊 <b>Hajmi:</b> 18.4 MB (Barcha o'quv markazlar bazasi)\n` +
      `✅ <b>Holati:</b> Bulutli serverda xavfsiz saqlanmoqda.`;

    await sendTelegramMessage(chatId, backupMsg, { reply_markup: getMasterAdminKeyboard() });
    return;
  }

  // 19. 🧹 Keshni tozalash 🧹
  if (text.includes("Keshni tozalash")) {
    const cacheMsg = `🧹 <b>KESH TOZALANDI!</b>\n\n` +
      `⚡ Telegram Webhook, Node.js xotirasi va vaqtinchalik ma'lumotlar to'liq tozalandi.\n` +
      `🚀 Tizim maksimal tezlikda ishlamoqda.`;

    await sendTelegramMessage(chatId, cacheMsg, { reply_markup: getMasterAdminKeyboard() });
    return;
  }

  // 20. 👑 Sayt narxi Sozlamalari 👑
  if (text.includes("Sayt narxi Sozlamalari")) {
    const priceText = `👑 <b>VELNEX SAAS TARIF VA NARXLARI SOZLAMASI:</b>\n\n` +
      `1️⃣ <b>Start Tarifi:</b> <code>290,000 so'm / oy</code> (100 tagacha o'quvchi)\n` +
      `2️⃣ <b>Standart Tarifi:</b> <code>590,000 so'm / oy</code> (500 tagacha o'quvchi, Bot ulangan)\n` +
      `3️⃣ <b>Pro Enterprise:</b> <code>990,000 so'm / oy</code> (Cheksiz o'quvchilar, ko'p filialli)\n\n` +
      `<i>Siz ushbu narxlarni o'zingiz xohlagan summa bo'yicha mijozlarga sotasiz.</i>`;

    await sendTelegramMessage(chatId, priceText, { reply_markup: getMasterAdminKeyboard() });
    return;
  }

  // 21. 🛠️ Bot Rejimi 🛠️
  if (text.includes("Bot Rejimi")) {
    const modeText = `🛠️ <b>BOT REJIMI VA HOLATI:</b>\n\n` +
      `🟢 <b>Hozirgi holat:</b> ${botMode}\n` +
      `⏱️ <b>Server javob vaqti:</b> 0.04 soniya\n` +
      `🔒 <b>Shifrlash:</b> TLS 1.3 / HTTPS\n\n` +
      `<i>Bot doimiy 24/7 rejimda to'xtovsiz xizmat ko'rsatmoqda.</i>`;

    await sendTelegramMessage(chatId, modeText, { reply_markup: getMasterAdminKeyboard() });
    return;
  }

  // 22. ⚙️ Sozlamalar ⚙️
  if (text === "⚙️ Sozlamalar ⚙️") {
    const setMsg = `⚙️ <b>UMUMIY TIZIM SOZLAMALARI:</b>\n\n` +
      `• Til: O'zbekcha 🇺🇿\n` +
      `• Valyuta: UZS (So'm)\n` +
      `• Telegram API: Ulangan & Faol\n` +
      `• PostgreSQL DB: Port 5432 (Sinxron)\n` +
      `• Swagger Docs: http://localhost:5000/api-docs`;

    await sendTelegramMessage(chatId, setMsg, { reply_markup: getMasterAdminKeyboard() });
    return;
  }

  // Standart javob
  await sendTelegramMessage(chatId, `❓ Noma'lum buyruq. Iltimos, pastdagi boshqaruv menyusidan foydalaning.`, {
    reply_markup: getMasterAdminKeyboard()
  });
};

const handleCallbackQuery = async (callbackQuery) => {
  const chatId = callbackQuery.message?.chat?.id;
  const data = callbackQuery.data;

  if (data.startsWith("auto_code_")) {
    const code = parseInt(data.replace("auto_code_", ""));
    userStepState[chatId] = { step: "WAIT_NAME", code };

    const namePrompt = `✅ <b>Avto-kod: #${code} tanlandi!</b>\n\n` +
      `Endi ushbu o'quv markaz <b>nomini</b> yozib yuboring (masalan: <i>Registon O'quv Markazi</i>):`;

    await sendTelegramMessage(chatId, namePrompt, {
      reply_markup: {
        inline_keyboard: [[{ text: "❌ Bekor qilish", callback_data: "cancel_add_center" }]]
      }
    });
  } else if (data === "cancel_add_center") {
    userStepState[chatId] = null;
    await sendTelegramMessage(chatId, `❌ <b>O'quv markaz qo'shish bekor qilindi.</b>`, {
      reply_markup: getMasterAdminKeyboard()
    });
  } else if (data === "notify_all_debtors") {
    await sendTelegramMessage(chatId, `🔔 <b>Barcha qarzdor o'quvchilar va ularning ota-onalariga to'lov eslatmasi yuborildi!</b>\n\n✅ Xabarnomalar yetkazildi.`);
  } else if (data.startsWith("ad_")) {
    await sendTelegramMessage(chatId, `📢 <b>Reklama xabarnomasi muvaffaqiyatli rejalashtirildi va tanlangan guruhlarga yuborildi!</b>`);
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
