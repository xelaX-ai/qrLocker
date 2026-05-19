import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Locker, Department } from "@/types";
import { DashboardClient } from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const [{ data: lockers }, { data: departments }] = await Promise.all([
    supabase.from("lockers").select("*").order("locker_number", { ascending: true }),
    supabase.from("departments").select("*").order("name"),
  ]);

  return (
    <DashboardClient
      initialLockers={(lockers as Locker[]) ?? []}
      initialDepartments={(departments as Department[]) ?? []}
      userEmail={session?.user?.email ?? ""}
    />
  );
}
