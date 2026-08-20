import express from "express";
import * as examController from "../controller/examController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Exams
 *   description: Imtihonlar, testlar va natijalar boshqaruvi
 */

/**
 * @swagger
 * /exams:
 *   post:
 *     tags: [Exams]
 *     summary: Yangi imtihon e'lon qilish
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - group_name
 *               - title
 *               - date
 *             properties:
 *               group_name:
 *                 type: string
 *                 example: "React-404"
 *               title:
 *                 type: string
 *                 example: "Midterm Exam - JavaScript Core"
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2026-08-25"
 *               total_score:
 *                 type: integer
 *                 example: 100
 *               max_passing_score:
 *                 type: integer
 *                 example: 70
 *               status:
 *                 type: string
 *                 example: "Upcoming"
 *     responses:
 *       201:
 *         description: Imtihon yaratildi
 *       400:
 *         description: Validatsiya xatosi
 *       500:
 *         description: Server xatosi
 */
router.post("/exams", examController.createExam);

/**
 * @swagger
 * /exams:
 *   get:
 *     tags: [Exams]
 *     summary: Barcha imtihonlar ro'yxatini olish
 *     responses:
 *       200:
 *         description: Imtihonlar ro'yxati
 *       500:
 *         description: Server xatosi
 */
router.get("/exams", examController.getExams);

/**
 * @swagger
 * /exams/{id}:
 *   get:
 *     tags: [Exams]
 *     summary: Imtihonni ID bo'yicha olish
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Imtihon ID (masalan EX-101)
 *     responses:
 *       200:
 *         description: Imtihon ma'lumotlari
 *       404:
 *         description: Imtihon topilmadi
 *       500:
 *         description: Server xatosi
 */
router.get("/exams/:id", examController.getExamById);

/**
 * @swagger
 * /exams/{id}:
 *   put:
 *     tags: [Exams]
 *     summary: Imtihon ma'lumotlarini yangilash
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Imtihon ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               date:
 *                 type: string
 *               total_score:
 *                 type: integer
 *               max_passing_score:
 *                 type: integer
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Imtihon yangilandi
 *       404:
 *         description: Imtihon topilmadi
 *       500:
 *         description: Server xatosi
 */
router.put("/exams/:id", examController.updateExam);

/**
 * @swagger
 * /exams/{id}:
 *   delete:
 *     tags: [Exams]
 *     summary: Imtihonni o'chirish
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Imtihon ID
 *     responses:
 *       200:
 *         description: Imtihon o'chirildi
 *       404:
 *         description: Imtihon topilmadi
 *       500:
 *         description: Server xatosi
 */
router.delete("/exams/:id", examController.deleteExam);

export default router;
