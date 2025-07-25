import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import * as childProcess from 'child_process';
import { runLemonTreeCommand } from './LemonTreeCli';
import { logger } from '../../_logger/logger';

describe('runLemonTreeCommand', () => {
  let sandbox: sinon.SinonSandbox;
  let execStub: sinon.SinonStub;
  let loggerAppendStub: sinon.SinonStub;
  let loggerShowStub: sinon.SinonStub;
  let showInformationMessageStub: sinon.SinonStub;
  let showErrorMessageStub: sinon.SinonStub;
  let gutterIconManagerMock: any;
  
  const rootPath = '/root';
  const text = 'my.key';

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    execStub = sandbox.stub(childProcess, 'exec');
    loggerAppendStub = sandbox.stub(logger, 'append');
    loggerShowStub = sandbox.stub(logger, 'show');
    showInformationMessageStub = sandbox.stub(vscode.window, 'showInformationMessage');
    showErrorMessageStub = sandbox.stub(vscode.window, 'showErrorMessage');
    
    // Mock gutterIconManager
    gutterIconManagerMock = {
      updating: sandbox.stub(),
      done: sandbox.stub()
    };
    
    sandbox.stub(require('../../extension'), 'gutterIconManager').value(gutterIconManagerMock);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('successful execution', () => {
    it('should resolve on success with exit code 0', async () => {
      const error = new Error('Success') as any;
      error.code = 0;
      execStub.yields(error, 'success output', '');
      
      const result = await runLemonTreeCommand('set', text, rootPath);
      
      assert.strictEqual(result, true);
      assert.ok(execStub.calledOnce);
      assert.ok(gutterIconManagerMock.updating.calledOnce);
      assert.ok(gutterIconManagerMock.done.calledOnce);
      assert.ok(showInformationMessageStub.calledWith('Lemon Tree: my.key added'));
    });

    it('should handle success without error object', async () => {
      execStub.yields(null, 'success output', '');
      
      const result = await runLemonTreeCommand('delete', text, rootPath);
      
      assert.strictEqual(result, true);
      assert.ok(showInformationMessageStub.calledWith('Lemon Tree: my.key removed'));
    });

    it('should handle stderr with overwritten message', async () => {
      execStub.yields(null, 'success', 'key overwritten');
      
      const result = await runLemonTreeCommand('set', text, rootPath);
      
      assert.strictEqual(result, true);
      assert.ok(showInformationMessageStub.calledWith('Lemon Tree: my.key added'));
    });
  });

  describe('error handling', () => {
    it('should handle not found error (code 4)', async () => {
      const error = new Error('Not found') as any;
      error.code = 4;
      execStub.yields(error, '', 'not found stderr');
      
      const result = await runLemonTreeCommand('delete', text, rootPath);
      
      assert.strictEqual(result, false);
      assert.ok(loggerAppendStub.calledWith(sinon.match(/Not found/)));
    });

    it('should handle failed error (code 1)', async () => {
      const error = new Error('Failed') as any;
      error.code = 1;
      execStub.yields(error, '', 'failed stderr');
      
      const result = await runLemonTreeCommand('set', text, rootPath);
      
      assert.strictEqual(result, false);
      assert.ok(loggerAppendStub.calledWith(sinon.match(/Failed/)));
    });

    it('should handle fatal error (code 5)', async () => {
      const error = new Error('Fatal error') as any;
      error.code = 5;
      execStub.yields(error, '', 'fatal stderr');
      
      const result = await runLemonTreeCommand('set', text, rootPath);
      
      assert.strictEqual(result, false);
      assert.ok(loggerAppendStub.calledWith(sinon.match(/Fatal error/)));
      assert.ok(loggerShowStub.calledWith(false));
    });

    it('should handle generic error with stderr', async () => {
      const error = new Error('Generic error');
      execStub.yields(error, '', 'error stderr message');
      
      const result = await runLemonTreeCommand('set', text, rootPath);
      
      assert.strictEqual(result, false);
      assert.ok(showErrorMessageStub.calledWith('Lemon Tree error: Generic error'));
    });

    it('should handle stderr without error', async () => {
      execStub.yields(null, '', 'stderr only');
      
      const result = await runLemonTreeCommand('set', text, rootPath);
      
      assert.strictEqual(result, false);
      assert.ok(showErrorMessageStub.calledWith('Lemon Tree error: stderr only'));
    });
  });

  describe('command construction', () => {
    it('should construct correct command for set action', async () => {
      execStub.yields(null, 'ok', '');
      
      await runLemonTreeCommand('set', 'test.key', '/project/root');
      
      const expectedCmd = 'LT_AUTO_YES=true npx ltr set "test.key"';
      assert.ok(execStub.calledWith(expectedCmd, { cwd: '/project/root' }));
    });

    it('should construct correct command for delete action', async () => {
      execStub.yields(null, 'ok', '');
      
      await runLemonTreeCommand('delete', 'test.key', '/project/root');
      
      const expectedCmd = 'LT_AUTO_YES=true npx ltr delete "test.key"';
      assert.ok(execStub.calledWith(expectedCmd, { cwd: '/project/root' }));
    });

    it('should handle special characters in text', async () => {
      execStub.yields(null, 'ok', '');
      const specialText = 'test.key-with_special@chars#123';
      
      await runLemonTreeCommand('set', specialText, rootPath);
      
      const expectedCmd = `LT_AUTO_YES=true npx ltr set "${specialText}"`;
      assert.ok(execStub.calledWith(expectedCmd, { cwd: rootPath }));
    });

    it('should handle unicode characters in text', async () => {
      execStub.yields(null, 'ok', '');
      const unicodeText = 'test.emoji.🚀.unicode.ñáéíóú';
      
      await runLemonTreeCommand('set', unicodeText, rootPath);
      
      const expectedCmd = `LT_AUTO_YES=true npx ltr set "${unicodeText}"`;
      assert.ok(execStub.calledWith(expectedCmd, { cwd: rootPath }));
    });
  });

  describe('logging', () => {
    it('should log command execution', async () => {
      execStub.yields(null, 'ok', '');
      
      await runLemonTreeCommand('set', text, rootPath);
      
      const expectedCmd = 'LT_AUTO_YES=true npx ltr set "my.key"';
      assert.ok(loggerAppendStub.calledWith(`Running command: ${expectedCmd}`));
    });

    it('should log success', async () => {
      execStub.yields(null, 'success output', '');
      
      await runLemonTreeCommand('set', text, rootPath);
      
      assert.ok(loggerAppendStub.calledWith(sinon.match(/Success:/)));
    });

    it('should strip ANSI codes from stderr', async () => {
      const stderrWithAnsi = '\u001b[31mError message\u001b[0m\nSecond line';
      execStub.yields(new Error('Test error'), '', stderrWithAnsi);
      
      await runLemonTreeCommand('set', text, rootPath);
      
      assert.ok(loggerAppendStub.calledWith('Error message'));
    });
  });

  describe('gutterIconManager integration', () => {
    it('should call updating before execution', async () => {
      execStub.yields(null, 'ok', '');
      
      await runLemonTreeCommand('set', text, rootPath);
      
      assert.ok(gutterIconManagerMock.updating.calledBefore(execStub));
    });

    it('should call done after execution', async () => {
      execStub.yields(null, 'ok', '');
      
      await runLemonTreeCommand('set', text, rootPath);
      
      assert.ok(gutterIconManagerMock.done.calledAfter(execStub));
    });

    it('should call done even on error', async () => {
      execStub.yields(new Error('Test error'), '', '');
      
      await runLemonTreeCommand('set', text, rootPath);
      
      assert.ok(gutterIconManagerMock.done.calledOnce);
    });
  });

  describe('edge cases', () => {
    it('should handle empty text', async () => {
      execStub.yields(null, 'ok', '');
      
      const result = await runLemonTreeCommand('set', '', rootPath);
      
      assert.strictEqual(result, true);
      const expectedCmd = 'LT_AUTO_YES=true npx ltr set ""';
      assert.ok(execStub.calledWith(expectedCmd, { cwd: rootPath }));
    });

    it('should handle empty root path', async () => {
      execStub.yields(null, 'ok', '');
      
      await runLemonTreeCommand('set', text, '');
      
      assert.ok(execStub.calledWith(sinon.match.string, { cwd: '' }));
    });

    it('should handle very long text', async () => {
      execStub.yields(null, 'ok', '');
      const longText = 'a'.repeat(1000);
      
      const result = await runLemonTreeCommand('set', longText, rootPath);
      
      assert.strictEqual(result, true);
    });

    it('should handle null error message', async () => {
      const error = new Error() as any;
      error.message = null;
      execStub.yields(error, '', '');
      
      const result = await runLemonTreeCommand('set', text, rootPath);
      
      assert.strictEqual(result, false);
      assert.ok(showErrorMessageStub.calledWith('Lemon Tree error: Unknown error'));
    });

    it('should handle undefined stderr', async () => {
      execStub.yields(new Error('Test'), '', undefined);
      
      const result = await runLemonTreeCommand('set', text, rootPath);
      
      assert.strictEqual(result, false);
    });
  });
});