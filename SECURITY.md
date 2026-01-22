# Security Considerations

## Overview

This document outlines the security measures implemented in the AI-Powered ATS system and best practices for maintaining security in production.

---

## Authentication & Authorization

### JWT Token Strategy

**Access Tokens**
- Short-lived (15 minutes by default)
- Stored in memory (localStorage) on client
- Used for API authentication
- Contains minimal payload: userId, email, role

**Refresh Tokens**
- Long-lived (7 days by default)
- Can be stored in httpOnly cookies (recommended) or localStorage
- Used to obtain new access tokens
- Rotates on use for enhanced security

### Password Security

**Hashing**
- bcrypt with 12 salt rounds
- Passwords never stored in plain text
- Passwords excluded from API responses (using Mongoose transform)

**Requirements**
- Minimum 8 characters
- Must contain uppercase letter
- Must contain lowercase letter
- Must contain number
- Validated on both frontend and backend

### Role-Based Access Control (RBAC)

**Roles:**
- `RECRUITER`: Can create jobs, view applications, shortlist/reject candidates
- `CANDIDATE`: Can upload resumes, browse jobs, apply to jobs

**Middleware:**
- `authenticate`: Verifies JWT token
- `authorize`: Checks user role against required roles
- Applied to all protected routes

---

## Data Protection

### Input Validation

**Frontend (YUP)**
- Email format validation
- Password strength validation
- Data type validation
- Range validation (experience, salary)

**Backend (express-validator)**
- All inputs validated against schema
- Sanitization of string inputs
- Type coercion for numbers
- Custom validation rules

### XSS Prevention

**Measures:**
- All user inputs sanitized before storage
- React automatically escapes JSX content
- Content-Type headers properly set
- CSP headers via helmet.js

### SQL/NoSQL Injection Prevention

**MongoDB Protection:**
- Mongoose schema validation
- Type casting prevents injection
- Query parameterization
- No dynamic query construction from user input

### CSRF Protection

**Stateless Architecture:**
- JWT tokens (not cookies for auth)
- No session state on server
- Origin/Referer header validation via CORS

---

## API Security

### CORS Configuration

```typescript
// Configured in backend/src/app.ts
const corsOptions = {
  origin: process.env.CORS_ORIGIN, // Whitelist specific domains
  credentials: true,
  optionsSuccessStatus: 200,
};
```

**Production Setup:**
- Set `CORS_ORIGIN` to frontend domain only
- Never use `*` in production
- Validate origin for each request

### Rate Limiting

**Recommended Configuration:**

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP
  message: 'Too many requests',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Stricter limits for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
```

### Helmet.js Security Headers

Already configured in `backend/src/app.ts`:

```typescript
app.use(helmet());
```

**Headers Set:**
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security (HSTS)
- Content-Security-Policy

---

## File Upload Security

### Validation

**File Type:**
- Only PDF files allowed
- MIME type validation: `application/pdf`
- File extension check

**File Size:**
- Maximum 5MB per file
- Configurable via `MAX_FILE_SIZE` env var

**Storage:**
- Files stored outside web root
- Unique filenames (timestamp + random)
- No direct URL access (serve via authenticated endpoint)

### Malware Scanning (Recommended)

For production, integrate virus scanning:

```typescript
import clamav from 'clamav.js';

// After file upload, before processing
const scanResult = await clamav.isInfected(filePath);
if (scanResult.isInfected) {
  fs.unlinkSync(filePath);
  throw new Error('File contains malware');
}
```

---

## Database Security

### MongoDB Security Checklist

- [ ] Enable authentication
- [ ] Use strong passwords (min 20 chars)
- [ ] Restrict network access (IP whitelist)
- [ ] Use SSL/TLS for connections
- [ ] Enable audit logging
- [ ] Regular backups
- [ ] Principle of least privilege (user permissions)
- [ ] Keep MongoDB version updated

### Connection String Security

**Good:**
```
mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority
```

**Bad:**
```
mongodb://0.0.0.0:27017/dbname
```

### Sensitive Data

**Never Log:**
- Passwords
- JWT tokens
- API keys
- Personal identification numbers

**Encryption at Rest:**
- Use MongoDB encrypted storage engine
- Or encrypt sensitive fields before storage

---

## Environment Variables

### Required Secrets

**Critical (Change Immediately):**
```env
JWT_SECRET=<64+ random characters>
JWT_REFRESH_SECRET=<64+ random characters>
OPENAI_API_KEY=<your-key>
```

**Generate Strong Secrets:**
```bash
# Using OpenSSL
openssl rand -base64 64

# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

### .env File Protection

**Never:**
- Commit `.env` to version control
- Share `.env` files via email/Slack
- Use same secrets across environments

**Always:**
- Add `.env` to `.gitignore`
- Use environment-specific values
- Rotate secrets regularly (quarterly)
- Use secret management tools (AWS Secrets Manager, HashiCorp Vault)

---

## OpenAI API Security

### Key Protection

**Best Practices:**
- Store API key in environment variables only
- Never expose in frontend code
- Rotate keys periodically
- Monitor usage for anomalies
- Set usage limits in OpenAI dashboard

### Prompt Injection Prevention

**Measures:**
- Validate user inputs before sending to OpenAI
- Use system prompts to constrain responses
- Sanitize AI responses before storing
- Never execute code from AI responses
- Limit token usage per request

### Cost Management

**Safeguards:**
- Set max_tokens limit
- Implement request queuing
- Monitor daily spending
- Set up billing alerts
- Cache AI responses when possible

---

## Session Management

### Token Lifecycle

**Access Token:**
1. Generated on login
2. Expires in 15 minutes
3. Validated on each request
4. Cannot be revoked (short lifetime mitigates risk)

**Refresh Token:**
1. Generated on login
2. Expires in 7 days
3. Used to get new access token
4. Rotates on use (old token invalidated)

### Logout Handling

**Client-Side:**
- Clear localStorage
- Remove tokens from memory
- Redirect to login page

**Server-Side (Optional):**
- Implement token blacklist in Redis
- Add revoked tokens to blacklist
- Check blacklist on each request

---

## Error Handling

### Information Disclosure Prevention

**Bad:**
```json
{
  "error": "MongoError: E11000 duplicate key error collection: ats.users index: email_1 dup key: { email: \"user@example.com\" }",
  "stack": "Error\n    at /app/node_modules/mongodb/..."
}
```

**Good:**
```json
{
  "success": false,
  "message": "Email already exists"
}
```

### Error Logging

**Log Internally (Server):**
- Full error details
- Stack traces
- Request context

**Return to Client:**
- Generic error message
- Error code/type
- Field-specific validation errors (safe)

---

## Production Security Checklist

### Pre-Deployment

- [ ] All secrets in environment variables
- [ ] Strong JWT secrets (64+ chars)
- [ ] CORS restricted to frontend domain
- [ ] HTTPS/SSL enabled
- [ ] Database authentication enabled
- [ ] Database network restricted
- [ ] Rate limiting configured
- [ ] Helmet.js enabled
- [ ] File upload validation
- [ ] Error handling sanitized
- [ ] Dependencies updated
- [ ] Security audit completed

### Post-Deployment

- [ ] Monitor error logs daily
- [ ] Review access logs weekly
- [ ] Rotate secrets quarterly
- [ ] Update dependencies monthly
- [ ] Penetration testing (annually)
- [ ] Backup verification (weekly)
- [ ] Incident response plan ready

---

## Vulnerability Management

### Dependency Scanning

**Automated:**
```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Check specific severity
npm audit --production
```

**Tools:**
- Snyk (https://snyk.io/)
- GitHub Dependabot
- npm audit
- OWASP Dependency-Check

### Security Updates

**Schedule:**
- Critical: Within 24 hours
- High: Within 1 week
- Medium: Within 1 month
- Low: Next regular update cycle

---

## Incident Response

### Security Breach Protocol

**Immediate Actions:**
1. Isolate affected systems
2. Preserve evidence (logs, database)
3. Rotate all secrets immediately
4. Invalidate all active sessions
5. Notify stakeholders

**Investigation:**
1. Identify breach vector
2. Assess data exposure
3. Document timeline
4. Determine root cause

**Recovery:**
1. Patch vulnerabilities
2. Restore from clean backup
3. Implement additional safeguards
4. Monitor for recurrence

**Post-Incident:**
1. Update security policies
2. Improve monitoring
3. Train team on lessons learned
4. Comply with legal requirements (GDPR, etc.)

---

## Compliance & Privacy

### GDPR Considerations

**Data Collection:**
- Collect only necessary data
- Clear privacy policy
- User consent for data processing
- Right to access data
- Right to deletion
- Data portability

**Implementation:**
- Add endpoints for data export
- Add endpoint for account deletion
- Anonymize analytics data
- Encrypt sensitive data
- Log data access

### Data Retention

**Recommended Policies:**
- Active applications: Retain 1 year
- Rejected applications: 6 months
- User accounts: Until deletion request
- Audit logs: 90 days
- Error logs: 30 days

---

## Monitoring & Alerts

### What to Monitor

**Security Events:**
- Failed login attempts (>5 in 10 min)
- Password reset requests
- API rate limit hits
- 401/403 errors spike
- Database connection failures
- Unusual API usage patterns

### Alert Configuration

**Critical (Immediate):**
- Multiple failed logins
- Database breach attempt
- API key compromise
- Server down

**Warning (Daily Summary):**
- High rate limit hits
- Validation errors spike
- Slow response times
- Disk space low

---

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

## Contact

For security issues or vulnerabilities, please contact the security team immediately. Do not create public issues.
