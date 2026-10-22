import api from '../../utils/axios.js';

async function logOut() {
  try {
    await api.post('/auth/logout');
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export default logOut
