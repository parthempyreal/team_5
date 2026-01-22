import { SkillCategory } from '../../types';

export const skillsData = [
  // FRONTEND
  {
    name: 'react',
    category: SkillCategory.FRONTEND,
    aliases: ['reactjs', 'react.js'],
  },
  {
    name: 'vue',
    category: SkillCategory.FRONTEND,
    aliases: ['vuejs', 'vue.js'],
  },
  {
    name: 'angular',
    category: SkillCategory.FRONTEND,
    aliases: ['angularjs'],
  },
  {
    name: 'next.js',
    category: SkillCategory.FRONTEND,
    aliases: ['nextjs'],
  },
  {
    name: 'typescript',
    category: SkillCategory.FRONTEND,
    aliases: ['ts'],
  },
  {
    name: 'javascript',
    category: SkillCategory.FRONTEND,
    aliases: ['js', 'es6', 'es2015'],
  },
  {
    name: 'html',
    category: SkillCategory.FRONTEND,
    aliases: ['html5'],
  },
  {
    name: 'css',
    category: SkillCategory.FRONTEND,
    aliases: ['css3'],
  },
  {
    name: 'tailwind css',
    category: SkillCategory.FRONTEND,
    aliases: ['tailwind', 'tailwindcss'],
  },
  {
    name: 'sass',
    category: SkillCategory.FRONTEND,
    aliases: ['scss'],
  },
  {
    name: 'redux',
    category: SkillCategory.FRONTEND,
    aliases: ['redux toolkit'],
  },
  {
    name: 'webpack',
    category: SkillCategory.FRONTEND,
    aliases: [],
  },
  {
    name: 'vite',
    category: SkillCategory.FRONTEND,
    aliases: [],
  },

  // BACKEND
  {
    name: 'node.js',
    category: SkillCategory.BACKEND,
    aliases: ['nodejs', 'node'],
  },
  {
    name: 'express',
    category: SkillCategory.BACKEND,
    aliases: ['express.js', 'expressjs'],
  },
  {
    name: 'nest.js',
    category: SkillCategory.BACKEND,
    aliases: ['nestjs'],
  },
  {
    name: 'python',
    category: SkillCategory.BACKEND,
    aliases: [],
  },
  {
    name: 'django',
    category: SkillCategory.BACKEND,
    aliases: [],
  },
  {
    name: 'flask',
    category: SkillCategory.BACKEND,
    aliases: [],
  },
  {
    name: 'fastapi',
    category: SkillCategory.BACKEND,
    aliases: [],
  },
  {
    name: 'java',
    category: SkillCategory.BACKEND,
    aliases: [],
  },
  {
    name: 'spring boot',
    category: SkillCategory.BACKEND,
    aliases: ['spring', 'springboot'],
  },
  {
    name: 'php',
    category: SkillCategory.BACKEND,
    aliases: [],
  },
  {
    name: 'laravel',
    category: SkillCategory.BACKEND,
    aliases: [],
  },
  {
    name: 'ruby',
    category: SkillCategory.BACKEND,
    aliases: [],
  },
  {
    name: 'ruby on rails',
    category: SkillCategory.BACKEND,
    aliases: ['rails', 'ror'],
  },
  {
    name: 'go',
    category: SkillCategory.BACKEND,
    aliases: ['golang'],
  },
  {
    name: 'rust',
    category: SkillCategory.BACKEND,
    aliases: [],
  },
  {
    name: 'graphql',
    category: SkillCategory.BACKEND,
    aliases: [],
  },
  {
    name: 'rest api',
    category: SkillCategory.BACKEND,
    aliases: ['restful api', 'rest'],
  },
  {
    name: 'mongodb',
    category: SkillCategory.BACKEND,
    aliases: ['mongo'],
  },
  {
    name: 'postgresql',
    category: SkillCategory.BACKEND,
    aliases: ['postgres', 'psql'],
  },
  {
    name: 'mysql',
    category: SkillCategory.BACKEND,
    aliases: [],
  },
  {
    name: 'redis',
    category: SkillCategory.BACKEND,
    aliases: [],
  },
  {
    name: 'elasticsearch',
    category: SkillCategory.BACKEND,
    aliases: ['elastic search'],
  },
  {
    name: 'microservices',
    category: SkillCategory.BACKEND,
    aliases: ['microservice architecture'],
  },

  // DEVOPS
  {
    name: 'docker',
    category: SkillCategory.DEVOPS,
    aliases: [],
  },
  {
    name: 'kubernetes',
    category: SkillCategory.DEVOPS,
    aliases: ['k8s'],
  },
  {
    name: 'aws',
    category: SkillCategory.DEVOPS,
    aliases: ['amazon web services'],
  },
  {
    name: 'azure',
    category: SkillCategory.DEVOPS,
    aliases: ['microsoft azure'],
  },
  {
    name: 'gcp',
    category: SkillCategory.DEVOPS,
    aliases: ['google cloud platform', 'google cloud'],
  },
  {
    name: 'jenkins',
    category: SkillCategory.DEVOPS,
    aliases: [],
  },
  {
    name: 'github actions',
    category: SkillCategory.DEVOPS,
    aliases: ['github action'],
  },
  {
    name: 'gitlab ci',
    category: SkillCategory.DEVOPS,
    aliases: ['gitlab ci/cd'],
  },
  {
    name: 'terraform',
    category: SkillCategory.DEVOPS,
    aliases: [],
  },
  {
    name: 'ansible',
    category: SkillCategory.DEVOPS,
    aliases: [],
  },
  {
    name: 'nginx',
    category: SkillCategory.DEVOPS,
    aliases: [],
  },
  {
    name: 'linux',
    category: SkillCategory.DEVOPS,
    aliases: ['unix'],
  },
  {
    name: 'bash',
    category: SkillCategory.DEVOPS,
    aliases: ['shell scripting', 'bash scripting'],
  },

  // AI_ML
  {
    name: 'machine learning',
    category: SkillCategory.AI_ML,
    aliases: ['ml'],
  },
  {
    name: 'deep learning',
    category: SkillCategory.AI_ML,
    aliases: ['dl'],
  },
  {
    name: 'tensorflow',
    category: SkillCategory.AI_ML,
    aliases: [],
  },
  {
    name: 'pytorch',
    category: SkillCategory.AI_ML,
    aliases: [],
  },
  {
    name: 'scikit-learn',
    category: SkillCategory.AI_ML,
    aliases: ['sklearn'],
  },
  {
    name: 'keras',
    category: SkillCategory.AI_ML,
    aliases: [],
  },
  {
    name: 'natural language processing',
    category: SkillCategory.AI_ML,
    aliases: ['nlp'],
  },
  {
    name: 'computer vision',
    category: SkillCategory.AI_ML,
    aliases: ['cv'],
  },
  {
    name: 'openai',
    category: SkillCategory.AI_ML,
    aliases: ['gpt', 'chatgpt'],
  },
  {
    name: 'langchain',
    category: SkillCategory.AI_ML,
    aliases: [],
  },

  // MOBILE
  {
    name: 'react native',
    category: SkillCategory.MOBILE,
    aliases: ['react-native'],
  },
  {
    name: 'flutter',
    category: SkillCategory.MOBILE,
    aliases: [],
  },
  {
    name: 'swift',
    category: SkillCategory.MOBILE,
    aliases: ['swiftui'],
  },
  {
    name: 'kotlin',
    category: SkillCategory.MOBILE,
    aliases: [],
  },
  {
    name: 'ios',
    category: SkillCategory.MOBILE,
    aliases: ['ios development'],
  },
  {
    name: 'android',
    category: SkillCategory.MOBILE,
    aliases: ['android development'],
  },

  // DATA
  {
    name: 'sql',
    category: SkillCategory.DATA,
    aliases: [],
  },
  {
    name: 'data analysis',
    category: SkillCategory.DATA,
    aliases: ['data analytics'],
  },
  {
    name: 'data science',
    category: SkillCategory.DATA,
    aliases: [],
  },
  {
    name: 'pandas',
    category: SkillCategory.DATA,
    aliases: [],
  },
  {
    name: 'numpy',
    category: SkillCategory.DATA,
    aliases: [],
  },
  {
    name: 'apache spark',
    category: SkillCategory.DATA,
    aliases: ['spark'],
  },
  {
    name: 'hadoop',
    category: SkillCategory.DATA,
    aliases: [],
  },
  {
    name: 'tableau',
    category: SkillCategory.DATA,
    aliases: [],
  },
  {
    name: 'power bi',
    category: SkillCategory.DATA,
    aliases: ['powerbi'],
  },

  // DESIGN
  {
    name: 'ui/ux design',
    category: SkillCategory.DESIGN,
    aliases: ['ui design', 'ux design', 'user experience'],
  },
  {
    name: 'figma',
    category: SkillCategory.DESIGN,
    aliases: [],
  },
  {
    name: 'adobe xd',
    category: SkillCategory.DESIGN,
    aliases: ['xd'],
  },
  {
    name: 'sketch',
    category: SkillCategory.DESIGN,
    aliases: [],
  },

  // OTHER
  {
    name: 'git',
    category: SkillCategory.OTHER,
    aliases: ['version control'],
  },
  {
    name: 'agile',
    category: SkillCategory.OTHER,
    aliases: ['scrum'],
  },
  {
    name: 'jira',
    category: SkillCategory.OTHER,
    aliases: [],
  },
  {
    name: 'testing',
    category: SkillCategory.OTHER,
    aliases: ['unit testing', 'integration testing'],
  },
  {
    name: 'jest',
    category: SkillCategory.OTHER,
    aliases: [],
  },
  {
    name: 'cypress',
    category: SkillCategory.OTHER,
    aliases: [],
  },
];
