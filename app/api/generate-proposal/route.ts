import { NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { getMeasurements } from "@/lib/eagleview";
import { getPricing } from "@/lib/pricing";
import { calculateCosts } from "@/lib/calculator";
import { getGreenSkyOptions } from "@/lib/financing";
import { generateNarrative } from "@/lib/narrative";
import { saveProposal } from "@/lib/store";
import { Proposal } from "@/types";

function send(controller: ReadableStreamDefaultController, data: object) {
  const encoder = new TextEncoder();
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, address, city, state, zip, phone, email, roofType, notes } = body;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

        send(controller, { step: "geocode", status: "running", message: "Looking up property location..." });
        // Geocode via Nominatim (free, no key needed)
        const fullAddress = `${address}, ${city}, ${state} ${zip}`;
        let lat = 0, lng = 0;
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`,
            { headers: { "User-Agent": "SkylineRoofingQuoter/1.0" } }
          );
          const geoData = await geoRes.json();
          if (geoData.length > 0) {
            lat = parseFloat(geoData[0].lat);
            lng = parseFloat(geoData[0].lon);
          }
        } catch {
          // Non-fatal: proceed with mock measurements
        }
        send(controller, { step: "geocode", status: "done", message: "Property located" });

        send(controller, { step: "measurements", status: "running", message: "Pulling aerial roof measurements..." });
        const measurements = getMeasurements(fullAddress);
        await new Promise((r) => setTimeout(r, 800)); // simulate API latency
        send(controller, { step: "measurements", status: "done", message: `${measurements.totalArea} sq ft measured across ${measurements.facets} facets` });

        send(controller, { step: "pricing", status: "running", message: "Looking up local material pricing..." });
        const pricing = getPricing(state);
        await new Promise((r) => setTimeout(r, 400));
        send(controller, { step: "pricing", status: "done", message: `Regional pricing loaded for ${state}` });

        send(controller, { step: "costs", status: "running", message: "Calculating project costs..." });
        const costs = calculateCosts(measurements, pricing, roofType);
        send(controller, { step: "costs", status: "done", message: `Total: $${costs.total.toLocaleString()}` });

        send(controller, { step: "financing", status: "running", message: "Generating GreenSky financing options..." });
        const financing = getGreenSkyOptions(costs.total);
        send(controller, { step: "financing", status: "done", message: `3 payment plans available from $${financing[0].monthlyPayment}/mo` });

        send(controller, { step: "narrative", status: "running", message: "Drafting proposal with AI..." });
        const narrative = await generateNarrative(name, address, city, state, measurements, costs, roofType, notes);
        send(controller, { step: "narrative", status: "done", message: "Proposal narrative written" });

        send(controller, { step: "saving", status: "running", message: "Saving proposal..." });
        const id = nanoid(8);
        const proposal: Proposal = {
          id,
          createdAt: new Date().toISOString(),
          customer: { name, address, city, state, zip, phone, email },
          roofType,
          notes,
          measurements,
          costs,
          financing,
          narrative,
          shareUrl: `${baseUrl}/proposal/${id}`,
        };
        await saveProposal(proposal);
        send(controller, { step: "saving", status: "done", message: "Proposal saved" });

        send(controller, { step: "complete", status: "done", proposalId: id, shareUrl: proposal.shareUrl });
      } catch (err) {
        send(controller, { step: "error", status: "error", message: String(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
