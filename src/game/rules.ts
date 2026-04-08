import type { Card, Color, GameState, Player } from "./types";
import { buildDeck, shuffle } from "./deck";

const STARTING_HAND_SIZE = 7;

// --- Queries ---

export function topCard(state: GameState): Card {
  return state.discardPile[state.discardPile.length - 1];
}

export function currentPlayer(state: GameState): Player {
  return state.players[state.currentPlayerIndex];
}

export function effectiveTopColor(state: GameState): Color {
  return state.currentWildColor ?? (topCard(state).color as Color);
}

export function canPlayCard(card: Card, state: GameState): boolean {
  const top = topCard(state);
  const topColor = effectiveTopColor(state);

  if (card.color === "wild") return true;
  if (card.color === topColor) return true;
  if (card.value === top.value) return true;
  return false;
}

export function hasPlayableCard(player: Player, state: GameState): boolean {
  return player.hand.some((c) => canPlayCard(c, state));
}

// --- State transitions (all return new GameState, never mutate) ---

export function createGame(playerNames: string[]): GameState {
  const deck = shuffle(buildDeck());
  const players: Player[] = playerNames.map((name, i) => ({
    id: `player-${i}`,
    name,
    hand: [],
  }));

  // Deal hands
  let remaining = [...deck];
  for (const player of players) {
    player.hand = remaining.splice(0, STARTING_HAND_SIZE);
  }

  // Flip first card — re-draw if it's a wild
  let firstCard = remaining.shift()!;
  while (firstCard.color === "wild") {
    remaining.push(firstCard);
    remaining = shuffle(remaining);
    firstCard = remaining.shift()!;
  }

  return {
    status: "playing",
    players,
    deck: remaining,
    discardPile: [firstCard],
    currentPlayerIndex: 0,
    direction: 1,
    currentWildColor: null,
    winner: null,
  };
}

export function playCard(
  state: GameState,
  playerId: string,
  cardId: string,
  chosenColor?: Color
): GameState {
  const playerIndex = state.players.findIndex((p) => p.id === playerId);
  if (playerIndex !== state.currentPlayerIndex) return state; // not your turn

  const player = state.players[playerIndex];
  const card = player.hand.find((c) => c.id === cardId);
  if (!card || !canPlayCard(card, state)) return state;

  const newHand = player.hand.filter((c) => c.id !== cardId);
  const newPlayers = state.players.map((p, i) =>
    i === playerIndex ? { ...p, hand: newHand } : p
  );
  const newDiscard = [...state.discardPile, card];
  let newDeck = [...state.deck];

  // Check win
  if (newHand.length === 0) {
    return {
      ...state,
      players: newPlayers,
      discardPile: newDiscard,
      status: "finished",
      winner: playerId,
    };
  }

  const n = state.players.length;
  let nextIndex = state.currentPlayerIndex;
  let newDirection = state.direction;
  let drawCount = 0;
  let skipNext = false;
  let newWildColor: Color | null = null;

  switch (card.value) {
    case "reverse":
      newDirection = (state.direction * -1) as 1 | -1;
      nextIndex = mod(nextIndex + newDirection, n);
      break;
    case "skip":
      nextIndex = mod(nextIndex + state.direction * 2, n);
      skipNext = false;
      break;
    case "draw2":
      drawCount = 2;
      skipNext = true;
      nextIndex = mod(nextIndex + state.direction, n);
      break;
    case "wild":
      newWildColor = chosenColor ?? null;
      nextIndex = mod(nextIndex + state.direction, n);
      break;
    case "wild-draw4":
      newWildColor = chosenColor ?? null;
      drawCount = 4;
      skipNext = true;
      nextIndex = mod(nextIndex + state.direction, n);
      break;
    default:
      nextIndex = mod(nextIndex + state.direction, n);
  }

  // Apply draw penalty to the next player
  let finalPlayers = newPlayers;
  if (drawCount > 0) {
    const target = nextIndex;
    const { drawn, remaining } = drawFromDeck(newDeck, newDiscard, drawCount);
    newDeck = remaining;
    finalPlayers = finalPlayers.map((p, i) =>
      i === target ? { ...p, hand: [...p.hand, ...drawn] } : p
    );
    if (skipNext) {
      nextIndex = mod(nextIndex + newDirection, n);
    }
  }

  return {
    ...state,
    players: finalPlayers,
    deck: newDeck,
    discardPile: newDiscard,
    currentPlayerIndex: nextIndex,
    direction: newDirection,
    currentWildColor: newWildColor,
    winner: null,
  };
}

export function drawCard(state: GameState, playerId: string): GameState {
  const playerIndex = state.players.findIndex((p) => p.id === playerId);
  if (playerIndex !== state.currentPlayerIndex) return state;

  const { drawn, remaining } = drawFromDeck(state.deck, state.discardPile, 1);
  const newPlayers = state.players.map((p, i) =>
    i === playerIndex ? { ...p, hand: [...p.hand, ...drawn] } : p
  );

  return {
    ...state,
    players: newPlayers,
    deck: remaining,
    // Drawing ends your turn
    currentPlayerIndex: mod(
      state.currentPlayerIndex + state.direction,
      state.players.length
    ),
  };
}

// --- Helpers ---

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

function drawFromDeck(
  deck: Card[],
  discard: Card[],
  count: number
): { drawn: Card[]; remaining: Card[] } {
  let d = [...deck];

  // Reshuffle discard into deck (keep top card) if needed
  if (d.length < count) {
    const [top, ...rest] = [...discard].reverse();
    d = [...d, ...shuffle(rest)];
    discard = [top];
  }

  return { drawn: d.slice(0, count), remaining: d.slice(count) };
}
