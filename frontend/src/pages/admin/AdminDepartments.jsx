import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { Building2, Plus, Trash2, GraduationCap, BookOpen, Layers, X, Clock } from 'lucide-react';

const AdminDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Department Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [desc, setDesc] = useState('');
  const [initialDegreesInput, setInitialDegreesInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Add Degree to Department Modal
  const [degreeModalOpen, setDegreeModalOpen] = useState(false);
  const [targetDept, setTargetDept] = useState(null);
  const [degreeName, setDegreeName] = useState('');
  const [degreeCode, setDegreeCode] = useState('');
  const [durationYears, setDurationYears] = useState(4);
  const [degreeSubmitting, setDegreeSubmitting] = useState(false);

  const { showSuccess, showError } = useToast();

  const fetchDepts = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getDepartments();
      if (res.data?.departments) setDepartments(res.data.departments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    if (!name || !code) return;
    try {
      setSubmitting(true);
      const degreesArray = initialDegreesInput
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => ({ name: line }));

      await adminAPI.createDepartment({
        name,
        code,
        description: desc,
        degrees: degreesArray,
      });

      showSuccess(`Department "${name}" created successfully!`);
      setModalOpen(false);
      setName('');
      setCode('');
      setDesc('');
      setInitialDegreesInput('');
      fetchDepts();
    } catch (err) {
      showError(err.response?.data?.message || 'Error creating department');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDepartment = async (id, deptName) => {
    if (!window.confirm(`Are you sure you want to delete "${deptName}" and all its degree programs?`)) return;
    try {
      await adminAPI.deleteDepartment(id);
      showSuccess(`Department "${deptName}" deleted`);
      fetchDepts();
    } catch (err) {
      showError('Failed to delete department');
    }
  };

  const handleOpenAddDegree = (dept) => {
    setTargetDept(dept);
    setDegreeName('');
    setDegreeCode('');
    setDurationYears(4);
    setDegreeModalOpen(true);
  };

  const handleAddDegree = async (e) => {
    e.preventDefault();
    if (!degreeName.trim() || !targetDept) return;
    try {
      setDegreeSubmitting(true);
      await adminAPI.addDegree(targetDept._id, {
        name: degreeName.trim(),
        code: degreeCode.trim(),
        durationYears: Number(durationYears) || 4,
      });
      showSuccess(`Degree "${degreeName}" added to ${targetDept.name}!`);
      setDegreeModalOpen(false);
      setDegreeName('');
      setDegreeCode('');
      fetchDepts();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to add degree program');
    } finally {
      setDegreeSubmitting(false);
    }
  };

  const handleDeleteDegree = async (deptId, degreeId, degName) => {
    if (!window.confirm(`Remove degree "${degName}"?`)) return;
    try {
      await adminAPI.deleteDegree(deptId, degreeId);
      showSuccess(`Degree "${degName}" removed`);
      fetchDepts();
    } catch (err) {
      showError('Failed to remove degree');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-indigo-600" />
            <span>Academic Departments & Degrees</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure university faculties and assign academic degree programs for student registration and project filtering.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 flex items-center gap-1.5 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Department</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading departments..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((d) => (
            <div
              key={d._id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-5 hover:border-indigo-200 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-mono">
                    {d.code}
                  </span>
                  <button
                    onClick={() => handleDeleteDepartment(d._id, d.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Department"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{d.name}</h3>
                  {d.description && <p className="text-xs text-slate-500 mt-0.5">{d.description}</p>}
                </div>

                {/* Degree Programs List */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Degree Programs ({d.degrees?.length || 0})</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenAddDegree(d)}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Degree</span>
                    </button>
                  </div>

                  {d.degrees && d.degrees.length > 0 ? (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {d.degrees.map((deg) => (
                        <div
                          key={deg._id}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60 group hover:bg-indigo-50/50 transition-all text-xs"
                        >
                          <div className="truncate pr-2">
                            <span className="font-semibold text-slate-800 truncate block">{deg.name}</span>
                            {deg.code && (
                              <span className="text-[10px] text-slate-400 font-mono">{deg.code}</span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteDegree(d._id, deg._id, deg.name)}
                            className="text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 p-1 rounded-md transition-all shrink-0"
                            title="Remove Degree"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-xl text-center border border-dashed border-slate-200">
                      <p className="text-[11px] text-slate-400">No degrees added yet.</p>
                      <button
                        type="button"
                        onClick={() => handleOpenAddDegree(d)}
                        className="mt-1 text-[11px] font-bold text-indigo-600 hover:underline"
                      >
                        + Add first degree program
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Department Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New Academic Department">
        <form onSubmit={handleCreateDepartment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Department Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Civil & Environmental Engineering"
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Department Code (Short) *
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. CEE"
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Faculty & research focus..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Initial Degrees (Optional — 1 per line)
            </label>
            <textarea
              rows={3}
              value={initialDegreesInput}
              onChange={(e) => setInitialDegreesInput(e.target.value)}
              placeholder="B.Sc. in Civil Engineering&#10;B.Sc. in Environmental Engineering"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white text-xs"
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
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
            >
              {submitting ? 'Creating...' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Degree to Department Modal */}
      <Modal
        isOpen={degreeModalOpen}
        onClose={() => setDegreeModalOpen(false)}
        title={`Add Degree to ${targetDept?.name || 'Department'}`}
      >
        <form onSubmit={handleAddDegree} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Degree Program Name *
            </label>
            <input
              type="text"
              value={degreeName}
              onChange={(e) => setDegreeName(e.target.value)}
              placeholder="e.g. B.Sc. (Hons) in Artificial Intelligence"
              required
              autoFocus
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Degree Code (Optional)
              </label>
              <input
                type="text"
                value={degreeCode}
                onChange={(e) => setDegreeCode(e.target.value)}
                placeholder="e.g. BSc-AI"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Duration (Years)
              </label>
              <input
                type="number"
                min={1}
                max={6}
                value={durationYears}
                onChange={(e) => setDurationYears(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setDegreeModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={degreeSubmitting}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
            >
              {degreeSubmitting ? 'Adding...' : 'Add Degree Program'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDepartments;
