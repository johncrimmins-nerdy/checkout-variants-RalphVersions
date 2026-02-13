import '@testing-library/jest-dom';

// Mock environment variables for tests
process.env.NEXT_PUBLIC_API_DOMAIN = 'api.vtstaging.com';
process.env.NEXT_PUBLIC_WEB_DOMAIN = 'www.vtstaging.com';
process.env.NEXT_PUBLIC_ENV = 'test';
