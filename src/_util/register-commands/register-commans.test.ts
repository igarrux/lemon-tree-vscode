import * as assert from 'assert';
import { beforeEach, afterEach, describe, it, vi, expect } from 'vitest';
import * as vscode from 'vscode';
import { registerCommands } from './register-commans';
import { logger } from '../../_logger/logger';
import { runLemonTreeCommand } from '../../infrastructure/cli/LemonTreeCli';

// Mock the dependencies
vi.mock('../../_logger/logger');
vi.mock('../../infrastructure/cli/LemonTreeCli');

describe('registerCommands', () => {
  let context: vscode.ExtensionContext;
  let workspaceFoldersStub: any;
  let registerCommandStub: any;
  let showErrorMessageStub: any;
  let loggerAppendStub: any;
  let runLemonTreeCommandStub: any;

  beforeEach(() => {
    context = {
      subscriptions: []
    } as any;
    
    workspaceFoldersStub = vi.spyOn(vscode.workspace, 'workspaceFolders', 'get');
    registerCommandStub = vi.mocked(vscode.commands.registerCommand);
    showErrorMessageStub = vi.mocked(vscode.window.showErrorMessage);
    loggerAppendStub = vi.mocked(logger.append);
    runLemonTreeCommandStub = vi.mocked(runLemonTreeCommand).mockResolvedValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('when no workspace folders', () => {
    it('should show error message when workspaceFolders is undefined', () => {
      workspaceFoldersStub.mockReturnValue(undefined);
      
      registerCommands(context);
      
      expect(showErrorMessageStub).toHaveBeenCalledOnce();
      expect(showErrorMessageStub).toHaveBeenCalledWith('No workspace folder found.');
      expect(context.subscriptions).toHaveLength(0);
    });

    it('should show error message when workspaceFolders is empty', () => {
      workspaceFoldersStub.mockReturnValue([]);
      
      registerCommands(context);
      
      expect(showErrorMessageStub).toHaveBeenCalledOnce();
      expect(showErrorMessageStub).toHaveBeenCalledWith('No workspace folder found.');
      expect(context.subscriptions).toHaveLength(0);
    });
  });

  describe('when workspace folders exist', () => {
    beforeEach(() => {
      workspaceFoldersStub.mockReturnValue([
        { uri: { fsPath: '/test/workspace' } },
        { uri: { fsPath: '/test/workspace2' } }
      ]);
    });

    it('should register remove-translation command', () => {
      registerCommands(context);
      
      expect(registerCommandStub).toHaveBeenCalledWith('lemon-tree.remove-translation', expect.any(Function));
      expect(context.subscriptions).toHaveLength(2);
    });

    it('should register update-translation command', () => {
      registerCommands(context);
      
      expect(registerCommandStub).toHaveBeenCalledWith('lemon-tree.update-translation', expect.any(Function));
      expect(context.subscriptions).toHaveLength(2);
    });

    it('should use first workspace folder path', () => {
      registerCommands(context);
      
      // Get the registered command handlers
      const removeHandler = registerCommandStub.mock.calls[0][1];
      const updateHandler = registerCommandStub.mock.calls[1][1];
      
      // Execute handlers to verify workspace path is used
      removeHandler('test.key');
      updateHandler('test.key');
      
      expect(runLemonTreeCommandStub).toHaveBeenCalledWith('delete', 'test.key', '/test/workspace');
      expect(runLemonTreeCommandStub).toHaveBeenCalledWith('set', 'test.key', '/test/workspace');
    });

    describe('remove-translation command', () => {
      it('should call runLemonTreeCommand with delete action', async () => {
        registerCommands(context);
        
        const removeHandler = registerCommandStub.mock.calls[0][1];
        await removeHandler('test.key');
        
        expect(loggerAppendStub).toHaveBeenCalledWith('[lemon-tree] removeTranslation called with: test.key');
        expect(runLemonTreeCommandStub).toHaveBeenCalledWith('delete', 'test.key', '/test/workspace');
      });

      it('should handle empty key', async () => {
        registerCommands(context);
        
        const removeHandler = registerCommandStub.mock.calls[0][1];
        await removeHandler('');
        
        expect(loggerAppendStub).toHaveBeenCalledWith('[lemon-tree] removeTranslation called with: ');
        expect(runLemonTreeCommandStub).toHaveBeenCalledWith('delete', '', '/test/workspace');
      });

      it('should handle special characters in key', async () => {
        registerCommands(context);
        
        const removeHandler = registerCommandStub.mock.calls[0][1];
        const specialKey = 'test.key-with_special@chars#123';
        await removeHandler(specialKey);
        
        expect(loggerAppendStub).toHaveBeenCalledWith(`[lemon-tree] removeTranslation called with: ${specialKey}`);
        expect(runLemonTreeCommandStub).toHaveBeenCalledWith('delete', specialKey, '/test/workspace');
      });
    });

    describe('update-translation command', () => {
      it('should call runLemonTreeCommand with set action', async () => {
        registerCommands(context);
        
        const updateHandler = registerCommandStub.mock.calls[1][1];
        await updateHandler('test.key');
        
        expect(loggerAppendStub).toHaveBeenCalledWith('[lemon-tree] updateTranslation called with: test.key');
        expect(runLemonTreeCommandStub).toHaveBeenCalledWith('set', 'test.key', '/test/workspace');
      });

      it('should handle empty key', async () => {
        registerCommands(context);
        
        const updateHandler = registerCommandStub.mock.calls[1][1];
        await updateHandler('');
        
        expect(loggerAppendStub).toHaveBeenCalledWith('[lemon-tree] updateTranslation called with: ');
        expect(runLemonTreeCommandStub).toHaveBeenCalledWith('set', '', '/test/workspace');
      });

      it('should handle unicode characters in key', async () => {
        registerCommands(context);
        
        const updateHandler = registerCommandStub.mock.calls[1][1];
        const unicodeKey = 'test.key.emoji.🚀.unicode.ñáéíóú';
        await updateHandler(unicodeKey);
        
        expect(loggerAppendStub).toHaveBeenCalledWith(`[lemon-tree] updateTranslation called with: ${unicodeKey}`);
        expect(runLemonTreeCommandStub).toHaveBeenCalledWith('set', unicodeKey, '/test/workspace');
      });
    });

    describe('error handling', () => {
      it('should handle runLemonTreeCommand rejection in remove command', async () => {
        runLemonTreeCommandStub.mockRejectedValue(new Error('CLI error'));
        registerCommands(context);
        
        const removeHandler = registerCommandStub.mock.calls[0][1];
        
        await expect(removeHandler('test.key')).rejects.toThrow('CLI error');
      });

      it('should handle runLemonTreeCommand rejection in update command', async () => {
        runLemonTreeCommandStub.mockRejectedValue(new Error('CLI error'));
        registerCommands(context);
        
        const updateHandler = registerCommandStub.mock.calls[1][1];
        
        await expect(updateHandler('test.key')).rejects.toThrow('CLI error');
      });
    });
  });
});
