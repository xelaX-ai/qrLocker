"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Locker } from "@/types";

interface Props {
  initialLocker: Locker;
  userEmail: string;
  baseUrl: string;
}

export function LockerClient({ initialLocker, userEmail, baseUrl }: Props) {
  const [locker, setLocker] = useState<Locker>(initialLocker);
  const [isEditing, setIsEditing] = useState(false);
  const [ownerInput, setOwnerInput] = useState(locker.owner_name ?? "");
  const [deptInput, setDeptInput] = useState(locker.department ?? "");
  const [loading, setLoading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (showQR && !qrDataUrl) {
      fetch("/api/lockers/" + locker.id + "/qr").then(r => r.json()).then(d => setQrDataUrl(d.qr));
    }
  }, [showQR, qrDataUrl, locker.id]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const update = async (payload: Partial<Pick<Locker, "owner_name" | "status" | "department">>) => {
    setLoading(true);
    try {
      const res = await fetch("/api/lockers/" + locker.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setLocker(updated);
      showToast("Сохранено");
    } catch { showToast("Ошибка — попробуйте снова"); }
    finally { setLoading(false); }
  };

  const handleAssign = async () => {
    if (!ownerInput.trim()) return;
    await update({ owner_name: ownerInput.trim(), status: "occupied", department: deptInput.trim() || null });
    setIsEditing(false);
  };

  const handleClear = async () => {
    await update({ owner_name: null, status: "available" });
    setOwnerInput("");
    setIsEditing(false);
  };

  const isOccupied = locker.status === "occupied";
  const updatedAt = new Date(locker.updated_at).toLocaleString("ru-RU", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Все локеры
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs text-neutral-400 font-mono">{userEmail}</span>
            <button onClick={() => signOut({ callbackUrl: "/login" })} className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer">Выйти</button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 space-y-4">
        <div className="bg-white rounded-2xl border border-neutral-100 p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs font-mono text-neutral-400">ЛОКЕР</p>
              <h1 className="text-4xl font-semibold text-neutral-900 tabular-nums mt-1">#{locker.locker_number}</h1>
              {locker.department && <span className="mt-1 inline-block text-xs px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded-md">{locker.department}</span>}
            </div>
            <span className={"inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full " + (isOccupied ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600")}>
              <span className={"w-1.5 h-1.5 rounded-full " + (isOccupied ? "bg-white" : "bg-neutral-400")} />
              {isOccupied ? "Занято" : "Свободно"}
            </span>
          </div>

          <div className="border-t border-neutral-100 pt-5">
            <p className="text-xs text-neutral-400 mb-1.5">Владелец</p>
            {isEditing ? (
              <div className="space-y-2">
                <input type="text" value={ownerInput} onChange={e => setOwnerInput(e.target.value)} placeholder="Имя и фамилия..." autoFocus className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent" />
                <input type="text" value={deptInput} onChange={e => setDeptInput(e.target.value)} placeholder="Отдел (необязательно)..." className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent" />
                <div className="flex gap-2">
                  <button onClick={handleAssign} disabled={loading || !ownerInput.trim()} className="px-4 py-2 text-sm font-medium bg-neutral-900 text-white rounded-xl hover:bg-neutral-700 disabled:opacity-40 transition-all cursor-pointer">Сохранить</button>
                  <button onClick={() => { setIsEditing(false); setOwnerInput(locker.owner_name ?? ""); setDeptInput(locker.department ?? ""); }} className="px-3 py-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer">Отмена</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-neutral-900">{locker.owner_name || <span className="text-neutral-400 font-normal">—</span>}</p>
                <button onClick={() => { setOwnerInput(locker.owner_name ?? ""); setDeptInput(locker.department ?? ""); setIsEditing(true); }} className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer">Редактировать</button>
              </div>
            )}
          </div>

          <div className="border-t border-neutral-100 pt-4 mt-4">
            <p className="text-xs text-neutral-400">Обновлено: {updatedAt}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-100 p-5">
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-4">Действия</p>
          <div className="space-y-2.5">
            <ActionButton onClick={() => { setOwnerInput(locker.owner_name ?? ""); setDeptInput(locker.department ?? ""); setIsEditing(true); }} disabled={loading} icon={<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />}>
              {isOccupied ? "Изменить владельца" : "Назначить владельца"}
            </ActionButton>
            <ActionButton onClick={handleClear} disabled={loading || !isOccupied} icon={<path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />}>
              Освободить локер
            </ActionButton>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <button onClick={() => setShowQR(v => !v)} className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium text-neutral-900 hover:bg-neutral-50 transition-colors cursor-pointer">
            <div className="flex items-center gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
              </svg>
              QR-код для локера
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className={"w-4 h-4 text-neutral-400 transition-transform " + (showQR ? "rotate-180" : "")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          {showQR && (
            <div className="px-5 pb-5 border-t border-neutral-100">
              {qrDataUrl ? (
                <div className="flex flex-col items-center gap-4 pt-4">
                  <img src={qrDataUrl} alt={"QR для локера " + locker.locker_number} className="w-48 h-48 rounded-xl" />
                  <p className="text-xs text-neutral-400 text-center">
                    Постоянная ссылка:<br />
                    <span className="font-mono text-neutral-600">{baseUrl}/locker/{locker.id}</span>
                  </p>
                  <a href={qrDataUrl} download={"locker-" + locker.locker_number + "-qr.png"} className="text-xs text-neutral-900 underline underline-offset-2 hover:text-neutral-600 transition-colors">Скачать QR-код</a>
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 pt-4">
                  <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2.5 bg-neutral-900 text-white text-sm rounded-xl shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

function ActionButton({ children, onClick, disabled, icon }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; icon: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 bg-neutral-50 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all duration-150 cursor-pointer">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-neutral-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>{icon}</svg>
      {children}
    </button>
  );
}
