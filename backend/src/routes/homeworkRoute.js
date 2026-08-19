import express from "express";
import * as homeworkController from "../controller/homeworkController.js";

const router = express.Router();

router.post("/homework", homeworkController.createHomework);

router.get("/homework", homeworkController.getHomework);

router.put("/homework/:id", homeworkController.updateHomework);

router.delete("/homework/:id", homeworkController.deleteHomework);

export default router;
