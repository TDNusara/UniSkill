import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { projectAPI, supervisorAPI } from '../../api/api';
import { useToast } from '../../context/ToastContext';
import StatCard from '../../components/common/StatCard';
import ProgressBar from '../../components/common/ProgressBar';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import {
  FolderKanban,
  Inbox,
  Users,
  Award,
  Check,
  X,
  MessageSquare,
  ChevronRight,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

const SupervisorDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respondingReq, setRespondingReq] = useState(null);
  const [responseNote, setResponseNote] = useState('');
  const [actionType, setActionType] = useState('accepted');
  const [actionLoading, setActionLoading] = useState(false);

  const { showSuccess, showError } = useToast();

  const fetchData = async () => {
    try {
      const [projRes, reqRes] = await Promise.all([
        projectAPI.getMyProjects(),
        supervisorAPI.getMyRequests(),
      ]);
      if (projRes.data?.projects) setProjects(projRes.data.projects);
      if (reqRes.data?.requests) {
        // Filter requests where this supervisor is the recipient
        setRequests(reqRes.data.requests.filter((r) => r.recipient?._id === user?._id));
      }
    } catch (err) {
      console.error('Error loading supervisor dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleRespond = async () => {
    if (!respondingReq) return;
    try {
      setActionLoading(true);
      await supervisorAPI.respondRequest(respondingReq._id, {
        status: actionType,
        responseNote,
      });
      showSuccess(`Supervision request ${actionType}`);
      setRespondingReq(null);
      setResponseNote('');
      fetchData();
    } catch (err) {
      showError(err.response?.data?.message || 'Error responding to request');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Loading supervisor portal..." />;

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const capacity = user?.maxSupervisionCapacity || 5;
  const activeCount = projects.length;

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-900/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-emerald-100">
              👨‍🏫 Faculty Supervision Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {user?.name}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90">
              {user?.designation || 'Faculty Supervisor'} • {user?.department?.name || 'Computer Science & Engineering'}
            </p>
            {user?.researchInterests && user.researchInterests.length > 0 && (
              <div className="pt-2 flex flex-wrap gap-1.5">
                {user.researchInterests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-emerald-900/60 text-emerald-100 border border-emerald-500/30"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center min-w-[180px]">
            <p className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">Supervision Load</p>
            <p className="text-3xl font-black mt-1">
              {activeCount} <span className="text-sm font-normal text-emerald-200">/ {capacity}</span>
            </p>
            <p className="text-[11px] text-emerald-100 mt-1">
              {capacity - activeCount > 0 ? `${capacity - activeCount} spots open` : 'Capacity Reached'}
            </p>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Active Projects"
          value={activeCount}
          subtitle={`Capacity: ${capacity}`}
          icon={FolderKanban}
          color="emerald"
        />
        <StatCard
          title="Pending Requests"
          value={pendingRequests.length}
          subtitle="Awaiting your decision"
          icon={Inbox}
          color="amber"
        />
        <StatCard
          title="Total Supervised Students"
          value={projects.reduce((sum, p) => sum + (p.members?.length || 0), 0)}
          subtitle="Across all research teams"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Office Location"
          value={user?.officeLocation || 'Faculty Office'}
          subtitle="Consultation Hours"
          icon={BookOpen}
          color="sky"
        />
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Active Supervised Projects */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Supervised Research & Capstone Projects</h2>
              <p className="text-xs text-slate-500">Monitor sprint progress, review deliverables & provide feedback</p>
            </div>
            <Link
              to="/projects"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
            >
              <span>Explore All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <FolderKanban className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Active Supervised Projects</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                You haven't accepted any project supervision requests yet. When students request your mentorship, they will appear in the requests section.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div
                  key={project._id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="emerald" size="sm">
                          {project.category}
                        </Badge>
                        <Badge
                          variant={project.status === 'completed' ? 'success' : 'info'}
                          size="sm"
                        >
                          {project.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <span className="text-xs font-medium text-slate-400">
                          Year {project.academicYear}
                        </span>
                      </div>
                      <Link
                        to={`/projects/${project._id}`}
                        className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors block"
                      >
                        {project.title}
                      </Link>
                      <p className="text-xs text-slate-500 line-clamp-2">{project.description}</p>
                    </div>

                    <Link
                      to={`/projects/${project._id}`}
                      className="inline-flex items-center gap-1 px-3 py-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-colors shrink-0"
                    >
                      <span>Review Milestones</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>

                  {/* Progress Tracker */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <ProgressBar progress={project.progress || 0} size="sm" />
                  </div>

                  {/* Student Members */}
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700">Team Members:</span>
                      <div className="flex items-center gap-1.5">
                        {project.members?.map((m, idx) => (
                          <Link
                            key={idx}
                            to={`/portfolio/${m.user?._id}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-medium text-[11px] transition-colors"
                          >
                            <span>{m.user?.name}</span>
                            {m.role === 'Leader' && <span className="text-[9px] font-bold text-indigo-600">(Lead)</span>}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Supervision Requests */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Incoming Requests</h3>
                <p className="text-[11px] text-slate-400">Students seeking your project mentorship</p>
              </div>
              <Badge variant={pendingRequests.length > 0 ? 'warning' : 'default'} size="sm">
                {pendingRequests.length} Pending
              </Badge>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                No pending supervision requests.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((req) => (
                  <div
                    key={req._id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {req.type.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <Link
                        to={`/projects/${req.project?._id}`}
                        className="text-xs font-bold text-slate-900 hover:text-indigo-600 block"
                      >
                        {req.project?.title}
                      </Link>
                      <p className="text-[11px] text-slate-500 mt-1">
                        From: <strong className="text-slate-700">{req.sender?.name}</strong> ({req.sender?.studentId || 'Student'})
                      </p>
                      {req.message && (
                        <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-lg border border-slate-200 mt-2">
                          "{req.message}"
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => {
                          setRespondingReq(req);
                          setActionType('accepted');
                        }}
                        className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => {
                          setRespondingReq(req);
                          setActionType('rejected');
                        }}
                        className="py-1.5 px-3 bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Response Modal */}
      <Modal
        isOpen={!!respondingReq}
        onClose={() => setRespondingReq(null)}
        title={actionType === 'accepted' ? 'Accept Supervision Request' : 'Decline Supervision Request'}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Project:{' '}
            <strong className="text-slate-900">{respondingReq?.project?.title}</strong>
          </p>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Feedback Note / Instructions (Optional)
            </label>
            <textarea
              rows={3}
              value={responseNote}
              onChange={(e) => setResponseNote(e.target.value)}
              placeholder={
                actionType === 'accepted'
                  ? 'e.g. Happy to supervise this project. Please set up initial milestone deadlines.'
                  : 'e.g. Currently at full research capacity in this domain.'
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setRespondingReq(null)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleRespond}
              disabled={actionLoading}
              className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs ${
                actionType === 'accepted'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {actionLoading ? 'Processing...' : `Confirm ${actionType}`}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SupervisorDashboard;
