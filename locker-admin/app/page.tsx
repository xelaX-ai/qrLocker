// Корневой маршрут — перенаправляет на дашборд (middleware обработает неавторизованных)
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard");
}
