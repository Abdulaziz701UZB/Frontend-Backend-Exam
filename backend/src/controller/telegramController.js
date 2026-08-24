import {
  getBotsConfig,
  updateBotsConfig,
  getBotLogs,
  getConnectedUsers,
  sendBotRawMessage,
  broadcastToBot,
  notifyAttendanceChange,
  notifyPaymentReceived,
  notifyNewLeadReceived,
} from "../services/telegramBotService.js";

export const getTelegramBotStatus = async (req, res) => {
  try {
    const config = getBotsConfig();
    const logs = getBotLogs();
    const users = getConnectedUsers();
    res.status(200).json({ config, logs, users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateTelegramConfig = async (req, res) => {
  try {
    const updated = updateBotsConfig(req.body);
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const sendTelegramBroadcast = async (req, res) => {
  try {
    const { message, targetBot } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Xabar matni kiritilishi shart" });
    }
    const result = await broadcastToBot(targetBot || "adminBot", message);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const sendTelegramTestMessage = async (req, res) => {
  try {
    const { botKey, type, studentName, amount } = req.body;

    if (type === "ATTENDANCE" || botKey === "parentBot") {
      await notifyAttendanceChange(studentName || "Abdulaziz Abdulhayev", "Present", "F-12 Guruh", "2026-08-23");
    } else if (type === "PAYMENT") {
      await notifyPaymentReceived(studentName || "Abdulaziz Abdulhayev", amount || 850000, "Avgust 2026", "Card (Click)");
    } else if (type === "LEAD" || botKey === "adminBot") {
      await notifyNewLeadReceived("Jasurbek Rustamov", "+998 90 599 06 00", "Frontend ReactJS");
    } else {
      await sendBotRawMessage(botKey || "studentBot", "998939876543", "Test xabarnomasi: EduControl boti tayyor!");
    }

    res.status(200).json({ message: "Test xabari muvaffaqiyatli yuborildi", botKey, type });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const handleTelegramWebhook = async (req, res) => {
  try {
    res.status(200).json({ ok: true, message: "Webhook qabul qilindi" });
  } catch (err) {
    res.status(200).json({ ok: false, error: err.message });
  }
};
