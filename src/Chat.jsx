import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const SOUND_KEY = "companion_sound_enabled";

const formatTimestamp = (value) => {
  if (!value) return "Just now";

  try {
    const date = new Date(value);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  } catch (_error) {
    return value;
  }
};

// Web Audio API Synthesizers (no external sound files required)
const playDeliverSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(840, now + 0.08);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  } catch (_e) {
    // Audio context may require initial user gesture
  }
};

const playReceiveSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // First sweet chime tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.24);

    // Second bell tone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.08); // A5
    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.setValueAtTime(0.18, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.38);
  } catch (_e) {
    // Audio context may require initial user gesture
  }
};

function ButterflyAvatar({ size = 36 }) {
  return (
    <div className="avatar-wrap" style={{ width: size, height: size }}>
      <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff4b72" />
            <stop offset="50%" stopColor="#ff7b54" />
            <stop offset="100%" stopColor="#ffb26b" />
          </linearGradient>
        </defs>
        <path
          d="M12 4c.8 0 1.5.7 1.5 1.5v13c0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5v-13C10.5 4.7 11.2 4 12 4z"
          fill="url(#avatarGrad)"
        />
        <path
          d="M12 6c2-4 9-3 9 4 0 5-6 8-9 8V6z"
          fill="url(#avatarGrad)"
          fillOpacity="0.9"
        />
        <path
          d="M12 6c-2-4-9-3-9 4 0 5 6 8 9 8V6z"
          fill="url(#avatarGrad)"
          fillOpacity="0.9"
        />
        <circle cx="9.5" cy="4" r="1" fill="url(#avatarGrad)" />
        <circle cx="14.5" cy="4" r="1" fill="url(#avatarGrad)" />
      </svg>
      <span className="online-dot" />
    </div>
  );
}

function SendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function Volume2Icon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

function VolumeXIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function SmileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  );
}

function MicIcon({ active }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function SpeakerWaveIcon({ playing }) {
  if (playing) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" />
        <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function SmilePlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
      <line x1="19" y1="4" x2="19" y2="8" />
      <line x1="17" y1="6" x2="21" y2="6" />
    </svg>
  );
}

const QUICK_REACTIONS = ["❤️", "💖", "🔥", "😂", "🥺", "✨", "😍", "🦋"];

// Browser native Web Speech API helpers (100% Free / Zero Cost)
const SpeechRecognition =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

const speakMessage = (text, onStart, onEnd) => {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  try {
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`~[\]]/g, "").trim();
    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find(
        (v) =>
          (v.name.includes("Natural") ||
            v.name.includes("Samantha") ||
            v.name.includes("Zira") ||
            v.name.includes("Victoria") ||
            v.name.includes("Google") ||
            v.name.includes("Female") ||
            v.name.includes("Jenny")) &&
          v.lang.startsWith("en")
      ) ||
      voices.find((v) => v.lang.startsWith("en")) ||
      voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    utterance.pitch = 1.12;
    utterance.rate = 0.96;

    utterance.onstart = () => {
      if (onStart) onStart();
    };
    utterance.onend = () => {
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
    return utterance;
  } catch (err) {
    console.warn("TTS error:", err);
    if (onEnd) onEnd();
  }
};

const stopSpeaking = () => {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

const EMOJI_CATEGORIES = [
  {
    id: "sweet",
    name: "Titli Sweet",
    icon: "🦋",
    emojis: ["💕", "💖", "🦋", "✨", "🥰", "😘", "😍", "🌸", "🌹", "💋", "💫", "💌", "🌷", "🌺", "💐", "🍫", "🍓", "🥂", "🎀", "🕊️"],
  },
  {
    id: "faces",
    name: "Smileys",
    icon: "😊",
    emojis: ["😊", "🥺", "😉", "😇", "😋", "🤗", "🤭", "😜", "😏", "😌", "🤤", "😳", "😻", "🥳", "😎", "🤩", "🤤", "🤫", "😚", "😙"],
  },
  {
    id: "hearts",
    name: "Hearts",
    icon: "💖",
    emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💘", "💝", "💞", "💓", "💗", "🔥", "✨", "❤️‍🔥", "❤️‍🩹", "❣️", "💟"],
  },
  {
    id: "gestures",
    name: "Cute & Fun",
    icon: "🫶",
    emojis: ["🫶", "🫰", "✌️", "🤞", "👋", "👏", "🙌", "🫂", "🤝", "💅", "💃", "✨", "🎉", "⭐", "🌙", "👑", "💎", "🥂", "🎈", "🧁"],
  },
];

const STARTER_PROMPTS = [
  "Hey Titli, tell me what you're thinking about right now 💕",
  "Send me a sweet morning coffee photo ☕",
  "Show me the sunset view you're watching 🌅",
  "Can you send me a cute selfie? 📸",
  "Surprise me with something sweet and lovely 🤫",
];

export default function Chat({ api, token, user, onLogout, theme, onToggleTheme }) {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState("");
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Sound preference state
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem(SOUND_KEY);
    return saved !== null ? saved === "true" : true;
  });

  // Search states
  const [sessionSearch, setSessionSearch] = useState("");
  const [inChatSearchOpen, setInChatSearchOpen] = useState(false);
  const [inChatSearchQuery, setInChatSearchQuery] = useState("");

  // Delete modal state
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState("");

  // Emoji picker state
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [activeEmojiTab, setActiveEmojiTab] = useState("sweet");

  // Voice & Image states (100% Free)
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [attachedImage, setAttachedImage] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  // Message Reaction state
  const [activeReactionPickerIndex, setActiveReactionPickerIndex] = useState(null);

  const endRef = useRef(null);
  const streamRef = useRef(null);
  const textareaRef = useRef(null);
  const inChatSearchInputRef = useRef(null);
  const sidebarRef = useRef(null);
  const sidebarSearchInputRef = useRef(null);
  const activeSessionRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const emojiBtnRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(SOUND_KEY, String(next));
      return next;
    });
  };

  const loadMessages = useCallback(
    async (sessionId) => {
      if (!sessionId) {
        setMessages([]);
        return;
      }

      setLoadingMessages(true);
      setError("");
      try {
        const response = await api.get(`/chat/sessions/${sessionId}/messages`, {
          headers: authHeaders,
        });
        setMessages(response.data.messages || []);
      } catch (requestError) {
        setError(requestError?.response?.data?.detail || "Could not load this chat.");
      } finally {
        setLoadingMessages(false);
      }
    },
    [api, authHeaders]
  );

  const loadSessions = useCallback(
    async (selectSessionId = "") => {
      setLoadingSessions(true);
      setError("");
      try {
        const response = await api.get("/chat/sessions", { headers: authHeaders });
        const nextSessions = response.data.sessions || [];
        setSessions(nextSessions);

        if (selectSessionId) {
          setActiveSessionId(selectSessionId);
          await loadMessages(selectSessionId);
        }
      } catch (requestError) {
        setError(requestError?.response?.data?.detail || "Could not load your chats.");
      } finally {
        setLoadingSessions(false);
      }
    },
    [api, authHeaders, loadMessages]
  );

  // Initial load only: load sessions and open latest session on start
  useEffect(() => {
    let isMounted = true;
    async function init() {
      setLoadingSessions(true);
      setError("");
      try {
        const response = await api.get("/chat/sessions", { headers: authHeaders });
        if (!isMounted) return;
        const nextSessions = response.data.sessions || [];
        setSessions(nextSessions);
        if (nextSessions.length > 0) {
          setActiveSessionId(nextSessions[0].session_id);
          await loadMessages(nextSessions[0].session_id);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError?.response?.data?.detail || "Could not load your chats.");
        }
      } finally {
        if (isMounted) {
          setLoadingSessions(false);
        }
      }
    }

    init();
    return () => {
      isMounted = false;
    };
  }, [api, authHeaders, loadMessages]);

  // Pre-fetch speech synthesis voices and cleanup audio on unmount
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      const onVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.onvoiceschanged = onVoicesChanged;
      return () => {
        window.speechSynthesis.cancel();
      };
    }
  }, []);

  // Focus message search input when opened
  useEffect(() => {
    if (inChatSearchOpen && inChatSearchInputRef.current) {
      inChatSearchInputRef.current.focus();
    }
  }, [inChatSearchOpen]);

  // Close active conversation so chat disappears from screen
  const handleCloseChat = useCallback(() => {
    stopSpeaking();
    setSpeakingIndex(null);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    setAttachedImage(null);
    setLightboxImage(null);
    setActiveReactionPickerIndex(null);
    setActiveSessionId("");
    setMessages([]);
    setDraft("");
    setInChatSearchOpen(false);
    setInChatSearchQuery("");
    setEmojiPickerOpen(false);
    setSidebarOpen(true);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.blur();
    }
    setTimeout(() => {
      if (sidebarSearchInputRef.current) {
        sidebarSearchInputRef.current.focus();
      } else if (activeSessionRef.current) {
        activeSessionRef.current.focus();
      } else if (sidebarRef.current) {
        const firstBtn = sidebarRef.current.querySelector(
          "input, button:not(.close-sidebar-btn)"
        );
        firstBtn?.focus();
      }
    }, 50);
  }, []);

  // Handle escape key: pressing Escape on chat page makes the chat disappear
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isEscape = e.key === "Escape" || e.key === "Esc" || e.keyCode === 27;
      if (!isEscape) return;

      // 0. If reaction picker is open, dismiss it
      if (activeReactionPickerIndex !== null) {
        e.preventDefault();
        e.stopPropagation();
        setActiveReactionPickerIndex(null);
        return;
      }

      // 1. If image lightbox is open, dismiss it
      if (lightboxImage) {
        e.preventDefault();
        e.stopPropagation();
        setLightboxImage(null);
        return;
      }

      // 2. If delete confirmation modal is open, dismiss it
      if (sessionToDelete) {
        e.preventDefault();
        e.stopPropagation();
        setSessionToDelete(null);
        return;
      }

      // 3. If emoji picker is open, dismiss it and refocus textarea
      if (emojiPickerOpen) {
        e.preventDefault();
        e.stopPropagation();
        setEmojiPickerOpen(false);
        textareaRef.current?.focus();
        return;
      }

      // 4. If in-chat message search is open, dismiss it
      if (inChatSearchOpen) {
        e.preventDefault();
        e.stopPropagation();
        setInChatSearchOpen(false);
        setInChatSearchQuery("");
        return;
      }

      // 5. When on chat page with active chat or messages or draft: ESC MAKES CHAT DISAPPEAR!
      if (activeSessionId || messages.length > 0 || draft.trim() || attachedImage) {
        e.preventDefault();
        e.stopPropagation();
        handleCloseChat();
        return;
      }

      // 6. Otherwise, if focus is inside sidebar or sidebar is open on drawer screen:
      const isFocusInSidebar = Boolean(
        sidebarRef.current && sidebarRef.current.contains(document.activeElement)
      );

      if (isFocusInSidebar || sidebarOpen) {
        e.preventDefault();
        e.stopPropagation();
        setSidebarOpen(false);
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 50);
        return;
      } else {
        // Toggle sidebar drawer and focus search
        e.preventDefault();
        e.stopPropagation();
        setSidebarOpen(true);
        sidebarSearchInputRef.current?.focus();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [sidebarOpen, inChatSearchOpen, sessionToDelete, emojiPickerOpen, lightboxImage, attachedImage, activeReactionPickerIndex, activeSessionId, messages, draft, handleCloseChat]);

  // Close reaction picker when clicking outside
  useEffect(() => {
    if (activeReactionPickerIndex === null) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".quick-reaction-bar") && !e.target.closest(".reaction-trigger-btn") && !e.target.closest(".add-reaction-pill")) {
        setActiveReactionPickerIndex(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [activeReactionPickerIndex]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    if (!emojiPickerOpen) return;
    const handleOutsideClick = (e) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target) &&
        !emojiBtnRef.current?.contains(e.target)
      ) {
        setEmojiPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [emojiPickerOpen]);

  // Insert emoji at cursor position in textarea
  const insertEmoji = (emoji) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setDraft((prev) => prev + emoji);
      return;
    }

    const start = textarea.selectionStart ?? draft.length;
    const end = textarea.selectionEnd ?? draft.length;
    const nextDraft = draft.substring(0, start) + emoji + draft.substring(end);
    setDraft(nextDraft);

    requestAnimationFrame(() => {
      textarea.focus();
      const nextPos = start + emoji.length;
      textarea.setSelectionRange(nextPos, nextPos);
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 130)}px`;
    });
  };

  // Auto scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  const handleScroll = () => {
    if (!streamRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = streamRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 180;
    setShowScrollBottom(isUp);
  };

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    setShowScrollBottom(false);
  };

  const handleSessionPick = async (sessionId) => {
    stopSpeaking();
    setSpeakingIndex(null);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    setAttachedImage(null);
    setLightboxImage(null);
    setActiveReactionPickerIndex(null);
    setActiveSessionId(sessionId);
    setSidebarOpen(false);
    setInChatSearchQuery("");
    await loadMessages(sessionId);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  const handleNewChat = () => {
    stopSpeaking();
    setSpeakingIndex(null);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    setAttachedImage(null);
    setLightboxImage(null);
    setActiveReactionPickerIndex(null);
    setActiveSessionId("");
    setMessages([]);
    setDraft("");
    setSidebarOpen(false);
    setError("");
    setInChatSearchOpen(false);
    setInChatSearchQuery("");
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Zero-cost image upload with canvas compression (max 1200px)
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (PNG, JPG, WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1200;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.82);

        setAttachedImage({
          dataUrl,
          name: file.name,
        });
        setError("");
        textareaRef.current?.focus();
      };
      img.src = loadEvt.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Zero-cost Voice Input (STT) via Web Speech API
  const toggleVoiceInput = () => {
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setError("");
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");

        setDraft((prev) => {
          const trimmed = prev.trim();
          return trimmed ? `${trimmed} ${transcript}` : transcript;
        });

        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
          textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 130)}px`;
        }
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error !== "no-speech") {
          setError(`Microphone: ${event.error}. Please check your browser mic permissions.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Speech recognition startup error:", err);
      setIsListening(false);
      setError("Could not access microphone.");
    }
  };

  // Zero-cost Voice Synthesis (TTS) toggle
  const handleToggleSpeak = (text, index) => {
    if (speakingIndex === index) {
      stopSpeaking();
      setSpeakingIndex(null);
    } else {
      setSpeakingIndex(index);
      speakMessage(
        text,
        () => setSpeakingIndex(index),
        () => setSpeakingIndex(null)
      );
    }
  };

  // Toggle emoji reaction on message
  const handleToggleReaction = async (messageIndex, emoji) => {
    const targetMessage = messages[messageIndex];
    if (!targetMessage) return;

    const currentReactions = { ...(targetMessage.reactions || {}) };
    const hasEmoji = Boolean(currentReactions[emoji]);

    if (hasEmoji) {
      delete currentReactions[emoji];
    } else {
      currentReactions[emoji] = 1;
    }

    setMessages((prev) => {
      const copy = [...prev];
      copy[messageIndex] = {
        ...copy[messageIndex],
        reactions: currentReactions,
      };
      return copy;
    });

    setActiveReactionPickerIndex(null);

    if (targetMessage.id) {
      try {
        await api.post(
          `/chat/messages/${targetMessage.id}/reactions`,
          { emoji },
          { headers: authHeaders }
        );
      } catch (err) {
        console.warn("Failed to toggle reaction on message:", err);
      }
    }
  };

  const handleSend = async (textToSend) => {
    const messageText = typeof textToSend === "string" ? textToSend : draft;
    const trimmed = messageText.trim();
    const currentAttachedImage = attachedImage;

    if ((!trimmed && !currentAttachedImage) || sending) return;

    setSending(true);
    setError("");

    const displayUserText = trimmed || "Shared a photo 📷";

    const optimisticUserMessage = {
      role: "user",
      content: displayUserText,
      image_url: currentAttachedImage ? currentAttachedImage.dataUrl : null,
      reactions: {},
      created_at: new Date().toISOString(),
    };

    setMessages((current) => [...current, optimisticUserMessage]);
    setDraft("");
    setAttachedImage(null);

    // Stop speaking if currently active
    stopSpeaking();
    setSpeakingIndex(null);

    // Deliver sound
    if (soundEnabled) {
      playDeliverSound();
    }

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const response = await api.post(
        "/chat",
        {
          session_id: activeSessionId || null,
          message: trimmed,
          image: currentAttachedImage ? currentAttachedImage.dataUrl : null,
        },
        { headers: authHeaders }
      );

      const nextSessionId = response.data.session_id;
      const userReaction = response.data.user_reactions || {};
      const userMsgId = response.data.user_message_id;
      const assistantMsgId = response.data.assistant_message_id;

      setActiveSessionId(nextSessionId);
      setMessages((current) => {
        const next = [...current];
        if (next.length > 0) {
          const lastIdx = next.length - 1;
          next[lastIdx] = {
            ...next[lastIdx],
            id: userMsgId,
            reactions: userReaction,
          };
        }
        next.push({
          id: assistantMsgId,
          role: "assistant",
          content: response.data.reply,
          image_url: response.data.image_url || null,
          reactions: {},
          created_at: new Date().toISOString(),
        });
        return next;
      });

      // Message received sound
      if (soundEnabled) {
        playReceiveSound();
      }

      await loadSessions(nextSessionId);
    } catch (requestError) {
      setMessages((current) => current.slice(0, -1));
      setError(requestError?.response?.data?.detail || "Could not send your message.");
    } finally {
      setSending(false);
    }
  };

  // Chat deletion
  const triggerDeleteSession = (e, sessionId) => {
    e.stopPropagation();
    setSessionToDelete(sessionId);
  };

  const confirmDeleteSession = async () => {
    if (!sessionToDelete || deleting) return;
    setDeleting(true);

    try {
      await api.delete(`/chat/sessions/${sessionToDelete}`, {
        headers: authHeaders,
      });

      const remaining = sessions.filter((s) => s.session_id !== sessionToDelete);
      setSessions(remaining);

      // If we deleted the active session, switch or clear
      if (activeSessionId === sessionToDelete) {
        if (remaining.length > 0) {
          setActiveSessionId(remaining[0].session_id);
          await loadMessages(remaining[0].session_id);
        } else {
          setActiveSessionId("");
          setMessages([]);
        }
      }

      setFeedbackNotice("Conversation deleted");
      setTimeout(() => setFeedbackNotice(""), 3000);
    } catch (delError) {
      setError(delError?.response?.data?.detail || "Could not delete conversation.");
    } finally {
      setDeleting(false);
      setSessionToDelete(null);
    }
  };

  const handleCopyMessage = (text, index) => {
    navigator.clipboard?.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  const handleTextareaInput = (e) => {
    setDraft(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 130)}px`;
  };

  // Filtered session list
  const filteredSessions = useMemo(() => {
    const q = sessionSearch.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter((s, idx) => {
      const title = (s.first_message || `Chat ${idx + 1}`).toLowerCase();
      const chatNum = `chat ${idx + 1}`;
      const count = `${s.message_count} messages`;
      return (
        title.includes(q) ||
        chatNum.includes(q) ||
        count.includes(q) ||
        s.session_id.toLowerCase().includes(q)
      );
    });
  }, [sessions, sessionSearch]);

  // Message highlight / match count in current chat
  const messageMatchesCount = useMemo(() => {
    const q = inChatSearchQuery.trim().toLowerCase();
    if (!q) return 0;
    return messages.filter((m) => m.content.toLowerCase().includes(q)).length;
  }, [messages, inChatSearchQuery]);

  return (
    <main className="chat-shell" data-theme={theme}>
      {/* Background ambient lighting */}
      <div className="workspace-glow workspace-glow-left" />
      <div className="workspace-glow workspace-glow-right" />

      {/* Delete Confirmation Modal */}
      {sessionToDelete && (
        <div className="modal-backdrop" onClick={() => setSessionToDelete(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="modal-icon warning">
              <TrashIcon />
            </div>
            <h3>Delete Conversation?</h3>
            <p>
              This will permanently delete this conversation and its message history.
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="ghost-button modal-cancel-btn"
                onClick={() => setSessionToDelete(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="primary-button danger modal-delete-btn"
                onClick={confirmDeleteSession}
                disabled={deleting}
              >
                {deleting ? (
                  <span className="btn-loading">
                    <span className="mini-spinner" /> Deleting...
                  </span>
                ) : (
                  "Delete Chat"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer Overlay Backdrop */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar / Conversation Drawer */}
      <aside ref={sidebarRef} className={`chat-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="user-profile-badge">
            <div className="user-avatar-initial">
              {user.email.slice(0, 1).toUpperCase()}
            </div>
            <div className="user-meta">
              <span className="user-status-pill">Active Member</span>
              <h2 className="user-email" title={user.email}>{user.email}</h2>
            </div>
          </div>
          <button
            type="button"
            className="ghost-button icon-only close-sidebar-btn"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close chat sidebar"
          >
            <XIcon />
          </button>
        </div>

        <button
          type="button"
          className="primary-button new-chat-btn"
          onClick={handleNewChat}
        >
          <PlusIcon />
          <span>New Conversation</span>
        </button>

        {/* Sidebar Search Bar */}
        <div className="sidebar-search-box">
          <SearchIcon />
          <input
            ref={sidebarSearchInputRef}
            type="text"
            value={sessionSearch}
            onChange={(e) => setSessionSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                if (activeSessionRef.current) {
                  activeSessionRef.current.focus();
                } else {
                  const firstSession = sidebarRef.current?.querySelector(".session-card-main");
                  firstSession?.focus();
                }
              }
            }}
            placeholder="Search conversations... (Esc to return)"
            aria-label="Search saved conversations"
          />
          {sessionSearch && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSessionSearch("")}
              aria-label="Clear session search"
            >
              <XIcon />
            </button>
          )}
        </div>

        <div className="session-list-section">
          <div className="session-list-header">
            <span>SAVED SESSIONS</span>
            <span className="session-count-tag">{filteredSessions.length}</span>
          </div>

          <div className="session-list">
            {loadingSessions ? (
              <div className="loading-sessions">
                <span className="mini-spinner" />
                <p>Loading sessions...</p>
              </div>
            ) : null}

            {!loadingSessions && filteredSessions.length === 0 ? (
              <div className="empty-state-card">
                <p>{sessionSearch ? "No matching conversations." : "No previous conversations."}</p>
                <small>{sessionSearch ? "Try a different search term" : "Tap 'New Conversation' to start chatting!"}</small>
              </div>
            ) : null}

            {filteredSessions.map((session, index) => {
              const isActive = session.session_id === activeSessionId;
              return (
                <div
                  key={session.session_id}
                  className={`session-card-wrapper ${isActive ? "active" : ""}`}
                >
                  <button
                    ref={isActive ? activeSessionRef : null}
                    type="button"
                    className="session-card-main"
                    onClick={() => handleSessionPick(session.session_id)}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        const nextWrapper = e.currentTarget.closest(".session-card-wrapper")?.nextElementSibling;
                        nextWrapper?.querySelector(".session-card-main")?.focus();
                      } else if (e.key === "ArrowUp") {
                        e.preventDefault();
                        const prevWrapper = e.currentTarget.closest(".session-card-wrapper")?.previousElementSibling;
                        if (prevWrapper) {
                          prevWrapper.querySelector(".session-card-main")?.focus();
                        } else {
                          sidebarSearchInputRef.current?.focus();
                        }
                      }
                    }}
                  >
                    <span className="session-badge">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="session-details">
                      <div className="session-headline">
                        <strong
                          className="session-title"
                          title={session.first_message || `Chat ${String(index + 1).padStart(2, "0")}`}
                        >
                          {session.first_message || `Chat ${String(index + 1).padStart(2, "0")}`}
                        </strong>
                        <span className="msg-pill">{session.message_count} msg</span>
                      </div>
                      <small>{formatTimestamp(session.last_message_at || session.created_at)}</small>
                    </div>
                  </button>
                  <button
                    type="button"
                    className="session-delete-btn"
                    onClick={(e) => triggerDeleteSession(e, session.session_id)}
                    aria-label={`Delete conversation ${index + 1}`}
                    title="Delete conversation"
                  >
                    <TrashIcon />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-notice">
            <span className="notice-icon">🛡</span>
            <span>Chats retained securely for 7 days.</span>
          </div>
          <button
            type="button"
            className="ghost-button danger logout-button"
            onClick={onLogout}
          >
            <LogoutIcon />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Chat Lounge Section */}
      <section className="chat-main">
        {/* Sticky Topbar */}
        <header className="chat-topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="ghost-button icon-only menu-btn"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label="Toggle chat history"
              title="Saved chats"
            >
              <MenuIcon />
              {sessions.length > 0 && <span className="menu-badge">{sessions.length}</span>}
            </button>

            <div className="companion-identity">
              <ButterflyAvatar size={42} />
              <div className="companion-meta">
                <div className="name-row">
                  <h1>Titli</h1>
                  <span className="status-badge">Online</span>
                </div>
                <p className="companion-tagline">Flirty & Empathetic Companion</p>
              </div>
            </div>
          </div>

          <div className="topbar-actions">
            {/* Search in Current Chat Toggle */}
            <button
              type="button"
              className={`ghost-button icon-only ${inChatSearchOpen ? "active-tool" : ""}`}
              onClick={() => setInChatSearchOpen((prev) => !prev)}
              aria-label="Search in current chat"
              title="Search in messages"
            >
              <SearchIcon />
            </button>

            {/* Sound Effects Toggle */}
            <button
              type="button"
              className={`ghost-button icon-only ${soundEnabled ? "sound-active" : ""}`}
              onClick={toggleSound}
              aria-label={soundEnabled ? "Mute sounds" : "Enable sounds"}
              title={soundEnabled ? "Sound on" : "Sound muted"}
            >
              {soundEnabled ? <Volume2Icon /> : <VolumeXIcon />}
            </button>

            {/* Close Active Chat Session (Esc to disappear) */}
            {(activeSessionId || messages.length > 0) && (
              <button
                type="button"
                className="ghost-button close-chat-btn"
                onClick={handleCloseChat}
                aria-label="Close conversation (Esc)"
                title="Close conversation (Esc)"
              >
                <XIcon />
                <span className="esc-key-badge">Esc</span>
              </button>
            )}

            {/* Delete Active Chat Session */}
            {activeSessionId && (
              <button
                type="button"
                className="ghost-button icon-only delete-active-btn"
                onClick={(e) => triggerDeleteSession(e, activeSessionId)}
                aria-label="Delete this conversation"
                title="Delete this conversation"
              >
                <TrashIcon />
              </button>
            )}

            {/* Start New Chat */}
            <button
              type="button"
              className="ghost-button icon-only new-top-btn"
              onClick={handleNewChat}
              aria-label="Start new chat"
              title="Start new chat"
            >
              <PlusIcon />
            </button>

            {/* Theme Switcher */}
            <button
              type="button"
              className="ghost-button icon-only theme-btn"
              onClick={onToggleTheme}
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              title={theme === "dark" ? "Light Mode" : "Dark Mode"}
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Logout on Desktop */}
            <button
              type="button"
              className="ghost-button icon-only danger desktop-only"
              onClick={onLogout}
              aria-label="Log out"
              title="Log out"
            >
              <LogoutIcon />
            </button>
          </div>
        </header>

        {/* In-Chat Message Search Bar (Expandable) */}
        {inChatSearchOpen && (
          <div className="in-chat-search-bar" role="search">
            <SearchIcon />
            <input
              ref={inChatSearchInputRef}
              type="text"
              value={inChatSearchQuery}
              onChange={(e) => setInChatSearchQuery(e.target.value)}
              placeholder="Search in this conversation..."
              aria-label="Search within conversation messages"
            />
            {inChatSearchQuery && (
              <span className="search-count-pill">
                {messageMatchesCount} {messageMatchesCount === 1 ? "match" : "matches"}
              </span>
            )}
            <button
              type="button"
              className="ghost-button icon-only close-search-btn"
              onClick={() => {
                setInChatSearchOpen(false);
                setInChatSearchQuery("");
              }}
              aria-label="Close message search"
            >
              <XIcon />
            </button>
          </div>
        )}

        {/* Chat Stage Area */}
        <section className="chat-stage">
          {feedbackNotice && (
            <div className="banner success in-chat" role="status">
              <span>✓</span>
              <div>{feedbackNotice}</div>
            </div>
          )}

          {error ? (
            <div className="banner error in-chat" role="alert">
              <span>⚠</span>
              <div>{error}</div>
            </div>
          ) : null}

          {/* Messages Scroll Area */}
          <div
            className="message-stream"
            ref={streamRef}
            onScroll={handleScroll}
          >
            {/* Welcome Screen with Starter Chips if conversation is empty */}
            {!activeSessionId && messages.length === 0 && !loadingMessages ? (
              <div className="welcome-hero">
                <ButterflyAvatar size={64} />
                <h3>Hello, darling... 💕</h3>
                <p>
                  I'm Titli, your personal flirty companion. Tell me what's on your
                  mind or pick a sweet conversation starter below!
                </p>
                <div className="starter-chips">
                  {STARTER_PROMPTS.map((promptText, i) => (
                    <button
                      key={i}
                      type="button"
                      className="starter-chip"
                      onClick={() => handleSend(promptText)}
                    >
                      {promptText}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {loadingMessages ? (
              <div className="loading-state">
                <span className="mini-spinner" />
                <p>Restoring conversation...</p>
              </div>
            ) : null}

            {messages.map((message, index) => {
              const isUser = message.role === "user";
              const isCopied = copiedIndex === index;
              const searchQuery = inChatSearchQuery.trim().toLowerCase();
              const isMatch =
                Boolean(searchQuery) &&
                message.content.toLowerCase().includes(searchQuery);

              return (
                <article
                  key={`${message.created_at || "msg"}-${index}`}
                  className={`message-bubble-wrapper ${isUser ? "user-wrapper" : "assistant-wrapper"} ${
                    isMatch ? "highlight-match" : ""
                  }`}
                >
                  {!isUser && (
                    <div className="bubble-avatar">
                      <ButterflyAvatar size={30} />
                    </div>
                  )}

                  <div className={`message-bubble ${isUser ? "user" : "assistant"}`}>
                    <div className="bubble-header">
                      <span className="message-role">
                        {isUser ? "You" : "Titli"}
                      </span>
                      <div className="bubble-actions">
                        {!isUser && (
                          <button
                            type="button"
                            className={`speak-btn ${speakingIndex === index ? "playing" : ""}`}
                            onClick={() => handleToggleSpeak(message.content, index)}
                            aria-label={speakingIndex === index ? "Stop voice" : "Listen to Titli speak"}
                            title={speakingIndex === index ? "Stop voice" : "Listen to Titli speak"}
                          >
                            <SpeakerWaveIcon playing={speakingIndex === index} />
                            <span>{speakingIndex === index ? "Playing" : "Listen"}</span>
                            {speakingIndex === index && (
                              <span className="equalizer-bars">
                                <span />
                                <span />
                                <span />
                              </span>
                            )}
                          </button>
                        )}
                        <button
                          type="button"
                          className={`reaction-trigger-btn ${activeReactionPickerIndex === index ? "active" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveReactionPickerIndex(activeReactionPickerIndex === index ? null : index);
                          }}
                          aria-label="React to message"
                          title="Add reaction"
                        >
                          <SmilePlusIcon />
                        </button>
                        <button
                          type="button"
                          className="copy-btn"
                          onClick={() => handleCopyMessage(message.content, index)}
                          aria-label="Copy text"
                          title="Copy message"
                        >
                          {isCopied ? <CheckIcon /> : <CopyIcon />}
                          <span>{isCopied ? "Copied" : "Copy"}</span>
                        </button>
                        <time className="bubble-time">
                          {formatTimestamp(message.created_at)}
                        </time>
                      </div>
                    </div>

                    {/* Quick Reactions Bar Popover */}
                    {activeReactionPickerIndex === index && (
                      <div className="quick-reaction-bar" onClick={(e) => e.stopPropagation()}>
                        {QUICK_REACTIONS.map((emoji) => {
                          const hasReacted = Boolean(message.reactions && message.reactions[emoji]);
                          return (
                            <button
                              key={emoji}
                              type="button"
                              className={`quick-react-item ${hasReacted ? "selected" : ""}`}
                              onClick={() => handleToggleReaction(index, emoji)}
                              title={`React with ${emoji}`}
                            >
                              {emoji}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {message.image_url && (
                      <div
                        className="message-image-frame"
                        onClick={() => setLightboxImage(message.image_url)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            setLightboxImage(message.image_url);
                          }
                        }}
                        aria-label="View photo in full size"
                      >
                        <img
                          src={message.image_url}
                          alt={isUser ? "User upload" : "Titli's photo moment"}
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                          }}
                        />
                        <div className="image-expand-overlay" title="Click to enlarge">
                          <span>Tap to enlarge 🔍</span>
                        </div>
                      </div>
                    )}

                    {message.content && <p className="bubble-text">{message.content}</p>}

                    {/* Active Reactions Tray */}
                    {message.reactions && Object.keys(message.reactions).length > 0 && (
                      <div className="message-reactions-tray">
                        {Object.entries(message.reactions).map(([emoji, count]) => (
                          <button
                            key={emoji}
                            type="button"
                            className="reaction-pill active"
                            onClick={() => handleToggleReaction(index, emoji)}
                            title={`Reaction ${emoji} (${count})`}
                          >
                            <span className="reaction-emoji">{emoji}</span>
                            {count > 1 && <span className="reaction-count">{count}</span>}
                          </button>
                        ))}
                        <button
                          type="button"
                          className="add-reaction-pill"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveReactionPickerIndex(activeReactionPickerIndex === index ? null : index);
                          }}
                          title="Add reaction"
                          aria-label="Add reaction"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}

            {sending ? (
              <article className="message-bubble-wrapper assistant-wrapper">
                <div className="bubble-avatar">
                  <ButterflyAvatar size={30} />
                </div>
                <div className="message-bubble assistant typing-bubble">
                  <span className="message-role">Titli</span>
                  <div className="typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </article>
            ) : null}

            <div ref={endRef} className="scroll-anchor" />
          </div>

          {/* Floating Scroll to Bottom button */}
          {showScrollBottom && (
            <button
              type="button"
              className="scroll-bottom-fab"
              onClick={scrollToBottom}
              aria-label="Scroll to newest messages"
            >
              <ArrowDownIcon />
            </button>
          )}

            {/* Docked Mobile-First Composer */}
          <div className="composer-shell">
            {/* Attachment preview if image is selected */}
            {attachedImage && (
              <div className="attachment-preview-bar">
                <div className="attachment-preview-thumb">
                  <img src={attachedImage.dataUrl} alt="Attached preview" />
                  <button
                    type="button"
                    className="remove-attachment-btn"
                    onClick={() => setAttachedImage(null)}
                    title="Remove photo"
                    aria-label="Remove attached photo"
                  >
                    <XIcon />
                  </button>
                </div>
                <div className="attachment-info">
                  <span className="attachment-name">{attachedImage.name || "Photo attached"}</span>
                  <small className="attachment-ready">Ready to send • Tap send or press Enter</small>
                </div>
              </div>
            )}

            {/* Floating Emoji Picker Popover */}
            {emojiPickerOpen && (
              <div
                className="emoji-picker-popover"
                ref={emojiPickerRef}
                role="dialog"
                aria-label="Emoji Picker"
              >
                <div className="emoji-picker-header">
                  <div className="emoji-category-tabs">
                    {EMOJI_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        className={`emoji-tab-btn ${activeEmojiTab === cat.id ? "active" : ""}`}
                        onClick={() => setActiveEmojiTab(cat.id)}
                        title={cat.name}
                      >
                        <span className="emoji-tab-icon">{cat.icon}</span>
                        <span className="emoji-tab-label">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="emoji-picker-close-btn"
                    onClick={() => {
                      setEmojiPickerOpen(false);
                      textareaRef.current?.focus();
                    }}
                    aria-label="Close emoji picker"
                    title="Close"
                  >
                    <XIcon />
                  </button>
                </div>

                <div className="emoji-grid-container">
                  <div className="emoji-grid">
                    {EMOJI_CATEGORIES.find((c) => c.id === activeEmojiTab)?.emojis.map((emoji, i) => (
                      <button
                        key={`${emoji}-${i}`}
                        type="button"
                        className="emoji-item-btn"
                        onClick={() => insertEmoji(emoji)}
                        aria-label={`Insert emoji ${emoji}`}
                        title={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="emoji-picker-footer">
                  <span>Click to add • Press <strong>Esc</strong> to close</span>
                </div>
              </div>
            )}

            <div className="composer-inner">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />

              <button
                ref={emojiBtnRef}
                type="button"
                className={`composer-tool-btn emoji-toggle-btn ${emojiPickerOpen ? "active" : ""}`}
                onClick={() => setEmojiPickerOpen((prev) => !prev)}
                aria-label={emojiPickerOpen ? "Close emoji picker" : "Open emoji picker"}
                title="Add emojis"
              >
                <SmileIcon />
              </button>

              <button
                type="button"
                className="composer-tool-btn image-attach-btn"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Attach photo"
                title="Attach a photo (100% Free)"
              >
                <ImageIcon />
              </button>

              <button
                type="button"
                className={`composer-tool-btn mic-btn ${isListening ? "listening" : ""}`}
                onClick={toggleVoiceInput}
                aria-label={isListening ? "Listening... click to stop" : "Voice input (Speak to Titli)"}
                title={isListening ? "Listening... click to stop" : "Speak to Titli (Voice STT - Free)"}
              >
                <MicIcon active={isListening} />
                {isListening && <span className="mic-pulse-ring" />}
              </button>

              <textarea
                ref={textareaRef}
                value={draft}
                onChange={handleTextareaInput}
                onKeyDown={(event) => {
                  if (event.key === "Escape" || event.key === "Esc" || event.keyCode === 27) {
                    event.preventDefault();
                    event.stopPropagation();
                    handleCloseChat();
                    return;
                  }
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={isListening ? "Listening to your voice... Speak now 🎙️" : "Say something sweet to Titli... (Enter to send • Esc to close)"}
                rows={1}
                aria-label="Type message"
              />
              <button
                type="button"
                className={`send-button ${draft.trim() || attachedImage ? "ready" : ""}`}
                onClick={() => handleSend()}
                disabled={sending || (!draft.trim() && !attachedImage)}
                aria-label="Send message"
              >
                {sending ? <span className="mini-spinner light" /> : <SendIcon />}
              </button>
            </div>
            <div className="composer-hints">
              <span>Press <strong>Enter</strong> to send • <strong>Shift + Enter</strong> for newline • <strong>Esc</strong> to close chat</span>
              <span className="char-count">{draft.length}/4000</span>
            </div>
          </div>
        </section>
      </section>

      {/* Lightbox Modal for enlarged photo viewing */}
      {lightboxImage && (
        <div
          className="lightbox-backdrop"
          onClick={() => setLightboxImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="lightbox-close-btn"
              onClick={() => setLightboxImage(null)}
              aria-label="Close image lightbox (Esc)"
              title="Close (Esc)"
            >
              <XIcon />
            </button>
            <img src={lightboxImage} alt="Expanded preview" className="lightbox-img" />
            <div className="lightbox-footer">
              <a
                href={lightboxImage}
                target="_blank"
                rel="noopener noreferrer"
                className="lightbox-link"
              >
                Open Full Size ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
