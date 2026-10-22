import api from '../../utils/axios.js';

async function getMessages(id) {
  try {
    const { data } = await api.get(`/chat/get-messages/${id}`);
    return data;
  } catch (error) {
    console.log("GET MESSAGE ERROR",error);
    return [];
  }
}

export default getMessages
