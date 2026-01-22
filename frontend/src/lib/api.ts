import axios, { AxiosError, AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.clearAuth();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  private clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  }

  // Auth methods
  async register(data: {
    email: string;
    password: string;
    role: string;
    fullName: string;
    companyName?: string;
  }) {
    const response = await this.client.post('/auth/register', data);
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    return response.data;
  }

  async getProfile() {
    const response = await this.client.get('/auth/profile');
    return response.data;
  }

  // Recruiter methods
  async generateJobDescription(jobTitle: string) {
    const response = await this.client.post(
      '/recruiter/jobs/generate-description',
      { jobTitle }
    );
    return response.data;
  }

  async createJob(jobData: any) {
    const response = await this.client.post('/recruiter/jobs', jobData);
    return response.data;
  }

  async getRecruiterJobs(params?: any) {
    const response = await this.client.get('/recruiter/jobs', { params });
    return response.data;
  }

  async getJobById(jobId: string) {
    const response = await this.client.get(`/recruiter/jobs/${jobId}`);
    return response.data;
  }

  async getJobApplications(jobId: string, params?: any) {
    const response = await this.client.get(
      `/recruiter/jobs/${jobId}/applications`,
      { params }
    );
    return response.data;
  }

  async acceptApplication(applicationId: string, notes?: string) {
    const response = await this.client.put(
      `/recruiter/applications/${applicationId}/accept`,
      { notes }
    );
    return response.data;
  }

  async rejectApplication(applicationId: string, notes?: string) {
    const response = await this.client.put(
      `/recruiter/applications/${applicationId}/reject`,
      { notes }
    );
    return response.data;
  }

  async getDashboard() {
    const response = await this.client.get('/recruiter/dashboard');
    return response.data;
  }

  // Candidate methods (for future mobile app)
  async browseJobs(params?: any) {
    const response = await this.client.get('/candidate/jobs', { params });
    return response.data;
  }

  async uploadResume(file: File) {
    const formData = new FormData();
    formData.append('resume', file);
    const response = await this.client.post('/candidate/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async applyToJob(jobId: string, coverLetter?: string) {
    const response = await this.client.post('/candidate/applications', {
      jobId,
      coverLetter,
    });
    return response.data;
  }

  async getMyApplications(params?: any) {
    const response = await this.client.get('/candidate/applications', { params });
    return response.data;
  }
}

export const api = new ApiClient();
