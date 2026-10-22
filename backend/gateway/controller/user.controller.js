import protectedRoute from "../middleware/auth.middleware.js";
export const getCurrentUser = async (req, res) => {
  try {
    return res.status(200).json({ message: "Current user fetched successfully", user: req.user });
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}