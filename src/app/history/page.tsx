"use client";

import { useState } from "react";
import { Home, History, Users, LogOut } from "lucide-react";

export default function HistoryPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const historyData = [
    {
      id: 1,
      dateTime: "12/09/2024 15:00:00",
      username: "sara.john",
      concertName: "The festival int 2024",
      action: "Cancel",
    },
    {
      id: 2,
      dateTime: "12/09/2024 10:39:20",
      username: "sara.john",
      concertName: "The festival int 2024",
      action: "Reserve",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-200 ease-in-out`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">Admin</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <a
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Home size={20} />
              <span>Home</span>
            </a>
            <a
              href="/history"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <History size={20} />
              <span>History</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Users size={20} />
              <span>Switch to user</span>
            </a>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button className="flex items-center gap-3 px-4 py-3 w-full text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 w-full lg:w-auto">
        {/* Mobile Menu Button */}
        <div className="lg:hidden p-4 bg-white border-b border-gray-200">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <div className="p-4 md:p-8 max-w-8xl mx-auto">
          {/* History Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Table for larger screens */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Date time
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Concert name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {historyData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.dateTime}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.username}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.concertName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.action}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards for mobile screens */}
            <div className="md:hidden divide-y divide-gray-200">
              {historyData.map((item) => (
                <div key={item.id} className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-medium text-gray-500">Date time</span>
                    <span className="text-sm text-gray-900">{item.dateTime}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-medium text-gray-500">Username</span>
                    <span className="text-sm text-gray-900">{item.username}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-medium text-gray-500">Concert name</span>
                    <span className="text-sm text-gray-900">{item.concertName}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-medium text-gray-500">Action</span>
                    <span className="text-sm text-gray-900">{item.action}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
