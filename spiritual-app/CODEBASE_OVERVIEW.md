# SoulStride Spiritual App - Complete Codebase Overview

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Data Flow](#data-flow)
5. [Database Schema](#database-schema)
6. [Key Features](#key-features)
7. [Components & Screens](#components--screens)
8. [Services & Utilities](#services--utilities)
9. [Build & Deployment](#build--deployment)

---

## 🏗️ Architecture Overview

**SoulStride** is a React Native mobile application built with **Expo** that helps users read and manage spiritual prayers and texts. The app follows a **client-server architecture** with:

- **Frontend**: React Native + Expo (iOS, Android, Web)
- **Backend**: Supabase (PostgreSQL database + API)
- **Storage**: AsyncStorage (local device storage for user preferences)
- **Routing**: Expo Router (file-based routing)

### Architecture Pattern
```
┌─────────────────────────────────────────┐
│         React Native App                │
│  (Expo Router + React Components)       │
└──────────────┬──────────────────────────┘
               │
               │ HTTP/HTTPS
               │
┌──────────────▼──────────────────────────┐
│         Supabase API                    │
│  (PostgreSQL + Row Level Security)      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      PostgreSQL Database                │
│  (holy_books, prayers, prayer_lines,    │
│   bani_lines tables)                    │
└─────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Core Framework
- **React Native 0.81.5** - Mobile app framework
- **Expo ~54.0.25** - Development platform and tooling
- **Expo Router ~6.0.15** - File-based routing system
- **TypeScript 5.9.2** - Type safety

### Database & Backend
- **Supabase** - PostgreSQL database + API
- **@supabase/supabase-js** - JavaScript client library

### UI & Styling
- **React Navigation** - Navigation library
- **Expo Linear Gradient** - Gradient components
- **React Native Reanimated** - Animations
- **Expo Vector Icons** - Icon library

### Storage
- **@react-native-async-storage/async-storage** - Local key-value storage

### Notifications
- **expo-notifications** - Push notifications

### Development Tools
- **ESLint** - Code linting
- **tsx** - TypeScript execution
- **EAS CLI** - Build and deployment

---

## 📁 Project Structure

```
spiritual-app/
├── app/                          # Expo Router pages (file-based routing)
│   ├── _layout.tsx               # Root layout with theme provider
│   └── (tabs)/                   # Tab navigation group
│       ├── _layout.tsx           # Tab bar configuration
│       ├── index.tsx             # Home screen
│       ├── journey.tsx           # Journey screen
│       ├── routine.tsx           # Prayer routine management
│       ├── prayers.tsx           # Prayers list screen
│       ├── profile.tsx           # User profile
│       └── guide.tsx             # Guide screen
│
├── components/                   # Reusable React components
│   ├── prayer-list.tsx           # Prayer list with search
│   ├── guru-granth-sahib-reader.tsx  # GGS page reader
│   ├── routine-edit-modal.tsx    # Routine editing modal
│   ├── reminder-settings.tsx    # Notification settings
│   ├── themed-text.tsx           # Themed text component
│   ├── themed-view.tsx           # Themed view component
│   └── ui/                       # UI components (icons, etc.)
│
├── lib/                          # Core libraries & services
│   ├── supabase.ts               # Supabase client initialization
│   ├── supabase-schema.sql       # Database schema definition
│   ├── database.service.ts       # Database query functions
│   └── database.types.ts         # TypeScript type definitions
│
├── services/                     # Business logic services
│   ├── routine-storage.ts        # Routine config & completion storage
│   └── notifications.ts          # Push notification scheduling
│
├── data/                         # Data access layer
│   └── prayers.ts                # Prayer data API (re-exports DB service)
│
├── types/                        # TypeScript type definitions
│   └── routine.ts                # Routine-related types
│
├── hooks/                        # Custom React hooks
│   ├── use-color-scheme.ts       # Theme detection hook
│   └── use-theme-color.ts        # Theme color hook
│
├── constants/                    # App constants
│   └── theme.ts                  # Color themes (light/dark)
│
├── scripts/                      # Utility scripts
│   ├── migrate-prayers-json.ts   # Import prayers from JSON
│   ├── migrate-ggs.ts            # Import Guru Granth Sahib
│   ├── test-connection.ts        # Test DB connection
│   └── create-tables.ts          # Create database tables
│
├── assets/                       # Static assets
│   └── images/                   # Images, icons, splash screens
│
├── app.json                      # Expo configuration
├── package.json                  # Dependencies & scripts
├── eas.json                      # EAS Build configuration
└── tsconfig.json                 # TypeScript configuration
```

---

## 🔄 Data Flow

### 1. **App Initialization**
```
App Start → Root Layout (_layout.tsx)
         → Tab Layout ((tabs)/_layout.tsx)
         → Screen Components
```

### 2. **Prayer Data Flow**
```
Component (e.g., PrayerList)
    ↓
data/prayers.ts (API layer)
    ↓
lib/database.service.ts (Service layer)
    ↓
lib/supabase.ts (Client)
    ↓
Supabase API
    ↓
PostgreSQL Database
```

### 3. **Routine Data Flow**
```
Component (routine.tsx)
    ↓
services/routine-storage.ts
    ↓
AsyncStorage (Local Device)
    ↓
User's Device Storage
```

### 4. **Notification Flow**
```
User Sets Reminder
    ↓
services/notifications.ts
    ↓
expo-notifications
    ↓
Device Notification System
```

---

## 🗄️ Database Schema

### Tables Overview

#### 1. **holy_books**
Stores information about different holy books (Guru Granth Sahib, Dasham Granth, etc.)
```sql
- id (VARCHAR) - Primary key
- name (VARCHAR) - English name
- name_punjabi (VARCHAR) - Punjabi name
- name_hindi (VARCHAR) - Hindi name
- description (TEXT) - Description
- total_pages (INTEGER) - Total pages
```

#### 2. **prayers**
Stores prayer/bani metadata
```sql
- id (VARCHAR) - Primary key
- holy_book_id (VARCHAR) - Foreign key to holy_books
- name (VARCHAR) - English name
- name_punjabi (VARCHAR) - Punjabi name
- name_hindi (VARCHAR) - Hindi name
- description (TEXT) - Description
- type (VARCHAR) - Prayer type
- time_of_day (VARCHAR) - When to recite
```

#### 3. **prayer_lines**
Stores individual lines of prayers with multilingual support
```sql
- id (BIGSERIAL) - Primary key
- prayer_id (VARCHAR) - Foreign key to prayers
- holy_book_id (VARCHAR) - Foreign key to holy_books
- line_order (INTEGER) - Order within prayer
- punjabi (TEXT) - Punjabi text
- english (TEXT) - English translation
- hindi (TEXT) - Hindi translation
- transliteration_english (TEXT) - English transliteration
- transliteration_hindi (TEXT) - Hindi transliteration
```

#### 4. **bani_lines**
Stores lines from holy books (e.g., Guru Granth Sahib pages)
```sql
- id (BIGSERIAL) - Primary key
- holy_book_id (VARCHAR) - Foreign key to holy_books
- page_number (INTEGER) - Page number
- ang (INTEGER) - Ang number
- line_order (INTEGER) - Order within page
- punjabi (TEXT) - Punjabi text
- english (TEXT) - English translation
- hindi (TEXT) - Hindi translation
- transliteration_english (TEXT) - English transliteration
- author (VARCHAR) - Author name
- raag (VARCHAR) - Musical raag
```

### Relationships
```
holy_books (1) ──→ (many) prayers
prayers (1) ──→ (many) prayer_lines
holy_books (1) ──→ (many) bani_lines
holy_books (1) ──→ (many) prayer_lines
```

### Security
- **Row Level Security (RLS)** enabled on all tables
- **Public read access** for all tables
- **Public write access** for migrations (can be restricted in production)

---

## ✨ Key Features

### 1. **Prayer Reading**
- Browse and search prayers
- View prayers with:
  - Punjabi text (Gurmukhi)
  - English translation
  - Hindi translation
  - Transliteration
- Filter by holy book

### 2. **Guru Granth Sahib Reader**
- Read Guru Granth Sahib page by page
- Navigate by page number or ang
- Search functionality
- Multilingual display

### 3. **Prayer Routine**
- Create daily prayer routines
- Organize prayers by time slots:
  - Amrit Vayla (Early morning)
  - Morning
  - Evening
  - Night
- Track daily completion
- View completion statistics

### 4. **Reminders**
- Set prayer reminders for each time slot
- Push notifications
- Customizable reminder times

### 5. **Dark Mode**
- Automatic theme detection
- Light and dark themes
- System preference support

---

## 🖼️ Components & Screens

### Main Screens

#### **Home (index.tsx)**
- Welcome screen
- Quick access to features
- Daily statistics

#### **Prayers (prayers.tsx)**
- Guru Granth Sahib card
- Prayer list component
- Search functionality

#### **Routine (routine.tsx)**
- Time slot cards (Amrit Vayla, Morning, Evening, Night)
- Prayer completion checkboxes
- Edit routine button
- Daily statistics
- Prayer detail modal

#### **Journey (journey.tsx)**
- Spiritual journey tracking (placeholder)

#### **Profile (profile.tsx)**
- User settings
- App information

#### **Guide (guide.tsx)**
- App usage guide

### Key Components

#### **PrayerList (components/prayer-list.tsx)**
- Displays list of prayers
- Search bar
- Prayer detail modal
- Fetches data from database

#### **GuruGranthSahibReader (components/guru-granth-sahib-reader.tsx)**
- Page-by-page reading
- Page navigation
- Search functionality
- Fetches pages from database

#### **RoutineEditModal (components/routine-edit-modal.tsx)**
- Edit prayer assignments for time slots
- Set reminder times
- Save routine configuration

---

## 🔧 Services & Utilities

### **database.service.ts**
Core database query functions:
- `getAllPrayers()` - Get all prayers with lines
- `getPrayerById()` - Get specific prayer
- `searchPrayers()` - Search prayers by text
- `getGGSPage()` - Get Guru Granth Sahib page
- `searchGGS()` - Search Guru Granth Sahib
- `getAllHolyBooks()` - Get all holy books

### **routine-storage.ts**
Local storage for user routines:
- `loadRoutineConfig()` - Load routine configuration
- `saveRoutineConfig()` - Save routine configuration
- `loadTodayCompletion()` - Load today's completion status
- `saveTodayCompletion()` - Save completion status
- `togglePrayerCompletion()` - Toggle prayer completion
- `getTodayStats()` - Get completion statistics

### **notifications.ts**
Push notification management:
- `requestNotificationPermissions()` - Request permissions
- `scheduleRoutineReminders()` - Schedule prayer reminders
- `cancelAllReminders()` - Cancel all reminders

---

## 🚀 Build & Deployment

### Development
```bash
npm start              # Start Expo dev server
npm run android        # Run on Android
npm run ios            # Run on iOS
npm run web            # Run on web
```

### Database Migration
```bash
npm run db:test                    # Test database connection
npm run migrate:prayers:json        # Import prayers from JSON
npm run migrate:ggs                # Import Guru Granth Sahib
```

### Building for Production

#### Android (APK)
```bash
npm run build:android              # Preview build (APK)
npm run build:android:prod        # Production build (AAB)
```

#### iOS
```bash
npm run build:ios                  # Preview build
npm run build:ios:prod            # Production build (for App Store)
```

### Build Process
1. **EAS Build** (Expo Application Services)
   - Cloud-based builds
   - No local setup required
   - Generates APK/IPA files

2. **Distribution**
   - **Android**: Share APK directly or upload to Play Store
   - **iOS**: Upload to TestFlight or App Store

---

## 🔐 Environment & Configuration

### Supabase Configuration
- **URL**: `https://xehvbppisebbzwolyfxj.supabase.co`
- **Anon Key**: Configured in `lib/supabase.ts`
- **Database**: PostgreSQL with Row Level Security

### App Configuration
- **Package**: `com.soulstride.spiritualapp` (Android)
- **Version**: `1.0.0`
- **Orientation**: Portrait only
- **Theme**: Automatic (light/dark)

---

## 📊 Data Migration

### Migration Scripts

#### **migrate-prayers-json.ts**
- Reads `prayers.json` file
- Clears existing prayers and prayer lines
- Imports prayers with metadata
- Imports prayer lines with translations
- Handles null values and data validation

#### **migrate-ggs.ts**
- Imports Guru Granth Sahib data
- Processes page by page
- Handles large datasets (393,000+ lines)

### Migration Process
1. Clear existing data (optional)
2. Ensure holy books exist
3. Insert prayers
4. Insert prayer lines in batches
5. Verify data integrity

---

## 🎨 Theming System

### Theme Structure
- **Light Theme**: Default light colors
- **Dark Theme**: Dark mode colors
- **Automatic**: Follows system preference

### Theme Components
- `ThemedText` - Text with theme support
- `ThemedView` - View with theme support
- `useColorScheme()` - Hook to detect theme
- `Colors` - Theme color constants

---

## 🔍 Search Functionality

### Prayer Search
- Searches in:
  - Prayer names (English, Punjabi)
  - Prayer descriptions
  - Prayer line content (Punjabi, English)
- Case-insensitive
- Real-time search

### Guru Granth Sahib Search
- Searches in:
  - Punjabi text
  - English translation
  - Transliteration
- Returns matching lines with page numbers

---

## 📱 Platform Support

- ✅ **Android** - Full support
- ✅ **iOS** - Full support
- ✅ **Web** - Basic support (via Expo Web)

---

## 🧪 Testing & Development

### Development Tools
- **Expo Dev Tools** - Development server
- **React Native Debugger** - Debugging
- **TypeScript** - Type checking
- **ESLint** - Code linting

### Database Testing
```bash
npm run db:test  # Test Supabase connection
```

---

## 📝 Key Design Decisions

1. **Database-First Approach**: All prayer data stored in Supabase, not local files
2. **File-Based Routing**: Expo Router for simple navigation
3. **Type Safety**: Full TypeScript coverage
4. **Local Storage**: AsyncStorage for user preferences (routines, completions)
5. **Modular Architecture**: Separated concerns (services, components, data)
6. **Multilingual Support**: Punjabi, English, Hindi throughout

---

## 🔄 Data Updates

To update prayer data:
1. Update `prayers.json` file
2. Run `npm run migrate:prayers:json`
3. Script clears old data and imports new data
4. App automatically uses updated data from database

---

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check Supabase URL and keys in `lib/supabase.ts`
   - Verify network connection
   - Run `npm run db:test`

2. **Prayers Not Loading**
   - Check if data exists in database
   - Verify RLS policies allow read access
   - Check console for errors

3. **Build Failures**
   - Ensure EAS CLI is installed: `npm install -g eas-cli`
   - Login to Expo: `eas login`
   - Check `eas.json` configuration

---

## 📚 Additional Resources

- **Expo Documentation**: https://docs.expo.dev
- **Supabase Documentation**: https://supabase.com/docs
- **React Native Documentation**: https://reactnative.dev
- **Expo Router**: https://docs.expo.dev/router/introduction

---

## 🎯 Future Enhancements

Potential features to add:
- User authentication
- Cloud sync for routines
- Reading progress tracking
- Bookmarking favorite prayers
- Audio playback
- Social sharing
- Analytics

---

**Last Updated**: Based on current codebase structure
**Version**: 1.0.0
