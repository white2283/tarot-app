import type { Domain, DrawnCard, Interpretation } from "../../../shared/core/types";

export type Phase = "home" | "draw" | "reveal" | "reading" | "history" | "knowledge" | "astro" | "astroKnowledge";

export interface SessionState {
  phase: Phase;
  deckId: string;
  spreadId: string | null;
  question: string;
  domain: Domain;
  drawn: DrawnCard[];
  interpretation: Interpretation | null;
}

export const initialSession: SessionState = {
  phase: "home", deckId: "rws", spreadId: null,
  question: "", domain: "general", drawn: [], interpretation: null
};

export type Action =
  | { type: "select-deck"; deckId: string }
  | { type: "select-spread"; spreadId: string }
  | { type: "set-question"; question: string; domain: Domain }
  | { type: "drawn"; drawn: DrawnCard[] }
  | { type: "interpreted"; interpretation: Interpretation }
  | { type: "go"; phase: Phase }
  | { type: "reset" };

export function reducer(state: SessionState, a: Action): SessionState {
  switch (a.type) {
    case "select-deck": return { ...state, deckId: a.deckId };
    case "select-spread": return { ...state, spreadId: a.spreadId, phase: "draw" };
    case "set-question": return { ...state, question: a.question, domain: a.domain };
    case "drawn": return { ...state, drawn: a.drawn, phase: "reveal" };
    case "interpreted": return { ...state, interpretation: a.interpretation, phase: "reading" };
    case "go": return { ...state, phase: a.phase };
    case "reset": return { ...initialSession, deckId: state.deckId };
    default: return state;
  }
}
