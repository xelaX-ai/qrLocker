// GET /api/lockers/[id]/qr — генерация QR-кода для локера
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateLockerQR } from "@/lib/qr";

interface RouteParams {
  params: { id: string };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? `https://${req.headers.get("host")}`;

  const qrDataUrl = await generateLockerQR(params.id, baseUrl);

  return NextResponse.json({ qr: qrDataUrl });
}
