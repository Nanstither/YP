import { Outlet } from 'react-router-dom';
import SideBar from './SideBar';

export default function Layout() {
  return (
    // grid-cols-12 — стандарт. Если нужно строго 3 и 6, замени на grid-cols-9
    <div className="grid grid-cols-12 gap-6 min-h-screen bg-slate-50 p-6">
      {/* Левый блок: 3 колонки */}
      <aside className="col-span-12 md:col-span-3 lg:col-span-3">
        <SideBar />
      </aside>

      {/* Правый блок: 9 колонок (замени col-span-9 на col-span-6, если нужно 3+6) */}
      <main className="col-span-12 md:col-span-9 lg:col-span-9">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 min-h-[calc(100vh-3rem)]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}