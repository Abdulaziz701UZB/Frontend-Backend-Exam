import express from "express";
import * as attendanceController from "../controller/attendanceController.js";

const router = express.Router();

router.post("/attendance", attendanceController.createAttendance);

router.get("/attendance", attendanceController.getAttendance);

router.delete("/attendance/:id", attendanceController.deleteAttendance);

export default router;
