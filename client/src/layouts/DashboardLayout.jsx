import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/shared/Sidebar';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f0f4ff]">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <main className="lg:ml-[260px] min-h-screen">
        <Outlet context={{ toggleSidebar: () => setSidebarOpen(!sidebarOpen) }} />
      </main>
    </div>
  );
};

export default DashboardLayout;
