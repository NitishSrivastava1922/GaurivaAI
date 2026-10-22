import { configureStore } from '@reduxjs/toolkit'
import UserReducer from './UserSlice'
import ConversationReducer from './ConversationSlice'
import messageReducer from './MessageSlice'

export const store = configureStore({
  reducer: {
    user: UserReducer,
    conversation:ConversationReducer,
    message:messageReducer
  },
})