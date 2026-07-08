export interface RoofMeasurements {
  totalArea: number; // sq ft
  squares: number; // totalArea / 100
  pitch: string; // e.g. "6/12"
  facets: number;
  ridgeLength: number; // ft
  valleyLength: number; // ft
  eaveLength: number; // ft
  source: "eagleview-mock" | "eagleview-live";
}

export interface LineItem {
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface CostBreakdown {
  lineItems: LineItem[];
  materialSubtotal: number;
  laborCost: number;
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
}

export interface FinancingOption {
  lender: string;
  term: number; // months
  apr: number;
  monthlyPayment: number;
  totalCost: number;
}

export interface Proposal {
  id: string;
  createdAt: string;
  customer: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    email: string;
  };
  roofType: string;
  notes: string;
  measurements: RoofMeasurements;
  costs: CostBreakdown;
  financing: FinancingOption[];
  narrative: string;
  shareUrl: string;
}
