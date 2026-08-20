import express from "express";
import * as paymentController from "../controller/paymentController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: To'lovlar, kvitansiyalar va qarzdorliklar boshqaruvi
 */

/**
 * @swagger
 * /payments:
 *   post:
 *     tags: [Payments]
 *     summary: Yangi to'lov qabul qilish (Kvitansiya rasmiylashtirish)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - student_name
 *               - amount
 *               - month
 *               - payment_method
 *             properties:
 *               student_id:
 *                 type: integer
 *                 example: 1
 *               student_name:
 *                 type: string
 *                 example: "Abdulaziz Abdulhayev"
 *               group_name:
 *                 type: string
 *                 example: "React-404"
 *               amount:
 *                 type: number
 *                 example: 650000
 *               month:
 *                 type: string
 *                 example: "Avgust 2026"
 *               payment_method:
 *                 type: string
 *                 example: "Uzum / Payme (Online)"
 *               recorded_by:
 *                 type: string
 *                 example: "Admin"
 *     responses:
 *       201:
 *         description: To'lov qabul qilindi
 *       400:
 *         description: Validatsiya xatosi
 *       500:
 *         description: Server xatosi
 */
router.post("/payments", paymentController.createPayment);

/**
 * @swagger
 * /payments:
 *   get:
 *     tags: [Payments]
 *     summary: Barcha to'lovlar tarixini olish
 *     responses:
 *       200:
 *         description: To'lovlar ro'yxati
 *       500:
 *         description: Server xatosi
 */
router.get("/payments", paymentController.getPayments);

/**
 * @swagger
 * /payments/search:
 *   get:
 *     tags: [Payments]
 *     summary: To'lovlarni talaba ismi, oyi yoki to'lov usuli bo'yicha qidirish
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Qidiruv so'zi
 *     responses:
 *       200:
 *         description: Qidiruv natijalari
 *       500:
 *         description: Server xatosi
 */
router.get("/payments/search", paymentController.searchPayments);

/**
 * @swagger
 * /payments/{id}:
 *   get:
 *     tags: [Payments]
 *     summary: To'lovni kvitansiya ID bo'yicha olish
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: To'lov ID (masalan PAY-701)
 *     responses:
 *       200:
 *         description: To'lov ma'lumotlari
 *       404:
 *         description: To'lov topilmadi
 *       500:
 *         description: Server xatosi
 */
router.get("/payments/:id", paymentController.getPaymentById);

/**
 * @swagger
 * /payments/{id}:
 *   put:
 *     tags: [Payments]
 *     summary: To'lov kvitansiyasini tahrirlash
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: To'lov ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               month:
 *                 type: string
 *               payment_method:
 *                 type: string
 *     responses:
 *       200:
 *         description: To'lov yangilandi
 *       404:
 *         description: To'lov topilmadi
 *       500:
 *         description: Server xatosi
 */
router.put("/payments/:id", paymentController.updatePayment);

/**
 * @swagger
 * /payments/{id}:
 *   delete:
 *     tags: [Payments]
 *     summary: To'lov kvitansiyasini o'chirish
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: To'lov ID
 *     responses:
 *       200:
 *         description: To'lov o'chirildi
 *       404:
 *         description: To'lov topilmadi
 *       500:
 *         description: Server xatosi
 */
router.delete("/payments/:id", paymentController.deletePayment);

export default router;
