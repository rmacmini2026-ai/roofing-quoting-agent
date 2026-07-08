// Replace getMeasurements() with real EagleView API call when credentials are available
// EagleView API docs: https://developer.eagleview.com
import { RoofMeasurements } from "@/types";

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function deterministicRange(seed: number, min: number, max: number): number {
  const range = max - min;
  return min + (seed % (range * 10)) / 10;
}

export function getMeasurements(address: string): RoofMeasurements {
  const seed = hashStr(address);
  const totalArea = Math.round(deterministicRange(seed, 1800, 3500));
  const pitchNumerators = [4, 5, 6, 7, 8, 9];
  const pitch = `${pitchNumerators[seed % pitchNumerators.length]}/12`;
  const facets = 4 + (seed % 9);
  const ridgeLength = Math.round(deterministicRange(seed + 1, 40, 80));
  const valleyLength = Math.round(deterministicRange(seed + 2, 20, 60));
  const eaveLength = Math.round(deterministicRange(seed + 3, 120, 200));

  return {
    totalArea,
    squares: Math.ceil(totalArea / 100),
    pitch,
    facets,
    ridgeLength,
    valleyLength,
    eaveLength,
    source: "eagleview-mock",
  };
}
