import axios from 'axios';
import type { ParsedApiError } from '../types';

export function parseApiError(error: unknown): ParsedApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    const data = error.response?.data;

    if (!data) {
      return { message: 'Network error. Please check your connection.', fieldErrors: {}, status };
    }

    if (status === 429) {
      return { message: 'Too many requests. Please slow down.', fieldErrors: {}, status };
    }

    const fieldErrors: Record<string, string> = {};
    if (data.details && Array.isArray(data.details)) {
      for (const detail of data.details) {
        const key = detail.field?.split('.').pop() ?? detail.field ?? 'unknown';
        fieldErrors[key] = detail.message;
      }
    }

    return {
      message: data.error ?? 'An unexpected error occurred.',
      fieldErrors,
      status,
    };
  }

  if (error instanceof Error) {
    return { message: error.message, fieldErrors: {}, status: 0 };
  }

  return { message: 'An unexpected error occurred.', fieldErrors: {}, status: 0 };
}
