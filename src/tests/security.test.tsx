// src/__tests__/security.test.tsx
import { describe, it, expect } from 'vitest';
import { SecurityService } from '../services/securityService';

describe('SecurityService', () => {
  it('validates PDF file type', async () => {
    const pdfFile = new File(
      [new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37])],
      'test.pdf',
      { type: 'application/pdf' }
    );

    const isValid = await SecurityService.validateFileType(pdfFile);
    expect(isValid).toBe(true);
  });

  it('rejects non-PDF files', async () => {
    const textFile = new File(['content'], 'test.txt', { type: 'text/plain' });

    const isValid = await SecurityService.validateFileType(textFile);
    expect(isValid).toBe(false);
  });

  it('validates file size', () => {
    const validFile = new File([new ArrayBuffer(100 * 1024 * 1024)], 'test.pdf');
    const oversizedFile = new File([new ArrayBuffer(201 * 1024 * 1024)], 'large.pdf');

    expect(SecurityService.validateFileSize(validFile)).toBe(true);
    expect(SecurityService.validateFileSize(oversizedFile)).toBe(false);
  });

  it('sanitizes user input', () => {
    const dangerous = '<script>alert("xss")</script>';
    const sanitized = SecurityService.sanitizeInput(dangerous);

    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('&lt;script&gt;');
  });

  it('validates search queries', () => {
    const valid = SecurityService.validateSearchQuery('normal search');
    expect(valid.valid).toBe(true);

    const tooShort = SecurityService.validateSearchQuery('a');
    expect(tooShort.valid).toBe(false);

    const suspicious = SecurityService.validateSearchQuery('SELECT * FROM users');
    expect(suspicious.valid).toBe(false);
  });

  it('enforces rate limiting', () => {
    const identifier = 'test-user';

    // First 10 requests should pass
    for (let i = 0; i < 10; i++) {
      expect(SecurityService.checkRateLimit(identifier, 10, 60000)).toBe(true);
    }

    // 11th request should fail
    expect(SecurityService.checkRateLimit(identifier, 10, 60000)).toBe(false);
  });
});
