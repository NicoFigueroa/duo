export type Color = "red" | "green" | "blue" | "yellow";
export type WildColor = Color | null; // null = not yet chosen

export type NumberValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type ActionValue = "skip" | "reverse" | "draw2";
export type WildValue = "wild" | "wild-draw4";

export type CardValue = NumberValue | ActionValue | WildValue;

export type Card = {
  id: string;
  color: Color | "wild";
  value: CardValue;
};

export type Player = {
  id: string;
  name: string;
  hand: Card[];
};

export type GameStatus = "lobby" | "playing" | "finished";

export type GameState = {
  status: GameStatus;
  players: Player[];
  deck: Card[];
  discardPile: Card[];
  currentPlayerIndex: number;
  direction: 1 | -1; // 1 = clockwise, -1 = counter-clockwise
  currentWildColor: Color | null;
  winner: string | null; // player id
};
