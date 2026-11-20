// export default RouteMap;
// export type { RouteMapHandle };

// ─── map/RouteMap.tsx ─────────────────────────────────────────────────────────

import { forwardRef, useImperativeHandle, useEffect, useRef } from "react";
import { Map, useMap } from "@vis.gl/react-google-maps";

import type { RouteMapProps, RouteMapHandle } from "./routeMap.types";
import { useRouteMap } from "./useRouteMap";

// ─── MapInner ─────────────────────────────────────────────────────────────────

interface MapInnerProps {
  routes: RouteMapProps["routes"];
  onRouteSelect?: RouteMapProps["onRouteSelect"];
  onMapReady?: RouteMapProps["onMapReady"];
  innerRef: React.MutableRefObject<RouteMapHandle | null>;
  office?: { lat: number; lng: number; name: string };
}

function MapInner({
  routes,
  onRouteSelect,
  onMapReady,
  innerRef,
  office,
}: MapInnerProps) {
  const map = useMap();
  const rm = useRouteMap();

  // useImperativeHandle(innerRef, () => ({
  //   fitAllRoutes: rm.fitAllRoutes,
  //   focusRoute: rm.focusRoute,
  //   clearFocus: rm.clearFocus,
  // }));

  useImperativeHandle(innerRef, () => ({
    fitAllRoutes: rm.fitAllRoutes,
    focusRoute: rm.focusRoute,
    focusMultipleRoutes: rm.focusMultipleRoutes, // ← add
    clearFocus: rm.clearFocus,
  }));

  useEffect(() => {
    rm.setMap(map);
    return () => rm.setMap(null);
  }, [map, rm.setMap]);

  useEffect(() => {
    if (!map || routes.length === 0) return;
    rm.renderRoutes(routes, onRouteSelect, office);
    onMapReady?.();
  }, [map, routes, onRouteSelect, onMapReady, rm.renderRoutes, office]);

  return null;
}

// ─── RouteMap ─────────────────────────────────────────────────────────────────

const RouteMap = forwardRef<RouteMapHandle, RouteMapProps>(function RouteMap(
  {
    routes,
    defaultCenter = { lat: 18.5204, lng: 73.8567 },
    defaultZoom = 12,
    onRouteSelect,
    onMapReady,
    style,
    mapOptions = {},
    office,
  },
  ref,
) {
  const innerRef = useRef<RouteMapHandle | null>(null);

  useImperativeHandle(ref, () => ({
    fitAllRoutes: () => innerRef.current?.fitAllRoutes(),
    focusRoute: (id) => innerRef.current?.focusRoute(id),
    focusMultipleRoutes: (ids) => innerRef.current?.focusMultipleRoutes(ids), // ← add
    clearFocus: () => innerRef.current?.clearFocus(),
  }));

  const {
    disableDefaultUI,
    streetViewControl,
    mapTypeControl,
    fullscreenControl,
    zoomControl,
    clickableIcons,
    styles,
    ...restMapOptions
  } = mapOptions;

  return (
    <div style={{ width: "100%", height: "100%", ...style }}>
      <Map
        defaultCenter={defaultCenter}
        defaultZoom={defaultZoom}
        disableDefaultUI={disableDefaultUI}
        streetViewControl={streetViewControl}
        mapTypeControl={mapTypeControl}
        fullscreenControl={fullscreenControl}
        zoomControl={zoomControl}
        clickableIcons={clickableIcons}
        styles={styles}
        {...(restMapOptions as object)}
        gestureHandling="greedy"
        style={{ width: "100%", height: "100%" }}
      >
        <MapInner
          routes={routes}
          onRouteSelect={onRouteSelect}
          onMapReady={onMapReady}
          innerRef={innerRef}
          office={office}
        />
      </Map>
    </div>
  );
});

export default RouteMap;
export type { RouteMapHandle };
