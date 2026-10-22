import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import proxy from "express-http-proxy";
import cookieParser from "cookie-parser";
import protectedRoute from "./middleware/auth.middleware.js";
import { getCurrentUser } from "./controller/user.controller.js";
import {proxyWithHeaders} from "./utils/proxyWithHeaders.js";
import morgan from "morgan";
dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(morgan("dev"))
app.use(cookieParser());
app.use(
  "/auth",
  (req, res, next) => {
    if (["/login", "/logout"].includes(req.path)) {
      return next();
    }
    return res.status(404).json({ message: "Auth route not found" });
  },
  proxy(process.env.Auth_URL),
);
app.use("/chat",protectedRoute,proxyWithHeaders(process.env.Chat_URL));
app.use("/bill",protectedRoute,proxyWithHeaders(process.env.Bill_URL));
app.use("/agent",protectedRoute,proxyWithHeaders(process.env.Agent_URL));
app.get("/me",protectedRoute, getCurrentUser);

app.get("/",(req,res)=>{
    res.json({message:"Gateway server is running"});
})

app.listen(PORT, () => {
  console.log(`Gateway server is running on port ${PORT}`);
});
