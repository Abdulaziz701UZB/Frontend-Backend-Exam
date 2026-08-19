import express from "express";
import * as paymentController from "../controller/paymentController.js";

const router = express.Router();

router.post("/payments", paymentController.createPayment);

router.get("/payments", paymentController.getPayments);

router.get("/payments/search", paymentController.searchPayments);

router.get("/payments/:id", paymentController.getPaymentById);

router.put("/payments/:id", paymentController.updatePayment);

router.delete("/payments/:id", paymentController.deletePayment);

export default router;
