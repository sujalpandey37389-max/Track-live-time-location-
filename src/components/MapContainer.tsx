import React, { useEffect, useRef, useState } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import { LatLng, RouteOption, RoadHazard, MobileDeviceTarget } from '../types';
import {
  Car,
  Navigation,
  HardHat,
  AlertTriangle,
  Smartphone,
  CheckCircle2,
  Layers,
  Crosshair,
  Compass,
  MapPin,
} from 'lucide-react';

interface MapContainerProps {
  apiKey: string;
  selectedRoute: RouteOption;
  routes: RouteOption[];
  onSelectRoute: (routeId: string) => void;
  driverPosition: LatLng;
  driverHeading: number;
  driverSpeed: number;
  isDriving: boolean;
  mobileTarget: MobileDeviceTarget | null;
  roadHazards: RoadHazard[];
  showTrafficLayer: boolean;
  onToggleTrafficLayer: () => void;
  driverName?: string;
  vehiclePlate?: string;
  mapCenter?: LatLng;
  mapZoom?: number;
}

// Sub-component for Google Maps Live Traffic Layer
function TrafficLayerComponent({ enabled }: { enabled: boolean }) {
  const map = useMap();
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);

  useEffect(() => {
    if (!map) return;

    if (!trafficLayerRef.current) {
      trafficLayerRef.current = new google.maps.TrafficLayer();
    }

    if (enabled) {
      trafficLayerRef.current.setMap(map);
    } else {
      trafficLayerRef.current.setMap(null);
    }

    return () => {
      if (trafficLayerRef.current) {
        trafficLayerRef.current.setMap(null);
      }
    };
  }, [map, enabled]);

  return null;
}

// Sub-component for drawing Route Polylines
function RoutePolylinesComponent({
  routes,
  selectedRouteId,
  onSelectRoute,
}: {
  routes: RouteOption[];
  selectedRouteId: string;
  onSelectRoute: (id: string) => void;
}) {
  const map = useMap();
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!map) return;

    // Clean up old polylines
    polylinesRef.current.forEach((poly) => poly.setMap(null));
    polylinesRef.current = [];

    // Render non-selected routes first (background)
    routes.forEach((route) => {
      const isSelected = route.id === selectedRouteId;
      const polyline = new google.maps.Polyline({
        path: route.path,
        geodesic: true,
        strokeColor: isSelected ? route.color : '#64748b',
        strokeOpacity: isSelected ? 0.95 : 0.45,
        strokeWeight: isSelected ? 6 : 4,
        zIndex: isSelected ? 20 : 10,
        map: map,
      });

      // Allow clicking on alternative routes
      polyline.addListener('click', () => {
        onSelectRoute(route.id);
      });

      polylinesRef.current.push(polyline);
    });

    return () => {
      polylinesRef.current.forEach((poly) => poly.setMap(null));
      polylinesRef.current = [];
    };
  }, [map, routes, selectedRouteId, onSelectRoute]);

  return null;
}

// Sub-component for Mobile Phone Precision Accuracy Radius Circle
function MobileAccuracyCircleComponent({
  target,
}: {
  target: MobileDeviceTarget | null;
}) {
  const map = useMap();
  const circleRef = useRef<google.maps.Circle | null>(null);

  useEffect(() => {
    if (!map || !target || target.status !== 'locked') {
      if (circleRef.current) circleRef.current.setMap(null);
      return;
    }

    if (!circleRef.current) {
      circleRef.current = new google.maps.Circle({
        strokeColor: '#06b6d4',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#06b6d4',
        fillOpacity: 0.15,
        map: map,
      });
    }

    circleRef.current.setCenter(target.location);
    circleRef.current.setRadius(target.accuracyRadiusMeters);
    circleRef.current.setMap(map);

    return () => {
      if (circleRef.current) {
        circleRef.current.setMap(null);
      }
    };
  }, [map, target]);

  return null;
}

// Camera Auto-Follow and Bounds controller
function CameraController({
  driverPosition,
  isDriving,
  selectedRoute,
}: {
  driverPosition: LatLng;
  isDriving: boolean;
  selectedRoute: RouteOption;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (isDriving) {
      map.panTo(driverPosition);
    } else if (selectedRoute && selectedRoute.path.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      selectedRoute.path.forEach((pt) => bounds.extend(pt));
      map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
    }
  }, [map, isDriving, driverPosition, selectedRoute]);

  return null;
}

export function MapContainer({
  apiKey,
  selectedRoute,
  routes,
  onSelectRoute,
  driverPosition,
  driverHeading,
  driverSpeed,
  isDriving,
  mobileTarget,
  roadHazards,
  showTrafficLayer,
  onToggleTrafficLayer,
  driverName = 'Rajesh Kumar (#IND-72)',
  vehiclePlate = 'DL 01 AB 4920',
  mapCenter = { lat: 28.59, lng: 77.16 },
  mapZoom = 12,
}: MapContainerProps) {
  const [selectedHazard, setSelectedHazard] = useState<RoadHazard | null>(null);
  const [showDriverInfo, setShowDriverInfo] = useState(false);
  const [showMobileInfo, setShowMobileInfo] = useState(false);

  return (
    <div className="relative w-full h-full min-h-[480px] bg-slate-950 overflow-hidden select-none">
      <APIProvider apiKey={apiKey} language="en-IN" region="IN">
        <Map
          mapId="DEMO_MAP_ID"
          defaultCenter={mapCenter}
          defaultZoom={mapZoom}
          gestureHandling="greedy"
          disableDefaultUI={false}
          zoomControl={true}
          mapTypeControl={false}
          scaleControl={true}
          streetViewControl={false}
          rotateControl={true}
          fullscreenControl={false}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Traffic Layer */}
          <TrafficLayerComponent enabled={showTrafficLayer} />

          {/* Polylines for routes */}
          <RoutePolylinesComponent
            routes={routes}
            selectedRouteId={selectedRoute.id}
            onSelectRoute={onSelectRoute}
          />

          {/* Accuracy radius for mobile finder */}
          <MobileAccuracyCircleComponent target={mobileTarget} />

          {/* Camera Controller */}
          <CameraController
            driverPosition={driverPosition}
            isDriving={isDriving}
            selectedRoute={selectedRoute}
          />

          {/* Origin Marker */}
          {selectedRoute.path.length > 0 && (
            <AdvancedMarker
              position={selectedRoute.path[0]}
              title="Origin Depot (India)"
            >
              <div className="flex flex-col items-center group cursor-pointer">
                <div className="bg-emerald-600 text-white p-2 rounded-full shadow-lg shadow-emerald-950/50 border-2 border-emerald-300 transform group-hover:scale-110 transition-transform">
                  <Navigation className="w-5 h-5 text-white" />
                </div>
                <span className="mt-1 px-2 py-0.5 bg-slate-900/90 text-emerald-400 text-[10px] font-semibold rounded-md border border-slate-700 shadow-sm backdrop-blur-xs">
                  Dispatch Depot
                </span>
              </div>
            </AdvancedMarker>
          )}

          {/* Destination Marker */}
          {selectedRoute.path.length > 0 && (
            <AdvancedMarker
              position={selectedRoute.path[selectedRoute.path.length - 1]}
              title="Destination (India)"
            >
              <div className="flex flex-col items-center group cursor-pointer">
                <div className="bg-rose-600 text-white p-2 rounded-full shadow-lg shadow-rose-950/50 border-2 border-rose-300 transform group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <span className="mt-1 px-2 py-0.5 bg-slate-900/90 text-rose-400 text-[10px] font-semibold rounded-md border border-slate-700 shadow-sm backdrop-blur-xs">
                  Delivery Destination
                </span>
              </div>
            </AdvancedMarker>
          )}

          {/* Driver Live Moving Vehicle Marker */}
          <AdvancedMarker
            position={driverPosition}
            zIndex={100}
            onClick={() => setShowDriverInfo(!showDriverInfo)}
          >
            <div className="relative flex items-center justify-center cursor-pointer">
              {/* Radar pulse ripples */}
              {isDriving && (
                <>
                  <span className="absolute w-12 h-12 bg-emerald-500/30 rounded-full animate-ping pointer-events-none" />
                  <span className="absolute w-8 h-8 bg-emerald-400/40 rounded-full animate-pulse pointer-events-none" />
                </>
              )}

              {/* Vehicle body with directional arrow */}
              <div
                className="relative z-10 w-10 h-10 rounded-full bg-slate-900 border-2 border-emerald-400 shadow-xl flex items-center justify-center text-emerald-400 transition-transform duration-300"
                style={{
                  transform: `rotate(${driverHeading}deg)`,
                }}
              >
                <Car className="w-5 h-5 text-emerald-400" />
                <div className="absolute -top-1 w-2 h-2 bg-emerald-400 rotate-45 rounded-xs" />
              </div>

              {/* Speed Badge in km/h */}
              <div className="absolute -bottom-5 bg-slate-900/95 text-emerald-300 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-emerald-500/40 shadow-sm whitespace-nowrap">
                {isDriving ? `${driverSpeed || 65} KM/H` : 'IDLE'}
              </div>
            </div>
          </AdvancedMarker>

          {/* Driver Info Window */}
          {showDriverInfo && (
            <InfoWindow
              position={driverPosition}
              onCloseClick={() => setShowDriverInfo(false)}
            >
              <div className="p-2 text-slate-900 min-w-[210px]">
                <div className="flex items-center gap-2 mb-1.5 font-bold text-sm text-slate-800">
                  <Car className="w-4 h-4 text-emerald-600" />
                  <span>NaviPulse India Courier</span>
                </div>
                <div className="text-xs space-y-1 text-slate-600">
                  <p>
                    <span className="font-semibold text-slate-700">Driver:</span> {driverName}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Vehicle:</span> {vehiclePlate}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Speed:</span>{' '}
                    {isDriving ? `${driverSpeed || 65} km/h (Live Flow)` : 'Halted / Idling'}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">GPS:</span>{' '}
                    {driverPosition.lat.toFixed(4)}° N, {driverPosition.lng.toFixed(4)}° E
                  </p>
                  <p className="text-emerald-700 font-medium">
                    🛡️ E2EE India Telemetry Validated
                  </p>
                </div>
              </div>
            </InfoWindow>
          )}

          {/* Mobile Device Target Marker (from Mobile Finder) */}
          {mobileTarget && mobileTarget.status === 'locked' && (
            <AdvancedMarker
              position={mobileTarget.location}
              zIndex={90}
              onClick={() => setShowMobileInfo(!showMobileInfo)}
            >
              <div className="relative flex flex-col items-center cursor-pointer group">
                <span className="absolute -top-1 w-10 h-10 rounded-full bg-cyan-500/20 animate-ping pointer-events-none" />
                <div className="w-9 h-9 rounded-full bg-slate-950 border-2 border-cyan-400 shadow-xl flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <Smartphone className="w-5 h-5 text-cyan-400" />
                </div>
                <span className="mt-1 px-2 py-0.5 bg-slate-900/90 text-cyan-300 text-[10px] font-mono font-semibold rounded-md border border-cyan-500/40 shadow-sm">
                  {mobileTarget.phoneNumber}
                </span>
              </div>
            </AdvancedMarker>
          )}

          {/* Mobile Info Window */}
          {showMobileInfo && mobileTarget && (
            <InfoWindow
              position={mobileTarget.location}
              onCloseClick={() => setShowMobileInfo(false)}
            >
              <div className="p-2 text-slate-900 min-w-[220px]">
                <div className="flex items-center gap-2 mb-1 font-bold text-sm text-cyan-700">
                  <Smartphone className="w-4 h-4 text-cyan-600" />
                  <span>India Mobile Lock (±3m)</span>
                </div>
                <div className="text-xs space-y-1 text-slate-600 font-sans">
                  <p><span className="font-semibold text-slate-800">Phone:</span> {mobileTarget.phoneNumber}</p>
                  <p><span className="font-semibold text-slate-800">Network:</span> {mobileTarget.carrier} ({mobileTarget.networkType})</p>
                  <p><span className="font-semibold text-slate-800">Precision:</span> ±{mobileTarget.accuracyRadiusMeters} meters</p>
                  <p><span className="font-semibold text-slate-800">Battery:</span> {mobileTarget.batteryPercent}%</p>
                  <p className="text-cyan-800 font-medium">📍 {mobileTarget.address}</p>
                </div>
              </div>
            </InfoWindow>
          )}

          {/* Road Construction & Hazard Markers */}
          {roadHazards.map((hazard) => {
            const isConstruction = hazard.type === 'construction';
            return (
              <AdvancedMarker
                key={hazard.id}
                position={hazard.location}
                zIndex={30}
                onClick={() => setSelectedHazard(hazard)}
              >
                <div className="flex flex-col items-center cursor-pointer group">
                  <div
                    className={`p-2 rounded-full shadow-lg border-2 transform group-hover:scale-115 transition-transform ${
                      isConstruction
                        ? 'bg-amber-500 text-slate-950 border-amber-200'
                        : 'bg-rose-600 text-white border-rose-300'
                    }`}
                  >
                    {isConstruction ? (
                      <HardHat className="w-4 h-4" />
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                  </div>
                  <span
                    className={`mt-1 px-1.5 py-0.5 text-[9px] font-bold rounded shadow-xs ${
                      isConstruction
                        ? 'bg-amber-950/90 text-amber-300 border border-amber-600/50'
                        : 'bg-rose-950/90 text-rose-300 border border-rose-600/50'
                    }`}
                  >
                    {isConstruction ? 'NHAI WORK ZONE' : 'TRAFFIC JAM'}
                  </span>
                </div>
              </AdvancedMarker>
            );
          })}

          {/* Hazard Info Window */}
          {selectedHazard && (
            <InfoWindow
              position={selectedHazard.location}
              onCloseClick={() => setSelectedHazard(null)}
            >
              <div className="p-2 text-slate-900 max-w-[250px]">
                <div className="flex items-center gap-1.5 font-bold text-sm text-amber-700">
                  <HardHat className="w-4 h-4 text-amber-600" />
                  <span>{selectedHazard.title}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {selectedHazard.description}
                </p>
                {selectedHazard.detourRecommended && (
                  <div className="mt-2 bg-emerald-50 border border-emerald-200 p-1.5 rounded text-[11px] text-emerald-800 font-medium">
                    ⚡ Smart shortcut bypass route available.
                  </div>
                )}
              </div>
            </InfoWindow>
          )}
        </Map>

        {/* Floating Quick Map Controls Overlay */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          {/* Traffic Toggle Button */}
          <button
            onClick={onToggleTrafficLayer}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold backdrop-blur-md border shadow-lg transition-all ${
              showTrafficLayer
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-emerald-950/30'
                : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>India Traffic {showTrafficLayer ? 'ON' : 'OFF'}</span>
            <span
              className={`w-2 h-2 rounded-full ${
                showTrafficLayer ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
              }`}
            />
          </button>

          {/* India Regional Map Overlay Badge */}
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 shadow-xl space-y-1.5 min-w-[170px]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1 flex items-center justify-between">
              <span>India Network</span>
              <Compass className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="w-3 h-1 bg-emerald-500 rounded-full" />
              <span className="text-emerald-300 font-medium">Shortcut Bypass (Active)</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="w-3 h-1 bg-rose-500/60 rounded-full" />
              <span className="text-rose-300">Highway (NHAI Works)</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="w-3 h-1 bg-blue-500/60 rounded-full" />
              <span className="text-blue-300">Safe Arterial Corridor</span>
            </div>
          </div>
        </div>
      </APIProvider>
    </div>
  );
}
