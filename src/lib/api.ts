// API Client for Backend Communication
import type {
  LoginRequest,
  RegisterRequest,
  User,
  AuthResponse,
  Event,
  CreateEventRequest,
  QueryEventParams,
  EventsResponse,
  Booking,
  CreateBookingRequest,
} from '@/types/api';

export type { LoginRequest, RegisterRequest, User, AuthResponse, Event, CreateEventRequest, QueryEventParams, EventsResponse, Booking, CreateBookingRequest };

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

// Custom error class with status code
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

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

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(
      'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
      0
    );
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody.message || getDefaultErrorMessage(response.status);

    // Auto-logout on 401 (token expired/invalid)
    if (response.status === 401) {
      tokenStorage.remove();
      if (typeof window !== 'undefined' && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
        window.location.href = '/login';
      }
    }

    throw new ApiError(message, response.status);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

function getDefaultErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return 'คำขอไม่ถูกต้อง กรุณาตรวจสอบข้อมูลอีกครั้ง';
    case 401:
      return 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่';
    case 403:
      return 'คุณไม่มีสิทธิ์ในการดำเนินการนี้';
    case 404:
      return 'ไม่พบข้อมูลที่ร้องขอ';
    case 409:
      return 'ข้อมูลซ้ำกัน กรุณาตรวจสอบอีกครั้ง';
    case 422:
      return 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง';
    case 429:
      return 'คำขอมากเกินไป กรุณารอสักครู่แล้วลองใหม่';
    case 500:
      return 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ กรุณาลองใหม่ภายหลัง';
    case 502:
    case 503:
    case 504:
      return 'เซิร์ฟเวอร์ไม่พร้อมให้บริการ กรุณาลองใหม่ภายหลัง';
    default:
      return `เกิดข้อผิดพลาด (${status})`;
  }
}

// ============================================
// Auth API
// ============================================

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
    await apiRequest('/auth/logout', { method: 'POST' }).catch(() => {});
    tokenStorage.remove();
  },

  getMe: async (): Promise<User> => {
    return apiRequest<User>('/auth/me');
  },
};

// ============================================
// Events API
// ============================================

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
