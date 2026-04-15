import { useAuth } from '../../context/AuthContext';
import { useOutletContext } from 'react-router-dom';
import { HiOutlineBars3 } from 'react-icons/hi2';

const roleBadgeColors = {
  admin: 'bg-purple-100 text-purple-700',
  teacher: 'bg-emerald-100 text-emerald-700',
  student: 'bg-blue-100 text-blue-700',
};

const TopHeader = ({ title }) => {
  const { user } = useAuth();
  const { toggleSidebar } = useOutletContext() || {};

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Hamburger — visible on mobile only */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 -ml-1 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <HiOutlineBars3 className="w-6 h-6" />
          </button>
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{title}</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className={`hidden sm:inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${roleBadgeColors[user?.role] || 'bg-gray-100'}`}>
            {user?.role}
          </span>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center text-white font-bold text-sm shadow-md">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
