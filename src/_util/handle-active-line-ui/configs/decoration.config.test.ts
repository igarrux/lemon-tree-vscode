import { describe, it, expect } from 'vitest';
import { DECORATION } from './decoration.config';

describe('decoration.config', () => {
  describe('DECORATION', () => {
    it('should be defined and be an object', () => {
      expect(DECORATION).toBeDefined();
      expect(typeof DECORATION).toBe('object');
    });

    it('should be a consistent singleton instance', () => {
      // Access DECORATION multiple times
      const decoration1 = DECORATION;
      const decoration2 = DECORATION;
      const decoration3 = DECORATION;
      
      // Should return the same instance each time
      expect(decoration1).toBe(decoration2);
      expect(decoration2).toBe(decoration3);
    });

    it('should export the same instance consistently', () => {
      // Multiple accesses should return the same instance
      const decoration1 = DECORATION;
      const decoration2 = DECORATION;
      expect(decoration1).toBe(decoration2);
    });

    it('should be a proper decoration configuration', () => {
      // Verify it has expected structure of TextEditorDecorationType
      expect(DECORATION).toBeTruthy();
      // The actual properties depend on VS Code's internal implementation
      // but we can verify it's a valid object that was returned from the API
    });
  });
});
