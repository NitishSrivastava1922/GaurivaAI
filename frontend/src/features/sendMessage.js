import api from '../../utils/axios.js'

async function sendMessage(payload) {
  try {
    const {data}=await api.post("/agent/chat", payload);
    return data
  } catch (error) {
    return {
      error:
        error.response?.data?.message ||
        "Unable to process the message right now. Please try again.",
    };
  }
}
export default sendMessage
