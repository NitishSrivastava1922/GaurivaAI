import express from "express"
import { createConversation, deleteConversation, getConversation, getMessages, getUserMessages, saveMessage, updateConversation } from "../controller/chat.controller.js";

const router=express.Router();

router.post("/conversations",createConversation);
router.get("/get-conversation",getConversation);
router.post("/save-message",saveMessage);
router.patch("/conversations/:id", (req, res, next) => {
  req.body.id = req.params.id;
  next();
}, updateConversation);
router.delete("/conversations/:id", deleteConversation);
router.get("/get-messages/:conversationId",getMessages);
router.get("/get-user-messages",getUserMessages);

export default router;
