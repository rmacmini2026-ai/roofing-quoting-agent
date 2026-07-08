import { RoofMeasurements, LineItem, CostBreakdown } from "@/types";
import { RegionalPricing } from "./pricing";

export function calculateCosts(
  measurements: RoofMeasurements,
  pricing: RegionalPricing,
  roofType: string
): CostBreakdown {
  const squaresWithWaste = Math.ceil(measurements.squares * 1.1);
  const eaveFt = measurements.eaveLength;
  const ridgeFt = measurements.ridgeLength;

  // Bundles: 3 bundles per square for shingles/ridge/starter
  const shingleBundles = squaresWithWaste * 3;
  const ridgeBundles = Math.ceil(ridgeFt / 35); // ~35 lin ft per bundle
  const starterBundles = Math.ceil(eaveFt / 120); // ~120 lin ft per bundle
  const dripEdgePieces = Math.ceil((eaveFt + ridgeFt) / 10);
  const nailBoxes = Math.ceil(squaresWithWaste / 3);

  // Ice/water shield on first 6 ft from eave (2 squares typical) + valleys
  const iceWaterSquares = Math.ceil((eaveFt * 6) / 100 + measurements.valleyLength * 3 / 100);

  const materialMultiplier = roofType === "Metal" ? 2.2 : roofType === "Tile" ? 2.8 : 1.0;

  const lineItems: LineItem[] = [
    {
      name: `Architectural Shingles (${roofType})`,
      quantity: shingleBundles,
      unit: "bundle",
      unitPrice: (pricing.shinglesPerSquare / 3) * materialMultiplier,
      total: 0,
    },
    {
      name: "Synthetic Underlayment",
      quantity: squaresWithWaste,
      unit: "square",
      unitPrice: pricing.underlaymentPerSquare,
      total: 0,
    },
    {
      name: "Ice & Water Shield",
      quantity: iceWaterSquares,
      unit: "square",
      unitPrice: pricing.iceWaterPerSquare,
      total: 0,
    },
    {
      name: "Ridge Cap",
      quantity: ridgeBundles,
      unit: "bundle",
      unitPrice: pricing.ridgeCapPerBundle,
      total: 0,
    },
    {
      name: "Starter Strip",
      quantity: starterBundles,
      unit: "bundle",
      unitPrice: pricing.starterPerBundle,
      total: 0,
    },
    {
      name: "Drip Edge",
      quantity: dripEdgePieces,
      unit: "10 ft piece",
      unitPrice: pricing.dripEdgePer10ft,
      total: 0,
    },
    {
      name: "Roofing Nails",
      quantity: nailBoxes,
      unit: "box",
      unitPrice: pricing.nailsPerBox,
      total: 0,
    },
  ];

  lineItems.forEach((item) => {
    item.total = Math.round(item.quantity * item.unitPrice * 100) / 100;
  });

  const materialSubtotal = lineItems.reduce((s, i) => s + i.total, 0);
  const laborCost = Math.round(squaresWithWaste * pricing.laborPerSquare * materialMultiplier);
  const subtotal = materialSubtotal + laborCost;
  const tax = Math.round(materialSubtotal * pricing.stateTaxRate * 100) / 100;
  const total = subtotal + tax;

  return {
    lineItems,
    materialSubtotal: Math.round(materialSubtotal * 100) / 100,
    laborCost,
    subtotal: Math.round(subtotal * 100) / 100,
    tax,
    taxRate: pricing.stateTaxRate,
    total: Math.round(total * 100) / 100,
  };
}
