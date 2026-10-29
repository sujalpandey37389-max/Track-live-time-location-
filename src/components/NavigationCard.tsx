import React, { useState, useEffect } from 'react';
import { RouteOption } from '../types';
import {
  Navigation,
  ArrowRight,
  ArrowUp,
  CornerUpRight,
  CornerUpLeft,
  Merge,
  HardHat,
  Volume2,
  VolumeX,
  Gauge,
  ShieldCheck,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Zap,
} from 'lucide-react';

interface NavigationCardProps {
  selectedRoute: RouteOption;
  currentStepIndex: number;
  isDriving: boolean;
  onToggleDriving: () => void;
  onResetSimulation: () => void;
  driverSpeed: number; // in km/h
  simulationProgress: number; // 0 to 100
  onSpeedOverride?: (speed: number) => void;
}

export function NavigationCard({
  selectedRoute,
  currentStepIndex,
  isDriving,
  onToggleDriving,
  onResetSimulation,
  driverSpeed,
  simulationProgress,
  onSpeedOverride,
}: NavigationCardProps) {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [hasAnnouncedWarning, setHasAnnouncedWarning] = useState(false);

  const currentStep =
    selectedRoute.steps[
      Math.min(currentStepIndex, selectedRoute.steps.length - 1)
    ] || selectedRoute.steps[0];

  // Speed Limit Monitor logic
  const speedLimit = selectedRoute.speedLimitKmh || 60;
  const isOverspeeding = driverSpeed > speedLimit;
  const overspeedDelta = driverSpeed - speedLimit;

  // Road type descriptor
  const roadTypeLabels: Record<string, string> = {
    expressway: 'Expressway Corridor',
    highway: 'National Highway (NH)',
    arterial: 'Urban Arterial Bypass',
    work_zone: 'Active Construction Work Zone',
  };

  // Voice announcements for Maneuvers and Speed Warnings
  useEffect(() => {
    if (!audioEnabled || !isDriving) return;

    if ('speechSynthesis' in window) {
      if (isOverspeeding && !hasAnnouncedWarning) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(
          `Attention driver: Speed limit of ${speedLimit} kilometers per hour exceeded. Please slow down.`
        );
        utterance.rate = 1.05;
        utterance.lang = 'en-IN';
        window.speechSynthesis.speak(utterance);
        setHasAnnouncedWarning(true);
      } else if (!isOverspeeding && hasAnnouncedWarning) {
        setHasAnnouncedWarning(false);
      }
    }
  }, [isOverspeeding, audioEnabled, isDriving, speedLimit, hasAnnouncedWarning]);

  // Maneuver turn voice announcement
  useEffect(() => {
    if (!audioEnabled || !isDriving || !currentStep || isOverspeeding) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentStep.instruction);
      utterance.rate = 1.05;
      utterance.lang = 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
  }, [currentStepIndex, audioEnabled, isDriving, isOverspeeding]);

  const renderStepIcon = (iconName: string) => {
    switch (iconName) {
      case 'turn-right':
        return <CornerUpRight className="w-5 h-5 text-emerald-400" />;
      case 'turn-left':
        return <CornerUpLeft className="w-5 h-5 text-emerald-400" />;
      case 'merge':
        return <Merge className="w-5 h-5 text-cyan-400" />;
      case 'hazard':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      default:
        return <ArrowUp className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-md space-y-3">
      {/* Top Controls: Play/Pause simulation, Reset, Voice toggle */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleDriving}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
              isDriving
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
            }`}
          >
            {isDriving ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause Trip</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{simulationProgress > 0 ? 'Resume Drive' : 'Start Live Drive'}</span>
              </>
            )}
          </button>

          <button
            onClick={onResetSimulation}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Reset to Origin"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Voice Prompt Toggle */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 border transition-colors cursor-pointer ${
              audioEnabled
                ? 'bg-slate-800 text-emerald-400 border-slate-700'
                : 'bg-slate-850 text-slate-500 border-slate-800'
            }`}
            title={audioEnabled ? 'Voice Guidance Active (Indian English)' : 'Voice Muted'}
          >
            {audioEnabled ? (
              <Volume2 className="w-3.5 h-3.5" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Speedometer badge with Flash-to-Amber when overspeeding */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-xs transition-all duration-300 ${
              isOverspeeding
                ? 'bg-amber-500/25 border-amber-400 text-amber-300 ring-2 ring-amber-400/60 animate-pulse shadow-md shadow-amber-950/50'
                : 'bg-slate-950 border-slate-800 text-slate-100'
            }`}
          >
            <Gauge
              className={`w-3.5 h-3.5 ${
                isOverspeeding ? 'text-amber-400 animate-bounce' : 'text-emerald-400'
              }`}
            />
            <span className="font-extrabold">{driverSpeed}</span>
            <span className="text-[10px] text-slate-400">KM/H</span>
          </div>
        </div>
      </div>

      {/* Speed Limit Monitor Card */}
      <div
        className={`p-3 rounded-xl border transition-all duration-300 ${
          isOverspeeding
            ? 'bg-amber-950/40 border-amber-500/80 ring-2 ring-amber-500/40 animate-pulse'
            : 'bg-slate-850/80 border-slate-750'
        }`}
      >
        <div className="flex items-center justify-between text-xs mb-1.5">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isOverspeeding ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
              }`}
            />
            <span className="font-bold text-slate-200 uppercase tracking-wide text-[10px]">
              Speed Limit Monitor
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400">Road Limit:</span>
            <span className="font-mono font-extrabold text-xs text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-700">
              {speedLimit} KM/H
            </span>
          </div>
        </div>

        {/* Road Type & Status Row */}
        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/80">
          <span className="text-slate-400">
            {roadTypeLabels[selectedRoute.roadType] || 'Corridor Zone'}
          </span>

          {isOverspeeding ? (
            <span className="text-amber-300 font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>+{overspeedDelta} KM/H Overspeed!</span>
            </span>
          ) : (
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Safe Driving Speed</span>
            </span>
          )}
        </div>

        {/* Visual Flash Warning Message (Amber Alert) */}
        {isOverspeeding && (
          <div className="mt-2 bg-amber-500/15 border border-amber-400/50 p-2 rounded-lg text-[11px] text-amber-200 flex items-start gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-amber-300">
                Speed Limit Exceeded ({driverSpeed} km/h vs {speedLimit} km/h safe cap).
              </strong>{' '}
              High-risk corridor. Decelerate to avoid traffic penalties and construction hazards.
            </div>
          </div>
        )}

        {/* Interactive Speed Simulator Controls */}
        {onSpeedOverride && (
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
            <span className="text-[10px] text-slate-400">Simulate Speed:</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => onSpeedOverride(speedLimit - 10)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium border cursor-pointer ${
                  !isOverspeeding && driverSpeed > 0
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                Safe ({speedLimit - 10} km/h)
              </button>
              <button
                onClick={() => onSpeedOverride(speedLimit + 18)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer ${
                  isOverspeeding
                    ? 'bg-amber-500/30 text-amber-300 border-amber-500/60 ring-1 ring-amber-400'
                    : 'bg-slate-800 text-amber-400 border-slate-700 hover:bg-amber-950/40'
                }`}
              >
                Trigger Warning ({speedLimit + 18} km/h)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* In-Drive Progress Bar */}
      <div>
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
          <span>Drive Progress: {Math.round(simulationProgress)}%</span>
          <span>
            Step {Math.min(currentStepIndex + 1, selectedRoute.steps.length)} of{' '}
            {selectedRoute.steps.length}
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-300"
            style={{ width: `${simulationProgress}%` }}
          />
        </div>
      </div>

      {/* Maneuver HUD Card */}
      <div className="bg-slate-850 border border-slate-750 p-3.5 rounded-xl flex items-start gap-3 relative overflow-hidden">
        <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 shadow-inner shrink-0">
          {renderStepIcon(currentStep?.icon || 'straight')}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase font-bold text-emerald-400 font-mono tracking-wider">
              {currentStep?.distance || 'In 400 meters'} • {currentStep?.time || '1 min'}
            </span>
            {isDriving && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </div>
          <div className="text-xs font-bold text-slate-100 mt-0.5 leading-snug">
            {currentStep?.instruction || 'Proceed along designated Indian arterial route'}
          </div>

          {/* Hazard Alert on this step if present */}
          {currentStep?.hazardAlert && (
            <div className="mt-2 bg-amber-950/50 border border-amber-500/40 p-2 rounded-lg text-[11px] text-amber-300 flex items-center gap-1.5">
              <HardHat className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{currentStep.hazardAlert}</span>
            </div>
          )}
        </div>
      </div>

      {/* Safe Drive Assurance Badge */}
      <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between text-[11px] text-slate-300">
        <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>India Safe Drive Active</span>
        </div>
        <span className="text-slate-400">
          {selectedRoute.type === 'shortcut'
            ? 'Bypasses NHAI work zones'
            : selectedRoute.type === 'safe_scenic'
            ? 'Smooth arterial corridor'
            : 'Caution: Highway repairs'}
        </span>
      </div>
    </div>
  );
}
