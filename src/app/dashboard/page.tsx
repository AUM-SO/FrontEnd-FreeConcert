"use client";

import { useState, useEffect } from "react";
import { Home, History, Users, LogOut, Armchair, Trash2 } from "lucide-react";
import { eventsApi, bookingsApi, Event, Booking } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

export default function DashboardPage() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [concertTitle, setConcertTitle] = useState("");
  const [totalSeats, setTotalSeats] = useState("");
  const [description, setDescription] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedConcert, setSelectedConcert] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [concerts, setConcerts] = useState<Event[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch events and bookings on component mount
  useEffect(() => {
    fetchEvents();
    fetchBookings();
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

  const fetchBookings = async () => {
    try {
      const data = await bookingsApi.getAll();
      setBookings(data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const openDeleteModal = (concert: { id: number; title: string }) => {
    setSelectedConcert(concert);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedConcert(null);
  };

  const handleDelete = async () => {
    if (!selectedConcert) return;

    try {
      setError("");
      await eventsApi.delete(selectedConcert.id);
      setSuccessMessage(`ลบ "${selectedConcert.title}" สำเร็จ`);
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ลบ event ล้มเหลว กรุณาลองใหม่");
      console.error("Error deleting event:", err);
    } finally {
      closeDeleteModal();
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!concertTitle || !totalSeats || !description) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    try {
      setError("");
      await eventsApi.create({
        title: concertTitle,
        description,
        totalSeats: parseInt(totalSeats),
      });

      setSuccessMessage("สร้าง event สำเร็จ!");
      setTimeout(() => setSuccessMessage(""), 3000);

      // Reset form
      setConcertTitle("");
      setTotalSeats("");
      setDescription("");

      // Switch to overview tab and refresh
      setActiveTab("overview");
      fetchEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "สร้าง event ล้มเหลว กรุณาลองใหม่");
      console.error("Error creating event:", err);
    }
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
            <h1 className="text-2xl font-bold text-gray-800">Admin</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <a
              href="/dashboard"
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
            <a
              href="/home"
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            {/* Total of seats */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
              <div className="flex items-center justify-center mb-2">
                <Armchair size={24} />
              </div>
              <div className="text-center">
                <p className="text-sm opacity-90 mb-1">Total of seats</p>
                <p className="text-4xl font-bold">
                  {concerts.reduce((sum, c) => sum + (c.totalSeats || 0), 0)}
                </p>
              </div>
            </div>

            {/* Reserve */}
            <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg p-6 text-white shadow-lg">
              <div className="flex items-center justify-center mb-2">
                <Users size={24} />
              </div>
              <div className="text-center">
                <p className="text-sm opacity-90 mb-1">Reserve</p>
                <p className="text-4xl font-bold">
                  {concerts.reduce((sum, c) => sum + ((c.totalSeats || 0) - (c.availableSeats || 0)), 0)}
                  <span className="text-lg font-normal opacity-75">
                    /{concerts.reduce((sum, c) => sum + (c.totalSeats || 0), 0)}
                  </span>
                </p>
              </div>
            </div>

            {/* Cancel */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-6 text-white shadow-lg">
              <div className="flex items-center justify-center mb-2">
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm opacity-90 mb-1">Cancel</p>
                <p className="text-4xl font-bold">
                  {bookings.filter((b) => b.status === "cancelled").length}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "overview"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("create")}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "create"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Create
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "overview" ? (
              /* Concert List */
              <div className="p-4 md:p-6 space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading events...</p>
                  </div>
                ) : concerts.length === 0 ? (
                  <div className="text-center py-8 text-gray-600">
                    No events found. Create your first event!
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
                          onClick={() =>
                            openDeleteModal({
                              id: concert.id,
                              title: concert.title,
                            })
                          }
                          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              /* Create Form */
              <div className="p-4 md:p-6">
                <form className="space-y-6" onSubmit={handleCreateEvent}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Concert Title */}
                    <div>
                      <label
                        htmlFor="concertTitle"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Concert Title
                      </label>
                      <input
                        type="text"
                        id="concertTitle"
                        value={concertTitle}
                        onChange={(e) => setConcertTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Please input concert title"
                        required
                      />
                    </div>

                    {/* Total of seat */}
                    <div>
                      <label
                        htmlFor="totalSeats"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Total of seat
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          id="totalSeats"
                          value={totalSeats}
                          onChange={(e) => setTotalSeats(e.target.value)}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="500"
                          required
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <Users size={18} className="text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Please input description"
                      required
                    />
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                        />
                      </svg>
                      Save
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-opacity-10 backdrop-blur-[2px]"
            onClick={closeDeleteModal}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 z-10">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>

            {/* Text */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Are you sure to delete?
              </h3>
              <p className="text-sm text-gray-600">
                &quot;{selectedConcert?.title}&quot;
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={closeDeleteModal}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
