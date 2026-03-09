export type Term = "1st" | "2nd" | "3rd";

const order: Term[] = ["1st", "2nd", "3rd"];

export function getNextTerm(term: Term): Term | null {
  const idx = order.indexOf(term);
  if (idx === -1 || idx === order.length - 1) return null;
  return order[idx + 1];
}

export function getPreviousTerm(term: Term): Term | null {
  const idx = order.indexOf(term);
  if (idx <= 0) return null;
  return order[idx - 1];
}
