import { useEffect, useRef, useState } from "react";
import type {
  RosterEntry,
  ServerMessage,
  JoinMessage,
  PlayCardMessage,
  DrawCardMessage,
} from "../game/messages";
import type { GameState } from "../game/types";

type MoveMessage = PlayCardMessage | DrawCardMessage;

interface PartyState {
  myId: string | null;
  hostId: string | null;
  roster: RosterEntry[];
  gameState: GameState | null;
}

export function useParty(
  roomId: string,
  name: string,
  onMove?: (msg: MoveMessage) => void
) {
  const [state, setState] = useState<PartyState>({
    myId: null,
    hostId: null,
    roster: [],
    gameState: null,
  });
  const wsRef = useRef<WebSocket | null>(null);
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;

  const send = (msg: object) => {
    wsRef.current?.send(JSON.stringify(msg));
  };

  const setGameState = (gs: GameState) => {
    setState((s) => ({ ...s, gameState: gs }));
  };

  useEffect(() => {
    if (!roomId) return;

    const pkHost = import.meta.env.VITE_PARTYKIT_HOST ?? "localhost:1999";
    const protocol = pkHost.startsWith("localhost") ? "ws" : "wss";
    const ws = new WebSocket(`${protocol}://${pkHost}/parties/main/${roomId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      const join: JoinMessage = { type: "join", name };
      ws.send(JSON.stringify(join));
    };

    ws.onmessage = (e: MessageEvent<string>) => {
      const msg = JSON.parse(e.data) as ServerMessage;
      if (msg.type === "welcome") {
        setState((s) => ({
          ...s,
          myId: msg.yourId,
          hostId: msg.hostId,
          roster: msg.roster,
        }));
      } else if (msg.type === "roster") {
        setState((s) => ({ ...s, hostId: msg.hostId, roster: msg.roster }));
      } else if (msg.type === "game-state") {
        setState((s) => ({ ...s, gameState: msg.state }));
      } else if (msg.type === "play-card" || msg.type === "draw-card") {
        onMoveRef.current?.(msg);
      }
    };

    ws.onclose = () => {
      setState({ myId: null, hostId: null, roster: [], gameState: null });
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [roomId, name]);

  return { ...state, send, setGameState };
}
