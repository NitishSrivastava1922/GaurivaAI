import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import MessageBubble from "./MessageBubble.jsx";

function LoadingMessage({ updates = ["Thinking…"] }) {
  const [updateIndex, setUpdateIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setUpdateIndex((index) => (index + 1) % updates.length);
    }, 1800);

    return () => window.clearInterval(timer);
  }, [updates]);

  return (
    <div className="mt-2 flex items-center gap-2.5 px-4 py-3 text-sm text-slate-400">
      <span className="flex gap-1" aria-label="Loading">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce"
            style={{ animationDelay: `${dot * 150}ms` }}
          />
        ))}
      </span>
      <span key={updates[updateIndex]} className="animate-in fade-in duration-200">
        {updates[updateIndex]}
      </span>
    </div>
  );
}

function MessageList() {
  const { selectedConversation } = useSelector((state) => state.conversation);
  const { messages } = useSelector((state) => state.message);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 scrollbar-none [&::-webkit-scrollbar]:hidden">
      {messages.length === 0 || !selectedConversation ? (
        <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-[20px] font-semibold text-slate-200 tracking-tight">
              NexusAI
            </h1>

            <p className="text-[15px] font-semibold text-slate-400 tracking-tight">
              How can I help you?
            </p>

            <p className="text-[13px] text-slate-600 max-w-65 leading-relaxed">
              Ask me anything — code, ideas, explanations, or just a quick
              question.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-1">
            {[
              "Write a Netflix clone",
              "Explain Redis",
              "Build a dashboard",
            ].map((s) => (
              <button
                key={s}
                className="text-[12px] text-slate-400 bg-white/4 border border-white/[0.07] px-3 py-1.5 rounded-lg hover:bg-white/8 hover:text-slate-200 transition-colors duration-150 cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          {messages?.map((msg, i) => (
            <div key={msg.id || i}>
              {msg.isLoading ? (
                <LoadingMessage updates={msg.statusUpdates} />
              ) : (
                <MessageBubble
                  role={msg?.role}
                  content={msg?.content}
                  images={msg?.images}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default MessageList;
