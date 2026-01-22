# System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT APPLICATIONS                       │
├──────────────────────────┬──────────────────────────────────┤
│  Recruiter Web Portal    │   Job Seeker Mobile App          │
│  (Next.js + TypeScript)  │   (Consumes APIs only)           │
│  - Job Management        │   - Resume Upload                │
│  - Candidate Review      │   - Job Discovery                │
│  - AI-Powered Filtering  │   - Application Tracking         │
└──────────────────────────┴──────────────────────────────────┘
                            │
                            │ HTTPS/REST
                            │
┌───────────────────────────▼──────────────────────────────────┐
│                     API GATEWAY LAYER                        │
│                  (Express.js + Middleware)                   │
│  - Authentication (JWT)                                      │
│  - Authorization (Role-based)                                │
│  - Request Validation                                        │
│  - Error Handling                                            │
│  - Rate Limiting                                             │
└──────────────────────────┬───────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼─────┐   ┌────────▼────────┐   ┌────▼────────┐
│   Auth      │   │   Recruiter     │   │  Candidate  │
│  Service    │   │    Service      │   │   Service   │
└───────┬─────┘   └────────┬────────┘   └────┬────────┘
        │                  │                  │
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼─────────┐  ┌─────▼──────────┐  ┌───▼────────────┐
│   OpenAI API    │  │   MongoDB      │  │ File Storage   │
│   - GPT-4       │  │   - Users      │  │ - PDF Resumes  │
│   - Job Gen     │  │   - Jobs       │  │ - (S3-ready)   │
│   - Resume Parse│  │   - Apps       │  │                │
│   - Matching    │  │   - Analysis   │  │                │
└─────────────────┘  └────────────────┘  └────────────────┘
```

## 🔄 Request Flow

### 1. Recruiter Creates Job with AI

```
1. Recruiter enters job title → Frontend
2. Click "Generate with AI" → POST /api/recruiter/jobs/generate-description
3. Backend → OpenAI API (Job Description Generator)
4. OpenAI returns: description, skills, tech stack, salary
5. Frontend displays AI-generated content
6. Recruiter reviews/edits → POST /api/recruiter/jobs
7. Save to MongoDB → Return job details
```

### 2. Candidate Applies to Job

```
1. Candidate uploads resume PDF → Mobile App
2. POST /api/candidate/resume/upload
3. Backend → Save PDF to storage
4. Backend → OpenAI API (Resume Parser)
5. Extract: skills, experience, tech stack, education
6. Save ResumeAnalysis to MongoDB
7. POST /api/candidate/applications
8. Backend → OpenAI API (Matching Engine)
9. Calculate match percentage with job requirements
10. Save Application + JobMatchScore
11. Return application confirmation
```

### 3. Recruiter Reviews Applications

```
1. GET /api/recruiter/jobs/:id/applications
2. Backend fetches applications with:
   - Candidate profiles
   - Resume analysis
   - Match scores
3. Apply filters (skills, experience, match %)
4. Return sorted, filtered list
5. Frontend displays with AI match percentages
6. Recruiter accepts/rejects → PUT /api/recruiter/applications/:id/accept
```

## 🗄️ Database Schema

### Core Entities

```
User
├── _id (ObjectId)
├── email (unique, indexed)
├── password (hashed)
├── role (RECRUITER | CANDIDATE)
├── fullName
├── isActive
├── lastLogin
└── timestamps

RecruiterProfile
├── _id (ObjectId)
├── userId → User (unique, indexed)
├── companyName
├── companyWebsite
├── companySize
├── industry
├── location
├── isVerified
└── timestamps

CandidateProfile
├── _id (ObjectId)
├── userId → User (unique, indexed)
├── phoneNumber
├── location
├── currentJobTitle
├── totalExperience (years)
├── expectedSalary
├── noticePeriod
├── preferredLocations []
└── timestamps

JobPost
├── _id (ObjectId)
├── recruiterId → User (indexed)
├── title
├── description (AI-generated)
├── companyName
├── location
├── experienceMin
├── experienceMax
├── salaryMin
├── salaryMax
├── currency
├── employmentType
├── requiredSkills [] → JobSkill
├── techStack []
├── status (DRAFT | ACTIVE | CLOSED)
├── aiGenerated (boolean)
├── views (counter)
└── timestamps

JobSkill
├── _id (ObjectId)
├── name (unique, indexed)
├── category
├── aliases []
└── timestamps

Application
├── _id (ObjectId)
├── jobId → JobPost (indexed)
├── candidateId → User (indexed)
├── resumeId → Resume
├── status (APPLIED | SHORTLISTED | REJECTED | HIRED)
├── coverLetter
├── appliedDate
├── statusHistory []
└── timestamps

Resume
├── _id (ObjectId)
├── candidateId → User (indexed)
├── fileName
├── filePath
├── fileSize
├── uploadDate
├── isPrimary
└── timestamps

ResumeAnalysis
├── _id (ObjectId)
├── resumeId → Resume (unique)
├── candidateId → User
├── extractedSkills []
├── extractedTechStack []
├── totalExperience
├── educationSummary
├── workExperience []
├── certifications []
├── keywords []
├── candidateSummary
├── parsedAt
└── timestamps

JobMatchScore
├── _id (ObjectId)
├── applicationId → Application (unique, indexed)
├── jobId → JobPost
├── candidateId → User
├── overallScore (0-100)
├── skillMatchScore (0-100)
├── experienceScore (0-100)
├── techStackScore (0-100)
├── matchedSkills []
├── missingSkills []
├── breakdown {}
└── timestamps
```

## 🔐 Authentication Architecture

### JWT Token Strategy

```
Access Token:
- Short-lived (15 minutes)
- Contains: userId, role, email
- Used for API authentication
- Stored in memory (frontend)

Refresh Token:
- Long-lived (7 days)
- Stored in httpOnly cookie
- Used to get new access token
- Rotates on use
```

### Authorization Flow

```
1. User logs in → Backend validates credentials
2. Generate access + refresh tokens
3. Return access token, set refresh cookie
4. Client stores access token in memory
5. Every API request → Authorization: Bearer <token>
6. Middleware validates token + role
7. On token expiry → Use refresh token
8. Get new access token
9. Continue requests
```

## 🤖 AI Integration Architecture

### 1. Job Description Generator

```typescript
Input: {
  jobTitle: string
}

OpenAI Prompt:
"Generate a professional job description for: {jobTitle}
Return JSON with:
- description (200+ words, formatted with bullet points)
- requiredSkills (array of 5-10 skills)
- techStack (array of technologies)
- experienceMin (years)
- experienceMax (years)
- salaryMin (USD)
- salaryMax (USD)"

Output: Structured JSON
```

### 2. Resume Parser

```typescript
Input: {
  resumeText: string (extracted from PDF)
}

OpenAI Prompt:
"Parse this resume and extract structured data.
Return JSON with:
- extractedSkills (array)
- extractedTechStack (array)
- totalExperience (years as number)
- educationSummary (string)
- workExperience (array of objects)
- certifications (array)
- keywords (array)
- candidateSummary (50-100 words)"

Output: Structured JSON
```

### 3. Matching Engine

```typescript
Input: {
  jobRequirements: {
    requiredSkills: string[]
    techStack: string[]
    experienceMin: number
    experienceMax: number
  }
  candidateProfile: {
    skills: string[]
    techStack: string[]
    experience: number
  }
}

OpenAI Prompt:
"Compare this candidate with job requirements.
Calculate match percentage and provide breakdown.
Return JSON with:
- overallScore (0-100)
- skillMatchScore (0-100)
- experienceScore (0-100)
- techStackScore (0-100)
- matchedSkills (array)
- missingSkills (array)
- reasoning (string)"

Output: Structured JSON
```

## 📊 Data Flow Patterns

### Service Layer Pattern

```
Controller → Service → Repository (Model) → Database
                ↓
           AI Service → OpenAI API
                ↓
          Storage Service → File System/S3
```

### Error Handling Chain

```
Try-Catch in Controller
    ↓
Service throws custom error
    ↓
Global error middleware
    ↓
Format error response
    ↓
Return to client
```

## 🚀 Scalability Strategy

### Horizontal Scaling
- Stateless authentication (JWT)
- No session storage
- Load balancer ready

### Database Optimization
- Compound indexes on frequent queries
- Pagination on list endpoints
- Query projection to limit data

### Caching Strategy (Future)
- Redis for session data
- Cache job listings
- Cache skill/tech stack data

### File Storage
- Abstract storage layer
- Easy migration to S3/GCS
- CDN for resume serving

### Async Processing (Future)
- Queue system for resume parsing
- Background AI matching
- Email notifications
- Report generation

## 🛡️ Security Architecture

### Defense Layers

1. **Input Validation**
   - YUP schemas on frontend
   - Joi/Express-validator on backend
   - File type/size validation

2. **Authentication**
   - Bcrypt password hashing (12 rounds)
   - JWT with expiry
   - Refresh token rotation

3. **Authorization**
   - Role-based middleware
   - Resource ownership checks
   - Route protection

4. **Data Protection**
   - MongoDB injection prevention
   - CORS configuration
   - Helmet.js security headers
   - Rate limiting

5. **File Security**
   - PDF-only validation
   - Size limits (5MB)
   - Virus scanning ready
   - Private file access

## 📈 Monitoring & Observability (Production Ready)

### Logging
- Winston/Morgan for structured logs
- Log levels: error, warn, info, debug
- Request/response logging
- AI API call logging

### Metrics
- API response times
- AI processing duration
- Database query performance
- File upload success rate

### Alerts
- Failed login attempts
- AI API errors
- Database connection issues
- High error rates

## 🔄 CI/CD Pipeline (Recommended)

```
1. Code Push → GitHub
2. Run tests (unit, integration)
3. Lint & type check
4. Build frontend (Next.js)
5. Build backend (TypeScript)
6. Run security scans
7. Deploy to staging
8. Run E2E tests
9. Deploy to production
10. Monitor & alert
```

## 🌐 Multi-Tenancy Considerations (Future)

- Separate recruiter companies
- Data isolation
- Custom branding
- Usage limits
- Billing integration

This architecture provides a solid foundation for a production-ready ATS system that can scale from MVP to enterprise.
