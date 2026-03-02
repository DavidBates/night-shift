export const HOUR_DURATION_MS = 8000; // 8 seconds per hour real time (48s night)

export const DEFAULT_SETTINGS = {
  night: 1,
  blueAI: 2,
  redAI: 1,
  yellowAI: 0,
  startingPower: 100,
  hourLengthMs: 8000,
};

export const NOISE_SVG_URL = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E`;

export const HEAVY_NOISE_SVG_URL = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E`;

// Aggression levels based on night number (1-5) and Nightmare mode
export const getAggression = (night: number, isNightmare: boolean = false) => {
  if (isNightmare) {
    switch (night) {
      case 1: return { blue: 5, red: 4, yellow: 0 };
      case 2: return { blue: 10, red: 8, yellow: 0 };
      case 3: return { blue: 14, red: 12, yellow: 0 };
      case 4: return { blue: 18, red: 16, yellow: 0 };
      case 5: return { blue: 20, red: 18, yellow: 0 };
      case 6: return { blue: 20, red: 20, yellow: 0 };
      case 7: return { blue: 20, red: 20, yellow: 20 }; // Very Hard Night 7
      default: return { blue: 20, red: 20, yellow: 20 };
    }
  }

  // Standard Mode
  switch (night) {
    case 1: return { blue: 2, red: 1, yellow: 0 };
    case 2: return { blue: 6, red: 4, yellow: 0 };
    case 3: return { blue: 8, red: 8, yellow: 0 };
    case 4: return { blue: 12, red: 10, yellow: 0 };
    case 5: return { blue: 16, red: 15, yellow: 0 };
    case 6: return { blue: 18, red: 18, yellow: 0 };
    case 7: return { blue: 20, red: 20, yellow: 0 };
    default: return { blue: 20, red: 20, yellow: 0 };
  }
};