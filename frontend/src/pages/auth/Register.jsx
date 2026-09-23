import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { adminAPI } from '../../api/api';
import { User, Mail, Lock, GraduationCap, Building2, UserCheck, ArrowRight } from 'lucide-react';

const Register = () => {
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [studentId, setStudentId] = useState('');
  const [batchYear, setBatchYear] = useState('');
  const [designation, setDesignation] = useState('Lecturer');
  const [departmentsList, setDepartmentsList] = useState([]);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await adminAPI.getDepartments();
        if (res.data?.departments) {
          setDepartmentsList(res.data.departments);
          if (res.data.departments.length > 0) {
            setDepartment(res.data.departments[0]._id);
          }
        }
      } catch (err) {
        console.error('Error fetching departments', err);
      }
    };
    fetchDepts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name,
        email,
        password,
        role,
        department: department || undefined,
        studentId: role === 'student' ? studentId : undefined,
        batchYear: role === 'student' ? batchYear : undefined,
        designation: role === 'supervisor' ? designation : undefined,
      };

      const user = await register(payload);
      showSuccess(`Account created! Welcome to UniSkill, ${user.name}`);
      navigate('/dashboard');
    } catch (err) {
      showError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Create your Account</h2>
        <p className="text-xs text-slate-500 mt-1">Join the university project collaboration hub</p>
      </div>

      {/* Role Selector Tabs */}
      <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-6">
        <button
          type="button"
          onClick={() => setRole('student')}
          className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
            role === 'student'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Student</span>
        </button>
        <button
          type="button"
          onClick={() => setRole('supervisor')}
          className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
            role === 'supervisor'
              ? 'bg-white text-emerald-700 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Supervisor / Lecturer</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Full Name *
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={role === 'student' ? 'e.g. Alex Mercer' : 'e.g. Dr. Alan Turing'}
              required
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            University Email *
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@uniskill.edu"
              required
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Password *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
              minLength={6}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
            />
          </div>
        </div>

        {departmentsList.length > 0 && (
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Department
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
              >
                {departmentsList.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {role === 'student' ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Student ID
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="STU-2026-XXXX"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Batch / Year
              </label>
              <input
                type="text"
                value={batchYear}
                onChange={(e) => setBatchYear(e.target.value)}
                placeholder="2023 - 2027"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Academic Designation
            </label>
            <input
              type="text"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="e.g. Senior Lecturer, Associate Professor"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
        >
          {loading ? 'Registering...' : 'Create UniSkill Account'}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1">
          Sign in <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};

export default Register;
