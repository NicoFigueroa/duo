import { describe, it, expect } from "vitest";
import { buildDeck, shuffle } from "./deck";
import {
  createGame,
  playCard,
  drawCard,
  canPlayCard,
  topCard,
  currentPlayer,
} from "./rules";
import type { Card, GameState } from "./types";

// --- Helpers ---

function makeCard(overrides: Partial<Card> & Pick<Card, "color" | "value">): Card {
  return { id: `test-${Math.random()}`, ...overrides };
}

function stateWithTop(top: Card, handCards: Card[] = []): GameState {
  return {
    status: "playing",
    players: [
      { id: "p0", name: "Alice", hand: handCards },
      { id: "p1", name: "Bob", hand: [] },
    ],
    deck: [makeCard({ color: "red", value: 5 })],
    discardPile: [top],
    currentPlayerIndex: 0,
    direction: 1,
    currentWildColor: null,
    winner: null,
  };
}

// --- Deck ---

describe("buildDeck", () => {
  it("has 108 cards", () => {
    expect(buildDeck()).toHaveLength(108);
  });

  it("has one 0 per color (4 total)", () => {
    const deck = buildDeck();
    const zeros = deck.filter((c) => c.value === 0);
    expect(zeros).toHaveLength(4);
  });

  it("has two of each 1-9 per color (72 total)", () => {
    const deck = buildDeck();
    const numbered = deck.filter(
      (c) => typeof c.value === "number" && c.value > 0
    );
    expect(numbered).toHaveLength(72);
  });

  it("has two of each action per color (24 total)", () => {
    const deck = buildDeck();
    const actions = deck.filter((c) =>
      ["skip", "reverse", "draw2"].includes(c.value as string)
    );
    expect(actions).toHaveLength(24);
  });

  it("has 4 wilds and 4 wild-draw4s", () => {
    const deck = buildDeck();
    expect(deck.filter((c) => c.value === "wild")).toHaveLength(4);
    expect(deck.filter((c) => c.value === "wild-draw4")).toHaveLength(4);
  });

  it("has unique ids", () => {
    const deck = buildDeck();
    const ids = new Set(deck.map((c) => c.id));
    expect(ids.size).toBe(108);
  });
});

describe("shuffle", () => {
  it("preserves length", () => {
    const deck = buildDeck();
    expect(shuffle(deck)).toHaveLength(108);
  });

  it("does not mutate the original", () => {
    const deck = buildDeck();
    const first = deck[0];
    shuffle(deck);
    expect(deck[0]).toBe(first);
  });
});

// --- canPlayCard ---

describe("canPlayCard", () => {
  it("allows same color", () => {
    const top = makeCard({ color: "red", value: 5 });
    const card = makeCard({ color: "red", value: 3 });
    expect(canPlayCard(card, stateWithTop(top))).toBe(true);
  });

  it("allows same value", () => {
    const top = makeCard({ color: "red", value: 5 });
    const card = makeCard({ color: "blue", value: 5 });
    expect(canPlayCard(card, stateWithTop(top))).toBe(true);
  });

  it("allows wild on anything", () => {
    const top = makeCard({ color: "red", value: 5 });
    const card = makeCard({ color: "wild", value: "wild" });
    expect(canPlayCard(card, stateWithTop(top))).toBe(true);
  });

  it("allows wild-draw4 on anything", () => {
    const top = makeCard({ color: "green", value: 7 });
    const card = makeCard({ color: "wild", value: "wild-draw4" });
    expect(canPlayCard(card, stateWithTop(top))).toBe(true);
  });

  it("blocks mismatched color and value", () => {
    const top = makeCard({ color: "red", value: 5 });
    const card = makeCard({ color: "blue", value: 3 });
    expect(canPlayCard(card, stateWithTop(top))).toBe(false);
  });

  it("respects currentWildColor", () => {
    const top = makeCard({ color: "wild", value: "wild" });
    const state: GameState = {
      ...stateWithTop(top),
      currentWildColor: "green",
    };
    expect(canPlayCard(makeCard({ color: "green", value: 2 }), state)).toBe(true);
    expect(canPlayCard(makeCard({ color: "red", value: 2 }), state)).toBe(false);
  });
});

// --- createGame ---

describe("createGame", () => {
  it("deals 7 cards to each player", () => {
    const state = createGame(["Alice", "Bob", "Carol"]);
    for (const p of state.players) {
      expect(p.hand).toHaveLength(7);
    }
  });

  it("starts with a non-wild top card", () => {
    const state = createGame(["Alice", "Bob"]);
    expect(topCard(state).color).not.toBe("wild");
  });

  it("sets status to playing", () => {
    expect(createGame(["A", "B"]).status).toBe("playing");
  });

  it("starts with player 0", () => {
    expect(createGame(["A", "B"]).currentPlayerIndex).toBe(0);
  });
});

// --- playCard ---

describe("playCard", () => {
  it("ignores plays out of turn", () => {
    const state = createGame(["Alice", "Bob"]);
    const bobId = state.players[1].id;
    const bobCard = state.players[1].hand[0];
    const next = playCard(state, bobId, bobCard.id);
    expect(next).toBe(state); // same reference = no change
  });

  it("ignores invalid cards", () => {
    const top = makeCard({ color: "red", value: 5 });
    const invalidCard = makeCard({ color: "blue", value: 3 });
    const state = stateWithTop(top, [invalidCard]);
    const next = playCard(state, "p0", invalidCard.id);
    expect(next).toBe(state);
  });

  it("removes card from hand after play", () => {
    const top = makeCard({ color: "red", value: 5 });
    const card = makeCard({ color: "red", value: 3 });
    const state = stateWithTop(top, [card]);
    const next = playCard(state, "p0", card.id);
    expect(next.players[0].hand).toHaveLength(0);
  });

  it("advances turn to next player", () => {
    const top = makeCard({ color: "red", value: 5 });
    const card = makeCard({ color: "red", value: 3 });
    const spare = makeCard({ color: "red", value: 1 });
    const state = stateWithTop(top, [card, spare]);
    const next = playCard(state, "p0", card.id);
    expect(next.currentPlayerIndex).toBe(1);
  });

  it("skip skips next player", () => {
    const top = makeCard({ color: "red", value: 5 });
    const skip = makeCard({ color: "red", value: "skip" });
    const spare = makeCard({ color: "red", value: 1 });
    const state: GameState = {
      ...stateWithTop(top, [skip, spare]),
      players: [
        { id: "p0", name: "Alice", hand: [skip, spare] },
        { id: "p1", name: "Bob", hand: [] },
        { id: "p2", name: "Carol", hand: [] },
      ],
    };
    const next = playCard(state, "p0", skip.id);
    expect(next.currentPlayerIndex).toBe(2);
  });

  it("reverse flips direction", () => {
    const top = makeCard({ color: "red", value: 5 });
    const reverse = makeCard({ color: "red", value: "reverse" });
    const spare = makeCard({ color: "red", value: 1 });
    const state = stateWithTop(top, [reverse, spare]);
    const next = playCard(state, "p0", reverse.id);
    expect(next.direction).toBe(-1);
  });

  it("draw2 gives next player 2 cards and skips them", () => {
    const top = makeCard({ color: "red", value: 5 });
    const draw2 = makeCard({ color: "red", value: "draw2" });
    const spare = makeCard({ color: "red", value: 1 });
    const extraCards = Array.from({ length: 5 }, (_, i) =>
      makeCard({ color: "blue", value: i as 0 })
    );
    const state: GameState = {
      ...stateWithTop(top, [draw2, spare]),
      players: [
        { id: "p0", name: "Alice", hand: [draw2, spare] },
        { id: "p1", name: "Bob", hand: [] },
        { id: "p2", name: "Carol", hand: [] },
      ],
      deck: extraCards,
    };
    const next = playCard(state, "p0", draw2.id);
    expect(next.players[1].hand).toHaveLength(2);
    expect(next.currentPlayerIndex).toBe(2); // Bob was skipped
  });

  it("wild sets currentWildColor", () => {
    const top = makeCard({ color: "red", value: 5 });
    const wild = makeCard({ color: "wild", value: "wild" });
    const spare = makeCard({ color: "red", value: 1 });
    const state = stateWithTop(top, [wild, spare]);
    const next = playCard(state, "p0", wild.id, "blue");
    expect(next.currentWildColor).toBe("blue");
  });

  it("playing last card wins the game", () => {
    const top = makeCard({ color: "red", value: 5 });
    const card = makeCard({ color: "red", value: 3 });
    const state = stateWithTop(top, [card]);
    const next = playCard(state, "p0", card.id);
    expect(next.status).toBe("finished");
    expect(next.winner).toBe("p0");
  });
});

// --- drawCard ---

describe("drawCard", () => {
  it("adds a card to the current player's hand", () => {
    const state = createGame(["Alice", "Bob"]);
    const before = currentPlayer(state).hand.length;
    const next = drawCard(state, state.players[0].id);
    expect(currentPlayer(next).hand.length).toBe(before); // turn advanced
    expect(next.players[0].hand.length).toBe(before + 1);
  });

  it("advances the turn", () => {
    const state = createGame(["Alice", "Bob"]);
    const next = drawCard(state, state.players[0].id);
    expect(next.currentPlayerIndex).toBe(1);
  });

  it("ignores draw out of turn", () => {
    const state = createGame(["Alice", "Bob"]);
    const next = drawCard(state, state.players[1].id);
    expect(next).toBe(state);
  });
});
