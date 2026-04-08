import type { Color, GameState } from "./types";

export type RosterEntry = { id: string; name: string };

// Client → server on connect (announces player name)
export type JoinMessage = {
  type: "join";
  name: string;
};

// Server → joining client (current lobby snapshot)
export type WelcomeMessage = {
  type: "welcome";
  yourId: string;
  hostId: string;
  roster: RosterEntry[];
};

// Server → all clients when roster changes
export type RosterMessage = {
  type: "roster";
  hostId: string;
  roster: RosterEntry[];
};

// Host → all clients (after any state change)
export type GameStateMessage = {
  type: "game-state";
  state: GameState;
};

// Non-host → host (move intents)
export type PlayCardMessage = {
  type: "play-card";
  playerId: string;
  cardId: string;
  chosenColor?: Color;
};

export type DrawCardMessage = {
  type: "draw-card";
  playerId: string;
};

export type ClientMessage =
  | JoinMessage
  | GameStateMessage
  | PlayCardMessage
  | DrawCardMessage;

export type ServerMessage =
  | WelcomeMessage
  | RosterMessage
  | GameStateMessage
  | PlayCardMessage
  | DrawCardMessage;
