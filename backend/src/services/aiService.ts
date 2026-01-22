import { openai, OPENAI_MODEL, AI_CONFIG } from '../config/openai';
import { AIJobDescription, AIResumeAnalysis, AIMatchScore } from '../types';

export class AIService {
  /**
   * Generate job description using AI
   */
  static async generateJobDescription(
    jobTitle: string
  ): Promise<AIJobDescription> {
    try {
      const prompt = `You are an expert HR professional and technical recruiter. Generate a comprehensive job description for the position: "${jobTitle}".

Return a JSON object with the following structure:
{
  "description": "A detailed, professional job description (200-300 words) that includes: role overview, key responsibilities (5-7 bullet points), qualifications, and what makes this role exciting. Format with proper paragraphs and bullet points using \\n for line breaks.",
  "requiredSkills": ["skill1", "skill2", ...] (5-10 technical and soft skills),
  "techStack": ["tech1", "tech2", ...] (5-8 relevant technologies, frameworks, tools),
  "experienceMin": number (minimum years of experience required, 0-15),
  "experienceMax": number (maximum years of experience, must be >= experienceMin),
  "salaryMin": number (minimum annual salary in USD),
  "salaryMax": number (maximum annual salary in USD, must be >= salaryMin)
}

Make the salary range realistic for the US market based on the role level and requirements.
Ensure all arrays contain lowercase strings.
Return ONLY valid JSON, no additional text.`;

      const response = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content:
              'You are a professional HR assistant that generates detailed job descriptions. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: AI_CONFIG.temperature,
        max_tokens: AI_CONFIG.maxTokens,
        response_format: AI_CONFIG.responseFormat,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      const result = JSON.parse(content) as AIJobDescription;

      // Validate and normalize
      return {
        description: result.description,
        requiredSkills: result.requiredSkills.map((s) => s.toLowerCase()),
        techStack: result.techStack.map((t) => t.toLowerCase()),
        experienceMin: Math.max(0, result.experienceMin),
        experienceMax: Math.max(result.experienceMin, result.experienceMax),
        salaryMin: Math.max(0, result.salaryMin),
        salaryMax: Math.max(result.salaryMin, result.salaryMax),
      };
    } catch (error: any) {
      console.error('Error generating job description:', error);
      throw new Error(
        `Failed to generate job description: ${error.message}`
      );
    }
  }

  /**
   * Parse resume and extract structured information
   */
  static async parseResume(resumeText: string): Promise<AIResumeAnalysis> {
    try {
      const prompt = `You are an expert resume parser. Analyze the following resume text and extract structured information.

Resume Text:
${resumeText}

Return a JSON object with the following structure:
{
  "extractedSkills": ["skill1", "skill2", ...] (all technical and professional skills mentioned),
  "extractedTechStack": ["tech1", "tech2", ...] (programming languages, frameworks, tools, databases, cloud platforms),
  "totalExperience": number (total years of professional experience as a decimal, e.g., 3.5),
  "educationSummary": "Brief summary of educational background (degrees, institutions, graduation years)",
  "workExperience": [
    {
      "company": "Company Name",
      "position": "Job Title",
      "duration": "Start - End (e.g., Jan 2020 - Dec 2022)",
      "description": "Brief description of role and achievements"
    }
  ],
  "certifications": ["cert1", "cert2", ...] (any certifications or licenses),
  "keywords": ["keyword1", "keyword2", ...] (20-30 important keywords from the resume),
  "candidateSummary": "A 50-100 word professional summary of the candidate's profile, highlighting their expertise, experience level, and key strengths"
}

Extract as much relevant information as possible. If information is not available, use empty arrays or strings.
Ensure all skill and tech stack entries are lowercase.
Return ONLY valid JSON, no additional text.`;

      const response = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert resume parser that extracts structured data from resumes. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent parsing
        max_tokens: AI_CONFIG.maxTokens,
        response_format: AI_CONFIG.responseFormat,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      const result = JSON.parse(content) as AIResumeAnalysis;

      // Validate and normalize
      return {
        extractedSkills: result.extractedSkills.map((s) => s.toLowerCase()),
        extractedTechStack: result.extractedTechStack.map((t) =>
          t.toLowerCase()
        ),
        totalExperience: Math.max(0, Math.min(50, result.totalExperience)),
        educationSummary: result.educationSummary || '',
        workExperience: result.workExperience || [],
        certifications: result.certifications || [],
        keywords: result.keywords.map((k) => k.toLowerCase()),
        candidateSummary: result.candidateSummary || '',
      };
    } catch (error: any) {
      console.error('Error parsing resume:', error);
      throw new Error(`Failed to parse resume: ${error.message}`);
    }
  }

  /**
   * Calculate match score between candidate and job
   */
  static async calculateMatchScore(
    jobRequirements: {
      requiredSkills: string[];
      techStack: string[];
      experienceMin: number;
      experienceMax: number;
      jobTitle: string;
    },
    candidateProfile: {
      skills: string[];
      techStack: string[];
      experience: number;
      summary: string;
    }
  ): Promise<AIMatchScore> {
    try {
      const prompt = `You are an expert recruitment AI that matches candidates to job requirements.

Job Requirements:
- Title: ${jobRequirements.jobTitle}
- Required Skills: ${jobRequirements.requiredSkills.join(', ')}
- Tech Stack: ${jobRequirements.techStack.join(', ')}
- Experience Range: ${jobRequirements.experienceMin}-${jobRequirements.experienceMax} years

Candidate Profile:
- Skills: ${candidateProfile.skills.join(', ')}
- Tech Stack: ${candidateProfile.techStack.join(', ')}
- Experience: ${candidateProfile.experience} years
- Summary: ${candidateProfile.summary}

Analyze the match between candidate and job. Return a JSON object:
{
  "overallScore": number (0-100, weighted average of all scores),
  "skillMatchScore": number (0-100, percentage of required skills that candidate has),
  "experienceScore": number (0-100, how well experience matches - perfect match if within range, deduct points if outside),
  "techStackScore": number (0-100, percentage of required tech stack that candidate knows),
  "matchedSkills": ["skill1", "skill2", ...] (skills candidate has that match requirements),
  "missingSkills": ["skill1", "skill2", ...] (required skills candidate doesn't have),
  "reasoning": "2-3 sentence explanation of the match score, highlighting strengths and gaps"
}

Scoring guidelines:
- overallScore: (skillMatchScore * 0.4) + (experienceScore * 0.3) + (techStackScore * 0.3)
- Be fair but realistic in scoring
- Consider skill synonyms and related technologies

Return ONLY valid JSON, no additional text.`;

      const response = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert recruitment AI that calculates precise match scores between candidates and jobs. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: AI_CONFIG.maxTokens,
        response_format: AI_CONFIG.responseFormat,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      const result = JSON.parse(content) as AIMatchScore;

      // Validate scores are within range
      return {
        overallScore: Math.max(0, Math.min(100, result.overallScore)),
        skillMatchScore: Math.max(0, Math.min(100, result.skillMatchScore)),
        experienceScore: Math.max(0, Math.min(100, result.experienceScore)),
        techStackScore: Math.max(0, Math.min(100, result.techStackScore)),
        matchedSkills: result.matchedSkills.map((s) => s.toLowerCase()),
        missingSkills: result.missingSkills.map((s) => s.toLowerCase()),
        reasoning: result.reasoning,
      };
    } catch (error: any) {
      console.error('Error calculating match score:', error);
      throw new Error(`Failed to calculate match score: ${error.message}`);
    }
  }
}
