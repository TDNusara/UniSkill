import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectAPI, milestoneAPI, supervisorAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ProgressBar from '../../components/common/ProgressBar';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import {
  FolderKanban,
  Users,
  UserCheck,
  Award,
  Code2,
  Globe,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Send,
  MessageSquare,
  Sparkles,
  Plus,
  FileText,
  ExternalLink,
  AlertTriangle,
  UserPlus,
} from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [latestSupervisorRequest, setLatestSupervisorRequest] = useState(null);
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');

  const [supervisorModalOpen, setSupervisorModalOpen] = useState(false);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState('');
  const [supervisorPitch, setSupervisorPitch] = useState('');

  const [submitMilestoneModal, setSubmitMilestoneModal] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionUrl, setSubmissionUrl] = useState('');

  const [reviewMilestoneModal, setReviewMilestoneModal] = useState(null);
  const [reviewGrade, setReviewGrade] = useState('A');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewStatus, setReviewStatus] = useState('approved');

  const [actionLoading, setActionLoading] = useState(false);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const res = await projectAPI.getProjectById(id);
      if (res.data?.project) {
        setProject(res.data.project);
        setMilestones(res.data.milestones || []);
        setLatestSupervisorRequest(res.data.latestSupervisorRequest || null);
      }
    } catch (err) {
      console.error('Error loading project details', err);
      showError('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const loadSupervisorsList = async () => {
    try {
      const res = await supervisorAPI.getSupervisors();
      if (res.data?.supervisors) setSupervisors(res.data.supervisors);
    } catch (err) {
      console.error(err);
    }
  };

  // Check roles & supervisor status
  const isMember = project?.members?.some((m) => m.user?._id === user?._id);
  const isLeader = project?.creator?._id === user?._id;
  const isSupervisorOfProject = project?.supervisor?._id === user?._id;
  const isFaculty = user?.role === 'supervisor' || user?.role === 'admin';

  const reqSup = project?.requestedSupervisor || latestSupervisorRequest?.recipient;
  const isPendingSupervisor =
    !project?.supervisor &&
    (project?.supervisorRequestStatus === 'pending' || latestSupervisorRequest?.status === 'pending');
  const isRejectedSupervisor =
    !project?.supervisor &&
    (project?.supervisorRequestStatus === 'rejected' || latestSupervisorRequest?.status === 'rejected');

  // Handle Task Toggle
  const handleToggleTask = async (milestoneId, taskId) => {
    if (!isMember && !isSupervisorOfProject && user?.role !== 'admin') {
      showError('Only project members or supervisors can update task items');
      return;
    }
    try {
      await milestoneAPI.toggleTask(milestoneId, taskId);
      fetchProjectData();
    } catch (err) {
      showError('Failed to update task');
    }
  };

  // Handle Join Request
  const handleSendJoinRequest = async () => {
    try {
      setActionLoading(true);
      await projectAPI.joinProject(id, joinMessage);
      showSuccess('Join request submitted to the project leader!');
      setJoinModalOpen(false);
      setJoinMessage('');
    } catch (err) {
      showError(err.response?.data?.message || 'Could not send join request');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Supervisor Request
  const handleSendSupervisorRequest = async () => {
    if (!selectedSupervisorId) {
      showError('Please select a faculty supervisor');
      return;
    }
    try {
      setActionLoading(true);
      await supervisorAPI.requestSupervision({
        projectId: id,
        supervisorId: selectedSupervisorId,
        message: supervisorPitch,
      });
      showSuccess('Supervision request sent successfully!');
      setSupervisorModalOpen(false);
      setSupervisorPitch('');
      setSelectedSupervisorId('');
      fetchProjectData();
    } catch (err) {
      showError(err.response?.data?.message || 'Could not send request');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Milestone Submission
  const handleSubmitDeliverable = async () => {
    if (!submitMilestoneModal) return;
    try {
      setActionLoading(true);
      await milestoneAPI.submitDeliverable(submitMilestoneModal._id, {
        text: submissionText,
        fileUrl: submissionUrl,
      });
      showSuccess('Milestone deliverable submitted for supervisor review!');
      setSubmitMilestoneModal(null);
      setSubmissionText('');
      setSubmissionUrl('');
      fetchProjectData();
    } catch (err) {
      showError('Failed to submit deliverable');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Supervisor Milestone Review
  const handleReviewMilestone = async () => {
    if (!reviewMilestoneModal) return;
    try {
      setActionLoading(true);
      await milestoneAPI.reviewMilestone(reviewMilestoneModal._id, {
        status: reviewStatus,
        comment: reviewComment,
        grade: reviewGrade,
      });
      showSuccess(`Milestone marked as ${reviewStatus}!`);
      setReviewMilestoneModal(null);
      setReviewComment('');
      fetchProjectData();
    } catch (err) {
      showError('Failed to review milestone');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Loading project workspace..." />;
  if (!project) return <div className="text-center py-12 text-slate-500">Project not found</div>;

  return (
    <div className="space-y-8">
      {/* Project Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
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
              <span className="text-xs font-semibold text-slate-400">
                Academic Year {project.academicYear} • {project.department?.name}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {project.title}
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed max-w-4xl">
              {project.description}
            </p>

            {/* External Links */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {project.githubRepo && (
                <a
                  href={project.githubRepo}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                >
                  <Code2 className="w-4 h-4" />
                  <span>GitHub Repository</span>
                </a>
              )}
              {project.liveDemoUrl && (
                <a
                  href={project.liveDemoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span>Live Demo</span>
                </a>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col gap-2 shrink-0">
            {!isMember && user?.role === 'student' && project.isLookingForMembers && (
              <button
                onClick={() => setJoinModalOpen(true)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 transition-colors"
              >
                Request to Join Team
              </button>
            )}

            {isLeader && !project.supervisor && (
              <button
                onClick={() => {
                  loadSupervisorsList();
                  setSupervisorModalOpen(true);
                }}
                className={`px-5 py-2.5 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 ${
                  isRejectedSupervisor
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                    : isPendingSupervisor
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                }`}
              >
                {isRejectedSupervisor ? (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Request Another Supervisor</span>
                  </>
                ) : isPendingSupervisor ? (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>Update Supervisor Request</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Request Supervisor</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="pt-4 border-t border-slate-100">
          <ProgressBar progress={project.progress || 0} size="md" />
        </div>
      </div>

      {/* Prominent Supervisor Declined Alert Banner */}
      {isRejectedSupervisor && (
        <div className="bg-rose-50/90 border-2 border-rose-300 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-rose-950">
                  Supervision Request Declined
                </h4>
                <Badge variant="danger" size="sm">Action Required</Badge>
              </div>
              <p className="text-xs text-rose-800 mt-1">
                <strong>{reqSup?.name || 'Faculty Supervisor'}</strong> was unable to take on this project.
              </p>
              {(project.rejectionReason || latestSupervisorRequest?.responseNote) && (
                <div className="mt-2 text-xs text-rose-900 bg-white/90 p-3 rounded-xl border border-rose-200">
                  <span className="font-bold text-[11px] text-rose-700 block uppercase tracking-wider">Supervisor's Feedback:</span>
                  <p className="italic mt-0.5 text-slate-800">
                    "{project.rejectionReason || latestSupervisorRequest?.responseNote}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {isLeader && (
            <button
              onClick={() => {
                loadSupervisorsList();
                setSupervisorModalOpen(true);
              }}
              className="shrink-0 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Select New Supervisor</span>
            </button>
          )}
        </div>
      )}

      {/* Supervisor Pending Banner */}
      {isPendingSupervisor && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-950">
                Supervision Request Awaiting Response
              </p>
              <p className="text-[11px] text-amber-800">
                A formal request was sent to <strong>{reqSup?.name || 'Supervisor'}</strong>. You will be notified once they review your project proposal.
              </p>
            </div>
          </div>
          <Badge variant="warning" size="sm">Under Review</Badge>
        </div>
      )}

      {/* Two Columns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols): Milestones & Progress Tracker */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Milestones & Sprint Deliverables</h2>
              <p className="text-xs text-slate-500">Track deadlines, complete task items, and submit deliverables</p>
            </div>
          </div>

          {milestones.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-dashed border-slate-300 text-center text-slate-500 text-xs">
              No milestones defined for this project yet.
            </div>
          ) : (
            <div className="space-y-4">
              {milestones.map((m, idx) => (
                <div
                  key={m._id}
                  className={`bg-white rounded-2xl p-6 border transition-all ${
                    m.status === 'approved'
                      ? 'border-emerald-200 shadow-xs'
                      : m.status === 'submitted'
                      ? 'border-indigo-200 shadow-xs'
                      : 'border-slate-200 shadow-xs'
                  }`}
                >
                  {/* Milestone Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                          Milestone #{idx + 1} ({m.weightPercentage || 25}%)
                        </span>
                        <Badge
                          variant={
                            m.status === 'approved'
                              ? 'success'
                              : m.status === 'submitted'
                              ? 'primary'
                              : m.status === 'revision_requested'
                              ? 'danger'
                              : 'default'
                          }
                          size="sm"
                        >
                          {m.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{m.title}</h3>
                      <p className="text-xs text-slate-500">{m.description}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Due: {new Date(m.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Tasks Checklist */}
                  {m.tasks && m.tasks.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Checklist Tasks
                      </p>
                      <div className="space-y-1.5">
                        {m.tasks.map((task) => (
                          <div
                            key={task._id}
                            onClick={() => handleToggleTask(m._id, task._id)}
                            className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                          >
                            {task.isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                            )}
                            <span
                              className={`text-xs font-medium ${
                                task.isCompleted
                                  ? 'text-slate-400 line-through'
                                  : 'text-slate-800'
                              }`}
                            >
                              {task.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Deliverable Submission / Review Feedback Box */}
                  {m.submission?.text && (
                    <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
                      <p className="font-bold text-slate-800 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-indigo-600" />
                        <span>Submitted Deliverable:</span>
                      </p>
                      <p className="text-slate-600">{m.submission.text}</p>
                      {m.submission.fileUrl && (
                        <a
                          href={m.submission.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          <span>View Submitted Attachment</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Supervisor Feedback / Grade */}
                  {m.feedback?.comment && (
                    <div className="mt-3 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-emerald-900 flex items-center gap-1.5">
                          <MessageSquare className="w-4 h-4 text-emerald-600" />
                          <span>Supervisor Assessment</span>
                        </p>
                        {m.feedback.grade && (
                          <span className="font-extrabold text-xs px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                            Grade: {m.feedback.grade}
                          </span>
                        )}
                      </div>
                      <p className="text-emerald-800 italic">"{m.feedback.comment}"</p>
                    </div>
                  )}

                  {/* Actions for this Milestone */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    {isMember && m.status !== 'approved' && (
                      <button
                        onClick={() => {
                          setSubmitMilestoneModal(m);
                          setSubmissionText(m.submission?.text || '');
                          setSubmissionUrl(m.submission?.fileUrl || '');
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        {m.submission?.text ? 'Update Submission' : 'Submit Deliverable'}
                      </button>
                    )}

                    {isSupervisorOfProject && m.status === 'submitted' && (
                      <button
                        onClick={() => {
                          setReviewMilestoneModal(m);
                          setReviewComment(m.feedback?.comment || '');
                          setReviewGrade(m.feedback?.grade || 'A');
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        Review & Grade
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (1 col): Team Members, Supervisor, Required Skills */}
        <div className="space-y-6">
          {/* Supervisor Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Project Supervisor</span>
            </h3>

            {project.supervisor ? (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-3">
                  {project.supervisor.avatar ? (
                    <img
                      src={project.supervisor.avatar}
                      alt={project.supervisor.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
                      {project.supervisor.name?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{project.supervisor.name}</h4>
                    <p className="text-[11px] text-slate-500">{project.supervisor.designation}</p>
                  </div>
                </div>
                {project.supervisor.officeLocation && (
                  <p className="text-[11px] text-slate-500">
                    Office: <strong className="text-slate-700">{project.supervisor.officeLocation}</strong>
                  </p>
                )}
                <div className="pt-1">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                    Active Supervisor
                  </span>
                </div>
              </div>
            ) : isRejectedSupervisor ? (
              <div className="p-4 bg-rose-50/70 rounded-xl border border-rose-200 space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                      Request Declined
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1">
                      {reqSup?.name || 'Faculty Supervisor'}
                    </h4>
                    {reqSup?.designation && (
                      <p className="text-[11px] text-slate-500">{reqSup.designation}</p>
                    )}
                  </div>
                </div>

                <div className="text-xs text-rose-900 bg-white p-2.5 rounded-lg border border-rose-200/90 space-y-1">
                  <span className="font-bold text-rose-800 block text-[10px] uppercase tracking-wider">
                    Decline Note:
                  </span>
                  <p className="italic text-slate-700 text-[11px]">
                    "{project.rejectionReason || latestSupervisorRequest?.responseNote || 'No specific note provided.'}"
                  </p>
                </div>

                {isLeader && (
                  <button
                    onClick={() => {
                      loadSupervisorsList();
                      setSupervisorModalOpen(true);
                    }}
                    className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Select Another Supervisor</span>
                  </button>
                )}
              </div>
            ) : isPendingSupervisor ? (
              <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    Request Pending
                  </span>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>

                <div className="flex items-center gap-3">
                  {reqSup?.avatar ? (
                    <img
                      src={reqSup.avatar}
                      alt={reqSup.name}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-xs">
                      {reqSup?.name?.charAt(0) || 'S'}
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{reqSup?.name || 'Supervisor'}</h4>
                    <p className="text-[11px] text-slate-500">{reqSup?.designation || 'Awaiting review'}</p>
                  </div>
                </div>

                <p className="text-[11px] text-amber-800 italic bg-white/70 p-2 rounded-lg border border-amber-200">
                  Waiting for supervisor to respond to your proposal.
                </p>

                {isLeader && (
                  <button
                    onClick={() => {
                      loadSupervisorsList();
                      setSupervisorModalOpen(true);
                    }}
                    className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Change / Re-send Request
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-5 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <p className="text-xs text-slate-500 font-medium mb-2.5">No supervisor assigned yet</p>
                {isLeader && (
                  <button
                    onClick={() => {
                      loadSupervisorsList();
                      setSupervisorModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Request Supervision</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Team Members */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Team Members</span>
              </h3>
              <span className="text-xs font-semibold text-slate-400">
                {project.members?.length || 1} / {project.maxMembers || 4}
              </span>
            </div>

            <div className="space-y-2">
              {project.members?.map((m, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className="flex items-center gap-2.5">
                    {m.user?.avatar ? (
                      <img
                        src={m.user.avatar}
                        alt={m.user?.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                        {m.user?.name?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <Link
                        to={`/portfolio/${m.user?._id}`}
                        className="text-xs font-bold text-slate-900 hover:text-indigo-600 block"
                      >
                        {m.user?.name}
                      </Link>
                      <p className="text-[10px] text-slate-400">{m.user?.studentId || 'Member'}</p>
                    </div>
                  </div>
                  <Badge variant={m.role === 'Leader' ? 'primary' : 'default'} size="sm">
                    {m.role}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Required Skills */}
          {project.requiredSkills && project.requiredSkills.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Required Skills</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {project.requiredSkills.map((sk) => (
                  <span
                    key={sk._id}
                    className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg"
                  >
                    {sk.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Join Request Modal */}
      <Modal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        title="Apply to Join Project Team"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Tell the project leader ({project.creator?.name}) why you want to join and what skills you can contribute:
          </p>
          <textarea
            rows={3}
            value={joinMessage}
            onChange={(e) => setJoinMessage(e.target.value)}
            placeholder="e.g. Hi Alex, I have strong React & Tailwind experience and would love to contribute to frontend UI."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
          />
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setJoinModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleSendJoinRequest}
              disabled={actionLoading}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
            >
              {actionLoading ? 'Sending...' : 'Send Join Request'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Request Supervisor Modal */}
      <Modal
        isOpen={supervisorModalOpen}
        onClose={() => setSupervisorModalOpen(false)}
        title="Request Faculty Project Supervisor"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Faculty Supervisor *
            </label>
            <select
              value={selectedSupervisorId}
              onChange={(e) => setSelectedSupervisorId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
            >
              <option value="">-- Choose Supervisor --</option>
              {supervisors.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.designation}) - {s.department?.code}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Pitch / Message to Supervisor
            </label>
            <textarea
              rows={3}
              value={supervisorPitch}
              onChange={(e) => setSupervisorPitch(e.target.value)}
              placeholder="Explain project goals, technology stack, and why this supervisor's domain matches your initiative."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setSupervisorModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleSendSupervisorRequest}
              disabled={actionLoading}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
            >
              {actionLoading ? 'Sending...' : 'Send Supervision Request'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Submit Deliverable Modal */}
      <Modal
        isOpen={!!submitMilestoneModal}
        onClose={() => setSubmitMilestoneModal(null)}
        title={`Submit Deliverable: ${submitMilestoneModal?.title}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Summary of Work & Deliverables *
            </label>
            <textarea
              rows={3}
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder="Describe completed tasks, code PRs, and architectural artifacts."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Deliverable URL (GitHub PR / Drive Link / Document)
            </label>
            <input
              type="url"
              value={submissionUrl}
              onChange={(e) => setSubmissionUrl(e.target.value)}
              placeholder="https://github.com/... or https://docs.google.com/..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setSubmitMilestoneModal(null)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitDeliverable}
              disabled={actionLoading}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
            >
              {actionLoading ? 'Submitting...' : 'Submit for Review'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Supervisor Review Modal */}
      <Modal
        isOpen={!!reviewMilestoneModal}
        onClose={() => setReviewMilestoneModal(null)}
        title={`Review Milestone: ${reviewMilestoneModal?.title}`}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Decision Status
              </label>
              <select
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white"
              >
                <option value="approved">Approved</option>
                <option value="revision_requested">Revision Requested</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Grade / Assessment
              </label>
              <input
                type="text"
                value={reviewGrade}
                onChange={(e) => setReviewGrade(e.target.value)}
                placeholder="e.g. A, A-, B+, 95/100"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Supervisor Feedback Comments
            </label>
            <textarea
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Provide constructive feedback on deliverables, architecture, and code quality."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setReviewMilestoneModal(null)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleReviewMilestone}
              disabled={actionLoading}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
            >
              {actionLoading ? 'Saving...' : 'Sign-off Milestone'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectDetails;
