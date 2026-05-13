// Страница отдельного локера — открывается по QR-коду
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Locker } from "@/types";
import { notFound } from "next/navigation";
import { LockerClient } from "./LockerClient";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export default async function LockerPage({ params }: Props) {
  const session = await getServerSession(authOptions);

  const { data, error } = await supabase
    .from("lockers")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !data) {
    notFound();
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <LockerClient
      initialLocker={data as Locker}
      userEmail={session?.user?.email ?? ""}
      baseUrl={baseUrl}
    />
  );
}
