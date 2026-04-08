import { useState } from "react";

interface Props {
  onJoin: (name: string, roomId: string) => void;
}

function randomRoomId() {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

function UnoLogo({ size = "lg" }: { size?: "sm" | "lg" }) {
  const textSize = size === "lg" ? "text-7xl" : "text-5xl";
  const padding = size === "lg" ? "px-10 py-4" : "px-7 py-2";
  return (
    <div className="relative inline-block">
      <div
        className={`relative bg-red-600 rounded-[38%] ${padding} -rotate-6 shadow-2xl shadow-red-950/80`}
        style={{ border: "4px solid rgba(255,255,255,0.15)" }}
      >
        <span
          className={`text-white font-black ${textSize} italic tracking-tight`}
          style={{ textShadow: "0 3px 0 rgba(0,0,0,0.4)" }}
        >
          UNO
        </span>
        {/* inner oval highlight */}
        <div className="absolute inset-[6px] rounded-[34%] border-2 border-white/20 pointer-events-none" />
      </div>
      {/* glow */}
      <div
        className={`absolute inset-0 bg-red-600 rounded-[38%] ${padding} -rotate-6 blur-2xl opacity-50 -z-10`}
      />
    </div>
  );
}

export function NameEntry({ onJoin }: Props) {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState(() => randomRoomId());

  const canJoin = name.trim().length > 0 && roomId.trim().length > 0;

  return (
    <div className="min-h-screen text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-15%] right-[-5%] w-[500px] h-[500px] bg-red-700/25 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[450px] h-[450px] bg-blue-700/25 rounded-full blur-3xl animate-float-medium" style={{ animationDelay: "2s" }} />
        <div className="absolute top-[35%] left-[15%] w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: "1s" }} />
        <div className="absolute top-[10%] right-[30%] w-56 h-56 bg-green-600/10 rounded-full blur-3xl animate-float-medium" style={{ animationDelay: "3s" }} />
      </div>

      <div className="w-full max-w-sm space-y-8 relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <UnoLogo size="lg" />
          <p className="text-white/40 text-sm tracking-widest uppercase">Multiplayer Card Game</p>
        </div>

        {/* Form card */}
        <div
          className="rounded-3xl p-6 space-y-5"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.10)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div>
            <label className="block text-xs text-white/50 uppercase tracking-widest mb-2">
              Your name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && canJoin && onJoin(name.trim(), roomId.trim())}
              placeholder="Enter your name"
              maxLength={20}
              autoFocus
              className="w-full rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.10)" }}
            />
          </div>

          <div>
            <label className="block text-xs text-white/50 uppercase tracking-widest mb-2">
              Room code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={roomId}
                onChange={(e) =>
                  setRoomId(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8))
                }
                onKeyDown={(e) => e.key === "Enter" && canJoin && onJoin(name.trim(), roomId.trim())}
                placeholder="XXXX"
                className="flex-1 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono tracking-widest text-center font-bold"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.10)" }}
              />
              <button
                onClick={() => setRoomId(randomRoomId())}
                className="px-4 py-3 rounded-xl text-white/60 hover:text-white text-sm transition-colors whitespace-nowrap"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.10)" }}
              >
                New
              </button>
            </div>
          </div>

          <button
            onClick={() => onJoin(name.trim(), roomId.trim())}
            disabled={!canJoin}
            className="w-full py-3.5 rounded-xl font-black text-lg tracking-wide transition-all"
            style={
              canJoin
                ? {
                    background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                    boxShadow: "0 4px 24px rgba(220, 38, 38, 0.5)",
                    color: "white",
                  }
                : {
                    background: "rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.25)",
                    cursor: "not-allowed",
                  }
            }
          >
            Join Game
          </button>
        </div>
      </div>
    </div>
  );
}
