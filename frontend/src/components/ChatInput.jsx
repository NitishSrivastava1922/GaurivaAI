import { useEffect, useRef, useState } from "react";
import { Paperclip, Mic, Send } from "./Icons.jsx";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/UserSlice.js";
import sendMessage from "../features/sendMessage.js";
import {
  addMessages,
  prependArtifacts,
  replaceMessage,
  setActiveConversation,
} from "../redux/MessageSlice.js";
import { createConversation } from "../features/createConversation.js";
import {
  Code2,
  FileText,
  Globe,
  ImageIcon,
  MessageSquare,
  Presentation,
  X,
  Zap,
} from "lucide-react";
import {
  addConversation,
  setSelectedConversation,
  updateConversation,
} from "../redux/ConversationSlice.js";
import { updateConversation as updateConversationRequest } from "../features/updateConversation.js";

function ChatInput() {
  const [value, setValue] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("auto");
  const [isSending, setIsSending] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const { selectedConversation } = useSelector((state) => state.conversation);
  const { userData } = useSelector((state) => state.user);
  const fileRef = useRef(null);
  const recognitionRef = useRef(null);
  const agents = [
    {
      id: "auto",
      icon: Zap,
      label: "auto",
    },
    {
      id: "chat",
      icon: MessageSquare,
      label: "chat",
    },
    {
      id: "coding",
      icon: Code2,
      label: "coding",
    },
    {
      id: "pdf",
      icon: FileText,
      label: "pdf",
    },
    {
      id: "ppt",
      icon: Presentation,
      label: "ppt",
    },
    {
      id: "imageGen",
      icon: ImageIcon,
      label: "imageGen",
    },
    {
      id: "search",
      icon: Globe,
      label: "search",
    },
  ];

  const dispatch = useDispatch();
  const activeConversationId = useRef(selectedConversation?._id);
  const activeConversation = useRef(selectedConversation);
  const creatingConversation = useRef(null);

  useEffect(() => {
    activeConversationId.current = selectedConversation?._id;
    activeConversation.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  useEffect(() => {
    const previews = selectedFiles
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => ({ file, url: URL.createObjectURL(file) }));
    setFilePreviews(previews);
    return () => previews.forEach(({ url }) => URL.revokeObjectURL(url));
  }, [selectedFiles]);

  const removeSelectedFile = (index) => {
    setSelectedFiles((files) => files.filter((_, fileIndex) => fileIndex !== index));
    if (fileRef.current) fileRef.current.value = "";
  };

  const clearSelectedFiles = () => {
    setSelectedFiles([]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError("Voice input is supported in Chrome and Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    const initialValue = value.trim();
    recognition.lang = navigator.language?.startsWith("hi") ? "hi-IN" : "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setVoiceError("");
      setIsListening(true);
    };
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ")
        .trim();
      setValue([initialValue, transcript].filter(Boolean).join(" "));
    };
    recognition.onerror = (event) => {
      if (event.error !== "aborted") {
        setVoiceError(
          event.error === "not-allowed"
            ? "Microphone permission is required for voice input."
            : "Voice input could not be started. Please try again.",
        );
      }
    };
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setVoiceError("Voice input could not be started. Please try again.");
      setIsListening(false);
    }
  };

  const ensureConversation = async () => {
    if (activeConversationId.current) {
      return activeConversation.current;
    }

    if (!creatingConversation.current) {
      creatingConversation.current = createConversation()
        .then((conversation) => {
          if (!conversation?._id || activeConversationId.current) {
            return conversation;
          }

          activeConversationId.current = conversation._id;
          activeConversation.current = conversation;
          dispatch(addConversation(conversation));
          // Mark this conversation before selecting it, so the initial history
          // fetch cannot erase the first optimistic user message.
          dispatch(setActiveConversation(conversation._id));
          dispatch(setSelectedConversation(conversation));
          return conversation;
        })
        .finally(() => {
          creatingConversation.current = null;
        });
    }

    return creatingConversation.current;
  };

  const handleSendMessage = async () => {
    const prompt = value.trim();

    if (!prompt) {
      return;
    }

    setIsSending(true);
    try {
      const conversation = await ensureConversation();
      const conversationId = conversation?._id;
      if (!conversationId) return;

      dispatch(addMessages({ role: "user", content: prompt }));
      const pendingMessageId = `pending-${Date.now()}-${Math.random()}`;
      const status =
        selectedAgent === "coding"
          ? ["Thinking…", "Planning the project…", "Generating code…", "Reviewing files…"]
          : selectedAgent === "imageGen"
            ? ["Thinking…", "Preparing the image…", "Generating image…"]
            : selectedAgent === "ppt"
              ? ["Thinking…", "Planning slides…", "Creating presentation…"]
              : selectedAgent === "search"
                ? ["Thinking…", "Searching…", "Reading sources…", "Preparing an answer…"]
                : ["Thinking…", "Analyzing your request…", "Writing a response…"];
      dispatch(
        addMessages({
          id: pendingMessageId,
          role: "assistant",
          content: status[0],
          statusUpdates: status,
          isLoading: true,
        }),
      );

      if (conversation.title === "New Chat") {
        const updatedConversation = await updateConversationRequest(
          conversationId,
          prompt,
        );
        if (updatedConversation) {
          dispatch(updateConversation(updatedConversation));
        }
      }

      const formData = new FormData();
      formData.append("prompt", prompt);
      formData.append("conversationId", conversationId);
      formData.append("agent", selectedAgent);
      selectedFiles.forEach((file) => formData.append("files", file));

      setValue("");
      clearSelectedFiles();

      const response = await sendMessage(formData);

      if (response?.content) {
        if (response.user) {
          dispatch(setUserData({ ...userData, ...response.user }));
        }
        dispatch(
          prependArtifacts({
            conversationId,
            artifacts: response?.artifacts || [],
          }),
        );
        dispatch(
          replaceMessage({
            id: pendingMessageId,
            conversationId,
            message: {
              id: pendingMessageId,
            role: "assistant",
            content: response.content,
            images: response.images,
            artifacts: response.artifacts || [],
            },
          }),
        );
      } else {
        dispatch(
          replaceMessage({
            id: pendingMessageId,
            conversationId,
            message: {
              id: pendingMessageId,
              role: "assistant",
              content:
                response?.error === "Not enough credits"
                  ? "You don't have enough credits for this request. Please buy more credits from the Upgrade button in the sidebar to continue."
                  : response?.error ||
                    "I couldn't complete that request. Please try again.",
            },
          }),
        );
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2 rounded-2xl border border-indigo-400/10 bg-linear-to-br from-white/6 via-white/3 to-violet-500/5 px-5 pt-3.5 pb-3 shadow-[0_12px_45px_rgba(15,23,42,0.24)] sm:px-8">
        <div className="flex w-[80%] gap-2 pr-2 ">
          {agents.map((agent) => {
            const isActive = selectedAgent === agent.label;
            const Icon = agent.icon;
            return (
              <button
                key={agent.id}
                type="button"
                onClick={() => setSelectedAgent(agent.label)}
                className={`
      shrink-0
      inline-flex
      items-center
      gap-1.5
      px-3
      py-2
      rounded-full
      text-xs
      font-medium
      border
      transition-all
      ${
        isActive
          ? "bg-linear-to-r from-indigo-500 to-violet-600 text-white border-transparent shadow-[0_1px_8px_rgba(99,102,241,.35)]"
          : "bg-white/3 text-slate-400 border-white/6 hover:bg-white/7"
      }
    `}
              >
                <Icon size={14} className={isActive ? "text-white" : "text-slate-500"} />
                {agent.label}
              </button>
            );
          })}
        </div>
        {selectedFiles.length > 0 && (
          <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto pr-1">
            {selectedFiles.map((file, index) => {
              const preview = filePreviews.find((item) => item.file === file)?.url;
              return (
                <div key={`${file.name}-${file.lastModified}-${index}`} className="group relative flex max-w-48 items-center gap-2 rounded-xl border border-white/10 bg-[#171a24]/90 p-2 pr-7 shadow-sm">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-indigo-500/15 text-indigo-300">
                    {preview ? (
                      <img src={preview} alt="Selected upload" className="h-full w-full object-cover" />
                    ) : (
                      <FileText size={17} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-slate-200">{file.name}</p>
                    <p className="text-[10px] text-slate-500">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSelectedFile(index)}
                    className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-md text-slate-400 opacity-0 transition-all hover:bg-white/10 hover:text-white group-hover:opacity-100 focus:opacity-100"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
        <textarea
          placeholder="Ask Anything..."
          className="w-full bg-transparent outline-none resize-none text-[14px] text-slate-200 placeholder:text-slate-600 leading-relaxed scrollbar-none [&::-webkit-scrollbar]:hidden disabled:opacity-50"
          rows={3}
          onChange={(event) => setValue(event.target.value)}
          value={value}
          disabled={isSending}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSendMessage();
            }
          }}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">

            <input
              type="file"
              accept=".pdf,image/*"
              multiple
              hidden
              ref={fileRef}
              onChange={(event) => {
                const files = Array.from(event.target.files || []);
                setSelectedFiles((current) => [...current, ...files].slice(0, 10));
                event.target.value = "";
              }}
            />
            <button
              type="button"
              title="Upload PDFs or images"
              className="flex items-center justify-center w-8 h-8 rounded-lg text-indigo-300 hover:text-white hover:bg-indigo-500/15 border border-transparent hover:border-indigo-400/20 transition-all duration-150 bg-transparent cursor-pointer"
              onClick={() => fileRef.current?.click()}
            >
              <Paperclip size={20} />
            </button>

            <button
              type="button"
              title={isListening ? "Stop listening" : "Use voice input"}
              aria-pressed={isListening}
              onClick={toggleVoiceInput}
              className={`relative flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-150 cursor-pointer ${
                isListening
                  ? "border-rose-400/40 bg-rose-500/20 text-rose-300"
                  : "border-transparent text-slate-600 hover:border-white/6 hover:bg-white/5 hover:text-slate-400"
              }`}
            >
              {isListening && (
                <span className="absolute inset-0 rounded-lg bg-rose-400/30 animate-ping" />
              )}
              <Mic size={20} />
            </button>
          </div>

          <div>
            <button
              disabled={!value.trim() || isSending}
              onClick={handleSendMessage}
              className={`flex items-center justify-center w-8 h-8 rounded-lg border-none transition-all duration-150 ${
                value.trim()
                  ? "bg-linear-to-br from-indigo-500 to-violet-700 hover:opacity-90 text-white"
                  : "bg-white/5 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
        {(isListening || voiceError) && (
          <p className={`text-[11px] ${voiceError ? "text-rose-400" : "text-rose-300"}`}>
            {voiceError || "Listening… speak now"}
          </p>
        )}
      </div>
    </>
  );
}

export default ChatInput;
