import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables for tests
process.env.OPENAI_API_KEY = 'test-key';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.ALPHA_VANTAGE_API_KEY = 'test-key';
