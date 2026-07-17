export interface TourStep {
  id: string;
  step: number;
  title: string;
  body: string;
  /** data-tour attribute value to spotlight, or null for a centered modal step (welcome/completion). */
  target: string | null;
  placement: "center" | "right" | "bottom" | "top";
}

/**
 * Five steps, portal-agnostic \u2014 the same tour runs for every role, pointing
 * at the same structural elements every portal shares (sidebar, topbar,
 * main content), so it genuinely covers the whole dashboard rather than
 * being written for just the Founder Portal. Mirrors the Stitch
 * onboarding_welcome / onboarding_sidebar_spotlight / onboarding_completion
 * screens.
 */
export const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    step: 1,
    title: "Welcome to Havenly",
    body: "This is your command center. We'll walk you through the basics in four quick steps \u2014 skip anytime.",
    target: null,
    placement: "center",
  },
  {
    id: "sidebar",
    step: 2,
    title: "Your navigation",
    body: "Everything you have access to lives here, grouped by what it's for. Your Founder controls exactly what you can see \u2014 ask if something's missing.",
    target: "sidebar-nav",
    placement: "right",
  },
  {
    id: "topbar",
    step: 3,
    title: "Search, alerts & your profile",
    body: "Search across tickets and records, keep an eye on live notifications, and manage your account from here.",
    target: "topbar-utility",
    placement: "bottom",
  },
  {
    id: "main",
    step: 4,
    title: "Your home screen",
    body: "This updates in real time as things happen \u2014 no need to refresh. Different portals show different data, scoped to your role.",
    target: "main-content",
    placement: "top",
  },
  {
    id: "done",
    step: 5,
    title: "You're all set",
    body: "That's the tour. You can re-open it anytime from Settings if you want a refresher.",
    target: null,
    placement: "center",
  },
];

const completedKey = (userId: string) => `havenly-tour-completed:${userId}`;
const dismissedKey = (userId: string) => `havenly-tour-dismissed:${userId}`;
const pendingKey = (userId: string) => `havenly-tour-pending:${userId}`;

function safeGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSet(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore \u2014 private browsing / storage disabled
  }
}

/** Called right after a first-login password change, so the tour knows to auto-start once the user lands on their portal home. */
export function markTourPending(userId: string) {
  safeSet(pendingKey(userId), "1");
}
export function isTourPending(userId: string): boolean {
  return safeGet(pendingKey(userId)) === "1";
}

export function isTourCompleted(userId: string): boolean {
  return safeGet(completedKey(userId)) === "1";
}
export function markTourCompleted(userId: string) {
  safeSet(completedKey(userId), "1");
}

export function isTourDismissed(userId: string): boolean {
  return safeGet(dismissedKey(userId)) === "1";
}
export function markTourDismissed(userId: string) {
  safeSet(dismissedKey(userId), "1");
}

/** Should the tour auto-start for this user right now? True once, right after first login, until completed or dismissed. */
export function shouldAutoStartTour(userId: string): boolean {
  if (isTourCompleted(userId) || isTourDismissed(userId)) return false;
  return isTourPending(userId);
}
