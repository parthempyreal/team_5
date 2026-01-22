'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { api } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { JobPost } from '@/types';
import {
  formatCurrency,
  formatDate,
  formatEmploymentType,
  getStatusColor,
} from '@/lib/utils';

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const fetchJobs = async () => {
      try {
        const response = await api.getRecruiterJobs();
        if (response.success) {
          setJobs(response.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load jobs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [router]);

  if (isLoading) {
    return (
      <Layout>
        <LoadingSpinner message="Loading jobs..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <ErrorMessage message={error} />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Job Postings</h1>
            <p className="text-gray-600 mt-1">
              Manage all your job openings
            </p>
          </div>
          <button
            onClick={() => router.push('/jobs/create')}
            className="btn btn-primary"
          >
            Create New Job
          </button>
        </div>

        {jobs.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 mb-4">No job postings yet</p>
            <button
              onClick={() => router.push('/jobs/create')}
              className="btn btn-primary"
            >
              Create Your First Job
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="card hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/jobs/${job._id}`)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {job.title}
                      </h2>
                      <span
                        className={`badge ${getStatusColor(job.status)}`}
                      >
                        {job.status}
                      </span>
                      {job.aiGenerated && (
                        <span className="badge bg-purple-100 text-purple-800">
                          AI Generated
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                      <span>📍 {job.location}</span>
                      <span>
                        💼 {formatEmploymentType(job.employmentType)}
                      </span>
                      <span>
                        💰 {formatCurrency(job.salaryMin, job.currency)} -{' '}
                        {formatCurrency(job.salaryMax, job.currency)}
                      </span>
                      <span>
                        📅 {job.experienceMin}-{job.experienceMax} years
                      </span>
                      <span>👁️ {job.views} views</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {job.requiredSkills.slice(0, 5).map((skill) => (
                        <span
                          key={skill}
                          className="badge bg-blue-100 text-blue-800"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.requiredSkills.length > 5 && (
                        <span className="badge bg-gray-100 text-gray-800">
                          +{job.requiredSkills.length - 5} more
                        </span>
                      )}
                    </div>

                    {job.techStack && job.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="text-sm text-gray-600">
                          Tech Stack:
                        </span>
                        {job.techStack.slice(0, 5).map((tech) => (
                          <span
                            key={tech}
                            className="badge bg-gray-100 text-gray-800"
                          >
                            {tech}
                          </span>
                        ))}
                        {job.techStack.length > 5 && (
                          <span className="badge bg-gray-100 text-gray-800">
                            +{job.techStack.length - 5} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="text-sm text-gray-500">
                      Posted {formatDate(job.createdAt)}
                    </div>
                  </div>

                  {job.applicationCounts && (
                    <div className="ml-6 text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {job.applicationCounts.total}
                      </div>
                      <div className="text-sm text-gray-600">
                        Applications
                      </div>
                      <div className="mt-2 text-xs space-y-1">
                        <div className="text-green-600">
                          ⭐ {job.applicationCounts.shortlisted} shortlisted
                        </div>
                        <div className="text-blue-600">
                          📬 {job.applicationCounts.applied} new
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
