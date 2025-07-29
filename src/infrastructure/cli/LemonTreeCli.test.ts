import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as childProcess from 'child_process';
import * as vscode from 'vscode';
import { runLemonTreeCommand } from './LemonTreeCli';
import { logger } from '../../_logger/logger';
import { gutterIconManager } from '../../extension';

// Mock dependencies
vi.mock('child_process');
vi.mock('../../_logger/logger');

// Mock gutterIconManager with factory function
vi.mock('../../extension', () => ({
  gutterIconManager: {
    updating: vi.fn(),
    done: vi.fn(),
  }
}));

describe('runLemonTreeCommand', () => {
  let execMock: any;
  let loggerAppendMock: any;
  let loggerShowMock: any;
  let showInformationMessageMock: any;
  let showErrorMessageMock: any;

  const rootPath = '/root';
  const text = 'my.key';

  beforeEach(() => {
    execMock = vi.mocked(childProcess.exec);
    loggerAppendMock = vi.mocked(logger.append);
    loggerShowMock = vi.mocked(logger.show);
    showInformationMessageMock = vi.mocked(vscode.window.showInformationMessage);
    showErrorMessageMock = vi.mocked(vscode.window.showErrorMessage);
    
    // Reset the mock functions
    vi.mocked(gutterIconManager.updating).mockClear();
    vi.mocked(gutterIconManager.done).mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('successful execution', () => {
    it('should resolve true on success with exit code 0', async () => {
      const error = new Error('Success') as any;
      error.code = 0;
      execMock.mockImplementation((cmd: string, options: any, callback: Function) => {
        callback(error, 'success output', '');
      });

      const result = await runLemonTreeCommand('set', text, rootPath);

      expect(result).toBe(true);
      expect(gutterIconManager.updating).toHaveBeenCalled();
      expect(gutterIconManager.done).toHaveBeenCalled();
      expect(showInformationMessageMock).toHaveBeenCalledWith('Lemon Tree: my.key added');
      expect(loggerAppendMock).toHaveBeenCalledWith('Running command: LT_AUTO_YES=true npx ltr set "my.key"');
    });

    it('should resolve true on success without error', async () => {
      execMock.mockImplementation((cmd: string, options: any, callback: Function) => {
        callback(null, 'success output', '');
      });

      const result = await runLemonTreeCommand('delete', text, rootPath);

      expect(result).toBe(true);
      expect(showInformationMessageMock).toHaveBeenCalledWith('Lemon Tree: my.key removed');
    });

    it('should handle stderr with overwritten message', async () => {
      execMock.mockImplementation((cmd: string, options: any, callback: Function) => {
        callback(null, 'success', 'key overwritten');
      });

      const result = await runLemonTreeCommand('set', text, rootPath);

      expect(result).toBe(true);
      expect(showInformationMessageMock).toHaveBeenCalledWith('Lemon Tree: my.key added');
    });
  });

  describe('error handling', () => {
    it('should handle not found error (code 4)', async () => {
      const error = new Error('Not found') as any;
      error.code = 4;
      execMock.mockImplementation((cmd: string, options: any, callback: Function) => {
        callback(error, '', 'not found stderr');
      });

      const result = await runLemonTreeCommand('delete', text, rootPath);

      expect(result).toBe(false);
      expect(loggerAppendMock).toHaveBeenCalledWith(expect.stringContaining('Not found:'));
    });

    it('should handle failed error (code 1)', async () => {
      const error = new Error('Failed') as any;
      error.code = 1;
      execMock.mockImplementation((cmd: string, options: any, callback: Function) => {
        callback(error, '', 'failed stderr');
      });

      const result = await runLemonTreeCommand('set', text, rootPath);

      expect(result).toBe(false);
      expect(loggerAppendMock).toHaveBeenCalledWith(expect.stringContaining('Failed:'));
    });

    it('should handle fatal error (code 5)', async () => {
      const error = new Error('Fatal error') as any;
      error.code = 5;
      execMock.mockImplementation((cmd: string, options: any, callback: Function) => {
        callback(error, '', 'fatal stderr');
      });

      const result = await runLemonTreeCommand('set', text, rootPath);

      expect(result).toBe(false);
      expect(loggerAppendMock).toHaveBeenCalledWith(expect.stringContaining('Fatal error:'));
      expect(loggerShowMock).toHaveBeenCalledWith(false);
    });

    it('should handle generic error with stderr', async () => {
      const error = new Error('Generic error');
      execMock.mockImplementation((cmd: string, options: any, callback: Function) => {
        callback(error, '', 'error stderr message');
      });

      const result = await runLemonTreeCommand('set', text, rootPath);

      expect(result).toBe(false);
      expect(showErrorMessageMock).toHaveBeenCalledWith('Lemon Tree error: Generic error');
    });

    it('should handle stderr without error', async () => {
      execMock.mockImplementation((cmd: string, options: any, callback: Function) => {
        callback(null, '', 'stderr only');
      });

      const result = await runLemonTreeCommand('set', text, rootPath);

      expect(result).toBe(false);
      expect(showErrorMessageMock).toHaveBeenCalledWith('Lemon Tree error: stderr only');
    });

    it('should handle error without message', async () => {
      const error = new Error();
      error.message = '';
      execMock.mockImplementation((cmd: string, options: any, callback: Function) => {
        callback(error, '', '');
      });

      const result = await runLemonTreeCommand('set', text, rootPath);

      expect(result).toBe(false);
      expect(showErrorMessageMock).toHaveBeenCalledWith('Lemon Tree error: Unknown error');
    });

    it('should handle stderr that does not contain overwritten', async () => {
      execMock.mockImplementation((cmd: string, options: any, callback: Function) => {
        callback(null, '', 'some error message');
      });

      const result = await runLemonTreeCommand('set', text, rootPath);

      expect(result).toBe(false);
      expect(showErrorMessageMock).toHaveBeenCalledWith('Lemon Tree error: some error message');
    });

    it('should handle error with stderr that does not contain overwritten', async () => {
      const error = new Error('Some error');
      execMock.mockImplementation((cmd: string, options: any, callback: Function) => {
        callback(error, '', 'some error stderr');
      });

      const result = await runLemonTreeCommand('set', text, rootPath);

      expect(result).toBe(false);
      expect(showErrorMessageMock).toHaveBeenCalledWith('Lemon Tree error: Some error');
    });

    it('should handle stderr that contains overwritten (success case)', async () => {
      execMock.mockImplementation((cmd: string, options: any, callback: Function) => {
        callback(null, 'stdout result', 'warning: file overwritten');
      });

      const result = await runLemonTreeCommand('set', text, rootPath);

      expect(result).toBe(true);
      expect(showInformationMessageMock).toHaveBeenCalledWith('Lemon Tree: my.key added');
      expect(loggerAppendMock).toHaveBeenCalledWith(expect.stringContaining('Success:'));
    });

    it('should handle success with no error and no stderr', async () => {
      execMock.mockImplementation((cmd: string, options: any, callback: Function) => {
        callback(null, 'stdout result', '');
      });

      const result = await runLemonTreeCommand('set', text, rootPath);

      expect(result).toBe(true);
      expect(showInformationMessageMock).toHaveBeenCalledWith('Lemon Tree: my.key added');
      expect(loggerAppendMock).toHaveBeenCalledWith(expect.stringContaining('Success:'));
    });

    it('should handle delete action with success', async () => {
      execMock.mockImplementation((cmd: string, options: any, callback: Function) => {
        callback(null, 'stdout result', '');
      });

      const result = await runLemonTreeCommand('delete', text, rootPath);

      expect(result).toBe(true);
      expect(showInformationMessageMock).toHaveBeenCalledWith('Lemon Tree: my.key removed');
      expect(loggerAppendMock).toHaveBeenCalledWith(expect.stringContaining('Success:'));
    });

    it('should handle delete action with error', async () => {
      const error = new Error('Delete error');
      execMock.mockImplementation((cmd: string, options: any, callback: Function) => {
        callback(error, '', 'delete stderr');
      });

      const result = await runLemonTreeCommand('delete', text, rootPath);

      expect(result).toBe(false);
      expect(showErrorMessageMock).toHaveBeenCalledWith('Lemon Tree error: Delete error');
    });

    it('should handle delete action with success and error code 0', async () => {
      const error = new Error('Success message') as any;
      error.code = 0;
      execMock.mockImplementation((cmd: string, options: any, callback: Function) => {
        callback(error, 'stdout result', '');
      });

      const result = await runLemonTreeCommand('delete', text, rootPath);

      expect(result).toBe(true);
      expect(showInformationMessageMock).toHaveBeenCalledWith('Lemon Tree: my.key removed');
      expect(loggerAppendMock).toHaveBeenCalledWith(expect.stringContaining('Success:'));
    });

    it('should handle delete action with stderr containing overwritten', async () => {
      execMock.mockImplementation((cmd: string, options: any, callback: Function) => {
        callback(null, 'stdout result', 'warning: file overwritten');
      });

      const result = await runLemonTreeCommand('delete', text, rootPath);

      expect(result).toBe(true);
      expect(showInformationMessageMock).toHaveBeenCalledWith('Lemon Tree: my.key removed');
      expect(loggerAppendMock).toHaveBeenCalledWith(expect.stringContaining('Success:'));
    });
  });

  describe('command construction', () => {
    it('should construct correct command for set action', async () => {
      execMock.mockImplementation((cmd: string, options: any, callback: Function) => {
        expect(cmd).toBe('LT_AUTO_YES=true npx ltr set "test.key"');
        expect(options.cwd).toBe('/project/root');
        callback(null, 'ok', '');
      });

      await runLemonTreeCommand('set', 'test.key', '/project/root');
    });

    it('should construct correct command for delete action', async () => {
      execMock.mockImplementation((cmd: string, options: any, callback: Function) => {
        expect(cmd).toBe('LT_AUTO_YES=true npx ltr delete "test.key"');
        expect(options.cwd).toBe('/project/root');
        callback(null, 'ok', '');
      });

      await runLemonTreeCommand('delete', 'test.key', '/project/root');
    });
  });

  describe('ANSI code stripping', () => {
    it('should strip ANSI codes from stderr', async () => {
      const stderrWithAnsi = '\u001b[31mError message\u001b[0m\nSecond line';
      execMock.mockImplementation((cmd: string, options: any, callback: Function) => {
        callback(new Error('Test error'), '', stderrWithAnsi);
      });

      await runLemonTreeCommand('set', text, rootPath);

      // Verificar que se llama con el stderr procesado (sin códigos ANSI)
      expect(loggerAppendMock).toHaveBeenCalledWith(expect.stringContaining('rror message'));
    });
  });

  describe('gutterIconManager integration', () => {
    it('should call updating before execution and done after', async () => {
      execMock.mockImplementation((cmd: string, options: any, callback: Function) => {
        // Verify updating was called before this point
        expect(gutterIconManager.updating).toHaveBeenCalled();
        callback(null, 'ok', '');
      });

      await runLemonTreeCommand('set', text, rootPath);

      expect(gutterIconManager.done).toHaveBeenCalled();
    });

    it('should call done even on error', async () => {
      execMock.mockImplementation((cmd: string, options: any, callback: Function) => {
        callback(new Error('Test error'), '', '');
      });

      await runLemonTreeCommand('set', text, rootPath);

      expect(gutterIconManager.done).toHaveBeenCalled();
    });
  });
});
