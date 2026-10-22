import { useEffect } from 'react'
import Nav from './Nav'
import MessageList from './MessageList'
import ChatInput from './ChatInput'
import { useDispatch, useSelector } from 'react-redux'
import getMessages from '../features/getMessages.js'
import { mergeMessages, setActiveConversation, setMessages, setArtifacts } from '../redux/MessageSlice.js'

function ChatArea() {
  const {selectedConversation} = useSelector(
    (state) => state.conversation
  );
  const dispatch = useDispatch();

  useEffect(() => {
    let cancelled = false;
    const conversationId = selectedConversation?._id;

    const getMesg = async () => {
      if (conversationId) {
        dispatch(setActiveConversation(conversationId));
        const data = await getMessages(conversationId);
        if (!cancelled) {
          dispatch(mergeMessages({ conversationId, messages: data }));
          const conversationArtifacts = [...data]
            .reverse()
            .flatMap((message) => message.artifacts || []);
          dispatch(setArtifacts({ conversationId, artifacts: conversationArtifacts }));
        }
      } else {
        dispatch(setActiveConversation(null));
        dispatch(setMessages([]));
      }
    };
    getMesg();

    return () => {
      cancelled = true;
    };
  }, [dispatch, selectedConversation?._id]);
  return (
    <div className='flex-1 flex flex-col min-w-0'>
      <Nav/>
      <MessageList/>
      <ChatInput/>
    </div>
  )
}

export default ChatArea
