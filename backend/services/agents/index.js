import express from "express";
import cors from "cors";
import connectDb from "./config/connectDb.js";
import router from "./routes/agent.route.js";

const app = express();
const PORT = process.env.PORT || 8003;

app.use(cors({
  origin: [process.env.GATEWAY_URL],
  credentials: true
}));
app.use(express.json());
app.use("/",router)
app.get("/", (req, res) => {
  res.send("agent service is running");
});

app.listen(PORT, () => {
  console.log(`Agent service is running on port ${PORT}`);

connectDb();
});
