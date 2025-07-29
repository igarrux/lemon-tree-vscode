import * as assert from 'assert';
import { describe, it } from 'vitest';
import * as helpersIndex from './index';
import { GetConfig } from './index';

describe('_helpers/index', () => {
  it('should export GetConfig', () => {
    assert.ok(helpersIndex.GetConfig);
    assert.strictEqual(typeof helpersIndex.GetConfig, 'function');
  });

  it('should have GetConfig as a constructor', () => {
    // Verify it has static methods
    assert.strictEqual(typeof GetConfig.config, 'function');
    assert.strictEqual(typeof GetConfig.subscribeToConfig, 'function');
    assert.strictEqual(typeof GetConfig.clearSubscribers, 'function');
  });

  it('should export all expected members', () => {
    const exports = Object.keys(helpersIndex);
    
    assert.ok(exports.includes('GetConfig'));
  });
});
