import express from "express";
import * as groupController from "../controller/groupController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Groups
 *   description: Guruhlar va dars jadvali boshqaruvi
 */

/**
 * @swagger
 * /groups:
 *   post:
 *     tags: [Groups]
 *     summary: Yangi guruh yaratish (Jadval to'qnashuvi tekshiruvi bilan)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - room
 *               - schedule_days
 *               - schedule_time
 *               - monthly_fee
 *             properties:
 *               name:
 *                 type: string
 *                 example: "React-404"
 *               course_id:
 *                 type: integer
 *                 example: 1
 *               course_name:
 *                 type: string
 *                 example: "Frontend Dasturlash"
 *               teacher_id:
 *                 type: integer
 *                 example: 1
 *               teacher_name:
 *                 type: string
 *                 example: "Sardor Rustamov"
 *               room:
 *                 type: string
 *                 example: "Xona 101"
 *               schedule_days:
 *                 type: string
 *                 example: "Dush / Chor / Juma"
 *               schedule_time:
 *                 type: string
 *                 example: "14:00 - 16:00"
 *               monthly_fee:
 *                 type: number
 *                 example: 650000
 *               status:
 *                 type: string
 *                 example: "Active"
 *     responses:
 *       201:
 *         description: Guruh muvaffaqiyatli yaratildi
 *       400:
 *         description: Validatsiya xatosi yoki dars jadvali to'qnashuvi
 *       500:
 *         description: Server xatosi
 */
router.post("/groups", groupController.createGroup);

/**
 * @swagger
 * /groups:
 *   get:
 *     tags: [Groups]
 *     summary: Barcha guruhlar ro'yxatini olish (Kurs va O'qituvchi ma'lumotlari bilan)
 *     responses:
 *       200:
 *         description: Guruhlar ro'yxati
 *       500:
 *         description: Server xatosi
 */
router.get("/groups", groupController.getGroups);

/**
 * @swagger
 * /groups/search:
 *   get:
 *     tags: [Groups]
 *     summary: Guruhlarni nomi, xonasi yoki o'qituvchisi bo'yicha qidirish
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
router.get("/groups/search", groupController.searchGroups);

/**
 * @swagger
 * /groups/{id}:
 *   get:
 *     tags: [Groups]
 *     summary: Guruhni ID bo'yicha olish
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Guruh ID (masalan G-101)
 *     responses:
 *       200:
 *         description: Guruh ma'lumotlari
 *       404:
 *         description: Guruh topilmadi
 *       500:
 *         description: Server xatosi
 */
router.get("/groups/:id", groupController.getGroupById);

/**
 * @swagger
 * /groups/{id}:
 *   put:
 *     tags: [Groups]
 *     summary: Guruh ma'lumotlarini yangilash
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Guruh ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               room:
 *                 type: string
 *               schedule_days:
 *                 type: string
 *               schedule_time:
 *                 type: string
 *               monthly_fee:
 *                 type: number
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Guruh yangilandi
 *       404:
 *         description: Guruh topilmadi
 *       500:
 *         description: Server xatosi
 */
router.put("/groups/:id", groupController.updateGroup);

/**
 * @swagger
 * /groups/{id}:
 *   delete:
 *     tags: [Groups]
 *     summary: Guruhni o'chirish
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Guruh ID
 *     responses:
 *       200:
 *         description: Guruh o'chirildi
 *       404:
 *         description: Guruh topilmadi
 *       500:
 *         description: Server xatosi
 */
router.delete("/groups/:id", groupController.deleteGroup);

export default router;
