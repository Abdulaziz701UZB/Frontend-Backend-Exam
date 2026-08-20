import express from "express";
import * as courseController from "../controller/courseController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Kurslar boshqaruvi
 */

/**
 * @swagger
 * /courses:
 *   post:
 *     tags: [Courses]
 *     summary: Yangi kurs yaratish
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Frontend Dasturlash (React.js)"
 *               duration:
 *                 type: string
 *                 example: "6 oy"
 *               price:
 *                 type: number
 *                 example: 650000
 *               description:
 *                 type: string
 *                 example: "React, Redux, Tailwind CSS va TypeScript"
 *     responses:
 *       201:
 *         description: Kurs yaratildi
 *       400:
 *         description: Validatsiya xatosi
 *       500:
 *         description: Server xatosi
 */
router.post("/courses", courseController.createCourse);

/**
 * @swagger
 * /courses:
 *   get:
 *     tags: [Courses]
 *     summary: Barcha kurslar ro'yxatini olish
 *     responses:
 *       200:
 *         description: Kurslar ro'yxati
 *       500:
 *         description: Server xatosi
 */
router.get("/courses", courseController.getCourses);

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     tags: [Courses]
 *     summary: Kursni ID bo'yicha olish
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kurs ID raqami
 *     responses:
 *       200:
 *         description: Kurs ma'lumotlari
 *       404:
 *         description: Kurs topilmadi
 *       500:
 *         description: Server xatosi
 */
router.get("/courses/:id", courseController.getCourseById);

/**
 * @swagger
 * /courses/{id}:
 *   put:
 *     tags: [Courses]
 *     summary: Kurs ma'lumotlarini yangilash
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kurs ID raqami
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               duration:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Kurs yangilandi
 *       404:
 *         description: Kurs topilmadi
 *       500:
 *         description: Server xatosi
 */
router.put("/courses/:id", courseController.updateCourse);

/**
 * @swagger
 * /courses/{id}:
 *   delete:
 *     tags: [Courses]
 *     summary: Kursni o'chirish
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kurs ID raqami
 *     responses:
 *       200:
 *         description: Kurs o'chirildi
 *       404:
 *         description: Kurs topilmadi
 *       500:
 *         description: Server xatosi
 */
router.delete("/courses/:id", courseController.deleteCourse);

export default router;
