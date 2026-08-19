import express from "express";
import * as leadController from "../controller/leadController.js";

const router = express.Router();

router.post("/leads", leadController.createLead);

router.get("/leads", leadController.getLeads);

router.put("/leads/:id", leadController.updateLead);

router.delete("/leads/:id", leadController.deleteLead);

export default router;
