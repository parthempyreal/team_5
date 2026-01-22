# Mobile App API Documentation

## Candidate Mobile Application - API Reference

**Base URL:** `http://localhost:5001/api` (Development)  
**Production URL:** `https://your-backend-domain.com/api`

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [Token Management](#token-management)
4. [User Profile](#user-profile)
5. [Resume Management](#resume-management)
6. [Job Discovery](#job-discovery)
7. [Applications](#applications)
8. [Error Handling](#error-handling)
9. [Best Practices](#best-practices)
10. [Example Implementations](#example-implementations)

---

## Getting Started

### API Configuration

```javascript
// Constants
const API_BASE_URL = 'https://your-backend-domain.com/api';
const CONTENT_TYPE_JSON = 'application/json';
const CONTENT_TYPE_MULTIPART = 'multipart/form-data';
```

### Required Headers

**For JSON requests:**
```
Content-Type: application/json
```

**For authenticated requests:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**For file uploads:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

---

## Authentication

### 1. Register New Candidate

Create a new candidate account.

**Endpoint:** `POST /auth/register`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "candidate@example.com",
  "password": "SecurePass123!",
  "role": "CANDIDATE",
  "fullName": "John Doe"
}
```

**Field Validation:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | Yes | Valid email format |
| password | string | Yes | Min 8 chars, must contain: uppercase, lowercase, number |
| role | string | Yes | Must be "CANDIDATE" |
| fullName | string | Yes | Min 2 chars, max 100 chars |

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "candidate@example.com",
      "fullName": "John Doe",
      "role": "CANDIDATE"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (409 - User exists):**
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

**Error Response (400 - Validation):**
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
      "message": "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    }
  ]
}
```

---

### 2. Login

Authenticate and receive tokens.

**Endpoint:** `POST /auth/login`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "candidate@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "candidate@example.com",
      "fullName": "John Doe",
      "role": "CANDIDATE"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

## Token Management

### Token Storage (Mobile)

**Recommended approach:**

```javascript
// React Native - AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

// Store tokens
const storeTokens = async (accessToken, refreshToken) => {
  await AsyncStorage.setItem('accessToken', accessToken);
  await AsyncStorage.setItem('refreshToken', refreshToken);
};

// Get access token
const getAccessToken = async () => {
  return await AsyncStorage.getItem('accessToken');
};

// Clear tokens (logout)
const clearTokens = async () => {
  await AsyncStorage.removeItem('accessToken');
  await AsyncStorage.removeItem('refreshToken');
  await AsyncStorage.removeItem('user');
};
```

### Token Expiry

| Token | Expiry | Usage |
|-------|--------|-------|
| Access Token | 15 minutes | API authentication |
| Refresh Token | 7 days | Get new access token |

### Token Refresh Flow

When access token expires (401 response), use refresh token to get a new one.

**Implementation:**
```javascript
// Axios interceptor for token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          // Note: Implement refresh endpoint if needed
          // For now, redirect to login on 401
          await clearTokens();
          // Navigate to login screen
        } catch (refreshError) {
          await clearTokens();
          // Navigate to login screen
        }
      }
    }
    
    return Promise.reject(error);
  }
);
```

---

## User Profile

### Get Current Profile

Get the authenticated user's profile.

**Endpoint:** `GET /auth/profile`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "candidate@example.com",
      "fullName": "John Doe",
      "role": "CANDIDATE",
      "isActive": true,
      "lastLogin": "2026-01-22T10:00:00.000Z"
    },
    "profile": {
      "_id": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439011",
      "phoneNumber": "+1234567890",
      "location": "San Francisco, CA",
      "currentJobTitle": "Software Engineer",
      "totalExperience": 5,
      "expectedSalary": 150000,
      "currency": "USD",
      "noticePeriod": "30 days",
      "preferredLocations": ["Remote", "San Francisco", "New York"]
    }
  }
}
```

### Update FCM Token

Register the device for push notifications.

**Endpoint:** `POST /auth/fcm-token`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "fcmToken": "fcm_token_string_from_firebase_sdk"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "FCM Token updated successfully"
}
```

---

## Resume Management

### 1. Upload Resume

Upload a PDF resume for AI parsing.

**Endpoint:** `POST /candidate/resume/upload`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request Body (form-data):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| resume | File | Yes | PDF file, max 5MB |

**React Native Implementation:**
```javascript
const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append('resume', {
    uri: file.uri,
    type: 'application/pdf',
    name: file.name || 'resume.pdf',
  });

  const accessToken = await AsyncStorage.getItem('accessToken');

  const response = await fetch(`${API_BASE_URL}/candidate/resume/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });

  return response.json();
};
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Resume uploaded and analyzed successfully",
  "data": {
    "resume": {
      "_id": "507f1f77bcf86cd799439016",
      "candidateId": "507f1f77bcf86cd799439011",
      "fileName": "john_doe_resume.pdf",
      "filePath": "uploads/resume-1706090000000-123456789.pdf",
      "fileSize": 245680,
      "uploadDate": "2026-01-22T10:00:00.000Z",
      "isPrimary": true
    },
    "analysis": {
      "_id": "507f1f77bcf86cd799439017",
      "resumeId": "507f1f77bcf86cd799439016",
      "candidateId": "507f1f77bcf86cd799439011",
      "extractedSkills": [
        "javascript",
        "react",
        "node.js",
        "python",
        "mongodb",
        "postgresql",
        "docker",
        "aws"
      ],
      "extractedTechStack": [
        "react native",
        "express",
        "mongodb",
        "redis",
        "kubernetes"
      ],
      "totalExperience": 5.5,
      "educationSummary": "Bachelor of Science in Computer Science, Stanford University, 2018. GPA: 3.8",
      "workExperience": [
        {
          "company": "Tech Startup Inc.",
          "position": "Senior Software Engineer",
          "duration": "Jan 2021 - Present",
          "description": "Led development of mobile applications using React Native. Managed team of 4 developers."
        },
        {
          "company": "Software Corp",
          "position": "Software Engineer",
          "duration": "Jun 2018 - Dec 2020",
          "description": "Developed backend services using Node.js and Python. Implemented CI/CD pipelines."
        }
      ],
      "certifications": [
        "AWS Certified Developer - Associate",
        "Google Cloud Professional Developer"
      ],
      "keywords": [
        "software engineer",
        "full stack",
        "mobile development",
        "react native",
        "node.js",
        "python",
        "agile",
        "team lead"
      ],
      "candidateSummary": "Experienced full-stack software engineer with 5.5 years of expertise in web and mobile development. Strong proficiency in JavaScript, React, Node.js, and cloud technologies. Proven track record of leading development teams and delivering scalable applications.",
      "parsedAt": "2026-01-22T10:00:01.000Z"
    }
  }
}
```

**Error Response (400 - No file):**
```json
{
  "success": false,
  "message": "Please upload a PDF file"
}
```

**Error Response (400 - Invalid file type):**
```json
{
  "success": false,
  "message": "Only PDF files are allowed"
}
```

**Error Response (400 - File too large):**
```json
{
  "success": false,
  "message": "File size too large. Maximum size is 5MB"
}
```

---

### 2. Get My Resumes

Retrieve all uploaded resumes with analysis.

**Endpoint:** `GET /candidate/resumes`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439016",
      "candidateId": "507f1f77bcf86cd799439011",
      "fileName": "john_doe_resume_v2.pdf",
      "filePath": "uploads/resume-1706090000000-123456789.pdf",
      "fileSize": 245680,
      "uploadDate": "2026-01-22T10:00:00.000Z",
      "isPrimary": true,
      "analysis": {
        "extractedSkills": ["javascript", "react", "node.js"],
        "extractedTechStack": ["mongodb", "docker", "aws"],
        "totalExperience": 5.5,
        "candidateSummary": "Experienced software engineer..."
      }
    },
    {
      "_id": "507f1f77bcf86cd799439015",
      "candidateId": "507f1f77bcf86cd799439011",
      "fileName": "john_doe_resume_v1.pdf",
      "fileSize": 198450,
      "uploadDate": "2026-01-15T10:00:00.000Z",
      "isPrimary": false,
      "analysis": {
        "extractedSkills": ["javascript", "react"],
        "totalExperience": 5,
        "candidateSummary": "Software engineer with..."
      }
    }
  ]
}
```

---

## Job Discovery

### 1. Browse Jobs

Discover available job postings with filters.

**Endpoint:** `GET /candidate/jobs`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| page | number | No | Page number (default: 1) | `1` |
| limit | number | No | Items per page (default: 10, max: 100) | `20` |
| skills | string | No | Comma-separated skills to filter | `react,node.js` |
| techStack | string | No | Comma-separated technologies | `docker,aws` |
| location | string | No | Location (partial match) | `San Francisco` |
| experienceMin | number | No | Minimum experience (years) | `2` |
| experienceMax | number | No | Maximum experience (years) | `10` |
| salaryMin | number | No | Minimum salary | `100000` |
| employmentType | string | No | Employment type | `FULL_TIME` |
| search | string | No | Full-text search | `senior engineer` |

**Employment Types:**
- `FULL_TIME`
- `PART_TIME`
- `CONTRACT`
- `INTERNSHIP`

**Example Request:**
```
GET /candidate/jobs?page=1&limit=10&skills=react,node.js&location=Remote&experienceMin=3&experienceMax=8&employmentType=FULL_TIME
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "title": "Senior Full Stack Engineer",
      "description": "We are seeking a talented Senior Full Stack Engineer to join our growing team...\n\nResponsibilities:\n- Design and implement scalable web applications\n- Collaborate with cross-functional teams\n- Mentor junior developers\n- Participate in code reviews\n\nRequirements:\n- 5+ years of experience\n- Strong proficiency in React and Node.js\n- Experience with cloud platforms (AWS/GCP)\n- Excellent communication skills",
      "companyName": "Tech Corp Inc.",
      "location": "San Francisco, CA (Remote)",
      "experienceMin": 5,
      "experienceMax": 10,
      "salaryMin": 150000,
      "salaryMax": 200000,
      "currency": "USD",
      "employmentType": "FULL_TIME",
      "requiredSkills": [
        "react",
        "node.js",
        "typescript",
        "mongodb",
        "aws"
      ],
      "techStack": [
        "react",
        "express",
        "mongodb",
        "docker",
        "kubernetes",
        "github actions"
      ],
      "status": "ACTIVE",
      "aiGenerated": true,
      "views": 234,
      "createdAt": "2026-01-20T10:00:00.000Z",
      "updatedAt": "2026-01-22T10:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439021",
      "title": "React Native Developer",
      "description": "Join our mobile team to build cutting-edge applications...",
      "companyName": "Mobile First Ltd.",
      "location": "Remote",
      "experienceMin": 3,
      "experienceMax": 7,
      "salaryMin": 120000,
      "salaryMax": 160000,
      "currency": "USD",
      "employmentType": "FULL_TIME",
      "requiredSkills": [
        "react native",
        "javascript",
        "typescript",
        "redux"
      ],
      "techStack": [
        "react native",
        "expo",
        "firebase",
        "fastlane"
      ],
      "status": "ACTIVE",
      "aiGenerated": false,
      "views": 156,
      "createdAt": "2026-01-18T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### 2. Get Job Details

Get detailed information about a specific job.

**Endpoint:** `GET /candidate/jobs/:jobId`

**Headers:**
```
Authorization: Bearer <access_token>
```

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jobId | string | Yes | MongoDB ObjectId of the job |

**Example Request:**
```
GET /candidate/jobs/507f1f77bcf86cd799439020
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "title": "Senior Full Stack Engineer",
    "description": "We are seeking a talented Senior Full Stack Engineer to join our growing team. You will be working on challenging problems and building scalable solutions.\n\nResponsibilities:\n- Design and implement scalable web applications using modern technologies\n- Collaborate with cross-functional teams including product, design, and QA\n- Mentor junior developers and conduct code reviews\n- Participate in architectural decisions and technical planning\n- Write clean, maintainable, and well-tested code\n- Optimize applications for maximum performance\n\nRequirements:\n- 5+ years of professional software development experience\n- Strong proficiency in React and Node.js\n- Experience with TypeScript and modern JavaScript\n- Familiarity with cloud platforms (AWS, GCP, or Azure)\n- Experience with databases (PostgreSQL, MongoDB)\n- Excellent problem-solving and communication skills\n\nNice to Have:\n- Experience with microservices architecture\n- Knowledge of DevOps practices (Docker, Kubernetes, CI/CD)\n- Open source contributions\n\nBenefits:\n- Competitive salary and equity\n- Flexible remote work policy\n- Health, dental, and vision insurance\n- Unlimited PTO\n- Professional development budget",
    "companyName": "Tech Corp Inc.",
    "location": "San Francisco, CA (Remote)",
    "experienceMin": 5,
    "experienceMax": 10,
    "salaryMin": 150000,
    "salaryMax": 200000,
    "currency": "USD",
    "employmentType": "FULL_TIME",
    "requiredSkills": [
      "react",
      "node.js",
      "typescript",
      "mongodb",
      "aws"
    ],
    "techStack": [
      "react",
      "express",
      "mongodb",
      "docker",
      "kubernetes",
      "github actions"
    ],
    "status": "ACTIVE",
    "aiGenerated": true,
    "views": 235,
    "createdAt": "2026-01-20T10:00:00.000Z",
    "updatedAt": "2026-01-22T10:00:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Job not found"
}
```

---

## Applications

### 1. Apply to Job

Submit an application to a job. Requires a primary resume.

**Endpoint:** `POST /candidate/applications`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "jobId": "507f1f77bcf86cd799439020",
  "coverLetter": "I am excited to apply for the Senior Full Stack Engineer position at Tech Corp Inc. With over 5 years of experience in React and Node.js development, I believe I would be a strong addition to your team.\n\nIn my current role, I have led the development of several large-scale applications and have experience mentoring junior developers. I am particularly drawn to this opportunity because of your focus on innovative solutions and remote-first culture.\n\nI look forward to discussing how my skills and experience align with your needs."
}
```

**Field Validation:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| jobId | string | Yes | Valid MongoDB ObjectId |
| coverLetter | string | No | Max 2000 characters |

**Success Response (201):**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "application": {
      "_id": "507f1f77bcf86cd799439030",
      "jobId": "507f1f77bcf86cd799439020",
      "candidateId": "507f1f77bcf86cd799439011",
      "resumeId": "507f1f77bcf86cd799439016",
      "status": "APPLIED",
      "coverLetter": "I am excited to apply...",
      "appliedDate": "2026-01-22T10:00:00.000Z",
      "statusHistory": [
        {
          "status": "APPLIED",
          "changedAt": "2026-01-22T10:00:00.000Z"
        }
      ],
      "createdAt": "2026-01-22T10:00:00.000Z"
    },
    "matchScore": {
      "overallScore": 78,
      "reasoning": "Strong match based on React and Node.js experience. The candidate meets most technical requirements with 5.5 years of experience. Some gaps in Kubernetes experience, but overall alignment with the job requirements is good."
    }
  }
}
```

**Error Response (400 - No resume):**
```json
{
  "success": false,
  "message": "Please upload a resume before applying to jobs"
}
```

**Error Response (409 - Already applied):**
```json
{
  "success": false,
  "message": "You have already applied to this job"
}
```

**Error Response (404 - Job not found):**
```json
{
  "success": false,
  "message": "Job not found or no longer active"
}
```

---

### 2. Get My Applications

Retrieve all applications submitted by the candidate.

**Endpoint:** `GET /candidate/applications`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10) |
| status | string | No | Filter by status |

**Application Statuses:**
- `APPLIED` - Initial status after applying
- `SHORTLISTED` - Candidate has been shortlisted by recruiter
- `REJECTED` - Application was rejected
- `HIRED` - Candidate was hired

**Example Request:**
```
GET /candidate/applications?page=1&limit=10&status=SHORTLISTED
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439030",
      "jobId": {
        "_id": "507f1f77bcf86cd799439020",
        "title": "Senior Full Stack Engineer",
        "companyName": "Tech Corp Inc.",
        "location": "San Francisco, CA (Remote)",
        "salaryMin": 150000,
        "salaryMax": 200000,
        "currency": "USD",
        "employmentType": "FULL_TIME",
        "status": "ACTIVE"
      },
      "candidateId": "507f1f77bcf86cd799439011",
      "status": "SHORTLISTED",
      "coverLetter": "I am excited to apply...",
      "appliedDate": "2026-01-20T10:00:00.000Z",
      "statusHistory": [
        {
          "status": "APPLIED",
          "changedAt": "2026-01-20T10:00:00.000Z"
        },
        {
          "status": "SHORTLISTED",
          "changedAt": "2026-01-21T15:30:00.000Z"
        }
      ],
      "matchScore": {
        "_id": "507f1f77bcf86cd799439031",
        "overallScore": 78,
        "skillMatchScore": 85,
        "experienceScore": 75,
        "techStackScore": 74,
        "matchedSkills": ["react", "node.js", "typescript", "mongodb"],
        "missingSkills": ["kubernetes"],
        "breakdown": {
          "reasoning": "Strong match based on React and Node.js experience..."
        }
      }
    },
    {
      "_id": "507f1f77bcf86cd799439032",
      "jobId": {
        "_id": "507f1f77bcf86cd799439021",
        "title": "React Native Developer",
        "companyName": "Mobile First Ltd.",
        "location": "Remote",
        "salaryMin": 120000,
        "salaryMax": 160000,
        "currency": "USD",
        "employmentType": "FULL_TIME",
        "status": "ACTIVE"
      },
      "status": "APPLIED",
      "appliedDate": "2026-01-22T10:00:00.000Z",
      "matchScore": {
        "overallScore": 92,
        "skillMatchScore": 95,
        "experienceScore": 90,
        "techStackScore": 91
      }
    }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

### 3. Get Application Status

Get detailed status of a specific application.

**Endpoint:** `GET /candidate/applications/:applicationId`

**Headers:**
```
Authorization: Bearer <access_token>
```

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| applicationId | string | Yes | MongoDB ObjectId of the application |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439030",
    "jobId": {
      "_id": "507f1f77bcf86cd799439020",
      "title": "Senior Full Stack Engineer",
      "companyName": "Tech Corp Inc.",
      "location": "San Francisco, CA (Remote)",
      "description": "We are seeking a talented Senior Full Stack Engineer...",
      "salaryMin": 150000,
      "salaryMax": 200000,
      "currency": "USD",
      "employmentType": "FULL_TIME",
      "requiredSkills": ["react", "node.js", "typescript"],
      "techStack": ["mongodb", "docker", "kubernetes"],
      "status": "ACTIVE"
    },
    "candidateId": "507f1f77bcf86cd799439011",
    "resumeId": "507f1f77bcf86cd799439016",
    "status": "SHORTLISTED",
    "coverLetter": "I am excited to apply for the Senior Full Stack Engineer position...",
    "appliedDate": "2026-01-20T10:00:00.000Z",
    "statusHistory": [
      {
        "status": "APPLIED",
        "changedAt": "2026-01-20T10:00:00.000Z"
      },
      {
        "status": "SHORTLISTED",
        "changedAt": "2026-01-21T15:30:00.000Z",
        "notes": "Great candidate, schedule technical interview"
      }
    ],
    "matchScore": {
      "_id": "507f1f77bcf86cd799439031",
      "applicationId": "507f1f77bcf86cd799439030",
      "jobId": "507f1f77bcf86cd799439020",
      "candidateId": "507f1f77bcf86cd799439011",
      "overallScore": 78,
      "skillMatchScore": 85,
      "experienceScore": 75,
      "techStackScore": 74,
      "matchedSkills": [
        "react",
        "node.js",
        "typescript",
        "mongodb"
      ],
      "missingSkills": [
        "kubernetes"
      ],
      "breakdown": {
        "reasoning": "Strong match based on React and Node.js experience. The candidate demonstrates solid proficiency in core technologies. Experience level aligns well with requirements (5.5 years vs 5-10 required). Minor gap in Kubernetes experience, but overall technical skills are well-suited for the role."
      },
      "calculatedAt": "2026-01-20T10:00:01.000Z"
    },
    "createdAt": "2026-01-20T10:00:00.000Z",
    "updatedAt": "2026-01-21T15:30:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Application not found"
}
```

---

## Error Handling

### Standard Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": [
    {
      "field": "fieldName",
      "message": "Specific field error"
    }
  ]
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data or validation error |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Not authorized to access resource |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists (e.g., duplicate email) |
| 413 | Payload Too Large | File size exceeds limit |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal server error |

### Error Handling Implementation

```javascript
// React Native error handler
const handleApiError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        // Validation errors
        if (data.errors && Array.isArray(data.errors)) {
          // Show field-specific errors
          data.errors.forEach(err => {
            showFieldError(err.field, err.message);
          });
        } else {
          showToast(data.message || 'Invalid request');
        }
        break;
        
      case 401:
        // Token expired or invalid
        clearTokens();
        navigateTo('Login');
        break;
        
      case 403:
        showToast('You do not have permission to perform this action');
        break;
        
      case 404:
        showToast(data.message || 'Resource not found');
        break;
        
      case 409:
        showToast(data.message || 'Resource already exists');
        break;
        
      case 429:
        showToast('Too many requests. Please try again later.');
        break;
        
      default:
        showToast('An error occurred. Please try again.');
    }
  } else if (error.request) {
    // Network error
    showToast('Network error. Please check your connection.');
  } else {
    showToast('An unexpected error occurred.');
  }
};
```

---

## Best Practices

### 1. API Client Setup

```javascript
// apiClient.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://your-backend-domain.com/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
      // Navigate to login (implement with your navigation)
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 2. API Service Layer

```javascript
// services/authService.js
import apiClient from './apiClient';

export const authService = {
  register: async (data) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },
  
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },
  
  getProfile: async () => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },
};

// services/jobService.js
export const jobService = {
  getJobs: async (params = {}) => {
    const response = await apiClient.get('/candidate/jobs', { params });
    return response.data;
  },
  
  getJobById: async (jobId) => {
    const response = await apiClient.get(`/candidate/jobs/${jobId}`);
    return response.data;
  },
};

// services/applicationService.js
export const applicationService = {
  apply: async (jobId, coverLetter) => {
    const response = await apiClient.post('/candidate/applications', {
      jobId,
      coverLetter,
    });
    return response.data;
  },
  
  getMyApplications: async (params = {}) => {
    const response = await apiClient.get('/candidate/applications', { params });
    return response.data;
  },
  
  getApplicationById: async (applicationId) => {
    const response = await apiClient.get(`/candidate/applications/${applicationId}`);
    return response.data;
  },
};

// services/resumeService.js
export const resumeService = {
  upload: async (file) => {
    const formData = new FormData();
    formData.append('resume', {
      uri: file.uri,
      type: 'application/pdf',
      name: file.name || 'resume.pdf',
    });
    
    const response = await apiClient.post('/candidate/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  getMyResumes: async () => {
    const response = await apiClient.get('/candidate/resumes');
    return response.data;
  },
};
```

### 3. Caching Strategy

```javascript
// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Usage in job list
const getJobsWithCache = async (params) => {
  const cacheKey = `jobs_${JSON.stringify(params)}`;
  const cached = getCachedData(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  const data = await jobService.getJobs(params);
  setCachedData(cacheKey, data);
  return data;
};
```

### 4. Pagination Helper

```javascript
// hooks/usePagination.js
import { useState, useCallback } from 'react';

export const usePagination = (fetchFunction, initialParams = {}) => {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  
  const fetchData = useCallback(async (pageNum = 1, reset = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchFunction({ ...initialParams, page: pageNum });
      
      if (reset || pageNum === 1) {
        setData(response.data);
      } else {
        setData(prev => [...prev, ...response.data]);
      }
      
      setMeta(response.meta);
      setPage(pageNum);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, initialParams]);
  
  const loadMore = useCallback(() => {
    if (meta?.hasNextPage && !loading) {
      fetchData(page + 1);
    }
  }, [meta, loading, page, fetchData]);
  
  const refresh = useCallback(() => {
    fetchData(1, true);
  }, [fetchData]);
  
  return {
    data,
    meta,
    loading,
    error,
    loadMore,
    refresh,
    hasMore: meta?.hasNextPage || false,
  };
};
```

---

## Example Implementations

### Complete Login Flow

```javascript
import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from './services/authService';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.login(email, password);

      if (response.success) {
        // Store tokens
        await AsyncStorage.setItem('accessToken', response.data.accessToken);
        await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));

        // Navigate to main app
        navigation.replace('MainApp');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title={loading ? 'Signing in...' : 'Login'}
        onPress={handleLogin}
        disabled={loading}
      />
    </View>
  );
};
```

### Job List with Infinite Scroll

```javascript
import React, { useEffect } from 'react';
import { FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { usePagination } from './hooks/usePagination';
import { jobService } from './services/jobService';
import JobCard from './components/JobCard';

const JobListScreen = () => {
  const { 
    data: jobs, 
    loading, 
    error, 
    loadMore, 
    refresh, 
    hasMore 
  } = usePagination(jobService.getJobs);

  useEffect(() => {
    refresh();
  }, []);

  const renderFooter = () => {
    if (!hasMore) return null;
    return <ActivityIndicator size="small" />;
  };

  return (
    <FlatList
      data={jobs}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => <JobCard job={item} />}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refresh} />
      }
    />
  );
};
```

### Resume Upload with Document Picker

```javascript
import React, { useState } from 'react';
import { View, Button, Text, Alert } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { resumeService } from './services/resumeService';

const ResumeUploadScreen = () => {
  const [uploading, setUploading] = useState(false);
  const [resume, setResume] = useState(null);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
      });

      const file = result[0];
      
      if (file.size > 5 * 1024 * 1024) {
        Alert.alert('Error', 'File size must be less than 5MB');
        return;
      }

      setUploading(true);
      const response = await resumeService.upload({
        uri: file.uri,
        name: file.name,
        type: file.type,
      });

      if (response.success) {
        setResume(response.data);
        Alert.alert('Success', 'Resume uploaded and analyzed successfully!');
      }
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        const message = error.response?.data?.message || 'Upload failed';
        Alert.alert('Error', message);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Button
        title={uploading ? 'Uploading...' : 'Select PDF Resume'}
        onPress={pickDocument}
        disabled={uploading}
      />
      
      {resume && (
        <View style={{ marginTop: 20 }}>
          <Text>File: {resume.resume.fileName}</Text>
          <Text>Skills: {resume.analysis.extractedSkills.join(', ')}</Text>
          <Text>Experience: {resume.analysis.totalExperience} years</Text>
          <Text>Summary: {resume.analysis.candidateSummary}</Text>
        </View>
      )}
    </View>
  );
};
```

---

## Testing

### API Health Check

```bash
curl -X GET https://your-backend-domain.com/api/health
```

### Test Registration

```bash
curl -X POST https://your-backend-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "role": "CANDIDATE",
    "fullName": "Test User"
  }'
```

### Test Login

```bash
curl -X POST https://your-backend-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

### Test Get Jobs

```bash
curl -X GET "https://your-backend-domain.com/api/candidate/jobs?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Support

For API issues or questions:
1. Check this documentation
2. Review error responses for specific messages
3. Verify authentication token is valid
4. Check network connectivity
5. Contact backend team with request/response details

---

**API Version:** 1.0.0  
**Last Updated:** January 2026
