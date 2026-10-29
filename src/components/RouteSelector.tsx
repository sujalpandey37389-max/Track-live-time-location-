import React from 'react';
import { RouteOption, LatLng } from '../types';
import {
  Zap,
  Shield,
  Clock,
  Navigation2,
  HardHat,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface RouteSelectorProps {
  routes: RouteOption[];
  selectedRouteId: string;
  onSelectRoute: (id: string) => void;
  avoidConstruction: boolean;
  onToggleAvoidConstruction: () => void;
  avoidTraffic: boolean;
  onToggleAvoidTraffic: () => void;
  originName: string;
  destinationName: string;
  onOpenAdvisor: () => void;
}

export function RouteSelector({
  routes,
  selectedRouteId,
  onSelectRoute,
  avoidConstruction,
  onToggleAvoidConstruction,
  avoidTraffic,
  onToggleAvoidTraffic,
  originName,
  destinationName,
  onOpenAdvisor,
}: RouteSelectorProps) {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-md">
      {/* Origin & Destination Display */}
      <div className="relative pl-6 space-y-3 mb-4 pb-4 border-b border-slate-800">
        {/* Connector Line */}
        <div className="absolute left-2.5 top-2.5 bottom-2.5 w-0.5 bg-gradient-to-b from-emerald-500 via-slate-600 to-rose-500" />

        {/* Origin */}
        <div className="relative">
          <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
          <div className="text-[10px] uppercase font-bold text-slate-400">Origin Depot</div>
          <div className="text-xs font-semibold text-slate-200 truncate">{originName}</div>
        </div>

        {/* Destination */}
        <div className="relative">
          <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-500/20" />
          <div className="text-[10px] uppercase font-bold text-slate-400">Destination Delivery</div>
          <div className="text-xs font-semibold text-slate-200 truncate">{destinationName}</div>
        </div>
      </div>

      {/* Avoidance Filter Toggles */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={onToggleAvoidConstruction}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            avoidConstruction
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs'
              : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
          }`}
        >
          <HardHat className="w-3.5 h-3.5 text-amber-400" />
          <span>Avoid Work Zones</span>
          {avoidConstruction && <span className="text-[10px] bg-amber-500/30 px-1 rounded">Active</span>}
        </button>

        <button
          onClick={onToggleAvoidTraffic}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            avoidTraffic
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs'
              : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
          }`}
        >
          <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
          <span>Avoid Heavy Congestion</span>
          {avoidTraffic && <span className="text-[10px] bg-emerald-500/30 px-1 rounded">Active</span>}
        </button>
      </div>

      {/* Available Routes List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span>Calculated Routes</span>
          <button
            onClick={onOpenAdvisor}
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold text-[11px] capitalize cursor-pointer transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>AI Live Grounding</span>
          </button>
        </div>

        {routes.map((route) => {
          const isSelected = route.id === selectedRouteId;
          const isShortcut = route.type === 'shortcut';
          const isHighway = route.type === 'highway';

          return (
            <div
              key={route.id}
              onClick={() => onSelectRoute(route.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-800/90 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              {/* Highlight accent pill */}
              <div
                className="absolute top-0 left-0 bottom-0 w-1"
                style={{ backgroundColor: route.color }}
              />

              <div className="flex items-start justify-between gap-2 mb-1 pl-1">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-100">{route.name}</span>
                    {isShortcut && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        ⚡ Shortcut
                      </span>
                    )}
                    {isHighway && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        🚧 2 Work Zones
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{route.description}</p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-extrabold text-slate-100 flex items-center justify-end gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{route.durationMinutes} min</span>
                  </div>
                  <div className="text-[11px] text-slate-400">{route.distanceKm} km</div>
                </div>
              </div>

              {/* Status metrics footer */}
              <div className="flex items-center justify-between text-[11px] pt-2 mt-1 border-t border-slate-800/80 pl-1">
                <div className="flex items-center gap-3">
                  {route.trafficDelayMinutes > 0 ? (
                    <span className="text-amber-400 flex items-center gap-1 font-medium">
                      <AlertTriangle className="w-3 h-3" />
                      +{route.trafficDelayMinutes}m delay
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-medium">No traffic delays</span>
                  )}

                  {route.constructionCount > 0 ? (
                    <span className="text-rose-400 flex items-center gap-1 font-medium">
                      <HardHat className="w-3 h-3" />
                      {route.constructionCount} road works
                    </span>
                  ) : (
                    <span className="text-slate-400">0 hazards</span>
                  )}
                </div>

                {route.savings && (
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900">
                    {route.savings}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
