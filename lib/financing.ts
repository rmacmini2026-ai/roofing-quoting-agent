import { FinancingOption } from "@/types";

function monthlyPayment(principal: number, annualRate: number, termMonths: number): number {
  const r = annualRate / 12;
  const payment = (principal * r * Math.pow(1 + r, termMonths)) / (Math.pow(1 + r, termMonths) - 1);
  return Math.round(payment * 100) / 100;
}

export function getGreenSkyOptions(principal: number): FinancingOption[] {
  const plans = [
    { term: 60, apr: 0.0699 },
    { term: 120, apr: 0.0999 },
    { term: 144, apr: 0.1299 },
  ];

  return plans.map(({ term, apr }) => {
    const monthly = monthlyPayment(principal, apr, term);
    return {
      lender: "GreenSky",
      term,
      apr,
      monthlyPayment: monthly,
      totalCost: Math.round(monthly * term * 100) / 100,
    };
  });
}
