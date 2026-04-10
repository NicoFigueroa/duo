import { useEffect, useRef, useState } from "react";
import { NameEntry } from "./screens/NameEntry";
import { Lobby } from "./screens/Lobby";
import { Game } from "./screens/Game";
import { useParty } from "./hooks/useParty";
import { createGame, playCard, drawCard } from "./game/rules";
import type { Color, GameState } from "./game/types";
import type { PlayCardMessage, DrawCardMessage } from "./game/messages";

type Screen = "join" | "lobby" | "game";

export default function App() {
  const [screen, setScreen] = useState<Screen>("join");
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");

  // Refs so the stable onMove callback always reads latest values
  const gameStateRef = useRef<GameState | null>(null);
  const myIdRef = useRef<string | null>(null);
  const hostIdRef = useRef<string | null>(null);
  const sendRef = useRef<((msg: object) => void) | null>(null);
  const setGameStateRef = useRef<((gs: GameState) => void) | null>(null);

  // Host processes incoming move messages from non-host players
  const handleMove = (msg: PlayCardMessage | DrawCardMessage) => {
    if (myIdRef.current !== hostIdRef.current || !myIdRef.current) return;
    const gs = gameStateRef.current;
    if (!gs) return;

    const newState =
      msg.type === "play-card"
        ? playCard(gs, msg.playerId, msg.cardId, msg.chosenColor)
        : drawCard(gs, msg.playerId);

    // Update host's local state + broadcast to others
    setGameStateRef.current?.(newState);
    sendRef.current?.({ type: "game-state", state: newState });
  };

  const party = useParty(screen !== "join" ? roomId : "", name, handleMove);
  const { myId, hostId, roster, gameState, setGameState, send } = party;

  // Keep refs current on every render
  gameStateRef.current = gameState;
  myIdRef.current = myId;
  hostIdRef.current = hostId;
  sendRef.current = send;
  setGameStateRef.current = setGameState;

  const isHost = myId !== null && myId === hostId;

  // Switch to game screen when game state arrives (non-host path)
  useEffect(() => {
    if (gameState && screen === "lobby") {
      setScreen("game");
    }
  }, [gameState, screen]);

  // Host starts the game
  const startGame = () => {
    const gs = createGame(roster.map((r) => ({ id: r.id, name: r.name })));
    setGameState(gs);
    send({ type: "game-state", state: gs });
    setScreen("game");
  };

  // Host applies own moves directly; non-host sends intent to host
  const doPlayCard = (cardId: string, chosenColor?: Color) => {
    const gs = gameStateRef.current;
    if (!gs || !myId) return;
    if (isHost) {
      const newState = playCard(gs, myId, cardId, chosenColor);
      setGameState(newState);
      send({ type: "game-state", state: newState });
    } else {
      send({ type: "play-card", playerId: myId, cardId, chosenColor });
    }
  };

  const doDrawCard = () => {
    const gs = gameStateRef.current;
    if (!gs || !myId) return;
    if (isHost) {
      const newState = drawCard(gs, myId);
      setGameState(newState);
      send({ type: "game-state", state: newState });
    } else {
      send({ type: "draw-card", playerId: myId });
    }
  };

  if (screen === "join") {
    return (
      <NameEntry
        onJoin={(n, r) => {
          setName(n);
          setRoomId(r);
          setScreen("lobby");
        }}
      />
    );
  }

  if (screen === "lobby") {
    return (
      <Lobby
        myId={myId}
        hostId={hostId}
        roster={roster}
        roomId={roomId}
        onStartGame={startGame}
      />
    );
  }

  if (!gameState || !myId) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-white/40 text-sm tracking-widest animate-pulse">
          Loading game...
        </p>
      </div>
    );
  }

  return (
    <Game
      gameState={gameState}
      myId={myId}
      onPlayCard={doPlayCard}
      onDrawCard={doDrawCard}
    />
  );
}
