"use client";

import { useState, useEffect } from "react";
import { Home, History, Users, LogOut } from "lucide-react";
import { bookingsApi, Booking } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

export default function HistoryPage() {
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingsApi.getAll();
      setBookings(data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch bookings");
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

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
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
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
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* History Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Table for larger screens */}
            <div className="hidden md:block overflow-x-auto">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Loading bookings...</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-12 text-gray-600">
                  No booking history found.
                </div>
              ) : (
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
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(booking.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {booking.user?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {booking.event?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'confirmed' 
                              ? 'bg-green-100 text-green-700' 
                              : booking.status === 'cancelled'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Cards for mobile screens */}
            <div className="md:hidden divide-y divide-gray-200">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Loading bookings...</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-12 text-gray-600">
                  No booking history found.
                </div>
              ) : (
                bookings.map((booking) => (
                  <div key={booking.id} className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-medium text-gray-500">Date time</span>
                      <span className="text-sm text-gray-900">
                        {new Date(booking.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-medium text-gray-500">Username</span>
                      <span className="text-sm text-gray-900">
                        {booking.user?.name || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-medium text-gray-500">Concert name</span>
                      <span className="text-sm text-gray-900">{booking.event?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-medium text-gray-500">Status</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' 
                          ? 'bg-green-100 text-green-700' 
                          : booking.status === 'cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
