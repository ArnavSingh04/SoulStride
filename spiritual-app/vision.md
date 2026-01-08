# Soul Stride — Product Vision

## 1. Product Vision

Soul Stride is a **mobile-first, web-accessible spiritual learning platform** designed to help users engage in **daily spiritual practice**, understand holy texts deeply, and build **long-term, consistent spiritual habits**.

The platform combines **structured learning journeys**, **routine tracking**, **prayer and verse access**, and an **AI-guided spiritual assistant** to bridge the gap between belief and daily action.

### Core Value Proposition

- Make spiritual learning **bite-sized, consistent, and engaging**, similar to *Duolingo for holy books*.
- Support **multiple religions and languages** through a unified, extensible content model.
- Encourage **daily practice** using streaks, reminders, routines, and progress tracking.
- Ground AI guidance strictly in **verified holy book sources**, not generic advice.

---

## 2. Target Users

Soul Stride is built for:

- Individuals seeking **daily spiritual learning and reflection**.
- Users familiar with holy books who want a **guided, structured, and interactive** learning experience.
- People interested in **tracking routines, prayers, and lessons** to build discipline and consistency.
- Learners who value **contextual explanations** rather than surface-level reading.

---

## 3. MVP Features

| Feature                                | Description                                                                                                                  | Priority |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------- |
| **Spiritual Journey Mode**       | Short, curated lessons from holy books with text, audio, and quizzes. Progress tracked using streaks and completion metrics. | High     |
| **Routine Builder**              | Users create daily spiritual routines, schedule reminders, and track completion.                                             | High     |
| **Prayer / Verse Database**      | Searchable repository of prayers, bhajans, and verses with translations and audio recitations.                               | High     |
| **AI Guide**                     | LLM-powered Q&A grounded in verified holy book content, returning cited verses and translations.                             | Medium   |
| **User Accounts & Auth**         | Email/OTP/social login. Stores user preferences, streaks, and selected religion/language.                                    | High     |
| **Streak & Daily Goal Tracking** | Visualize consistency and reinforce habit formation.                                                                         | High     |
| **Notifications & Reminders**    | Push notifications for routines, lessons, and streak maintenance.                                                            | High     |
| **Basic Admin Panel**            | Manage lessons, routines, prayer content, and moderate AI responses.                                                         | Medium   |

---

## 4. Core App Sections / Pages

### Mobile & Web Sections

- **Home / Dashboard**Daily lessons, progress overview, streaks, and recommended routines.
- **Spiritual Journey / Lessons**Structured lessons with quizzes, audio, and a “start lesson” flow.
- **Routine Builder**Create, edit, and schedule daily spiritual routines.
- **Prayers / Verses Library**Searchable content with translations, audio, tags, and favorites.
- **AI Guide / Ask**Ask spiritual questions and receive source-backed explanations.
- **Profile / Settings**Manage preferences such as religion, language, notifications, and daily goals.
- **Admin Panel (Web)**
  Manage lesson content, prayer databases, and AI moderation.

---

## 5. MVP Tech Stack

| Layer                             | Technology                                          | Notes                                    |
| --------------------------------- | --------------------------------------------------- | ---------------------------------------- |
| **Frontend (Web & Mobile)** | React + Next.js (Web), React Native + Expo (Mobile) | TypeScript, shared hooks and API logic   |
| **Backend / API**           | Node.js + NestJS                                    | Modular REST APIs, scalable architecture |
| **Database**                | PostgreSQL (Supabase)                               | Users, lessons, routines, progress       |
| **Vector DB / Embeddings**  | Supabase Vector / Pinecone                          | Retrieval-augmented generation (RAG)     |
| **AI / LLM**                | OpenAI API (or equivalent)                          | Server-side RAG pipeline with citations  |
| **Storage / Media**         | Supabase Storage / S3                               | Audio, images, lesson assets             |
| **Notifications**           | FCM / Expo Push Notifications                       | Routine and streak reminders             |
| **Analytics & Logging**     | Firebase Analytics, Sentry                          | Engagement tracking and error monitoring |
| **CI/CD**                   | GitHub Actions, EAS Build, Vercel                   | Automated builds and deployments         |

---

## 6. MVP Scope & Priorities

### Phase 1 — Core MVP (Weeks 0–6)

- User registration and authentication
- Spiritual Journey lessons (text + audio)
- Routine builder with reminders
- Prayer / verse search with translations
- Streak tracking and daily goals
- Mobile preview via Expo
- Basic admin panel for lesson and prayer management

### Phase 2 — Enhanced Features (Weeks 6–10)

- AI Guide (LLM integration with RAG)
- Multi-language support
- Push notification fine-tuning
- Web portal for content management
- Analytics and error reporting

---

## 7. Development Principles

- **Shared codebase** between web and mobile for business logic and data models.
- **Modular backend design** for easy feature expansion (AI, lessons, routines).
- **Platform-agnostic UI** wherever possible, with minimal platform-specific divergence.
- **Test-driven mindset**: unit tests for backend, component tests for frontend.
- Focus on **scalability, maintainability, and industry-standard practices**.

---

## 8. Deliverables

- Mobile application (iOS & Android) via React Native + Expo
- Web MVP for lessons, prayer database, and AI guide
- Backend API (NestJS) with PostgreSQL and Vector DB
- Admin panel for content management and moderation
- CI/CD pipeline for automated web and mobile builds
- Basic analytics and error logging

---

## 9. Feature Implementation Overview

### 9.1 User Authentication & Profile

**Goal:** Enable users to create accounts, track progress, and save routines.

- Email/password authentication (optional social login)
- User profile: name, avatar, preferred texts, language
- Secure storage of preferences, progress, and streaks

---

### 9.2 Home / Dashboard

**Goal:** Provide a clear daily overview and motivation.

- Daily lesson card
- Streak tracker and encouragement messages
- Upcoming routines
- “Continue lesson” and “Start routine” actions

---

### 9.3 Spiritual Journey / Lessons

**Goal:** Deliver structured, gamified learning.

- Lesson data model: text, audio, quizzes
- Lesson navigation and completion tracking
- Quiz scoring and feedback
- Optional badges and milestones

---

### 9.4 Routine Builder

**Goal:** Enable consistent spiritual practice.

- CRUD routines
- Add lessons, prayers, or verses to routines
- Schedule daily routines
- Push notifications and dashboard integration

---

### 9.5 Prayers / Verses Library

**Goal:** Provide searchable reference and practice material.

- Multilingual prayers and verses
- Audio playback
- Search by keyword, theme, or category
- Favorites and routine integration

---

### 9.6 Gamification & Progress

**Goal:** Reinforce consistency and motivation.

- Daily streak tracking
- Completion milestones and badges
- Visual progress indicators
- Optional leaderboards

---

### 9.7 Notifications & Reminders

**Goal:** Maintain engagement without overload.

- Daily lesson reminders
- Routine notifications
- Streak protection alerts
- User-controlled frequency and timing

---

### 9.8 Settings & Customization

**Goal:** Personalize the experience.

- Notification preferences
- Language and audio settings
- Profile editing
- Routine and streak management
