import express from "express";
import * as studentController from "../controller/studentController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Students
 *   description: O'quvchilar bazasi va guruhga biriktirish
 */

/**
 * @swagger
 * /students:
 *   post:
 *     tags: [Students]
 *     summary: Yangi o'quvchi qo'shish
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - phone
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: "Abdulaziz Abdulhayev"
 *               phone:
 *                 type: string
 *                 example: "+998 90 123 45 67"
 *               parent_phone:
 *                 type: string
 *                 example: "+998 90 987 65 43"
 *               group_id:
 *                 type: string
 *                 example: "G-101"
 *               group_name:
 *                 type: string
 *                 example: "React-404"
 *               payment_status:
 *                 type: string
 *                 example: "Paid"
 *               balance:
 *                 type: number
 *                 example: 0
 *               status:
 *                 type: string
 *                 example: "Active"
 *     responses:
 *       201:
 *         description: O'quvchi qo'shildi
 *       400:
 *         description: Validatsiya xatosi
 *       500:
 *         description: Server xatosi
 */
router.post("/students", studentController.createStudent);

/**
 * @swagger
 * /students:
 *   get:
 *     tags: [Students]
 *     summary: Barcha o'quvchilar ro'yxatini olish
 *     responses:
 *       200:
 *         description: O'quvchilar ro'yxati
 *       500:
 *         description: Server xatosi
 */
router.get("/students", studentController.getStudents);

/**
 * @swagger
 * /students/search:
 *   get:
 *     tags: [Students]
 *     summary: O'quvchilarni ismi, telefoni yoki guruhi bo'yicha qidirish
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
router.get("/students/search", studentController.searchStudents);

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     tags: [Students]
 *     summary: O'quvchini ID bo'yicha olish
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: O'quvchi ID raqami
 *     responses:
 *       200:
 *         description: O'quvchi ma'lumotlari
 *       404:
 *         description: O'quvchi topilmadi
 *       500:
 *         description: Server xatosi
 */
router.get("/students/:id", studentController.getStudentById);

/**
 * @swagger
 * /students/{id}:
 *   put:
 *     tags: [Students]
 *     summary: O'quvchi ma'lumotlarini yangilash
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: O'quvchi ID raqami
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               parent_phone:
 *                 type: string
 *               group_id:
 *                 type: string
 *               group_name:
 *                 type: string
 *               payment_status:
 *                 type: string
 *               balance:
 *                 type: number
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: O'quvchi yangilandi
 *       404:
 *         description: O'quvchi topilmadi
 *       500:
 *         description: Server xatosi
 */
router.put("/students/:id", studentController.updateStudent);

/**
 * @swagger
 * /students/{id}:
 *   delete:
 *     tags: [Students]
 *     summary: O'quvchini o'chirish
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: O'quvchi ID raqami
 *     responses:
 *       200:
 *         description: O'quvchi o'chirildi
 *       404:
 *         description: O'quvchi topilmadi
 *       500:
 *         description: Server xatosi
 */
router.delete("/students/:id", studentController.deleteStudent);

/**
 * @swagger
 * /students/{id}/transfer:
 *   post:
 *     tags: [Students]
 *     summary: O'quvchini boshqa guruhga o'tkazish (Transfer Student)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newGroupId
 *             properties:
 *               newGroupId:
 *                 type: string
 *               newGroupName:
 *                 type: string
 *               transferReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: O'quvchi boshqa guruhga muvaffaqiyatli o'tkazildi
 */
router.post("/students/:id/transfer", studentController.transferStudent);

export default router;
