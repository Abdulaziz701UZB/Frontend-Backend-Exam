import express from "express";
import * as certificateController from "../controller/certificateController.js";

const router = express.Router();

router.post("/certificates", certificateController.createCertificate);

router.get("/certificates", certificateController.getCertificates);

router.put("/certificates/:id", certificateController.updateCertificate);

router.delete("/certificates/:id", certificateController.deleteCertificate);

export default router;
