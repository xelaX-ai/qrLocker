import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

// POST /api/departments/assign — призначити локери до відділу
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { department_id, locker_ids } = await req.json();
  if (!Array.isArray(locker_ids) || locker_ids.length === 0)
    return NextResponse.json({ error: "No locker_ids" }, { status: 400 });
  const { error } = await supabase
    .from("lockers")
    .update({ department_id: department_id ?? null })
    .in("id", locker_ids);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, updated: locker_ids.length });
}
