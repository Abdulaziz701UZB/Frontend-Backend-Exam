import express from "express";
import {
  createTrialLesson,
  getTrialLessons,
  getTrialLessonById,
  updateTrialLesson,
  deleteTrialLesson,
} from "../controller/trialLessonController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: TrialLessons
 *   description: Bepul Sinov Darslari (Trial Lessons) va Konvertatsiya Boshqaruvi
 */

/**
 * @swagger
 * /api/trial-lessons:
 *   get:
 *     summary: Barcha sinov darslari ro'yxatini olish
 *     tags: [TrialLessons]
 *     responses:
 *       200:
 *         description: Sinov darslari ro'yxati
 *   post:
 *     summary: Yangi sinov darsi rejalashtirish
 *     tags: [TrialLessons]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - student_name
 *               - phone
 *               - date
 *               - time
 *             properties:
 *               student_name:
 *                 type: string
 *                 example: "Otabek Mahmudov"
 *               phone:
 *                 type: string
 *                 example: "+998 90 599 06 00"
 *               teacher_name:
 *                 type: string
 *                 example: "Abdulaziz Abdulhayev"
 *               course_name:
 *                 type: string
 *                 example: "Frontend ReactJS"
 *               date:
 *                 type: string
 *                 example: "2026-08-25"
 *               time:
 *                 type: string
 *                 example: "14:00 - 15:30"
 *               room:
 *                 type: string
 *                 example: "201-xona"
 *               notes:
 *                 type: string
 *                 example: "Kompyuteri bor, noldan o'rganmoqchi"
 *     responses:
 *       201:
 *         description: Muvaffaqiyatli rejalashtirildi
 */
router.get("/", getTrialLessons);
router.post("/", createTrialLesson);

/**
 * @swagger
 * /api/trial-lessons/{id}:
 *   get:
 *     summary: ID bo'yicha sinov darsini olish
 *     tags: [TrialLessons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Topildi
 *   put:
 *     summary: Sinov darsi statusi yoki ma'lumotlarini yangilash
 *     tags: [TrialLessons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: "Guruhga yozildi"
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Yangilandi
 *   delete:
 *     summary: Sinov darsini o'chirish
 *     tags: [TrialLessons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: O'chirildi
 */
router.get("/:id", getTrialLessonById);
router.put("/:id", updateTrialLesson);
router.delete("/:id", deleteTrialLesson);

export default router;
