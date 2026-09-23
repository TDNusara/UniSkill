import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/api';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Users,
  Search,
  Shield,
  CheckCircle,
  Ban,
  GraduationCap,
  UserCheck,
} from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const { showSuccess, showError } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;

      const res = await adminAPI.getUsers(params);
      if (res.data?.users) setUsers(res.data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, roleFilter]);

  const handleToggleStatus = async (user) => {
    try {
      const res = await adminAPI.toggleUserStatus(user._id);
      showSuccess(res.data?.message || 'User status updated');
      fetchUsers();
    } catch (err) {
      showError('Failed to toggle status');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          User Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Oversee university students, faculty supervisors, and system administrators.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user name, email, student ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
          />
        </div>

        <div className="sm:w-48">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
          >
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="supervisor">Supervisors</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Fetching users..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-6">Department</th>
                  <th className="py-3.5 px-6">Identifier</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center">
                            {u.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-6">
                      <Badge
                        variant={
                          u.role === 'admin'
                            ? 'purple'
                            : u.role === 'supervisor'
                            ? 'success'
                            : 'primary'
                        }
                        size="sm"
                      >
                        {u.role.toUpperCase()}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-6 text-slate-600">
                      {u.department?.name || '—'}
                    </td>

                    <td className="py-3.5 px-6 text-slate-600">
                      {u.studentId || u.designation || '—'}
                    </td>

                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          u.isActive ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {u.isActive ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <Ban className="w-3.5 h-3.5" />
                            <span>Suspended</span>
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-3.5 px-6 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                            u.isActive
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {u.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
