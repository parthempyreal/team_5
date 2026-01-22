# API Documentation

Base URL: `http://localhost:5000/api` (Development)  
Production URL: `https://your-backend-domain.com/api`

---

## Authentication

All protected endpoints require JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

---

## API Endpoints

### Health Check

#### `GET /health`

Check API status.

**Response:**
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2026-01-21T10:00:00.000Z"
}
```

---

## Authentication Endpoints

### Register User

#### `POST /auth/register`

Register a new recruiter or candidate.

**Request Body:**
```json
{
  "email": "recruiter@company.com",
  "password": "SecurePass123!",
  "role": "RECRUITER",
  "fullName": "John Recruiter",
  "companyName": "Tech Corp Inc.",
  "companyWebsite": "https://techcorp.com"
}
```

**Validation:**
- `email`: Valid email format
- `password`: Min 8 chars, must contain uppercase, lowercase, and number
- `role`: "RECRUITER" or "CANDIDATE"
- `fullName`: Min 2 chars
- `companyName`: Required for RECRUITER role

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "recruiter@company.com",
      "fullName": "John Recruiter",
      "role": "RECRUITER"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### Login

#### `POST /auth/login`

Authenticate user and receive tokens.

**Request Body:**
```json
{
  "email": "recruiter@company.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "recruiter@company.com",
      "fullName": "John Recruiter",
      "role": "RECRUITER"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### Get Profile

#### `GET /auth/profile`

Get current user profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "recruiter@company.com",
      "fullName": "John Recruiter",
      "role": "RECRUITER",
      "isActive": true,
      "lastLogin": "2026-01-21T10:00:00.000Z"
    },
    "profile": {
      "_id": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439011",
      "companyName": "Tech Corp Inc.",
      "isVerified": false
    }
  }
}
```

---

## Recruiter Endpoints

### Generate Job Description with AI

#### `POST /recruiter/jobs/generate-description`

Generate job description using AI based on job title.

**Headers:**
```
Authorization: Bearer <access_token>
Role: RECRUITER
```

**Request Body:**
```json
{
  "jobTitle": "Senior Full Stack Engineer"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Job description generated successfully",
  "data": {
    "description": "We are seeking a talented Senior Full Stack Engineer...\n\nResponsibilities:\n- Design and implement scalable web applications\n- Collaborate with cross-functional teams...",
    "requiredSkills": ["react", "node.js", "typescript", "mongodb", "aws"],
    "techStack": ["react", "express", "mongodb", "docker", "kubernetes"],
    "experienceMin": 5,
    "experienceMax": 10,
    "salaryMin": 120000,
    "salaryMax": 180000
  }
}
```

---

### Create Job Post

#### `POST /recruiter/jobs`

Create a new job posting.

**Request Body:**
```json
{
  "title": "Senior Full Stack Engineer",
  "description": "Detailed job description...",
  "location": "San Francisco, CA (Remote)",
  "experienceMin": 5,
  "experienceMax": 10,
  "salaryMin": 120000,
  "salaryMax": 180000,
  "currency": "USD",
  "employmentType": "FULL_TIME",
  "requiredSkills": ["react", "node.js", "typescript"],
  "techStack": ["mongodb", "docker", "aws"],
  "status": "ACTIVE",
  "aiGenerated": true
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Job post created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "title": "Senior Full Stack Engineer",
    "status": "ACTIVE",
    "views": 0,
    "createdAt": "2026-01-21T10:00:00.000Z"
  }
}
```

---

### Get Recruiter's Jobs

#### `GET /recruiter/jobs`

Get all jobs posted by the recruiter.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `status` (optional): Filter by status (DRAFT, ACTIVE, CLOSED)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "title": "Senior Full Stack Engineer",
      "location": "San Francisco, CA",
      "status": "ACTIVE",
      "requiredSkills": ["react", "node.js"],
      "applicationCounts": {
        "total": 25,
        "applied": 10,
        "shortlisted": 8,
        "rejected": 5,
        "hired": 2
      }
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### Get Job Applications

#### `GET /recruiter/jobs/:jobId/applications`

Get all applications for a specific job with AI match scores.

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by application status
- `minMatchScore`, `maxMatchScore`: Filter by AI match score (0-100)
- `skills`: Comma-separated skills to filter
- `techStack`: Comma-separated technologies to filter
- `experienceMin`, `experienceMax`: Filter by years of experience

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "candidateId": {
        "_id": "507f1f77bcf86cd799439015",
        "fullName": "Jane Developer",
        "email": "jane@example.com"
      },
      "status": "APPLIED",
      "appliedDate": "2026-01-20T10:00:00.000Z",
      "matchScore": {
        "overallScore": 85,
        "skillMatchScore": 90,
        "experienceScore": 80,
        "techStackScore": 85,
        "matchedSkills": ["react", "node.js", "typescript"],
        "missingSkills": ["aws", "kubernetes"]
      },
      "resumeAnalysis": {
        "extractedSkills": ["react", "node.js", "typescript", "mongodb"],
        "extractedTechStack": ["docker", "postgresql"],
        "totalExperience": 6.5,
        "candidateSummary": "Experienced full stack developer with strong React and Node.js skills..."
      }
    }
  ],
  "meta": {...}
}
```

---

### Accept/Shortlist Application

#### `PUT /recruiter/applications/:applicationId/accept`

Shortlist a candidate's application.

**Request Body (optional):**
```json
{
  "notes": "Great candidate, schedule technical interview"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Application shortlisted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "status": "SHORTLISTED",
    "statusHistory": [
      {
        "status": "APPLIED",
        "changedAt": "2026-01-20T10:00:00.000Z"
      },
      {
        "status": "SHORTLISTED",
        "changedAt": "2026-01-21T10:00:00.000Z",
        "notes": "Great candidate, schedule technical interview"
      }
    ]
  }
}
```

---

### Reject Application

#### `PUT /recruiter/applications/:applicationId/reject`

Reject a candidate's application.

**Request Body (optional):**
```json
{
  "notes": "Skills don't match requirements"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Application rejected",
  "data": {...}
}
```

---

### Get Dashboard Statistics

#### `GET /recruiter/dashboard`

Get overview statistics for the recruiter.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalJobs": 12,
    "activeJobs": 8,
    "totalApplications": 156,
    "applied": 45,
    "shortlisted": 23,
    "rejected": 78,
    "hired": 10
  }
}
```

---

## Candidate Endpoints

### Upload Resume

#### `POST /candidate/resume/upload`

Upload and analyze resume with AI.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
Role: CANDIDATE
```

**Request Body (form-data):**
- `resume`: PDF file (max 5MB)

**Response (201):**
```json
{
  "success": true,
  "message": "Resume uploaded and analyzed successfully",
  "data": {
    "resume": {
      "_id": "507f1f77bcf86cd799439016",
      "fileName": "john_doe_resume.pdf",
      "fileSize": 245680,
      "isPrimary": true
    },
    "analysis": {
      "extractedSkills": ["python", "django", "postgresql", "docker"],
      "extractedTechStack": ["aws", "kubernetes", "jenkins"],
      "totalExperience": 5.5,
      "educationSummary": "B.S. Computer Science, Stanford University, 2018",
      "workExperience": [
        {
          "company": "Tech Startup Inc.",
          "position": "Backend Engineer",
          "duration": "Jan 2020 - Present",
          "description": "Developed microservices architecture..."
        }
      ],
      "certifications": ["AWS Certified Developer"],
      "candidateSummary": "Experienced backend engineer with expertise in Python and cloud technologies..."
    }
  }
}
```

---

### Browse Jobs

#### `GET /candidate/jobs`

Browse available job postings.

**Query Parameters:**
- `page`, `limit`: Pagination
- `skills`: Filter by skills (comma-separated)
- `techStack`: Filter by tech stack
- `location`: Filter by location (partial match)
- `experienceMin`, `experienceMax`: Filter by experience range
- `salaryMin`: Minimum salary
- `employmentType`: FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP
- `search`: Full-text search in title, description, company

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "title": "Senior Full Stack Engineer",
      "companyName": "Tech Corp Inc.",
      "location": "San Francisco, CA",
      "employmentType": "FULL_TIME",
      "salaryMin": 120000,
      "salaryMax": 180000,
      "requiredSkills": ["react", "node.js"],
      "views": 156
    }
  ],
  "meta": {...}
}
```

---

### Apply to Job

#### `POST /candidate/applications`

Submit application to a job with automatic AI matching.

**Request Body:**
```json
{
  "jobId": "507f1f77bcf86cd799439013",
  "coverLetter": "I am excited to apply for this position because..."
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "application": {
      "_id": "507f1f77bcf86cd799439017",
      "jobId": "507f1f77bcf86cd799439013",
      "status": "APPLIED",
      "appliedDate": "2026-01-21T10:00:00.000Z"
    },
    "matchScore": {
      "overallScore": 78,
      "reasoning": "Good match based on React and Node.js experience. Could improve AWS and Kubernetes knowledge."
    }
  }
}
```

---

### Get My Applications

#### `GET /candidate/applications`

Get all applications submitted by the candidate.

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by status

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439017",
      "jobId": {
        "_id": "507f1f77bcf86cd799439013",
        "title": "Senior Full Stack Engineer",
        "companyName": "Tech Corp Inc."
      },
      "status": "SHORTLISTED",
      "appliedDate": "2026-01-21T10:00:00.000Z",
      "matchScore": {
        "overallScore": 78
      }
    }
  ],
  "meta": {...}
}
```

---

## Error Responses

All endpoints follow a consistent error format:

**Validation Error (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

**Authentication Error (401):**
```json
{
  "success": false,
  "message": "Invalid or expired token. Please login again."
}
```

**Authorization Error (403):**
```json
{
  "success": false,
  "message": "You do not have permission to access this resource."
}
```

**Not Found (404):**
```json
{
  "success": false,
  "message": "Job not found"
}
```

**Server Error (500):**
```json
{
  "success": false,
  "message": "Internal server error occurred"
}
```

---

## Rate Limiting

Default rate limits:
- 100 requests per 15 minutes per IP
- Applies to all `/api/` endpoints

Exceeded rate limit response (429):
```json
{
  "success": false,
  "message": "Too many requests from this IP"
}
```

---

## OpenAI API Integration

The system uses OpenAI GPT-4 for:

1. **Job Description Generation**: Creates detailed, professional job descriptions
2. **Resume Parsing**: Extracts structured data from PDF resumes
3. **Match Scoring**: Calculates compatibility between candidates and jobs

All AI responses are structured JSON, validated, and cached where appropriate.

---

## Testing the API

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "role": "RECRUITER",
    "fullName": "Test User",
    "companyName": "Test Corp"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'

# Get jobs (with auth)
curl -X GET http://localhost:5000/api/recruiter/jobs \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Using Postman

Import the collection from `postman_collection.json` (create this file separately if needed).

---

## Webhook Support (Future)

Future versions may include webhooks for:
- Application status changes
- New applications received
- Job posting status changes

---

For more information, see the main README.md and ARCHITECTURE.md files.
