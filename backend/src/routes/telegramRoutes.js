import express from "express";
import {
  getTelegramBotStatus,
  updateTelegramConfig,
  sendTelegramBroadcast,
  sendTelegramTestMessage,
  handleTelegramWebhook,
} from "../controller/telegramController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: TelegramBot
 *   description: Telegram Bot & WebApp Avtomatlashtirilgan Xabarnomalar Boshqaruvi
 */

/**
 * @swagger
 * /api/telegram/status:
 *   get:
 *     summary: Telegram bot holati, ulangan foydalanuvchilar va loglarni olish
 *     tags: [TelegramBot]
 *     responses:
 *       200:
 *         description: Bot konfiguratsiyasi va loglari
 */
router.get("/status", getTelegramBotStatus);

/**
 * @swagger
 * /api/telegram/config:
 *   put:
 *     summary: Bot sozlamalarini yangilash (Token, Webhook, avto-xabarnomalar)
 *     tags: [TelegramBot]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               autoNotifyAttendance:
 *                 type: boolean
 *               autoNotifyPayment:
 *                 type: boolean
 *               autoNotifyLead:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Sozlamalar saqlandi
 */
router.put("/config", updateTelegramConfig);

/**
 * @swagger
 * /api/telegram/broadcast:
 *   post:
 *     summary: Barcha yoki tanlangan rollarga ommaviy xabarnoma yuborish
 *     tags: [TelegramBot]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Ertaga bayram munosabati bilan darslar qoldiriladi!"
 *               targetRole:
 *                 type: string
 *                 enum: [all, student, parent, teacher, admin]
 *                 example: all
 *     responses:
 *       200:
 *         description: Xabarnoma yuborildi
 */
router.post("/broadcast", sendTelegramBroadcast);

/**
 * @swagger
 * /api/telegram/test-notification:
 *   post:
 *     summary: Davomat, to'lov yoki yangi lid bo'yicha test xabarnomasi yuborish
 *     tags: [TelegramBot]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [ATTENDANCE, PAYMENT, LEAD, GENERAL]
 *                 example: ATTENDANCE
 *     responses:
 *       200:
 *         description: Test xabari yuborildi
 */
router.post("/test-notification", sendTelegramTestMessage);

/**
 * @swagger
 * /api/telegram/webhook:
 *   post:
 *     summary: Telegram serverlaridan keladigan webhook yangilanishlarni qabul qilish
 *     tags: [TelegramBot]
 *     responses:
 *       200:
 *         description: Webhook qabul qilindi
 */
router.post("/webhook", handleTelegramWebhook);

export default router;
