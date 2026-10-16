import React, { useState, useEffect } from 'react';
import { skillAPI, adminAPI } from '../../api/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import {
  Award,
  Plus,
  Search,
  Building2,
  GraduationCap,
  Trash2,
  Edit3,
  Filter,
  X,
  BookOpen,
  Layers,
  Sparkles,
} from 'lucide-react';

const COMMON_CATEGORIES = [
  'Experimental & Laboratory',
  'Research Methodology & Ethics',
  'Data Analysis & Statistics',
  'Modeling & Simulation',
  'Field Work & Surveying',
  'Design & Prototyping',
  'Clinical & Healthcare',
  'Financial & Economic Analysis',
  'Software & Computational Tools',
  'Hardware & Electronics',
  'Academic Writing & Literature Review',
  'Management, Strategy & Policy',
  'Legal & Governance Analysis',
  'Web & Mobile Systems',
  'AI & Machine Learning',
  'Other',
];

const AdminSkills = () => {
  const [skills, setSkills] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterDegree, setFilterDegree] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Add / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null); // null if adding new
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Experimental & Laboratory');
  const [customCategory, setCustomCategory] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState(''); // empty string = Universal / General
  const [selectedDegree, setSelectedDegree] = useState(''); // empty string = All degrees in department
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { showSuccess, showError } = useToast();

  // Fetch departments list
  const fetchDepartments = async () => {
    try {
      const res = await adminAPI.getDepartments();
      if (res.data?.departments) {
        setDepartments(res.data.departments);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  // Fetch skills based on filters
  const fetchSkills = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (filterDept !== 'all') {
        params.department = filterDept;
        // In admin view, if a specific department is selected, only show skills for that department
        if (filterDept !== 'general') {
          params.includeGeneral = 'false';
        }
      }
      if (filterDegree !== 'all') params.degree = filterDegree;
      if (filterCategory !== 'all') params.category = filterCategory;

      const res = await skillAPI.getSkills(params);
      if (res.data?.skills) {
        setSkills(res.data.skills);
      }
    } catch (err) {
      console.error('Error fetching skills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSkills();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, filterDept, filterDegree, filterCategory]);

  // Selected department object in form
  const formSelectedDept = departments.find((d) => d._id === selectedDeptId);

  // Selected department in filter
  const activeFilterDeptObj = departments.find((d) => d._id === filterDept);

  const openAddModal = () => {
    setEditingSkill(null);
    setName('');
    setCategory('Experimental & Laboratory');
    setCustomCategory('');
    setSelectedDeptId(filterDept !== 'all' && filterDept !== 'general' ? filterDept : '');
    setSelectedDegree(filterDegree !== 'all' ? filterDegree : '');
    setDescription('');
    setModalOpen(true);
  };

  const openEditModal = (skill) => {
    setEditingSkill(skill);
    setName(skill.name);
    const isStandardCategory = COMMON_CATEGORIES.includes(skill.category);
    if (isStandardCategory) {
      setCategory(skill.category);
      setCustomCategory('');
    } else {
      setCategory('Custom');
      setCustomCategory(skill.category);
    }
    setSelectedDeptId(skill.department?._id || skill.department || '');
    setSelectedDegree(skill.degree || '');
    setDescription(skill.description || '');
    setModalOpen(true);
  };

  const handleSaveSkill = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showError('Skill name is required');
      return;
    }

    const finalCategory =
      category === 'Custom' ? customCategory.trim() || 'General' : category;

    try {
      setSubmitting(true);
      const payload = {
        name: name.trim(),
        category: finalCategory,
        department: selectedDeptId || null,
        degree: selectedDeptId ? selectedDegree : '',
        description: description.trim(),
      };

      if (editingSkill) {
        await skillAPI.updateSkill(editingSkill._id, payload);
        showSuccess(`Skill "${name.trim()}" updated successfully`);
      } else {
        await skillAPI.createSkill(payload);
        showSuccess(`Skill "${name.trim()}" added to academic taxonomy`);
      }

      setModalOpen(false);
      fetchSkills();
    } catch (err) {
      showError(err.response?.data?.message || 'Error saving skill');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSkill = async (id, skillName) => {
    if (!window.confirm(`Are you sure you want to delete the skill "${skillName}"?`)) return;
    try {
      await skillAPI.deleteSkill(id);
      showSuccess(`Skill "${skillName}" deleted successfully`);
      fetchSkills();
    } catch (err) {
      showError(err.response?.data?.message || 'Error deleting skill');
    }
  };

  const resetFilters = () => {
    setSearch('');
    setFilterDept('all');
    setFilterDegree('all');
    setFilterCategory('all');
  };

  const hasActiveFilters =
    search || filterDept !== 'all' || filterDegree !== 'all' || filterCategory !== 'all';

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Award className="w-7 h-7 text-indigo-600" />
            <span>Academic Skills & Taxonomy Directory</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Curate research, laboratory, and domain-specific skills organized by department and degree program.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 flex items-center gap-2 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Skill</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search skill name..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
            />
          </div>

          {/* Department Filter */}
          <div className="relative">
            <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={filterDept}
              onChange={(e) => {
                setFilterDept(e.target.value);
                setFilterDegree('all');
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
            >
              <option value="all">All Departments & Universal</option>
              <option value="general">🌍 Universal / Cross-Department Only</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* Degree Filter (Active when a department is chosen) */}
          <div className="relative">
            <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={filterDegree}
              onChange={(e) => setFilterDegree(e.target.value)}
              disabled={filterDept === 'all' || filterDept === 'general'}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white disabled:opacity-50 disabled:bg-slate-100"
            >
              <option value="all">
                {filterDept === 'all' || filterDept === 'general'
                  ? 'All Degree Programs'
                  : 'All Degrees in Department'}
              </option>
              {activeFilterDeptObj?.degrees?.map((deg, idx) => (
                <option key={deg._id || idx} value={deg.name}>
                  {deg.name} {deg.code ? `(${deg.code})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Layers className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
            >
              <option value="all">All Categories</option>
              {COMMON_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Stats & Reset */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-800">{skills.length}</strong> skills
            {filterDept !== 'all' && (
              <>
                {' '}for{' '}
                <span className="font-semibold text-indigo-600">
                  {filterDept === 'general'
                    ? 'Universal / General'
                    : activeFilterDeptObj?.name || 'Selected Department'}
                </span>
              </>
            )}
            {filterDegree !== 'all' && (
              <>
                {' '}• Degree:{' '}
                <span className="font-semibold text-indigo-600">{filterDegree}</span>
              </>
            )}
          </span>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-indigo-600 hover:text-indigo-700 font-bold inline-flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Skills Grid */}
      {loading ? (
        <LoadingSpinner text="Loading academic skills taxonomy..." />
      ) : skills.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200 p-8">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No skills found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            No academic skills match the selected department, degree, or search query. Click the button below to add relevant skills for this academic program.
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Skill for this Degree</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((sk) => {
            const deptName = sk.department?.name || (sk.department ? 'Department' : 'Universal / General');
            const deptCode = sk.department?.code;
            const degreeName = sk.degree || 'All Degrees';

            return (
              <div
                key={sk._id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-indigo-200 transition-all hover:shadow-sm"
              >
                <div>
                  {/* Department & Degree Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 ${
                        sk.department
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}
                    >
                      <Building2 className="w-3 h-3" />
                      <span>{deptCode ? `${deptCode}` : deptName}</span>
                    </span>

                    {sk.degree && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-100 flex items-center gap-1">
                        <GraduationCap className="w-3 h-3" />
                        <span className="truncate max-w-[140px]">{sk.degree}</span>
                      </span>
                    )}

                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600">
                      {sk.category}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{sk.name}</h3>
                  {sk.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{sk.description}</p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 truncate max-w-[160px]">
                    {sk.department ? sk.department.name : 'University-wide'}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(sk)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                      title="Edit Skill"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSkill(sk._id, sk.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete Skill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Skill Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSkill ? 'Edit Academic Skill' : 'Add Skill to Taxonomy'}
      >
        <form onSubmit={handleSaveSkill} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Skill Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Finite Element Analysis, Cell Culture, Econometrics"
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
            />
          </div>

          {/* Department Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Academic Department *
            </label>
            <select
              value={selectedDeptId}
              onChange={(e) => {
                setSelectedDeptId(e.target.value);
                setSelectedDegree('');
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
            >
              <option value="">🌍 General / University-Wide (Available to all students)</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Select a specific department so only students belonging to that discipline will see this skill.
            </p>
          </div>

          {/* Degree Program Selection */}
          {selectedDeptId && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Degree Program
              </label>
              {formSelectedDept?.degrees && formSelectedDept.degrees.length > 0 ? (
                <select
                  value={selectedDegree}
                  onChange={(e) => setSelectedDegree(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
                >
                  <option value="">All Degree Programs in {formSelectedDept.name}</option>
                  {formSelectedDept.degrees.map((deg, idx) => (
                    <option key={deg._id || idx} value={deg.name}>
                      {deg.name} {deg.code ? `(${deg.code})` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <div>
                  <input
                    type="text"
                    value={selectedDegree}
                    onChange={(e) => setSelectedDegree(e.target.value)}
                    placeholder="e.g. B.Sc. Biomedical Science (or leave blank for all)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Leave blank to make this skill available across all degrees in this department.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Category / Domain
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
            >
              {COMMON_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="Custom">Custom Category...</option>
            </select>

            {category === 'Custom' && (
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Enter custom category name..."
                required
                className="mt-2 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
              />
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Academic scope, tools, or laboratory methodologies involved..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingSkill ? 'Update Skill' : 'Add Skill'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminSkills;
