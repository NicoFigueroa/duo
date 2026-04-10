import { useState } from "react";
import type { Card, Color, GameState } from "../game/types";
import {
  canPlayCard,
  effectiveTopColor,
  topCard,
} from "../game/rules";

interface Props {
  gameState: GameState;
  myId: string;
  onPlayCard: (cardId: string, chosenColor?: Color) => void;
  onDrawCard: () => void;
}

// --- Card helpers ---

const COLOR_BG: Record<string, string> = {
  red: "bg-red-500",
  blue: "bg-blue-600",
  green: "bg-green-500",
  yellow: "bg-yellow-400",
  wild: "bg-gray-900",
};

const COLOR_BORDER: Record<string, string> = {
  red: "border-red-400",
  blue: "border-blue-400",
  green: "border-green-400",
  yellow: "border-yellow-300",
  wild: "border-purple-500",
};

const COLOR_TEXT: Record<string, string> = {
  red: "text-white",
  blue: "text-white",
  green: "text-white",
  yellow: "text-gray-900",
  wild: "text-white",
};

const COLOR_GLOW: Record<string, string> = {
  red: "rgba(239,68,68,0.5)",
  blue: "rgba(37,99,235,0.5)",
  green: "rgba(34,197,94,0.5)",
  yellow: "rgba(234,179,8,0.5)",
  wild: "rgba(168,85,247,0.5)",
};

const WILD_GRADIENT =
  "linear-gradient(135deg, #7e22ce 0%, #1e40af 50%, #065f46 100%)";

function cardLabel(card: Card): string {
  if (typeof card.value === "number") return String(card.value);
  switch (card.value) {
    case "skip": return "⊘";
    case "reverse": return "↺";
    case "draw2": return "+2";
    case "wild": return "W";
    case "wild-draw4": return "+4";
  }
}

// A single UNO card
function UnoCard({
  card,
  playable,
  isMyTurn,
  size = "normal",
  onClick,
}: {
  card: Card;
  playable?: boolean;
  isMyTurn?: boolean;
  size?: "normal" | "large" | "small";
  onClick?: () => void;
}) {
  const color = card.color;
  const label = cardLabel(card);
  const isWild = color === "wild";

  const sizeClasses = {
    small: "w-10 h-14 text-lg",
    normal: "w-16 h-24 text-2xl",
    large: "w-24 h-36 text-4xl",
  };

  const cornerSize = {
    small: "text-[8px]",
    normal: "text-[10px]",
    large: "text-xs",
  };

  const interactive = isMyTurn && playable && onClick;
  const dimmed = isMyTurn && playable === false;

  return (
    <button
      onClick={onClick}
      disabled={!interactive}
      className={[
        "relative rounded-xl border-2 flex items-center justify-center font-black select-none shrink-0 transition-all duration-150",
        sizeClasses[size],
        isWild ? "" : COLOR_BG[color],
        isWild ? "" : COLOR_TEXT[color],
        isWild ? "text-white" : "",
        interactive
          ? `${COLOR_BORDER[color]} cursor-pointer hover:-translate-y-2 hover:scale-105 active:scale-95`
          : "border-white/20 cursor-default",
        dimmed ? "opacity-35" : "opacity-100",
      ].join(" ")}
      style={{
        background: isWild ? WILD_GRADIENT : undefined,
        boxShadow: interactive
          ? `0 4px 16px ${COLOR_GLOW[color]}`
          : "0 2px 8px rgba(0,0,0,0.4)",
      }}
    >
      {/* Corner top-left */}
      <span className={`absolute top-1 left-1.5 font-black leading-none ${cornerSize[size]} ${COLOR_TEXT[color]}`}>
        {label}
      </span>
      {/* Center label */}
      <span className="font-black">{label}</span>
      {/* Corner bottom-right (rotated) */}
      <span className={`absolute bottom-1 right-1.5 font-black leading-none rotate-180 ${cornerSize[size]} ${COLOR_TEXT[color]}`}>
        {label}
      </span>
    </button>
  );
}

// Draw pile — card back
function DrawPile({
  onClick,
  enabled,
}: {
  onClick: () => void;
  enabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!enabled}
      className={[
        "w-16 h-24 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all duration-150 shrink-0",
        enabled
          ? "border-white/30 cursor-pointer hover:scale-105 hover:border-white/50 active:scale-95"
          : "border-white/10 cursor-default opacity-50",
      ].join(" ")}
      style={{
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
        boxShadow: enabled ? "0 4px 16px rgba(99,102,241,0.4)" : "0 2px 8px rgba(0,0,0,0.4)",
      }}
    >
      <span className="text-white font-black text-xl italic" style={{ textShadow: "0 1px 0 rgba(0,0,0,0.5)" }}>
        UNO
      </span>
      {enabled && (
        <span className="text-white/60 text-[9px] uppercase tracking-widest">Draw</span>
      )}
    </button>
  );
}

// Color picker for wilds
function ColorPicker({
  onPick,
  onCancel,
}: {
  onPick: (c: Color) => void;
  onCancel: () => void;
}) {
  const colors: { color: Color; bg: string; label: string }[] = [
    { color: "red", bg: "bg-red-500", label: "Red" },
    { color: "blue", bg: "bg-blue-600", label: "Blue" },
    { color: "green", bg: "bg-green-500", label: "Green" },
    { color: "yellow", bg: "bg-yellow-400", label: "Yellow" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div
        className="relative rounded-3xl p-6 w-full max-w-xs space-y-4"
        style={{
          background: "rgba(15,15,20,0.95)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <p className="text-white font-black text-center text-lg">Choose a color</p>
        <div className="grid grid-cols-2 gap-3">
          {colors.map(({ color, bg, label }) => (
            <button
              key={color}
              onClick={() => onPick(color)}
              className={`${bg} rounded-2xl py-4 font-black text-sm transition-all active:scale-95 hover:scale-105 ${color === "yellow" ? "text-gray-900" : "text-white"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Winner overlay
function WinOverlay({
  winner,
  isMe,
}: {
  winner: string;
  isMe: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <div className="relative text-center space-y-4">
        <div
          className="text-8xl font-black italic"
          style={{ textShadow: "0 4px 0 rgba(0,0,0,0.5)" }}
        >
          {isMe ? "🏆" : "😢"}
        </div>
        <p className="text-white font-black text-3xl">
          {isMe ? "You won!" : `${winner} won!`}
        </p>
        <p className="text-white/40 text-sm">
          {isMe ? "UNO champion!" : "Better luck next time"}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-8 py-3 rounded-2xl font-black text-white text-lg transition-all active:scale-95"
          style={{
            background: "linear-gradient(135deg, #dc2626, #b91c1c)",
            boxShadow: "0 4px 24px rgba(220,38,38,0.5)",
          }}
        >
          Play Again
        </button>
      </div>
    </div>
  );
}

// Player chip for opponents
function PlayerChip({
  name,
  cardCount,
  isCurrentTurn,
  avatarColor,
}: {
  name: string;
  cardCount: number;
  isCurrentTurn: boolean;
  avatarColor: { bg: string; text: string };
}) {
  return (
    <div
      className={[
        "flex items-center gap-2 px-3 py-2 rounded-2xl shrink-0 transition-all",
        isCurrentTurn ? "ring-2 ring-white/60 scale-105" : "opacity-70",
      ].join(" ")}
      style={{
        background: isCurrentTurn
          ? "rgba(255,255,255,0.12)"
          : "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <div
        className={`w-8 h-8 ${avatarColor.bg} ${avatarColor.text} rounded-full flex items-center justify-center text-xs font-black uppercase shrink-0`}
      >
        {name[0]}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-white text-xs font-semibold truncate max-w-[80px]">{name}</span>
        <span className="text-white/50 text-[10px]">{cardCount} card{cardCount !== 1 ? "s" : ""}</span>
      </div>
      {isCurrentTurn && (
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shrink-0" />
      )}
    </div>
  );
}

const AVATAR_COLORS = [
  { bg: "bg-red-500", text: "text-white" },
  { bg: "bg-blue-500", text: "text-white" },
  { bg: "bg-yellow-400", text: "text-gray-900" },
  { bg: "bg-green-500", text: "text-white" },
];

// --- Main Game component ---

export function Game({ gameState, myId, onPlayCard, onDrawCard }: Props) {
  const [pendingWild, setPendingWild] = useState<Card | null>(null);

  const me = gameState.players.find((p) => p.id === myId);
  const others = gameState.players.filter((p) => p.id !== myId);
  const currentTurnPlayer = gameState.players[gameState.currentPlayerIndex];
  const isMyTurn = currentTurnPlayer.id === myId;

  const top = topCard(gameState);
  const effectiveColor = effectiveTopColor(gameState);

  const winner =
    gameState.status === "finished" && gameState.winner
      ? gameState.players.find((p) => p.id === gameState.winner)
      : null;

  const handleCardClick = (card: Card) => {
    if (!isMyTurn || !canPlayCard(card, gameState)) return;
    if (card.color === "wild") {
      setPendingWild(card);
    } else {
      onPlayCard(card.id);
    }
  };

  const handleColorPick = (color: Color) => {
    if (!pendingWild) return;
    onPlayCard(pendingWild.id, color);
    setPendingWild(null);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col overflow-hidden">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-[-10%] right-[-5%] w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: COLOR_GLOW[effectiveColor] ? `radial-gradient(circle, ${COLOR_GLOW[effectiveColor]}, transparent)` : undefined }}
        />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl" />
      </div>

      {/* Top bar: other players */}
      <div className="relative z-10 p-3 pb-0">
        {/* Turn banner */}
        <div className="text-center mb-2">
          {isMyTurn ? (
            <span
              className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full text-green-300"
              style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }}
            >
              Your turn
            </span>
          ) : (
            <span
              className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full text-white/40"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              {currentTurnPlayer.name}'s turn
            </span>
          )}
        </div>

        {/* Other players row */}
        {others.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {gameState.players
              .map((p, i) => ({ p, i }))
              .filter(({ p }) => p.id !== myId)
              .map(({ p, i }) => (
                <PlayerChip
                  key={p.id}
                  name={p.name}
                  cardCount={p.hand.length}
                  isCurrentTurn={gameState.currentPlayerIndex === i}
                  avatarColor={AVATAR_COLORS[i % AVATAR_COLORS.length]}
                />
              ))}
          </div>
        )}
      </div>

      {/* Center: play area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-6 py-4">
        {/* Direction indicator */}
        <div className="flex items-center gap-2 text-white/30 text-xs">
          <span>{gameState.direction === 1 ? "→" : "←"}</span>
          <span className="uppercase tracking-widest">
            {gameState.direction === 1 ? "Clockwise" : "Counter-clockwise"}
          </span>
          <span>{gameState.direction === 1 ? "→" : "←"}</span>
        </div>

        {/* Discard + Draw piles */}
        <div className="flex items-center gap-6">
          {/* Discard pile */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-white/30 text-[10px] uppercase tracking-widest">Discard</p>
            <div className="relative">
              <UnoCard card={top} size="large" />
              {/* Effective color indicator (shown for wilds) */}
              {top.color === "wild" && (
                <div
                  className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-gray-950 ${COLOR_BG[effectiveColor]}`}
                />
              )}
            </div>
          </div>

          {/* Draw pile */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-white/30 text-[10px] uppercase tracking-widest">Draw</p>
            <DrawPile onClick={onDrawCard} enabled={isMyTurn} />
          </div>
        </div>

        {/* Deck count */}
        <p className="text-white/20 text-xs">{gameState.deck.length} cards remaining</p>
      </div>

      {/* Bottom: my hand */}
      <div
        className="relative z-10 shrink-0"
        style={{
          background: "rgba(0,0,0,0.4)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="px-3 pt-3 pb-1">
          <p className="text-white/30 text-[10px] uppercase tracking-widest mb-2">
            Your hand ({me?.hand.length ?? 0})
            {isMyTurn && <span className="text-green-400/70 ml-2">— tap a card to play</span>}
          </p>
        </div>
        <div className="flex gap-2 overflow-x-auto px-3 pb-4 scrollbar-hide">
          {me?.hand.map((card) => (
            <UnoCard
              key={card.id}
              card={card}
              playable={canPlayCard(card, gameState)}
              isMyTurn={isMyTurn}
              onClick={() => handleCardClick(card)}
            />
          ))}
          {!me?.hand.length && (
            <p className="text-white/20 text-sm py-6 px-4">No cards</p>
          )}
        </div>
      </div>

      {/* Wild color picker modal */}
      {pendingWild && (
        <ColorPicker
          onPick={handleColorPick}
          onCancel={() => setPendingWild(null)}
        />
      )}

      {/* Win overlay */}
      {winner && (
        <WinOverlay
          winner={winner.name}
          isMe={winner.id === myId}
        />
      )}
    </div>
  );
}
