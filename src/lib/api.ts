// API Client for Backend Communication
const API_BASE_URL = '/api';

// Token management (localStorage)
export const tokenStorage = {
  get: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  },
  set: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('access_token', token);
    // Also set a cookie so Next.js middleware can read it for route protection
    document.cookie = `access_token=${token}; path=/; max-age=86400; SameSite=Lax`;
  },
  remove: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('access_token');
    // Clear the cookie too
    document.cookie = 'access_token=; path=/; max-age=0; SameSite=Lax';
  },
};

// Generic API request handler
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Attach token from localStorage as Bearer header
  const token = tokenStorage.get();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        headers[key] = value;
      }
    });
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'An error occurred',
    }));
    throw new Error(error.message || `HTTP Error: ${response.status}`);
  }

  return response.json();
}

// ============================================
// Auth API
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

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.accessToken) {
      tokenStorage.set(res.accessToken);
    }
    return res;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const res = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.accessToken) {
      tokenStorage.set(res.accessToken);
    }
    return res;
  },

  logout: async (): Promise<void> => {
    tokenStorage.remove();
  },

  getMe: async (): Promise<User> => {
    return apiRequest<User>('/auth/me');
  },
};

// ============================================
// Events API
// ============================================

export interface Event {
  id: number;
  name: string;
  description: string;
  date: string;
  venueId: number;
  availableSeats: number;
  totalSeats: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventRequest {
  name: string;
  description: string;
  date: string;
  venueId: number;
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

export const eventsApi = {
  getAll: async (params?: QueryEventParams): Promise<EventsResponse> => {
    const queryString = new URLSearchParams(
      params as Record<string, string>
    ).toString();
    return apiRequest<EventsResponse>(
      `/events${queryString ? `?${queryString}` : ''}`
    );
  },

  getById: async (id: number): Promise<Event> => {
    return apiRequest<Event>(`/events/${id}`);
  },

  create: async (data: CreateEventRequest): Promise<Event> => {
    return apiRequest<Event>('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<CreateEventRequest>): Promise<Event> => {
    return apiRequest<Event>(`/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return apiRequest<void>(`/events/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// Bookings API
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

export const bookingsApi = {
  getAll: async (): Promise<Booking[]> => {
    return apiRequest<Booking[]>('/bookings');
  },

  getById: async (id: number): Promise<Booking> => {
    return apiRequest<Booking>(`/bookings/${id}`);
  },

  create: async (data: CreateBookingRequest): Promise<Booking> => {
    return apiRequest<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  cancel: async (id: number): Promise<Booking> => {
    return apiRequest<Booking>(`/bookings/${id}/cancel`, {
      method: 'PATCH',
    });
  },
};

// ============================================
// Export all
// ============================================

const api = {
  auth: authApi,
  events: eventsApi,
  bookings: bookingsApi,
};

export default api;
