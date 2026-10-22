import api from "../../utils/axios.js";

export const verifyPayment = async (payload) => {
  try {
    const { data } = await api.post("/bill/verify", payload,{
      withCredentials:true
    });
    return data;
  } catch (error) {
    console.error("Payment verification failed:", error);

    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Payment verification failed",
    };
  }
};