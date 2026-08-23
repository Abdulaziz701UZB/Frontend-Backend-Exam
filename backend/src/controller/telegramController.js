import {
  getBotConfig,
  updateBotConfig,
  getBotLogs,
  getConnectedUsers,
  sendTelegramRawMessage,
  broadcastMessage,
  handleIncomingTelegramUpdate,
  notifyAttendanceChange,
  notifyPaymentReceived,
  notifyNewLeadReceived,
} from "../services/telegramBotService.js";

export const getTelegramBotStatus = async (req, res) => {
  try {
    const config = getBotConfig();
    const logs = getBotLogs();
    const users = getConnectedUsers();
    res.status(200).json({ config, logs, users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateTelegramConfig = async (req, res) => {
  try {
    const updated = updateBotConfig(req.body);
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const sendTelegramBroadcast = async (req, res) => {
  try {
    const { message, targetRole } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Xabar matni kiritilishi shart" });
    }
    const result = await broadcastMessage(message, targetRole || "all");
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const sendTelegramTestMessage = async (req, res) => {
  try {
    const { type, customText, studentName, amount } = req.body;

    if (type === "ATTENDANCE") {
      await notifyAttendanceChange(studentName || "Abdulaziz Abdulhayev", "Present", "F-12 Guruh", "2026-08-23");
    } else if (type === "PAYMENT") {
      await notifyPaymentReceived(studentName || "Abdulaziz Abdulhayev", amount || 850000, "Avgust 2026", "Card (Click)");
    } else if (type === "LEAD") {
      await notifyNewLeadReceived("Jasurbek Rustamov", "+998 90 599 06 00", "Frontend ReactJS");
    } else {
      await broadcastMessage(customText || "Bu EduControl Telegram Botidan test xabarnomasi!", "all");
    }

    res.status(200).json({ message: "Test xabarnomasi muvaffaqiyatli yuborildi", type });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const handleTelegramWebhook = async (req, res) => {
  try {
    const result = await handleIncomingTelegramUpdate(req.body);
    res.status(200).json({ ok: true, result });
  } catch (err) {
    res.status(200).json({ ok: false, error: err.message });
  }
};
