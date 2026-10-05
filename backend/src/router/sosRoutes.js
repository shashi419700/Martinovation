import express from "express";
import { sendSOS } from "../controllers/sosController.js";

const router = express.Router();

router.post("/sos", sendSOS);

export default router;