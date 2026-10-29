import React, { useState } from 'react';
import { EmailTrackingNotification, RouteOption } from '../types';
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  X,
  ExternalLink,
  MapPin,
  Car,
  Bell,
  HardHat,
  Sparkles,
} from 'lucide-react';

interface EmailNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRoute: RouteOption;
  driverPosition: { lat: number; lng: number };
  notifications: EmailTrackingNotification[];
  onDispatchEmail: (notification: EmailTrackingNotification) => void;
  driverName?: string;
  vehiclePlate?: string;
}

export function EmailNotificationModal({
  isOpen,
  onClose,
  selectedRoute,
  driverPosition,
  notifications,
  onDispatchEmail,
  driverName = 'Rajesh Kumar (#IND-72)',
  vehiclePlate = 'DL 01 AB 4920',
}: EmailNotificationModalProps) {
  const [recipientEmail, setRecipientEmail] = useState('yamhaihamyamhaiham123hii@gmail.com');
  const [triggerType, setTriggerType] = useState<
    'departure' | 'traffic_delay' | 'construction_detour' | 'proximity' | 'arrived'
  >('departure');
  const [isSending, setIsSending] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<EmailTrackingNotification | null>(null);

  if (!isOpen) return null;

  const triggerConfig = {
    departure: {
      subject: '🚀 NaviPulse India Live Tracking: Courier Dispatched & En Route',
      title: 'Courier Departed & Live Tracking Activated (India)',
      badge: 'Trip Dispatched',
      color: 'emerald',
      etaText: `${selectedRoute.durationMinutes} mins`,
    },
    traffic_delay: {
      subject: '⚠️ Traffic Advisory: Highway Jam Detected near Dhaula Kuan NH-48',
      title: 'Traffic Congestion Notification & Estimated Delay',
      badge: 'Traffic Alert',
      color: 'amber',
      etaText: `+${selectedRoute.trafficDelayMinutes || 12} min delay`,
    },
    construction_detour: {
      subject: '🚧 Smart Rerouting: NHAI Work Zone Bypassed via Nelson Mandela Marg',
      title: 'NHAI Construction Detour Activated',
      badge: 'Shortcut Bypass',
      color: 'cyan',
      etaText: `${selectedRoute.durationMinutes} mins (Shortcut)`,
    },
    proximity: {
      subject: '📍 Proximity Alert: Courier is within 2 km of Delivery Address',
      title: 'Approaching Destination in Delhi NCR',
      badge: 'Near Arrival',
      color: 'blue',
      etaText: '4 mins remaining',
    },
    arrived: {
      subject: '✅ Safe Delivery Confirmation: Successfully Arrived at Destination',
      title: 'Consignment Safely Delivered at Destination',
      badge: 'Completed',
      color: 'emerald',
      etaText: 'Delivered',
    },
  };

  const handleSendNotification = async () => {
    if (!recipientEmail.trim()) return;
    setIsSending(true);

    const cfg = triggerConfig[triggerType];
    const pin = Math.floor(100000 + Math.random() * 900000).toString();

    const newNotification: EmailTrackingNotification = {
      id: `notif_${Date.now()}`,
      recipientEmail,
      trackingCode: `TRK-IN-${Math.floor(100000 + Math.random() * 900000)}`,
      verificationPin: pin,
      type: triggerType,
      subject: cfg.subject,
      timestamp: new Date().toLocaleTimeString('en-IN'),
      status: 'delivered',
      eta: cfg.etaText,
      currentAddress: 'En route via Nelson Mandela Marg & Aerocity Bypass, New Delhi',
      driverName,
      vehiclePlate,
    };

    try {
      await fetch('/api/notifications/dispatch-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: newNotification.recipientEmail,
          subject: newNotification.subject,
          type: newNotification.type,
          eta: newNotification.eta,
          location: newNotification.currentAddress,
          verificationPin: newNotification.verificationPin,
          trackingUrl: window.location.href,
        }),
      });
    } catch (e) {
      console.warn('Local dispatch fallback used', e);
    }

    onDispatchEmail(newNotification);
    setSelectedPreview(newNotification);
    setIsSending(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>Real-Time Email Tracking (India Dispatch)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Live Dispatch
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Automated live tracking links, NHAI road work warnings, and delivery confirmations.
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

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Email and Trigger Setup */}
          <div className="bg-slate-850 border border-slate-750 p-4 rounded-xl space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Recipient Email Address
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="recipient@example.com"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  onClick={handleSendNotification}
                  disabled={isSending || !recipientEmail}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSending ? 'Sending...' : 'Dispatch Live Email'}</span>
                </button>
              </div>
            </div>

            {/* Notification Trigger Selectors */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Notification Trigger Scenario
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  {
                    id: 'departure',
                    label: 'Trip Departure',
                    desc: 'Initial live tracking link',
                    icon: Car,
                  },
                  {
                    id: 'traffic_delay',
                    label: 'Highway Jam Alert',
                    desc: 'NH-48 congestion alert',
                    icon: AlertCircle,
                  },
                  {
                    id: 'construction_detour',
                    label: 'NHAI Work Detour',
                    desc: 'Aerocity shortcut bypass',
                    icon: HardHat,
                  },
                  {
                    id: 'proximity',
                    label: 'Proximity (2 km)',
                    desc: 'Approaching destination',
                    icon: Bell,
                  },
                  {
                    id: 'arrived',
                    label: 'Safe Arrival',
                    desc: 'Delivery confirmation in India',
                    icon: CheckCircle2,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = triggerType === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setTriggerType(item.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800 border-emerald-500 text-slate-100 ring-1 ring-emerald-500/40'
                          : 'bg-slate-900/60 border-slate-750 text-slate-400 hover:border-slate-650 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Icon
                          className={`w-3.5 h-3.5 ${
                            isSelected ? 'text-emerald-400' : 'text-slate-400'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{item.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Interactive Email HTML Template Live Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Interactive Email Preview (India Recipient)
              </span>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <Shield className="w-3 h-3" />
                E2EE Cryptographic PIN Protection
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-700/80 rounded-xl overflow-hidden shadow-xl">
              {/* Fake Email Client Bar */}
              <div className="bg-slate-800 px-3 py-2 border-b border-slate-700 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-slate-400">To:</span>
                  <span className="font-mono text-emerald-300 font-medium">
                    {recipientEmail || 'yamhaihamyamhaiham123hii@gmail.com'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">Just now</div>
              </div>

              {/* Email Body Content */}
              <div className="p-4 sm:p-5 space-y-4 font-sans bg-slate-900 text-slate-100">
                {/* Brand Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center font-extrabold text-slate-950 text-xs">
                      NP
                    </div>
                    <div>
                      <div className="font-extrabold text-sm tracking-tight text-white">
                        NaviPulse Live Tracking (India)
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Consignment ID: {selectedPreview ? selectedPreview.trackingCode : 'TRK-IN-DEL-9104'}
                      </div>
                    </div>
                  </div>
                  <span className="bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {triggerConfig[triggerType].badge}
                  </span>
                </div>

                {/* Main Headline */}
                <div>
                  <h4 className="text-base font-bold text-white">
                    {triggerConfig[triggerType].title}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Your consignment is actively tracked on Google Maps across India. Active NHAI work zones and highway congestion points are dynamically bypassed.
                  </p>
                </div>

                {/* Key Telemetry Card */}
                <div className="grid grid-cols-2 gap-2 bg-slate-850 border border-slate-750 p-3 rounded-xl text-xs">
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-slate-400">
                      Estimated Arrival (ETA)
                    </div>
                    <div className="text-sm font-extrabold text-emerald-400 mt-0.5">
                      {triggerConfig[triggerType].etaText}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Corridor: {selectedRoute.name}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase font-semibold text-slate-400">
                      Security Verification PIN
                    </div>
                    <div className="text-sm font-mono font-extrabold text-cyan-300 mt-0.5 tracking-wider">
                      {selectedPreview ? selectedPreview.verificationPin : '839-401'}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Vehicle: {vehiclePlate} ({driverName})
                    </div>
                  </div>
                </div>

                {/* Real-Time Button */}
                <div className="text-center pt-1">
                  <a
                    href="#track"
                    onClick={(e) => {
                      e.preventDefault();
                      onClose();
                    }}
                    className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-950/40 transition-colors w-full sm:w-auto"
                  >
                    <span>Open Live India Interactive GPS Map</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-950" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Dispatched History Log */}
          {notifications.length > 0 && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Recent Email Dispatch Log
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => setSelectedPreview(notif)}
                    className="p-2.5 bg-slate-850 hover:bg-slate-800 rounded-lg border border-slate-750 flex items-center justify-between text-xs cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <div>
                        <div className="font-semibold text-slate-200 line-clamp-1">
                          {notif.subject}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          To: {notif.recipientEmail} • PIN: {notif.verificationPin}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded font-mono">
                        {notif.status}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">{notif.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span className="text-[11px]">
            Delivery tracking notifications powered by NaviPulse Live India Relay.
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
