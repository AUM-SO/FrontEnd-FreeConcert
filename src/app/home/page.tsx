"use client";

import { useState, useEffect } from "react";
import { Home, History, Users, LogOut, Armchair, Ticket } from "lucide-react";
import { eventsApi, bookingsApi, Event } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

export default function HomePage() {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [concerts, setConcerts] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [reservingId, setReservingId] = useState<number | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

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
    if (concert.availableSeats <= 0) {
      setError("ที่นั่งเต็มแล้ว");
      return;
    }

    try {
      setError("");
      setReservingId(concert.id);
      await bookingsApi.create({
        eventId: concert.id,
        seatId: 1,
      });
      setSuccessMessage(`จองที่นั่ง "${concert.title}" สำเร็จ!`);
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "จองที่นั่งล้มเหลว กรุณาลองใหม่");
      console.error("Error reserving:", err);
    } finally {
      setReservingId(null);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 transition-transform duration-200 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">FreeConcert</h1>
            {user && (
              <p className="text-sm text-gray-500 mt-1">{user.name}</p>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <a
              href="/home"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Home size={20} />
              <span>Home</span>
            </a>
            <a
              href="/history"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <History size={20} />
              <span>History</span>
            </a>
            {user?.role === "admin" && (
              <a
                href="/dashboard"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Users size={20} />
                <span>Switch to admin</span>
              </a>
            )}
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
          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Concert List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-800">Available Concerts</h2>
            </div>

            <div className="p-4 md:p-6 space-y-4">
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
                            {concert.totalSeats}
                          </span>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            concert.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {concert.status}
                        </span>
                      </div>
                      <button
                        onClick={() => handleReserve(concert)}
                        disabled={concert.availableSeats <= 0 || concert.status !== "active" || reservingId === concert.id}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        <Ticket size={16} />
                        {reservingId === concert.id
                          ? "Reserving..."
                          : concert.availableSeats <= 0
                          ? "Full"
                          : "Reserve"}
                      </button>
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
