import express from "express";
import * as teacherController from "../controller/teacherController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Teachers
 *   description: O'qituvchilar, oylik maosh va reyting boshqaruvi
 */

/**
 * @swagger
 * /teachers:
 *   post:
 *     tags: [Teachers]
 *     summary: Yangi o'qituvchi qo'shish
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *               - subject
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Sardor Rustamov"
 *               phone:
 *                 type: string
 *                 example: "+998 90 555 11 22"
 *               subject:
 *                 type: string
 *                 example: "Frontend Dasturlash"
 *               salary:
 *                 type: number
 *                 example: 8000000
 *               experience:
 *                 type: string
 *                 example: "4 yil"
 *               avatar:
 *                 type: string
 *                 example: "👨‍🏫"
 *     responses:
 *       201:
 *         description: O'qituvchi qo'shildi
 *       400:
 *         description: Validatsiya xatosi
 *       500:
 *         description: Server xatosi
 */
router.post("/teachers", teacherController.createTeacher);

/**
 * @swagger
 * /teachers:
 *   get:
 *     tags: [Teachers]
 *     summary: Barcha o'qituvchilar ro'yxatini olish
 *     responses:
 *       200:
 *         description: O'qituvchilar ro'yxati
 *       500:
 *         description: Server xatosi
 */
router.get("/teachers", teacherController.getTeachers);

/**
 * @swagger
 * /teachers/search:
 *   get:
 *     tags: [Teachers]
 *     summary: O'qituvchilarni ismi, fani yoki telefoni bo'yicha qidirish
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
router.get("/teachers/search", teacherController.searchTeachers);

/**
 * @swagger
 * /teachers/{id}:
 *   get:
 *     tags: [Teachers]
 *     summary: O'qituvchini ID bo'yicha olish
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: O'qituvchi ID raqami
 *     responses:
 *       200:
 *         description: O'qituvchi ma'lumotlari
 *       404:
 *         description: O'qituvchi topilmadi
 *       500:
 *         description: Server xatosi
 */
router.get("/teachers/:id", teacherController.getTeacherById);

/**
 * @swagger
 * /teachers/{id}:
 *   put:
 *     tags: [Teachers]
 *     summary: O'qituvchi ma'lumotlarini yangilash
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: O'qituvchi ID raqami
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
 *               subject:
 *                 type: string
 *               salary:
 *                 type: number
 *               experience:
 *                 type: string
 *               avatar:
 *                 type: string
 *     responses:
 *       200:
 *         description: O'qituvchi yangilandi
 *       404:
 *         description: O'qituvchi topilmadi
 *       500:
 *         description: Server xatosi
 */
router.put("/teachers/:id", teacherController.updateTeacher);

/**
 * @swagger
 * /teachers/{id}:
 *   delete:
 *     tags: [Teachers]
 *     summary: O'qituvchini o'chirish
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: O'qituvchi ID raqami
 *     responses:
 *       200:
 *         description: O'qituvchi o'chirildi
 *       404:
 *         description: O'qituvchi topilmadi
 *       500:
 *         description: Server xatosi
 */
router.delete("/teachers/:id", teacherController.deleteTeacher);

export default router;
