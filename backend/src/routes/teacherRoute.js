import express from "express";
import * as teacherController from "../controller/teacherController.js";

const router = express.Router();

router.post("/teachers", teacherController.createTeacher);

router.get("/teachers", teacherController.getTeachers);

router.get("/teachers/search", teacherController.searchTeachers);

router.get("/teachers/:id", teacherController.getTeacherById);

router.put("/teachers/:id", teacherController.updateTeacher);

router.delete("/teachers/:id", teacherController.deleteTeacher);

export default router;
