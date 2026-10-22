import api from "../../utils/axios.js";

export const createOrder = async (plan) => {
  try {
    const { data } = await api.post("/bill/create", {plan});
    return data;
  } catch (error) {
    return {
      message:
        error.response?.data?.message ||
        "Unable to create payment order",
    };
  }
};
