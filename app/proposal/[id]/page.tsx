"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Proposal, LineItem, CostBreakdown } from "@/types";

function recomputeTotals(costs: CostBreakdown): CostBreakdown {
  const materialSubtotal = costs.lineItems.reduce((s, i) => s + i.total, 0);
  const subtotal = materialSubtotal + costs.laborCost;
  const tax = Math.round(materialSubtotal * costs.taxRate * 100) / 100;
  return {
    ...costs,
    materialSubtotal: Math.round(materialSubtotal * 100) / 100,
    subtotal: Math.round(subtotal * 100) / 100,
    tax,
    total: Math.round((subtotal + tax) * 100) / 100,
  };
}

function ProposalPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const isViewMode = searchParams.get("view") === "1";
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [accepted, setAccepted] = useState(false);

  // Edit state
  const [editingNarrative, setEditingNarrative] = useState(false);
  const [narrativeDraft, setNarrativeDraft] = useState("");
  const [editingCosts, setEditingCosts] = useState(false);
  const [costsDraft, setCostsDraft] = useState<CostBreakdown | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    fetch(`/api/proposal/${id}`)
      .then((r) => r.json())
      .then((p) => { setProposal(p); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const save = useCallback(async (patch: Partial<Proposal>) => {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch(`/api/proposal/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Save failed");
      const updated = await res.json();
      setProposal(updated);
    } catch {
      setSaveError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [id]);

  const saveNarrative = async () => {
    await save({ narrative: narrativeDraft });
    setEditingNarrative(false);
  };

  const saveCosts = async () => {
    if (!costsDraft) return;
    const recomputed = recomputeTotals(costsDraft);
    await save({ costs: recomputed });
    setEditingCosts(false);
    setCostsDraft(null);
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string) => {
    if (!costsDraft) return;
    const items = [...costsDraft.lineItems];
    const item = { ...items[index] };
    if (field === "quantity" || field === "unitPrice") {
      const num = parseFloat(value) || 0;
      (item as Record<string, unknown>)[field] = num;
      item.total = Math.round(item.quantity * item.unitPrice * 100) / 100;
    } else {
      (item as Record<string, unknown>)[field] = value;
    }
    items[index] = item;
    setCostsDraft({ ...costsDraft, lineItems: items });
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Loading proposal...</p>
      </div>
    </div>
  );

  if (!proposal) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-slate-500">Proposal not found.</p>
    </div>
  );

  const { customer, measurements, costs, financing, narrative, roofType, createdAt } = proposal;
  const date = new Date(createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const viewUrl = typeof window !== "undefined"
    ? `${window.location.origin}/proposal/${id}?view=1`
    : "";

  const copyLink = () => {
    navigator.clipboard.writeText(viewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeCosts = costsDraft ?? costs;

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white">
      {/* Header */}
      <header className="bg-[#0f2744] text-white">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-400 rounded-full flex items-center justify-center text-[#0f2744] font-bold text-xl">S</div>
            <div>
              <h1 className="text-xl font-bold">SkyLine Roofing</h1>
              <p className="text-sky-300 text-xs">Licensed & Insured • Lic #RC-2024-8847</p>
            </div>
          </div>
          <div className="text-right text-sm">
            <p className="text-slate-300">Proposal Date</p>
            <p className="font-semibold">{date}</p>
            <p className="text-slate-400 text-xs mt-1">Proposal #{id.toUpperCase()}</p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 print:py-4">
        {/* Action bar */}
        <div className="flex gap-3 print:hidden flex-wrap">
          <button onClick={copyLink} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            {copied ? "Copied!" : "Copy Link"}
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print / Save PDF
          </button>
          {!isViewMode && (
            <>
              <button
                onClick={() => { setEditingNarrative(true); setNarrativeDraft(narrative); }}
                className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Edit Scope
              </button>
              <button
                onClick={() => { setEditingCosts(true); setCostsDraft(JSON.parse(JSON.stringify(costs))); }}
                className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                Edit Costs
              </button>
            </>
          )}
        </div>
        {saveError && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2 print:hidden">{saveError}</p>}

        {/* Customer card */}
        <Card title="Prepared For">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold text-slate-800">{customer.name}</p>
              <p className="text-slate-500 mt-1">{customer.address}</p>
              <p className="text-slate-500">{customer.city}, {customer.state} {customer.zip}</p>
            </div>
            <div className="text-sm text-slate-600 space-y-1">
              {customer.phone && <p><span className="text-slate-400">Phone:</span> {customer.phone}</p>}
              {customer.email && <p><span className="text-slate-400">Email:</span> {customer.email}</p>}
              <p><span className="text-slate-400">Roof Type:</span> {roofType}</p>
            </div>
          </div>
        </Card>

        {/* Roof assessment */}
        <Card title="Aerial Roof Assessment" badge="EagleView Report">
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
            {[
              ["Total Area", `${measurements.totalArea.toLocaleString()} sq ft`],
              ["Squares", measurements.squares],
              ["Pitch", measurements.pitch],
              ["Facets", measurements.facets],
              ["Ridge", `${measurements.ridgeLength} ft`],
              ["Eave", `${measurements.eaveLength} ft`],
            ].map(([label, value]) => (
              <div key={label} className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-xs text-slate-500 mb-1">{label}</p>
                <p className="font-bold text-slate-800 text-lg">{value}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Narrative */}
        <Card title="Scope of Work">
          {editingNarrative ? (
            <div className="space-y-3">
              <textarea
                className="w-full border border-sky-300 rounded-lg px-3 py-2.5 text-sm leading-7 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-sky-50 resize-y"
                rows={12}
                value={narrativeDraft}
                onChange={(e) => setNarrativeDraft(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={saveNarrative} disabled={saving} className="bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                  {saving ? "Saving…" : "Save"}
                </button>
                <button onClick={() => setEditingNarrative(false)} className="bg-white border border-slate-200 text-slate-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="prose prose-slate max-w-none text-sm leading-7 whitespace-pre-line text-slate-700">
              {narrative}
            </div>
          )}
        </Card>

        {/* Materials breakdown */}
        <Card title="Materials & Labor Breakdown">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 text-slate-500 font-medium">Item</th>
                <th className="text-right py-2 text-slate-500 font-medium">Qty</th>
                <th className="text-right py-2 text-slate-500 font-medium">Unit</th>
                <th className="text-right py-2 text-slate-500 font-medium">Unit Price</th>
                <th className="text-right py-2 text-slate-500 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {activeCosts.lineItems.map((item, i) => (
                <tr key={item.name} className="border-b border-slate-50">
                  <td className="py-2 text-slate-700">{item.name}</td>
                  <td className="py-2 text-right">
                    {editingCosts ? (
                      <input type="number" min="0" step="1" value={item.quantity}
                        onChange={(e) => updateLineItem(i, "quantity", e.target.value)}
                        className="w-16 text-right border border-sky-300 rounded px-1.5 py-1 text-sm bg-sky-50 focus:outline-none focus:ring-1 focus:ring-sky-400" />
                    ) : <span className="text-slate-600">{item.quantity}</span>}
                  </td>
                  <td className="py-2 text-right text-slate-500">{item.unit}</td>
                  <td className="py-2 text-right">
                    {editingCosts ? (
                      <input type="number" min="0" step="0.01" value={item.unitPrice}
                        onChange={(e) => updateLineItem(i, "unitPrice", e.target.value)}
                        className="w-20 text-right border border-sky-300 rounded px-1.5 py-1 text-sm bg-sky-50 focus:outline-none focus:ring-1 focus:ring-sky-400" />
                    ) : <span className="text-slate-600">${item.unitPrice.toFixed(2)}</span>}
                  </td>
                  <td className="py-2 text-right font-medium text-slate-800">${item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
              <tr className="border-b border-slate-100">
                <td colSpan={4} className="py-2 text-slate-500 italic">Labor (installation)</td>
                <td className="py-2 text-right font-medium text-slate-800">
                  {editingCosts && costsDraft ? (
                    <input type="number" min="0" step="1" value={costsDraft.laborCost}
                      onChange={(e) => setCostsDraft({ ...costsDraft, laborCost: parseFloat(e.target.value) || 0 })}
                      className="w-24 text-right border border-sky-300 rounded px-1.5 py-1 text-sm bg-sky-50 focus:outline-none focus:ring-1 focus:ring-sky-400" />
                  ) : `$${activeCosts.laborCost.toLocaleString()}`}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="pt-3 text-slate-500 text-xs">Materials subtotal</td>
                <td className="pt-3 text-right text-slate-600">${recomputeTotals(activeCosts).materialSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
              {activeCosts.taxRate > 0 && (
                <tr>
                  <td colSpan={4} className="py-1 text-slate-500 text-xs">Sales tax ({(activeCosts.taxRate * 100).toFixed(2)}%)</td>
                  <td className="py-1 text-right text-slate-600">${recomputeTotals(activeCosts).tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              )}
              <tr className="border-t-2 border-slate-800">
                <td colSpan={4} className="pt-3 text-base font-bold text-slate-800">Total Project Investment</td>
                <td className="pt-3 text-right text-2xl font-bold text-sky-600">${recomputeTotals(activeCosts).total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            </tfoot>
          </table>
          {editingCosts && (
            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
              <button onClick={saveCosts} disabled={saving} className="bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button onClick={() => { setEditingCosts(false); setCostsDraft(null); }} className="bg-white border border-slate-200 text-slate-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                Cancel
              </button>
            </div>
          )}
        </Card>

        {/* Financing */}
        <Card title="GreenSky Financing Options" badge="0% Down Available">
          <p className="text-sm text-slate-500 mb-4">Subject to credit approval. Monthly payments shown for illustrative purposes.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {financing.map((plan) => (
              <div key={plan.term} className="border-2 border-slate-100 rounded-xl p-4 hover:border-sky-300 transition-colors">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{plan.term} Months</p>
                <p className="text-3xl font-bold text-slate-800">${plan.monthlyPayment.toFixed(0)}<span className="text-base font-normal text-slate-400">/mo</span></p>
                <p className="text-xs text-slate-400 mt-1">{(plan.apr * 100).toFixed(2)}% APR</p>
                <p className="text-xs text-slate-400">Total: ${plan.totalCost.toLocaleString(undefined, { minimumFractionDigits: 0 })}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Warranty */}
        <Card title="Warranty Coverage">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-sky-50 border border-sky-100 rounded-xl p-4">
              <p className="font-semibold text-slate-800 text-sm">Manufacturer Warranty</p>
              <p className="text-2xl font-bold text-sky-600 mt-1">Lifetime</p>
              <p className="text-xs text-slate-500 mt-1">Owens Corning Platinum Protection Limited Lifetime on materials</p>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-xl p-4">
              <p className="font-semibold text-slate-800 text-sm">Workmanship Warranty</p>
              <p className="text-2xl font-bold text-green-600 mt-1">10 Years</p>
              <p className="text-xs text-slate-500 mt-1">SkyLine Roofing workmanship guarantee on all labor</p>
            </div>
          </div>
        </Card>

        {/* CTA */}
        {!accepted ? (
          <div className="bg-[#0f2744] rounded-2xl p-8 text-center text-white print:hidden">
            <h3 className="text-2xl font-bold mb-2">Ready to Get Started?</h3>
            <p className="text-slate-300 text-sm mb-6">This proposal is valid for 30 days. Accept now to lock in your price.</p>
            <button
              onClick={() => setAccepted(true)}
              className="bg-sky-400 hover:bg-sky-300 text-[#0f2744] font-bold px-8 py-3.5 rounded-xl text-base transition-colors"
            >
              Accept Proposal
            </button>
          </div>
        ) : (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center print:hidden">
            <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-bold text-green-800 mb-1">Proposal Accepted!</h3>
            <p className="text-green-600 text-sm">Thank you, {customer.name}. Our team will contact you within 24 hours to schedule your project.</p>
          </div>
        )}

        <footer className="text-center text-xs text-slate-400 pb-8">
          SkyLine Roofing • (555) 123-4567 • info@skylineroof.com • Contractor Lic #RC-2024-8847
        </footer>
      </div>
    </div>
  );
}

function Card({ title, children, badge }: { title: string; children: React.ReactNode; badge?: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="font-semibold text-slate-800">{title}</h2>
        {badge && <span className="text-xs bg-sky-100 text-sky-700 font-medium px-2.5 py-1 rounded-full">{badge}</span>}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

export default function Page() {
  return <Suspense><ProposalPage /></Suspense>;
}
