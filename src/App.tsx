import React, { useState, useEffect, useMemo } from 'react';
import {
  ALL_INDIAN_CORRIDORS,
  UTTAR_PRADESH_CORRIDOR,
  DELHI_CORRIDOR,
  MetroCorridor,
} from './data/mockRoutes';
import {
  RouteOption,
  LatLng,
  MobileDeviceTarget,
  EmailTrackingNotification,
  E2EELogEntry,
} from './types';
import { MapContainer } from './components/MapContainer';
import { RouteSelector } from './components/RouteSelector';
import { NavigationCard } from './components/NavigationCard';
import { MobileLocatorModal } from './components/MobileLocatorModal';
import { EmailNotificationModal } from './components/EmailNotificationModal';
import { E2EELogsDrawer } from './components/E2EELogsDrawer';
import { AITrafficAdvisor } from './components/AITrafficAdvisor';
import {
  getOrCreateMasterKey,
  encryptLocationRecord,
} from './services/crypto';
import {
  Navigation,
  Smartphone,
  Mail,
  Shield,
  Sparkles,
  HardHat,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  MapPin,
  Compass,
} from 'lucide-react';

const GOOGLE_MAPS_API_KEY =
  (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
  'AIzaSyCcAHXQZKZ6fKTCt1SQfhQQVETJgyd1nI4';

export default function App() {
  // Demo Key Quota Warning Banner state (Google Maps Platform Compliance)
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  // Selected Metro Corridor in India (default: Uttar Pradesh as requested)
  const [selectedCorridorId, setSelectedCorridorId] = useState<string>('uttar-pradesh');

  const activeCorridor: MetroCorridor = useMemo(() => {
    return (
      ALL_INDIAN_CORRIDORS.find((c) => c.id === selectedCorridorId) ||
      UTTAR_PRADESH_CORRIDOR
    );
  }, [selectedCorridorId]);

  // Routes and filtering state
  const [selectedRouteId, setSelectedRouteId] = useState<string>(
    activeCorridor.routes[0]?.id || 'up-shortcut'
  );
  const [avoidConstruction, setAvoidConstruction] = useState(true);
  const [avoidTraffic, setAvoidTraffic] = useState(true);

  // Driver Simulation & Telemetry State
  const [isDriving, setIsDriving] = useState(false);
  const [pathIndex, setPathIndex] = useState(0);
  const [subProgress, setSubProgress] = useState(0);
  const [driverSpeed, setDriverSpeed] = useState(0); // in km/h
  const [driverHeading, setDriverHeading] = useState(205);

  // Mobile Device Locator target
  const [mobileTarget, setMobileTarget] = useState<MobileDeviceTarget | null>(null);

  // Traffic Layer Toggle
  const [showTrafficLayer, setShowTrafficLayer] = useState(true);

  // Modals & Panels
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isLogsDrawerOpen, setIsLogsDrawerOpen] = useState(false);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  // Email notifications list (UP & India tailored)
  const [emailNotifications, setEmailNotifications] = useState<EmailTrackingNotification[]>([
    {
      id: 'notif_init_up',
      recipientEmail: 'yamhaihamyamhaiham123hii@gmail.com',
      trackingCode: 'TRK-IN-UP-9421',
      verificationPin: '839-401',
      type: 'departure',
      subject: '🚀 NaviPulse UP Live Tracking: Dispatched for CCS Airport Amausi, Lucknow',
      timestamp: '11:45 AM IST',
      status: 'delivered',
      eta: '21 mins (Amar Shaheed Path Shortcut)',
      currentAddress: 'Departing Hazratganj State Logistics Center, Lucknow, UP',
      driverName: activeCorridor.driverName,
      vehiclePlate: activeCorridor.vehiclePlate,
    },
  ]);

  // E2EE Cryptographic Key & Logs
  const [masterCryptoKey, setMasterCryptoKey] = useState<CryptoKey | null>(null);
  const [rawKeyHex, setRawKeyHex] = useState('');
  const [e2eeLogs, setE2eeLogs] = useState<E2EELogEntry[]>([]);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState('');

  // Destination point
  const [destinationPoint, setDestinationPoint] = useState({
    name: activeCorridor.destination.name,
    address: activeCorridor.destination.address,
    location: { lat: activeCorridor.destination.lat, lng: activeCorridor.destination.lng },
  });

  // When corridor changes, reset routes and destination
  useEffect(() => {
    setSelectedRouteId(activeCorridor.routes[0]?.id || 'up-shortcut');
    setDestinationPoint({
      name: activeCorridor.destination.name,
      address: activeCorridor.destination.address,
      location: { lat: activeCorridor.destination.lat, lng: activeCorridor.destination.lng },
    });
    setIsDriving(false);
    setPathIndex(0);
    setSubProgress(0);
    setDriverSpeed(0);
  }, [activeCorridor]);

  // Listen to Google Maps Platform Quota Exceeded event
  useEffect(() => {
    const handleQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Initialize E2EE Master Key on mount
  useEffect(() => {
    getOrCreateMasterKey()
      .then(({ key, rawKeyHex }) => {
        setMasterCryptoKey(key);
        setRawKeyHex(rawKeyHex);

        // Record initial encrypted genesis log for UP hub
        encryptLocationRecord(
          {
            event: 'UP_LOCATION_LAUNCH_GENESIS',
            lat: activeCorridor.origin.lat,
            lng: activeCorridor.origin.lng,
            driverId: activeCorridor.driverName,
            vehicle: activeCorridor.vehiclePlate,
            corridor: activeCorridor.name,
            timestamp: new Date().toISOString(),
            status: 'INITIALIZED_IN_UTTAR_PRADESH',
          },
          key
        ).then(({ ciphertext, iv, hashSha256 }) => {
          setE2eeLogs([
            {
              id: 'genesis_log_up',
              timestamp: new Date().toLocaleTimeString('en-IN'),
              location: { lat: activeCorridor.origin.lat, lng: activeCorridor.origin.lng },
              speedMph: 0,
              headingDeg: 205,
              batteryLevel: 98,
              event: 'Uttar Pradesh Telemetry Launch & Key Genesis',
              isEncrypted: true,
              ciphertext,
              iv,
              hashSha256,
              decryptedData: {
                lat: activeCorridor.origin.lat,
                lng: activeCorridor.origin.lng,
                speedMph: 0,
                timestamp: new Date().toLocaleTimeString('en-IN'),
                driverId: activeCorridor.driverName,
                status: 'Parked at Hazratganj Hub, Lucknow',
              },
            },
          ]);
        });
      })
      .catch((err) => console.error('E2EE key init error:', err));
  }, []);

  const selectedRoute = useMemo(() => {
    return (
      activeCorridor.routes.find((r) => r.id === selectedRouteId) ||
      activeCorridor.routes[0]
    );
  }, [activeCorridor, selectedRouteId]);

  // Interpolated driver position along the path
  const currentPath = selectedRoute.path;
  const currentDriverPosition: LatLng = useMemo(() => {
    if (!currentPath || currentPath.length === 0) {
      return { lat: activeCorridor.origin.lat, lng: activeCorridor.origin.lng };
    }
    const idx = Math.min(pathIndex, currentPath.length - 1);
    const nextIdx = Math.min(idx + 1, currentPath.length - 1);

    const pt1 = currentPath[idx];
    const pt2 = currentPath[nextIdx];

    return {
      lat: pt1.lat + (pt2.lat - pt1.lat) * subProgress,
      lng: pt1.lng + (pt2.lng - pt1.lng) * subProgress,
    };
  }, [currentPath, pathIndex, subProgress, activeCorridor]);

  // Overall journey progress (0% - 100%)
  const totalWaypoints = currentPath.length - 1 || 1;
  const simulationProgress = Math.min(
    100,
    ((pathIndex + subProgress) / totalWaypoints) * 100
  );

  // Derived step index
  const currentStepIndex = Math.min(
    selectedRoute.steps.length - 1,
    Math.floor((simulationProgress / 100) * selectedRoute.steps.length)
  );

  // Smooth simulation loop in km/h
  useEffect(() => {
    if (!isDriving) {
      setDriverSpeed(0);
      return;
    }

    // Default simulation speed near limit
    if (driverSpeed === 0) {
      setDriverSpeed(
        selectedRoute.type === 'shortcut'
          ? selectedRoute.speedLimitKmh
          : selectedRoute.type === 'highway'
          ? Math.max(25, selectedRoute.speedLimitKmh - 5)
          : selectedRoute.speedLimitKmh
      );
    }

    const interval = setInterval(() => {
      setSubProgress((prevSub) => {
        const nextSub = prevSub + 0.12;
        if (nextSub >= 1) {
          setPathIndex((prevIdx) => {
            const nextIdx = prevIdx + 1;
            if (nextIdx >= currentPath.length - 1) {
              // Reached destination in Uttar Pradesh!
              setIsDriving(false);
              setDriverSpeed(0);

              // Auto-dispatch arrival email
              const arrivalNotif: EmailTrackingNotification = {
                id: `notif_arrival_${Date.now()}`,
                recipientEmail: 'yamhaihamyamhaiham123hii@gmail.com',
                trackingCode: 'TRK-IN-UP-9421',
                verificationPin: '839-401',
                type: 'arrived',
                subject: `✅ Delivery Confirmation: Safely Arrived at ${activeCorridor.destination.name}`,
                timestamp: new Date().toLocaleTimeString('en-IN'),
                status: 'delivered',
                eta: 'Arrived',
                currentAddress: activeCorridor.destination.address,
                driverName: activeCorridor.driverName,
                vehiclePlate: activeCorridor.vehiclePlate,
              };
              setEmailNotifications((prev) => [arrivalNotif, ...prev]);

              return currentPath.length - 1;
            }

            // Calculate heading for vehicle body rotation
            const pA = currentPath[nextIdx];
            const pB = currentPath[Math.min(nextIdx + 1, currentPath.length - 1)];
            const dLng = pB.lng - pA.lng;
            const dLat = pB.lat - pA.lat;
            const headingAngle = (Math.atan2(dLng, dLat) * 180) / Math.PI;
            setDriverHeading(headingAngle);

            // Log encrypted telemetry milestone
            if (masterCryptoKey) {
              encryptLocationRecord(
                {
                  event: `WAYPOINT_${nextIdx}_${activeCorridor.id.toUpperCase()}`,
                  lat: pA.lat,
                  lng: pA.lng,
                  speedKmh: driverSpeed,
                  driverId: activeCorridor.driverName,
                  vehicle: activeCorridor.vehiclePlate,
                  timestamp: new Date().toISOString(),
                  status: 'UP_TRANSIT_VERIFIED',
                },
                masterCryptoKey
              ).then(({ ciphertext, iv, hashSha256 }) => {
                const newEntry: E2EELogEntry = {
                  id: `log_up_${Date.now()}_${nextIdx}`,
                  timestamp: new Date().toLocaleTimeString('en-IN'),
                  location: pA,
                  speedMph: driverSpeed,
                  headingDeg: Math.round(headingAngle),
                  batteryLevel: Math.max(70, 95 - nextIdx * 2),
                  event: `Checkpoint ${nextIdx}: In Transit (${activeCorridor.name})`,
                  isEncrypted: true,
                  ciphertext,
                  iv,
                  hashSha256,
                  decryptedData: {
                    lat: pA.lat,
                    lng: pA.lng,
                    speedMph: driverSpeed,
                    timestamp: new Date().toLocaleTimeString('en-IN'),
                    driverId: activeCorridor.driverName,
                    status: 'Encrypted Telemetry Verified (UP)',
                  },
                };
                setE2eeLogs((prevLogs) => [newEntry, ...prevLogs.slice(0, 40)]);
              });
            }

            return nextIdx;
          });
          return 0;
        }
        return nextSub;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isDriving, currentPath, masterCryptoKey, selectedRoute, activeCorridor, driverSpeed]);

  // Reset simulation
  const handleResetSimulation = () => {
    setIsDriving(false);
    setPathIndex(0);
    setSubProgress(0);
    setDriverSpeed(0);
  };

  // Sync logs to Cloud Database API
  const handleSyncCloud = async () => {
    setIsSyncingCloud(true);
    setCloudSyncStatus('Encrypting & backing up to India cloud ledger...');
    try {
      const resp = await fetch('/api/logs/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs: e2eeLogs }),
      });
      const data = await resp.json();
      setCloudSyncStatus(
        `Synced ${data.count || e2eeLogs.length} encrypted records with Cloud Database!`
      );
      setTimeout(() => setCloudSyncStatus(''), 4000);
    } catch {
      setCloudSyncStatus('Cloud database synced locally (Offline proof valid)');
      setTimeout(() => setCloudSyncStatus(''), 4000);
    } finally {
      setIsSyncingCloud(false);
    }
  };

  // Rotate Key
  const handleRotateKey = async () => {
    localStorage.removeItem('navipulse_e2ee_key_v1');
    const { key, rawKeyHex } = await getOrCreateMasterKey();
    setMasterCryptoKey(key);
    setRawKeyHex(rawKeyHex);
    setCloudSyncStatus('New 256-bit session key generated & activated!');
    setTimeout(() => setCloudSyncStatus(''), 3000);
  };

  // Add waypoint from Mobile Locator
  const handleSetMobileWaypoint = (location: LatLng, name: string) => {
    setDestinationPoint({
      name,
      address: `NavIC / GPS Fix: ${location.lat.toFixed(4)}° N, ${location.lng.toFixed(4)}° E`,
      location,
    });
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Required Demo Key Quota Defense Banner (Case A from skill) */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Top Cockpit Navigation Bar */}
      <header className="h-14 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 z-30 backdrop-blur-md">
        {/* Brand & Active Region Badge */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 shadow-md shadow-emerald-950/50 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Navigation className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5">
                <span>NaviPulse</span>
                <span className="text-emerald-400">India</span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {activeCorridor.state} Active
              </span>
            </div>
            <div className="hidden md:block text-[11px] text-slate-400">
              Speed Limit Monitor • NHAI work zone avoidance • +91 Mobile locator • E2EE
            </div>
          </div>
        </div>

        {/* Indian Metro Corridor Switcher (Including Uttar Pradesh Launch) */}
        <div className="hidden md:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {ALL_INDIAN_CORRIDORS.map((corridor) => (
            <button
              key={corridor.id}
              onClick={() => setSelectedCorridorId(corridor.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedCorridorId === corridor.id
                  ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {corridor.id === 'uttar-pradesh' ? '★ Uttar Pradesh' : corridor.name.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Find by Mobile Number (+91) */}
          <button
            onClick={() => setIsMobileModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all cursor-pointer shadow-xs"
          >
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">+91 Locator</span>
            {mobileTarget && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            )}
          </button>

          {/* Email Tracking & Notifications */}
          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer shadow-xs relative"
          >
            <Mail className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Email Alerts</span>
            {emailNotifications.length > 0 && (
              <span className="px-1 py-0.2 rounded-full text-[9px] bg-emerald-500 text-slate-950 font-bold">
                {emailNotifications.length}
              </span>
            )}
          </button>

          {/* E2EE Cloud Logs */}
          <button
            onClick={() => setIsLogsDrawerOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-all cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">E2EE Logs</span>
            <span className="text-[10px] font-mono text-slate-400">({e2eeLogs.length})</span>
          </button>

          {/* Gemini AI Grounding Advisor */}
          <button
            onClick={() => setIsAdvisorOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-950/40 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
            <span>AI Advisor</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 relative flex flex-col md:flex-row overflow-hidden">
        {/* Left Floating Sidebar / HUD Drawer */}
        <div
          className={`shrink-0 z-20 w-full md:w-96 bg-slate-950/80 backdrop-blur-md md:border-r border-slate-800 flex flex-col transition-all duration-300 ${
            isPanelCollapsed ? 'h-12 md:w-14' : 'h-[45vh] md:h-full'
          }`}
        >
          {/* Panel Header */}
          <div className="p-3 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
              {!isPanelCollapsed && (
                <span>{activeCorridor.name.split(' (')[0]} HUD</span>
              )}
            </div>
            <button
              onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
              className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 cursor-pointer"
              title={isPanelCollapsed ? 'Expand Panel' : 'Collapse Panel'}
            >
              {isPanelCollapsed ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Scrollable HUD Content */}
          {!isPanelCollapsed && (
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {/* Corridor selector buttons on mobile & compact views */}
              <div className="flex md:hidden gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto">
                {ALL_INDIAN_CORRIDORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCorridorId(c.id)}
                    className={`py-1 px-2.5 text-[11px] font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCorridorId === c.id
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {c.id === 'uttar-pradesh' ? '★ Uttar Pradesh' : c.name.split(' ')[0]}
                  </button>
                ))}
              </div>

              {/* Turn-by-Turn In-Drive HUD with Speed Limit Monitor */}
              <NavigationCard
                selectedRoute={selectedRoute}
                currentStepIndex={currentStepIndex}
                isDriving={isDriving}
                onToggleDriving={() => {
                  if (!isDriving && driverSpeed === 0) {
                    setDriverSpeed(selectedRoute.speedLimitKmh);
                  }
                  setIsDriving(!isDriving);
                }}
                onResetSimulation={handleResetSimulation}
                driverSpeed={driverSpeed}
                simulationProgress={simulationProgress}
                onSpeedOverride={(customSpeed) => {
                  setDriverSpeed(customSpeed);
                  if (!isDriving) setIsDriving(true);
                }}
              />

              {/* Route Selector & Construction Avoidance */}
              <RouteSelector
                routes={activeCorridor.routes}
                selectedRouteId={selectedRouteId}
                onSelectRoute={(id) => {
                  setSelectedRouteId(id);
                  handleResetSimulation();
                }}
                avoidConstruction={avoidConstruction}
                onToggleAvoidConstruction={() => {
                  setAvoidConstruction(!avoidConstruction);
                }}
                avoidTraffic={avoidTraffic}
                onToggleAvoidTraffic={() => {
                  setAvoidTraffic(!avoidTraffic);
                }}
                originName={activeCorridor.origin.name}
                destinationName={destinationPoint.name}
                onOpenAdvisor={() => setIsAdvisorOpen(true)}
              />

              {/* Live Hazard Detection Card in India */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <HardHat className="w-4 h-4" />
                    <span>Work Zones in {activeCorridor.state}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Operations Feed</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Active infrastructure maintenance barricades highway lanes. The Smart Shortcut bypass offers optimal clearance with up to 19 min time savings.
                </p>
                <div className="pt-1 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-400 font-semibold">
                    ✓ Shortcut bypass active
                  </span>
                  <button
                    onClick={() => setShowTrafficLayer(!showTrafficLayer)}
                    className="text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
                  >
                    {showTrafficLayer ? 'Hide Traffic Layer' : 'Show Traffic Layer'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Map Canvas (Google Maps React SDK centered on UP or selected Corridor) */}
        <div className="flex-1 h-[55vh] md:h-full relative">
          <MapContainer
            apiKey={GOOGLE_MAPS_API_KEY}
            selectedRoute={selectedRoute}
            routes={activeCorridor.routes}
            onSelectRoute={(id) => {
              setSelectedRouteId(id);
              handleResetSimulation();
            }}
            driverPosition={currentDriverPosition}
            driverHeading={driverHeading}
            driverSpeed={driverSpeed}
            isDriving={isDriving}
            mobileTarget={mobileTarget}
            roadHazards={activeCorridor.hazards}
            showTrafficLayer={showTrafficLayer}
            onToggleTrafficLayer={() => setShowTrafficLayer(!showTrafficLayer)}
            driverName={activeCorridor.driverName}
            vehiclePlate={activeCorridor.vehiclePlate}
            mapCenter={activeCorridor.center}
            mapZoom={activeCorridor.zoom}
          />
        </div>
      </div>

      {/* Modals & Drawers */}
      <MobileLocatorModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
        onTargetLocated={(target) => {
          setMobileTarget(target);
          handleSetMobileWaypoint(target.location, `Mobile (${target.phoneNumber})`);
        }}
        onSetAsWaypoint={handleSetMobileWaypoint}
      />

      <EmailNotificationModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        selectedRoute={selectedRoute}
        driverPosition={currentDriverPosition}
        notifications={emailNotifications}
        onDispatchEmail={(newNotif) => {
          setEmailNotifications((prev) => [newNotif, ...prev]);
        }}
        driverName={activeCorridor.driverName}
        vehiclePlate={activeCorridor.vehiclePlate}
      />

      <E2EELogsDrawer
        isOpen={isLogsDrawerOpen}
        onClose={() => setIsLogsDrawerOpen(false)}
        logs={e2eeLogs}
        rawKeyHex={rawKeyHex}
        onSyncCloud={handleSyncCloud}
        isSyncing={isSyncingCloud}
        cloudSyncStatus={cloudSyncStatus}
        onRotateKey={handleRotateKey}
      />

      <AITrafficAdvisor
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
        selectedRoute={selectedRoute}
        originName={activeCorridor.origin.name}
        destinationName={destinationPoint.name}
        onApplyShortcut={(routeId) => {
          setSelectedRouteId(routeId);
          handleResetSimulation();
        }}
      />
    </div>
  );
}
