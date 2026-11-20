import { useEffect } from "react";
import { useGetMenuQuery } from "../services/menuApi";
import { selectIsAuthenticated } from "../../auth/slices/authSlice";
import { selectIsHydrated } from "../slices/navigationSlice";
import { useSelector } from "react-redux";
import { useCommandPalette } from "../../command-pallete/hooks/useCommandPalette";

export const useMenuBootstrap = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isHydrated = useSelector(selectIsHydrated);
  const { initializeIndex, isIndexReady } = useCommandPalette();

  // ── KEY FIX: skip only when not authenticated ──────────────────────────────
  // Previously: skip: !isAuthenticated || isHydrated
  // Problem: once isHydrated=true, query skips → menuData becomes undefined
  // Fix: always run when authenticated — RTK Query returns cached data instantly,
  //      no new network request is made because keepUnusedDataFor: Infinity

  const {
    data: menuData,
    isLoading,
    isError,
  } = useGetMenuQuery(undefined, {
    skip: !isAuthenticated, // ← removed || isHydrated
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    // console.log('[MenuBootstrap] state:', {
    //   isAuthenticated,
    //   isHydrated,
    //   isIndexReady,
    //   isLoading,
    //   isError,
    //   menuCount: menuData?.menus?.length ?? 0,
    // });
  }, [isAuthenticated, isHydrated, isIndexReady, isLoading, isError, menuData]);

  useEffect(() => {
    if (menuData?.menus && menuData.menus.length > 0 && !isIndexReady) {
      // console.log('[MenuBootstrap] 🚀 Initializing search index with', menuData.menus.length, 'menus');
      // console.log('[MenuBootstrap] first 3 menus:', menuData.menus.slice(0, 3));
      initializeIndex(menuData.menus as any);
    } else if (menuData?.menus && isIndexReady) {
      // console.log('[MenuBootstrap] ✅ Index already ready, skipping init');
    } else if (!menuData?.menus) {
      // console.log('[MenuBootstrap] ⏳ No menu data yet');
    }
  }, [menuData, isIndexReady, initializeIndex]);
};
