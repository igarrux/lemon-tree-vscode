import * as assert from 'assert';

describe('_helpers/index', () => {
  it('should export GetConfig', () => {
    const helpersIndex = require('./index');
    
    assert.ok(helpersIndex.GetConfig);
    assert.strictEqual(typeof helpersIndex.GetConfig, 'function');
  });

  it('should have GetConfig as a constructor', () => {
    const { GetConfig } = require('./index');
    
    // Verify it has static methods
    assert.strictEqual(typeof GetConfig.config, 'function');
    assert.strictEqual(typeof GetConfig.subscribeToConfig, 'function');
    assert.strictEqual(typeof GetConfig.clearSubscribers, 'function');
  });

  it('should export all expected members', () => {
    const helpersIndex = require('./index');
    const exports = Object.keys(helpersIndex);
    
    assert.ok(exports.includes('GetConfig'));
  });
});
