// Regional material pricing per state (prices per square = per 100 sq ft installed)
export interface RegionalPricing {
  shinglesPerSquare: number; // architectural shingles
  underlaymentPerSquare: number;
  iceWaterPerSquare: number;
  ridgeCapPerBundle: number;
  starterPerBundle: number;
  dripEdgePer10ft: number;
  nailsPerBox: number; // covers ~3 squares
  laborPerSquare: number;
  stateTaxRate: number; // decimal
}

const STATE_PRICING: Record<string, RegionalPricing> = {
  AL: { shinglesPerSquare: 98, underlaymentPerSquare: 13, iceWaterPerSquare: 28, ridgeCapPerBundle: 48, starterPerBundle: 38, dripEdgePer10ft: 3.5, nailsPerBox: 25, laborPerSquare: 82, stateTaxRate: 0.04 },
  AK: { shinglesPerSquare: 135, underlaymentPerSquare: 18, iceWaterPerSquare: 40, ridgeCapPerBundle: 65, starterPerBundle: 50, dripEdgePer10ft: 6, nailsPerBox: 28, laborPerSquare: 118, stateTaxRate: 0 },
  AZ: { shinglesPerSquare: 105, underlaymentPerSquare: 14, iceWaterPerSquare: 26, ridgeCapPerBundle: 52, starterPerBundle: 42, dripEdgePer10ft: 4, nailsPerBox: 25, laborPerSquare: 88, stateTaxRate: 0.056 },
  AR: { shinglesPerSquare: 96, underlaymentPerSquare: 13, iceWaterPerSquare: 27, ridgeCapPerBundle: 47, starterPerBundle: 37, dripEdgePer10ft: 3.5, nailsPerBox: 25, laborPerSquare: 80, stateTaxRate: 0.065 },
  CA: { shinglesPerSquare: 130, underlaymentPerSquare: 17, iceWaterPerSquare: 36, ridgeCapPerBundle: 62, starterPerBundle: 48, dripEdgePer10ft: 5.5, nailsPerBox: 27, laborPerSquare: 115, stateTaxRate: 0.0725 },
  CO: { shinglesPerSquare: 112, underlaymentPerSquare: 15, iceWaterPerSquare: 33, ridgeCapPerBundle: 55, starterPerBundle: 44, dripEdgePer10ft: 4.5, nailsPerBox: 26, laborPerSquare: 95, stateTaxRate: 0.029 },
  CT: { shinglesPerSquare: 125, underlaymentPerSquare: 16, iceWaterPerSquare: 37, ridgeCapPerBundle: 60, starterPerBundle: 47, dripEdgePer10ft: 5, nailsPerBox: 27, laborPerSquare: 108, stateTaxRate: 0.0635 },
  DE: { shinglesPerSquare: 118, underlaymentPerSquare: 15, iceWaterPerSquare: 35, ridgeCapPerBundle: 57, starterPerBundle: 45, dripEdgePer10ft: 4.8, nailsPerBox: 26, laborPerSquare: 100, stateTaxRate: 0 },
  FL: { shinglesPerSquare: 108, underlaymentPerSquare: 15, iceWaterPerSquare: 30, ridgeCapPerBundle: 53, starterPerBundle: 42, dripEdgePer10ft: 4.2, nailsPerBox: 25, laborPerSquare: 90, stateTaxRate: 0.06 },
  GA: { shinglesPerSquare: 100, underlaymentPerSquare: 13, iceWaterPerSquare: 28, ridgeCapPerBundle: 49, starterPerBundle: 39, dripEdgePer10ft: 3.8, nailsPerBox: 25, laborPerSquare: 84, stateTaxRate: 0.04 },
  HI: { shinglesPerSquare: 140, underlaymentPerSquare: 18, iceWaterPerSquare: 40, ridgeCapPerBundle: 65, starterPerBundle: 50, dripEdgePer10ft: 6, nailsPerBox: 30, laborPerSquare: 120, stateTaxRate: 0.04 },
  ID: { shinglesPerSquare: 102, underlaymentPerSquare: 14, iceWaterPerSquare: 30, ridgeCapPerBundle: 50, starterPerBundle: 40, dripEdgePer10ft: 4, nailsPerBox: 25, laborPerSquare: 85, stateTaxRate: 0.06 },
  IL: { shinglesPerSquare: 115, underlaymentPerSquare: 15, iceWaterPerSquare: 34, ridgeCapPerBundle: 56, starterPerBundle: 44, dripEdgePer10ft: 4.6, nailsPerBox: 26, laborPerSquare: 98, stateTaxRate: 0.0625 },
  IN: { shinglesPerSquare: 108, underlaymentPerSquare: 14, iceWaterPerSquare: 32, ridgeCapPerBundle: 53, starterPerBundle: 42, dripEdgePer10ft: 4.2, nailsPerBox: 26, laborPerSquare: 90, stateTaxRate: 0.07 },
  IA: { shinglesPerSquare: 106, underlaymentPerSquare: 14, iceWaterPerSquare: 31, ridgeCapPerBundle: 52, starterPerBundle: 41, dripEdgePer10ft: 4.1, nailsPerBox: 25, laborPerSquare: 88, stateTaxRate: 0.06 },
  KS: { shinglesPerSquare: 100, underlaymentPerSquare: 13, iceWaterPerSquare: 29, ridgeCapPerBundle: 49, starterPerBundle: 39, dripEdgePer10ft: 3.8, nailsPerBox: 25, laborPerSquare: 83, stateTaxRate: 0.065 },
  KY: { shinglesPerSquare: 99, underlaymentPerSquare: 13, iceWaterPerSquare: 28, ridgeCapPerBundle: 48, starterPerBundle: 38, dripEdgePer10ft: 3.6, nailsPerBox: 25, laborPerSquare: 82, stateTaxRate: 0.06 },
  LA: { shinglesPerSquare: 100, underlaymentPerSquare: 13, iceWaterPerSquare: 28, ridgeCapPerBundle: 49, starterPerBundle: 39, dripEdgePer10ft: 3.8, nailsPerBox: 25, laborPerSquare: 83, stateTaxRate: 0.0445 },
  ME: { shinglesPerSquare: 118, underlaymentPerSquare: 16, iceWaterPerSquare: 36, ridgeCapPerBundle: 57, starterPerBundle: 45, dripEdgePer10ft: 4.8, nailsPerBox: 26, laborPerSquare: 100, stateTaxRate: 0.055 },
  MD: { shinglesPerSquare: 120, underlaymentPerSquare: 16, iceWaterPerSquare: 36, ridgeCapPerBundle: 58, starterPerBundle: 46, dripEdgePer10ft: 5, nailsPerBox: 27, laborPerSquare: 102, stateTaxRate: 0.06 },
  MA: { shinglesPerSquare: 128, underlaymentPerSquare: 17, iceWaterPerSquare: 38, ridgeCapPerBundle: 62, starterPerBundle: 48, dripEdgePer10ft: 5.4, nailsPerBox: 27, laborPerSquare: 112, stateTaxRate: 0.0625 },
  MI: { shinglesPerSquare: 110, underlaymentPerSquare: 15, iceWaterPerSquare: 33, ridgeCapPerBundle: 54, starterPerBundle: 43, dripEdgePer10ft: 4.4, nailsPerBox: 26, laborPerSquare: 92, stateTaxRate: 0.06 },
  MN: { shinglesPerSquare: 112, underlaymentPerSquare: 15, iceWaterPerSquare: 34, ridgeCapPerBundle: 55, starterPerBundle: 44, dripEdgePer10ft: 4.5, nailsPerBox: 26, laborPerSquare: 94, stateTaxRate: 0.06875 },
  MS: { shinglesPerSquare: 96, underlaymentPerSquare: 12, iceWaterPerSquare: 27, ridgeCapPerBundle: 46, starterPerBundle: 37, dripEdgePer10ft: 3.4, nailsPerBox: 25, laborPerSquare: 79, stateTaxRate: 0.07 },
  MO: { shinglesPerSquare: 102, underlaymentPerSquare: 14, iceWaterPerSquare: 29, ridgeCapPerBundle: 50, starterPerBundle: 40, dripEdgePer10ft: 3.9, nailsPerBox: 25, laborPerSquare: 85, stateTaxRate: 0.04225 },
  MT: { shinglesPerSquare: 108, underlaymentPerSquare: 14, iceWaterPerSquare: 32, ridgeCapPerBundle: 53, starterPerBundle: 42, dripEdgePer10ft: 4.2, nailsPerBox: 25, laborPerSquare: 90, stateTaxRate: 0 },
  NE: { shinglesPerSquare: 100, underlaymentPerSquare: 13, iceWaterPerSquare: 29, ridgeCapPerBundle: 49, starterPerBundle: 39, dripEdgePer10ft: 3.8, nailsPerBox: 25, laborPerSquare: 83, stateTaxRate: 0.055 },
  NV: { shinglesPerSquare: 110, underlaymentPerSquare: 15, iceWaterPerSquare: 28, ridgeCapPerBundle: 54, starterPerBundle: 43, dripEdgePer10ft: 4.2, nailsPerBox: 26, laborPerSquare: 92, stateTaxRate: 0.0685 },
  NH: { shinglesPerSquare: 120, underlaymentPerSquare: 16, iceWaterPerSquare: 36, ridgeCapPerBundle: 58, starterPerBundle: 46, dripEdgePer10ft: 5, nailsPerBox: 27, laborPerSquare: 102, stateTaxRate: 0 },
  NJ: { shinglesPerSquare: 125, underlaymentPerSquare: 17, iceWaterPerSquare: 37, ridgeCapPerBundle: 60, starterPerBundle: 47, dripEdgePer10ft: 5.2, nailsPerBox: 27, laborPerSquare: 108, stateTaxRate: 0.06625 },
  NM: { shinglesPerSquare: 100, underlaymentPerSquare: 13, iceWaterPerSquare: 27, ridgeCapPerBundle: 49, starterPerBundle: 39, dripEdgePer10ft: 3.8, nailsPerBox: 25, laborPerSquare: 83, stateTaxRate: 0.05125 },
  NY: { shinglesPerSquare: 128, underlaymentPerSquare: 17, iceWaterPerSquare: 38, ridgeCapPerBundle: 62, starterPerBundle: 48, dripEdgePer10ft: 5.4, nailsPerBox: 27, laborPerSquare: 112, stateTaxRate: 0.04 },
  NC: { shinglesPerSquare: 100, underlaymentPerSquare: 13, iceWaterPerSquare: 28, ridgeCapPerBundle: 49, starterPerBundle: 39, dripEdgePer10ft: 3.8, nailsPerBox: 25, laborPerSquare: 83, stateTaxRate: 0.0475 },
  ND: { shinglesPerSquare: 106, underlaymentPerSquare: 14, iceWaterPerSquare: 31, ridgeCapPerBundle: 52, starterPerBundle: 41, dripEdgePer10ft: 4.1, nailsPerBox: 25, laborPerSquare: 88, stateTaxRate: 0.05 },
  OH: { shinglesPerSquare: 108, underlaymentPerSquare: 14, iceWaterPerSquare: 32, ridgeCapPerBundle: 53, starterPerBundle: 42, dripEdgePer10ft: 4.2, nailsPerBox: 26, laborPerSquare: 90, stateTaxRate: 0.0575 },
  OK: { shinglesPerSquare: 98, underlaymentPerSquare: 13, iceWaterPerSquare: 27, ridgeCapPerBundle: 48, starterPerBundle: 38, dripEdgePer10ft: 3.6, nailsPerBox: 25, laborPerSquare: 81, stateTaxRate: 0.045 },
  OR: { shinglesPerSquare: 118, underlaymentPerSquare: 16, iceWaterPerSquare: 35, ridgeCapPerBundle: 57, starterPerBundle: 45, dripEdgePer10ft: 4.8, nailsPerBox: 26, laborPerSquare: 100, stateTaxRate: 0 },
  PA: { shinglesPerSquare: 118, underlaymentPerSquare: 15, iceWaterPerSquare: 35, ridgeCapPerBundle: 57, starterPerBundle: 45, dripEdgePer10ft: 4.7, nailsPerBox: 26, laborPerSquare: 100, stateTaxRate: 0.06 },
  RI: { shinglesPerSquare: 125, underlaymentPerSquare: 16, iceWaterPerSquare: 37, ridgeCapPerBundle: 60, starterPerBundle: 47, dripEdgePer10ft: 5.1, nailsPerBox: 27, laborPerSquare: 108, stateTaxRate: 0.07 },
  SC: { shinglesPerSquare: 99, underlaymentPerSquare: 13, iceWaterPerSquare: 27, ridgeCapPerBundle: 48, starterPerBundle: 38, dripEdgePer10ft: 3.7, nailsPerBox: 25, laborPerSquare: 82, stateTaxRate: 0.06 },
  SD: { shinglesPerSquare: 100, underlaymentPerSquare: 13, iceWaterPerSquare: 29, ridgeCapPerBundle: 49, starterPerBundle: 39, dripEdgePer10ft: 3.8, nailsPerBox: 25, laborPerSquare: 83, stateTaxRate: 0.045 },
  TN: { shinglesPerSquare: 99, underlaymentPerSquare: 13, iceWaterPerSquare: 28, ridgeCapPerBundle: 48, starterPerBundle: 38, dripEdgePer10ft: 3.7, nailsPerBox: 25, laborPerSquare: 82, stateTaxRate: 0.07 },
  TX: { shinglesPerSquare: 102, underlaymentPerSquare: 13, iceWaterPerSquare: 27, ridgeCapPerBundle: 50, starterPerBundle: 40, dripEdgePer10ft: 3.9, nailsPerBox: 25, laborPerSquare: 85, stateTaxRate: 0.0625 },
  UT: { shinglesPerSquare: 105, underlaymentPerSquare: 14, iceWaterPerSquare: 30, ridgeCapPerBundle: 51, starterPerBundle: 41, dripEdgePer10ft: 4, nailsPerBox: 25, laborPerSquare: 87, stateTaxRate: 0.0485 },
  VT: { shinglesPerSquare: 118, underlaymentPerSquare: 16, iceWaterPerSquare: 36, ridgeCapPerBundle: 57, starterPerBundle: 45, dripEdgePer10ft: 4.8, nailsPerBox: 26, laborPerSquare: 100, stateTaxRate: 0.06 },
  VA: { shinglesPerSquare: 112, underlaymentPerSquare: 15, iceWaterPerSquare: 33, ridgeCapPerBundle: 55, starterPerBundle: 43, dripEdgePer10ft: 4.5, nailsPerBox: 26, laborPerSquare: 94, stateTaxRate: 0.053 },
  WA: { shinglesPerSquare: 120, underlaymentPerSquare: 16, iceWaterPerSquare: 36, ridgeCapPerBundle: 58, starterPerBundle: 46, dripEdgePer10ft: 5, nailsPerBox: 27, laborPerSquare: 102, stateTaxRate: 0.065 },
  WV: { shinglesPerSquare: 98, underlaymentPerSquare: 13, iceWaterPerSquare: 28, ridgeCapPerBundle: 48, starterPerBundle: 38, dripEdgePer10ft: 3.6, nailsPerBox: 25, laborPerSquare: 81, stateTaxRate: 0.06 },
  WI: { shinglesPerSquare: 110, underlaymentPerSquare: 15, iceWaterPerSquare: 33, ridgeCapPerBundle: 54, starterPerBundle: 43, dripEdgePer10ft: 4.4, nailsPerBox: 26, laborPerSquare: 92, stateTaxRate: 0.05 },
  WY: { shinglesPerSquare: 105, underlaymentPerSquare: 14, iceWaterPerSquare: 31, ridgeCapPerBundle: 51, starterPerBundle: 41, dripEdgePer10ft: 4, nailsPerBox: 25, laborPerSquare: 87, stateTaxRate: 0.04 },
};

const DEFAULT_PRICING: RegionalPricing = {
  shinglesPerSquare: 108, underlaymentPerSquare: 15, iceWaterPerSquare: 32,
  ridgeCapPerBundle: 53, starterPerBundle: 42, dripEdgePer10ft: 4.2,
  nailsPerBox: 25, laborPerSquare: 90, stateTaxRate: 0.06,
};

export function getPricing(state: string): RegionalPricing {
  return STATE_PRICING[state.toUpperCase()] ?? DEFAULT_PRICING;
}
