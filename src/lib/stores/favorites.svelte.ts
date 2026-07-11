import { browser } from "$app/environment";

const STORAGE_KEY = "pokedex-favorites";

const readInitialFavorites = (): Set<string> => {
  if (!browser) {
    return new Set();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const names: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(names)
      ? new Set(names.filter((n) => typeof n === "string"))
      : new Set();
  } catch {
    return new Set();
  }
};

class FavoritesStore {
  names = $state<Set<string>>(readInitialFavorites());

  has(name: string): boolean {
    return this.names.has(name);
  }

  toggle(name: string) {
    const next = new Set(this.names);
    if (next.has(name)) {
      next.delete(name);
    } else {
      next.add(name);
    }
    this.names = next;
    this.persist();
  }

  private persist() {
    if (!browser) {
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...this.names]));
  }
}

export const favoritesStore = new FavoritesStore();
