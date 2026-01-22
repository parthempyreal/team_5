'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import StatCard from '@/components/StatCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { api } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { DashboardStats } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await api.getDashboard();
        if (response.success) {
          setStats(response.data);
        }
      } catch (err: any) {
        setError(
          err.response?.data?.message || 'Failed to load dashboard stats'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  if (isLoading) {
    return (
      <Layout>
        <LoadingSpinner message="Loading dashboard..." />
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Overview of your recruitment activities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Jobs"
            value={stats?.totalJobs || 0}
            icon="📋"
            color="primary"
          />
          <StatCard
            title="Active Jobs"
            value={stats?.activeJobs || 0}
            icon="✅"
            color="green"
          />
          <StatCard
            title="Total Applications"
            value={stats?.totalApplications || 0}
            icon="📝"
            color="blue"
          />
          <StatCard
            title="Shortlisted"
            value={stats?.shortlisted || 0}
            icon="⭐"
            color="yellow"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Applied"
            value={stats?.applied || 0}
            icon="📬"
            color="blue"
          />
          <StatCard
            title="Rejected"
            value={stats?.rejected || 0}
            icon="❌"
            color="red"
          />
          <StatCard
            title="Hired"
            value={stats?.hired || 0}
            icon="🎉"
            color="purple"
          />
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/jobs/create')}
              className="btn btn-primary text-left px-6 py-4"
            >
              <div>
                <div className="text-lg font-semibold">Create New Job</div>
                <div className="text-sm opacity-90 mt-1">
                  Post a new job opening with AI assistance
                </div>
              </div>
            </button>
            <button
              onClick={() => router.push('/jobs')}
              className="btn btn-secondary text-left px-6 py-4"
            >
              <div>
                <div className="text-lg font-semibold">View All Jobs</div>
                <div className="text-sm opacity-90 mt-1">
                  Manage your existing job postings
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
