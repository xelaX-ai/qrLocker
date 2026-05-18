// POST /api/lockers/bulk — создание нескольких локеров сразу
// DELETE /api/lockers/bulk — удаление нескольких локеров по ids
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { from, to } = await req.json();
  if (typeof from !== "number" || typeof to !== "number" || from < 1 || to < from || to - from > 199)
    return NextResponse.json({ error: "Invalid range (max 200 at a time)" }, { status: 400 });
  const lockers = [];
  for (let i = from; i <= to; i++) lockers.push({ locker_number: i, status: "available", owner_name: null });
  const { data, error } = await supabase.from("lockers").insert(lockers).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { ids } = await req.json();
  if (!Array.isArray(ids) || ids.length === 0)
    return NextResponse.json({ error: "No ids provided" }, { status: 400 });
  const { error } = await supabase.from("lockers").delete().in("id", ids);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, deleted: ids.length });
}
