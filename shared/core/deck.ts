import type { CardData, DeckData, DrawnCard } from "./types";

export function createDeck(data: DeckData): CardData[] {
  return [...data.cards];
}

export function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function draw(deck: CardData[], count: number, rng: () => number = Math.random): DrawnCard[] {
  if (count > deck.length) throw new Error(`抽 ${count} 张但牌堆只有 ${deck.length} 张`);
  return shuffle(deck, rng).slice(0, count).map(card => ({
    card,
    reversed: card.arcana === "oracle" ? false : rng() < 0.5
  }));
}
