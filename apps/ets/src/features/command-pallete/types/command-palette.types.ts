// ─── Command Palette Search Index Types ───────────────────────────────────────
// These are the canonical types for the entire search system.
// NEVER bypass these — every searchable item MUST conform to SearchIndexItem.

export interface RankingMetadata {
  frequency: number;       // how often this route is visited (0–100)
  recency: number;         // recency score from recent searches (0–100)
  priority: number;        // manual priority boost (0–10)
}

/**
 * SearchIndexItem — the single source of truth for every navigable destination.
 *
 * Rule: selection → navigate(item.route) directly.
 * No secondary sidebar lookup. No API call. No re-search.
 */
export interface SearchIndexItem {
  id: string;                    // menuId from backend
  title: string;                 // display name, e.g. "Scheduling"
  parentTitle: string;           // parent module name, e.g. "Employee Management"
  fullBreadcrumb: string;        // "Employee Management > Scheduling"
  route: string;                 // resolved route, e.g. "/schedule/create-schedule"
  icon: string;                  // icon key (mapped via iconRegistry)
  aliases: string[];             // ["roster", "shift planning", "weekly shift"]
  keywords: string[];            // ["schedule", "shift", "planning"]
  searchableText: string;        // pre-built single string for Fuse.js
  type: 'navigation';
  rankingMetadata: RankingMetadata;
  isAssigned: boolean;           // permission gate — only assigned items appear
}

export interface RecentSearch {
  id: string;
  query: string;
  selectedItemId: string;
  selectedItemTitle: string;
  selectedItemRoute: string;
  timestamp: number;
}

export interface CommandPaletteState {
  isOpen: boolean;
  query: string;
  results: SearchIndexItem[];
  selectedIndex: number;
  recentSearches: RecentSearch[];
  isIndexReady: boolean;
}

// Raw backend menu shape (recursive)
export interface MenuNode {
  menuId: string;
  menuName: string;
  parentMenuId: string | null;
  orderNo: number;
  isAssigned: boolean;
  routeUrl: string | null;
  icon: string;
  isActive: boolean;
  children?: MenuNode[];
}

// Alias expansion map — domain language → menu vocabulary
export type AliasMap = Record<string, string[]>;