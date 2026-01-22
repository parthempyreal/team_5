# Quick Start Guide

Get the AI-Powered ATS running locally in 10 minutes.

---

## Prerequisites

- Node.js 18+ installed
- MongoDB installed and running (or MongoDB Atlas account)
- OpenAI API key
- Terminal/Command Prompt

---

## Step 1: Clone & Install

```bash
# Navigate to project directory
cd test\ 3

# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## Step 2: Configure Environment Variables

### Backend Configuration

Create `backend/.env` file:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-ats
JWT_SECRET=your-super-secret-jwt-key-change-this-min-64-characters-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-min-64-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
OPENAI_API_KEY=sk-your-openai-api-key-here
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=application/pdf
CORS_ORIGIN=http://localhost:3000
```

**Important:** Replace `OPENAI_API_KEY` with your actual OpenAI API key.

### Frontend Configuration

Create `frontend/.env.local` file:

```bash
cd ../frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Step 3: Start MongoDB

### Option A: Local MongoDB

```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

### Option B: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster
4. Get connection string
5. Update `MONGODB_URI` in `backend/.env`

---

## Step 4: Seed Database

```bash
cd backend
npm run seed
```

You should see:
```
✅ MongoDB connected successfully
🌱 Seeding skills...
   ✅ Seeded 100+ skills
✅ Database seeding completed successfully!
```

---

## Step 5: Start Backend

```bash
# In backend directory
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server running in development mode
📡 API available at: http://localhost:5000
🏥 Health check: http://localhost:5000/api/health
```

Test backend:
```bash
curl http://localhost:5000/api/health
```

---

## Step 6: Start Frontend

Open a new terminal:

```bash
cd frontend
npm run dev
```

You should see:
```
▲ Next.js 14.1.0
- Local:        http://localhost:3000
✓ Ready in 2.1s
```

---

## Step 7: Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

---

## Step 8: Create Your First Account

1. You'll be redirected to the login page
2. Click "Sign up"
3. Fill in the registration form:
   - **Full Name**: John Recruiter
   - **Email**: recruiter@company.com
   - **Company Name**: Tech Corp
   - **Password**: Test123! (or create your own)
   - **Confirm Password**: Test123!
4. Click "Create Account"
5. You'll be logged in and redirected to the dashboard

---

## Step 9: Create Your First Job (with AI!)

1. Click "Create Job" from the dashboard or navigation
2. Enter a **Job Title**: "Senior Full Stack Engineer"
3. Click "**Generate with AI**" button
4. Wait 3-5 seconds while AI generates the job description
5. Review the AI-generated content:
   - Job description (200+ words)
   - Required skills
   - Tech stack
   - Experience range
   - Salary range
6. (Optional) Edit any fields as needed
7. Add **Location**: "San Francisco, CA (Remote)"
8. Click "**Create Job Post**"
9. Success! Your job is now live

---

## Step 10: Test the Complete Flow (Optional)

### As a Candidate:

1. **Logout** from the recruiter account
2. **Sign up** as a candidate:
   - Email: candidate@example.com
   - Password: Test123!
   - Role will be CANDIDATE (default for mobile)
3. **Upload Resume**:
   - Navigate to Resume Upload
   - Upload a PDF resume
   - Wait for AI to parse it
4. **Browse Jobs**:
   - View the job you created
   - See job details
5. **Apply to Job**:
   - Click "Apply"
   - Add optional cover letter
   - Submit application
   - See your AI-calculated match score!

### Back to Recruiter:

1. **Logout** and **login** as recruiter
2. **View Applications**:
   - Go to "Jobs"
   - Click on your job
   - See the application with:
     - AI match score (percentage)
     - Skill breakdown
     - Tech stack match
     - Candidate summary
3. **Filter Applications**:
   - Try filtering by match score
   - Filter by skills
   - Filter by experience
4. **Shortlist or Reject**:
   - Click "Shortlist" to move candidate forward
   - Click "Reject" to decline application

---

## Troubleshooting

### Backend Won't Start

**Problem:** `MongooseError: connect ECONNREFUSED`

**Solution:** Make sure MongoDB is running:
```bash
# Check MongoDB status
brew services list | grep mongodb  # macOS
sudo systemctl status mongod       # Linux
```

---

**Problem:** `Error: OPENAI_API_KEY not found`

**Solution:** Check your `backend/.env` file:
```bash
cat backend/.env | grep OPENAI_API_KEY
```

---

### Frontend Won't Connect to Backend

**Problem:** CORS errors in browser console

**Solution:** Verify CORS_ORIGIN in backend:
```env
CORS_ORIGIN=http://localhost:3000
```

---

**Problem:** 401 Unauthorized errors

**Solution:** 
1. Clear browser localStorage
2. Logout and login again
3. Check JWT_SECRET is set in backend

---

### AI Features Not Working

**Problem:** "Failed to generate job description"

**Solution:**
1. Verify OpenAI API key is correct
2. Check OpenAI account has credits
3. Check internet connection
4. View backend logs for specific error

---

## Next Steps

Now that you have the system running:

1. **Explore Features**:
   - Create multiple jobs
   - Upload different resumes
   - Test AI matching scores
   - Try different filters

2. **Read Documentation**:
   - [README.md](./README.md) - Overview & features
   - [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
   - [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API reference
   - [DEPLOYMENT.md](./DEPLOYMENT.md) - Deploy to production

3. **Customize**:
   - Modify UI styling in `frontend/src/app/globals.css`
   - Add more skills in `backend/src/seeders/data/skills.ts`
   - Adjust AI prompts in `backend/src/services/aiService.ts`

4. **Deploy**:
   - Follow [DEPLOYMENT.md](./DEPLOYMENT.md) guide
   - Deploy backend to Railway/Render
   - Deploy frontend to Vercel

---

## Common Commands Reference

### Backend
```bash
npm run dev          # Start development server
npm run build        # Build TypeScript
npm start            # Start production server
npm run seed         # Seed database
npm run seed:clear   # Clear all data
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run linter
```

---

## Getting Help

- **Issues**: Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Security**: See [SECURITY.md](./SECURITY.md)
- **API**: Refer to [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## What's Next?

You now have a fully functional AI-powered ATS system! Here's what makes it special:

- **AI Job Generation**: Create professional job descriptions in seconds
- **Smart Resume Parsing**: Extract skills, experience, and qualifications automatically
- **Intelligent Matching**: AI calculates compatibility scores between candidates and jobs
- **Advanced Filtering**: Find the perfect candidates with AI-powered search
- **Production-Ready**: Built with enterprise-grade architecture

Ready to deploy? Check out [DEPLOYMENT.md](./DEPLOYMENT.md)!
