import express from "express";
import * as leadController from "../controller/leadController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Leads
 *   description: Lidlar va yangi arizalar voronkasi
 */

/**
 * @swagger
 * /leads:
 *   post:
 *     tags: [Leads]
 *     summary: Yangi lid (ariza) qo'shish
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Olimjon Valiev"
 *               phone:
 *                 type: string
 *                 example: "+998 90 777 88 99"
 *               interested_course:
 *                 type: string
 *                 example: "Frontend Dasturlash"
 *               source:
 *                 type: string
 *                 example: "Instagram"
 *               status:
 *                 type: string
 *                 enum: [Yangi, Bog'lanildi, Sinov darsida, To'lov qildi, Bekor qilindi]
 *                 example: "Yangi"
 *     responses:
 *       201:
 *         description: Lid yaratildi
 *       400:
 *         description: Validatsiya xatosi
 *       500:
 *         description: Server xatosi
 */
router.post("/leads", leadController.createLead);

/**
 * @swagger
 * /leads:
 *   get:
 *     tags: [Leads]
 *     summary: Barcha lidlar ro'yxatini olish
 *     responses:
 *       200:
 *         description: Lidlar ro'yxati
 *       500:
 *         description: Server xatosi
 */
router.get("/leads", leadController.getLeads);

/**
 * @swagger
 * /leads/{id}:
 *   get:
 *     tags: [Leads]
 *     summary: Lidni ID bo'yicha olish
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lid ID (masalan LEAD-101)
 *     responses:
 *       200:
 *         description: Lid ma'lumotlari
 *       404:
 *         description: Lid topilmadi
 *       500:
 *         description: Server xatosi
 */
router.get("/leads/:id", leadController.getLeadById);

/**
 * @swagger
 * /leads/{id}:
 *   put:
 *     tags: [Leads]
 *     summary: Lid ma'lumotlarini yangilash (Holat / Status o'zgartirish)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lid ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               interested_course:
 *                 type: string
 *               source:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Lid yangilandi
 *       404:
 *         description: Lid topilmadi
 *       500:
 *         description: Server xatosi
 */
router.put("/leads/:id", leadController.updateLead);

/**
 * @swagger
 * /leads/{id}:
 *   delete:
 *     tags: [Leads]
 *     summary: Lidni o'chirish
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lid ID
 *     responses:
 *       200:
 *         description: Lid o'chirildi
 *       404:
 *         description: Lid topilmadi
 *       500:
 *         description: Server xatosi
 */
router.delete("/leads/:id", leadController.deleteLead);

export default router;
