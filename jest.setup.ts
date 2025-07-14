import '@testing-library/jest-dom';

// Mock global do console para suprimir logs durante os testes
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn(),
};

// Mock do Request (Web API) para Next.js
global.Request = class MockRequest {
  constructor(public url: string, public init?: RequestInit) {}
  json() { return Promise.resolve({}); }
  text() { return Promise.resolve(''); }
  headers = new Map();
} as unknown as typeof Request;

// Mock do Response (Web API) para Next.js
global.Response = class MockResponse {
  constructor(public body?: unknown, public init?: ResponseInit) {}
  json() { return Promise.resolve(this.body); }
  text() { return Promise.resolve(this.body); }
  status = 200;
  headers = new Map();
} as unknown as typeof Response;