// GET /api/lockers/[id] — данные одного локера
// PATCH /api/lockers/[id] — обновление локера (статус, владелец)
// DELETE /api/lockers/[id] — удаление локера
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { UpdateLockerPayload } from "@/types";

interface RouteParams {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { data, error } = await supabase
    .from("lockers")
    .select("*")
    .eq("id", params.id)
    .single();
  if (error || !data) return NextResponse.json({ error: "Locker not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body: UpdateLockerPayload = await req.json();
  if (body.status && !["available", "occupied"].includes(body.status))
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  const { data, error } = await supabase.from("lockers").update(body).eq("id", params.id).select().single();
  if (error || !data) return NextResponse.json({ error: "Update failed" }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { error } = await supabase.from("lockers").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
