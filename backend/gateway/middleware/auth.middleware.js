import redis from "../../shared/redis.js";

const protectedRoute = async (req, res, next) => {
  try{
    const sessionId = req.cookies?.session;
    if (!sessionId) {
      return res.status(401).json({ message: "Unauthorized: No session found" });
    }

    const session=await redis.get(`sessionId:${sessionId}`);
    if (!session) {
      return res.status(401).json({ message: "session Expired" });
    }
    req.user = JSON.parse(session);
    next();
  }catch (error) {
    console.error("Error in protectedRoute middleware:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export default protectedRoute;