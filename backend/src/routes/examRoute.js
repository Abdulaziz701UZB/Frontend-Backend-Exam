import express from "express";
import * as examController from "../controller/examController.js";

const router = express.Router();

router.post("/exams", examController.createExam);

router.get("/exams", examController.getExams);

router.get("/exams/:id", examController.getExamById);

router.put("/exams/:id", examController.updateExam);

router.delete("/exams/:id", examController.deleteExam);

export default router;
