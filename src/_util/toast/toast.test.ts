import * as assert from 'assert';
import { beforeEach, afterEach, describe, it, vi } from 'vitest';
import * as vscode from 'vscode';
import { Toast } from './toast';

describe('Toast', () => {
  let showErrorMessageStub: any;
  let showInformationMessageStub: any;
  let showWarningMessageStub: any;

  beforeEach(() => {
    showErrorMessageStub = vi.mocked(vscode.window.showErrorMessage);
    showInformationMessageStub = vi.mocked(vscode.window.showInformationMessage);
    showWarningMessageStub = vi.mocked(vscode.window.showWarningMessage);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('error', () => {
    it('should call vscode.window.showErrorMessage with the provided message', () => {
      const message = 'Test error message';
      
      Toast.error(message);
      
      assert.strictEqual(showErrorMessageStub.mock.calls.length, 1);
      assert.strictEqual(showErrorMessageStub.mock.calls[0][0], message);
    });

    it('should handle empty message', () => {
      const message = '';
      
      Toast.error(message);
      
      assert.strictEqual(showErrorMessageStub.mock.calls.length, 1);
      assert.strictEqual(showErrorMessageStub.mock.calls[0][0], message);
    });

    it('should handle special characters in message', () => {
      const message = 'Error: File not found! @#$%^&*()';
      
      Toast.error(message);
      
      assert.strictEqual(showErrorMessageStub.mock.calls.length, 1);
      assert.strictEqual(showErrorMessageStub.mock.calls[0][0], message);
    });
  });

  describe('info', () => {
    it('should call vscode.window.showInformationMessage with the provided message', () => {
      const message = 'Test info message';
      
      Toast.info(message);
      
      assert.strictEqual(showInformationMessageStub.mock.calls.length, 1);
      assert.strictEqual(showInformationMessageStub.mock.calls[0][0], message);
    });

    it('should handle empty message', () => {
      const message = '';
      
      Toast.info(message);
      
      assert.strictEqual(showInformationMessageStub.mock.calls.length, 1);
      assert.strictEqual(showInformationMessageStub.mock.calls[0][0], message);
    });

    it('should handle multi-line message', () => {
      const message = 'Line 1\\nLine 2\\nLine 3';
      
      Toast.info(message);
      
      assert.strictEqual(showInformationMessageStub.mock.calls.length, 1);
      assert.strictEqual(showInformationMessageStub.mock.calls[0][0], message);
    });
  });

  describe('warning', () => {
    it('should call vscode.window.showWarningMessage with the provided message', () => {
      const message = 'Test warning message';
      
      Toast.warning(message);
      
      assert.strictEqual(showWarningMessageStub.mock.calls.length, 1);
      assert.strictEqual(showWarningMessageStub.mock.calls[0][0], message);
    });

    it('should handle empty message', () => {
      const message = '';
      
      Toast.warning(message);
      
      assert.strictEqual(showWarningMessageStub.mock.calls.length, 1);
      assert.strictEqual(showWarningMessageStub.mock.calls[0][0], message);
    });

    it('should handle numeric message converted to string', () => {
      const message = '12345';
      
      Toast.warning(message);
      
      assert.strictEqual(showWarningMessageStub.mock.calls.length, 1);
      assert.strictEqual(showWarningMessageStub.mock.calls[0][0], message);
    });
  });
});
