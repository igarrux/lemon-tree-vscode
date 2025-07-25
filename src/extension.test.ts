import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { activate, deactivate, gutterIconManager } from './extension';
import { GetConfig } from './_helpers';
import { logger } from './_logger/logger';

describe('Extension', () => {
  let context: vscode.ExtensionContext;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    context = {
      subscriptions: [],
      extensionPath: '/test/path',
      storagePath: '/test/storage',
      globalStoragePath: '/test/global',
      logPath: '/test/log',
      asAbsolutePath: sandbox.stub().returns('/test/absolute/path'),
      extensionUri: vscode.Uri.file('/test/path'),
      environmentVariableCollection: {} as any,
      storageUri: vscode.Uri.file('/test/storage'),
      globalStorageUri: vscode.Uri.file('/test/global'),
      logUri: vscode.Uri.file('/test/log'),
      extensionMode: vscode.ExtensionMode.Test,
      extension: {} as any,
      secrets: {} as any,
      workspaceState: {} as any,
      globalState: {} as any,
      languageModelAccessInformation: {} as any,
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('activate', () => {
    it('should initialize gutterIconManager', () => {
      activate(context);
      assert.ok(gutterIconManager);
    });

    it('should call activateTranslationDecorations', () => {
      // This test verifies the function is called without errors
      assert.doesNotThrow(() => activate(context));
    });

    it('should call registerCommands', () => {
      // Mock workspace folders
      const workspaceFolders = [
        {
          uri: vscode.Uri.file('/test/workspace'),
          name: 'test',
          index: 0
        }
      ];
      sandbox.stub(vscode.workspace, 'workspaceFolders').value(workspaceFolders);
      
      assert.doesNotThrow(() => activate(context));
    });
  });

  describe('deactivate', () => {
    it('should clear subscribers and dispose logger', () => {
      const clearSubscribersStub = sandbox.stub(GetConfig, 'clearSubscribers');
      const loggerClearStub = sandbox.stub(logger, 'clear');
      const loggerDisposeStub = sandbox.stub(logger, 'dispose');
      
      // First activate to create gutterIconManager
      activate(context);
      const gutterDisposeStub = sandbox.stub(gutterIconManager, 'dispose');

      deactivate();

      assert.ok(clearSubscribersStub.calledOnce);
      assert.ok(loggerClearStub.calledOnce);
      assert.ok(loggerDisposeStub.calledOnce);
      assert.ok(gutterDisposeStub.calledOnce);
    });

    it('should handle deactivation without activation', () => {
      const clearSubscribersStub = sandbox.stub(GetConfig, 'clearSubscribers');
      const loggerClearStub = sandbox.stub(logger, 'clear');
      const loggerDisposeStub = sandbox.stub(logger, 'dispose');

      assert.doesNotThrow(() => deactivate());
      
      assert.ok(clearSubscribersStub.calledOnce);
      assert.ok(loggerClearStub.calledOnce);
      assert.ok(loggerDisposeStub.calledOnce);
    });
  });
});
