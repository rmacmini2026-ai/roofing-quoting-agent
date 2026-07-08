"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const STEPS = [
  { key: "geocode", label: "Locating property" },
  { key: "measurements", label: "Pulling roof measurements" },
  { key: "pricing", label: "Loading regional pricing" },
  { key: "costs", label: "Calculating project costs" },
  { key: "financing", label: "Generating financing options" },
  { key: "narrative", label: "Drafting AI proposal" },
  { key: "saving", label: "Saving proposal" },
];

type StepStatus = "pending" | "running" | "done" | "error";

export default function Home() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", address: "", city: "", state: "", zip: "",
    phone: "", email: "", roofType: "Architectural Shingle", notes: "",
  });
  const [generating, setGenerating] = useState(false);
  const [steps, setSteps] = useState<Record<string, { status: StepStatus; message?: string }>>({});
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  // Address autocomplete
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 5) { setSuggestions([]); setShowSuggestions(false); return; }
    setAddressLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=us&addressdetails=1&limit=5`,
        { headers: { "User-Agent": "SkylineRoofingQuoter/1.0" } }
      );
      const data: NominatimResult[] = await res.json();
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setAddressLoading(false);
    }
  }, []);

  const handleAddressInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm((p) => ({ ...p, address: val }));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 350);
  };

  const selectSuggestion = (result: NominatimResult) => {
    const a = result.address;
    const street = [a.house_number, a.road].filter(Boolean).join(" ");
    const city = a.city ?? a.town ?? a.village ?? a.county ?? "";
    const state = US_STATE_ABBR[a.state ?? ""] ?? a.state ?? "";
    const zip = a.postcode?.split("-")[0] ?? "";
    setForm((p) => ({ ...p, address: street, city, state, zip }));
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const updateStep = (key: string, status: StepStatus, message?: string) => {
    setSteps((prev) => ({ ...prev, [key]: { status, message } }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setSteps({});
    setError("");

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch("/api/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        signal: ctrl.signal,
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const event = JSON.parse(line.slice(6));
          if (event.step === "complete") {
            router.push(`/proposal/${event.proposalId}`);
            return;
          } else if (event.step === "error") {
            setError(event.message);
            setGenerating(false);
            return;
          } else {
            updateStep(event.step, event.status, event.message);
          }
        }
      }
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") {
        setError(String(err));
        setGenerating(false);
      }
    }
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-[#0f2744] text-white py-5 px-6 flex items-center gap-3 shadow-md">
        <div className="w-9 h-9 bg-sky-400 rounded-full flex items-center justify-center text-[#0f2744] font-bold text-lg">S</div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">SkyLine Roofing</h1>
          <p className="text-sky-300 text-xs">AI-Powered Proposal Generator</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {!generating ? (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-[#0f2744] text-white px-8 py-6">
              <h2 className="text-2xl font-bold">New Roofing Proposal</h2>
              <p className="text-slate-300 text-sm mt-1">Enter customer details and we&apos;ll auto-generate a complete proposal in seconds.</p>
            </div>

            <div className="px-8 py-6 space-y-6">
              <section>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Customer Information</h3>
                <div className="grid grid-cols-1 gap-4">
                  <Field label="Full Name" required>
                    <input className={inputCls} placeholder="Jane Smith" value={form.name} onChange={set("name")} required />
                  </Field>
                  <Field label="Email" required>
                    <input className={inputCls} type="email" placeholder="jane@example.com" value={form.email} onChange={set("email")} required />
                  </Field>
                  <Field label="Phone" required>
                    <input className={inputCls} type="tel" placeholder="(555) 000-0000" value={form.phone} onChange={set("phone")} required />
                  </Field>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Property Address</h3>
                <div className="grid grid-cols-1 gap-4">
                  <Field label="Street Address" required>
                    <div className="relative" ref={suggestionsRef}>
                      <input
                        className={inputCls}
                        placeholder="123 Main St"
                        value={form.address}
                        onChange={handleAddressInput}
                        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                        autoComplete="off"
                        required
                      />
                      {addressLoading && (
                        <div className="absolute right-3 top-3">
                          <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                      {showSuggestions && suggestions.length > 0 && (
                        <ul className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                          {suggestions.map((s) => (
                            <li
                              key={s.place_id}
                              className="px-4 py-2.5 text-sm text-slate-700 hover:bg-sky-50 cursor-pointer border-b border-slate-50 last:border-0"
                              onMouseDown={() => selectSuggestion(s)}
                            >
                              <span className="font-medium">{s.display_name.split(",")[0]}</span>
                              <span className="text-slate-400 text-xs ml-1">{s.display_name.split(",").slice(1, 3).join(",")}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="City" required>
                      <input className={inputCls} placeholder="Springfield" value={form.city} onChange={set("city")} required />
                    </Field>
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="State" required>
                        <input className={inputCls} placeholder="IL" maxLength={2} value={form.state} onChange={set("state")} required />
                      </Field>
                      <Field label="ZIP" required>
                        <input className={inputCls} placeholder="62701" value={form.zip} onChange={set("zip")} required />
                      </Field>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Roof Details</h3>
                <div className="grid grid-cols-1 gap-4">
                  <Field label="Roof Type" required>
                    <select className={inputCls} value={form.roofType} onChange={set("roofType")}>
                      <option>Architectural Shingle</option>
                      <option>Metal</option>
                      <option>Tile</option>
                    </select>
                  </Field>
                  <Field label="Additional Notes">
                    <textarea className={`${inputCls} resize-none`} rows={3} placeholder="Any damage observed, special requirements, access issues..." value={form.notes} onChange={set("notes")} />
                  </Field>
                </div>
              </section>

              {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

              <button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3.5 rounded-xl transition-colors text-base">
                Generate Proposal
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-[#0f2744] text-white px-8 py-6">
              <h2 className="text-2xl font-bold">Building Proposal...</h2>
              <p className="text-slate-300 text-sm mt-1">Our AI agent is gathering data and crafting your proposal.</p>
            </div>
            <div className="px-8 py-8 space-y-4">
              {STEPS.map(({ key, label }) => {
                const s = steps[key];
                const status = s?.status ?? "pending";
                return (
                  <div key={key} className="flex items-start gap-4">
                    <div className="mt-0.5 w-6 h-6 flex-shrink-0 flex items-center justify-center">
                      {status === "done" && (
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                      {status === "running" && <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />}
                      {status === "error" && (
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                      {status === "pending" && <div className="w-4 h-4 border-2 border-slate-200 rounded-full" />}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${status === "pending" ? "text-slate-400" : "text-slate-800"}`}>{label}</p>
                      {s?.message && <p className="text-xs text-slate-500 mt-0.5">{s.message}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700 mb-1 block">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}

const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent bg-slate-50";

interface NominatimResult {
  place_id: number;
  display_name: string;
  address: {
    house_number?: string;
    road?: string;
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    postcode?: string;
  };
}

const US_STATE_ABBR: Record<string, string> = {
  Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR", California: "CA",
  Colorado: "CO", Connecticut: "CT", Delaware: "DE", Florida: "FL", Georgia: "GA",
  Hawaii: "HI", Idaho: "ID", Illinois: "IL", Indiana: "IN", Iowa: "IA",
  Kansas: "KS", Kentucky: "KY", Louisiana: "LA", Maine: "ME", Maryland: "MD",
  Massachusetts: "MA", Michigan: "MI", Minnesota: "MN", Mississippi: "MS",
  Missouri: "MO", Montana: "MT", Nebraska: "NE", Nevada: "NV", "New Hampshire": "NH",
  "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY", "North Carolina": "NC",
  "North Dakota": "ND", Ohio: "OH", Oklahoma: "OK", Oregon: "OR", Pennsylvania: "PA",
  "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD", Tennessee: "TN",
  Texas: "TX", Utah: "UT", Vermont: "VT", Virginia: "VA", Washington: "WA",
  "West Virginia": "WV", Wisconsin: "WI", Wyoming: "WY",
};
