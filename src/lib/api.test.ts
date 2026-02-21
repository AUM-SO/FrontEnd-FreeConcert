/// <reference types="bun-types" />
import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { tokenStorage, ApiError, authApi, eventsApi, bookingsApi } from './api';

// Mock fetch globally for all tests
const mockFetch = mock();
global.fetch = mockFetch as unknown as typeof fetch;

/** Helper to create a mock fetch Response */
const makeResponse = (body: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: mock().mockResolvedValue(body),
});

// ============================================
// tokenStorage
// ============================================

describe('tokenStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    // Clear the cookie too
    document.cookie = 'access_token=; path=/; max-age=0';
  });

  it('returns null when no token is stored', () => {
    expect(tokenStorage.get()).toBeNull();
  });

  it('stores token in localStorage when set', () => {
    tokenStorage.set('abc123');
    expect(localStorage.getItem('access_token')).toBe('abc123');
  });

  it('sets a cookie when token is stored', () => {
    tokenStorage.set('abc123');
    expect(document.cookie).toContain('access_token=abc123');
  });

  it('retrieves a previously stored token', () => {
    localStorage.setItem('access_token', 'stored_token');
    expect(tokenStorage.get()).toBe('stored_token');
  });

  it('removes token from localStorage on remove()', () => {
    localStorage.setItem('access_token', 'abc123');
    tokenStorage.remove();
    expect(localStorage.getItem('access_token')).toBeNull();
  });
});

// ============================================
// ApiError
// ============================================

describe('ApiError', () => {
  it('is an instance of both Error and ApiError', () => {
    const err = new ApiError('Not found', 404);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ApiError);
  });

  it('has correct name, message, and status properties', () => {
    const err = new ApiError('Unauthorized', 401);
    expect(err.name).toBe('ApiError');
    expect(err.message).toBe('Unauthorized');
    expect(err.status).toBe(401);
  });

  it('uses status 0 for network-level errors', () => {
    const err = new ApiError('Network error', 0);
    expect(err.status).toBe(0);
  });
});

// ============================================
// authApi
// ============================================

describe('authApi', () => {
  beforeEach(() => {
    localStorage.clear();
    mockFetch.mockClear();
  });

  describe('login', () => {
    it('stores the access token in localStorage on success', async () => {
      mockFetch.mockResolvedValueOnce(
        makeResponse({ user: { id: 1, email: 'test@example.com', name: 'Test', role: 'user' }, accessToken: 'jwt_token' })
      );

      await authApi.login({ email: 'test@example.com', password: 'pass' });

      expect(localStorage.getItem('access_token')).toBe('jwt_token');
    });

    it('returns user and accessToken on successful login', async () => {
      const mockResp = {
        user: { id: 1, email: 'test@example.com', name: 'Test', role: 'user' },
        accessToken: 'jwt_token',
      };
      mockFetch.mockResolvedValueOnce(makeResponse(mockResp));

      const result = await authApi.login({ email: 'test@example.com', password: 'pass' });

      expect(result.user.email).toBe('test@example.com');
      expect(result.accessToken).toBe('jwt_token');
    });

    it('throws ApiError on 401 invalid credentials', async () => {
      mockFetch.mockResolvedValueOnce(makeResponse({ message: 'Invalid credentials' }, 401));

      await expect(
        authApi.login({ email: 'wrong@example.com', password: 'wrong' })
      ).rejects.toBeInstanceOf(ApiError);
    });

    it('throws ApiError with status 0 on network failure', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      const err = await authApi.login({ email: 'test@example.com', password: 'pass' }).catch(e => e);
      expect(err).toBeInstanceOf(ApiError);
      expect(err.status).toBe(0);
    });
  });

  describe('register', () => {
    it('stores the access token in localStorage on success', async () => {
      const mockResp = {
        user: { id: 2, email: 'new@example.com', name: 'New User', role: 'user' },
        accessToken: 'new_jwt_token',
      };
      mockFetch.mockResolvedValueOnce(makeResponse(mockResp));

      await authApi.register({ email: 'new@example.com', password: 'pass123', name: 'New User' });

      expect(localStorage.getItem('access_token')).toBe('new_jwt_token');
    });

    it('throws ApiError on 409 duplicate email', async () => {
      mockFetch.mockResolvedValueOnce(makeResponse({ message: 'Email already exists' }, 409));

      await expect(
        authApi.register({ email: 'existing@example.com', password: 'pass', name: 'Test' })
      ).rejects.toBeInstanceOf(ApiError);
    });
  });

  describe('getMe', () => {
    it('sends Authorization Bearer header when a token is stored', async () => {
      localStorage.setItem('access_token', 'my_token');
      mockFetch.mockResolvedValueOnce(
        makeResponse({ id: 1, email: 'test@example.com', name: 'Test', role: 'user' })
      );

      await authApi.getMe();

      const [, options] = mockFetch.mock.calls[0] as [string, RequestInit & { headers: Record<string, string> }];
      expect(options.headers['Authorization']).toBe('Bearer my_token');
    });

    it('does not send Authorization header when no token is stored', async () => {
      mockFetch.mockResolvedValueOnce(
        makeResponse({ id: 1, email: 'test@example.com', name: 'Test', role: 'user' })
      );

      await authApi.getMe();

      const [, options] = mockFetch.mock.calls[0] as [string, RequestInit & { headers: Record<string, string> }];
      expect(options.headers['Authorization']).toBeUndefined();
    });

    it('clears the token and throws ApiError on 401 response', async () => {
      localStorage.setItem('access_token', 'expired_token');
      mockFetch.mockResolvedValueOnce(makeResponse({ message: 'Unauthorized' }, 401));

      await expect(authApi.getMe()).rejects.toBeInstanceOf(ApiError);
      expect(localStorage.getItem('access_token')).toBeNull();
    });
  });

  describe('logout', () => {
    it('removes the token from localStorage on success', async () => {
      localStorage.setItem('access_token', 'active_token');
      mockFetch.mockResolvedValueOnce(makeResponse({}, 200));

      await authApi.logout();

      expect(localStorage.getItem('access_token')).toBeNull();
    });

    it('still clears token even when API call throws a network error', async () => {
      localStorage.setItem('access_token', 'active_token');
      mockFetch.mockRejectedValueOnce(new TypeError('Network error'));

      await authApi.logout(); // should not throw

      expect(localStorage.getItem('access_token')).toBeNull();
    });
  });
});

// ============================================
// eventsApi
// ============================================

describe('eventsApi', () => {
  beforeEach(() => {
    localStorage.clear();
    mockFetch.mockClear();
  });

  describe('getAll', () => {
    it('fetches all events and returns the response', async () => {
      const mockResp = { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
      mockFetch.mockResolvedValueOnce(makeResponse(mockResp));

      const result = await eventsApi.getAll();

      expect(result).toEqual(mockResp);
      expect(mockFetch).toHaveBeenCalledWith('/api/events', expect.any(Object));
    });

    it('appends query params to the URL', async () => {
      mockFetch.mockResolvedValueOnce(makeResponse({ data: [], meta: {} }));

      await eventsApi.getAll({ page: 2, limit: 5, search: 'rock', status: 'active' });

      const [url] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toContain('page=2');
      expect(url).toContain('limit=5');
      expect(url).toContain('search=rock');
      expect(url).toContain('status=active');
    });

    it('does not append a query string when no params are given', async () => {
      mockFetch.mockResolvedValueOnce(makeResponse({ data: [], meta: {} }));

      await eventsApi.getAll();

      const [url] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('/api/events');
    });
  });

  describe('getById', () => {
    it('fetches the correct event by id', async () => {
      const mockEvent = { id: 5, title: 'Jazz Night' };
      mockFetch.mockResolvedValueOnce(makeResponse(mockEvent));

      const result = await eventsApi.getById(5);

      expect(result).toEqual(mockEvent);
      expect(mockFetch).toHaveBeenCalledWith('/api/events/5', expect.any(Object));
    });

    it('throws ApiError on 404', async () => {
      mockFetch.mockResolvedValueOnce(makeResponse({}, 404));

      await expect(eventsApi.getById(999)).rejects.toBeInstanceOf(ApiError);
    });
  });

  describe('getSeats', () => {
    it('fetches seats for an event without status filter', async () => {
      const mockSeats = [{ id: 1, status: 'available' }];
      mockFetch.mockResolvedValueOnce(makeResponse(mockSeats));

      const result = await eventsApi.getSeats(1);

      expect(result).toEqual(mockSeats);
      expect(mockFetch).toHaveBeenCalledWith('/api/events/1/seats', expect.any(Object));
    });

    it('appends status filter to URL when provided', async () => {
      mockFetch.mockResolvedValueOnce(makeResponse([]));

      await eventsApi.getSeats(1, 'available');

      const [url] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toContain('status=available');
    });
  });
});

// ============================================
// bookingsApi
// ============================================

describe('bookingsApi', () => {
  beforeEach(() => {
    localStorage.clear();
    mockFetch.mockClear();
  });

  describe('getAll', () => {
    it('fetches all bookings for the current user', async () => {
      const mockBookings = [{ id: 1, status: 'confirmed', bookingCode: 'BK-ABC123' }];
      mockFetch.mockResolvedValueOnce(makeResponse(mockBookings));

      const result = await bookingsApi.getAll();

      expect(result).toEqual(mockBookings);
      expect(mockFetch).toHaveBeenCalledWith('/api/bookings', expect.any(Object));
    });
  });

  describe('getById', () => {
    it('fetches a booking by id', async () => {
      const mockBooking = { id: 42, status: 'confirmed' };
      mockFetch.mockResolvedValueOnce(makeResponse(mockBooking));

      const result = await bookingsApi.getById(42);

      expect(result).toEqual(mockBooking);
      expect(mockFetch).toHaveBeenCalledWith('/api/bookings/42', expect.any(Object));
    });
  });

  describe('create', () => {
    it('sends a POST request with eventId and seatId', async () => {
      const mockBooking = { id: 1, eventId: 2, seatId: 3, status: 'confirmed', bookingCode: 'BK-XYZ789' };
      mockFetch.mockResolvedValueOnce(makeResponse(mockBooking));

      const result = await bookingsApi.create({ eventId: 2, seatId: 3 });

      expect(result).toEqual(mockBooking);
      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('/api/bookings');
      expect(options.method).toBe('POST');
      expect(JSON.parse(options.body as string)).toEqual({ eventId: 2, seatId: 3 });
    });

    it('throws ApiError on 400 when user already has a booking for the same event', async () => {
      mockFetch.mockResolvedValueOnce(
        makeResponse({ message: 'คุณได้จอง event นี้ไปแล้ว ไม่สามารถจองซ้ำได้' }, 400)
      );

      const err = await bookingsApi.create({ eventId: 1, seatId: 1 }).catch(e => e) as ApiError;
      expect(err).toBeInstanceOf(ApiError);
      expect(err.status).toBe(400);
      expect(err.message).toBe('คุณได้จอง event นี้ไปแล้ว ไม่สามารถจองซ้ำได้');
    });
  });

  describe('cancel', () => {
    it('sends a PATCH request to the cancel endpoint', async () => {
      const mockBooking = { id: 1, status: 'cancelled' };
      mockFetch.mockResolvedValueOnce(makeResponse(mockBooking));

      const result = await bookingsApi.cancel(1);

      expect(result).toEqual(mockBooking);
      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('/api/bookings/1/cancel');
      expect(options.method).toBe('PATCH');
    });
  });
});

// ============================================
// Default error messages (tested via apiRequest)
// ============================================

describe('default HTTP error messages', () => {
  beforeEach(() => {
    localStorage.clear();
    mockFetch.mockClear();
  });

  it.each([
    [400, 'คำขอไม่ถูกต้อง กรุณาตรวจสอบข้อมูลอีกครั้ง'],
    [403, 'คุณไม่มีสิทธิ์ในการดำเนินการนี้'],
    [404, 'ไม่พบข้อมูลที่ร้องขอ'],
    [500, 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ กรุณาลองใหม่ภายหลัง'],
  ])('status %i should produce the correct Thai error message', async (status: number, expectedMsg: string) => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status,
      json: mock().mockResolvedValue({}), // no message body → fallback to default
    });

    const err = await eventsApi.getById(1).catch(e => e) as ApiError;
    expect(err.message).toBe(expectedMsg);
  });
});
