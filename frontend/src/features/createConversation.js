import api from "../../utils/axios.js";

export const createConversation = async () => {
  try {
    const { data } = await api.post("/chat/conversations");
    return data;
  } catch (error) {
    console.error("Could not create conversation:", error);
    return null;
  }
};
