import * as assert from 'assert';
import { beforeEach, afterEach, describe, it, vi } from 'vitest';
import * as vscode from 'vscode';
import { buildLogger } from './logger';

describe('Logger', () => {
  let createOutputChannelStub: any;
  let outputChannelMock: any;

  beforeEach(() => {
    outputChannelMock = {
      append: vi.fn(),
      appendLine: vi.fn(),
      clear: vi.fn(),
      dispose: vi.fn(),
      hide: vi.fn(),
      show: vi.fn(),
      name: 'Lemon Tree'
    };
    
    createOutputChannelStub = vi.mocked(vscode.window.createOutputChannel)
      .mockReturnValue(outputChannelMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('buildLogger', () => {
    it('should return a function that creates output channel', () => {
      const loggerFn = buildLogger();
      
      assert.strictEqual(typeof loggerFn, 'function');
    });

    it('should cache output channel when skipCache is false', () => {
      const loggerFn = buildLogger(false);
      
      const channel1 = loggerFn();
      const channel2 = loggerFn();
      
      assert.strictEqual(channel1, channel2);
      assert.strictEqual(createOutputChannelStub.mock.calls.length, 1);
    });

    it('should not cache output channel when skipCache is true', () => {
      // Need to create fresh mocks for each call since skipCache=true
      const mock1 = { ...outputChannelMock, id: 'channel1' };
      const mock2 = { ...outputChannelMock, id: 'channel2' };
      
      createOutputChannelStub
        .mockReturnValueOnce(mock1)
        .mockReturnValueOnce(mock2);
      
      const loggerFn = buildLogger(true);
      
      const channel1 = loggerFn();
      const channel2 = loggerFn();
      
      assert.notStrictEqual(channel1, channel2);
      assert.strictEqual(createOutputChannelStub.mock.calls.length, 2);
    });

    it('should create output channel with "Lemon Tree" name', () => {
      const loggerFn = buildLogger();
      
      loggerFn();
      
      assert.strictEqual(createOutputChannelStub.mock.calls[0][0], 'Lemon Tree');
    });

    it('should return output channel with expected methods', () => {
      const loggerFn = buildLogger();
      
      const channel = loggerFn();
      
      assert.ok(channel);
      assert.strictEqual(typeof channel.append, 'function');
      assert.strictEqual(typeof channel.clear, 'function');
      assert.strictEqual(typeof channel.dispose, 'function');
    });

    it('should handle multiple calls with default skipCache', () => {
      const loggerFn = buildLogger();
      
      const channel1 = loggerFn();
      const channel2 = loggerFn();
      const channel3 = loggerFn();
      
      assert.strictEqual(channel1, channel2);
      assert.strictEqual(channel2, channel3);
      assert.strictEqual(createOutputChannelStub.mock.calls.length, 1);
    });

    it('should recreate channel after skipCache change', () => {
      const loggerFn1 = buildLogger(false);
      const loggerFn2 = buildLogger(true);
      
      loggerFn1();
      loggerFn2();
      
      assert.strictEqual(createOutputChannelStub.mock.calls.length, 2);
    });
  });
});
