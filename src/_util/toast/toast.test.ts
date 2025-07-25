import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { Toast } from './toast';

describe('Toast', () => {
  let sandbox: sinon.SinonSandbox;
  let showErrorMessageStub: sinon.SinonStub;
  let showInformationMessageStub: sinon.SinonStub;
  let showWarningMessageStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    showErrorMessageStub = sandbox.stub(vscode.window, 'showErrorMessage');
    showInformationMessageStub = sandbox.stub(vscode.window, 'showInformationMessage');
    showWarningMessageStub = sandbox.stub(vscode.window, 'showWarningMessage');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('error', () => {
    it('should call vscode.window.showErrorMessage with the provided message', () => {
      const message = 'Test error message';
      
      Toast.error(message);
      
      assert.ok(showErrorMessageStub.calledOnce);
      assert.ok(showErrorMessageStub.calledWith(message));
    });

    it('should handle empty message', () => {
      const message = '';
      
      Toast.error(message);
      
      assert.ok(showErrorMessageStub.calledOnce);
      assert.ok(showErrorMessageStub.calledWith(message));
    });

    it('should handle special characters in message', () => {
      const message = 'Error: File not found! @#$%^&*()';
      
      Toast.error(message);
      
      assert.ok(showErrorMessageStub.calledOnce);
      assert.ok(showErrorMessageStub.calledWith(message));
    });
  });

  describe('info', () => {
    it('should call vscode.window.showInformationMessage with the provided message', () => {
      const message = 'Test info message';
      
      Toast.info(message);
      
      assert.ok(showInformationMessageStub.calledOnce);
      assert.ok(showInformationMessageStub.calledWith(message));
    });

    it('should handle empty message', () => {
      const message = '';
      
      Toast.info(message);
      
      assert.ok(showInformationMessageStub.calledOnce);
      assert.ok(showInformationMessageStub.calledWith(message));
    });

    it('should handle multi-line message', () => {
      const message = 'Line 1\\nLine 2\\nLine 3';
      
      Toast.info(message);
      
      assert.ok(showInformationMessageStub.calledOnce);
      assert.ok(showInformationMessageStub.calledWith(message));
    });
  });

  describe('warning', () => {
    it('should call vscode.window.showWarningMessage with the provided message', () => {
      const message = 'Test warning message';
      
      Toast.warning(message);
      
      assert.ok(showWarningMessageStub.calledOnce);
      assert.ok(showWarningMessageStub.calledWith(message));
    });

    it('should handle empty message', () => {
      const message = '';
      
      Toast.warning(message);
      
      assert.ok(showWarningMessageStub.calledOnce);
      assert.ok(showWarningMessageStub.calledWith(message));
    });

    it('should handle numeric message converted to string', () => {
      const message = '12345';
      
      Toast.warning(message);
      
      assert.ok(showWarningMessageStub.calledOnce);
      assert.ok(showWarningMessageStub.calledWith(message));
    });
  });
});
