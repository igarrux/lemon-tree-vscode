import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { buildLogger } from './logger';

describe('Logger', () => {
  let sandbox: sinon.SinonSandbox;
  let createOutputChannelStub: sinon.SinonStub;
  let outputChannelMock: any;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    
    outputChannelMock = {
      append: sandbox.stub(),
      appendLine: sandbox.stub(),
      clear: sandbox.stub(),
      dispose: sandbox.stub(),
      hide: sandbox.stub(),
      show: sandbox.stub(),
      name: 'Lemon Tree'
    };
    
    createOutputChannelStub = sandbox.stub(vscode.window, 'createOutputChannel')
      .returns(outputChannelMock);
  });

  afterEach(() => {
    sandbox.restore();
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
      assert.ok(createOutputChannelStub.calledOnce);
    });

    it('should not cache output channel when skipCache is true', () => {
      const loggerFn = buildLogger(true);
      
      const channel1 = loggerFn();
      const channel2 = loggerFn();
      
      assert.notStrictEqual(channel1, channel2);
      assert.ok(createOutputChannelStub.calledTwice);
    });

    it('should create output channel with "Lemon Tree" name', () => {
      const loggerFn = buildLogger();
      
      loggerFn();
      
      assert.ok(createOutputChannelStub.calledWith('Lemon Tree'));
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
      assert.ok(createOutputChannelStub.calledOnce);
    });

    it('should recreate channel after skipCache change', () => {
      const loggerFn1 = buildLogger(false);
      const loggerFn2 = buildLogger(true);
      
      loggerFn1();
      loggerFn2();
      
      assert.ok(createOutputChannelStub.calledTwice);
    });
  });
});
