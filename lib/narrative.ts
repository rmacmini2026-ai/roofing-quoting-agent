import Anthropic from "@anthropic-ai/sdk";
import { RoofMeasurements, CostBreakdown } from "@/types";

const client = new Anthropic();

export async function generateNarrative(
  customerName: string,
  address: string,
  city: string,
  state: string,
  measurements: RoofMeasurements,
  costs: CostBreakdown,
  roofType: string,
  notes: string
): Promise<string> {
  const prompt = `You are a professional roofing sales consultant writing a customer proposal narrative.

Customer: ${customerName}
Property: ${address}, ${city}, ${state}
Roof Type Selected: ${roofType}
Roof Measurements (via aerial measurement report):
- Total roof area: ${measurements.totalArea} sq ft (${measurements.squares} squares)
- Roof pitch: ${measurements.pitch}
- Number of facets: ${measurements.facets}
- Ridge length: ${measurements.ridgeLength} ft
- Valley length: ${measurements.valleyLength} ft
- Eave length: ${measurements.eaveLength} ft
Total Project Investment: $${costs.total.toLocaleString()}
Additional notes from rep: ${notes || "None"}

Write a professional 3-paragraph proposal narrative:
1. Personalized introduction: reference the customer's name and address, acknowledge the aerial measurement assessment, and summarize what was found about their roof.
2. Scope of work: describe exactly what will be done (tear-off, installation of materials specified), the quality of materials (mention the specific roof type), and why this is the right investment.
3. Warranty and next steps: mention the Owens Corning Platinum Protection Limited Lifetime Warranty (if architectural shingles) or appropriate manufacturer warranty, plus a 10-year workmanship warranty from SkyLine Roofing. Close with a warm call to action.

Write in a confident, professional, customer-friendly tone. Do not use bullet points. Keep it concise — about 150 words per paragraph.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  return content.type === "text" ? content.text : "";
}
