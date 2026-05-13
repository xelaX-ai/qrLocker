# Locker Admin — Система управления офисными локерами

Минималистичная система управления локерами с QR-кодами, Google OAuth и Supabase.

---

## Стек технологий

- **Next.js 14** (App Router)
- **Tailwind CSS**
- **Supabase** (PostgreSQL)
- **NextAuth.js** (Google OAuth)
- **Vercel** (деплой)

---

## Быстрый старт

### 1. Клонируйте репозиторий

```bash
git clone <repo-url>
cd locker-admin
npm install
```

### 2. Настройте Supabase

1. Создайте проект на [app.supabase.com](https://app.supabase.com)
2. Откройте **SQL Editor** и выполните файл `supabase/schema.sql`
3. Скопируйте `Project URL` и `service_role` ключ из Settings → API

### 3. Настройте Google OAuth

1. Перейдите на [console.cloud.google.com](https://console.cloud.google.com)
2. Создайте новый проект
3. APIs & Services → Credentials → **Create OAuth 2.0 Client ID**
4. Тип: **Web application**
5. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (разработка)
   - `https://your-app.vercel.app/api/auth/callback/google` (продакшен)

### 4. Создайте файл .env.local

```bash
cp .env.example .env.local
```

Заполните все значения в `.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=<openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
ALLOWED_EMAILS=your@email.com
```

### 5. Запустите локально

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

---

## Деплой на Vercel

1. Импортируйте репозиторий в [vercel.com](https://vercel.com)
2. Добавьте все переменные из `.env.example` в **Settings → Environment Variables**
3. Обновите `NEXT_PUBLIC_APP_URL` и `NEXTAUTH_URL` на адрес вашего Vercel-домена
4. Обновите Authorized redirect URI в Google Console на продакшен-адрес
5. Деплой произойдёт автоматически

---

## Структура проекта

```
locker-admin/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth handler
│   │   └── lockers/
│   │       ├── route.ts         # GET /api/lockers
│   │       └── [id]/
│   │           ├── route.ts     # GET / PATCH /api/lockers/[id]
│   │           └── qr/route.ts  # GET QR-код
│   ├── dashboard/               # Список всех локеров
│   ├── locker/[id]/             # Страница локера (открывается по QR)
│   ├── login/                   # Страница входа
│   └── access-denied/           # Страница отказа доступа
├── lib/
│   ├── auth.ts                  # Конфигурация NextAuth
│   ├── supabase.ts              # Клиент Supabase
│   └── qr.ts                    # Генерация QR-кодов
├── types/index.ts               # TypeScript типы
├── middleware.ts                # Защита маршрутов
└── supabase/schema.sql          # SQL-схема базы данных
```

---

## Логика QR-кодов

- Каждый локер имеет постоянный UUID (`id` в базе данных)
- QR-код кодирует URL вида: `https://your-app.vercel.app/locker/{uuid}`
- QR **никогда не меняется** — даже при смене владельца или статуса
- Сгенерированный QR можно скачать со страницы локера (только для администраторов)

---

## Безопасность

- Все маршруты кроме `/login` и `/access-denied` защищены middleware
- Вход только через Google OAuth
- Доступ только для email-адресов из `ALLOWED_EMAILS`
- API-роуты проверяют сессию на сервере
- Supabase RLS включён; серверный код использует service-role ключ
