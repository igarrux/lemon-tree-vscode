import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { getLineActions } from './get-line-actions';

describe('getLineActions', () => {
  let sandbox: sinon.SinonSandbox;
  let getDiagnosticsStub: sinon.SinonStub;
  let document: vscode.TextDocument;
  let range: vscode.Range;
  let fnRange: vscode.Range;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    getDiagnosticsStub = sandbox.stub(vscode.languages, 'getDiagnostics');
    
    document = {
      uri: vscode.Uri.file('/test/file.ts')
    } as vscode.TextDocument;
    
    range = new vscode.Range(0, 10, 0, 20);
    fnRange = new vscode.Range(0, 5, 0, 8);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('when there are no diagnostics', () => {
    it('should return update and remove actions', () => {
      getDiagnosticsStub.returns([]);
      
      const actions = getLineActions(document, range, fnRange);
      
      assert.deepStrictEqual(actions, ['update', 'remove']);
    });
  });

  describe('when there are diagnostics but no errors', () => {
    it('should return update and remove actions for warnings', () => {
      const diagnostics = [
        {
          range: new vscode.Range(0, 5, 0, 25),
          severity: vscode.DiagnosticSeverity.Warning,
          message: 'Warning message'
        }
      ];
      getDiagnosticsStub.returns(diagnostics);
      
      const actions = getLineActions(document, range, fnRange);
      
      assert.deepStrictEqual(actions, ['update', 'remove']);
    });

    it('should return update and remove actions for info diagnostics', () => {
      const diagnostics = [
        {
          range: new vscode.Range(0, 5, 0, 25),
          severity: vscode.DiagnosticSeverity.Information,
          message: 'Info message'
        }
      ];
      getDiagnosticsStub.returns(diagnostics);
      
      const actions = getLineActions(document, range, fnRange);
      
      assert.deepStrictEqual(actions, ['update', 'remove']);
    });

    it('should return update and remove actions for hint diagnostics', () => {
      const diagnostics = [
        {
          range: new vscode.Range(0, 5, 0, 25),
          severity: vscode.DiagnosticSeverity.Hint,
          message: 'Hint message'
        }
      ];
      getDiagnosticsStub.returns(diagnostics);
      
      const actions = getLineActions(document, range, fnRange);
      
      assert.deepStrictEqual(actions, ['update', 'remove']);
    });
  });

  describe('when there are error diagnostics', () => {
    it('should return add and remove actions when error contains range start', () => {
      const diagnostics = [
        {
          range: {
            contains: sandbox.stub().returns(true)
          },
          severity: vscode.DiagnosticSeverity.Error,
          message: 'Error message'
        }
      ];
      getDiagnosticsStub.returns(diagnostics);
      
      const actions = getLineActions(document, range, fnRange);
      
      assert.deepStrictEqual(actions, ['add', 'remove']);
    });

    it('should return add and remove actions when error contains fnRange', () => {
      const diagnostics = [
        {
          range: {
            contains: sandbox.stub().callsFake((pos) => pos === fnRange)
          },
          severity: vscode.DiagnosticSeverity.Error,
          message: 'Error message'
        }
      ];
      getDiagnosticsStub.returns(diagnostics);
      
      const actions = getLineActions(document, range, fnRange);
      
      assert.deepStrictEqual(actions, ['add', 'remove']);
    });

    it('should return update and remove actions when error does not contain relevant ranges', () => {
      const diagnostics = [
        {
          range: {
            contains: sandbox.stub().returns(false)
          },
          severity: vscode.DiagnosticSeverity.Error,
          message: 'Error message'
        }
      ];
      getDiagnosticsStub.returns(diagnostics);
      
      const actions = getLineActions(document, range, fnRange);
      
      assert.deepStrictEqual(actions, ['update', 'remove']);
    });

    it('should handle multiple diagnostics with mixed severities', () => {
      const diagnostics = [
        {
          range: {
            contains: sandbox.stub().returns(false)
          },
          severity: vscode.DiagnosticSeverity.Warning,
          message: 'Warning message'
        },
        {
          range: {
            contains: sandbox.stub().returns(true)
          },
          severity: vscode.DiagnosticSeverity.Error,
          message: 'Error message'
        }
      ];
      getDiagnosticsStub.returns(diagnostics);
      
      const actions = getLineActions(document, range, fnRange);
      
      assert.deepStrictEqual(actions, ['add', 'remove']);
    });

    it('should handle multiple error diagnostics', () => {
      const diagnostics = [
        {
          range: {
            contains: sandbox.stub().returns(false)
          },
          severity: vscode.DiagnosticSeverity.Error,
          message: 'Error 1'
        },
        {
          range: {
            contains: sandbox.stub().returns(true)
          },
          severity: vscode.DiagnosticSeverity.Error,
          message: 'Error 2'
        }
      ];
      getDiagnosticsStub.returns(diagnostics);
      
      const actions = getLineActions(document, range, fnRange);
      
      assert.deepStrictEqual(actions, ['add', 'remove']);
    });
  });

  describe('error handling', () => {
    it('should return update and remove actions when getDiagnostics throws', () => {
      getDiagnosticsStub.throws(new Error('API error'));
      
      const actions = getLineActions(document, range, fnRange);
      
      assert.deepStrictEqual(actions, ['update', 'remove']);
    });

    it('should return update and remove actions when diagnostic processing throws', () => {
      const diagnostics = [
        {
          range: {
            contains: sandbox.stub().throws(new Error('Range error'))
          },
          severity: vscode.DiagnosticSeverity.Error,
          message: 'Error message'
        }
      ];
      getDiagnosticsStub.returns(diagnostics);
      
      const actions = getLineActions(document, range, fnRange);
      
      assert.deepStrictEqual(actions, ['update', 'remove']);
    });
  });

  describe('edge cases', () => {
    it('should handle empty diagnostics array', () => {
      getDiagnosticsStub.returns([]);
      
      const actions = getLineActions(document, range, fnRange);
      
      assert.deepStrictEqual(actions, ['update', 'remove']);
    });

    it('should handle null diagnostics', () => {
      getDiagnosticsStub.returns(null);
      
      const actions = getLineActions(document, range, fnRange);
      
      assert.deepStrictEqual(actions, ['update', 'remove']);
    });

    it('should handle undefined diagnostics', () => {
      getDiagnosticsStub.returns(undefined);
      
      const actions = getLineActions(document, range, fnRange);
      
      assert.deepStrictEqual(actions, ['update', 'remove']);
    });
  });
});
