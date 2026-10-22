import express from "express"
import { agent } from "../controller/agent.controller.js";
import multer from '../config/multer.js';

const router=express.Router();

router.post("/chat", multer.array("files", 10), agent);


export default router
