import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FolderKanban,
  UserCheck,
  Award,
  Users,
  Inbox,
  User,
  ShieldCheck,
  Layers,
  Sparkles,
  PlusCircle,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role;

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/projects', label: 'Explore Projects', icon: FolderKanban },
    { to: '/my-projects', label: 'My Projects & Teams', icon: Layers },
    { to: '/skills/manage', label: 'My Skill Profile', icon: Award },
    { to: '/supervisors', label: 'Find Supervisor', icon: UserCheck },
    { to: '/students', label: 'Find Teammates', icon: Users },
    { to: '/requests', label: 'Invitations & Requests', icon: Inbox },
    { to: '/profile', label: 'Profile Settings', icon: User },
  ];

  const supervisorLinks = [
    { to: '/dashboard', label: 'Supervisor Portal', icon: LayoutDashboard },
    { to: '/my-projects', label: 'Supervised Projects', icon: FolderKanban },
    { to: '/requests', label: 'Supervision Requests', icon: Inbox },
    { to: '/projects', label: 'All Projects', icon: Layers },
    { to: '/students', label: 'Student Directory', icon: Users },
    { to: '/profile', label: 'Profile Settings', icon: User },
  ];

  const adminLinks = [
    { to: '/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User Management', icon: Users },
    { to: '/admin/departments', label: 'Departments', icon: Layers },
    { to: '/admin/skills', label: 'Skills Taxonomy', icon: Award },
    { to: '/projects', label: 'Projects Oversight', icon: FolderKanban },
    { to: '/profile', label: 'Admin Settings', icon: User },
  ];

  const links = role === 'admin' ? adminLinks : role === 'supervisor' ? supervisorLinks : studentLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Quick Action Button for Student */}
        {role === 'student' && (
          <div className="p-4 border-b border-slate-100">
            <NavLink
              to="/projects/create"
              onClick={() => onClose?.()}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Project</span>
            </NavLink>
          </div>
        )}

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {role === 'admin' ? 'Administration' : role === 'supervisor' ? 'Mentorship' : 'Student Hub'}
            </p>
          </div>

          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => onClose?.()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* User Role Card at bottom */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200/70">
            <div
              className={`w-2 h-2 rounded-full ${
                role === 'admin'
                  ? 'bg-purple-500'
                  : role === 'supervisor'
                  ? 'bg-emerald-500'
                  : 'bg-indigo-500'
              }`}
            />
            <div className="truncate">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-400 capitalize flex items-center gap-1 font-medium">
                <Sparkles className="w-3 h-3 text-amber-500" />
                {role} Mode
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
