// Middleware для защиты маршрутов — перенаправляет на /login если нет сессии
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Если пользователь авторизован и идёт на /login — редиректим на дашборд
    if (token && pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Проверяем наличие токена для защищённых маршрутов
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Публичные маршруты — не требуют авторизации
        const publicPaths = ["/login", "/access-denied", "/api/auth", "/locker/"];
        const isPublic = publicPaths.some((p) => pathname.startsWith(p));

        if (isPublic) return true;

        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

// Применяем middleware ко всем маршрутам кроме статики
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
