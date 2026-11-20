// ─── Recent Searches Service ──────────────────────────────────────────────────
// Persists recent command palette selections to localStorage.
// Provides frequency + recency data for ranking boosts.
// Max 20 entries, deduped by route.

import type { RecentSearch } from '../types/command-palette.types';

const STORAGE_KEY = 'cmd_palette_recent_v1';
const MAX_ENTRIES = 20;

export interface RouteFrequency {
  route: string;
  count: number;
  lastUsed: number;
}

function readRaw(): RecentSearch[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RecentSearch[]) : [];
  } catch {
    return [];
  }
}

function writeRaw(entries: RecentSearch[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

export const recentSearchesService = {
  getAll(): RecentSearch[] {
    return readRaw().sort((a, b) => b.timestamp - a.timestamp);
  },

  persist(entry: Omit<RecentSearch, 'id' | 'timestamp'>): void {
    const existing = readRaw();
    // Remove duplicate by route
    const deduped = existing.filter(
      (e) => e.selectedItemRoute !== entry.selectedItemRoute,
    );
    const next: RecentSearch = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    const capped = [next, ...deduped].slice(0, MAX_ENTRIES);
    writeRaw(capped);
  },

  remove(id: string): void {
    writeRaw(readRaw().filter((e) => e.id !== id));
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  /**
   * Aggregate route frequency + recency for ranking boosts.
   * Returns one entry per unique route.
   */
  getRouteFrequencies(): RouteFrequency[] {
    const entries = readRaw();
    const map = new Map<string, RouteFrequency>();

    entries.forEach(({ selectedItemRoute, timestamp }) => {
      const existing = map.get(selectedItemRoute);
      if (existing) {
        existing.count += 1;
        existing.lastUsed = Math.max(existing.lastUsed, timestamp);
      } else {
        map.set(selectedItemRoute, {
          route: selectedItemRoute,
          count: 1,
          lastUsed: timestamp,
        });
      }
    });

    return Array.from(map.values());
  },
};