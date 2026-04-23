import { Outlet } from 'react-router-dom';
import SideBar from './SideBar';

export default function Layout() {
  return (
    <div className="grid grid-cols-12 gap-4 min-h-screen bg-slate-50/50">
      <aside className="col-span-12 md:col-span-3 lg:col-span-2 h-full">
        <SideBar />
      </aside>
      <main className="col-span-12 md:col-span-9 lg:col-span-10 m-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 min-h-[calc(100vh-2rem)]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}