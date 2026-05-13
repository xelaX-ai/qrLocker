// Страница "Доступ запрещён" — показывается неавторизованным пользователям
import Link from "next/link";

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-neutral-100 mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">
          Access Denied
        </h1>
        <p className="mt-2 text-sm text-neutral-500 max-w-xs">
          У вас нет доступа к этой системе. Обратитесь к администратору для получения разрешения.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm text-neutral-900 underline underline-offset-2 hover:text-neutral-600 transition-colors"
        >
          Попробовать другой аккаунт
        </Link>
      </div>
    </div>
  );
}
