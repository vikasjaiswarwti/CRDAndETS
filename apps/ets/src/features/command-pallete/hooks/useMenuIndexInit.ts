// ─── useMenuIndexInit ─────────────────────────────────────────────────────────
// Watches the menu API result and initializes the search index exactly once.
// Call this in your AppShell / MainLayout, after the user-menu RTK Query resolves.
//
// Usage:
//   const { data: menuData } = useGetNavigationMenuQuery(undefined);
//   useMenuIndexInit(menuData?.menus ?? []);

import { useEffect, useRef } from 'react';
import type { MenuNode } from '../types/command-palette.types';
import { useCommandPalette } from './useCommandPalette';

export function useMenuIndexInit(menuTree: MenuNode[]) {
  const { initializeIndex, isIndexReady } = useCommandPalette();
  const initialized = useRef(false);

  useEffect(() => {
    // Only initialize once, when data arrives
    if (!initialized.current && menuTree.length > 0) {
      initialized.current = true;
      initializeIndex(menuTree);
    }
  }, [menuTree, initializeIndex]);

  return { isIndexReady };
}