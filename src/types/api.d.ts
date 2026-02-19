// ============================================
// Auth Types
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  avatar?: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface AuthResponse {
  user: User;
  accessToken?: string;
}

// ============================================
// Events Types
// ============================================

export interface Event {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  availableSeats: number;
  totalSeats: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  imageUrl?: string;
  totalSeats: number;
}

export interface QueryEventParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface EventsResponse {
  data: Event[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ============================================
// Bookings Types
// ============================================

export interface Booking {
  id: number;
  userId: number;
  eventId: number;
  seatId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  event?: Event;
  user?: {
    id: number;
    email: string;
    name: string;
  };
}

export interface CreateBookingRequest {
  eventId: number;
  seatId: number;
}

// ============================================
// Seats Types
// ============================================

export interface Seat {
  id: number;
  venueId: number;
  eventId: number;
  section: string;
  row: string;
  number: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
