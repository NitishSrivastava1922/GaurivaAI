import api from "../../utils/axios.js";

export const updateConversation = async (id, title) => {
  try {
    const { data } = await api.patch(`/chat/conversations/${id}`, { title });
    return data;
  } catch (error) {
    console.error("Could not update conversation:", error);
    return null;
  }
};
