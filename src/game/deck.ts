import type { Card, Color } from "./types";

const COLORS: Color[] = ["red", "green", "blue", "yellow"];
const NUMBER_VALUES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
const ACTION_VALUES = ["skip", "reverse", "draw2"] as const;

let _idCounter = 0;
function cardId() {
  return `card-${_idCounter++}`;
}

export function buildDeck(): Card[] {
  const cards: Card[] = [];

  for (const color of COLORS) {
    // One 0 per color
    cards.push({ id: cardId(), color, value: 0 });

    // Two of each 1-9 and action per color
    for (const value of NUMBER_VALUES.slice(1)) {
      cards.push({ id: cardId(), color, value });
      cards.push({ id: cardId(), color, value });
    }
    for (const value of ACTION_VALUES) {
      cards.push({ id: cardId(), color, value });
      cards.push({ id: cardId(), color, value });
    }
  }

  // 4 wilds + 4 wild-draw4
  for (let i = 0; i < 4; i++) {
    cards.push({ id: cardId(), color: "wild", value: "wild" });
    cards.push({ id: cardId(), color: "wild", value: "wild-draw4" });
  }

  return cards;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
