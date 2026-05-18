"use client";
import { Locker } from "@/types";

interface Props {
  locker: Locker;
}

export function LockerPublicView({ locker }: Props) {
  const isOccupied = locker.status === "occupied";
  const updatedAt = new Date(locker.updated_at).toLocaleString("ru-RU", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-neutral-100 p-8 w-full max-w-sm shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${isOccupied ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOccupied ? "bg-white" : "bg-neutral-400"}`} />
            {isOccupied ? "Занято" : "Свободно"}
          </span>
        </div>

        <p className="text-xs font-mono text-neutral-400 mb-1">ЛОКЕР</p>
        <h1 className="text-5xl font-semibold text-neutral-900 tabular-nums mb-6">
          #{locker.locker_number}
        </h1>

        <div className="border-t border-neutral-100 pt-5 space-y-3">
          <div>
            <p className="text-xs text-neutral-400 mb-1">Владелец</p>
            <p className="text-sm font-medium text-neutral-900">
              {locker.owner_name || <span className="text-neutral-400 font-normal">—</span>}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-400 mb-1">Обновлено</p>
            <p className="text-sm text-neutral-600">{updatedAt}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
