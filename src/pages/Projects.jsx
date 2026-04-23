import { useState, useEffect } from 'react';
import { getProjects, createProject, updateProject, deleteProject } from '../services/api';
import ProjectModal from '../components/ProjectModal';
import { Plus, Search, X, Pencil, Trash2, ChevronLeft, ChevronRight, ArrowUpDown, CalendarDays, Tag, Hash, LayoutGrid, Filter } from 'lucide-react';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filters, setFilters] = useState({ id: '', name: '', code: '', status: '', dateFrom: '', dateTo: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

  useEffect(() => { loadProjects(); }, []);
  useEffect(() => { setCurrentPage(1); }, [filters, sortConfig]);

  const loadProjects = async () => {
    try { setLoading(true); const data = await getProjects(); setProjects(Array.isArray(data) ? data : data?.data || []); }
    catch (err) { console.error('Ошибка загрузки:', err); }
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

  const getTimestamp = (dateStr) => {
    if (!dateStr) return 0;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  };

  const filtered = projects.filter((p) => {
    const matchId = !filters.id || String(p.id || '').includes(filters.id);
    const matchName = !filters.name || (p.name || p.title || '').toLowerCase().includes(filters.name.toLowerCase());
    const matchCode = !filters.code || (p.code || p.slug || '').toLowerCase().includes(filters.code.toLowerCase());
    const matchStatus = !filters.status || (p.status || '').toLowerCase() === filters.status.toLowerCase();
    let matchDate = true;
    if (filters.dateFrom || filters.dateTo) {
      const pTime = getTimestamp(p.updated_at);
      const fromTime = filters.dateFrom ? getTimestamp(filters.dateFrom) : 0;
      const toTime = filters.dateTo ? getTimestamp(filters.dateTo) + 86399999 : Infinity;
      matchDate = pTime >= fromTime && pTime <= toTime;
    }
    return matchId && matchName && matchCode && matchStatus && matchDate;
  });

  const sorted = [...filtered].sort((a, b) => {
    let valA = a[sortConfig.key];
    let valB = b[sortConfig.key];
    if (sortConfig.key === 'updated_at') { valA = getTimestamp(a.updated_at); valB = getTimestamp(b.updated_at); }
    else if (typeof valA === 'string' || typeof valB === 'string') { valA = String(valA ?? '').toLowerCase().trim(); valB = String(valB ?? '').toLowerCase().trim(); }
    else { valA = Number(valA) || 0; valB = Number(valB) || 0; }
    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginated = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusStyle = (s) => {
    const map = { active: 'bg-emerald-50 text-emerald-700 border-emerald-200', completed: 'bg-slate-100 text-slate-600 border-slate-200', pending: 'bg-amber-50 text-amber-700 border-amber-200', closed: 'bg-red-50 text-red-700 border-red-200' };
    return map[s] || 'bg-slate-100 text-slate-600 border-slate-200';
  };

  const SortHeader = ({ column, label, icon: Icon }) => (
    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-50 select-none transition" onClick={() => setSortConfig({ key: column, direction: sortConfig.key === column && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 opacity-60" />}
        {label}
        {sortConfig.key === column && <ArrowUpDown className={`w-3 h-3 ml-1 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />}
      </div>
    </th>
  );

  return (
    <div className="space-y-4">
      <ProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} project={editingProject} onSave={handleSave} loading={saving} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">Проекты</h2>
        <div className="flex items-center gap-2">
          <button onClick={clearFilters} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition">
            <Filter className="w-3.5 h-3.5" /> Сбросить
          </button>
          <button onClick={handleCreateClick} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition shadow-sm">
            <Plus className="w-3.5 h-3.5" /> Создать
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-2 p-3 bg-white rounded-xl border border-slate-200">
        <div className="col-span-2"><input type="text" placeholder="ID" value={filters.id} onChange={e => setFilters({...filters, id: e.target.value})} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" /></div>
        <div className="col-span-3"><input type="text" placeholder="Название" value={filters.name} onChange={e => setFilters({...filters, name: e.target.value})} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" /></div>
        <div className="col-span-2"><input type="text" placeholder="Код" value={filters.code} onChange={e => setFilters({...filters, code: e.target.value})} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" /></div>
        <div className="col-span-2">
          <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white">
            <option value="">Все статусы</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div className="col-span-1.5"><input type="date" placeholder="От" value={filters.dateFrom} onChange={e => setFilters({...filters, dateFrom: e.target.value})} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" /></div>
        <div className="col-span-1.5"><input type="date" placeholder="До" value={filters.dateTo} onChange={e => setFilters({...filters, dateTo: e.target.value})} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" /></div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <SortHeader column="id" label="ID" icon={Hash} />
                <SortHeader column="name" label="Название" icon={LayoutGrid} />
                <SortHeader column="code" label="Код" icon={Tag} />
                <SortHeader column="status" label="Статус" icon={Tag} />
                <SortHeader column="updated_at" label="Обновлено" icon={CalendarDays} />
                <th className="px-4 py-3 text-right w-24 text-xs font-semibold text-slate-500 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="px-4 py-8 text-center text-slate-400 text-xs">Загрузка...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan="6" className="px-4 py-8 text-center text-slate-400 text-xs">Ничего не найдено</td></tr>
              ) : (
                paginated.map((p, i) => (
                  <tr key={p.id || i} className="hover:bg-slate-50/50 transition group">
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">#{p.id || i + 1}</td>
                    <td className="px-4 py-3 font-medium text-slate-800 group-hover:text-indigo-600 transition">{p.name || p.title || 'Без названия'}</td>
                    <td className="px-4 py-3"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-mono tracking-wide">{p.code || p.slug || '---'}</span></td>
                    <td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusStyle(p.status)}`}>{p.status || 'Active'}</span></td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{p.updated_at ? new Date(p.updated_at).toLocaleDateString('ru-RU') : '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                        <button onClick={() => handleEditClick(p)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteClick(p.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && sorted.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50/50 border-t border-slate-200">
            <span className="text-xs text-slate-500">Показано {paginated.length} из {sorted.length}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-500 transition"><ChevronLeft className="w-3.5 h-3.5" /></button>
              <span className="px-2 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg">{currentPage} / {totalPages || 1}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages || 1, p + 1))} disabled={currentPage === (totalPages || 1)} className="p-1.5 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-500 transition"><ChevronRight className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}