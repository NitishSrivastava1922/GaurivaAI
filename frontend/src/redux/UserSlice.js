import {createSlice} from '@reduxjs/toolkit';

const USER_STORAGE_KEY = "nexusai:user";

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

const UserSlice = createSlice({
  name: 'user',
  initialState: {
    userData: getStoredUser(),
    sessionChecked: false,
  },
  reducers: {
      setUserData: (state, action) => {
          state.userData = action.payload;
          if (action.payload) {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(action.payload));
          } else {
            localStorage.removeItem(USER_STORAGE_KEY);
          }
      },
      setSessionChecked: (state, action) => {
          state.sessionChecked = action.payload;
      },
  }
});

export const {setUserData, setSessionChecked} = UserSlice.actions;
export default UserSlice.reducer;
