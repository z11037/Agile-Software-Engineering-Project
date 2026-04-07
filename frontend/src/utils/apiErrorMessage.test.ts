import { describe, expect, it } from 'vitest';
import { getApiErrorMessage } from './apiErrorMessage';

describe('getApiErrorMessage', () => {
  it('uses FastAPI string detail when present', () => {
    expect(
      getApiErrorMessage({
        response: { status: 400, data: { detail: 'Invalid payload' } },
      }),
    ).toBe('Invalid payload');
  });

  it('describes network errors without a response', () => {
    expect(getApiErrorMessage({ message: 'Network Error' })).toMatch(/network/i);
  });

  it('maps common HTTP statuses', () => {
    expect(getApiErrorMessage({ response: { status: 401, data: {} } })).toMatch(/sign in/i);
    expect(getApiErrorMessage({ response: { status: 503, data: {} } })).toMatch(/server error/i);
  });

  it('falls back when detail is missing', () => {
    expect(getApiErrorMessage({ response: { status: 418, data: {} } })).toMatch(/try again/i);
  });
});
