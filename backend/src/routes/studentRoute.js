import express from "express";
import * as studentController from "../controller/studentController.js";

const router = express.Router();

router.post("/students", studentController.createStudent);

router.get("/students", studentController.getStudents);

router.get("/students/search", studentController.searchStudents);

router.get("/students/:id", studentController.getStudentById);

router.put("/students/:id", studentController.updateStudent);

router.delete("/students/:id", studentController.deleteStudent);

export default router;
