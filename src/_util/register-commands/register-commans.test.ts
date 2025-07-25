import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { registerCommands } from './register-commans';
import { logger } from '../../_logger/logger';
import { runLemonTreeCommand } from '../../infrastructure/cli/LemonTreeCli';

describe('registerCommands', () => {
  let sandbox: sinon.SinonSandbox;
  let context: vscode.ExtensionContext;
  let workspaceFoldersStub: sinon.SinonStub;
  let registerCommandStub: sinon.SinonStub;
  let showErrorMessageStub: sinon.SinonStub;
  let loggerAppendStub: sinon.SinonStub;
  let runLemonTreeCommandStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    
    context = {
      subscriptions: []
    } as any;
    
    workspaceFoldersStub = sandbox.stub(vscode.workspace, 'workspaceFolders');
    registerCommandStub = sandbox.stub(vscode.commands, 'registerCommand');
    showErrorMessageStub = sandbox.stub(vscode.window, 'showErrorMessage');
    loggerAppendStub = sandbox.stub(logger, 'append');
    runLemonTreeCommandStub = sandbox.stub().resolves(true);
    
    // Mock the CLI module
    sandbox.stub(require('../../infrastructure/cli/LemonTreeCli'), 'runLemonTreeCommand')
      .callsFake(runLemonTreeCommandStub);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('when no workspace folders', () => {
    it('should show error message when workspaceFolders is undefined', () => {
      workspaceFoldersStub.value(undefined);
      
      registerCommands(context);
      
      assert.ok(showErrorMessageStub.calledOnce);
      assert.ok(showErrorMessageStub.calledWith('No workspace folder found.'));
      assert.strictEqual(context.subscriptions.length, 0);
    });

    it('should show error message when workspaceFolders is empty', () => {
      workspaceFoldersStub.value([]);
      
      registerCommands(context);
      
      assert.ok(showErrorMessageStub.calledOnce);
      assert.ok(showErrorMessageStub.calledWith('No workspace folder found.'));
      assert.strictEqual(context.subscriptions.length, 0);
    });
  });

  describe('when workspace folders exist', () => {
    beforeEach(() => {
      workspaceFoldersStub.value([
        { uri: { fsPath: '/test/workspace' } },
        { uri: { fsPath: '/test/workspace2' } }
      ]);
    });

    it('should register remove-translation command', () => {
      registerCommands(context);
      
      assert.ok(registerCommandStub.calledWith('lemon-tree.remove-translation'));
      assert.strictEqual(context.subscriptions.length, 2);
    });

    it('should register update-translation command', () => {
      registerCommands(context);
      
      assert.ok(registerCommandStub.calledWith('lemon-tree.update-translation'));
      assert.strictEqual(context.subscriptions.length, 2);
    });

    it('should use first workspace folder path', () => {
      registerCommands(context);
      
      // Get the registered command handlers
      const removeHandler = registerCommandStub.getCall(0).args[1];
      const updateHandler = registerCommandStub.getCall(1).args[1];
      
      // Execute handlers to verify workspace path is used
      removeHandler('test.key');
      updateHandler('test.key');
      
      assert.ok(runLemonTreeCommandStub.calledWith('delete', 'test.key', '/test/workspace'));
      assert.ok(runLemonTreeCommandStub.calledWith('set', 'test.key', '/test/workspace'));
    });

    describe('remove-translation command', () => {
      it('should call runLemonTreeCommand with delete action', async () => {
        registerCommands(context);
        
        const removeHandler = registerCommandStub.getCall(0).args[1];
        await removeHandler('test.key');
        
        assert.ok(loggerAppendStub.calledWith('[lemon-tree] removeTranslation called with: test.key'));
        assert.ok(runLemonTreeCommandStub.calledWith('delete', 'test.key', '/test/workspace'));
      });

      it('should handle empty key', async () => {
        registerCommands(context);
        
        const removeHandler = registerCommandStub.getCall(0).args[1];
        await removeHandler('');
        
        assert.ok(loggerAppendStub.calledWith('[lemon-tree] removeTranslation called with: '));
        assert.ok(runLemonTreeCommandStub.calledWith('delete', '', '/test/workspace'));
      });

      it('should handle special characters in key', async () => {
        registerCommands(context);
        
        const removeHandler = registerCommandStub.getCall(0).args[1];
        const specialKey = 'test.key-with_special@chars#123';
        await removeHandler(specialKey);
        
        assert.ok(loggerAppendStub.calledWith(`[lemon-tree] removeTranslation called with: ${specialKey}`));
        assert.ok(runLemonTreeCommandStub.calledWith('delete', specialKey, '/test/workspace'));
      });
    });

    describe('update-translation command', () => {
      it('should call runLemonTreeCommand with set action', async () => {
        registerCommands(context);
        
        const updateHandler = registerCommandStub.getCall(1).args[1];
        await updateHandler('test.key');
        
        assert.ok(loggerAppendStub.calledWith('[lemon-tree] updateTranslation called with: test.key'));
        assert.ok(runLemonTreeCommandStub.calledWith('set', 'test.key', '/test/workspace'));
      });

      it('should handle empty key', async () => {
        registerCommands(context);
        
        const updateHandler = registerCommandStub.getCall(1).args[1];
        await updateHandler('');
        
        assert.ok(loggerAppendStub.calledWith('[lemon-tree] updateTranslation called with: '));
        assert.ok(runLemonTreeCommandStub.calledWith('set', '', '/test/workspace'));
      });

      it('should handle unicode characters in key', async () => {
        registerCommands(context);
        
        const updateHandler = registerCommandStub.getCall(1).args[1];
        const unicodeKey = 'test.key.emoji.🚀.unicode.ñáéíóú';
        await updateHandler(unicodeKey);
        
        assert.ok(loggerAppendStub.calledWith(`[lemon-tree] updateTranslation called with: ${unicodeKey}`));
        assert.ok(runLemonTreeCommandStub.calledWith('set', unicodeKey, '/test/workspace'));
      });
    });

    describe('error handling', () => {
      it('should handle runLemonTreeCommand rejection in remove command', async () => {
        runLemonTreeCommandStub.rejects(new Error('CLI error'));
        registerCommands(context);
        
        const removeHandler = registerCommandStub.getCall(0).args[1];
        
        try {
          await removeHandler('test.key');
          assert.fail('Should have thrown');
        } catch (error) {
          assert.strictEqual((error as Error).message, 'CLI error');
        }
      });

      it('should handle runLemonTreeCommand rejection in update command', async () => {
        runLemonTreeCommandStub.rejects(new Error('CLI error'));
        registerCommands(context);
        
        const updateHandler = registerCommandStub.getCall(1).args[1];
        
        try {
          await updateHandler('test.key');
          assert.fail('Should have thrown');
        } catch (error) {
          assert.strictEqual((error as Error).message, 'CLI error');
        }
      });
    });
  });
});
