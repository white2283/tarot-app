import type { DeckData } from "../../shared/core/types";
import tarot from "../../shared/data/cards.tarot.json";
import moonology from "../../shared/data/cards.moonology.json";

export const DECKS: Record<string, DeckData> = {
  rws: tarot as unknown as DeckData,
  moonology: moonology as unknown as DeckData
};

export function getDeck(id: string): DeckData {
  return DECKS[id] ?? DECKS.rws;
}
