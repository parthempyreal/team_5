'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { api } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { Application } from '@/types';
import {
  getMatchScoreColor,
  getMatchScoreBg,
  getStatusColor,
  formatDate,
} from '@/lib/utils';

export default function ApplicationsPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    minMatchScore: '',
    skills: '',
    techStack: '',
    experienceMin: '',
    experienceMax: '',
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    fetchApplications();
  }, [router, jobId]);

  useEffect(() => {
    applyFilters();
  }, [applications, filters]);

  const fetchApplications = async () => {
    try {
      const response = await api.getJobApplications(jobId);
      if (response.success) {
        setApplications(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...applications];

    if (filters.status) {
      filtered = filtered.filter((app) => app.status === filters.status);
    }

    if (filters.minMatchScore) {
      const minScore = parseInt(filters.minMatchScore);
      filtered = filtered.filter(
        (app) => app.matchScore && app.matchScore.overallScore >= minScore
      );
    }

    if (filters.skills) {
      const skills = filters.skills.toLowerCase().split(',').map((s) => s.trim());
      filtered = filtered.filter((app) =>
        skills.some((skill) =>
          app.resumeAnalysis?.extractedSkills.includes(skill)
        )
      );
    }

    if (filters.techStack) {
      const tech = filters.techStack.toLowerCase().split(',').map((t) => t.trim());
      filtered = filtered.filter((app) =>
        tech.some((t) => app.resumeAnalysis?.extractedTechStack.includes(t))
      );
    }

    if (filters.experienceMin) {
      const minExp = parseFloat(filters.experienceMin);
      filtered = filtered.filter(
        (app) =>
          app.resumeAnalysis && app.resumeAnalysis.totalExperience >= minExp
      );
    }

    if (filters.experienceMax) {
      const maxExp = parseFloat(filters.experienceMax);
      filtered = filtered.filter(
        (app) =>
          app.resumeAnalysis && app.resumeAnalysis.totalExperience <= maxExp
      );
    }

    // Sort by match score (highest first)
    filtered.sort((a, b) => {
      const scoreA = a.matchScore?.overallScore || 0;
      const scoreB = b.matchScore?.overallScore || 0;
      return scoreB - scoreA;
    });

    setFilteredApplications(filtered);
  };

  const handleAccept = async (applicationId: string) => {
    if (!confirm('Are you sure you want to shortlist this candidate?')) return;

    try {
      setProcessingId(applicationId);
      await api.acceptApplication(applicationId);
      fetchApplications();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to accept application');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (applicationId: string) => {
    if (!confirm('Are you sure you want to reject this candidate?')) return;

    try {
      setProcessingId(applicationId);
      await api.rejectApplication(applicationId);
      fetchApplications();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject application');
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <LoadingSpinner message="Loading applications..." />
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
        <div>
          <button
            onClick={() => router.push('/jobs')}
            className="text-primary-600 hover:text-primary-700 mb-4 inline-flex items-center"
          >
            ← Back to Jobs
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-600 mt-1">
            {applications.length} total applications
          </p>
        </div>

        {/* Filters */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Filter Applications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Status</label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="input"
              >
                <option value="">All Statuses</option>
                <option value="APPLIED">Applied</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="REJECTED">Rejected</option>
                <option value="HIRED">Hired</option>
              </select>
            </div>

            <div>
              <label className="label">Minimum Match Score (%)</label>
              <input
                type="number"
                value={filters.minMatchScore}
                onChange={(e) =>
                  setFilters({ ...filters, minMatchScore: e.target.value })
                }
                className="input"
                placeholder="e.g., 70"
                min="0"
                max="100"
              />
            </div>

            <div>
              <label className="label">Skills (comma-separated)</label>
              <input
                type="text"
                value={filters.skills}
                onChange={(e) =>
                  setFilters({ ...filters, skills: e.target.value })
                }
                className="input"
                placeholder="react, node.js, python"
              />
            </div>

            <div>
              <label className="label">Tech Stack (comma-separated)</label>
              <input
                type="text"
                value={filters.techStack}
                onChange={(e) =>
                  setFilters({ ...filters, techStack: e.target.value })
                }
                className="input"
                placeholder="docker, kubernetes, aws"
              />
            </div>

            <div>
              <label className="label">Min Experience (years)</label>
              <input
                type="number"
                value={filters.experienceMin}
                onChange={(e) =>
                  setFilters({ ...filters, experienceMin: e.target.value })
                }
                className="input"
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label className="label">Max Experience (years)</label>
              <input
                type="number"
                value={filters.experienceMax}
                onChange={(e) =>
                  setFilters({ ...filters, experienceMax: e.target.value })
                }
                className="input"
                placeholder="50"
                min="0"
              />
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={() =>
                setFilters({
                  status: '',
                  minMatchScore: '',
                  skills: '',
                  techStack: '',
                  experienceMin: '',
                  experienceMax: '',
                })
              }
              className="btn btn-secondary text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600">No applications match your filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <div key={application._id} className="card hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {application.candidateId.fullName}
                      </h3>
                      <span
                        className={`badge ${getStatusColor(application.status)}`}
                      >
                        {application.status}
                      </span>
                      {application.matchScore && (
                        <span
                          className={`badge ${getMatchScoreBg(
                            application.matchScore.overallScore
                          )} ${getMatchScoreColor(
                            application.matchScore.overallScore
                          )}`}
                        >
                          {application.matchScore.overallScore}% Match
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-gray-600 mb-3">
                      <span>📧 {application.candidateId.email}</span>
                      {application.resumeAnalysis && (
                        <span className="ml-4">
                          📅 {application.resumeAnalysis.totalExperience} years
                          experience
                        </span>
                      )}
                      <span className="ml-4">
                        Applied {formatDate(application.appliedDate)}
                      </span>
                    </div>

                    {application.resumeAnalysis && (
                      <>
                        <div className="mb-3">
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {application.resumeAnalysis.candidateSummary}
                          </p>
                        </div>

                        <div className="mb-3">
                          <span className="text-sm font-medium text-gray-700">
                            Skills:
                          </span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {application.resumeAnalysis.extractedSkills
                              .slice(0, 10)
                              .map((skill) => (
                                <span
                                  key={skill}
                                  className="badge bg-blue-100 text-blue-800"
                                >
                                  {skill}
                                </span>
                              ))}
                            {application.resumeAnalysis.extractedSkills.length >
                              10 && (
                              <span className="badge bg-gray-100 text-gray-800">
                                +
                                {application.resumeAnalysis.extractedSkills
                                  .length - 10}{' '}
                                more
                              </span>
                            )}
                          </div>
                        </div>

                        {application.resumeAnalysis.extractedTechStack.length >
                          0 && (
                          <div className="mb-3">
                            <span className="text-sm font-medium text-gray-700">
                              Tech Stack:
                            </span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {application.resumeAnalysis.extractedTechStack
                                .slice(0, 10)
                                .map((tech) => (
                                  <span
                                    key={tech}
                                    className="badge bg-gray-100 text-gray-800"
                                  >
                                    {tech}
                                  </span>
                                ))}
                              {application.resumeAnalysis.extractedTechStack
                                .length > 10 && (
                                <span className="badge bg-gray-100 text-gray-800">
                                  +
                                  {application.resumeAnalysis.extractedTechStack
                                    .length - 10}{' '}
                                  more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {application.matchScore && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">
                          AI Match Analysis
                        </h4>
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div>
                            <div className="text-xs text-gray-600">
                              Skill Match
                            </div>
                            <div
                              className={`text-lg font-semibold ${getMatchScoreColor(
                                application.matchScore.skillMatchScore
                              )}`}
                            >
                              {application.matchScore.skillMatchScore}%
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">
                              Experience
                            </div>
                            <div
                              className={`text-lg font-semibold ${getMatchScoreColor(
                                application.matchScore.experienceScore
                              )}`}
                            >
                              {application.matchScore.experienceScore}%
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">
                              Tech Stack
                            </div>
                            <div
                              className={`text-lg font-semibold ${getMatchScoreColor(
                                application.matchScore.techStackScore
                              )}`}
                            >
                              {application.matchScore.techStackScore}%
                            </div>
                          </div>
                        </div>
                        {application.matchScore.matchedSkills.length > 0 && (
                          <div className="text-xs text-gray-700 mb-2">
                            <span className="font-medium">Matched:</span>{' '}
                            {application.matchScore.matchedSkills.join(', ')}
                          </div>
                        )}
                        {application.matchScore.missingSkills.length > 0 && (
                          <div className="text-xs text-gray-700">
                            <span className="font-medium">Missing:</span>{' '}
                            {application.matchScore.missingSkills.join(', ')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {application.status === 'APPLIED' && (
                    <div className="ml-6 flex flex-col gap-2">
                      <button
                        onClick={() => handleAccept(application._id)}
                        disabled={processingId === application._id}
                        className="btn btn-success text-sm whitespace-nowrap"
                      >
                        Shortlist
                      </button>
                      <button
                        onClick={() => handleReject(application._id)}
                        disabled={processingId === application._id}
                        className="btn btn-danger text-sm whitespace-nowrap"
                      >
                        Reject
                      </button>
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
