# 🧘 SoulStride

A structured spiritual growth and guided learning mobile application with AI-powered Q&A support.

SoulStride is a full-stack mobile application built with React Native and a Node.js backend, designed to deliver structured lesson content alongside intelligent conversational support powered by LLM workflows.

The app supports real users in production and is deployed using Docker and Google Cloud Run.

📱 Download APK

You can download and install the latest Android from the uploaded apk file in root

Enable “Install from Unknown Sources” on your Android device before installing.

🚀 Features

📚 Structured lesson modules with progression tracking

🤖 LLM-powered Q&A for contextual spiritual guidance

🔐 Secure authentication and user session management

☁️ Cloud-hosted backend with PostgreSQL persistence

📊 Scalable backend designed for concurrent user access

🐳 Dockerized deployment for reproducible infrastructure

🏗️ Tech Stack
Mobile (Frontend)

React Native

Expo

Context-based state management

Secure token handling

Backend

Node.js

Express.js

REST API architecture

LLM integration pipeline

Database

PostgreSQL

Relational schema with structured lesson tracking

Infrastructure & DevOps

Docker

Google Cloud Run

Environment-based configuration

CI/CD workflow integration

🧠 System Architecture
Mobile App (React Native)
        ↓
REST API (Node.js + Express)
        ↓
PostgreSQL Database
        ↓
LLM Integration Layer


Stateless backend architecture

Token-based authentication

Environment-specific config (dev/prod)

Containerized deployment for scalability

⚙️ Local Development Setup
1️⃣ Clone Repository
git clone https://github.com/your-username/SoulStride.git
cd SoulStride

2️⃣ Backend Setup
cd backend
npm install


Create a .env file:

PORT=5000
DATABASE_URL=your_postgres_connection_string
LLM_API_KEY=your_key


Run locally:

npm run dev

3️⃣ Mobile App Setup
cd frontend
npm install
npx expo start


Ensure the API URL points to:

http://localhost:5000

🌍 Production Deployment

Backend containerized using Docker

Deployed to Google Cloud Run

PostgreSQL persistence

Environment variables managed securely

Serving 100+ users in production

📈 Engineering Highlights

Designed scalable REST API architecture

Implemented structured lesson management with relational integrity

Built LLM-powered contextual Q&A workflow

Deployed containerized backend to managed cloud infrastructure

Optimized production configuration for real user traffic

🔐 Security

Token-based authentication

Secure environment variable handling

No sensitive data stored client-side

📌 Future Improvements

User progress analytics dashboard

Offline lesson caching

Improved AI context retention

Push notification reminders

iOS release

👤 Author

Arnav Sethi
Software Engineering (Honours), Monash University

GitHub: https://github.com/ArnavSingh04

LinkedIn: https://www.linkedin.com/in/arnav-singh-sethi/
