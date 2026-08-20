import express from "express";
import * as certificateController from "../controller/certificateController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Certificates
 *   description: Sertifikatlar va QR-kod tekshiruvi boshqaruvi
 */

/**
 * @swagger
 * /certificates:
 *   post:
 *     tags: [Certificates]
 *     summary: Yangi bitiruv sertifikati rasmiylashtirish
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - student_name
 *               - course_name
 *             properties:
 *               student_name:
 *                 type: string
 *                 example: "Abdulaziz Abdulhayev"
 *               course_name:
 *                 type: string
 *                 example: "Frontend Dasturlash"
 *               issue_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-08-20"
 *               grade:
 *                 type: string
 *                 example: "A+ (98%)"
 *     responses:
 *       201:
 *         description: Sertifikat yaratildi
 *       400:
 *         description: Validatsiya xatosi
 *       500:
 *         description: Server xatosi
 */
router.post("/certificates", certificateController.createCertificate);

/**
 * @swagger
 * /certificates:
 *   get:
 *     tags: [Certificates]
 *     summary: Barcha sertifikatlar reestrini olish
 *     responses:
 *       200:
 *         description: Sertifikatlar ro'yxati
 *       500:
 *         description: Server xatosi
 */
router.get("/certificates", certificateController.getCertificates);

/**
 * @swagger
 * /certificates/verify/{qr_code}:
 *   get:
 *     tags: [Certificates]
 *     summary: Sertifikat haqiqiyligini QR kod orqali tekshirish
 *     parameters:
 *       - in: path
 *         name: qr_code
 *         required: true
 *         schema:
 *           type: string
 *         description: QR-kod havolasi yoki kodi
 *     responses:
 *       200:
 *         description: Sertifikat topildi va tasdiqlandi
 *       404:
 *         description: Sertifikat topilmadi
 *       500:
 *         description: Server xatosi
 */
router.get("/certificates/verify/:qr_code", certificateController.verifyCertificate);

/**
 * @swagger
 * /certificates/{id}:
 *   get:
 *     tags: [Certificates]
 *     summary: Sertifikatni ID bo'yicha olish
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sertifikat ID (masalan CERT-901)
 *     responses:
 *       200:
 *         description: Sertifikat ma'lumotlari
 *       404:
 *         description: Sertifikat topilmadi
 *       500:
 *         description: Server xatosi
 */
router.get("/certificates/:id", certificateController.getCertificateById);

/**
 * @swagger
 * /certificates/{id}:
 *   put:
 *     tags: [Certificates]
 *     summary: Sertifikat ma'lumotlarini yangilash
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sertifikat ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               student_name:
 *                 type: string
 *               course_name:
 *                 type: string
 *               grade:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sertifikat yangilandi
 *       404:
 *         description: Sertifikat topilmadi
 *       500:
 *         description: Server xatosi
 */
router.put("/certificates/:id", certificateController.updateCertificate);

/**
 * @swagger
 * /certificates/{id}:
 *   delete:
 *     tags: [Certificates]
 *     summary: Sertifikatni o'chirish
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sertifikat ID
 *     responses:
 *       200:
 *         description: Sertifikat o'chirildi
 *       404:
 *         description: Sertifikat topilmadi
 *       500:
 *         description: Server xatosi
 */
router.delete("/certificates/:id", certificateController.deleteCertificate);

export default router;
