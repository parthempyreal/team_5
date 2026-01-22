import * as yup from 'yup';

export const jobPostSchema = yup.object().shape({
  title: yup
    .string()
    .min(3, 'Job title must be at least 3 characters')
    .max(200, 'Job title cannot exceed 200 characters')
    .required('Job title is required'),
  description: yup
    .string()
    .min(50, 'Job description must be at least 50 characters')
    .max(5000, 'Job description cannot exceed 5000 characters')
    .required('Job description is required'),
  location: yup
    .string()
    .min(2, 'Location must be at least 2 characters')
    .required('Location is required'),
  experienceMin: yup
    .number()
    .min(0, 'Experience cannot be negative')
    .max(50, 'Experience cannot exceed 50 years')
    .required('Minimum experience is required'),
  experienceMax: yup
    .number()
    .min(0, 'Experience cannot be negative')
    .max(50, 'Experience cannot exceed 50 years')
    .test(
      'is-greater',
      'Maximum experience must be greater than or equal to minimum',
      function (value) {
        const { experienceMin } = this.parent;
        return value >= experienceMin;
      }
    )
    .required('Maximum experience is required'),
  salaryMin: yup
    .number()
    .min(0, 'Salary cannot be negative')
    .required('Minimum salary is required'),
  salaryMax: yup
    .number()
    .min(0, 'Salary cannot be negative')
    .test(
      'is-greater',
      'Maximum salary must be greater than or equal to minimum',
      function (value) {
        const { salaryMin } = this.parent;
        return value >= salaryMin;
      }
    )
    .required('Maximum salary is required'),
  currency: yup
    .string()
    .oneOf(['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'])
    .required('Currency is required'),
  employmentType: yup
    .string()
    .oneOf(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'])
    .required('Employment type is required'),
  requiredSkills: yup
    .array()
    .of(yup.string().required())
    .min(1, 'At least one skill is required')
    .required('Skills are required'),
  techStack: yup.array().of(yup.string()).notRequired(),
  status: yup
    .string()
    .oneOf(['DRAFT', 'ACTIVE', 'CLOSED'])
    .notRequired(),
});

export const generateJobDescriptionSchema = yup.object().shape({
  jobTitle: yup
    .string()
    .min(3, 'Job title must be at least 3 characters')
    .required('Job title is required'),
});
