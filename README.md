# TaskTracker

TaskTracker is a full-stack task management web application built as a portfolio-ready MVP. It focuses on secure authentication, session handling, task CRUD, filtering, calendar-based task views, hybrid due date input, and Playwright end-to-end testing.

- [English](#english)
- [ภาษาไทย](#ภาษาไทย)

---

## English

### Project Overview

TaskTracker is a full-stack task management web app for individual productivity. Users can register, verify their email, log in, manage secure sessions, and manage their own tasks through a protected dashboard.

The project is designed as a junior/full-stack developer portfolio project. It highlights practical application architecture with Next.js App Router, custom authentication, JWT access tokens, database-backed refresh tokens, Prisma models, protected API Routes, task CRUD, search, filters, calendar-based task views, and Playwright E2E tests.

The codebase is intentionally structured so it can be extended into a team collaboration product later, with future support for workspaces, roles, task assignment, and shared task workflows.

### Features

#### Authentication

- Register with full name, email, and password
- Login and logout
- Strong password policy
- Email verification before login
- Resend verification email
- Production-safe verification route using `/verify-email#token=...`
- JWT access token stored in an `httpOnly` cookie
- Random refresh token stored in an `httpOnly` cookie
- Refresh token stored as a SHA-256 hash in the database
- Refresh token revocation on logout
- Inactivity timeout using `lastActiveAt`
- Protected user session restoration through `GET /api/auth/me`

#### Tasks

- Create task
- View user-specific tasks
- Update task
- Delete task
- Mark task as done
- Automatic `completedAt` handling
- Search tasks by title
- Filter tasks by status
- Filter tasks by priority
- Calendar-based task filtering
- Hybrid due date input with manual `YYYY-MM-DD` typing and a custom calendar picker
- Mobile/iPad-safe due date picker without native `input type="date"`
- Task statistics summary

### Tech Stack

- **Next.js 16 App Router**: Full-stack React framework for pages, layouts, and API Routes
- **React 19**: UI library used by the App Router frontend
- **TypeScript**: Static typing for safer refactoring and clearer code
- **Tailwind CSS v4**: Utility-first styling for the TaskTracker interface
- **Prisma 7**: ORM for database schema and queries
- **Supabase PostgreSQL**: Hosted PostgreSQL database
- **Argon2**: Secure password hashing
- **Zod**: Runtime validation for auth and task inputs
- **JWT / jsonwebtoken**: Access token creation and verification
- **Resend**: Email delivery for verification emails
- **Playwright**: End-to-end testing
- **Vercel**: Deployment platform

### Security Highlights

- Passwords are hashed using Argon2 before storage.
- Users must verify their email before logging in.
- JWT access tokens are stored in `httpOnly` cookies.
- Refresh tokens are stored in `httpOnly` cookies.
- Only SHA-256 hashed refresh tokens are stored in the database.
- Logout revokes the active refresh token.
- Inactivity timeout protects against long idle sessions.
- Tokens are not exposed in JSON responses.
- Protected task APIs only return data owned by the authenticated user.

### Database Models

#### User

- `id`
- `email`
- `passwordHash`
- `fullName`
- `emailVerified`
- `createdAt`
- `updatedAt`

#### Task

- `id`
- `title`
- `description`
- `status`
- `priority`
- `createdById`
- `dueDate`
- `completedAt`
- `createdAt`
- `updatedAt`

#### EmailVerificationToken

- Stores email verification tokens for new accounts and resend flows.

#### RefreshToken

- Stores hashed refresh tokens and session metadata for refresh-token revocation.

#### Enums

- `TaskStatus`: `todo`, `in_progress`, `done`
- `TaskPriority`: `low`, `medium`, `high`

### API Routes

#### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/verify-email`
- `POST /api/auth/resend-verification`

#### Tasks

- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/[id]`
- `DELETE /api/tasks/[id]`

### Frontend Pages

- `/register`: Account registration page
- `/login`: Login page
- `/verify-email`: Email verification page
- `/tasks`: Protected task dashboard

### Environment Variables

Create `.env` from `.env.example` for local development.

Required variables:

- `DATABASE_URL`
- `DIRECT_URL`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `APP_URL`
- `JWT_SECRET`
- `ACCESS_TOKEN_EXPIRES_IN`
- `REFRESH_TOKEN_MAX_AGE_DAYS`
- `SESSION_INACTIVITY_TIMEOUT_MINUTES`

Notes:

- `.env` is for local secrets and must not be committed.
- `.env.example` is safe to commit as documentation for required variables.
- Vercel needs the production environment variables configured in the project dashboard.

### Getting Started

#### 1. Install dependencies

```bash
npm install
```

#### 2. Create your environment file

```bash
cp .env.example .env
```

Then fill in your local Supabase, JWT, and email settings.

#### 3. Generate Prisma Client

```bash
npx prisma generate
```

#### 4. Run database migrations

```bash
npx prisma migrate dev
```
For production migrations, use:

```bash
npx prisma migrate deploy
```

#### 5. Start the development server

```bash
npm run dev
```

Open:

- `http://localhost:3000/register`
- `http://localhost:3000/login`
- `http://localhost:3000/tasks`

### Testing

```bash
npm run lint
npm run build
npm run test:e2e
npm run test:e2e:headed
```

If this is your first Playwright run on the machine, install browsers first:

```bash
npx playwright install
```

### Deployment

TaskTracker is deployed on Vercel.

Deployment notes:

- Add all required production environment variables in Vercel.
- Connect the repository to a Vercel project.
- Push to the main branch to trigger redeployment.
- Run migrations against the production database before relying on new schema changes.

### Screenshots

![Login](./docs/screenshots/login.png)

![Register](./docs/screenshots/register.png)

![Tasks Dashboard](./docs/screenshots/dashboard.png)

### Future Improvements

- Team workspace
- Role-based permissions
- Task assignment
- Comments
- Task status history
- Pagination
- Advanced search
- Better mobile polish
- More E2E coverage

### Portfolio Notes

TaskTracker is a full-stack task management application built with Next.js, Prisma, Supabase, secure authentication, email verification, JWT access tokens, hashed refresh tokens, and Playwright E2E testing.

This project demonstrates practical full-stack development skills, including protected API design, database modeling, secure session handling, UI implementation, and end-to-end test coverage.

---

## ภาษาไทย

### ภาพรวมโปรเจกต์

TaskTracker คือเว็บแอปจัดการงานแบบ full-stack สำหรับผู้ใช้รายบุคคล พัฒนาด้วย Next.js App Router และออกแบบให้เป็นโปรเจกต์พอร์ตที่แสดงทักษะ full-stack อย่างครบถ้วน

ผู้ใช้สามารถสมัครสมาชิก ล็อกอิน ยืนยันอีเมล ใช้งานระบบ JWT access token และ refresh token รวมถึงสร้าง ดู แก้ไข ลบ และกรอง task ของตัวเองผ่าน dashboard ที่มีการป้องกันการเข้าถึง

โปรเจกต์นี้เน้นระบบ authentication ที่ปลอดภัย การจัดการ session การทำ task CRUD การค้นหาและกรองข้อมูล การดู task ผ่านปฏิทิน การเลือกวันครบกำหนดแบบ manual และ calendar picker รวมถึงการทดสอบด้วย Playwright E2E และออกแบบให้สามารถต่อยอดเป็นระบบทีมในอนาคตได้

### ฟีเจอร์

#### Authentication

- สมัครสมาชิก
- เข้าสู่ระบบ
- ออกจากระบบ
- กฎรหัสผ่านที่รัดกุม
- ยืนยันอีเมลก่อนเข้าสู่ระบบ
- ส่งอีเมลยืนยันซ้ำ
- Flow ยืนยันอีเมลแบบ production-safe ผ่าน `/verify-email#token=...`
- JWT access token หรือโทเคนระยะสั้นเก็บใน `httpOnly` cookie
- Refresh token แบบสุ่มเก็บใน `httpOnly` cookie
- Refresh token เก็บเป็น SHA-256 hash ในฐานข้อมูล
- ยกเลิก refresh token เมื่อ logout
- หมดอายุเมื่อไม่ใช้งานนานเกินกำหนดผ่าน `lastActiveAt`
- ตรวจสอบ session ปัจจุบันผ่าน `GET /api/auth/me`

#### Tasks

- สร้างงาน
- ดูรายการงานของผู้ใช้ที่ล็อกอินอยู่
- แก้ไขงาน
- ลบงาน
- เปลี่ยนสถานะงานเป็น done
- จัดการ `completedAt` อัตโนมัติ
- ค้นหางานจากชื่อ
- กรองงานตามสถานะ
- กรองงานตามความสำคัญ
- กรองงานผ่านปฏิทิน
- ใส่ due date ได้ทั้งแบบพิมพ์ `YYYY-MM-DD` และเลือกจาก calendar picker
- date picker ปลอดภัยต่อการใช้งานบน mobile/iPad โดยไม่ใช้ native `input type="date"`
- แสดงสถิติงาน

### Tech Stack

- **Next.js 16 App Router**: ใช้สำหรับหน้าเว็บ layout และ API Routes
- **React 19**: ใช้สร้าง UI ของฝั่ง frontend
- **TypeScript**: ช่วยให้โค้ดมี type ชัดเจนและ refactor ได้ปลอดภัยขึ้น
- **Tailwind CSS v4**: ใช้จัดการ UI และ theme ของโปรเจกต์
- **Prisma 7**: ORM สำหรับ schema และ query ฐานข้อมูล
- **Supabase PostgreSQL**: ฐานข้อมูล PostgreSQL แบบ hosted
- **Argon2**: ใช้ hash password ก่อนบันทึก
- **Zod**: ใช้ validate input ของ Authentication และ Task APIs
- **JWT / jsonwebtoken**: ใช้สร้างและตรวจสอบ access token
- **Resend**: ใช้ส่งอีเมลยืนยันตัวตน
- **Playwright**: ใช้ทดสอบ E2E
- **Vercel**: ใช้ deploy โปรเจกต์

### จุดเด่นด้านความปลอดภัย

- Password ถูก hash ด้วย Argon2 ก่อนบันทึกลงฐานข้อมูล
- ผู้ใช้ต้องยืนยันอีเมลก่อนเข้าสู่ระบบ
- JWT access token ถูกเก็บใน `httpOnly` cookie
- Refresh token ถูกเก็บใน `httpOnly` cookie
- ในฐานข้อมูลเก็บเฉพาะ refresh token ที่ผ่าน SHA-256 hash แล้ว
- เมื่อ logout ระบบจะ revoke refresh token
- มี inactivity timeout เพื่อลดความเสี่ยงจาก session ที่เปิดทิ้งไว้นาน
- Token ไม่ถูกส่งกลับใน JSON response
- Task APIs คืนข้อมูลเฉพาะ task ของผู้ใช้ที่ authenticated เท่านั้น

### โครงสร้างข้อมูลฐานข้อมูล

#### User

- `id`
- `email`
- `passwordHash`
- `fullName`
- `emailVerified`
- `createdAt`
- `updatedAt`

#### Task

- `id`
- `title`
- `description`
- `status`
- `priority`
- `createdById`
- `dueDate`
- `completedAt`
- `createdAt`
- `updatedAt`

#### EmailVerificationToken

- ใช้เก็บ token สำหรับยืนยันอีเมลและการส่งอีเมลยืนยันซ้ำ

#### RefreshToken

- ใช้เก็บ refresh token แบบ hash และข้อมูล session สำหรับการ revoke token

#### Enums

- `TaskStatus`: `todo`, `in_progress`, `done`
- `TaskPriority`: `low`, `medium`, `high`

### API Routes

#### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/verify-email`
- `POST /api/auth/resend-verification`

#### Tasks

- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/[id]`
- `DELETE /api/tasks/[id]`

### หน้าเว็บหลัก

- `/register`: หน้าสมัครสมาชิก
- `/login`: หน้าเข้าสู่ระบบ
- `/verify-email`: หน้ายืนยันอีเมล
- `/tasks`: หน้า dashboard สำหรับจัดการงาน

### Environment Variables

สร้างไฟล์ `.env` จาก `.env.example` สำหรับการพัฒนาในเครื่อง

ตัวแปรที่ต้องมี:

- `DATABASE_URL`
- `DIRECT_URL`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `APP_URL`
- `JWT_SECRET`
- `ACCESS_TOKEN_EXPIRES_IN`
- `REFRESH_TOKEN_MAX_AGE_DAYS`
- `SESSION_INACTIVITY_TIMEOUT_MINUTES`

หมายเหตุ:

- `.env` ใช้เก็บ secret สำหรับ local development และไม่ควร commit
- `.env.example` commit ได้ เพื่อบอกว่าต้องตั้งค่าตัวแปรอะไรบ้าง
- บน Vercel ต้องตั้งค่า production environment variables ให้ครบ

### การเริ่มต้นใช้งาน

#### 1. ติดตั้ง dependencies

```bash
npm install
```

#### 2. สร้างไฟล์ `.env`

```bash
cp .env.example .env
```

จากนั้นใส่ค่า Supabase, JWT และ email settings ของคุณ

#### 3. Generate Prisma Client

```bash
npx prisma generate
```

#### 4. รัน database migration

```bash
npx prisma migrate dev
```
สำหรับ production database ควรใช้:

```bash
npx prisma migrate deploy
```

#### 5. รัน development server

```bash
npm run dev
```

จากนั้นเปิด:

- `http://localhost:3000/register`
- `http://localhost:3000/login`
- `http://localhost:3000/tasks`

### การทดสอบ

```bash
npm run lint
npm run build
npm run test:e2e
npm run test:e2e:headed
```

ถ้ายังไม่เคยติดตั้ง browser สำหรับ Playwright บนเครื่องนี้:

```bash
npx playwright install
```

### การ Deploy

TaskTracker deploy บน Vercel

ข้อควรตั้งค่า:

- เพิ่ม production environment variables ให้ครบใน Vercel
- เชื่อม repository เข้ากับ Vercel project
- push ไปที่ main branch เพื่อ trigger redeployment
- รัน migration กับ production database เมื่อมี schema change

### Screenshots

![Login](./docs/screenshots/login.png)

![Register](./docs/screenshots/register.png)

![Tasks Dashboard](./docs/screenshots/dashboard.png)

### แนวทางต่อยอดในอนาคต

- Team workspace
- Role-based permissions
- Task assignment
- Comments
- Task status history
- Pagination
- Advanced search
- ปรับ mobile UX ให้ละเอียดขึ้น
- เพิ่ม E2E coverage

### หมายเหตุสำหรับ Portfolio

TaskTracker เป็นโปรเจกต์ full-stack task management ที่ใช้ Next.js, Prisma, Supabase, secure authentication, email verification, JWT access tokens, hashed refresh tokens และ Playwright E2E testing

โปรเจกต์นี้แสดงทักษะสำคัญ เช่น การออกแบบ API ที่มีการป้องกัน การออกแบบฐานข้อมูล การจัดการ session อย่างปลอดภัย การพัฒนา UI และการเขียน automated tests สำหรับ flow หลักของระบบ
