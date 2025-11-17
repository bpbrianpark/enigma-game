import { normalize } from "./normalize";

const SPECIAL_CASES: Map<string, Map<string, string>> = new Map([
  [
    "pokemon_gen1",
    new Map([
      ["nidoran male", "Nidoran♂"],
      ["nidoranmale", "Nidoran♂"],
      ["nidoran female", "Nidoran♀"],
      ["nidoranfemale", "Nidoran♀"],
    ]),
  ],
  [
    "humans_men",
    new Map([
      ["eminem", "Marshall Mathers"],
    ]),
  ],
]);

export function transformGuess(categorySlug: string, guess: string): string {
  const categoryCases = SPECIAL_CASES.get(categorySlug);
  if (!categoryCases) {
    return guess;
  }

  const normalizedGuess = normalize(guess);
  const transformed = categoryCases.get(normalizedGuess);

  return transformed ?? guess;
}

