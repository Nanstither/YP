import { useState, useEffect } from 'react';
import { getProjects, createProject, updateProject, deleteProject } from '../services/api';
import ProjectModal from '../components/ProjectModal';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [saving, setSaving] = useState(false);

  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Фильтры (дата теперь разделена на От/До)
  const [filters, setFilters] = useState({
    id: '', name: '', code: '', status: '', dateFrom: '', dateTo: ''
  });

  // Сортировка: ключ и направление
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

  useEffect(() => { loadProjects(); }, []);

  // Сброс пагинации при изменении фильтров или сортировки
  useEffect(() => { setCurrentPage(1); }, [filters, sortConfig]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await getProjects();
      setProjects(Array.isArray(data) ? data : data?.data || []);
    } catch (err) { console.error('Ошибка загрузки:', err); }
    finally { setLoading(false); }
  };

  const handleCreateClick = () => { setEditingProject(null); setIsModalOpen(true); };
  const handleEditClick = (project) => { setEditingProject(project); setIsModalOpen(true); };

  const handleSave = async (formData) => {
    try {
      setSaving(true);
      if (editingProject) await updateProject(editingProject.id, formData);
      else await createProject(formData);
      setIsModalOpen(false);
      await loadProjects();
    } catch (err) { console.error('Ошибка сохранения:', err); alert('Не удалось сохранить'); }
    finally { setSaving(false); }
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Удалить этот проект?')) return;
    try { await deleteProject(id); await loadProjects(); }
    catch (err) { console.error('Ошибка удаления:', err); alert('Не удалось удалить'); }
  };

  const clearFilters = () => setFilters({ id: '', name: '', code: '', status: '', dateFrom: '', dateTo: '' });

  // Хелпер для безопасного получения timestamp
  const getTimestamp = (dateStr) => {
    if (!dateStr) return 0;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  };

  // 1️⃣ ФИЛЬТРАЦИЯ
  const filtered = projects.filter((p) => {
    const matchId = !filters.id || String(p.id || '').includes(filters.id);
    const matchName = !filters.name || (p.name || p.title || '').toLowerCase().includes(filters.name.toLowerCase());
    const matchCode = !filters.code || (p.code || p.slug || '').toLowerCase().includes(filters.code.toLowerCase());
    const matchStatus = !filters.status || (p.status || '').toLowerCase() === filters.status.toLowerCase();
    
    // Фильтр по диапазону дат
    let matchDate = true;
    if (filters.dateFrom || filters.dateTo) {
      const pTime = getTimestamp(p.updated_at);
      const fromTime = filters.dateFrom ? getTimestamp(filters.dateFrom) : 0;
      const toTime = filters.dateTo ? getTimestamp(filters.dateTo) + 86399999 : Infinity; // +23:59:59
      matchDate = pTime >= fromTime && pTime <= toTime;
    }

    return matchId && matchName && matchCode && matchStatus && matchDate;
  });

  // 2️⃣ СОРТИРОВКА
  const sorted = [...filtered].sort((a, b) => {
    let valA = a[sortConfig.key];
    let valB = b[sortConfig.key];

    // Специальная обработка для дат
    if (sortConfig.key === 'updated_at') {
      valA = getTimestamp(a.updated_at);
      valB = getTimestamp(b.updated_at);
    } 
    // Строки: приводим к строке и сравниваем без учёта регистра
    else if (typeof valA === 'string' || typeof valB === 'string') {
      valA = String(valA ?? '').toLowerCase().trim();
      valB = String(valB ?? '').toLowerCase().trim();
    }
    // Числа и остальное: приводим к числу (пустые значения → 0)
    else {
      valA = Number(valA) || 0;
      valB = Number(valB) || 0;
    }

    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // 3️⃣ ПАГИНАЦИЯ
  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginated = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusStyle = (s) => {
    const map = {
      active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      completed: 'bg-slate-100 text-slate-600 border-slate-200',
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      closed: 'bg-red-100 text-red-700 border-red-200'
    };
    return map[s] || 'bg-slate-100 text-slate-600 border-slate-200';
  };

  // Индикатор сортировки
  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <span className="ml-1 text-slate-400">↕</span>;
    return <span className="ml-1 text-blue-600 font-bold">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="space-y-6">
      <ProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} project={editingProject} onSave={handleSave} loading={saving} />

      {/* Шапка */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Проекты</h2>
        <div className="flex items-center gap-3">
          <button onClick={clearFilters} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition">Сбросить</button>
          <button onClick={handleCreateClick} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-sm transition flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Создать
          </button>
        </div>
      </div>

      {/* Панель фильтров */}
      <div className="grid grid-cols-12 gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="col-span-2"><input type="text" placeholder="ID" value={filters.id} onChange={e => setFilters({...filters, id: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" /></div>
        <div className="col-span-3"><input type="text" placeholder="Название" value={filters.name} onChange={e => setFilters({...filters, name: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" /></div>
        <div className="col-span-2"><input type="text" placeholder="Код" value={filters.code} onChange={e => setFilters({...filters, code: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" /></div>
        <div className="col-span-2">
          <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white">
            <option value="">Все статусы</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div className="col-span-1.5"><input type="date" placeholder="От" value={filters.dateFrom} onChange={e => setFilters({...filters, dateFrom: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" /></div>
        <div className="col-span-1.5"><input type="date" placeholder="До" value={filters.dateTo} onChange={e => setFilters({...filters, dateTo: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" /></div>
      </div>

      {/* Таблица */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 select-none" onClick={() => setSortConfig({ key: 'id', direction: sortConfig.key === 'id' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>ID <SortIcon column="id" /></th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 select-none" onClick={() => setSortConfig({ key: 'name', direction: sortConfig.key === 'name' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>Название <SortIcon column="name" /></th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 select-none" onClick={() => setSortConfig({ key: 'code', direction: sortConfig.key === 'code' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>Код <SortIcon column="code" /></th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 select-none" onClick={() => setSortConfig({ key: 'status', direction: sortConfig.key === 'status' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>Статус <SortIcon column="status" /></th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 select-none" onClick={() => setSortConfig({ key: 'updated_at', direction: sortConfig.key === 'updated_at' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>Обновлено <SortIcon column="updated_at" /></th>
                <th className="px-6 py-4 text-right w-24">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400">Загрузка...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400">Ничего не найдено</td></tr>
              ) : (
                paginated.map((p, i) => (
                  <tr key={p.id || i} className="hover:bg-slate-50/80 transition group">
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">#{p.id || i + 1}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800 group-hover:text-blue-600 transition">{p.name || p.title || 'Без названия'}</td>
                    <td className="px-6 py-4"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-mono">{p.code || p.slug || '---'}</span></td>
                    <td className="px-6 py-4"><span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusStyle(p.status)}`}>{p.status || 'Active'}</span></td>
                    <td className="px-6 py-4 text-slate-500">{p.updated_at ? new Date(p.updated_at).toLocaleDateString('ru-RU') : '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                        <button onClick={() => handleEditClick(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => handleDeleteClick(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Пагинация */}
        {!loading && sorted.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
            <span className="text-sm text-slate-500">Показано {paginated.length} из {sorted.length}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 transition">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <span className="px-3 py-1 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg">{currentPage} / {totalPages || 1}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages || 1, p + 1))} disabled={currentPage === (totalPages || 1)} className="p-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 transition">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}