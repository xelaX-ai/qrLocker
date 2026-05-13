// Главный дашборд — список всех локеров с поиском по номеру
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Locker } from "@/types";
import { DashboardClient } from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // Загружаем все локеры на сервере для мгновенного отображения
  const { data: lockers } = await supabase
    .from("lockers")
    .select("*")
    .order("locker_number", { ascending: true });

  const available = (lockers as Locker[] ?? []).filter(
    (l) => l.status === "available"
  ).length;
  const occupied = (lockers as Locker[] ?? []).filter(
    (l) => l.status === "occupied"
  ).length;

  return (
    <DashboardClient
      initialLockers={(lockers as Locker[]) ?? []}
      userEmail={session?.user?.email ?? ""}
      stats={{ available, occupied, total: (lockers ?? []).length }}
    />
  );
}
