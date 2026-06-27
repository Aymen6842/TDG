<p align="center">
  <a href="http://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
  </a>
</p>

<p align="center">
  A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.
</p>

<p align="center">
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
  <a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
  <a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
  <a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
  <a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>

---

# 🧱 Project Overview

This repository contains a **NestJS application** built in **TypeScript** with a clean, modular, and scalable architecture.

It is organized into well-structured folders for:

- Modular apps (each app has its own controllers, services, repositories, and DTOs)
- Common shared services and utilities
- Prisma ORM for database management
- Docker for local and production environments

---

# 🧩 Architecture Overview

This project follows a **modular and scalable structure** designed for maintainability, consistency, and clear separation of concerns.

---

## 🧠 common/

Contains reusable **services, utilities, and helpers** shared across all applications.

### Main Components

- **PrismaService** → Manages database connections and transactions.
- **RedisService** → Provides caching mechanisms and Pub/Sub functionality.
- **SlugifyService** → Handles clean and consistent string slug generation.
- **TimeService** → Centralized date and time management utilities.
- **BcryptService** → Responsible for hashing and password encryption.
- **Validation**, **Upload**, **Pipes**, **Filters**, **Exceptions**, **Types** → Shared helpers for validation, file handling, exception filtering, and type definitions.

---

## 🧱 app-name/

Each app (for example: `logs`, `users`, `products`, etc.) follows the same **internal architecture** to ensure consistency and modular development.

# 🗂️ Folder Structure

```bash
├── Dockerfile
├── .env # Environment configuration (excluded from Git)
├── prisma/
│ ├── main.schema.prisma # Prisma schema definition
│ ├── user.schema.prisma # Prisma schema definition
│ ├── address.schema.prisma # Prisma schema definition
│ ├── migrations/ # Auto-generated SQL migration files
├── src/
│ ├── main.ts # Application entry point
│ ├── common/ # Shared logic used across all apps
│ │ ├── prisma/
│ │ │ ├── service
| | | |  ├── prisma.service.ts
| | | |  ├── prisma.service.spec.ts
│ │ │ ├── prisma.module.ts
│ │ ├── time/
│ │ ├── mail/
│ │ ├── validation/
│ │ ├── upload/
│ │ ├── pipes/
│ │ ├── exceptions/
│ │ ├── filters/
│ │ └── types/
│ ├── users/
│ │ │ ├── controllers/
│ │ │ │ ├── users.controller.ts
│ │ │ │ └── users.controller.spec.ts
│ │ │ ├── services/
│ │ │ │ ├── users.service.ts
│ │ │ │ └── users.service.spec.ts
│ │ │ ├── repositories/
│ │ │ │ └── create-user.repository.ts
│ │ │ ├── dto/
│ │ │ │ ├── request/
│ │ │ │ └── response/
│ │ │ │ │  ├── website/
│ │ │ │ │  ├── dashboard/
│ │ │ ├── swagger-documentation/
│ │ │ │ └── error-response.ts
│ │ │ └── types/
│ │ │ │ └── users.type.ts
│ │ │ │ └── requests.type.ts
│ │ └── ... # Other apps (users, products, orders, etc.)
│ ├── app.module.ts
├── package.json
```

---

## 🧩 The app structure

To maintain consistency across all data transfer objects (DTOs), the following naming conventions are used:

- **controllers/**
  Handle **incoming HTTP requests** and outgoing responses. Includes unit tests for endpoint behavior.

- **services/**
  Contain the **core business logic** of the application. Includes unit tests to ensure correctness.

- **repositories/**
  Encapsulate all **database queries** using Prisma, keeping data access separate from business logic.

- **types/**
  Store **TypeScript interfaces and helper types** used across the app to maintain type safety.

- **swagger-documentation/**
  Define **predefined Swagger schemas** for error responses and API documentation.

- **dto/**
  Organize **request validation** and **response shaping**. Includes separate folders for dashboard and website responses.

---

# ⚙️ Environment Configuration

The `.env` file (excluded from Git) defines environment variables for database, API, authentication, and third-party services.

```env
# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5434/database_name?schema=public"

# Backend and Frontend URLs
API_ADDRESS="http://localhost:3000"
FRONTEND_ADDRESS="http://localhost:3000"

# JWT Secret Key
SECRET_KEY="secret-key-used"

# Email Configuration
MAIL_HOST="webmail.oxa.host"
MAIL_USER="mail"
MAIL_PASS="password"

# Redis Configuration
REDIS_URL="redis://default:password@domain:6379"

# Google OAuth Configuration
GOOGLE_TOKEN_ENDPOINT="https:/com/token"
GOOGLE_USER_INFO_ENDPOINT="https://www.googleapis.com/oauth2/v3/userinfo"
GOOGLE_CLIENT_ID="client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET=""
GOOGLE_REDIRECT_URI="http://:3000/google-auth"

# Facebook OAuth Configuration
FACEBOOK_TOKEN_ENDPOINT=""
FACEBOOK_USER_INFO_ENDPOINT=""
FACEBOOK_APP_ID=""
FACEBOOK_APP_SECRET=""
FACEBOOK_REDIRECT_URI=""

# Company Information
COMPANY_NAME="La Porta di Roma"
COMPANY_LOGO="./images/logos/laporta-di-roma.png"

# File Storage
IMAGES_STORAGE_PATH="./images"

# Token Expiration
ACCESS_TOKEN_EXPIRATION="1200d"
REFRESH_TOKEN_EXPIRATION="1200d"
```

> 🧠 _This architecture ensures high scalability, easy testing, and clean separation of concerns across all project components._

## 🚀 Project Initialization

Follow these steps to get the project up and running locally:

1. **Install Dependencies**

```bash
npm install
```

2. **Set Up Environment Variables**
   Create a `.env` file in the root directory and configure the necessary environment variables as shown above.

3. **Run Database Migrations**

```bash
npm run prisma:migrate # To apply migrations
npm run prisma:generate # To generate Prisma client
```

4. **Start the Application**

```bash
npm run start:dev
```

5. **Access the Application**
   The application will be running at `http://localhost:3000`.
   Access the Swagger API documentation at `http://localhost:3000/api`.

---

## 🛠 Git Workflow Rules

To maintain a clean, consistent, and collaborative development process, follow these rules:

- Every new feature must be developed in its **own branch**.
  **Branch naming convention:** `feature-name-branch`
  Example: `voucher-codes-branch`

- You **cannot push directly** to `main` or `pre-prod` branches.
  You also **cannot manage or modify** branches that are not assigned to you.

- Each feature must have **clear, descriptive commits** explaining what was done.
  Example: `Add voucher code generation endpoint and validations`

- When a feature is complete, **open a pull request** to merge it into `pre-prod`.
  Merge only after **code review and approval**.

- You will have a **user in the pre-production database**.
  Always **migrate your development database** after changes, and make sure migrations are applied in pre-prod before deployment.

- 🔄 **Daily routine rule:**
  - Every morning: **Pull** your branch to get the latest updates.
  - Every evening: **Push** your work to ensure your progress is saved and visible to the team.

---

## 🧩 Notes

- You will have a user in the database in the preproduction environment, keep in mind that you need to migrate everything after making changes in your development database and before the deployment.
- Ensure that you have the latest version of Node.js and npm installed.
- Use a tool like Postman to test your API endpoints.
- Consider using Docker for easier environment management.
- Regularly update your dependencies to keep the project secure.
