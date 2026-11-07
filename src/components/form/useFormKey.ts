"use client";

import { useRef } from "react";

/**
 * A new key every time the action returns a new state. Putting it on <form key={...}> makes React
 * rebuild the form, so every field (selects too) shows the values the server sent back.
 * Without it, React 19's automatic form reset puts a <select> back to its FIRST default value.
 */
export function useFormKey(state: object): number {
  const last = useRef(state);
  const key = useRef(0);
  if (last.current !== state) {
    last.current = state;
    key.current += 1;
  }
  return key.current;
}
