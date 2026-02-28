const KEY = "shiori_current_user";

export function getCurrentUser(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setCurrentUser(name: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, name);
  } catch {
    // ignore
  }
}
