import { useState, useEffect } from 'react';

export default function ProjectModal({ isOpen, onClose, project, onSave, loading }) {
  const isEdit = !!project;
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    status: 'active'
  });

  // ✅ Заполняем форму при открытии
  useEffect(() => {
    if (isOpen) {
      if (isEdit && project) {
        setFormData({
          name: project.name || project.title || '',
          code: project.code || project.slug || '',
          description: project.description || '',
          status: project.status || 'active'
        });
      } else {
        setFormData({
          name: '',
          code: '',
          description: '',
          status: 'active'
        });
      }
    }
  }, [isOpen, isEdit, project]);

  // ✅ ЭТОЙ ФУНКЦИИ НЕ ХВАТАЛО — обработчик отправки формы
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData); // передаём данные наверх в Projects.jsx
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Фон */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}></div>

      {/* Окно */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Шапка */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">
            {isEdit ? 'Редактировать проект' : 'Новый проект'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Название</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Введите название..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Код</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="Например: PRJ-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Статус</label>
            <select
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition bg-white"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="active">Активный</option>
              <option value="pending">В ожидании</option>
              <option value="completed">Завершен</option>
              <option value="closed">Закрыт</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Описание</label>
            <textarea
              rows="3"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Краткое описание..."
            />
          </div>

          {/* Кнопки */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition shadow-sm hover:shadow"
            >
              {loading ? 'Сохранение...' : (isEdit ? 'Сохранить' : 'Создать')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}