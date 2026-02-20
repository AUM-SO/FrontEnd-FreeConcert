"use client";

import { useState, useEffect } from "react";
import { XCircle } from "lucide-react";
import { bookingsApi, Booking } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import Toast from "@/components/Toast";
import Sidebar from "@/components/Sidebar";

export default function HistoryPage() {
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [cancellingId, setCancellingId] = useState<number | null>(null);

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
      setError(err instanceof Error ? err.message : "โหลดข้อมูลการจองล้มเหลว");
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: number) => {
    if (cancellingId !== null) return;

    try {
      setError("");
      setSuccessMessage("");
      setCancellingId(bookingId);
      await bookingsApi.cancel(bookingId);
      setSuccessMessage("ยกเลิกการจองสำเร็จ!");
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchBookings();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "ยกเลิกการจองล้มเหลว กรุณาลองใหม่"
      );
      console.error("Error cancelling booking:", err);
    } finally {
      setCancellingId(null);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Toast
        successMessage={successMessage}
        errorMessage={error}
        onCloseSuccess={() => setSuccessMessage("")}
        onCloseError={() => setError("")}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
      />

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
            <div className="hidden md:block overflow-x-auto max-h-[90vh]">
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
                        Action
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
                          {booking.event?.title || 'N/A'}
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
                      <span className="text-sm text-gray-900">{booking.event?.title || 'N/A'}</span>
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
                    {booking.status === 'confirmed' && (
                      <div className="pt-2">
                        <button
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancellingId !== null}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors w-full justify-center"
                        >
                          <XCircle size={14} />
                          {cancellingId === booking.id ? "Cancelling..." : "Cancel Booking"}
                        </button>
                      </div>
                    )}
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
