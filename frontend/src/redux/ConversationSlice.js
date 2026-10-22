import { createSlice } from "@reduxjs/toolkit";

const conversationSlice = createSlice({
  name: "conversation",
  initialState: {
    conversations: [],
    selectedConversation:null
  },
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },
    addConversation: (state, action) => {
      state.conversations.unshift(action.payload);
    },
    setSelectedConversation: (state, action) => {
      state.selectedConversation = action.payload;
    },
    updateConversation: (state, action) => {
      const index = state.conversations.findIndex(({ _id }) => _id === action.payload._id);
      if (index !== -1) state.conversations[index] = action.payload;
      if (state.selectedConversation?._id === action.payload._id) {
        state.selectedConversation = action.payload;
      }
    },
    removeConversation: (state, action) => {
      const id = action.payload;
      state.conversations = state.conversations.filter(
        (conversation) => conversation._id !== id,
      );
      if (state.selectedConversation?._id === id) {
        state.selectedConversation = null;
      }
    },
  },
});

export const { setConversations, addConversation, setSelectedConversation, updateConversation, removeConversation } =
  conversationSlice.actions;

export default conversationSlice.reducer;
