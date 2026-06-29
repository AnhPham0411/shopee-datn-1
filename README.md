**English** · [Tiếng Việt](README.vi.md)

# Shopee Clone

> A full-stack e-commerce web application inspired by Shopee — built with React + TypeScript on the front end and an Express + MongoDB REST API on the back end.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-4-646CFF?logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%207-47A248?logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)

This repository contains two applications:

- **Front end** — a React 18 + TypeScript single-page app built with Vite, located at the project root (`src/`).
- **Back end** — an Express REST API written in TypeScript with Mongoose/MongoDB, located in `server/`.

---

## ✨ Features

Features below reflect modules that actually exist in the codebase (front-end pages/APIs and back-end routes/controllers).

- **Authentication & accounts** — sign up, sign in, sign out, forgot password, JWT access/refresh tokens, role-based access control, and account-lock handling.
- **Product catalog** — product list with search, sorting, filtering and pagination; product detail page with image hover-zoom, carousel and rich (WYSIWYG/HTML) descriptions.
- **Categories** — browse and filter products by category.
- **Shopping cart & purchases** — add to cart and full cart CRUD, purchase status tracking.
- **Checkout & orders** — order creation and order management, order status tracking.
- **Payment (simulated)** — a payment-confirmation/IPN-style endpoint that simulates a payment gateway callback (intended to be replaced by a real VNPay/Momo webhook in production).
- **Reviews & ratings** — product reviews tied to purchases.
- **Wishlist** — save/remove favorite products.
- **Vouchers & promotions** — discount vouchers and promotional campaigns.
- **Addresses** — manage user shipping addresses (with location lookup APIs).
- **User profile** — update profile info, upload avatar, change password.
- **Notifications** — user notifications.
- **Contact** — contact form / support messages.
- **Store** — store-related endpoints.
- **Admin panel** — administrative management endpoints and a dedicated admin area in the UI.
- **Internationalization (i18n)** — multilingual UI via i18next.
- **SEO** — dynamic document head management via React Helmet.
- **Component workshop** — Storybook for isolated component development.

---

## 🛠️ Tech Stack

### Front end
- **React 18** + **TypeScript**
- **Vite 4** (build tool & dev server)
- **Tailwind CSS 3** (+ `@tailwindcss/line-clamp`, `prettier-plugin-tailwindcss`)
- **React Router 6** (routing)
- **TanStack React Query 4** (server/async state) + React Context (local state)
- **React Hook Form 7** + **Yup** + `@hookform/resolvers` (forms & validation)
- **Axios** (HTTP client)
- **i18next** / **react-i18next** (internationalization)
- **React Helmet Async** (SEO / document head)
- **Framer Motion** (animations), **Swiper** (carousels), **Recharts** (charts)
- **Immer**, **Lodash**, **classnames**, **DOMPurify**, **html-to-text**, **React Toastify**
- **Storybook 7** (component development)
- **Vitest** (testing)
- **ESLint** + **Prettier**

### Back end
- **Node.js** + **Express 4** + **TypeScript**
- **MongoDB** via **Mongoose 7**
- **JSON Web Tokens** (`jsonwebtoken`) for auth
- **bcrypt** (password hashing)
- **Multer** (file/image uploads)
- **Helmet** (security headers), **CORS**, **express-rate-limit**
- **dotenv** (environment config)
- **ts-node** + **nodemon** (development)

---

## 🚀 Getting Started

This is a two-part project: the **front end** (project root) and the **back end** (`server/`) run as separate processes during development.

### Prerequisites
- **Node.js** (v18+ recommended)
- A package manager: **yarn**, **npm**, or **pnpm**
- **MongoDB** running locally (or a MongoDB connection string)

### 1. Clone the repository

```bash
git clone https://github.com/AnhPham0411/shopee-datn-1.git
cd shopee-datn-1
```

### 2. Back end (API)

```bash
cd server
npm install
# create server/.env (see Configuration below)
npm run dev      # starts the API with nodemon + ts-node
```

By default the API listens on the `PORT` from `server/.env` (falling back to `4000`) and connects to `MONGODB_URI` (falling back to `mongodb://localhost:27017/shopee-clone`).

> A `GET /health` endpoint is available for quick health checks.

### 3. Front end (SPA)

From the project root, in a separate terminal:

```bash
# yarn
yarn
# or npm
npm install
# or pnpm
pnpm install

# create .env (see Configuration below)
npm run dev      # starts Vite on http://localhost:3001
```

To expose the dev server to other devices on your network:

```bash
yarn dev --host
```

### 4. Build for production

```bash
# Front end (from project root)
npm run build      # tsc + vite build  → outputs to dist/
npm run preview    # preview the production build locally

# Back end (from server/)
npm run build      # tsc → outputs to server/dist/
npm start          # node dist/index.js
```

---

## ⚙️ Configuration

Environment variables are **not** committed. Create the files below and provide your own values. **Never commit real secrets.**

### Front end — `.env` (project root)
See `.env.example` for the template.

| Variable    | Description                                          |
| ----------- | ---------------------------------------------------- |
| `VITE_API`  | Base URL of the back-end API the SPA talks to.       |

### Back end — `server/.env`

| Variable             | Description                                                              |
| -------------------- | ------------------------------------------------------------------------ |
| `PORT`               | Port the API server listens on (defaults to `4000` if unset).            |
| `MONGODB_URI`        | MongoDB connection string (defaults to a local DB if unset).             |
| `JWT_SECRET`         | Secret used to sign access tokens.                                       |
| `JWT_REFRESH_SECRET` | Secret used to sign refresh tokens.                                      |
| `CLIENT_URL`         | (Optional) Front-end origin allowed by CORS (defaults to localhost).     |

> The server's CORS config also allows `http://localhost:3001`, `http://localhost:5173`, and `http://localhost:3000` for local development.

---

## 📁 Project Structure

```
shopee-at-home-main/
├── index.html              # Vite HTML entry
├── vite.config.ts          # Vite config (dev server on port 3001)
├── tailwind.config.cjs     # Tailwind config
├── tsconfig.json           # Front-end TypeScript config
├── .env.example            # Front-end env template
├── .storybook/             # Storybook configuration
├── public/                 # Static assets (logo, etc.)
├── src/                    # Front-end source
│   ├── main.tsx            # App bootstrap
│   ├── App.tsx             # Root component
│   ├── apis/               # Axios API clients (auth, product, cart, order, ...)
│   ├── assets/             # Images & static assets
│   ├── components/         # Reusable UI components
│   ├── constants/          # Enums & config (paths, status codes, ...)
│   ├── contexts/           # React Context providers
│   ├── hooks/              # Custom hooks
│   ├── i18n/               # Internationalization resources
│   ├── layouts/            # Page layouts
│   ├── pages/              # Route pages (Login, ProductList, Cart, Checkout, User, Admin, ...)
│   ├── routes/             # Route definitions (useRouteElements)
│   ├── schemas/            # Yup validation schemas
│   ├── stories/            # Storybook stories
│   ├── types/              # Shared TypeScript types
│   └── utils/              # Helpers
└── server/                 # Back-end source
    ├── tsconfig.json
    ├── package.json
    └── src/
        ├── index.ts        # Express app entry, route mounting, DB connect
        ├── controllers/    # Route handlers (auth, product, order, payment, ...)
        ├── models/         # Mongoose models (User, Product, Order, Purchase, ...)
        ├── routes/         # Express routers
        ├── middlewares/    # auth.middleware (requireAuth, requireRole)
        ├── utils/          # jwt helpers
        ├── seed.ts         # Database seeding
        ├── import_data.ts  # Data import
        └── export_data.ts  # Data export
```

---

## 📜 Available Scripts

### Front end (project root)

| Script                    | Description                                      |
| ------------------------- | ------------------------------------------------ |
| `npm run dev`             | Start the Vite dev server (port 3001).           |
| `npm run build`           | Type-check (`tsc`) and build for production.     |
| `npm run preview`         | Preview the production build locally.            |
| `npm run test`            | Run unit tests with Vitest.                      |
| `npm run coverage`        | Run tests with coverage report.                  |
| `npm run lint`            | Lint `src/` with ESLint.                         |
| `npm run lint:fix`        | Lint and auto-fix.                               |
| `npm run prettier`        | Check formatting.                                |
| `npm run prettier:fix`    | Auto-format.                                     |
| `npm run storybook`       | Start Storybook on port 6006.                    |
| `npm run build-storybook` | Build a static Storybook.                        |

### Back end (`server/`)

| Script            | Description                                            |
| ----------------- | ------------------------------------------------------ |
| `npm run dev`     | Start the API in watch mode (nodemon + ts-node).       |
| `npm run build`   | Compile TypeScript to `dist/`.                         |
| `npm start`       | Run the compiled server (`node dist/index.js`).        |

---

## 🤝 Contributing

Contributions are welcome. To contribute:

1. Fork the repository and create a feature branch.
2. Follow the existing code style — run `npm run lint` and `npm run prettier` before committing.
3. Open a pull request describing your changes.

---

## 📄 License

This project is intended for educational/portfolio purposes (a graduation project). No explicit license file is included in the repository; if you plan to reuse it, please contact the author. MIT is suggested as the default.

---

<p align="center">Made with ❤️ as a graduation project — a Shopee-inspired e-commerce app.</p>
