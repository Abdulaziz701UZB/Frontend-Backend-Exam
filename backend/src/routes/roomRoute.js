import express from "express";
import * as roomController from "../controller/roomController.js";

const router = express.Router();

router.post("/rooms", roomController.createRoom);

router.get("/rooms", roomController.getRooms);

router.put("/rooms/:id", roomController.updateRoom);

router.delete("/rooms/:id", roomController.deleteRoom);

export default router;
