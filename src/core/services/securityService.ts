/**
 * Security Service
 *
 * Provides file validation, input sanitization, search query validation,
 * and rate limiting. Rate limiting is backed by localStorage for persistence
 * across page reloads.
 *
 * @module securityService
 * @since v1.1.0
 */

import { createLogger } from '@core/services/logger';

const log = createLogger('SecurityService');

const MAX_FILE_SIZE = parseInt(
  import.meta.env.VITE_MAX_FILE_SIZE || '209715200',
); // Default: 200MB
const PDF_MAGIC_BYTES = new Uint8Array([0x25, 0x50, 0x44, 0x46]);

/** localStorage key for persistent rate limit tracking. */
const RATE_LIMIT_STORAGE_KEY = 'docuSearch_rateLimit';

/**
 * Rate limit record stored both in-memory and in localStorage.
 */
interface RateLimitRecord {
  count: number;
  startTime: number;
}

/**
 * Loads rate limit records from localStorage.
 *
 * @returns A map of identifier to rate limit records
 */
function loadRateLimitRecords(): Map<string, RateLimitRecord> {
  try {
    const stored = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (typeof parsed === 'object' && parsed !== null) {
        const entries = Object.entries(parsed as Record<string, unknown>);
        const map = new Map<string, RateLimitRecord>();
        for (const [key, value] of entries) {
          if (
            typeof value === 'object' &&
            value !== null &&
            'count' in value &&
            'startTime' in value &&
            typeof (value as RateLimitRecord).count === 'number' &&
            typeof (value as RateLimitRecord).startTime === 'number'
          ) {
            map.set(key, value as RateLimitRecord);
          }
        }
        return map;
      }
    }
  } catch {
    log.warn('Failed to load rate limit records from localStorage');
  }
  return new Map();
}

/**
 * Saves rate limit records to localStorage for persistence.
 *
 * @param records - The rate limit records to persist
 */
function saveRateLimitRecords(records: Map<string, RateLimitRecord>): void {
  try {
    const obj: Record<string, RateLimitRecord> = {};
    records.forEach((value, key) => {
      obj[key] = value;
    });
    localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(obj));
  } catch {
    log.warn('Failed to save rate limit records to localStorage');
  }
}

// Initialize from localStorage for persistence across reloads
const rateLimitTracker = loadRateLimitRecords();

export const SecurityService = {
  /**
   * Validates that a file begins with the PDF magic bytes (%PDF).
   *
   * @param file - The file to validate
   * @returns true if the file starts with %PDF magic bytes
   */
  async validateFileType(file: File): Promise<boolean> {
    const slice = file.slice(0, 4);
    let buffer: ArrayBuffer;

    if (typeof slice.arrayBuffer === 'function') {
      buffer = await slice.arrayBuffer();
    } else {
      // Fallback for environments where arrayBuffer is not on Blob
      buffer = await new Promise((resolve, reject): void => {
        const reader = new FileReader();
        reader.onload = (): void => resolve(reader.result as ArrayBuffer);
        reader.onerror = (): void =>
          reject(reader.error ?? new Error('File read failed'));
        reader.readAsArrayBuffer(slice);
      });
    }

    const view = new Uint8Array(buffer);
    return view.every((byte, index) => byte === PDF_MAGIC_BYTES[index]);
  },

  /**
   * Validates that a file does not exceed the maximum allowed size (200MB).
   *
   * @param file - The file to validate
   * @returns true if the file size is within limits
   */
  validateFileSize(file: File): boolean {
    return file.size <= MAX_FILE_SIZE;
  },

  /**
   * Sanitizes user input by escaping HTML angle brackets to prevent XSS.
   *
   * @param input - The raw user input string
   * @returns The sanitized string with HTML entities escaped
   */
  sanitizeInput(input: string): string {
    return input.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },

  /**
   * Validates a search query for minimum length and suspicious patterns.
   *
   * @param query - The search query to validate
   * @returns An object indicating validity and optional failure reason
   */
  validateSearchQuery(query: string): { valid: boolean; reason?: string } {
    if (query.length < 2) {
      return { valid: false, reason: 'Query too short.' };
    }
    if (/SELECT|INSERT|UPDATE|DELETE|FROM/i.test(query)) {
      return { valid: false, reason: 'Potential SQL injection detected.' };
    }
    return { valid: true };
  },

  /**
   * Checks whether a request is allowed under the rate limit.
   * Records are persisted to localStorage so limits survive page reloads.
   *
   * @param identifier - Unique identifier for the rate limit bucket (e.g., "search")
   * @param limit - Maximum number of requests allowed in the timeframe
   * @param timeframe - Time window in milliseconds
   * @returns true if the request is allowed, false if rate limited
   */
  checkRateLimit(
    identifier: string,
    limit: number,
    timeframe: number,
  ): boolean {
    const now = Date.now();
    const record = rateLimitTracker.get(identifier);

    if (!record || now - record.startTime > timeframe) {
      rateLimitTracker.set(identifier, { count: 1, startTime: now });
      saveRateLimitRecords(rateLimitTracker);
      return true;
    }

    if (record.count < limit) {
      record.count++;
      saveRateLimitRecords(rateLimitTracker);
      return true;
    }

    log.warn('Rate limit exceeded', { identifier, limit, timeframe });
    return false;
  },
};
