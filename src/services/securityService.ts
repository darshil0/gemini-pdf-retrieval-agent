const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB
const PDF_MAGIC_BYTES = new Uint8Array([0x25, 0x50, 0x44, 0x46]);

const rateLimitTracker = new Map<string, { count: number; startTime: number }>();

export const SecurityService = {
  async validateFileType(file: File): Promise<boolean> {
    const slice = file.slice(0, 4);
    let buffer: ArrayBuffer;

    if (typeof slice.arrayBuffer === 'function') {
      buffer = await slice.arrayBuffer();
    } else {
      // Fallback for environments where arrayBuffer is not on Blob
      buffer = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(slice);
      });
    }

    const view = new Uint8Array(buffer);
    return view.every((byte, index) => byte === PDF_MAGIC_BYTES[index]);
  },

  validateFileSize(file: File): boolean {
    return file.size <= MAX_FILE_SIZE;
  },

  sanitizeInput(input: string): string {
    return input.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },

  validateSearchQuery(query: string): { valid: boolean; reason?: string } {
    if (query.length < 2) {
      return { valid: false, reason: 'Query too short' };
    }
    if (/SELECT|INSERT|UPDATE|DELETE|FROM/i.test(query)) {
      return { valid: false, reason: 'Potential SQL injection' };
    }
    return { valid: true };
  },

  checkRateLimit(identifier: string, limit: number, timeframe: number): boolean {
    const now = Date.now();
    const record = rateLimitTracker.get(identifier);

    if (!record || now - record.startTime > timeframe) {
      rateLimitTracker.set(identifier, { count: 1, startTime: now });
      return true;
    }

    if (record.count < limit) {
      record.count++;
      return true;
    }

    return false;
  },
};
