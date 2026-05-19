"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Locker, Department } from "@/types";

interface Props {
  initialLockers: Locker[];
  initialDepartments: Department[];
  userEmail: string;
}

export function DashboardClient({ initialLockers, initialDepartments, userEmail }: Props) {
  const [lockers, setLockers] = useState<Locker[]>(initialLockers);
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAdminsModal, setShowAdminsModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    let list = lockers;
    if (search) {
      list = list.filter(l =>
        l.locker_number.toString().includes(search) ||
        (l.owner_name?.toLowerCase() ?? "").includes(search.toLowerCase())
      );
    }
    if (activeTab === "all") return list;
    if (activeTab === "unassigned") return list.filter(l => !l.department_id);
    return list.filter(l => l.department_id === activeTab);
  }, [lockers, search, activeTab]);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(filtered.map(l => l.id)));
  const clearSelect = () => { setSelected(new Set()); setSelectMode(false); };

  const handleDeleteSelected = async () => {
    if (!selected.size) return;
    if (!confirm("Удалить " + selected.size + " локер(ов)?")) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/lockers/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      if (!res.ok) throw new Error();
      setLockers(prev => prev.filter(l => !selected.has(l.id)));
      clearSelect();
    } catch { alert("Ошибка при удалении"); }
    finally { setDeleting(false); }
  };

  const handleAssignDept = async (department_id: string | null) => {
    if (!selected.size) return;
    try {
      await fetch("/api/departments/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ department_id, locker_ids: Array.from(selected) }),
      });
      setLockers(prev => prev.map(l => selected.has(l.id) ? { ...l, department_id } : l));
      clearSelect();
    } catch { alert("Ошибка"); }
  };

  const liveStats = {
    total: lockers.length,
    available: lockers.filter(l => l.status === "available").length,
    occupied: lockers.filter(l => l.status === "occupied").length,
  };

  const tabs = [
    { id: "all", label: "Все" },
    { id: "unassigned", label: "Непризначені" },
    ...departments.map(d => ({ id: d.id, label: d.name })),
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-neutral-900 tracking-tight">Locker Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowDeptModal(true)} className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer">Відділи</button>
            <button onClick={() => setShowAdminsModal(true)} className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer">Администраторы</button>
            <span className="hidden sm:block text-xs text-neutral-400 font-mono">{userEmail}</span>
            <button onClick={() => signOut({ callbackUrl: "/login" })} className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer">Выйти</button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Статистика */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[{ label: "Всего", value: liveStats.total }, { label: "Свободно", value: liveStats.available }, { label: "Занято", value: liveStats.occupied }].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-neutral-100 p-4">
              <p className="text-2xl font-semibold text-neutral-900 tabular-nums">{s.value}</p>
              <p className="text-xs text-neutral-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Вкладки відділів */}
        <div className="flex gap-1 mb-5 overflow-x-auto pb-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={"px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all cursor-pointer " + (activeTab === tab.id ? "bg-neutral-900 text-white" : "bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-400")}>
              {tab.label}
              <span className="ml-1.5 text-xs opacity-60">
                {tab.id === "all" ? lockers.length : tab.id === "unassigned" ? lockers.filter(l => !l.department_id).length : lockers.filter(l => l.department_id === tab.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* Пошук і дії */}
        <div className="flex flex-col sm:flex-row gap-2 mb-5">
          <div className="relative flex-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input type="text" placeholder="Поиск по номеру или имени..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all" />
          </div>
          {!selectMode ? (
            <>
              <button onClick={() => setSelectMode(true)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-all cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Вибрати
              </button>
              <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-neutral-900 text-white rounded-xl hover:bg-neutral-700 transition-all cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                Создать локеры
              </button>
            </>
          ) : (
            <div className="flex gap-2 flex-wrap">
              <button onClick={selectAll} className="px-3 py-2 text-xs font-medium text-neutral-600 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 cursor-pointer">Вибрати всі</button>
              {departments.length > 0 && (
                <select onChange={e => e.target.value && handleAssignDept(e.target.value || null)}
                  className="px-3 py-2 text-xs font-medium text-neutral-600 bg-white border border-neutral-200 rounded-xl cursor-pointer focus:outline-none">
                  <option value="">Призначити до відділу...</option>
                  <option value="">— Без відділу</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              )}
              <button onClick={handleDeleteSelected} disabled={!selected.size || deleting} className="px-3 py-2 text-xs font-medium bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-40 cursor-pointer">
                {deleting ? "..." : "Видалити (" + selected.size + ")"}
              </button>
              <button onClick={clearSelect} className="px-3 py-2 text-xs font-medium text-neutral-600 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 cursor-pointer">Відміна</button>
            </div>
          )}
        </div>

        {/* Список локерів */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-sm text-neutral-400">Локеры не найдены</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((locker) => (
              <LockerCard key={locker.id} locker={locker} departments={departments} selectMode={selectMode} selected={selected.has(locker.id)} onToggle={() => toggleSelect(locker.id)} />
            ))}
          </div>
        )}
      </main>

      {showCreateModal && <CreateLockersModal onClose={() => setShowCreateModal(false)} onCreated={(newLockers) => { setLockers(prev => [...prev, ...newLockers]); setShowCreateModal(false); }} />}
      {showAdminsModal && <AdminsModal onClose={() => setShowAdminsModal(false)} currentEmail={userEmail} />}
      {showDeptModal && <DepartmentsModal onClose={() => setShowDeptModal(false)} departments={departments} setDepartments={setDepartments} onDeptDeleted={(id) => setLockers(prev => prev.map(l => l.department_id === id ? { ...l, department_id: null } : l))} />}
    </div>
  );
}

function DepartmentsModal({ onClose, departments, setDepartments, onDeptDeleted }: {
  onClose: () => void;
  departments: Department[];
  setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
  onDeptDeleted: (id: string) => void;
}) {
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    setError(null);
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/departments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newName.trim() }) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      const added = await res.json();
      setDepartments(prev => [...prev, added].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName("");
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Ошибка"); }
    finally { setAdding(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm("Видалити відділ \"" + name + "\"? Локери стануть непризначеними.")) return;
    try {
      await fetch("/api/departments", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      setDepartments(prev => prev.filter(d => d.id !== id));
      onDeptDeleted(id);
    } catch { alert("Ошибка"); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-neutral-100 p-6 w-full max-w-sm mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-neutral-900">Відділи</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex gap-2 mb-4">
          <input type="text" placeholder="Назва відділу..." value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAdd()} className="flex-1 px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent" autoFocus />
          <button onClick={handleAdd} disabled={adding || !newName.trim()} className="px-4 py-2 text-sm font-medium bg-neutral-900 text-white rounded-xl hover:bg-neutral-700 disabled:opacity-40 cursor-pointer">
            {adding ? "..." : "Додати"}
          </button>
        </div>
        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {departments.length === 0 ? (
            <p className="text-xs text-neutral-400 text-center py-4">Відділів ще немає</p>
          ) : departments.map(d => (
            <div key={d.id} className="flex items-center justify-between px-3 py-2 bg-neutral-50 rounded-xl">
              <span className="text-sm text-neutral-700">{d.name}</span>
              <button onClick={() => handleDelete(d.id, d.name)} className="text-xs text-neutral-400 hover:text-red-600 transition-colors cursor-pointer">Видалити</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminsModal({ onClose, currentEmail }: { onClose: () => void; currentEmail: string }) {
  const [admins, setAdmins] = useState<{ id: string; email: string }[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admins").then(r => r.json()).then(d => { setAdmins(d); setLoading(false); });
  }, []);

  const handleAdd = async () => {
    setError(null);
    if (!newEmail.includes("@")) { setError("Введите корректный email"); return; }
    setAdding(true);
    try {
      const res = await fetch("/api/admins", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: newEmail }) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      const added = await res.json();
      setAdmins(prev => [...prev, added]);
      setNewEmail("");
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Ошибка"); }
    finally { setAdding(false); }
  };

  const handleRemove = async (email: string) => {
    if (!confirm("Удалить " + email + "?")) return;
    try {
      await fetch("/api/admins", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      setAdmins(prev => prev.filter(a => a.email !== email));
    } catch { alert("Ошибка"); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-neutral-100 p-6 w-full max-w-sm mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-neutral-900">Администраторы</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex gap-2 mb-4">
          <input type="email" placeholder="email@example.com" value={newEmail} onChange={e => setNewEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAdd()} className="flex-1 px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent" />
          <button onClick={handleAdd} disabled={adding || !newEmail.trim()} className="px-4 py-2 text-sm font-medium bg-neutral-900 text-white rounded-xl hover:bg-neutral-700 disabled:opacity-40 transition-all cursor-pointer">
            {adding ? "..." : "Добавить"}
          </button>
        </div>
        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {loading ? (
            <p className="text-xs text-neutral-400 text-center py-4">Загрузка...</p>
          ) : admins.length === 0 ? (
            <p className="text-xs text-neutral-400 text-center py-4">Нет администраторов</p>
          ) : admins.map(a => (
            <div key={a.id} className="flex items-center justify-between px-3 py-2 bg-neutral-50 rounded-xl">
              <span className="text-sm text-neutral-700 font-mono">{a.email}</span>
              {a.email !== currentEmail && (
                <button onClick={() => handleRemove(a.email)} className="text-xs text-neutral-400 hover:text-red-600 transition-colors cursor-pointer">Удалить</button>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-neutral-400 mt-4">После добавления администратору нужно войти через Google.</p>
      </div>
    </div>
  );
}

function CreateLockersModal({ onClose, onCreated }: { onClose: () => void; onCreated: (lockers: Locker[]) => void }) {
  const [range, setRange] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdLockers, setCreatedLockers] = useState<Locker[] | null>(null);

  const parseRange = (val: string) => {
    const match = val.trim().match(/^(\d+)-(\d+)$/);
    if (!match) return null;
    const from = parseInt(match[1], 10), to = parseInt(match[2], 10);
    if (from < 1 || to < from || to - from > 199) return null;
    return { from, to };
  };

  const handleCreate = async () => {
    setError(null);
    const parsed = parseRange(range);
    if (!parsed) { setError("Введите диапазон в формате 1-20 (максимум 200 локеров)"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/lockers/bulk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Ошибка создания"); }
      setCreatedLockers(await res.json());
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Ошибка"); }
    finally { setLoading(false); }
  };

  const handlePrint = () => {
    if (!createdLockers) return;
    const baseUrl = window.location.origin;
    const html = "<!DOCTYPE html><html><head><meta charset=\"utf-8\"/><title>QR</title>" +
      "<script src=\"https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js\"><\/script>" +
      "<style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Arial,sans-serif;}" +
      ".grid{display:grid;grid-template-columns:repeat(auto-fill,28mm);gap:4mm;padding:10mm;}" +
      ".item{width:28mm;display:flex;flex-direction:column;align-items:center;gap:1mm;page-break-inside:avoid;}" +
      ".qr-wrap{width:25mm;height:25mm;}.qr-wrap canvas,.qr-wrap img{width:25mm!important;height:25mm!important;}" +
      ".label{font-size:7pt;font-weight:bold;text-align:center;}" +
      "@media print{@page{size:A4;margin:0;}body{margin:0;}}</style></head>" +
      "<body><div class=\"grid\" id=\"grid\"></div><script>" +
      "const lockers=" + JSON.stringify(createdLockers.map(l => ({ id: l.id, number: l.locker_number }))) + ";" +
      "const baseUrl=\"" + baseUrl + "\";const grid=document.getElementById(\"grid\");" +
      "lockers.forEach(l=>{const item=document.createElement(\"div\");item.className=\"item\";" +
      "const wrap=document.createElement(\"div\");wrap.className=\"qr-wrap\";" +
      "const label=document.createElement(\"div\");label.className=\"label\";" +
      "label.textContent=\"Локер #\"+l.number;" +
      "item.appendChild(wrap);item.appendChild(label);grid.appendChild(item);" +
      "new QRCode(wrap,{text:baseUrl+\"/locker/\"+l.id,width:94,height:94,correctLevel:QRCode.CorrectLevel.M});});" +
      "setTimeout(()=>window.print(),1200);<\/script></body></html>";
    const win = window.open("", "_blank");
    if (win) { win.document.write(html); win.document.close(); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-neutral-100 p-6 w-full max-w-sm mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-neutral-900">Создать локеры</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        {!createdLockers ? (
          <>
            <p className="text-xs text-neutral-400 mb-3">Введите диапазон, например <span className="font-mono text-neutral-600">1-20</span></p>
            <input type="text" placeholder="1-20" value={range} onChange={(e) => setRange(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCreate()} className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent mb-3" autoFocus />
            {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
            <button onClick={handleCreate} disabled={loading || !range.trim()} className="w-full py-2.5 text-sm font-medium bg-neutral-900 text-white rounded-xl hover:bg-neutral-700 disabled:opacity-40 transition-all cursor-pointer">
              {loading ? "Создаём..." : "Создать"}
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4 p-3 bg-neutral-50 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-sm text-neutral-700">Создано <span className="font-semibold">{createdLockers.length}</span> локеров</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handlePrint} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium bg-neutral-900 text-white rounded-xl hover:bg-neutral-700 transition-all cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.055 48.055 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" /></svg>
                Печать QR
              </button>
              <button onClick={() => onCreated(createdLockers)} className="flex-1 py-2.5 text-sm font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-all cursor-pointer">Готово</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function LockerCard({ locker, departments, selectMode, selected, onToggle }: { locker: Locker; departments: Department[]; selectMode: boolean; selected: boolean; onToggle: () => void }) {
  const isOccupied = locker.status === "occupied";
  const dept = departments.find(d => d.id === locker.department_id);
  const updatedAt = new Date(locker.updated_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });

  if (selectMode) {
    return (
      <div onClick={onToggle} className={"cursor-pointer bg-white border-2 rounded-2xl p-5 transition-all duration-150 " + (selected ? "border-neutral-900 bg-neutral-50" : "border-neutral-100 hover:border-neutral-300")}>
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-mono text-neutral-400">#{locker.locker_number}</span>
            {dept && <span className="ml-2 text-xs text-neutral-400">{dept.name}</span>}
            <p className="mt-1 text-base font-medium text-neutral-900">{isOccupied ? locker.owner_name || "—" : "Свободно"}</p>
          </div>
          <div className={"w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 " + (selected ? "bg-neutral-900 border-neutral-900" : "border-neutral-300")}>
            {selected && <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
          </div>
        </div>
        <p className="mt-3 text-xs text-neutral-400">{updatedAt}</p>
      </div>
    );
  }

  return (
    <Link href={"/locker/" + locker.id} className="group bg-white border border-neutral-100 rounded-2xl p-5 hover:border-neutral-300 hover:shadow-sm transition-all duration-150">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-mono text-neutral-400">#{locker.locker_number}</span>
          {dept && <span className="ml-2 text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded-md">{dept.name}</span>}
          <p className="mt-1 text-base font-medium text-neutral-900">{isOccupied ? locker.owner_name || "—" : "Свободно"}</p>
        </div>
        <span className={"mt-0.5 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full " + (isOccupied ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600")}>
          <span className={"w-1.5 h-1.5 rounded-full " + (isOccupied ? "bg-white" : "bg-neutral-400")} />
          {isOccupied ? "Занято" : "Свободно"}
        </span>
      </div>
      <p className="mt-3 text-xs text-neutral-400">{updatedAt}</p>
    </Link>
  );
}
