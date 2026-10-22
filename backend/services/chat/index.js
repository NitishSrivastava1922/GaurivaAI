import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import connectDb from "./config/connectDb.js";
import router from "./routes/chat.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8002;

app.use(cors({
  origin: [process.env.GATEWAY_URL],
  credentials: true
}));
app.use(express.json());
app.use("/",router)

app.get("/", (req, res) => {
  res.send("Chat service is running");
});

app.listen(PORT, () => {
  console.log(`Chat service is running on port ${PORT}`);

connectDb();
});
