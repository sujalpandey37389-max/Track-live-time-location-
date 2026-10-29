export interface LatLng {
  lat: number;
  lng: number;
}

export type RouteType = 'shortcut' | 'highway' | 'safe_scenic';

export interface RouteOption {
  id: string;
  name: string;
  type: RouteType;
  badge: string;
  distanceKm: number;
  durationMinutes: number;
  trafficDelayMinutes: number;
  constructionCount: number;
  color: string;
  description: string;
  savings?: string;
  speedLimitKmh: number;
  roadType: 'expressway' | 'highway' | 'arterial' | 'work_zone';
  path: LatLng[];
  steps: {
    instruction: string;
    distance: string;
    time: string;
    icon: 'turn-right' | 'turn-left' | 'straight' | 'merge' | 'hazard' | 'finish';
    hazardAlert?: string;
  }[];
}

export interface RoadHazard {
  id: string;
  type: 'construction' | 'traffic_jam' | 'accident' | 'lane_closure';
  title: string;
  description: string;
  location: LatLng;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  detourRecommended: boolean;
  activeUntil?: string;
}

export interface MobileDeviceTarget {
  phoneNumber: string;
  countryCode: string;
  carrier: string;
  deviceModel: string;
  location: LatLng;
  accuracyRadiusMeters: number;
  batteryPercent: number;
  signalStrengthDbm: number;
  networkType: '5G' | '4G LTE' | 'Satellite GPS';
  timestamp: string;
  status: 'locked' | 'triangulating' | 'idle';
  address: string;
}

export interface EmailTrackingNotification {
  id: string;
  recipientEmail: string;
  trackingCode: string;
  verificationPin: string;
  type: 'departure' | 'traffic_delay' | 'construction_detour' | 'proximity' | 'arrived';
  subject: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'opened';
  eta: string;
  currentAddress: string;
  driverName: string;
  vehiclePlate: string;
}

export interface E2EELogEntry {
  id: string;
  timestamp: string;
  location: LatLng;
  speedMph: number;
  headingDeg: number;
  batteryLevel: number;
  event: string;
  isEncrypted: boolean;
  ciphertext?: string;
  iv?: string;
  hashSha256: string;
  decryptedData?: {
    lat: number;
    lng: number;
    speedMph: number;
    timestamp: string;
    driverId: string;
    status: string;
  };
}

export interface GeminiAdvisorResponse {
  summary: string;
  bestRouteName: string;
  trafficStatus: string;
  constructionNotes: string[];
  safeSpeedAdvice: string;
  groundedPlaces: { name: string; note: string }[];
  sources?: string[];
}
