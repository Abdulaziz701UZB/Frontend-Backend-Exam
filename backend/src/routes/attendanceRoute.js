import express from "express";
import * as attendanceController from "../controller/attendanceController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Davomat, dars qoldirish sabablari va tahlil
 */

/**
 * @swagger
 * /attendance:
 *   post:
 *     tags: [Attendance]
 *     summary: Davomat belgilash
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - group_id
 *               - student_id
 *               - date
 *               - status
 *             properties:
 *               group_id:
 *                 type: string
 *                 example: "G-101"
 *               student_id:
 *                 type: integer
 *                 example: 1
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2026-08-20"
 *               status:
 *                 type: string
 *                 enum: [Present, Absent, Late]
 *                 example: "Present"
 *               note:
 *                 type: string
 *                 example: "Darsga to'liq qatnashdi"
 *               reason_category:
 *                 type: string
 *                 example: "Sababli"
 *     responses:
 *       201:
 *         description: Davomat belgilandi
 *       400:
 *         description: Validatsiya xatosi
 *       500:
 *         description: Server xatosi
 */
router.post("/attendance", attendanceController.createAttendance);

/**
 * @swagger
 * /attendance:
 *   get:
 *     tags: [Attendance]
 *     summary: Barcha davomat ro'yxatini olish
 *     responses:
 *       200:
 *         description: Davomat ro'yxati
 *       500:
 *         description: Server xatosi
 */
router.get("/attendance", attendanceController.getAttendance);

/**
 * @swagger
 * /attendance/{id}:
 *   get:
 *     tags: [Attendance]
 *     summary: Davomat yozuvini ID bo'yicha olish
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Davomat ID
 *     responses:
 *       200:
 *         description: Davomat ma'lumoti
 *       404:
 *         description: Davomat topilmadi
 *       500:
 *         description: Server xatosi
 */
router.get("/attendance/:id", attendanceController.getAttendanceById);

/**
 * @swagger
 * /attendance/{id}:
 *   put:
 *     tags: [Attendance]
 *     summary: Davomat yozuvini yangilash
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Davomat ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               note:
 *                 type: string
 *               reason_category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Davomat yangilandi
 *       404:
 *         description: Davomat topilmadi
 *       500:
 *         description: Server xatosi
 */
router.put("/attendance/:id", attendanceController.updateAttendance);

/**
 * @swagger
 * /attendance/{id}:
 *   delete:
 *     tags: [Attendance]
 *     summary: Davomat yozuvini o'chirish
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Davomat ID
 *     responses:
 *       200:
 *         description: Davomat o'chirildi
 *       404:
 *         description: Davomat topilmadi
 *       500:
 *         description: Server xatosi
 */
router.delete("/attendance/:id", attendanceController.deleteAttendance);

export default router;
