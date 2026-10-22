import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
  name: "message",
  initialState: {
    activeConversationId: null,
    messages: [],
    artifactsByConversation: {},
  },
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessages: (state, action) => {
      state.messages.push(action.payload);
    },
    replaceMessage: (state, action) => {
      const { id, message, conversationId } = action.payload;
      if (
        conversationId &&
        state.activeConversationId !== conversationId
      ) {
        return;
      }
      const index = state.messages.findIndex((item) => item.id === id);
      if (index !== -1) {
        state.messages[index] = message;
      } else {
        state.messages.push(message);
      }
    },
    setArtifacts: (state, action) => {
      const { conversationId, artifacts } = action.payload || {};
      if (!conversationId) return;
      state.artifactsByConversation[conversationId] = Array.isArray(artifacts)
        ? artifacts
        : [];
    },
    prependArtifacts: (state, action) => {
      const { conversationId, artifacts } = action.payload || {};
      if (!conversationId) return;
      const latest = Array.isArray(artifacts) ? artifacts : [];
      const existingIds = new Set(latest.map((artifact) => artifact.id));
      const current = state.artifactsByConversation[conversationId] || [];
      state.artifactsByConversation[conversationId] = [
        ...latest,
        ...current.filter((artifact) => !existingIds.has(artifact.id)),
      ];
    },
    setActiveConversation: (state, action) => {
      if (state.activeConversationId !== action.payload) {
        state.activeConversationId = action.payload;
        state.messages = [];
      }
    },
    mergeMessages: (state, action) => {
      const { conversationId, messages } = action.payload;
      if (state.activeConversationId !== conversationId) return;

      const loadedMessages = Array.isArray(messages) ? messages : [];
      const messageKey = (message) => `${message.role}:${message.content}`;
      const seenMessages = new Set(loadedMessages.map(messageKey));
      const optimisticMessages = state.messages.filter((message) => {
        const key = messageKey(message);
        if (seenMessages.has(key)) return false;
        seenMessages.add(key);
        return true;
      });

      state.messages = [...loadedMessages, ...optimisticMessages];
    },
  },
});

export const {
  setMessages,
  addMessages,
  replaceMessage,
  setArtifacts,
  prependArtifacts,
  setActiveConversation,
  mergeMessages,
} =
  messageSlice.actions;

export default messageSlice.reducer;
