// src/services/securityService.ts

/**
 * Security Service
 * Handles input sanitization, validation, and security measures
 */

export class SecurityService {
  // File validation constants
  private static readonly ALLOWED_FILE_TYPES = ['application/pdf'];
  private static readonly MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB
  private static readonly MAX_FILES = 10;
  
  // Magic numbers for PDF files
  private static readonly PDF_MAGIC_NUMBERS = [
    [0x25, 0x50, 0x44, 0x46], // %PDF
  ];

  /**
   * Validate file type by checking MIME type and magic numbers
   */
  static async validateFileType(file: File): Promise<boolean> {
    // Check MIME type
    if (!this.ALLOWED_FILE_TYPES.includes(file.type)) {
      return false;
    }

    // Check magic numbers (first few bytes of file)
    try {
      const buffer = await file.slice(0, 4).arrayBuffer();
      const bytes = new Uint8Array(buffer);
      
      return this.PDF_MAGIC_NUMBERS.some(magic =>
        magic.every((byte, index) => bytes[index] === byte)
      );
    } catch (error) {
      console.error('Error validating file type:', error);
      return false;
    }
  }

  /**
   * Validate file size
   */
  static validateFileSize(file: File): boolean {
    return file.size > 0 && file.size <= this.MAX_FILE_SIZE;
  }

  /**
   * Validate file name
   */
  static validateFileName(fileName: string): boolean {
    // Check length
    if (fileName.length > 255) {
      return false;
    }

    // Check for dangerous characters
    const dangerousChars = /[<>:"|?*\x00-\x1F]/;
    if (dangerousChars.test(fileName)) {
      return false;
    }

    // Check file extension
    if (!fileName.toLowerCase().endsWith('.pdf')) {
      return false;
    }

    return true;
  }

  /**
   * Sanitize user input to prevent XSS
   */
  static sanitizeInput(input: string): string {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  /**
   * Validate search query
   */
  static validateSearchQuery(query: string): {
    valid: boolean;
    sanitized: string;
    errors: string[];
  } {
    const errors: string[] = [];
    let sanitized = query.trim();

    // Check minimum length
    if (sanitized.length < 2) {
      errors.push('Search query must be at least 2 characters long');
    }

    // Check maximum length
    if (sanitized.length > 500) {
      errors.push('Search query must be less than 500 characters');
      sanitized = sanitized.substring(0, 500);
    }

    // Check for suspicious patterns
    const sqlInjectionPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION)\b)/i;
    if (sqlInjectionPattern.test(sanitized)) {
      errors.push('Invalid characters detected in search query');
    }

    // Sanitize HTML
    sanitized = this.sanitizeInput(sanitized);

    return {
      valid: errors.length === 0,
      sanitized,
      errors
    };
  }

  /**
   * Comprehensive file validation
   */
  static async validateFile(file: File): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    // Validate file name
    if (!this.validateFileName(file.name)) {
      errors.push('Invalid file name. Only PDF files with valid names are allowed.');
    }

    // Validate file size
    if (!this.validateFileSize(file)) {
      if (file.size === 0) {
        errors.push('File is empty');
      } else {
        errors.push(`File size exceeds ${this.MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
      }
    }

    // Validate file type
    const isValidType = await this.validateFileType(file);
    if (!isValidType) {
      errors.push('Invalid file type. Only PDF files are allowed.');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate batch of files
   */
  static async validateFilesBatch(files: File[], existingCount: number = 0): Promise<{
    valid: File[];
    invalid: Array<{ file: File; errors: string[] }>;
    totalCount: number;
  }> {
    const valid: File[] = [];
    const invalid: Array<{ file: File; errors: string[] }> = [];

    // Check total count
    if (existingCount + files.length > this.MAX_FILES) {
      return {
        valid: [],
        invalid: files.map(file => ({
          file,
          errors: [`Cannot exceed ${this.MAX_FILES} files limit. Currently have ${existingCount} file(s).`]
        })),
        totalCount: existingCount + files.length
      };
    }

    // Validate each file
    for (const file of files) {
      const validation = await this.validateFile(file);
      if (validation.valid) {
        valid.push(file);
      } else {
        invalid.push({ file, errors: validation.errors });
      }
    }

    return {
      valid,
      invalid,
      totalCount: existingCount + files.length
    };
  }

  /**
   * Generate secure random ID
   */
  static generateSecureId(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Hash sensitive data
   */
  static async hashData(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validate API key format (without exposing actual key)
   */
  static validateApiKeyFormat(apiKey: string): boolean {
    // Basic format validation
    if (!apiKey || apiKey.length < 20) {
      return false;
    }

    // Check for common placeholder values
    const placeholders = ['your_api_key', 'placeholder', 'test', 'demo'];
    if (placeholders.some(p => apiKey.toLowerCase().includes(p))) {
      return false;
    }

    return true;
  }

  /**
   * Rate limiting check (simple client-side implementation)
   */
  private static requestCounts: Map<string, { count: number; resetTime: number }> = new Map();

  static checkRateLimit(identifier: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const entry = this.requestCounts.get(identifier);

    if (!entry || now > entry.resetTime) {
      this.requestCounts.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }

    if (entry.count >= maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }

  /**
   * Content Security Policy headers helper
   */
  static getCSPHeaders(): Record<string, string> {
    return {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self' https://generativelanguage.googleapis.com",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'"
      ].join('; '),
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    };
  }
}

export default SecurityService;
