import express from "express";
import * as roomController from "../controller/roomController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Rooms
 *   description: Xonalar, kompyuterlar va inventar boshqaruvi
 */

/**
 * @swagger
 * /rooms:
 *   post:
 *     tags: [Rooms]
 *     summary: Yangi xona qo'shish
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - capacity
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Xona 105 (Frontend Lab)"
 *               capacity:
 *                 type: integer
 *                 example: 20
 *               computers_count:
 *                 type: integer
 *                 example: 20
 *               projector:
 *                 type: string
 *                 example: "Mavjud"
 *               status:
 *                 type: string
 *                 example: "Active"
 *     responses:
 *       201:
 *         description: Xona qo'shildi
 *       400:
 *         description: Validatsiya xatosi
 *       500:
 *         description: Server xatosi
 */
router.post("/rooms", roomController.createRoom);

/**
 * @swagger
 * /rooms:
 *   get:
 *     tags: [Rooms]
 *     summary: Barcha xonalar ro'yxatini olish
 *     responses:
 *       200:
 *         description: Xonalar ro'yxati
 *       500:
 *         description: Server xatosi
 */
router.get("/rooms", roomController.getRooms);

/**
 * @swagger
 * /rooms/{id}:
 *   get:
 *     tags: [Rooms]
 *     summary: Xonani ID bo'yicha olish
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Xona ID (masalan ROOM-101)
 *     responses:
 *       200:
 *         description: Xona ma'lumotlari
 *       404:
 *         description: Xona topilmadi
 *       500:
 *         description: Server xatosi
 */
router.get("/rooms/:id", roomController.getRoomById);

/**
 * @swagger
 * /rooms/{id}:
 *   put:
 *     tags: [Rooms]
 *     summary: Xona ma'lumotlarini yangilash
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Xona ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               computers_count:
 *                 type: integer
 *               projector:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Xona yangilandi
 *       404:
 *         description: Xona topilmadi
 *       500:
 *         description: Server xatosi
 */
router.put("/rooms/:id", roomController.updateRoom);

/**
 * @swagger
 * /rooms/{id}:
 *   delete:
 *     tags: [Rooms]
 *     summary: Xonani o'chirish
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Xona ID
 *     responses:
 *       200:
 *         description: Xona o'chirildi
 *       404:
 *         description: Xona topilmadi
 *       500:
 *         description: Server xatosi
 */
router.delete("/rooms/:id", roomController.deleteRoom);

export default router;
