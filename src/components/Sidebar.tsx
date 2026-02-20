"use client";

import { Home, History, Users, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function Sidebar({ isOpen, onClose, onLogout }: SidebarProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const isAdmin = user?.role === "admin";

  // Admin browsing in user mode (/home) vs admin area (/dashboard, /history)
  const isAdminArea = isAdmin && pathname !== "/home";
  const homeHref = isAdminArea ? "/dashboard" : "/home";
  const title = isAdminArea ? "Admin" : "FreeConcert";

  return (
    <>
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-200 ease-in-out`}
      >
        <div className="flex flex-col h-[100vh]">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            {!isAdminArea && user && (
              <p className="text-sm text-gray-500 mt-1">{user.name}</p>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <a
              href={homeHref}
              className={`flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg transition-colors ${
                pathname === homeHref
                  ? "bg-gray-100 hover:bg-gray-200"
                  : "hover:bg-gray-100"
              }`}
            >
              <Home size={20} />
              <span>Home</span>
            </a>
            <a
              href="/history"
              className={`flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg transition-colors ${
                pathname === "/history"
                  ? "bg-gray-100 hover:bg-gray-200"
                  : "hover:bg-gray-100"
              }`}
            >
              <History size={20} />
              <span>History</span>
            </a>
            {isAdmin && (
              <a
                href={pathname === "/home" ? "/dashboard" : "/home"}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Users size={20} />
                <span>
                  {pathname === "/home" ? "Switch to admin" : "Switch to user"}
                </span>
              </a>
            )}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={onLogout}
              className="flex items-center gap-3 px-4 py-3 w-full text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-opacity-10 backdrop-blur-[2px] z-40 lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
}
