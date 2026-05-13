"use client";

// Клиентская часть дашборда — поиск, фильтрация, навигация
import { useState, useMemo } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Locker } from "@/types";

interface Props {
  initialLockers: Locker[];
  userEmail: string;
  stats: { available: number; occupied: number; total: number };
}

export function DashboardClient({ initialLockers, userEmail, stats }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "occupied">("all");

  // Фильтруем локеры по поиску и статусу
  const filtered = useMemo(() => {
    return initialLockers.filter((l) => {
      const matchSearch =
        search === "" ||
        l.locker_number.toString().includes(search) ||
        (l.owner_name?.toLowerCase() ?? "").includes(search.toLowerCase());

      const matchStatus =
        statusFilter === "all" || l.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [initialLockers, search, statusFilter]);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Шапка */}
      <header className="bg-white border-b border-neutral-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold text-neutral-900 tracking-tight">
              Locker Admin
            </span>
          </div>

          {/* Email пользователя + выход */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs text-neutral-400 font-mono">
              {userEmail}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Статистика */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Всего", value: stats.total },
            { label: "Свободно", value: stats.available },
            { label: "Занято", value: stats.occupied },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl border border-neutral-100 p-4"
            >
              <p className="text-2xl font-semibold text-neutral-900 tabular-nums">
                {s.value}
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Поиск и фильтры */}
        <div className="flex flex-col sm:flex-row gap-2 mb-5">
          <div className="relative flex-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              type="text"
              placeholder="Поиск по номеру или имени..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
            />
          </div>

          {/* Фильтр статуса */}
          <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded-xl p-1">
            {(["all", "available", "occupied"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  statusFilter === f
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                {f === "all" ? "Все" : f === "available" ? "Свободно" : "Занято"}
              </button>
            ))}
          </div>
        </div>

        {/* Список локеров */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-sm text-neutral-400">
            Локеры не найдены
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((locker) => (
              <LockerCard key={locker.id} locker={locker} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Карточка отдельного локера в сетке
function LockerCard({ locker }: { locker: Locker }) {
  const isOccupied = locker.status === "occupied";
  const updatedAt = new Date(locker.updated_at).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Link
      href={`/locker/${locker.id}`}
      className="group bg-white border border-neutral-100 rounded-2xl p-5 hover:border-neutral-300 hover:shadow-sm transition-all duration-150"
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-mono text-neutral-400">
            #{locker.locker_number}
          </span>
          <p className="mt-1 text-base font-medium text-neutral-900">
            {isOccupied ? locker.owner_name || "—" : "Свободно"}
          </p>
        </div>

        {/* Индикатор статуса */}
        <span
          className={`mt-0.5 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
            isOccupied
              ? "bg-neutral-900 text-white"
              : "bg-neutral-100 text-neutral-600"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isOccupied ? "bg-white" : "bg-neutral-400"
            }`}
          />
          {isOccupied ? "Занято" : "Свободно"}
        </span>
      </div>

      <p className="mt-3 text-xs text-neutral-400">{updatedAt}</p>
    </Link>
  );
}
