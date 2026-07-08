import { Redis } from "@upstash/redis";
import fs from "fs";
import path from "path";
import { Proposal } from "@/types";

// Use Upstash Redis when env vars are present (production), fall back to JSON file (local dev)
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const DATA_FILE = path.join(process.cwd(), "data", "proposals.json");

function localRead(id: string): Proposal | null {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw)[id] ?? null;
  } catch {
    return null;
  }
}

function localWrite(proposal: Proposal) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  let all: Record<string, Proposal> = {};
  try { all = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")); } catch {}
  all[proposal.id] = proposal;
  fs.writeFileSync(DATA_FILE, JSON.stringify(all, null, 2));
}

export async function saveProposal(proposal: Proposal): Promise<void> {
  if (redis) {
    await redis.set(`proposal:${proposal.id}`, JSON.stringify(proposal), { ex: 60 * 60 * 24 * 90 }); // 90 days
  } else {
    localWrite(proposal);
  }
}

export async function updateProposal(id: string, patch: Partial<Proposal>): Promise<Proposal | null> {
  const existing = await getProposal(id);
  if (!existing) return null;
  const updated = { ...existing, ...patch };
  await saveProposal(updated);
  return updated;
}

export async function getProposal(id: string): Promise<Proposal | null> {
  if (redis) {
    const raw = await redis.get<string>(`proposal:${id}`);
    if (!raw) return null;
    return typeof raw === "string" ? JSON.parse(raw) : raw as Proposal;
  }
  return localRead(id);
}
