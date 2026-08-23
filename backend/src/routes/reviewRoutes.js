import express from "express";
import {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
} from "../controller/reviewController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: 1-10 Ballik Mijozlar Fikr-Mulohazalari va NPS Reytingi Boshqaruvi
 */

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: Barcha fikr-mulohazalar va 1-10 baholash natijalarini olish
 *     tags: [Reviews]
 *     responses:
 *       200:
 *         description: Fikr-mulohazalar ro'yxati
 *   post:
 *     summary: Yangi fikr-mulohaza va 1-10 baho qo'shish
 *     tags: [Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - comment
 *             properties:
 *               student_name:
 *                 type: string
 *                 example: "Abdulaziz Abdulhayev"
 *               teacher_name:
 *                 type: string
 *                 example: "Abdulaziz Abdulhayev"
 *               group_name:
 *                 type: string
 *                 example: "F-12 Guruh (ReactJS)"
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 example: 10
 *               category:
 *                 type: string
 *                 example: "O'qitish sifati"
 *               comment:
 *                 type: string
 *                 example: "Darslar juda qiziqarli va tushunarli o'tildi, amaliyot juda ko'p!"
 *     responses:
 *       201:
 *         description: Muvaffaqiyatli saqlandi
 */
router.get("/", getReviews);
router.post("/", createReview);

/**
 * @swagger
 * /api/reviews/{id}:
 *   get:
 *     summary: ID bo'yicha fikrni olish
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Fikr topildi
 *   put:
 *     summary: Fikr statusi yoki izohini tahrirlash
 *     tags: [Reviews]
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
 *                 example: "Ko'rib chiqildi"
 *               comment:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *     responses:
 *       200:
 *         description: Yangilandi
 *   delete:
 *     summary: Fikrni o'chirish
 *     tags: [Reviews]
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
router.get("/:id", getReviewById);
router.put("/:id", updateReview);
router.delete("/:id", deleteReview);

export default router;
