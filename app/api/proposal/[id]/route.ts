import { NextRequest, NextResponse } from "next/server";
import { getProposal, updateProposal } from "@/lib/store";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const proposal = await getProposal(id);
  if (!proposal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(proposal);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patch = await req.json();
  const updated = await updateProposal(id, patch);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}
