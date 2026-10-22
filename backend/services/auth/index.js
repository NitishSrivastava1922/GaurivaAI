import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDb from "./config/connectDb.js";
import router from "./routes/auth.routes.js";

const PORT = process.env.PORT || 8001;
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: [process.env.GATEWAY_URL],
  credentials: true
}));

app.use("/",router);
app.get("/",(req,res)=>{
    res.json({message:"Auth server is running"});
})

app.listen(PORT, () => {
  console.log(`Auth server is running on port ${PORT}`);
  connectDb();
});
