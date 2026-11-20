import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Fuse from "fuse.js";

import type { RootState } from "../../../app/store/index";
import type { MenuNode, SearchIndexItem } from "../types/command-palette.types";
import { commandPaletteActions } from "../slice/Commandpaletteslice";
import {
  buildSearchIndex,
  createFuseInstance,
  executeSearch,
  applyRankingBoosts, // ← now exported correctly
} from "../service/Searchindexservice";
import { recentSearchesService } from "../service/Recentsearchesservice";

let fuseInstance: Fuse<SearchIndexItem> | null = null;
let searchIndex: SearchIndexItem[] = [];

export function useCommandPalette() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    isOpen,
    query,
    results,
    selectedIndex,
    recentSearches,
    isIndexReady,
  } = useSelector((s: RootState) => s.commandPalette);

  const inputRef = useRef<HTMLInputElement>(null);
  // ── Fixed: was HTMLUListElement, dropdown is now a div ──
  const listRef = useRef<HTMLDivElement>(null);

  // const initializeIndex = useCallback((menuTree: MenuNode[]) => {
  //   const frequencies = recentSearchesService.getRouteFrequencies();
  //   const index = buildSearchIndex(menuTree);
  //   applyRankingBoosts(index, frequencies);  // ← restored

  //   searchIndex = index;
  //   fuseInstance = createFuseInstance(index);

  //   dispatch(commandPaletteActions.markIndexReady());
  //   dispatch(commandPaletteActions.setRecentSearches(recentSearchesService.getAll()));
  // }, [dispatch]);

  const initializeIndex = useCallback(
    (menuTree: MenuNode[]) => {
      // console.log('[CommandPalette] initializeIndex called with', menuTree.length, 'nodes');

      const frequencies = recentSearchesService.getRouteFrequencies();
      const index = buildSearchIndex(menuTree);
      applyRankingBoosts(index, frequencies);

      // console.log('[CommandPalette] ✅ Built search index:', index.length, 'searchable items');
      // console.log('[CommandPalette] Sample items:', index.slice(0, 5).map(i => ({ title: i.title, route: i.route })));

      searchIndex = index;
      fuseInstance = createFuseInstance(index);

      dispatch(commandPaletteActions.markIndexReady());
      dispatch(
        commandPaletteActions.setRecentSearches(recentSearchesService.getAll()),
      );
    },
    [dispatch],
  );

  const open = useCallback(() => {
    dispatch(commandPaletteActions.open());
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [dispatch]);

  const close = useCallback(() => {
    dispatch(commandPaletteActions.close());
  }, [dispatch]);

  const setSelectedIndex = useCallback(
    (index: number) => {
      dispatch(commandPaletteActions.setSelectedIndex(index));
    },
    [dispatch],
  );

  // const handleQueryChange = useCallback((raw: string) => {
  //   dispatch(commandPaletteActions.setQuery(raw));

  //   if (!fuseInstance) {
  //     dispatch(commandPaletteActions.setResults([]));
  //     return;
  //   }

  //   const trimmed = raw.trim();
  //   if (!trimmed) {
  //     dispatch(commandPaletteActions.setResults([]));
  //     return;
  //   }

  //   const found = executeSearch(fuseInstance, trimmed, 10);
  //   dispatch(commandPaletteActions.setResults(found));
  // }, [dispatch]);

  const handleQueryChange = useCallback(
    (raw: string) => {
      dispatch(commandPaletteActions.setQuery(raw));

      console.log("[CommandPalette] query changed:", raw, {
        hasFuseInstance: !!fuseInstance,
        indexSize: searchIndex.length,
      });

      if (!fuseInstance) {
        console.warn(
          "[CommandPalette] ❌ No Fuse instance — index not initialized yet",
        );
        dispatch(commandPaletteActions.setResults([]));
        return;
      }

      const trimmed = raw.trim();
      if (!trimmed) {
        dispatch(commandPaletteActions.setResults([]));
        return;
      }

      const found = executeSearch(fuseInstance, trimmed, 10);
      console.log(
        "[CommandPalette] 🔍 Search results for",
        trimmed,
        ":",
        found.length,
        "items",
        found.map((i) => i.title),
      );
      dispatch(commandPaletteActions.setResults(found));
    },
    [dispatch],
  );

  const navigateTo = useCallback(
    (item: SearchIndexItem) => {
      navigate(item.route);

      recentSearchesService.persist({
        query,
        selectedItemId: item.id,
        selectedItemTitle: item.title,
        selectedItemRoute: item.route,
      });

      dispatch(
        commandPaletteActions.addRecentSearch({
          id: crypto.randomUUID(),
          query,
          selectedItemId: item.id,
          selectedItemTitle: item.title,
          selectedItemRoute: item.route,
          timestamp: Date.now(),
        }),
      );

      close();
    },
    [navigate, query, dispatch, close],
  );

  const confirmSelection = useCallback(() => {
    const item = results[selectedIndex];
    if (item) navigateTo(item);
  }, [results, selectedIndex, navigateTo]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          dispatch(commandPaletteActions.selectNext());
          break;
        case "ArrowUp":
          e.preventDefault();
          dispatch(commandPaletteActions.selectPrev());
          break;
        case "Enter":
          e.preventDefault();
          confirmSelection();
          break;
        case "Escape":
          e.preventDefault();
          close();
          inputRef.current?.blur();
          break;
        default:
          break;
      }
    },
    [dispatch, confirmSelection, close],
  );

  // Global Ctrl+K
  useEffect(() => {
    const handleGlobal = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          close();
        } else {
          open();
        }
      }
    };
    window.addEventListener("keydown", handleGlobal);
    return () => window.removeEventListener("keydown", handleGlobal);
  }, [isOpen, open, close]);

  // ── Fixed: scroll uses data-index attribute now, not data-selected ──
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const selected = list.querySelector(
      `[data-index="${selectedIndex}"]`,
    ) as HTMLElement | null;
    selected?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const navigateToRecent = useCallback(
    (route: string) => {
      const item = searchIndex.find((i) => i.route === route);
      if (item) {
        navigateTo(item);
      } else {
        navigate(route);
        close();
      }
    },
    [navigate, close, navigateTo],
  );

  return {
    isOpen,
    query,
    results,
    selectedIndex,
    recentSearches,
    isIndexReady,
    inputRef,
    listRef,
    open,
    close,
    handleQueryChange,
    handleKeyDown,
    navigateTo,
    navigateToRecent,
    initializeIndex,
    setSelectedIndex,
  };
}
