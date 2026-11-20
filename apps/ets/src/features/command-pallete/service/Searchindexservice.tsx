import Fuse from 'fuse.js';
import type { IFuseOptions } from 'fuse.js';
import type { MenuNode, SearchIndexItem } from '../types/command-palette.types';
import { getAliasesForMenu, extractKeywords } from '../alias-registry/Aliasregistry';
import type { RouteFrequency } from '../service/Recentsearchesservice';


function toMenuNode(item: any): MenuNode {
  return {
    menuId:       item.menuId       ?? item.id,
    menuName:     item.menuName     ?? item.name ?? item.title,
    parentMenuId: item.parentMenuId ?? item.parentId ?? null,
    orderNo:      item.orderNo      ?? item.order ?? 0,
    isAssigned:   item.isAssigned   ?? true,
    routeUrl:     item.routeUrl     ?? item.route ?? null,
    icon:         item.icon         ?? '',
    children:     item.children?.map(toMenuNode) ?? [],
    isActive:     item.isActive     ?? null,
  };
}

export const FUSE_OPTIONS: IFuseOptions<SearchIndexItem> = {
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'searchableText', weight: 0.35 },
    { name: 'aliases', weight: 0.15 },
    { name: 'parentTitle', weight: 0.05 },
    { name: 'keywords', weight: 0.05 },
  ],
  threshold: 0.45,
  distance: 100,
  minMatchCharLength: 2,
  includeScore: true,
  ignoreLocation: true,
  shouldSort: true,
  useExtendedSearch: true,
};

function flattenMenuNode(
  node: MenuNode,
  ctx: { breadcrumbParts: string[] },
  accumulator: SearchIndexItem[]
): void {
  const currentBreadcrumb = [...ctx.breadcrumbParts, node.menuName];

  if (node.routeUrl && node.isAssigned) {
    const parentTitle = ctx.breadcrumbParts.at(-1) ?? '';
    const aliases = getAliasesForMenu(node.menuName);
    const keywords = extractKeywords(aliases);

    const searchableText = [
      node.menuName,
      parentTitle,
      currentBreadcrumb.join(' '),
      ...aliases,
      ...keywords,
      node.routeUrl.split('/').pop() || '',
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    accumulator.push({
      id: node.menuId,
      title: node.menuName,
      parentTitle,
      fullBreadcrumb: currentBreadcrumb.join(' > '),
      route: node.routeUrl,
      icon: node.icon,
      aliases,
      keywords,
      searchableText,
      type: 'navigation',
      rankingMetadata: { frequency: 0, recency: 0, priority: 0 },
      isAssigned: true,
    });
  }

  node.children?.forEach((child) =>
    flattenMenuNode(child, { breadcrumbParts: currentBreadcrumb }, accumulator)
  );
}

// export function buildSearchIndex(menuTree: MenuNode[]): SearchIndexItem[] {
//   const items: SearchIndexItem[] = [];
//   menuTree.forEach((node) => flattenMenuNode(node, { breadcrumbParts: [] }, items));
//   return items;
// }

export function buildSearchIndex(menuTree: any[]): SearchIndexItem[] {
  const items: SearchIndexItem[] = [];
  menuTree
    .map(toMenuNode)  // ← normalize field names before flattening
    .forEach((node) => flattenMenuNode(node, { breadcrumbParts: [] }, items));
  return items;
}

// ── THIS WAS MISSING — was imported by useCommandPalette but never exported ──
export function applyRankingBoosts(
  index: SearchIndexItem[],
  frequencies: RouteFrequency[]
): void {
  const freqMap = new Map(frequencies.map((f) => [f.route, f]));
  const now = Date.now();
  const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

  index.forEach((item) => {
    const freq = freqMap.get(item.route);
    if (!freq) return;

    // Normalize frequency: cap at 20 visits = score 100
    item.rankingMetadata.frequency = Math.min((freq.count / 20) * 100, 100);

    // Recency: full score if used within a week, decays linearly after
    const age = now - freq.lastUsed;
    item.rankingMetadata.recency = Math.max(0, 100 - (age / ONE_WEEK) * 100);
  });
}

export function createFuseInstance(index: SearchIndexItem[]): Fuse<SearchIndexItem> {
  return new Fuse(index, FUSE_OPTIONS);
}

export function executeSearch(
  fuse: Fuse<SearchIndexItem>,
  query: string,
  limit = 10
): SearchIndexItem[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const results = fuse.search(normalized, { limit: limit * 2 });

  return results
    .map((r) => {
      const score = r.score ?? 1;
      const boost =
        (r.item.rankingMetadata.frequency || 0) * 0.012 +
        (r.item.rankingMetadata.recency || 0) * 0.008;
      return { item: r.item, finalScore: score - boost };
    })
    .sort((a, b) => a.finalScore - b.finalScore)
    .slice(0, limit)
    .map((r) => r.item);
}