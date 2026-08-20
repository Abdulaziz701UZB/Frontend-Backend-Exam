import express from "express";
import * as homeworkController from "../controller/homeworkController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Homework
 *   description: Uyga vazifalar monitoringi va topshirish holati
 */

/**
 * @swagger
 * /homework:
 *   post:
 *     tags: [Homework]
 *     summary: Yangi uyga vazifa yuklash
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - group_name
 *               - title
 *               - deadline
 *             properties:
 *               group_name:
 *                 type: string
 *                 example: "React-404"
 *               title:
 *                 type: string
 *                 example: "Vazifa #4 - React Router va Context API integratsiyasi"
 *               deadline:
 *                 type: string
 *                 format: date
 *                 example: "2026-08-28"
 *               total_submitted:
 *                 type: integer
 *                 example: 0
 *               status:
 *                 type: string
 *                 example: "Active"
 *     responses:
 *       201:
 *         description: Uyga vazifa yaratildi
 *       400:
 *         description: Validatsiya xatosi
 *       500:
 *         description: Server xatosi
 */
router.post("/homework", homeworkController.createHomework);

/**
 * @swagger
 * /homework:
 *   get:
 *     tags: [Homework]
 *     summary: Barcha uyga vazifalar ro'yxatini olish
 *     responses:
 *       200:
 *         description: Vazifalar ro'yxati
 *       500:
 *         description: Server xatosi
 */
router.get("/homework", homeworkController.getHomework);

/**
 * @swagger
 * /homework/{id}:
 *   get:
 *     tags: [Homework]
 *     summary: Uyga vazifani ID bo'yicha olish
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vazifa ID (masalan HW-101)
 *     responses:
 *       200:
 *         description: Vazifa ma'lumotlari
 *       404:
 *         description: Vazifa topilmadi
 *       500:
 *         description: Server xatosi
 */
router.get("/homework/:id", homeworkController.getHomeworkById);

/**
 * @swagger
 * /homework/{id}:
 *   put:
 *     tags: [Homework]
 *     summary: Uyga vazifa ma'lumotlarini yangilash
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vazifa ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               deadline:
 *                 type: string
 *               total_submitted:
 *                 type: integer
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Vazifa yangilandi
 *       404:
 *         description: Vazifa topilmadi
 *       500:
 *         description: Server xatosi
 */
router.put("/homework/:id", homeworkController.updateHomework);

/**
 * @swagger
 * /homework/{id}:
 *   delete:
 *     tags: [Homework]
 *     summary: Uyga vazifani o'chirish
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vazifa ID
 *     responses:
 *       200:
 *         description: Vazifa o'chirildi
 *       404:
 *         description: Vazifa topilmadi
 *       500:
 *         description: Server xatosi
 */
router.delete("/homework/:id", homeworkController.deleteHomework);

export default router;
