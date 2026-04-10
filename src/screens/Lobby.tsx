import { useState } from "react";
import type { RosterEntry } from "../game/messages";

interface Props {
  myId: string | null;
  hostId: string | null;
  roster: RosterEntry[];
  roomId: string;
  onStartGame: () => void;
}

const AVATAR_COLORS = [
  { bg: "bg-red-500", text: "text-white" },
  { bg: "bg-blue-500", text: "text-white" },
  { bg: "bg-yellow-400", text: "text-gray-900" },
  { bg: "bg-green-500", text: "text-white" },
];

function UnoLogo() {
  return (
    <div className="relative inline-block">
      <div
        className="relative bg-red-600 rounded-[38%] px-7 py-2 -rotate-6 shadow-2xl shadow-red-950/80"
        style={{ border: "4px solid rgba(255,255,255,0.15)" }}
      >
        <span
          className="text-white font-black text-5xl italic tracking-tight"
          style={{ textShadow: "0 3px 0 rgba(0,0,0,0.4)" }}
        >
          UNO
        </span>
        <div className="absolute inset-[5px] rounded-[34%] border-2 border-white/20 pointer-events-none" />
      </div>
      <div className="absolute inset-0 bg-red-600 rounded-[38%] blur-2xl opacity-50 -z-10" />
    </div>
  );
}

export function Lobby({ myId, hostId, roster, roomId, onStartGame }: Props) {
  const [copied, setCopied] = useState(false);

  const isHost = myId !== null && myId === hostId;
  const canStart = roster.length >= 2;

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (myId === null) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <UnoLogo />
          <p className="text-white/40 text-sm tracking-widest animate-pulse">Connecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-15%] right-[-5%] w-[500px] h-[500px] bg-red-700/25 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[450px] h-[450px] bg-blue-700/25 rounded-full blur-3xl animate-float-medium" style={{ animationDelay: "2s" }} />
        <div className="absolute top-[35%] left-[15%] w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: "1s" }} />
        <div className="absolute top-[10%] right-[30%] w-56 h-56 bg-green-600/10 rounded-full blur-3xl animate-float-medium" style={{ animationDelay: "3s" }} />
      </div>

      <div className="w-full max-w-sm space-y-5 relative z-10">
        {/* Logo + subtitle */}
        <div className="flex flex-col items-center gap-2">
          <UnoLogo />
          <p className="text-white/40 text-xs tracking-widest uppercase">Lobby</p>
        </div>

        {/* Room code card */}
        <button
          onClick={copyRoomCode}
          className="w-full rounded-3xl p-5 text-center transition-all group active:scale-95"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(12px)",
          }}
        >
          <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Room Code</p>
          <p className="text-4xl font-mono font-black tracking-widest text-white">{roomId || "—"}</p>
          <p className="text-white/30 text-xs mt-1.5 group-hover:text-white/50 transition-colors">
            {copied ? "Copied to clipboard!" : "Tap to copy · Share with friends"}
          </p>
        </button>

        {/* Player list */}
        <div
          className="rounded-3xl p-5"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.10)",
            backdropFilter: "blur(12px)",
          }}
        >
          <p className="text-white/40 text-xs uppercase tracking-widest mb-3">
            Players ({roster.length})
          </p>
          <div className="space-y-2">
            {roster.length === 0 ? (
              <p className="text-white/25 text-sm py-2">Waiting for players...</p>
            ) : (
              roster.map((player, i) => {
                const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                return (
                  <div
                    key={player.id}
                    className="flex items-center gap-3 py-2 px-3 rounded-2xl"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  >
                    <div
                      className={`w-9 h-9 ${color.bg} ${color.text} rounded-full flex items-center justify-center text-sm font-black uppercase shrink-0 shadow-lg`}
                    >
                      {player.name[0]}
                    </div>
                    <span className="flex-1 font-semibold truncate">{player.name}</span>
                    <div className="flex gap-1.5 shrink-0">
                      {player.id === myId && (
                        <span
                          className="text-xs text-blue-300 px-2 py-0.5 rounded-full font-bold"
                          style={{ background: "rgba(59,130,246,0.2)", border: "1px solid rgba(59,130,246,0.3)" }}
                        >
                          You
                        </span>
                      )}
                      {player.id === hostId && (
                        <span
                          className="text-xs text-yellow-300 px-2 py-0.5 rounded-full font-bold"
                          style={{ background: "rgba(234,179,8,0.2)", border: "1px solid rgba(234,179,8,0.3)" }}
                        >
                          Host
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Action area */}
        {isHost ? (
          <div className="space-y-2">
            <button
              onClick={onStartGame}
              disabled={!canStart}
              className="w-full py-4 rounded-2xl font-black text-lg tracking-wide transition-all active:scale-95"
              style={
                canStart
                  ? {
                      background: "linear-gradient(135deg, #16a34a, #15803d)",
                      boxShadow: "0 4px 24px rgba(22, 163, 74, 0.5)",
                      color: "white",
                    }
                  : {
                      background: "rgba(255,255,255,0.06)",
                      color: "rgba(255,255,255,0.25)",
                      cursor: "not-allowed",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }
              }
            >
              Start Game
            </button>
            {!canStart && (
              <p className="text-center text-white/30 text-sm">
                Need at least 2 players to start
              </p>
            )}
          </div>
        ) : (
          <p className="text-center text-white/35 text-sm py-2 tracking-wide">
            Waiting for the host to start...
          </p>
        )}
      </div>
    </div>
  );
}
