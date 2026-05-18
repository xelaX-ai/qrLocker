// GET /api/admins — список администраторов
// POST /api/admins — добавить администратора
// DELETE /api/admins — удалить администратора
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabase.from("admins").select("*").order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { email } = await req.json();
  if (!email || !email.includes("@")) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  const { data, error } = await supabase.from("admins").insert({ email: email.toLowerCase().trim() }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { email } = await req.json();
  if (session.user?.email?.toLowerCase() === email.toLowerCase())
    return NextResponse.json({ error: "Cannot remove yourself" }, { status: 400 });
  const { error } = await supabase.from("admins").delete().eq("email", email.toLowerCase());
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
