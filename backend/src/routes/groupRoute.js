import express from "express";
import * as groupController from "../controller/groupController.js";

const router = express.Router();

router.post("/groups", groupController.createGroup);

router.get("/groups", groupController.getGroups);

router.get("/groups/search", groupController.searchGroups);

router.get("/groups/:id", groupController.getGroupById);

router.put("/groups/:id", groupController.updateGroup);

router.delete("/groups/:id", groupController.deleteGroup);

export default router;
