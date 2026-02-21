# FreeConcertTickets — Frontend

เว็บแอปพลิเคชันสำหรับระบบจองตั๋วคอนเสิร์ตฟรี สร้างด้วย **Next.js 16** (App Router), **React 19**, **TypeScript** และ **Tailwind CSS v4**

---

## สารบัญ

- [Tech Stack](#tech-stack)
- [โครงสร้างโปรเจกต์](#โครงสร้างโปรเจกต์)
- [ภาพรวม Architecture](#ภาพรวม-architecture)
- [ขั้นตอนการตั้งค่าบนเครื่อง Local](#ขั้นตอนการตั้งค่าบนเครื่อง-local)
  - [1. ติดตั้ง Dependencies](#1-ติดตั้ง-dependencies)
  - [2. ตั้งค่า Environment Variables](#2-ตั้งค่า-environment-variables)
  - [3. รัน Development Server](#3-รัน-development-server)
- [การรันแอป](#การรันแอป)
- [การรัน Unit Tests](#การรัน-unit-tests)
- [หน้าและ Routes](#หน้าและ-routes)
- [การเชื่อมต่อ Backend API](#การเชื่อมต่อ-backend-api)

---

## Tech Stack

| Layer | Technology |
| ----- | ---------- |
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI Library | React 19 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Icons | lucide-react |
| State Management | React Context API |
| API Client | Fetch API (native) |
| Auth | JWT (localStorage + cookie) |
| Testing | Bun Test + happy-dom |
| Package Manager | Bun |

---

## โครงสร้างโปรเจกต์

```text
frontend-freeconcert/
├── src/
│   ├── app/                        # Next.js App Router (pages & layouts)
│   │   ├── layout.tsx              # Root layout — wraps AuthProvider, fonts
│   │   ├── page.tsx                # Root "/" — redirect ตาม auth status
│   │   ├── login/page.tsx          # หน้า Login
│   │   ├── home/page.tsx           # หน้าหลัก user — ดูและจองคอนเสิร์ต
│   │   ├── dashboard/page.tsx      # Admin dashboard — จัดการ events
│   │   ├── history/page.tsx        # ประวัติการจอง (user & admin)
│   │   └── globals.css             # Global Tailwind CSS
│   ├── components/
│   │   ├── Sidebar.tsx             # Sidebar navigation (desktop + mobile drawer)
│   │   ├── Toast.tsx               # Toast notification (success/error)
│   │   └── ui/                     # shadcn/ui base components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── label.tsx
│   ├── contexts/
│   │   └── auth-context.tsx        # AuthContext — user, login, logout, register
│   ├── lib/
│   │   ├── api.ts                  # API client — auth, events, bookings
│   │   ├── api.test.ts             # Unit tests สำหรับ API client
│   │   └── utils.ts                # cn() helper (clsx + tailwind-merge)
│   ├── test/
│   │   └── setup.ts                # Vitest setup (@testing-library/jest-dom)
│   ├── types/
│   │   └── api.d.ts                # TypeScript types (User, Event, Booking, Seat)
│   └── middleware.ts               # Route protection middleware
├── .env.local.example              # Environment variable template
├── next.config.ts                  # Next.js config (API proxy rewrites)
├── vitest.config.ts                # Vitest config
├── components.json                 # shadcn/ui config
└── package.json
```

---

## ภาพรวม Architecture

```text
┌──────────────────────────────────────────────────────────────┐
│                    Browser (Next.js)                         │
│                                                              │
│  ┌─────────────┐   ┌─────────────┐   ┌──────────────────┐    │
│  │  /login     │   │  /home      │   │  /dashboard      │    │
│  │             │   │  (user)     │   │  (admin)         │    │
│  └──────┬──────┘   └──────┬──────┘   └────────┬─────────┘    │
│         │                 │                    │             │
│         └─────────────────┴────────────────────┘             │
│                           │                                  │
│              ┌────────────▼────────────┐                     │
│              │      AuthContext        │                     │
│              │  user / login / logout  │                     │
│              └────────────┬────────────┘                     │
│                           │                                  │
│              ┌────────────▼────────────┐                     │
│              │       lib/api.ts        │                     │
│              │  fetch + Bearer Token   │                     │
│              └────────────┬────────────┘                     │
│                           │ /api/* (proxy)                   │
└───────────────────────────┼──────────────────────────────────┘
                            │ next.config.ts rewrites
                            ▼
              http://localhost:3002/api/*
              (NestJS Backend)
```

### Data & Auth Flow

```text
1. ผู้ใช้เปิดแอป
      ↓
2. middleware.ts ตรวจสอบ cookie "access_token"
      ├─ มี token → อนุญาตเข้าหน้าที่ protected
      └─ ไม่มี token → redirect ไป /login
      ↓
3. AuthContext (layout.tsx)
      └─ เรียก /api/auth/me เพื่อดึงข้อมูล user
      ↓
4. Page Component
      └─ เรียก lib/api.ts (eventsApi, bookingsApi)
      ↓
5. lib/api.ts
      ├─ attach Bearer token จาก localStorage
      ├─ fetch ไป /api/* (proxied โดย next.config.ts)
      └─ auto-logout เมื่อได้รับ 401
```

### Route Protection (middleware.ts)

| Route | ต้องการ Auth | Redirect ถ้าไม่มี |
| ----- | ------------ | ---------------- |
| `/home` | ✓ | → `/login` |
| `/dashboard` | ✓ | → `/login` |
| `/history` | ✓ | → `/login` |
| `/login` | ✗ | → `/home` (ถ้า login แล้ว) |
| `/` | — | → `/home` หรือ `/login` |

### API Proxy

`next.config.ts` proxy ทุก request `/api/*` ไปยัง backend:

```text
Frontend: /api/events  →  Backend: http://localhost:3002/api/events
```

ทำให้ไม่ต้องเขียน full URL ใน frontend และหลีกเลี่ยงปัญหา CORS

---

## ขั้นตอนการตั้งค่าบนเครื่อง Local

### สิ่งที่ต้องติดตั้งก่อน

- [Node.js](https://nodejs.org/) v20+
- [Bun](https://bun.sh/) (package manager)
- Backend ต้องรันอยู่ที่ `http://localhost:3002` (ดู backend README)

---

### 1. ติดตั้ง Dependencies

```bash
bun install
```

---

### 2. ตั้งค่า Environment Variables

คัดลอก `.env.local.example` แล้วแก้ไขค่าให้ตรงกับ local:

```bash
cp .env.local.example .env.local
```

แก้ไขไฟล์ `.env.local`:

```env
# URL ของ Backend API (สำหรับ Next.js server-side proxy)
API_URL=http://localhost:3002

# URL สำหรับ client-side (ถ้าต้องการใช้โดยตรง)
NEXT_PUBLIC_API_URL=http://localhost:3002
```

> **หมายเหตุ**: ต้องรัน backend ก่อน โดย default backend รันที่ port `3002`

---

### 3. รัน Development Server

```bash
bun dev
```

แอปจะรันที่ <http://localhost:3000>

---

## การรันแอป

```bash
# Development (auto-reload เมื่อไฟล์เปลี่ยน)
bun dev

# Production build
bun run build
bun start

# Lint
bun run lint
```

---

## การรัน Unit Tests

### รันทุก Unit Tests (ครั้งเดียว)

```bash
bun test
```

### Watch Mode (auto-rerun เมื่อไฟล์เปลี่ยน)

```bash
bun test --watch
```

### Coverage Report

```bash
bun test --coverage
```

### ไฟล์ Unit Tests

ไฟล์ `src/lib/api.test.ts` ครอบคลุม: tokenStorage, ApiError, authApi, eventsApi, bookingsApi

### สิ่งที่ทดสอบใน `api.test.ts`

| Test Group | Test Cases |
| ---------- | ---------- |
| `tokenStorage` | get/set/remove token, ตั้งค่า cookie |
| `ApiError` | สร้าง error พร้อม status code, message |
| `authApi` | login, register, logout, getMe |
| `eventsApi` | getAll (พร้อม pagination/search), getById, getSeats |
| `bookingsApi` | getAll, getById, create, cancel |
| Error handling | HTTP error messages (ภาษาไทย), network failures |

### ตัวอย่าง Output

```text
✓ src/lib/api.test.ts (35)
  ✓ tokenStorage (4)
  ✓ ApiError (3)
  ✓ authApi (8)
  ✓ eventsApi (7)
  ✓ bookingsApi (8)
  ✓ Default error messages (5)

Test Files  1 passed (1)
Tests       35 passed (35)
```

---

## หน้าและ Routes

| Route | Component | สิทธิ์ | คำอธิบาย |
| ----- | --------- | ------ | -------- |
| `/login` | `app/login/page.tsx` | ทุกคน | หน้า Login |
| `/home` | `app/home/page.tsx` | User | ดูคอนเสิร์ตและจองที่นั่ง |
| `/dashboard` | `app/dashboard/page.tsx` | Admin | จัดการ events, ดูสถิติ |
| `/history` | `app/history/page.tsx` | User + Admin | ประวัติการจอง |

### Login Credentials (จาก seed data)

| Role | Email | Password |
| ---- | ----- | -------- |
| Admin | `admin@example.com` | `password123` |
| User | `user1@example.com` | `password123` |
| User | `user2@example.com` | `password123` |

> **หมายเหตุ**: ต้องรัน `yarn db:seed` ที่ backend ก่อน

---

## การเชื่อมต่อ Backend API

API ทั้งหมดถูก proxy ผ่าน `/api/*` โดย `next.config.ts`:

```typescript
// next.config.ts
rewrites: () => [{ source: '/api/:path*', destination: `${API_URL}/api/:path*` }]
```

`src/lib/api.ts` แบ่ง API เป็นกลุ่ม:

```typescript
authApi.login(email, password)       // POST /api/auth/login
authApi.logout()                     // POST /api/auth/logout
authApi.getMe()                      // GET  /api/auth/me

eventsApi.getAll(params?)            // GET  /api/events
eventsApi.getById(id)               // GET  /api/events/:id
eventsApi.getSeats(eventId)         // GET  /api/events/:id/seats
eventsApi.create(data)              // POST /api/events
eventsApi.delete(id)                // DELETE /api/events/:id

bookingsApi.getAll()                // GET  /api/bookings
bookingsApi.create(data)            // POST /api/bookings
bookingsApi.cancel(id)              // PATCH /api/bookings/:id/cancel
```
