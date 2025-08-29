export type Who = "user1" | "user2";

export const tokens = {
  user1: import.meta.env.VITE_USER1_TOKEN as string | undefined,
  user2: import.meta.env.VITE_USER2_TOKEN as string | undefined,
};

let current: Who = "user1";
let listeners: Array<(w: Who) => void> = [];

export function getWho() {
  return current;
}
export function setWho(w: Who) {
  current = w;
  listeners.forEach((l) => l(w));
}
export function onWhoChange(cb: (w: Who) => void) {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((x) => x !== cb);
  };
}
export function getActiveToken(): string | undefined {
  return tokens[current];
}
