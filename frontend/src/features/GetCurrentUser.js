import api from "../../utils/axios.js";
export const GetCurrentUser = async () => {
  try {
    const data = await api.get("/me"); // Make a GET request to the /me endpoint
    return data.data.user;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null; // Return null if there's an error
  }
};
