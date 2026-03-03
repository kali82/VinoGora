import { useRef, useCallback, useState } from "react";
import Map, {
  Marker,
  NavigationControl,
  GeolocateControl,
  Popup,
  Source,
  Layer,
  type MapRef,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const ZIELONA_GORA_CENTER = {
  latitude: 51.9356,
  longitude: 15.5062,
  zoom: 12,
};

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  label: string;
  type?: "vineyard" | "cellar";
}

interface MapViewProps {
  markers?: MapMarker[];
  selectedMarkerId?: string | null;
  onMarkerClick?: (marker: MapMarker) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  routeGeoJson?: any;
  initialViewState?: Partial<typeof ZIELONA_GORA_CENTER>;
  className?: string;
  children?: React.ReactNode;
}

export default function MapView({
  markers = [],
  selectedMarkerId,
  onMarkerClick,
  routeGeoJson,
  initialViewState,
  className = "",
  children,
}: MapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const [popupInfo, setPopupInfo] = useState<MapMarker | null>(null);

  const handleMarkerClick = useCallback(
    (marker: MapMarker) => {
      setPopupInfo(marker);
      onMarkerClick?.(marker);
      mapRef.current?.flyTo({
        center: [marker.longitude, marker.latitude],
        zoom: 14,
        duration: 800,
      });
    },
    [onMarkerClick]
  );

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={MAPBOX_TOKEN}
      initialViewState={{
        ...ZIELONA_GORA_CENTER,
        ...initialViewState,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      attributionControl={false}
    >
      <NavigationControl position="top-right" showCompass={false} />
      <GeolocateControl
        position="top-right"
        trackUserLocation
        showUserHeading
      />

      {markers.map((marker) => (
        <Marker
          key={marker.id}
          latitude={marker.latitude}
          longitude={marker.longitude}
          anchor="bottom"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            handleMarkerClick(marker);
          }}
        >
          <div
            className={`
              flex items-center justify-center w-10 h-10 rounded-full shadow-lg cursor-pointer
              transition-transform duration-200 hover:scale-110
              ${
                selectedMarkerId === marker.id
                  ? "scale-125 ring-2 ring-white"
                  : ""
              }
              ${
                marker.type === "cellar"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }
            `}
          >
            {marker.type === "cellar" ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 21h18" />
                <path d="M5 21V7l8-4 8 4v14" />
                <path d="M9 21v-4a3 3 0 0 1 6 0v4" />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a10 10 0 1 0 10 10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20" />
                <path d="M12 2c3 3.5 4 8 1 13" />
                <path d="M22 2 L17 7" />
                <path d="M18 2h4v4" />
              </svg>
            )}
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-inherit rotate-45" />
        </Marker>
      ))}

      {popupInfo && (
        <Popup
          latitude={popupInfo.latitude}
          longitude={popupInfo.longitude}
          anchor="bottom"
          offset={45}
          closeOnClick={false}
          onClose={() => setPopupInfo(null)}
          className="[&_.mapboxgl-popup-content]:rounded-xl [&_.mapboxgl-popup-content]:px-4 [&_.mapboxgl-popup-content]:py-3 [&_.mapboxgl-popup-content]:shadow-xl"
        >
          <p className="font-display font-semibold text-sm">{popupInfo.label}</p>
        </Popup>
      )}

      {routeGeoJson && (
        <Source id="route" type="geojson" data={routeGeoJson}>
          <Layer
            id="route-line"
            type="line"
            paint={{
              "line-color": "hsl(345, 60%, 35%)",
              "line-width": 4,
              "line-opacity": 0.8,
            }}
            layout={{
              "line-join": "round",
              "line-cap": "round",
            }}
          />
        </Source>
      )}

      {children}
    </Map>
  );
}

export { ZIELONA_GORA_CENTER, MAPBOX_TOKEN };
