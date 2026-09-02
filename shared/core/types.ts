export type Arcana = "major" | "minor" | "oracle";
export type Suit = "wands" | "cups" | "swords" | "pentacles";

export interface SymbolSpec { type: string; x: number; y: number; }

export interface CardData {
  id: string;
  name: string;
  nameEn: string;
  arcana: Arcana;
  number: number;
  suit: Suit | null;
  keywords: string[];
  upright: string;
  reversed: string | null;
  domains: { general: string; love?: string };
  detail?: string;
  symbols: SymbolSpec[];
  palette: { bg: string; fg: string };
}

export interface DeckData {
  id: string;
  name: string;
  type: "tarot" | "oracle";
  cards: CardData[];
}

export interface DrawnCard { card: CardData; reversed: boolean; }

export interface SpreadPosition { name: string; meaning: string; }

export interface Spread {
  id: string;
  name: string;
  description: string;
  cardCount: number;
  positions: SpreadPosition[];
}

export type Domain = "general" | "love";

export interface InterpretInput {
  question: string;
  domain: Domain;
  spread: Spread;
  drawn: DrawnCard[];
}

export interface PositionReading {
  position: SpreadPosition;
  drawn: DrawnCard;
  text: string;
}

export interface Interpretation {
  summary: string;
  positions: PositionReading[];
  source: "template" | "ai";
}
