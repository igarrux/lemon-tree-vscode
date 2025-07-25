import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { DECORATION } from './decoration.config';

describe('decoration.config', () => {
  let sandbox: sinon.SinonSandbox;
  let createTextEditorDecorationTypeStub: sinon.SinonStub;
  let themeColorMock: any;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    
    themeColorMock = {
      id: 'editor.wordHighlightBackground'
    };
    
    createTextEditorDecorationTypeStub = sandbox.stub(vscode.window, 'createTextEditorDecorationType')
      .returns({} as vscode.TextEditorDecorationType);
    
    // Mock ThemeColor constructor
    sandbox.stub(vscode, 'ThemeColor').returns(themeColorMock);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('DECORATION', () => {
    it('should create decoration type with correct configuration', () => {
      // Access DECORATION to trigger its creation
      const decoration = DECORATION;
      
      assert.ok(createTextEditorDecorationTypeStub.calledOnce);
      
      const callArgs = createTextEditorDecorationTypeStub.getCall(0).args[0];
      assert.strictEqual(callArgs.borderRadius, '3px');
      assert.ok(callArgs.backgroundColor);
    });

    it('should use editor.wordHighlightBackground theme color', () => {
      // Access DECORATION to trigger its creation
      const decoration = DECORATION;
      
      const vscodeThemeColorConstructor = (vscode.ThemeColor as any);
      assert.ok(vscodeThemeColorConstructor.calledWith('editor.wordHighlightBackground'));
    });

    it('should be a valid TextEditorDecorationType', () => {
      assert.ok(DECORATION);
      assert.strictEqual(typeof DECORATION, 'object');
    });

    it('should create only one decoration type instance', () => {
      // Access DECORATION multiple times
      const decoration1 = DECORATION;
      const decoration2 = DECORATION;
      const decoration3 = DECORATION;
      
      // Should only be called once since it's a module-level constant
      assert.ok(createTextEditorDecorationTypeStub.calledOnce);
      assert.strictEqual(decoration1, decoration2);
      assert.strictEqual(decoration2, decoration3);
    });
  });
});
