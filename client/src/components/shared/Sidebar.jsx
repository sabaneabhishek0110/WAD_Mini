import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineHome, HiOutlineUsers, HiOutlineAcademicCap,
  HiOutlineClipboardDocumentList, HiOutlineArrowRightOnRectangle,
  HiOutlineUserGroup, HiOutlineBookOpen, HiOutlineBeaker,
  HiOutlineChartBar, HiOutlineClipboardDocumentCheck,
  HiOutlineBars3, HiOutlineXMark,
} from 'react-icons/hi2';

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: HiOutlineHome },
  { to: '/admin/teachers', label: 'Teachers', icon: HiOutlineUsers },
  { to: '/admin/students', label: 'Students', icon: HiOutlineAcademicCap },
  { to: '/admin/assignments', label: 'Assignments', icon: HiOutlineClipboardDocumentList },
];

const teacherLinks = [
  { to: '/teacher/dashboard', label: 'Dashboard', icon: HiOutlineHome },
  { to: '/teacher/classes', label: 'My Classes', icon: HiOutlineBookOpen },
  { to: '/teacher/batches', label: 'My Batches', icon: HiOutlineBeaker },
];

const studentLinks = [
  { to: '/student/dashboard', label: 'Dashboard', icon: HiOutlineHome },
  { to: '/student/attendance', label: 'Attendance', icon: HiOutlineChartBar },
  { to: '/student/marks', label: 'Marks', icon: HiOutlineClipboardDocumentCheck },
];

const roleLinks = { admin: adminLinks, teacher: teacherLinks, student: studentLinks };
const roleLabels = { admin: 'Admin Panel', teacher: 'Teacher Panel', student: 'Student Portal' };

const Sidebar = ({ isOpen, onToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const links = roleLinks[user?.role] || [];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleLinkClick = () => {
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      onToggle();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-[260px] bg-gradient-to-b from-primary-900 via-primary-800 to-primary-700 text-white flex flex-col z-50 shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Logo + Close button */}
        <div className="px-6 py-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">PICT LMS</h1>
            <p className="text-xs text-primary-200 mt-1 font-medium">{roleLabels[user?.role]}</p>
          </div>
          <button onClick={onToggle} className="lg:hidden p-1 rounded-lg hover:bg-white/10 transition-colors">
            <HiOutlineXMark className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={handleLinkClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                    : 'text-primary-100 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <link.icon className="w-5 h-5 flex-shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-primary-200 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-primary-100 hover:bg-red-500/20 hover:text-red-200 transition-all duration-200"
          >
            <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
