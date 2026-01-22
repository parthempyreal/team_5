'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { api } from '@/lib/api';
import { jobPostSchema, generateJobDescriptionSchema } from '@/validations/jobSchemas';
import { EmploymentType, JobStatus } from '@/types';

export default function CreateJobPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    experienceMin: 0,
    experienceMax: 5,
    salaryMin: 0,
    salaryMax: 0,
    currency: 'USD',
    employmentType: EmploymentType.FULL_TIME,
    requiredSkills: [] as string[],
    techStack: [] as string[],
    status: JobStatus.ACTIVE,
    aiGenerated: false,
  });

  const [skillInput, setSkillInput] = useState('');
  const [techInput, setTechInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === 'number'
          ? parseFloat(value) || 0
          : value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleGenerateDescription = async () => {
    if (!formData.title) {
      setErrors({ title: 'Please enter a job title first' });
      return;
    }

    try {
      await generateJobDescriptionSchema.validate(
        { jobTitle: formData.title },
        { abortEarly: false }
      );

      setIsGenerating(true);
      setApiError('');

      const response = await api.generateJobDescription(formData.title);

      if (response.success) {
        const aiData = response.data;
        setFormData({
          ...formData,
          description: aiData.description,
          requiredSkills: aiData.requiredSkills,
          techStack: aiData.techStack,
          experienceMin: aiData.experienceMin,
          experienceMax: aiData.experienceMax,
          salaryMin: aiData.salaryMin,
          salaryMax: aiData.salaryMax,
          aiGenerated: true,
        });
      }
    } catch (error: any) {
      setApiError(
        error.response?.data?.message ||
          'Failed to generate job description. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.requiredSkills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        requiredSkills: [...formData.requiredSkills, skillInput.trim()],
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      requiredSkills: formData.requiredSkills.filter((s) => s !== skill),
    });
  };

  const addTech = () => {
    if (techInput.trim() && !formData.techStack.includes(techInput.trim())) {
      setFormData({
        ...formData,
        techStack: [...formData.techStack, techInput.trim()],
      });
      setTechInput('');
    }
  };

  const removeTech = (tech: string) => {
    setFormData({
      ...formData,
      techStack: formData.techStack.filter((t) => t !== tech),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiError('');

    try {
      await jobPostSchema.validate(formData, { abortEarly: false });

      setIsLoading(true);
      const response = await api.createJob(formData);

      if (response.success) {
        router.push('/jobs');
      }
    } catch (error: any) {
      if (error.name === 'ValidationError') {
        const validationErrors: Record<string, string> = {};
        error.inner.forEach((err: any) => {
          validationErrors[err.path] = err.message;
        });
        setErrors(validationErrors);
      } else {
        setApiError(
          error.response?.data?.message ||
            'Failed to create job. Please try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Job Post</h1>
          <p className="text-gray-600 mt-1">
            Use AI to generate a professional job description
          </p>
        </div>

        {apiError && <ErrorMessage message={apiError} />}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="label">
                  Job Title
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="input flex-1"
                    placeholder="Senior Full Stack Engineer"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateDescription}
                    disabled={isGenerating || !formData.title}
                    className="btn btn-secondary whitespace-nowrap"
                  >
                    {isGenerating ? 'Generating...' : 'Generate with AI'}
                  </button>
                </div>
                {errors.title && (
                  <p className="text-red-600 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label htmlFor="location" className="label">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="input"
                  placeholder="San Francisco, CA (Remote)"
                />
                {errors.location && (
                  <p className="text-red-600 text-sm mt-1">{errors.location}</p>
                )}
              </div>

              <div>
                <label htmlFor="employmentType" className="label">
                  Employment Type
                </label>
                <select
                  id="employmentType"
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  className="input"
                >
                  <option value={EmploymentType.FULL_TIME}>Full Time</option>
                  <option value={EmploymentType.PART_TIME}>Part Time</option>
                  <option value={EmploymentType.CONTRACT}>Contract</option>
                  <option value={EmploymentType.INTERNSHIP}>Internship</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Job Description
            </h2>

            <div>
              <label htmlFor="description" className="label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={12}
                className="input"
                placeholder="Describe the role, responsibilities, and requirements..."
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description}</p>
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Experience & Salary
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="experienceMin" className="label">
                  Minimum Experience (years)
                </label>
                <input
                  type="number"
                  id="experienceMin"
                  name="experienceMin"
                  value={formData.experienceMin}
                  onChange={handleChange}
                  className="input"
                  min="0"
                  max="50"
                />
                {errors.experienceMin && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.experienceMin}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="experienceMax" className="label">
                  Maximum Experience (years)
                </label>
                <input
                  type="number"
                  id="experienceMax"
                  name="experienceMax"
                  value={formData.experienceMax}
                  onChange={handleChange}
                  className="input"
                  min="0"
                  max="50"
                />
                {errors.experienceMax && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.experienceMax}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="salaryMin" className="label">
                  Minimum Salary
                </label>
                <input
                  type="number"
                  id="salaryMin"
                  name="salaryMin"
                  value={formData.salaryMin}
                  onChange={handleChange}
                  className="input"
                  min="0"
                  step="1000"
                />
                {errors.salaryMin && (
                  <p className="text-red-600 text-sm mt-1">{errors.salaryMin}</p>
                )}
              </div>

              <div>
                <label htmlFor="salaryMax" className="label">
                  Maximum Salary
                </label>
                <input
                  type="number"
                  id="salaryMax"
                  name="salaryMax"
                  value={formData.salaryMax}
                  onChange={handleChange}
                  className="input"
                  min="0"
                  step="1000"
                />
                {errors.salaryMax && (
                  <p className="text-red-600 text-sm mt-1">{errors.salaryMax}</p>
                )}
              </div>

              <div>
                <label htmlFor="currency" className="label">
                  Currency
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Required Skills
            </h2>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  className="input flex-1"
                  placeholder="Enter skill and press Add"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="btn btn-secondary"
                >
                  Add
                </button>
              </div>

              {formData.requiredSkills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="badge bg-blue-100 text-blue-800 flex items-center gap-2"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="hover:text-blue-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {errors.requiredSkills && (
                <p className="text-red-600 text-sm">{errors.requiredSkills}</p>
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Tech Stack (Optional)
            </h2>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                  className="input flex-1"
                  placeholder="Enter technology and press Add"
                />
                <button
                  type="button"
                  onClick={addTech}
                  className="btn btn-secondary"
                >
                  Add
                </button>
              </div>

              {formData.techStack.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="badge bg-gray-100 text-gray-800 flex items-center gap-2"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTech(tech)}
                        className="hover:text-gray-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary flex-1"
            >
              {isLoading ? 'Creating Job...' : 'Create Job Post'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/jobs')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
