import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as yaml from 'yaml';
import { GetConfig } from './get-config';
import { Toast } from '../../_util/toast/toast';

describe('GetConfig', () => {
  let sandbox: sinon.SinonSandbox;
  let workspaceFoldersStub: sinon.SinonStub;
  let createFileSystemWatcherStub: sinon.SinonStub;
  let watcherMock: any;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    
    // Reset static state
    GetConfig.clearSubscribers();
    
    workspaceFoldersStub = sandbox.stub(vscode.workspace, 'workspaceFolders').value([
      { uri: { fsPath: '/test/workspace' } }
    ]);
    
    watcherMock = {
      onDidChange: sandbox.stub(),
      onDidCreate: sandbox.stub(),
      onDidDelete: sandbox.stub(),
      dispose: sandbox.stub()
    };
    
    createFileSystemWatcherStub = sandbox.stub(vscode.workspace, 'createFileSystemWatcher')
      .returns(watcherMock);
  });

  afterEach(() => {
    GetConfig.clearSubscribers();
    sandbox.restore();
  });

  describe('directory getter', () => {
    it('should return workspace folder path', () => {
      const result = GetConfig.directory;
      assert.strictEqual(result, '/test/workspace');
    });

    it('should return undefined when no workspace folders', () => {
      workspaceFoldersStub.value(undefined);
      const result = GetConfig.directory;
      assert.strictEqual(result, undefined);
    });

    it('should return undefined when empty workspace folders', () => {
      workspaceFoldersStub.value([]);
      const result = GetConfig.directory;
      assert.strictEqual(result, undefined);
    });
  });

  describe('path getter', () => {
    it('should return lemon-tree.yaml path', () => {
      const result = GetConfig.path;
      assert.strictEqual(result, '/test/workspace/lemon-tree.yaml');
    });
  });

  describe('subscribeToConfig', () => {
    it('should create file watcher on first subscription', () => {
      const listener = sandbox.stub();
      
      GetConfig.subscribeToConfig(listener);
      
      assert.ok(createFileSystemWatcherStub.calledOnce);
      assert.ok(watcherMock.onDidChange.calledOnce);
      assert.ok(watcherMock.onDidCreate.calledOnce);
      assert.ok(watcherMock.onDidDelete.calledOnce);
    });

    it('should not create additional watchers for subsequent subscriptions', () => {
      const listener1 = sandbox.stub();
      const listener2 = sandbox.stub();
      
      GetConfig.subscribeToConfig(listener1);
      GetConfig.subscribeToConfig(listener2);
      
      assert.ok(createFileSystemWatcherStub.calledOnce);
    });

    it('should return unsubscribe function', () => {
      const listener = sandbox.stub();
      
      const unsubscribe = GetConfig.subscribeToConfig(listener);
      
      assert.strictEqual(typeof unsubscribe, 'function');
      assert.strictEqual(unsubscribe(), true);
    });

    it('should call listeners when config changes', async () => {
      const listener = sandbox.stub();
      const configStub = sandbox.stub(GetConfig, 'config').resolves({ test: 'config' });
      
      GetConfig.subscribeToConfig(listener);
      
      // Simulate file change
      const changeCallback = watcherMock.onDidChange.getCall(0).args[0];
      await changeCallback();
      
      assert.ok(listener.calledWith({ test: 'config' }));
    });
  });

  describe('clearSubscribers', () => {
    it('should clear all subscribers and dispose watcher', () => {
      const listener = sandbox.stub();
      GetConfig.subscribeToConfig(listener);
      
      GetConfig.clearSubscribers();
      
      assert.ok(watcherMock.dispose.calledOnce);
      assert.strictEqual(GetConfig.watcher, null);
    });

    it('should handle no watcher case', () => {
      assert.doesNotThrow(() => GetConfig.clearSubscribers());
    });
  });

  describe('config', () => {
    it('should return cached config when available and omitCache is false', async () => {
      const cachedConfig = { test: 'cached' };
      (GetConfig as any).cachedConfig = cachedConfig;
      
      const result = await GetConfig.config(false);
      
      assert.deepStrictEqual(result, cachedConfig);
    });

    it('should reload config when omitCache is true', async () => {
      const cachedConfig = { test: 'cached' };
      (GetConfig as any).cachedConfig = cachedConfig;
      
      const loadConfigStub = sandbox.stub(GetConfig as any, 'loadConfig').resolves();
      
      await GetConfig.config(true);
      
      assert.ok(loadConfigStub.calledOnce);
    });

    it('should return empty object when no cached config', async () => {
      sandbox.stub(GetConfig as any, 'loadConfig').resolves();
      (GetConfig as any).cachedConfig = null;
      
      const result = await GetConfig.config();
      
      assert.deepStrictEqual(result, {});
    });
  });

  describe('loadConfig', () => {
    let readFileSyncStub: sinon.SinonStub;
    let yamlParseStub: sinon.SinonStub;
    let toastErrorStub: sinon.SinonStub;

    beforeEach(() => {
      readFileSyncStub = sandbox.stub(fs, 'readFileSync');
      yamlParseStub = sandbox.stub(yaml, 'parse');
      toastErrorStub = sandbox.stub(Toast, 'error');
    });

    it('should return early when no directory', async () => {
      workspaceFoldersStub.value(undefined);
      
      await (GetConfig as any).loadConfig();
      
      assert.ok(readFileSyncStub.notCalled);
    });

    it('should successfully load valid config', async () => {
      const configData = { languages: ['en', 'es'], sourceLanguage: 'en' };
      readFileSyncStub.returns('yaml content');
      yamlParseStub.returns(configData);
      
      await (GetConfig as any).loadConfig();
      
      assert.deepStrictEqual((GetConfig as any).cachedConfig, configData);
      assert.ok(toastErrorStub.notCalled);
    });

    it('should show error when yaml.parse returns null', async () => {
      readFileSyncStub.returns('yaml content');
      yamlParseStub.returns(null);
      
      await (GetConfig as any).loadConfig();
      
      assert.ok(toastErrorStub.calledWith('Failed to parse lemon-tree.yaml file'));
    });

    it('should show error when yaml.parse returns non-object', async () => {
      readFileSyncStub.returns('yaml content');
      yamlParseStub.returns('string');
      
      await (GetConfig as any).loadConfig();
      
      assert.ok(toastErrorStub.calledWith('lemon-tree.yaml file is not a valid YAML object'));
    });

    it('should handle ENOENT error', async () => {
      const error = new Error('ENOENT: no such file');
      readFileSyncStub.throws(error);
      
      await (GetConfig as any).loadConfig();
      
      assert.ok(toastErrorStub.calledWith('Failed to read lemon-tree.yaml file'));
    });

    it('should handle EISDIR error', async () => {
      const error = new Error('EISDIR: illegal operation on a directory');
      readFileSyncStub.throws(error);
      
      await (GetConfig as any).loadConfig();
      
      assert.ok(toastErrorStub.calledWith('lemon-tree.yaml is a directory, must be a file'));
    });

    it('should handle EACCES error', async () => {
      const error = new Error('EACCES: permission denied');
      readFileSyncStub.throws(error);
      
      await (GetConfig as any).loadConfig();
      
      assert.ok(toastErrorStub.calledWith('No permissions to read lemon-tree.yaml file'));
    });

    it('should handle EPERM error', async () => {
      const error = new Error('EPERM: operation not permitted');
      readFileSyncStub.throws(error);
      
      await (GetConfig as any).loadConfig();
      
      assert.ok(toastErrorStub.calledWith('No permissions to read lemon-tree.yaml file'));
    });

    it('should handle EPIPE error', async () => {
      const error = new Error('EPIPE: broken pipe');
      readFileSyncStub.throws(error);
      
      await (GetConfig as any).loadConfig();
      
      assert.ok(toastErrorStub.calledWith('lemon-tree.yaml file is not a valid YAML file'));
    });

    it('should handle non-Error exception', async () => {
      readFileSyncStub.throws('string error');
      
      await (GetConfig as any).loadConfig();
      
      assert.ok(toastErrorStub.calledWith('[Lemon Tree] Failed to read lemon-tree.yaml file. Unexpected error string error'));
    });
  });
});
