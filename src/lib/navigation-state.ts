/** State passed with `navigate(to, { state })` between pages. */
export interface NavState {
  /** Skip the unsaved-changes prompt (the form was just saved). */
  confirmedLeave?: boolean;
  /** One-off success message for the destination page. */
  notice?: string;
}

export function readNavState(state: unknown): NavState {
  return state !== null && typeof state === "object" ? (state as NavState) : {};
}
