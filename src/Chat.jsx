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
    <div className="avatar-wrap titli" style={{ width: size, height: size }}>
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

function BhanvraAvatar({ size = 36 }) {
  return (
    <div className="avatar-wrap bhanvra" style={{ width: size, height: size }}>
      <svg width={size * 0.72} height={size * 0.72} viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="bhanvraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        <ellipse cx="12" cy="13" rx="5" ry="7" fill="url(#bhanvraGrad)" />
        <line x1="8" y1="11" x2="16" y2="11" stroke="#0e1424" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="7.5" y1="14" x2="16.5" y2="14" stroke="#0e1424" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M10 10C8 6 3 6 4 11c.8 4 5 3 6-1z" fill="url(#bhanvraGrad)" fillOpacity="0.75" />
        <path d="M14 10c2-4 7-4 6 1-.8 4-5 3-6-1z" fill="url(#bhanvraGrad)" fillOpacity="0.75" />
        <circle cx="12" cy="6" r="2.8" fill="url(#bhanvraGrad)" />
        <path d="M10.8 4.2C10 2.8 8.5 2.5 8 2.6" stroke="url(#bhanvraGrad)" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M13.2 4.2C14 2.8 15.5 2.5 16 2.6" stroke="url(#bhanvraGrad)" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      <span className="online-dot" />
    </div>
  );
}

function CompanionAvatar({ companion = "titli", size = 36 }) {
  if (companion === "bhanvra") {
    return <BhanvraAvatar size={size} />;
  }
  return <ButterflyAvatar size={size} />;
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

function StarIcon({ filled = false, size = 15 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "#f59e0b" : "none"}
      stroke={filled ? "#f59e0b" : "currentColor"}
      strokeWidth={filled ? "1.2" : "2"}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function PaletteIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  );
}

function UploadIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function DownloadIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

const WALLPAPER_KEY = "companion_active_wallpaper";
const CUSTOM_WALLPAPER_DATA_KEY = "companion_custom_wallpaper_data";
const WALLPAPER_BLUR_KEY = "companion_wallpaper_blur";
const WALLPAPER_DIM_KEY = "companion_wallpaper_dim";

const WALLPAPER_PRESETS = [
  {
    id: "default",
    name: "Cyber Velvet",
    description: "Classic obsidian with glowing violet & ruby accents",
    preview: "linear-gradient(135deg, #0a0d14 0%, #1a162b 50%, #0f1420 100%)",
  },
  {
    id: "romantic-dusk",
    name: "Romantic Dusk",
    description: "Twilight sunset glow with plum, peach & rose quartz",
    preview: "linear-gradient(135deg, #2a1124 0%, #4a1942 50%, #1e1026 100%)",
  },
  {
    id: "dark-velvet",
    name: "Dark Velvet",
    description: "Ultra-dark luxury noir with subtle ruby velvet shadows",
    preview: "linear-gradient(135deg, #050608 0%, #1f0b12 50%, #0d060c 100%)",
  },
  {
    id: "glass-aurora",
    name: "Glass Aurora",
    description: "Cosmic emerald, teal & royal indigo with frost glow",
    preview: "linear-gradient(135deg, #061917 0%, #0a2540 50%, #131438 100%)",
  },
  {
    id: "midnight-starlight",
    name: "Midnight Starlight",
    description: "Deep celestial blue with sparkling starlight atmosphere",
    preview: "linear-gradient(135deg, #020b1e 0%, #0f172a 50%, #070e28 100%)",
  },
  {
    id: "rose-quartz",
    name: "Rose Quartz",
    description: "Gentle romantic blush, pastel blossoms & warm champagne",
    preview: "linear-gradient(135deg, #240e1b 0%, #3a1529 50%, #1f0f1c 100%)",
  },
];

const QUICK_REACTIONS = ["❤️", "💖", "🔥", "😂", "🥺", "✨", "😍", "🦋", "🌹", "🐝"];

// Browser native Web Speech API helpers (100% Free / Zero Cost)
const SpeechRecognition =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

const speakMessage = (text, onStart, onEnd, companion = "titli") => {
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

    let preferredVoice = null;
    if (companion === "bhanvra") {
      preferredVoice =
        voices.find(
          (v) =>
            (v.name.includes("David") ||
              v.name.includes("Mark") ||
              v.name.includes("Guy") ||
              v.name.includes("Male") ||
              v.name.includes("George") ||
              v.name.includes("James") ||
              v.name.includes("Alex")) &&
            v.lang.startsWith("en")
        ) ||
        voices.find((v) => v.lang.startsWith("en")) ||
        voices[0];
      utterance.pitch = 0.90;
      utterance.rate = 0.94;
    } else {
      preferredVoice =
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
      utterance.pitch = 1.15;
      utterance.rate = 0.96;
    }

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

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
    id: "titli",
    name: "Titli Sweet",
    icon: "🦋",
    emojis: ["💕", "💖", "🦋", "✨", "🥰", "😘", "😍", "🌸", "🌹", "💋", "💫", "💌", "🌷", "🌺", "💐", "🍫", "🍓", "🥂", "🎀", "🕊️"],
  },
  {
    id: "bhanvra",
    name: "Bhanvra Charm",
    icon: "🐝",
    emojis: ["🌹", "🔥", "👑", "🐝", "✨", "😉", "☕", "🖤", "🏎️", "🍷", "💎", "🌙", "⭐", "🫶", "🍾", "🌃", "🤝", "💪", "🕶️", "🦁"],
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
];

const TITLI_STARTERS = [
  "Hey Titli, tell me what you're thinking about right now 💕",
  "Send me a sweet morning coffee photo ☕",
  "Show me the sunset view you're watching 🌅",
  "Can you send me a cute selfie? 📸",
  "Surprise me with something sweet and lovely 🤫",
];

const BHANVRA_STARTERS = [
  "Hey Bhanvra, what are you doing right now? 🌹",
  "Can you send me a picture of your coffee or breakfast? ☕",
  "Send me a handsome selfie 😉📸",
  "Say something romantic that will make me blush 💕",
  "Take me on a late night drive with you 🚗✨",
];

export default function Chat({
  api,
  token,
  user,
  onLogout,
  theme,
  onToggleTheme,
  initialCompanion = "titli",
  onSwitchCompanion,
}) {
  const [activeCompanion, setActiveCompanion] = useState(initialCompanion || "titli");

  useEffect(() => {
    if (initialCompanion) {
      setActiveCompanion(initialCompanion);
    }
  }, [initialCompanion]);

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
  const [activeEmojiTab, setActiveEmojiTab] = useState(initialCompanion === "bhanvra" ? "bhanvra" : "titli");

  // Voice & Image states (100% Free)
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [attachedImage, setAttachedImage] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  // Message Reaction state
  const [activeReactionPickerIndex, setActiveReactionPickerIndex] = useState(null);

  // Custom Wallpaper state
  const [wallpaperTheme, setWallpaperTheme] = useState(() => {
    return localStorage.getItem(WALLPAPER_KEY) || "default";
  });
  const [customWallpaperData, setCustomWallpaperData] = useState(() => {
    return localStorage.getItem(CUSTOM_WALLPAPER_DATA_KEY) || "";
  });
  const [wallpaperBlur, setWallpaperBlur] = useState(() => {
    const saved = localStorage.getItem(WALLPAPER_BLUR_KEY);
    return saved !== null ? parseInt(saved, 10) : 4;
  });
  const [wallpaperDim, setWallpaperDim] = useState(() => {
    const saved = localStorage.getItem(WALLPAPER_DIM_KEY);
    return saved !== null ? parseInt(saved, 10) : 40;
  });
  const [wallpaperModalOpen, setWallpaperModalOpen] = useState(false);

  // Starred Moments state
  const [starredMessages, setStarredMessages] = useState([]);
  const [loadingStarred, setLoadingStarred] = useState(false);
  const [momentsModalOpen, setMomentsModalOpen] = useState(false);
  const [momentsFilter, setMomentsFilter] = useState("all");
  const [momentsSearch, setMomentsSearch] = useState("");
  const wallpaperInputRef = useRef(null);

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
        if (response.data.companion) {
          setActiveCompanion(response.data.companion);
        }
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

  // Initial load: find latest session matching companion or start fresh
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
        const match = nextSessions.find((s) => (s.companion || "titli") === (initialCompanion || "titli"));
        if (match) {
          setActiveSessionId(match.session_id);
          setActiveCompanion(match.companion || "titli");
          await loadMessages(match.session_id);
        } else {
          setActiveSessionId("");
          setMessages([]);
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
  }, [api, authHeaders, initialCompanion, loadMessages]);

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

      // If moments modal is open, dismiss it
      if (momentsModalOpen) {
        e.preventDefault();
        e.stopPropagation();
        setMomentsModalOpen(false);
        return;
      }

      // If wallpaper modal is open, dismiss it
      if (wallpaperModalOpen) {
        e.preventDefault();
        e.stopPropagation();
        setWallpaperModalOpen(false);
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
  }, [sidebarOpen, inChatSearchOpen, sessionToDelete, emojiPickerOpen, lightboxImage, attachedImage, activeReactionPickerIndex, activeSessionId, messages, draft, handleCloseChat, momentsModalOpen, wallpaperModalOpen]);

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

  const handleSessionPick = async (sessionId, companion) => {
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
    if (companion) {
      setActiveCompanion(companion);
    }
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
        () => setSpeakingIndex(null),
        activeCompanion
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

  // Fetch Starred Moments from Backend
  const fetchStarredMessages = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingStarred(true);
      const res = await api.get("/chat/starred", { headers: authHeaders });
      setStarredMessages(res.data.messages || []);
    } catch (err) {
      console.warn("Failed to fetch starred messages", err);
    } finally {
      setLoadingStarred(false);
    }
  }, [api, authHeaders, token]);

  useEffect(() => {
    fetchStarredMessages();
  }, [fetchStarredMessages]);

  const handleToggleStar = async (messageIndex, targetMessage) => {
    const currentStarred = Boolean(targetMessage.is_starred);
    const nextStarred = !currentStarred;

    // Optimistically update current chat stream
    setMessages((prev) => {
      const copy = [...prev];
      if (copy[messageIndex]) {
        copy[messageIndex] = {
          ...copy[messageIndex],
          is_starred: nextStarred,
        };
      }
      return copy;
    });

    if (targetMessage.id) {
      try {
        await api.post(
          `/chat/messages/${targetMessage.id}/star`,
          {},
          { headers: authHeaders }
        );
        fetchStarredMessages();
        setFeedbackNotice(nextStarred ? "Saved to Moments ⭐" : "Removed from Moments");
        setTimeout(() => setFeedbackNotice(""), 2000);
      } catch (err) {
        console.warn("Failed to toggle star:", err);
        // Revert on failure
        setMessages((prev) => {
          const copy = [...prev];
          if (copy[messageIndex]) {
            copy[messageIndex] = {
              ...copy[messageIndex],
              is_starred: currentStarred,
            };
          }
          return copy;
        });
      }
    }
  };

  const handleUnstarFromModal = async (messageId) => {
    setStarredMessages((prev) => prev.filter((m) => m.id !== messageId));
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, is_starred: false } : m))
    );

    try {
      await api.post(`/chat/messages/${messageId}/star`, {}, { headers: authHeaders });
      fetchStarredMessages();
    } catch (err) {
      console.warn("Failed to unstar from modal:", err);
      fetchStarredMessages();
    }
  };

  const handleJumpToSession = (sessionId) => {
    if (sessionId) {
      setActiveSessionId(sessionId);
      loadMessages(sessionId);
      setMomentsModalOpen(false);
    }
  };

  const handleExportMoments = () => {
    if (starredMessages.length === 0) return;
    const lines = [
      "# Milan Companion Lounge — Saved Moments ⭐",
      `Exported: ${new Date().toLocaleString()}`,
      `Total Saved Moments: ${starredMessages.length}`,
      "",
      "---",
      "",
    ];

    starredMessages.forEach((msg, idx) => {
      const comp = msg.companion === "bhanvra" ? "Bhanvra 🐝" : "Titli 🦋";
      const speaker = msg.role === "user" ? "You" : comp;
      lines.push(`### Moment #${idx + 1} • ${speaker} (${formatTimestamp(msg.created_at)})`);
      lines.push(`> "${msg.content}"`);
      if (msg.image_url) {
        lines.push(`\nPhoto: ${msg.image_url}`);
      }
      lines.push("");
      lines.push("---");
      lines.push("");
    });

    const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `milan_companion_moments_${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredMoments = useMemo(() => {
    let list = starredMessages;
    if (momentsFilter === "titli") {
      list = list.filter((m) => m.companion !== "bhanvra");
    } else if (momentsFilter === "bhanvra") {
      list = list.filter((m) => m.companion === "bhanvra");
    }
    if (momentsSearch.trim()) {
      const q = momentsSearch.trim().toLowerCase();
      list = list.filter((m) => m.content && m.content.toLowerCase().includes(q));
    }
    return list;
  }, [starredMessages, momentsFilter, momentsSearch]);

  const handleSelectPresetWallpaper = (presetId) => {
    setWallpaperTheme(presetId);
    try {
      localStorage.setItem(WALLPAPER_KEY, presetId);
    } catch (_e) {}
  };

  const handleWallpaperUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPG, PNG, WebP).");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Image size should be under 8MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setCustomWallpaperData(dataUrl);
      setWallpaperTheme("custom");
      try {
        localStorage.setItem(CUSTOM_WALLPAPER_DATA_KEY, dataUrl);
        localStorage.setItem(WALLPAPER_KEY, "custom");
      } catch (storageErr) {
        console.warn("Could not persist wallpaper dataUrl:", storageErr);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomWallpaper = () => {
    setCustomWallpaperData("");
    setWallpaperTheme("default");
    try {
      localStorage.removeItem(CUSTOM_WALLPAPER_DATA_KEY);
      localStorage.setItem(WALLPAPER_KEY, "default");
    } catch (_e) {}
  };

  const handleChangeBlur = (val) => {
    setWallpaperBlur(val);
    try {
      localStorage.setItem(WALLPAPER_BLUR_KEY, String(val));
    } catch (_e) {}
  };

  const handleChangeDim = (val) => {
    setWallpaperDim(val);
    try {
      localStorage.setItem(WALLPAPER_DIM_KEY, String(val));
    } catch (_e) {}
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
          companion: activeCompanion,
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
      if (response.data.companion) {
        setActiveCompanion(response.data.companion);
      }
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
              const sessionComp = session.companion || "titli";
              return (
                <div
                  key={session.session_id}
                  className={`session-card-wrapper ${isActive ? "active" : ""} ${sessionComp === "bhanvra" ? "bhanvra-card" : ""}`}
                >
                  <button
                    ref={isActive ? activeSessionRef : null}
                    type="button"
                    className="session-card-main"
                    onClick={() => handleSessionPick(session.session_id, sessionComp)}
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
                      {sessionComp === "bhanvra" ? "🐝" : "🦋"}
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
                      <div className="session-subline">
                        <small>{formatTimestamp(session.last_message_at || session.created_at)}</small>
                        <span className={`companion-session-tag ${sessionComp === "bhanvra" ? "bhanvra" : "titli"}`}>
                          {sessionComp === "bhanvra" ? "Bhanvra" : "Titli"}
                        </span>
                      </div>
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
              <CompanionAvatar companion={activeCompanion} size={42} />
              <div className="companion-meta">
                <div className="name-row">
                  <h1>{activeCompanion === "bhanvra" ? "Bhanvra" : "Titli"}</h1>
                  <span className={`status-badge ${activeCompanion === "bhanvra" ? "bhanvra" : ""}`}>Online</span>
                </div>
                <p className="companion-tagline">
                  {activeCompanion === "bhanvra"
                    ? "Dashing & Charming Gentleman"
                    : "Flirty & Empathetic Companion"}
                </p>
              </div>
            </div>
          </div>

          <div className="topbar-actions">
            {/* Switch Companion Button */}
            <button
              type="button"
              className={`companion-switch-topbar-btn ${activeCompanion === "bhanvra" ? "bhanvra" : "titli"}`}
              onClick={onSwitchCompanion || (() => setActiveCompanion((c) => (c === "bhanvra" ? "titli" : "bhanvra")))}
              aria-label={`Switch companion. Currently chatting with ${activeCompanion === "bhanvra" ? "Bhanvra" : "Titli"}`}
              title="Switch companion or enter lounge lobby"
            >
              <span className="switch-icon">{activeCompanion === "bhanvra" ? "🦋" : "🐝"}</span>
              <span className="switch-text desktop-switch-text">Switch to {activeCompanion === "bhanvra" ? "Titli" : "Bhanvra"}</span>
              <span className="switch-text mobile-switch-text">Switch</span>
            </button>

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

            {/* Saved Moments / Starred Messages */}
            <button
              type="button"
              className={`ghost-button icon-only moments-btn ${starredMessages.length > 0 ? "has-starred" : ""}`}
              onClick={() => {
                fetchStarredMessages();
                setMomentsModalOpen(true);
              }}
              aria-label="Saved Moments"
              title={`Saved Moments (${starredMessages.length} starred)`}
            >
              <StarIcon filled={starredMessages.length > 0} size={18} />
              {starredMessages.length > 0 && (
                <span className="moments-badge">{starredMessages.length}</span>
              )}
            </button>

            {/* Chat Wallpaper & Ambience */}
            <button
              type="button"
              className={`ghost-button icon-only wallpaper-btn ${wallpaperTheme !== "default" ? "customized" : ""}`}
              onClick={() => setWallpaperModalOpen(true)}
              aria-label="Wallpaper & Ambience"
              title="Chat Wallpaper & Ambience"
            >
              <PaletteIcon size={18} />
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
        <section className={`chat-stage stage-wallpaper-${wallpaperTheme}`}>
          {/* Ambient / Custom Wallpaper Layer */}
          <div
            className={`chat-wallpaper-layer wallpaper-${wallpaperTheme}`}
            style={
              wallpaperTheme === "custom" && customWallpaperData
                ? {
                    backgroundImage: `url(${customWallpaperData})`,
                    filter: `blur(${wallpaperBlur}px)`,
                    transform: "scale(1.08)",
                  }
                : undefined
            }
          />
          {wallpaperTheme === "custom" && customWallpaperData && (
            <div
              className="chat-wallpaper-dim-overlay"
              style={{ opacity: wallpaperDim / 100 }}
            />
          )}

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
              <div className={`welcome-hero ${activeCompanion === "bhanvra" ? "bhanvra" : "titli"}`}>
                <CompanionAvatar companion={activeCompanion} size={64} />
                <h3>{activeCompanion === "bhanvra" ? "Hello, gorgeous... 🌹" : "Hello, darling... 💕"}</h3>
                <p>
                  {activeCompanion === "bhanvra"
                    ? "I'm Bhanvra, your devoted companion. Tell me about your day, let me pamper you, or pick a starter below!"
                    : "I'm Titli, your personal flirty companion. Tell me what's on your mind or pick a sweet conversation starter below!"}
                </p>
                <div className="starter-chips">
                  {(activeCompanion === "bhanvra" ? BHANVRA_STARTERS : TITLI_STARTERS).map((promptText, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`starter-chip ${activeCompanion === "bhanvra" ? "bhanvra" : ""}`}
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
                      <CompanionAvatar companion={activeCompanion} size={30} />
                    </div>
                  )}

                  <div className={`message-bubble ${isUser ? "user" : "assistant"} ${!isUser && activeCompanion === "bhanvra" ? "bhanvra-bubble" : ""}`}>
                    <div className="bubble-header">
                      <span className="message-role">
                        {isUser ? "You" : activeCompanion === "bhanvra" ? "Bhanvra" : "Titli"}
                      </span>
                      <div className="bubble-actions">
                        {!isUser && (
                          <button
                            type="button"
                            className={`speak-btn ${speakingIndex === index ? "playing" : ""} ${activeCompanion === "bhanvra" ? "bhanvra" : ""}`}
                            onClick={() => handleToggleSpeak(message.content, index)}
                            aria-label={speakingIndex === index ? "Stop voice" : `Listen to ${activeCompanion === "bhanvra" ? "Bhanvra" : "Titli"} speak`}
                            title={speakingIndex === index ? "Stop voice" : `Listen to ${activeCompanion === "bhanvra" ? "Bhanvra" : "Titli"} speak`}
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
                        <button
                          type="button"
                          className={`star-btn ${message.is_starred ? "starred" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStar(index, message);
                          }}
                          aria-label={message.is_starred ? "Remove from Moments" : "Save to Moments"}
                          title={message.is_starred ? "Starred in Moments" : "Save to Moments (Star)"}
                        >
                          <StarIcon filled={Boolean(message.is_starred)} size={13} />
                          <span className="star-btn-label">{message.is_starred ? "Saved" : "Star"}</span>
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
                          alt={isUser ? "User upload" : activeCompanion === "bhanvra" ? "Bhanvra's photo moment" : "Titli's photo moment"}
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
                  <CompanionAvatar companion={activeCompanion} size={30} />
                </div>
                <div className={`message-bubble assistant typing-bubble ${activeCompanion === "bhanvra" ? "bhanvra-bubble" : ""}`}>
                  <span className="message-role">{activeCompanion === "bhanvra" ? "Bhanvra" : "Titli"}</span>
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
                aria-label={isListening ? "Listening... click to stop" : `Voice input (Speak to ${activeCompanion === "bhanvra" ? "Bhanvra" : "Titli"})`}
                title={isListening ? "Listening... click to stop" : `Speak to ${activeCompanion === "bhanvra" ? "Bhanvra" : "Titli"} (Voice STT - Free)`}
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
                placeholder={isListening ? "Listening to your voice... Speak now 🎙️" : `Say something sweet to ${activeCompanion === "bhanvra" ? "Bhanvra" : "Titli"}... (Enter to send • Esc to close)`}
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
      {/* Saved Moments / Starred Messages Modal */}
      {momentsModalOpen && (
        <div className="modal-backdrop" onClick={() => setMomentsModalOpen(false)}>
          <div
            className="modal-card wide-modal moments-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="moments-modal-title"
          >
            <div className="wide-modal-header">
              <div className="wide-modal-title-wrap">
                <div className="modal-icon-badge star-badge">
                  <StarIcon filled size={20} />
                </div>
                <div>
                  <h3 id="moments-modal-title">Saved Moments</h3>
                  <p className="modal-subtitle">
                    Your starred memories & special quotes ({filteredMoments.length})
                  </p>
                </div>
              </div>
              <div className="wide-modal-header-actions">
                {starredMessages.length > 0 && (
                  <button
                    type="button"
                    className="ghost-button icon-text-btn export-btn"
                    onClick={handleExportMoments}
                    title="Export moments as Markdown"
                  >
                    <DownloadIcon size={15} />
                    <span>Export</span>
                  </button>
                )}
                <button
                  type="button"
                  className="ghost-button icon-only modal-close-btn"
                  onClick={() => setMomentsModalOpen(false)}
                  aria-label="Close modal"
                >
                  <XIcon />
                </button>
              </div>
            </div>

            {/* Filter and Search Controls */}
            <div className="moments-controls-bar">
              <div className="moments-search-box">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search in saved moments..."
                  value={momentsSearch}
                  onChange={(e) => setMomentsSearch(e.target.value)}
                  aria-label="Search saved moments"
                />
                {momentsSearch && (
                  <button
                    type="button"
                    className="clear-search-mini"
                    onClick={() => setMomentsSearch("")}
                  >
                    <XIcon />
                  </button>
                )}
              </div>
              <div className="moments-filter-pills">
                <button
                  type="button"
                  className={`filter-pill ${momentsFilter === "all" ? "active" : ""}`}
                  onClick={() => setMomentsFilter("all")}
                >
                  All ({starredMessages.length})
                </button>
                <button
                  type="button"
                  className={`filter-pill ${momentsFilter === "titli" ? "active" : ""}`}
                  onClick={() => setMomentsFilter("titli")}
                >
                  🦋 Titli ({starredMessages.filter((m) => m.companion !== "bhanvra").length})
                </button>
                <button
                  type="button"
                  className={`filter-pill ${momentsFilter === "bhanvra" ? "active" : ""}`}
                  onClick={() => setMomentsFilter("bhanvra")}
                >
                  🐝 Bhanvra ({starredMessages.filter((m) => m.companion === "bhanvra").length})
                </button>
              </div>
            </div>

            {/* Moments List */}
            <div className="moments-list-scroll">
              {loadingStarred ? (
                <div className="moments-loading-state">
                  <span className="mini-spinner" />
                  <p>Loading your saved moments...</p>
                </div>
              ) : filteredMoments.length === 0 ? (
                <div className="moments-empty-state">
                  <div className="moments-empty-icon">
                    <StarIcon size={32} />
                  </div>
                  <h4>No saved moments {momentsSearch ? "matching your search" : "yet"}</h4>
                  <p>
                    {momentsSearch
                      ? "Try searching for a different keyword."
                      : "Tap the ⭐ Star button on any message during chat to save your favorite lines here forever!"}
                  </p>
                </div>
              ) : (
                filteredMoments.map((moment) => {
                  const isUser = moment.role === "user";
                  const comp = moment.companion === "bhanvra" ? "bhanvra" : "titli";
                  const speakerName = isUser
                    ? "You"
                    : comp === "bhanvra"
                    ? "Bhanvra"
                    : "Titli";

                  return (
                    <article key={moment.id} className={`moment-card ${comp}`}>
                      <div className="moment-card-header">
                        <div className="moment-author">
                          <CompanionAvatar companion={isUser ? "user" : comp} size={28} />
                          <div className="moment-author-info">
                            <span className="moment-speaker">{speakerName}</span>
                            <time className="moment-time">
                              {formatTimestamp(moment.created_at)}
                            </time>
                          </div>
                        </div>
                        <div className="moment-card-actions">
                          <button
                            type="button"
                            className="moment-action-btn"
                            onClick={() => handleCopyMessage(moment.content, `moment-${moment.id}`)}
                            title="Copy quote"
                            aria-label="Copy quote"
                          >
                            <CopyIcon />
                          </button>
                          {moment.session_id && (
                            <button
                              type="button"
                              className="moment-action-btn jump-btn"
                              onClick={() => handleJumpToSession(moment.session_id)}
                              title="Jump to this chat"
                              aria-label="Jump to this chat"
                            >
                              Jump ↗
                            </button>
                          )}
                          <button
                            type="button"
                            className="moment-action-btn unstar-btn"
                            onClick={() => handleUnstarFromModal(moment.id)}
                            title="Remove from saved moments"
                            aria-label="Remove from saved moments"
                          >
                            <StarIcon filled size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="moment-quote-body">
                        <p>{moment.content}</p>
                      </div>

                      {moment.image_url && (
                        <div
                          className="moment-image-preview"
                          onClick={() => setLightboxImage(moment.image_url)}
                          title="Click to view full photo"
                        >
                          <img src={moment.image_url} alt="Saved moment attachment" loading="lazy" />
                          <span className="moment-photo-tag">📷 Photo Moment</span>
                        </div>
                      )}
                    </article>
                  );
                })
              )}
            </div>

            <div className="wide-modal-footer">
              <span className="modal-footer-hint">
                💡 Starred messages are permanently protected from automated retention cleanup.
              </span>
              <button
                type="button"
                className="ghost-button modal-done-btn"
                onClick={() => setMomentsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wallpaper & Ambience Modal */}
      {wallpaperModalOpen && (
        <div className="modal-backdrop" onClick={() => setWallpaperModalOpen(false)}>
          <div
            className="modal-card wide-modal wallpaper-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="wallpaper-modal-title"
          >
            <div className="wide-modal-header">
              <div className="wide-modal-title-wrap">
                <div className="modal-icon-badge palette-badge">
                  <PaletteIcon size={20} />
                </div>
                <div>
                  <h3 id="wallpaper-modal-title">Chat Wallpaper & Ambience</h3>
                  <p className="modal-subtitle">
                    Select a luxury ambient theme or upload your custom background
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="ghost-button icon-only modal-close-btn"
                onClick={() => setWallpaperModalOpen(false)}
                aria-label="Close modal"
              >
                <XIcon />
              </button>
            </div>

            <div className="wallpaper-content-scroll">
              {/* Presets Grid */}
              <div className="wallpaper-section-title">
                <span>Preset Atmosphere Themes</span>
              </div>
              <div className="wallpaper-presets-grid">
                {WALLPAPER_PRESETS.map((preset) => {
                  const isActive = wallpaperTheme === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      className={`wallpaper-preset-card ${isActive ? "active" : ""}`}
                      onClick={() => handleSelectPresetWallpaper(preset.id)}
                    >
                      <div
                        className="preset-preview-thumb"
                        style={{ background: preset.preview }}
                      >
                        {isActive && (
                          <span className="preset-active-check">
                            <CheckIcon />
                          </span>
                        )}
                      </div>
                      <div className="preset-card-meta">
                        <span className="preset-name">{preset.name}</span>
                        <span className="preset-desc">{preset.description}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Upload Section */}
              <div className="wallpaper-section-title">
                <span>Custom Uploaded Wallpaper</span>
              </div>
              <div className="custom-wallpaper-panel">
                <input
                  type="file"
                  ref={wallpaperInputRef}
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleWallpaperUpload}
                />
                {customWallpaperData ? (
                  <div className="custom-wallpaper-active-box">
                    <div className="custom-preview-thumbnail">
                      <img src={customWallpaperData} alt="Custom wallpaper" />
                      <button
                        type="button"
                        className="remove-wallpaper-btn"
                        onClick={handleRemoveCustomWallpaper}
                        title="Remove custom wallpaper"
                      >
                        <TrashIcon /> Remove
                      </button>
                    </div>

                    <div className="wallpaper-sliders-wrap">
                      <div className="slider-group">
                        <div className="slider-label-row">
                          <label htmlFor="blur-slider">Background Blur</label>
                          <span className="slider-val">{wallpaperBlur}px</span>
                        </div>
                        <input
                          id="blur-slider"
                          type="range"
                          min="0"
                          max="20"
                          step="1"
                          value={wallpaperBlur}
                          onChange={(e) => handleChangeBlur(Number(e.target.value))}
                          className="range-input"
                        />
                        <span className="slider-hint">Softens the image so message bubbles stay legible</span>
                      </div>

                      <div className="slider-group">
                        <div className="slider-label-row">
                          <label htmlFor="dim-slider">Dark Overlay Dimming</label>
                          <span className="slider-val">{wallpaperDim}%</span>
                        </div>
                        <input
                          id="dim-slider"
                          type="range"
                          min="10"
                          max="85"
                          step="5"
                          value={wallpaperDim}
                          onChange={(e) => handleChangeDim(Number(e.target.value))}
                          className="range-input"
                        />
                        <span className="slider-hint">Controls contrast so chat text is crystal clear</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="custom-upload-dropzone"
                    onClick={() => wallpaperInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && wallpaperInputRef.current?.click()}
                  >
                    <UploadIcon size={28} />
                    <div className="dropzone-text">
                      <strong>Click to upload an image</strong>
                      <span>JPG, PNG, WebP up to 8MB • Instantly applied with blur & dim controls</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="wide-modal-footer">
              <span className="modal-footer-hint">
                ✨ Wallpapers are saved locally on your device for instant loading.
              </span>
              <button
                type="button"
                className="primary-button modal-done-btn"
                onClick={() => setWallpaperModalOpen(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
