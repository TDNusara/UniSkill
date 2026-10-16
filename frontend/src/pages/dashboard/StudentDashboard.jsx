import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { projectAPI, supervisorAPI } from '../../api/api';
import StatCard from '../../components/common/StatCard';
import ProgressBar from '../../components/common/ProgressBar';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  FolderKanban,
  Award,
  Clock,
  Inbox,
  Plus,
  Search,
  ExternalLink,
  ChevronRight,
  UserCheck,
  CheckCircle2,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, reqRes] = await Promise.all([
          projectAPI.getMyProjects(),
          supervisorAPI.getMyRequests(),
        ]);
        if (projRes.data?.projects) setProjects(projRes.data.projects);
        if (reqRes.data?.requests) setRequests(reqRes.data.requests);
      } catch (err) {
        console.error('Error fetching student dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner fullPage text="Loading your dashboard..." />;

  const verifiedSkillsCount = user?.skills?.filter((s) => s.verified).length || 0;
  const pendingRequestsCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-100">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-indigo-100">
              🎓 Student Academic Workspace
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
              Track project milestones, coordinate with teammates, manage skill proficiencies, and collaborate with your supervisors.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/projects/create"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs rounded-xl shadow-sm transition-transform hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </Link>
            <Link
              to={`/portfolio/${user?._id}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-900/40 hover:bg-indigo-900/60 border border-white/20 text-white font-bold text-xs rounded-xl backdrop-blur-sm transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View Portfolio</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Active Projects"
          value={projects.length}
          subtitle="Enrolled or Leading"
          icon={FolderKanban}
          color="indigo"
        />
        <StatCard
          title="My Skills"
          value={user?.skills?.length || 0}
          subtitle={`${verifiedSkillsCount} verified by faculty`}
          icon={Award}
          color="emerald"
        />
        <StatCard
          title="Pending Requests"
          value={pendingRequestsCount}
          subtitle="Invites & Supervision"
          icon={Inbox}
          color="amber"
        />
        <StatCard
          title="Department"
          value={user?.department?.code || 'CSE'}
          subtitle={user?.department?.name || 'Computer Science'}
          icon={UserCheck}
          color="sky"
        />
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols): My Projects & Teams */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">My Projects & Groups</h2>
              <p className="text-xs text-slate-500">Current academic initiatives and group status</p>
            </div>
            <Link
              to="/my-projects"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <FolderKanban className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Projects Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You haven't created or joined any projects yet. Start a project proposal or explore available teams!
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <Link
                  to="/projects/create"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Create Project
                </Link>
                <Link
                  to="/projects"
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Browse Projects
                </Link>
              </div>
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
                        <Badge variant="primary" size="sm">
                          {project.category || 'Academic Project'}
                        </Badge>
                        <Badge
                          variant={project.status === 'completed' ? 'success' : 'info'}
                          size="sm"
                        >
                          {project.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        {project.isLookingForMembers && (
                          <Badge variant="warning" size="sm">
                            Seeking Members
                          </Badge>
                        )}
                      </div>
                      <Link
                        to={`/projects/${project._id}`}
                        className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors block"
                      >
                        {project.title}
                      </Link>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {project.description}
                      </p>
                    </div>

                    <Link
                      to={`/projects/${project._id}`}
                      className="p-2 text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 rounded-xl transition-all shrink-0"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <ProgressBar progress={project.progress || 0} size="sm" />
                  </div>

                  {/* Footer Meta: Team & Supervisor */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700">Team:</span>
                      <div className="flex -space-x-2 overflow-hidden">
                        {project.members?.map((m, idx) => (
                          <div
                            key={idx}
                            title={m.user?.name}
                            className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-700 overflow-hidden"
                          >
                            {m.user?.avatar ? (
                              <img src={m.user.avatar} alt={m.user?.name} className="w-full h-full object-cover" />
                            ) : (
                              m.user?.name?.charAt(0) || 'U'
                            )}
                          </div>
                        ))}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        ({project.members?.length || 1}/{project.maxMembers || 4} members)
                      </span>
                    </div>

                    <div>
                      {project.supervisor ? (
                        <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Supervisor: {project.supervisor.name}</span>
                        </span>
                      ) : project.supervisorRequestStatus === 'rejected' ? (
                        <Link
                          to={`/projects/${project._id}`}
                          className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg hover:bg-rose-100 transition-colors"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Supervisor Declined (Re-request)</span>
                        </Link>
                      ) : project.supervisorRequestStatus === 'pending' ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Supervisor Pending</span>
                        </span>
                      ) : (
                        <Link
                          to={`/projects/${project._id}`}
                          className="text-indigo-600 font-semibold hover:underline"
                        >
                          + Request Supervisor
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (1 col): Skill Highlights & Quick Shortcuts */}
        <div className="space-y-6">
          {/* Skill Profile Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Skill Proficiencies</h3>
                <p className="text-[11px] text-slate-400">Add & verify your technical stack</p>
              </div>
              <Link
                to="/skills/manage"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                Manage
              </Link>
            </div>

            {user?.skills && user.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.skills.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
                  >
                    <span>{item.skill?.name || 'Skill'}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold">
                      {item.level}
                    </span>
                    {item.verified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" title="Verified" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-500 mb-2">No skills registered yet</p>
                <Link
                  to="/skills/manage"
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold inline-block"
                >
                  + Add Skills
                </Link>
              </div>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Collaboration Shortcuts</h3>
            <div className="space-y-2">
              <Link
                to="/supervisors"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">
                      Find a Supervisor
                    </p>
                    <p className="text-[10px] text-slate-400">Browse faculty by research domain</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
              </Link>

              <Link
                to="/students"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                    <Search className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">
                      Find Project Teammates
                    </p>
                    <p className="text-[10px] text-slate-400">Match with students by skill</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
              </Link>

              <Link
                to="/requests"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                    <Inbox className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">
                      Requests & Invitations
                    </p>
                    <p className="text-[10px] text-slate-400">{pendingRequestsCount} pending requests</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
