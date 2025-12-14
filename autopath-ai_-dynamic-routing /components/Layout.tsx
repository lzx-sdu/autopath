import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  return (
    <div className="flex bg-slate-950 min-h-screen text-slate-200 font-sans">
      <Sidebar />
      <main className="flex-1 ml-64 relative">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;