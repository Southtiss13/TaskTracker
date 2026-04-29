# TaskTracker

TaskTracker is a full-stack task management web application built for individual users. It provides custom Authentication, protected task management, task CRUD, search, filtering, calendar-based task filtering, task statistics, and Playwright E2E coverage in a clean Next.js App Router codebase that can be extended into a team collaboration product later.

- [English](#english)
- [ภาษาไทย](#ภาษาไทย)

---

## English

### Project Overview

TaskTracker is an MVP task management system for personal productivity. Users can create an account, sign in, sign out, and manage only their own tasks through protected API Routes and a protected dashboard.

The current MVP includes task CRUD, status and priority filters, text search, calendar-based task filtering, task summary statistics, and Playwright end-to-end tests for the main Authentication and task flows.

The project is intentionally structured so it can grow into a larger collaboration app in the future, while keeping the current code readable for reviewers, junior developers, and recruiters.

### Features

- Register with full name, email, and password
- Login with custom Authentication
- Logout with cookie cleanup
- Protected task dashboard at `/tasks`
- Create task
- View tasks
- Update task
- Delete task
- Filter by status
- Filter by priority
- Search tasks by title
- Calendar-based task filtering
- Task statistics summary
- Playwright E2E tests for Authentication and Task CRUD

### Tech Stack

- **Next.js 16 App Router**: Full-stack React framework used for pages, layouts, and API Routes
- **TypeScript**: Static typing for safer refactoring and clearer code structure
- **Tailwind CSS v4**: Utility-first styling for the current TaskTracker UI theme
- **Prisma 7**: ORM used to model and access application data
- **Supabase PostgreSQL**: Hosted PostgreSQL database used by Prisma
- **Argon2**: Password hashing for secure credential storage
- **Zod**: Input validation for Authentication and task APIs
- **Playwright**: End-to-end testing for the main user flows

### Authentication

- Custom Authentication using a server-set `httpOnly` cookie
- Login stores a `userId` cookie
- Logout clears the cookie
- `GET /api/auth/me` is used to restore the current session on the client
- Protected task APIs only return data for the authenticated user

### Database Models

#### User

- `id`
- `email`
- `passwordHash`
- `fullName`
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

#### Enums

- `TaskStatus`: `todo`, `in_progress`, `done`
- `TaskPriority`: `low`, `medium`, `high`

#### Relationship

- One `User` can have many `Task` records
- Each `Task` belongs to one `User` through `createdById`

### API Routes

#### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

#### Tasks

- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/[id]`
- `DELETE /api/tasks/[id]`

### Frontend Pages

- `/register`: Account registration page
- `/login`: Login page
- `/tasks`: Protected task dashboard

### Testing

Playwright E2E tests currently cover:

- Register -> Login -> Tasks -> Logout flow
- Task create -> update -> delete flow

Test files:

- `tests/auth.spec.ts`
- `tests/tasks.spec.ts`

### Project Structure

Only the main folders that currently exist in this repository are listed below.

```text
app/
  api/
    auth/
    tasks/
  login/
  register/
  tasks/

prisma/
  schema.prisma

src/
  components/
    tasks/
  lib/
    validations/

public/
tests/
```

#### Folder Notes

- `app/`: App Router pages, layout, and route handlers
- `app/api/`: Authentication and task API Routes
- `prisma/`: Prisma schema for database models and enums
- `src/components/tasks/`: Reusable UI components for the task dashboard
- `src/lib/`: Prisma client setup, password helpers, and Zod validation schemas
- `public/`: Static assets
- `tests/`: Playwright E2E tests

### Getting Started

#### 1. Install dependencies

```bash
npm install
```

#### 2. Create your environment file

Create `.env` from `.env.example`.

```bash
cp .env.example .env
```

Required variables in `.env.example`:

- `DATABASE_URL`
- `DIRECT_URL`

Use your own Supabase PostgreSQL connection values.

#### 3. Generate Prisma Client

```bash
npx prisma generate
```

#### 4. Run database migrations

```bash
npx prisma migrate dev

#### 5. Start the development server

```bash
npm run dev
```

Then open:

- `http://localhost:3000/register`
- `http://localhost:3000/login`
- `http://localhost:3000/tasks`

### Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test:e2e
npm run test:e2e:headed
```

### Running E2E Tests

If this is your first Playwright run on the machine, install browsers first:

```bash
npx playwright install
```

Then run:

```bash
npm run test:e2e
```

### Screenshot Placeholders

- `public/screenshots/register-page.png`
- `public/screenshots/login-page.png`
- `public/screenshots/tasks-dashboard.png`

### Future Extension Ideas

- Session/JWT token hardening
- Email verification
- Forgot password flow
- Team workspaces
- Role-based access control
- Task assignment
- Shared tasks
- Comments
- Task status history
- Pagination
- Deployment polish

### Portfolio Note

This project demonstrates practical full-stack development skills, including:

- Full-stack application development with Next.js
- Database schema design with Prisma and PostgreSQL
- Custom authentication flow
- Secure password hashing
- API route development
- Protected user-specific data access
- UI/UX implementation
- End-to-end testing with Playwright

## ภาษาไทย

### ภาพรวมโปรเจกต์

TaskTracker คือเว็บแอปจัดการงานแบบ full-stack สำหรับผู้ใช้รายบุคคล พัฒนาด้วย Next.js App Router โดยผู้ใช้สามารถสมัครสมาชิก เข้าสู่ระบบ ออกจากระบบ และจัดการงานของตัวเองผ่านหน้า dashboard ที่มีการป้องกันการเข้าถึง

MVP เวอร์ชันปัจจุบันรองรับการสร้าง แก้ไข ลบ และดูงาน รวมถึงการค้นหา การกรองตามสถานะและความสำคัญ การกรองผ่านปฏิทิน การแสดงสถิติงาน และมี Playwright E2E tests สำหรับ flow หลักของระบบ

โครงสร้างโปรเจกต์ออกแบบให้ต่อยอดไปเป็นระบบ collaboration หรือ team task management ได้ในอนาคต โดยยังคงอ่านง่ายและเหมาะสำหรับการ review โค้ด

### ฟีเจอร์หลัก

- สมัครสมาชิก
- เข้าสู่ระบบ
- ออกจากระบบ
- หน้า task dashboard ที่ป้องกันการเข้าถึง
- สร้างงาน
- ดูรายการงาน
- แก้ไขงาน
- ลบงาน
- กรองตามสถานะ
- กรองตามความสำคัญ
- ค้นหางานจากชื่อ
- กรองงานผ่านปฏิทิน
- แสดงสถิติงาน
- มี Playwright E2E tests

### Tech Stack

- **Next.js 16 App Router**: ใช้สำหรับหน้าเว็บ layout และ API Routes
- **TypeScript**: ช่วยให้โค้ดมี type ชัดเจนและ refactor ได้ปลอดภัยขึ้น
- **Tailwind CSS v4**: ใช้สำหรับจัดการ UI และ theme ของโปรเจกต์
- **Prisma 7**: ORM สำหรับเชื่อมต่อและจัดการข้อมูล
- **Supabase PostgreSQL**: ฐานข้อมูล PostgreSQL ที่ใช้เก็บข้อมูลจริง
- **Argon2**: ใช้ hash password ก่อนบันทึกลงฐานข้อมูล
- **Zod**: ใช้ validate input ของ Authentication และ Task APIs
- **Playwright**: ใช้สำหรับทดสอบ E2E

### ระบบ Authentication

- เป็น Custom Authentication
- ใช้ `httpOnly` cookie จากฝั่ง server
- หลัง login ระบบจะเก็บ `userId` ไว้ใน cookie
- หลัง logout ระบบจะลบ cookie
- `GET /api/auth/me` ใช้ตรวจสอบ session ปัจจุบัน
- Task APIs จะคืนข้อมูลเฉพาะของผู้ใช้ที่ login อยู่เท่านั้น

### โครงสร้างข้อมูลฐานข้อมูล

#### User

- `id`
- `email`
- `passwordHash`
- `fullName`
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

#### Enum

- `TaskStatus`: `todo`, `in_progress`, `done`
- `TaskPriority`: `low`, `medium`, `high`

#### ความสัมพันธ์

- ผู้ใช้ 1 คนสามารถมีงานได้หลายรายการ
- งานแต่ละรายการจะเป็นของผู้ใช้ 1 คนผ่าน `createdById`

### API Routes

#### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

#### Tasks

- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/[id]`
- `DELETE /api/tasks/[id]`

### หน้าเว็บหลัก

- `/register`: หน้าสมัครสมาชิก
- `/login`: หน้าเข้าสู่ระบบ
- `/tasks`: หน้า dashboard สำหรับจัดการงาน

### โครงสร้างโปรเจกต์

โฟลเดอร์สำคัญที่มีอยู่จริงใน repository นี้:

```text
app/
prisma/
src/
public/
tests/
```

รายละเอียดโดยย่อ:

- `app/`: หน้าเว็บและ API Routes
- `app/api/`: route ของ Authentication และ Task CRUD
- `prisma/`: schema ของฐานข้อมูล
- `src/components/tasks/`: component ของหน้า tasks
- `src/lib/`: Prisma client, helper และ Zod validations
- `public/`: static assets
- `tests/`: Playwright E2E tests

### การเริ่มต้นใช้งาน

#### 1. ติดตั้ง dependencies

```bash
npm install
```

#### 2. สร้างไฟล์ `.env`

คัดลอกจาก `.env.example`

```bash
cp .env.example .env
```

ตัวแปรที่ต้องมี:

- `DATABASE_URL`
- `DIRECT_URL`

ให้ใส่ค่าการเชื่อมต่อฐานข้อมูลของคุณเอง

#### 3. Generate Prisma Client

```bash
npx prisma generate
```

#### 4. รัน database migration

```bash
npx prisma migrate dev

#### 5. รันโปรเจกต์

```bash
npm run dev
```

จากนั้นเปิด:

- `http://localhost:3000/register`
- `http://localhost:3000/login`
- `http://localhost:3000/tasks`

### คำสั่งที่ใช้บ่อย

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test:e2e
npm run test:e2e:headed
```

### การรัน E2E Tests

หากยังไม่เคยรัน Playwright บนเครื่องนี้มาก่อน:

```bash
npx playwright install
```

จากนั้นรัน:

```bash
npm run test:e2e
```

### Placeholder สำหรับ Screenshots

- `public/screenshots/register-page.png`
- `public/screenshots/login-page.png`
- `public/screenshots/tasks-dashboard.png`

### แนวทางต่อยอดในอนาคต

- ปรับระบบ session/JWT token ให้ปลอดภัยขึ้น
- Email verification
- Forgot password
- ระบบทีม / workspace
- สิทธิ์การเข้าถึงตามบทบาท
- การ assign task ให้สมาชิก
- งานที่แชร์ร่วมกัน
- คอมเมนต์
- ประวัติการเปลี่ยนสถานะของ task
- Pagination
- ปรับแต่งระบบก่อน deploy production

### หมายเหตุสำหรับ Portfolio

โปรเจ็กต์นี้แสดงทักษะสำคัญสำหรับงาน Junior Web Developer เช่น:

- การพัฒนาเว็บแบบ Full-stack ด้วย Next.js
- การออกแบบฐานข้อมูลด้วย Prisma และ PostgreSQL
- การทำระบบ Authentication เอง
- การ hash password อย่างปลอดภัย
- การพัฒนา API Routes
- การป้องกันข้อมูลให้ผู้ใช้เห็นเฉพาะ task ของตัวเอง
- การออกแบบ UI/UX
- การทดสอบระบบด้วย Playwright E2E tests