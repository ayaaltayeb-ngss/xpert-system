import {
  LayoutDashboard,
  BrainCircuit,
  BarChart3,
  Settings,
  ChevronLeft,
} from "lucide-react";

import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-56 border-r border-gray-200 bg-white">

      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-gray-100 px-5">

        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <BrainCircuit size={16} />
        </div>

        <div>
          <h1 className="text-sm font-bold text-indigo-900">
            Xpert System
          </h1>

          <p className="text-[9px] text-gray-400">
            AI Prediction & Analytics
          </p>
        </div>

      </div>

      {/* Navigation */}
      <nav className="p-3">

        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Workspace
        </p>


       <SidebarItem
          to="/analytics"
          icon={<BarChart3 size={15} />}
          text="Data Analytics"
        />

        <SidebarItem
          to="/prediction"
          icon={<BrainCircuit size={15} />}
          text="New Prediction"
        />

      </nav>


    </aside>
  );
}


function SidebarItem({ to, icon, text }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs transition ${
          isActive
            ? "bg-indigo-50 font-semibold text-indigo-700"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
        }`
      }
    >
      {icon}
      <span>{text}</span>
    </NavLink>
  );
}

export default Sidebar;