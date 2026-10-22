import api from "../../utils/axios.js";

export const deleteConversation = async (id) => {
  try {
    await api.delete(`/chat/conversations/${id}`);
    return true;
  } catch (error) {
    console.error("Could not delete conversation:", error);
    return false;
  }
};
