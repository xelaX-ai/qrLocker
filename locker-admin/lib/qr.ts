// Утилита для генерации QR-кодов в формате base64 Data URL

import QRCode from "qrcode";

/**
 * Генерирует QR-код для локера.
 * URL никогда не меняется — QR постоянный.
 */
export async function generateLockerQR(
  lockerId: string,
  baseUrl: string
): Promise<string> {
  const url = `${baseUrl}/locker/${lockerId}`;

  const dataUrl = await QRCode.toDataURL(url, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 300,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });

  return dataUrl;
}
