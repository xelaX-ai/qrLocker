// GET /api/lockers — список всех локеров (с возможностью поиска)
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  // Проверяем авторизацию
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim();

  let query = supabase
    .from("lockers")
    .select("*")
    .order("locker_number", { ascending: true });

  // Фильтрация по номеру локера если передан параметр search
  if (search) {
    const num = parseInt(search, 10);
    if (!isNaN(num)) {
      query = query.eq("locker_number", num);
    }
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
