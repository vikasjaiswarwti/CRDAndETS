import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useAppSelector } from "../../app/store";
import { selectMenus } from "../../features/navigation/slices/navigationSlice";
import type { MenuItem } from "../../shared/types/menu.types";
import { APP_NAME, STATIC_TITLES } from "./pageTitles";

const normalize = (path: string) =>
  path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;

// Flatten the menu tree into routeUrl -> title, once per menus change
const buildTitleMap = (items: MenuItem[]): Map<string, string> => {
  const map = new Map<string, string>();
  const walk = (list: MenuItem[]) => {
    for (const item of list) {
      if (item.routeUrl && item.menuName) {
        map.set(normalize(item.routeUrl), item.menuName);
      }
      if (item.children?.length) walk(item.children);
    }
  };
  walk(items);
  return map;
};

// Exact match first; otherwise longest-prefix match, so detail/edit routes
// nested under a registered list page (e.g. /fleet/vehicle/123/edit) still resolve.
const resolveMenuTitle = (
  pathname: string,
  titleMap: Map<string, string>,
): string | undefined => {
  const path = normalize(pathname);
  if (titleMap.has(path)) return titleMap.get(path);

  let best: string | undefined;
  let bestLen = -1;
  for (const [routeUrl, name] of titleMap) {
    if (
      (path === routeUrl || path.startsWith(routeUrl + "/")) &&
      routeUrl.length > bestLen
    ) {
      best = name;
      bestLen = routeUrl.length;
    }
  }
  return best;
};

export const usePageTitleSync = () => {
  const { pathname } = useLocation();
  const menus = useAppSelector(selectMenus);

  const titleMap = useMemo(() => buildTitleMap(menus ?? []), [menus]);

  useEffect(() => {
    const path = normalize(pathname);
    const title = STATIC_TITLES[path] ?? resolveMenuTitle(pathname, titleMap);
    document.title = title ? `${APP_NAME} | ${title}` : APP_NAME;
  }, [pathname, titleMap]);
};
