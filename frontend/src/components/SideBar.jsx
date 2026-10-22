import { useState, useEffect } from "react";
import {
  Coins,
  LogOut,
  MessageSquare,
  PanelLeftIcon,
  PanelRight,
  PenSquare,
  Plus,
  User,
} from "./Icons.jsx";
import { getConversations } from "../features/getConversation.js";
import { useDispatch, useSelector } from "react-redux";
import {
  setConversations,
  setSelectedConversation,
  removeConversation,
} from "../redux/ConversationSlice.js";
import logOut from "../features/logOut.js";
import { setUserData } from "../redux/UserSlice.js";
import { setActiveConversation, setMessages } from "../redux/MessageSlice.js";
import { deleteConversation } from "../features/deleteConversation.js";
import { Trash2 } from "lucide-react";
import BillingDrawer from "./BillingDrawer.jsx";

function SideBar() {
  const [collapsed, setCollapsed] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showBilling,setShowBilling]=useState(false)
  const dispatch = useDispatch();
  const { conversations, selectedConversation } = useSelector(
    (state) => state.conversation,
  );
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    if (!userData?.uid) {
      dispatch(setConversations([]));
      return;
    }

    const getConv = async () => {
      const data = await getConversations();
      dispatch(setConversations(data));
    };

    getConv();
  }, [dispatch, userData?.uid]);

  const handleLogout = async () => {
    await logOut();
    dispatch(setUserData(null));
    dispatch(setConversations([]));
    dispatch(setSelectedConversation(null));
    dispatch(setMessages([]));
  };

  const handleCreateConversation = () => {
    // Start a blank draft. ChatInput creates the conversation only after the
    // first message is sent, preventing empty conversations in the sidebar.
    dispatch(setSelectedConversation(null));
    dispatch(setMessages([]));
  };

  const handleDeleteConversation = async (event, conversation) => {
    event.stopPropagation();

    if (!window.confirm(`Delete “${conversation.title || "New Chat"}”? This cannot be undone.`)) {
      return;
    }

    setDeletingId(conversation._id);
    const deleted = await deleteConversation(conversation._id);
    setDeletingId(null);

    if (!deleted) return;

    const wasSelected = selectedConversation?._id === conversation._id;
    dispatch(removeConversation(conversation._id));
    if (wasSelected) {
      dispatch(setActiveConversation(null));
      dispatch(setMessages([]));
    }
  };

  if (collapsed) {
    return (
      <div className="hidden lg:flex flex-col items-center w-14 h-screen bg-[#0d0f14] border-r border-white/6 py-4 gap-1 shrink-0">
        <button
          className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-colors duration-150 bg-transparent border-none cursor-pointer mb-1"
          onClick={() => setCollapsed(false)}
        >
          <PanelRight />
        </button>

        <button
          className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-colors duration-150 bg-transparent border-none cursor-pointer"
          onClick={handleCreateConversation}
        >
          <Plus />
        </button>
        <div className="flex-1 overflow-y-auto px-2.5 pb-2 [scrollbar-none] [&::-webkit-scrollbar]:hidden ">
          {conversations.map((conv) => {
            const isActive = selectedConversation?._id === conv?._id;
            return (
              <div
                key={conv?._id}
                onClick={() => dispatch(setSelectedConversation(conv))}
                className={`group flex items-center gap-2.5 cursor-pointer mb-0.5 px-3 py-2.5 rounded-[10px] border transition-colors duration-150 ${
                  isActive
                    ? "bg-indigo-500/10 border-indigo-500/18"
                    : "bg-transparent border-transparent"
                }`}
              >
                <div
                  className={`flex items-center justify-center shrink-0 w-7 h-7 rounded-lg transition-colors duration-150 ${
                    isActive
                      ? "bg-indigo-500/15 text-indigo-400"
                      : "bg-white/5 text-slate-500"
                  }`}
                >
                  <MessageSquare size={13} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="relative shrink-0">
                {userData?.avatar && !imageError ? (
                  <img
                    className="w-9 h-9 rounded-[10px] object-cover border-2 border-indigo-500/25"
                    src={userData?.avatar}
                    alt="image"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="flex items-center justify-center w-9 h-9 rounded-[10px] bg-white/5 border-2 border-indigo-500/25">
                    <User size={15} className="text-slate-500" />
                  </div>
                )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed lg:static inset-y-0 left-0 z-50 h-screen w-[25%] shrink-0 border-r border-indigo-300/10 bg-linear-to-b from-[#121725] via-[#0d0f14] to-[#090b10]">
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/6">
          <div
            className="hidden lg:flex items-center justify-center h-7 w-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/6 transition-colors duration-150 bg-transparent border-none cursor-pointer"
            onClick={() => {
              setCollapsed(true);
            }}
          >
            <PanelLeftIcon />
          </div>
          <span className="text-[16px] font-semibold text-slate-100 tracking-tight flex-1">
            NexusAi
          </span>
          <span className="text-[10px] font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full tracking-wide">
            Free
          </span>
          <button
            type="button"
            className="flex items-center justify-center h-7 w-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/6 transition-colors duration-150 bg-transparent border-none cursor-pointer"
            onClick={handleCreateConversation}
          >
            <PenSquare size={14} />
          </button>
        </div>
        <div className="px-4 pt-4 pb-1">
          <button
            className="w-full flex items-center justify-center gap-2 text-sm font-medium text-white bg-linear-to-br from-indigo-500 to-violet-700 rounded-xl py-2.5 border-none cursor-pointer hover:opacity-90 transition-opacity duration-150"
            onClick={handleCreateConversation}
          >
            <Plus size={15} />
            New Chat
          </button>
        </div>
        {conversations.length === 0 ? (
          <div className="px-5 pt-4 pb-1.5 text-[10.5px] font-semibold uppercase tracking-widest text-slate-600">
            No Recent Conversations
          </div>
        ) : (
          <div className="px-5 pt-4 pb-1.5 text-[10.5px] font-semibold uppercase tracking-widest text-slate-600">
            Recents
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-2.5 pb-2 [scrollbar-none] [&::-webkit-scrollbar]:hidden">
          {conversations.map((conv) => {
            const isActive = selectedConversation?._id === conv?._id;
            return (
              <div
                key={conv?._id}
                onClick={() => dispatch(setSelectedConversation(conv))}
                className={`flex items-center gap-2.5 cursor-pointer mb-0.5 px-3 py-2.5 rounded-[10px] border transition-colors duration-150 ${
                  isActive
                    ? "bg-indigo-500/10 border-indigo-500/18"
                    : "bg-transparent border-transparent"
                }`}
              >
                <div
                  className={`flex items-center justify-center shrink-0 w-7 h-7 rounded-lg transition-colors duration-150 ${
                    isActive
                      ? "bg-indigo-500/15 text-indigo-400"
                      : "bg-white/5 text-slate-500"
                  }`}
                >
                  <MessageSquare size={13} />
                </div>
                <span className="min-w-0 flex-1 truncate">{conv?.title || "New Chat"}</span>
                <button
                  type="button"
                  onClick={(event) => handleDeleteConversation(event, conv)}
                  disabled={deletingId === conv._id}
                  aria-label={`Delete ${conv?.title || "conversation"}`}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-500 opacity-0 transition-all hover:bg-rose-500/15 hover:text-rose-400 disabled:cursor-wait disabled:opacity-100 group-hover:opacity-100 focus:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>

        <div className="mx-2.5 h-px bg-white/6" />

        <div className="px-3.5 py-3.5">
          {userData ? (
            <div className="flex items-center gap-2.5 cursor-pointer rounded-xl px-3 py-2.5 hover:bg-white/5 transition-colors duration-150">
              <div className="relative shrink-0">
                {userData?.avatar && !imageError ? (
                  <img
                    className="w-9 h-9 rounded-[10px] object-cover border-2 border-indigo-500/25"
                    src={userData?.avatar}
                    alt="image"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="flex items-center justify-center w-9 h-9 rounded-[10px] bg-white/5 border-2 border-indigo-500/25">
                    <User size={15} className="text-slate-500" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13.5px] font-semibold text-slate-100 truncate">
                  {userData?.name || "user"}
                </p>
                <p className="text-[11px] text-slate-600 mt-px">
                  {"Free Plan"}
                </p>
              </div>

              <div className="flex gap-1">
                <button className="flex items-center justify-center h-7 w-7 rounded-[7px] border-none text-yellow-600 hover:text-slate-400 hover:bg-white/8 transition-all duration-150 cursor-pointer" onClick={()=>setShowBilling(true)}>
                  {" "}
                  <Coins size={19} />
                </button>
                <button
                  type="button"
                  aria-label="Log out"
                  className="flex items-center justify-center h-7 w-7 rounded-[7px] border-none text-slate-400 hover:text-slate-200 hover:bg-white/8 transition-all duration-150 cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut size={19} />
                </button>
              </div>
            </div>
          ) : (
            <button className="w-full flex items-center justify-center h-7 gep-2 text-sm font-medium text-slate-200 bg-white/5 border border-white/8 rounded-xl py-7.5 cursor-pointer hover:bg-white/8 transition-colors duration-150">
              Login
            </button>
          )}
        </div>
      </div>
      <BillingDrawer open={showBilling} onClose={()=>setShowBilling(false)}/>
    </div>
  );
}

export default SideBar;
