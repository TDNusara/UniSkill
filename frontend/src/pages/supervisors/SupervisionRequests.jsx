import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supervisorAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import {
  Inbox,
  Send,
  Check,
  X,
  Clock,
  ChevronRight,
  FolderKanban,
  User,
} from 'lucide-react';

const SupervisionRequests = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('received'); // 'received' | 'sent'

  // Modal response
  const [activeReq, setActiveReq] = useState(null);
  const [responseAction, setResponseAction] = useState('accepted');
  const [responseNote, setResponseNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await supervisorAPI.getMyRequests();
      if (res.data?.requests) setRequests(res.data.requests);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRespond = async () => {
    if (!activeReq) return;
    try {
      setActionLoading(true);
      await supervisorAPI.respondRequest(activeReq._id, {
        status: responseAction,
        responseNote,
      });
      showSuccess(`Request ${responseAction}!`);
      setActiveReq(null);
      setResponseNote('');
      fetchRequests();
    } catch (err) {
      showError(err.response?.data?.message || 'Error processing response');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Loading requests..." />;

  const receivedList = requests.filter((r) => r.recipient?._id === user?._id);
  const sentList = requests.filter((r) => r.sender?._id === user?._id);
  const currentList = tab === 'received' ? receivedList : sentList;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Invitations & Supervision Requests
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review incoming project applications, supervision pitches, and team membership requests.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl max-w-sm">
        <button
          onClick={() => setTab('received')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            tab === 'received'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Received ({receivedList.length})
        </button>
        <button
          onClick={() => setTab('sent')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            tab === 'sent'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Sent ({sentList.length})
        </button>
      </div>

      {/* List */}
      {currentList.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-dashed border-slate-300 text-center text-slate-500 text-xs">
          No {tab} requests recorded.
        </div>
      ) : (
        <div className="space-y-4">
          {currentList.map((req) => (
            <div
              key={req._id}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="primary" size="sm">
                    {req.type.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <Badge
                    variant={
                      req.status === 'accepted'
                        ? 'success'
                        : req.status === 'rejected'
                        ? 'danger'
                        : 'warning'
                    }
                    size="sm"
                  >
                    {req.status.toUpperCase()}
                  </Badge>
                  <span className="text-[11px] text-slate-400">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  Project: <Link to={`/projects/${req.project?._id}`} className="hover:text-indigo-600 underline">{req.project?.title}</Link>
                </h3>

                <p className="text-xs text-slate-600">
                  {tab === 'received' ? (
                    <>From: <strong className="text-slate-800">{req.sender?.name}</strong> ({req.sender?.role})</>
                  ) : (
                    <>To: <strong className="text-slate-800">{req.recipient?.name}</strong> ({req.recipient?.role})</>
                  )}
                </p>

                {req.message && (
                  <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100 max-w-2xl">
                    "{req.message}"
                  </p>
                )}

                {req.responseNote && (
                  <div className="text-xs text-slate-600 bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                    <strong>Response Note:</strong> {req.responseNote}
                  </div>
                )}
              </div>

              {/* Action Buttons for Pending Received Requests */}
              {tab === 'received' && req.status === 'pending' && (
                <div className="flex sm:flex-col gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setActiveReq(req);
                      setResponseAction('accepted');
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveReq(req);
                      setResponseAction('rejected');
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    <span>Decline</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Decision Modal */}
      <Modal
        isOpen={!!activeReq}
        onClose={() => setActiveReq(null)}
        title={responseAction === 'accepted' ? 'Accept Request' : 'Decline Request'}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Project: <strong className="text-slate-900">{activeReq?.project?.title}</strong>
          </p>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Response Note
            </label>
            <textarea
              rows={3}
              value={responseNote}
              onChange={(e) => setResponseNote(e.target.value)}
              placeholder="Optional message or instructions..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setActiveReq(null)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleRespond}
              disabled={actionLoading}
              className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs ${
                responseAction === 'accepted'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {actionLoading ? 'Processing...' : `Confirm ${responseAction}`}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SupervisionRequests;
