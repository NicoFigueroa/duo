import { useEffect, useRef, useState } from "react";
import type { RosterEntry, ServerMessage, JoinMessage } from "../game/messages";

interface PartyState {
  myId: string | null;
  hostId: string | null;
  roster: RosterEntry[];
}

export function useParty(roomId: string, name: string) {
  const [state, setState] = useState<PartyState>({
    myId: null,
    hostId: null,
    roster: [],
  });
  const wsRef = useRef<WebSocket | null>(null);

  const send = (msg: object) => {
    wsRef.current?.send(JSON.stringify(msg));
  };

  useEffect(() => {
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
      }
    };

    ws.onclose = () => {
      setState({ myId: null, hostId: null, roster: [] });
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [roomId, name]);

  return { ...state, send };
}
