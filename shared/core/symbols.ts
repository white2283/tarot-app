export const SYMBOL_TYPES = [
  "sun", "moon", "sparkle", "star", "cliff", "dog", "rose", "figure",
  "tower", "lightning", "waves", "chalice", "vine", "grapes",
  "sword", "wand", "pentacle", "crown", "throne", "chariot", "wheel",
  "angel", "lion", "pillar", "veil", "scroll", "lantern", "mountain",
  "river", "tree", "snake", "eagle", "bull", "child", "boat", "key",
  "heart", "cloud", "hand", "crown-of-thorns", "skull", "butterfly"
] as const;
export type SymbolType = typeof SYMBOL_TYPES[number];
