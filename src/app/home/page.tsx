"use client";

import { useState, useEffect } from "react";
import { Armchair, Ticket, XCircle } from "lucide-react";
import { eventsApi, bookingsApi, Event } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import Toast from "@/components/Toast";
import Sidebar from "@/components/Sidebar";

export default function HomePage() {
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [concerts, setConcerts] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [reservingId, setReservingId] = useState<number | null>(null);
  const [activeBookingsByEvent, setActiveBookingsByEvent] = useState<Map<number, number>>(new Map());
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    fetchEvents();
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    try {
      const myBookings = await bookingsApi.getAll();
      const map = new Map(
        myBookings
          .filter((b) => b.status !== "cancelled")
          .map((b) => [b.eventId, b.id]),
      );
      setActiveBookingsByEvent(map);
    } catch {
      // ถ้าโหลดไม่ได้ ให้ยังคงใช้งานได้ตามปกติ
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsApi.getAll();
      setConcerts(response.data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "โหลดข้อมูล event ล้มเหลว");
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async (concert: Event) => {
    if (reservingId !== null) return;

    if (concert.availableSeats <= 0) {
      setSuccessMessage("");
      setError("ที่นั่งเต็มแล้ว");
      return;
    }

    try {
      setError("");
      setSuccessMessage("");
      setReservingId(concert.id);

      // Fetch available seats and pick the first one
      const availableSeats = await eventsApi.getSeats(concert.id, "available");
      
      if (availableSeats.length === 0) {
        setError("ไม่มีที่นั่งว่างแล้ว");
        return;
      }
 
      await bookingsApi.create({
        eventId: concert.id,
        seatId: availableSeats[0].id,
      });
      setSuccessMessage(`จองที่นั่ง "${concert.title}" สำเร็จ!`);
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchEvents();
      fetchUserBookings();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "จองที่นั่งล้มเหลว กรุณาลองใหม่",
      );
      console.error("Error reserving:", err);
    } finally {
      setReservingId(null);
    }
  };

  const handleCancel = async (concert: Event) => {
    const bookingId = activeBookingsByEvent.get(concert.id);
    if (!bookingId || cancellingId !== null) return;

    try {
      setError("");
      setSuccessMessage("");
      setCancellingId(bookingId);
      await bookingsApi.cancel(bookingId);
      setSuccessMessage(`ยกเลิกการจอง "${concert.title}" สำเร็จ!`);
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchEvents();
      fetchUserBookings();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "ยกเลิกการจองล้มเหลว กรุณาลองใหม่",
      );
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
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        <div className="p-4 md:p-8 max-w-8xl mx-auto">
          {/* Concert List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Available Concerts
              </h2>
            </div>

            <div className="p-4 md:p-6 space-y-4 h-[85vh] overflow-y-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Loading events...</p>
                </div>
              ) : concerts.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  No events available at the moment.
                </div>
              ) : (
                concerts.map((concert) => (
                  <div
                    key={concert.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      {concert.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {concert.description}
                    </p>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Armchair size={18} />
                          <span className="text-sm font-medium">
                            {concert?.availableSeats}
                            /{concert?.totalSeats}
                          </span>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            concert?.status === "published"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {concert.status}
                        </span>
                      </div>
                      {activeBookingsByEvent.has(concert.id) ? (
                        <button
                          onClick={() => handleCancel(concert)}
                          disabled={cancellingId !== null}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          <XCircle size={16} />
                          {cancellingId === activeBookingsByEvent.get(concert.id)
                            ? "Cancelling..."
                            : "Cancel"}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReserve(concert)}
                          disabled={
                            concert.availableSeats <= 0 ||
                            concert.status !== "published" ||
                            reservingId !== null
                          }
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          <Ticket size={16} />
                          {reservingId === concert.id
                            ? "Reserving..."
                            : concert.availableSeats <= 0
                              ? "Full"
                              : "Reserve"}
                        </button>
                      )}
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
