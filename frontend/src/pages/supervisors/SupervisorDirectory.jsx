import React, { useState, useEffect } from 'react';
import { supervisorAPI, adminAPI, projectAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import {
  UserCheck,
  Search,
  BookOpen,
  MapPin,
  Send,
  Sparkles,
  Building2,
  CheckCircle2,
} from 'lucide-react';

const SupervisorDirectory = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [supervisors, setSupervisors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  // Request Modal State
  const [requestModalSupervisor, setRequestModalSupervisor] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchSupervisors = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedDept) params.department = selectedDept;

      const res = await supervisorAPI.getSupervisors(params);
      if (res.data?.supervisors) setSupervisors(res.data.supervisors);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [deptRes, projRes] = await Promise.all([
          adminAPI.getDepartments(),
          user?.role === 'student' ? projectAPI.getMyProjects() : Promise.resolve({ data: { projects: [] } }),
        ]);
        if (deptRes.data?.departments) setDepartments(deptRes.data.departments);
        if (projRes.data?.projects) {
          // Filter projects where current user is leader and no supervisor is assigned
          setMyProjects(projRes.data.projects.filter((p) => p.creator?._id === user?._id && !p.supervisor));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchMeta();
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSupervisors();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedDept]);

  const handleSendRequest = async () => {
    if (!selectedProjectId) {
      showError('Please select one of your projects');
      return;
    }
    try {
      setSubmitting(true);
      await supervisorAPI.requestSupervision({
        projectId: selectedProjectId,
        supervisorId: requestModalSupervisor._id,
        message: requestMessage,
      });
      showSuccess(`Supervision request sent to ${requestModalSupervisor.name}!`);
      setRequestModalSupervisor(null);
      setRequestMessage('');
      setSelectedProjectId('');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Faculty Supervisor Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Explore university professors & researchers, view research domains, availability, and request mentorship.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by faculty name, designation, research interest (e.g. AI, Cloud, Systems)..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white"
            />
          </div>

          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Supervisors Grid */}
      {loading ? (
        <LoadingSpinner text="Loading supervisors..." />
      ) : supervisors.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-dashed border-slate-300 text-center text-slate-500 text-xs">
          No faculty supervisors found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {supervisors.map((sup) => (
            <div
              key={sup._id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-4">
                {/* Profile Header */}
                <div className="flex items-start gap-3.5">
                  {sup.avatar ? (
                    <img
                      src={sup.avatar}
                      alt={sup.name}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/20 shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-lg shrink-0">
                      {sup.name?.charAt(0)}
                    </div>
                  )}

                  <div className="overflow-hidden">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                      {sup.name}
                    </h3>
                    <p className="text-xs font-semibold text-emerald-700">{sup.designation}</p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {sup.department?.name || 'Department'}
                    </p>
                  </div>
                </div>

                {sup.bio && <p className="text-xs text-slate-600 line-clamp-2">{sup.bio}</p>}

                {/* Research Interests */}
                {sup.researchInterests && sup.researchInterests.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Research Interests
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {sup.researchInterests.map((interest, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Office info & capacity */}
                <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px] text-slate-500">
                  {sup.officeLocation && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{sup.officeLocation}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1">
                    <span>Supervised Projects:</span>
                    <span className="font-bold text-slate-800">
                      {sup.activeProjectsCount || 0} / {sup.maxSupervisionCapacity || 5}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-2">
                {user?.role === 'student' ? (
                  <button
                    onClick={() => {
                      setRequestModalSupervisor(sup);
                      if (myProjects.length > 0) setSelectedProjectId(myProjects[0]._id);
                    }}
                    disabled={!sup.isAvailable}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{sup.isAvailable ? 'Request Supervision' : 'Capacity Full'}</span>
                  </button>
                ) : (
                  <div className="text-center py-2 text-[11px] font-semibold text-emerald-700 bg-emerald-50 rounded-xl">
                    Faculty Profile
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Supervision Request Modal */}
      <Modal
        isOpen={!!requestModalSupervisor}
        onClose={() => setRequestModalSupervisor(null)}
        title={`Request Supervision from ${requestModalSupervisor?.name}`}
      >
        <div className="space-y-4">
          {myProjects.length === 0 ? (
            <div className="text-center py-4 bg-amber-50 rounded-xl p-4 text-xs text-amber-800">
              You do not have any active project proposals that need a supervisor. Create a project proposal first!
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Select Project Proposal *
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white"
                >
                  {myProjects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Pitch & Supervision Rationale
                </label>
                <textarea
                  rows={3}
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="Explain why your project fits this supervisor's research domain and what guidance you are seeking..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setRequestModalSupervisor(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendRequest}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  {submitting ? 'Submitting...' : 'Send Request'}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default SupervisorDirectory;
