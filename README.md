# AI-Powered Applicant Tracking System (ATS)

## 🎯 System Overview

A production-ready AI-powered ATS platform with two clients:
- **Recruiter Web Portal**: Job posting, applicant review, AI-powered matching
- **Job Seeker Mobile App**: Resume upload, job discovery (API only)

## 🧱 Tech Stack

### Frontend (Recruiter Web Portal)
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- YUP validation
- Axios for API calls

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- OpenAI GPT-4 API
- Multer for file uploads

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+
- OpenAI API key

### Installation

```bash
# Install all dependencies
npm run install:all

# Setup environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Update .env files with your configuration
```

### Environment Variables

#### Backend (.env)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-ats
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
OPENAI_API_KEY=sk-your-openai-api-key
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=application/pdf
CORS_ORIGIN=http://localhost:3000
```

#### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Seed Database

```bash
npm run seed
```

This will populate:
- Skills (Frontend, Backend, DevOps, AI/ML, Mobile, Data)
- Tech stacks (React, Node.js, Python, Java, AWS, Docker, etc.)
- Application statuses

### Development

```bash
# Run both frontend and backend
npm run dev

# Or run separately:
npm run dev:backend  # Backend: http://localhost:5000
npm run dev:frontend # Frontend: http://localhost:3000
```

## 📁 Project Structure

```
ai-ats-system/
├── backend/
│   ├── src/
│   │   ├── config/         # Database, JWT, OpenAI config
│   │   ├── models/         # Mongoose schemas
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic & AI services
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Helpers, validators
│   │   ├── dtos/           # Data Transfer Objects
│   │   └── seeders/        # Database seeders
│   └── uploads/            # Resume storage
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js pages (App Router)
│   │   ├── components/     # React components
│   │   ├── lib/            # API client, utilities
│   │   ├── types/          # TypeScript types
│   │   └── validations/    # YUP schemas
│   └── public/             # Static assets
└── package.json
```

## 🔐 Authentication

- JWT-based authentication
- Role-based access control (RECRUITER, CANDIDATE)
- Refresh token rotation
- Secure password hashing (bcrypt)

## 🤖 AI Features

### 1. Job Description Generator
- Input: Job title
- Output: Complete job description, skills, tech stack, salary range

### 2. Resume Parser
- Input: PDF resume
- Output: Skills, experience, education, tech stack

### 3. AI Matching Engine
- Matches candidates to jobs based on:
  - Skills alignment
  - Experience relevance
  - Tech stack compatibility
- Provides percentage score with breakdown

## 📦 Database Models

- **User**: Core authentication
- **RecruiterProfile**: Company info, verified status
- **CandidateProfile**: Personal details, preferences
- **JobPost**: Job details with AI-generated content
- **JobSkill**: Reusable skill taxonomy
- **Application**: Candidate applications
- **Resume**: Parsed resume data
- **ResumeAnalysis**: AI-extracted information
- **JobMatchScore**: AI-calculated matching scores

## 🛣️ API Endpoints

### Authentication
- `POST /api/auth/register` - Register (recruiter/candidate)
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Recruiter APIs
- `POST /api/recruiter/jobs` - Create job post
- `GET /api/recruiter/jobs` - Get recruiter's jobs
- `GET /api/recruiter/jobs/:id` - Get job details
- `GET /api/recruiter/jobs/:id/applications` - Get applications
- `PUT /api/recruiter/applications/:id/accept` - Accept candidate
- `PUT /api/recruiter/applications/:id/reject` - Reject candidate
- `POST /api/recruiter/jobs/generate-description` - AI job description

### Candidate APIs
- `GET /api/candidate/jobs` - Browse jobs
- `GET /api/candidate/jobs/:id` - Job details
- `POST /api/candidate/applications` - Apply to job
- `GET /api/candidate/applications` - My applications
- `GET /api/candidate/applications/:id` - Application status
- `POST /api/candidate/resume/upload` - Upload resume

## 🔒 Security Features

- Password hashing with bcrypt (12 rounds)
- JWT with short-lived access tokens
- Refresh token rotation
- Role-based authorization
- File upload validation (type, size)
- Rate limiting ready
- CORS configuration
- SQL injection prevention (NoSQL)
- XSS protection

## 📈 Scalability Considerations

- Stateless authentication (JWT)
- Database indexing on frequently queried fields
- File storage abstraction (easily switch to S3)
- Service layer separation
- Async job processing ready
- Caching strategy ready
- Horizontal scaling friendly

## 🧪 API Testing

Use the provided Postman collection or test with curl:

```bash
# Register Recruiter
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "recruiter@company.com",
    "password": "SecurePass123!",
    "role": "RECRUITER",
    "fullName": "John Recruiter",
    "companyName": "Tech Corp"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "recruiter@company.com",
    "password": "SecurePass123!"
  }'
```

## 🚢 Deployment

### Backend
- Deploy to AWS EC2, DigitalOcean, or Heroku
- Use MongoDB Atlas for database
- Configure S3 for resume storage
- Set up environment variables
- Enable HTTPS

### Frontend
- Deploy to Vercel (recommended for Next.js)
- Configure environment variables
- Set up custom domain

## 📝 License

Proprietary - All rights reserved

## 🤝 Support

For issues or questions, contact the development team.
