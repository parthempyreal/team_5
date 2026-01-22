import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️  OPENAI_API_KEY not found in environment variables');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';

export const AI_CONFIG = {
  maxTokens: 2000,
  temperature: 0.7,
  responseFormat: { type: 'json_object' as const },
};
