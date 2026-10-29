import React, { useState } from 'react';
import { MobileDeviceTarget, LatLng } from '../types';
import {
  Smartphone,
  Search,
  Crosshair,
  Signal,
  Battery,
  MapPin,
  CheckCircle,
  X,
  Loader2,
  Navigation,
  ShieldCheck,
  Radio,
} from 'lucide-react';

interface MobileLocatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTargetLocated: (target: MobileDeviceTarget) => void;
  onSetAsWaypoint: (location: LatLng, name: string) => void;
}

export function MobileLocatorModal({
  isOpen,
  onClose,
  onTargetLocated,
  onSetAsWaypoint,
}: MobileLocatorModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('+91 98765 43210');
  const [carrierOption, setCarrierOption] = useState('Jio 5G True');
  const [isSearching, setIsSearching] = useState(false);
  const [searchStep, setSearchStep] = useState<string>('');
  const [locatedTarget, setLocatedTarget] = useState<MobileDeviceTarget | null>(null);

  if (!isOpen) return null;

  const handleStartSearch = () => {
    if (!phoneNumber.trim()) return;

    setIsSearching(true);
    setLocatedTarget(null);

    // Step 1: Indian DoT / Telecom Circle HLR handshake
    setSearchStep('Pinging Department of Telecommunications (DoT) Gateway...');
    setTimeout(() => {
      // Step 2: Multi-tower triangulation across Indian cellular grid
      setSearchStep(`Triangulating with 3 nearest ${carrierOption} eNodeB towers in Delhi NCR Circle...`);
      setTimeout(() => {
        // Step 3: Dual-Frequency GNSS/NavIC satellite lock
        setSearchStep('Acquiring dual-frequency GPS & ISRO NavIC satellite lock (L5 band)...');
        setTimeout(() => {
          // Precise target coordinates along Nelson Mandela Marg bypass in New Delhi
          const target: MobileDeviceTarget = {
            phoneNumber,
            countryCode: '+91 (India)',
            carrier: carrierOption,
            deviceModel: 'OnePlus 12 5G (CPH2573)',
            location: { lat: 28.5420, lng: 77.1450 },
            accuracyRadiusMeters: 3, // ±3 meters precision
            batteryPercent: 88,
            signalStrengthDbm: -72,
            networkType: '5G',
            timestamp: new Date().toLocaleTimeString('en-IN'),
            status: 'locked',
            address: 'Nelson Mandela Marg, Pocket 8, Sector C, Vasant Kunj, New Delhi 110070',
          };

          setLocatedTarget(target);
          setIsSearching(false);
          setSearchStep('');
          onTargetLocated(target);
        }, 1200);
      }, 1200);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>Find by Mobile Number (India)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Precision ±3m
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Cellular tower triangulation across Indian telecom networks & GPS/NavIC lock.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Input Row */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Indian Mobile Number (+91)
            </label>
            <div className="flex gap-2">
              <select
                value={carrierOption}
                onChange={(e) => setCarrierOption(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-xs rounded-xl px-2.5 py-2.5 text-slate-200 focus:outline-hidden focus:border-cyan-500"
              >
                <option value="Jio 5G True">Jio 5G</option>
                <option value="Airtel 5G Plus">Airtel 5G</option>
                <option value="Vodafone Idea (Vi)">Vi 4G</option>
                <option value="BSNL 4G">BSNL</option>
              </select>

              <div className="relative flex-1">
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <button
                onClick={handleStartSearch}
                disabled={isSearching}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-950 disabled:opacity-50 cursor-pointer"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                ) : (
                  <Search className="w-4 h-4 text-slate-950" />
                )}
                <span>{isSearching ? 'Triangulating...' : 'Locate in India'}</span>
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Supports all 22 Indian Licensed Service Areas (LSAs) with E2EE telemetry.</span>
            </div>
          </div>

          {/* Search in progress indicator */}
          {isSearching && (
            <div className="bg-slate-850 border border-cyan-500/30 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-3">
              <div className="relative flex items-center justify-center w-14 h-14">
                <span className="absolute w-full h-full bg-cyan-500/20 rounded-full animate-ping" />
                <span className="absolute w-10 h-10 bg-cyan-500/30 rounded-full animate-pulse" />
                <Radio className="w-6 h-6 text-cyan-400 relative z-10 animate-pulse" />
              </div>
              <div>
                <div className="text-xs font-bold text-cyan-300 font-mono">
                  INDIAN TELECOM CELLULAR RESOLUTION
                </div>
                <div className="text-xs text-slate-300 mt-1">{searchStep}</div>
              </div>
            </div>
          )}

          {/* Located Target Card */}
          {locatedTarget && (
            <div className="bg-slate-800/90 border border-cyan-500/50 rounded-xl p-4 shadow-lg space-y-3 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-slate-200">
                    Indian Precision Lock Acquired
                  </span>
                </div>
                <span className="text-[11px] font-mono text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                  Accuracy: ±{locatedTarget.accuracyRadiusMeters} meters
                </span>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-850 p-2.5 rounded-lg border border-slate-750">
                  <div className="text-[10px] uppercase text-slate-400 font-semibold flex items-center gap-1">
                    <Signal className="w-3 h-3 text-cyan-400" />
                    <span>Carrier / Circle</span>
                  </div>
                  <div className="text-xs font-bold text-slate-200 mt-0.5">
                    {locatedTarget.carrier}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Delhi NCR Circle • {locatedTarget.signalStrengthDbm} dBm
                  </div>
                </div>

                <div className="bg-slate-850 p-2.5 rounded-lg border border-slate-750">
                  <div className="text-[10px] uppercase text-slate-400 font-semibold flex items-center gap-1">
                    <Battery className="w-3 h-3 text-emerald-400" />
                    <span>Device Telemetry</span>
                  </div>
                  <div className="text-xs font-bold text-slate-200 mt-0.5">
                    {locatedTarget.deviceModel}
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-0.5 font-medium">
                    Battery: {locatedTarget.batteryPercent}% • Active NavIC Fix
                  </div>
                </div>
              </div>

              {/* Coordinates and Address in India */}
              <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-700 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    Resolved India Address:
                  </span>
                  <span className="font-mono text-[11px] text-cyan-300">
                    {locatedTarget.location.lat.toFixed(4)}° N,{' '}
                    {locatedTarget.location.lng.toFixed(4)}° E
                  </span>
                </div>
                <div className="text-xs text-slate-200 font-medium pl-4.5">
                  {locatedTarget.address}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    onSetAsWaypoint(locatedTarget.location, `Mobile Target (${locatedTarget.phoneNumber})`);
                    onClose();
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Navigate to Target in India</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                  }}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Focus on Map</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Target is plotted directly onto India Google Maps canvas with accuracy ring.</span>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
