import { browser } from "$app/environment";

export type Theme = "light" | "dark";

const STORAGE_KEY = "pokedex-theme";

const readInitialTheme = (): Theme => {
  if (!browser) {
    return "light";
  }
  const stored = document.documentElement.dataset.theme;
  return stored === "dark" ? "dark" : "light";
};

class ThemeStore {
  current = $state<Theme>(readInitialTheme());

  set(theme: Theme) {
    this.current = theme;
    if (!browser) {
      return;
    }
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
  }

  toggle() {
    this.set(this.current === "dark" ? "light" : "dark");
  }
}

export const themeStore = new ThemeStore();
