# NaviPulse Live: India Map Specialization Plan

Comprehensive architecture and implementation strategy to specialize the live GPS navigation, email tracking dispatch, mobile number locator, and E2EE telemetry exclusively for India.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> Because the clarifying questions were skipped, we have applied the recommended defaults tailored specifically for Indian logistics and navigation:
> - **Primary Corridor**: Delhi NCR (Connaught Place Logistics Depot $\rightarrow$ NH-48 / Delhi-Gurugram Expressway $\rightarrow$ Indira Gandhi International Airport IGI Terminal 3), with a one-click Metro Corridor Switcher supporting Mumbai (BKC to Chhatrapati Shivaji Maharaj Airport via Western Express Highway & Bandra-Worli Sea Link bypass) and Bengaluru (Electronic City to Kempegowda Airport via Outer Ring Road & Bellary Road).
> - **Mobile Locator & Carrier Grid**: Defaulted to `+91` India with 10-digit mobile number validation and Indian carriers (Jio 5G True, Airtel 5G Plus, Vodafone Idea Vi, BSNL 4G) across Indian telecom circles (Delhi NCR, Mumbai, Karnataka).
> - **Road Hazards & NHAI Intelligence**: Real-time road work alerts reflecting NHAI highway widening, flyover maintenance, waterlogging hotspots, and expressway toll bypass shortcuts.
> - **Metrics & Locale**: All telemetry rendered in `km/h`, distances in `km`, and Google Maps initialized with `region="IN"` and `language="en-IN"`.

---

## 1. Overview & Core Concept

- **What It Does**: Repositions the live tracking engine exclusively to India's transportation network. Provides live GPS carrier tracking, NHAI construction bypass shortcuts, real-time traffic congestion avoidance, Indian mobile device cellular triangulation, email dispatch tracking, and zero-knowledge end-to-end encrypted cloud logs.
- **Target Audience**: Indian logistics dispatchers, couriers, fleet managers, and recipients across major Indian economic corridors.
- **Key Value**: Reliable real-time tracking across Indian urban and intercity routes with dynamic shortcuts that avoid chronic highway bottlenecks and active road construction.

---

## 2. User Experience & Visual Design

- **Map Centering & India Regionalization**:
  - Sets Google Maps bounding box to India with default focus on the chosen metro corridor (Delhi NCR: `28.6139° N, 77.2090° E`).
  - Restricts Places, Autocomplete, and Geocoding calls to Indian territory (`country: 'in'`).
  - Map options configured with `region="IN"` and `language="en-IN"`.
- **Metro Corridor Selector**:
  - Segmented control in the navigation header allowing instant switching between:
    1. **Delhi NCR**: Connaught Place $\rightarrow$ NH-48 Gurugram $\rightarrow$ IGI Airport T3 (with Mahipalpur bypass shortcut).
    2. **Mumbai Metropolitan**: BKC Commercial Center $\rightarrow$ Western Express Highway $\rightarrow$ Chhatrapati Shivaji Airport (with Bandra-Worli Sea Link & Vakola flyover bypass).
    3. **Bengaluru Tech Hub**: Electronic City Phase 1 $\rightarrow$ Silk Board / Outer Ring Road $\rightarrow$ Kempegowda International Airport (with Hosur Elevated & Bellary Expressway shortcut).
- **Navigation HUD & Unit Localization**:
  - Speedometer displayed strictly in **km/h** (e.g. `65 km/h` on open expressways, `25 km/h` in congested urban arterial zones).
  - Indian highway numbering standards (NH-48, NE-4, Ring Road, NH-44).
  - Voice announcements tailored to Indian intersections, roundabouts, and expressway exits.
- **Mobile Number Locator for India**:
  - Preset with `+91` country code.
  - Formatted for standard 10-digit Indian mobile numbers (`+91 98765 43210`).
  - Triangulation simulation referencing Indian cell towers and telecom circles (Delhi LSA, Mumbai Metro Circle, Karnataka Circle).
- **End-to-End Encrypted Cloud Logs**:
  - Stored coordinates, timestamps, and vehicle registration plates updated to Indian transport standards (e.g., `DL 01 AB 4920`, `MH 02 CZ 8190`, `KA 05 MN 3210`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Multi-Metro Corridor Switcher vs Single City**
  - *Chosen Approach*: Implement a primary Delhi NCR corridor while providing a quick one-click switcher for Mumbai and Bengaluru.
  - *Why*: Allows users across different parts of India to immediately test and experience live real-time routing, shortcuts, and construction avoidance in their preferred city without manual coordinate entry.
- **Decision 2: Indian Cellular Provider Integration**
  - *Chosen Approach*: Replace US carriers with India's primary operators: Reliance Jio, Bharti Airtel, Vodafone Idea (Vi), and BSNL.
  - *Why*: Delivers an authentic and accurate localized user experience for device tracking.
- **Decision 3: Gemini 3.8 Flash Maps Grounding Localization**
  - *Chosen Approach*: Update the server-side Gemini prompt to ground specifically in Indian road networks, NHAI infrastructure updates, and local traffic norms (e.g., peak-hour traffic jams, toll plazas, flyover repairs).

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NaviPulse Live (India)                          │
├──────────────────────────────────┬─────────────────────────────────────┤
│ Left / Drawer HUD                │ Right Map Viewport                  │
│ ┌──────────────────────────────┐ │ ┌─────────────────────────────────┐ │
│ │ Metro Corridor Switcher      │ │ │ Google Maps (region="IN")       │ │
│ │ [Delhi NCR | Mumbai | BLR]   │ │ │ mapId="DEMO_MAP_ID"             │ │
│ ├──────────────────────────────┤ │ │ TrafficLayer (Live Congestion)  │ │
│ │ Live Turn-by-Turn Guidance   │ │ ├─────────────────────────────────┤ │
│ │ • Speedometer in km/h        │ │ │ AdvancedMarkers:                │ │
│ │ • NHAI Construction Alerts   │ │ │ • Live Vehicle (Indian Plate)   │ │
│ ├──────────────────────────────┤ │ │ • Origin & Destination Pins     │ │
│ │ Route Selector               │ │ │ • Mobile Locator (±3m ring)     │ │
│ │ • Smart Shortcut (Bypass)    │ │ │ • NHAI Work Zone Hazards        │ │
│ │ • Main Highway (Heavy Jam)   │ │ └─────────────────────────────────┘ │
│ │ • Safe Commercial Drive      │ │                                     │
│ └──────────────────────────────┘ │                                     │
├──────────────────────────────────┴─────────────────────────────────────┤
│ Modals & Cryptographic Storage                                         │
│ • +91 Indian Mobile Locator (Jio/Airtel/Vi/BSNL cellular triangulation)│
│ • Live Email Dispatch to yamhaihamyamhaiham123hii@gmail.com           │
│ • Web Crypto API (AES-256-GCM + SHA-256) E2EE Cloud Database Backup    │
│ • Server Proxy (/api/gemini/road-advisor with Google Maps Grounding)   │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Modifications
- `src/data/mockRoutes.ts`:
  - Replace San Francisco coordinates with curated Indian metro routes:
    1. **Delhi NCR Corridor**:
       - Origin: Connaught Place Logistics Hub (`28.6315° N, 77.2167° E`)
       - Destination: Indira Gandhi International Airport T3 (`28.5562° N, 77.1000° E`)
       - Shortcut: Mahipalpur Bypass & Nelson Mandela Marg (avoids Dhaula Kuan flyover repair & Rao Tula Ram bottleneck)
       - Highway: NH-48 Corridor (2 active work zones, heavy stop-and-go)
       - Safe Drive: Vasant Kunj Arterial Green Corridor
    2. **Mumbai Corridor**:
       - BKC to Chhatrapati Shivaji Maharaj International Airport via Western Express Highway with Sea Link connection.
    3. **Bengaluru Corridor**:
       - Electronic City to Kempegowda International Airport via Elevated Expressway.
- `src/components/MapContainer.tsx`:
  - Center on India (`defaultCenter = { lat: 28.58, lng: 77.16 }`, `region="IN"`, `language="en-IN"`).
  - Update vehicle label to Indian courier formats.
- `src/components/MobileLocatorModal.tsx`:
  - Default country code to `+91 (India)`.
  - Carriers: Jio 5G, Airtel 5G, Vi, BSNL.
  - Coordinate resolution to Indian telecom circles.
- `src/components/NavigationCard.tsx`:
  - Speed limits in km/h (`80 km/h` highway, `40 km/h` city).
- `src/server.ts` & `vite.config.ts`:
  - Gemini prompt tuned for Indian transit, NHAI advisories, and local route shortcuts.
