import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { GutterIconManager } from './gutter-icon-manager';

describe('GutterIconManager', () => {
  let sandbox: sinon.SinonSandbox;
  let context: vscode.ExtensionContext;
  let manager: GutterIconManager;
  let createTextEditorDecorationTypeStub: sinon.SinonStub;
  let decorationTypeMock: any;
  let editor: vscode.TextEditor;
  let asAbsolutePathStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    
    asAbsolutePathStub = sandbox.stub().callsFake((path: string) => `/absolute/${path}`);
    
    context = {
      asAbsolutePath: asAbsolutePathStub
    } as any;
    
    decorationTypeMock = {
      dispose: sandbox.stub()
    };
    
    createTextEditorDecorationTypeStub = sandbox.stub(vscode.window, 'createTextEditorDecorationType')
      .returns(decorationTypeMock);
    
    editor = {
      setDecorations: sandbox.stub()
    } as any;
    
    manager = new GutterIconManager(context);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('constructor', () => {
    it('should initialize with context and set icon paths', () => {
      assert.ok(manager);
      assert.ok(asAbsolutePathStub.calledWith('media/lemon.svg'));
      assert.ok(asAbsolutePathStub.calledWith('media/loading.svg'));
    });
  });

  describe('lineConfig', () => {
    it('should set active line and editor and apply lemon icon', () => {
      manager.lineConfig(5, editor);
      
      assert.ok(createTextEditorDecorationTypeStub.calledOnce);
      const decorationOptions = createTextEditorDecorationTypeStub.getCall(0).args[0];
      assert.strictEqual(decorationOptions.gutterIconSize, 'contain');
      assert.ok(decorationOptions.gutterIconPath);
      
      assert.ok((editor.setDecorations as sinon.SinonStub).calledOnce);
      const setDecorationsArgs = (editor.setDecorations as sinon.SinonStub).getCall(0).args;
      assert.strictEqual(setDecorationsArgs[0], decorationTypeMock);
      assert.strictEqual(setDecorationsArgs[1].length, 1);
      
      // Check range
      const range = setDecorationsArgs[1][0];
      assert.strictEqual(range.start.line, 5);
      assert.strictEqual(range.start.character, 0);
      assert.strictEqual(range.end.line, 5);
      assert.strictEqual(range.end.character, 0);
    });

    it('should dispose previous decoration before applying new one', () => {
      manager.lineConfig(1, editor);
      const firstDecorationType = createTextEditorDecorationTypeStub.getCall(0).returnValue;
      
      manager.lineConfig(2, editor);
      
      assert.ok(firstDecorationType.dispose.calledOnce);
      assert.ok(createTextEditorDecorationTypeStub.calledTwice);
    });

    it('should handle line 0', () => {
      manager.lineConfig(0, editor);
      
      assert.ok((editor.setDecorations as sinon.SinonStub).calledOnce);
      const setDecorationsArgs = (editor.setDecorations as sinon.SinonStub).getCall(0).args;
      const range = setDecorationsArgs[1][0];
      assert.strictEqual(range.start.line, 0);
    });
  });

  describe('updating', () => {
    it('should apply loading icon when called', () => {
      manager.lineConfig(3, editor);
      createTextEditorDecorationTypeStub.resetHistory();
      (editor.setDecorations as sinon.SinonStub).resetHistory();
      
      manager.updating();
      
      assert.ok(createTextEditorDecorationTypeStub.calledOnce);
      const decorationOptions = createTextEditorDecorationTypeStub.getCall(0).args[0];
      assert.ok(decorationOptions.gutterIconPath.fsPath.includes('loading.svg'));
    });

    it('should work without prior lineConfig call', () => {
      manager.updating();
      
      // Should not throw and should not set decorations since no active line
      assert.ok((editor.setDecorations as sinon.SinonStub).notCalled);
    });

    it('should dispose previous decoration', () => {
      manager.lineConfig(1, editor);
      const firstDecorationType = createTextEditorDecorationTypeStub.getCall(0).returnValue;
      
      manager.updating();
      
      assert.ok(firstDecorationType.dispose.calledOnce);
    });
  });

  describe('done', () => {
    it('should apply lemon icon when called', () => {
      manager.lineConfig(3, editor);
      manager.updating(); // switch to loading
      createTextEditorDecorationTypeStub.resetHistory();
      (editor.setDecorations as sinon.SinonStub).resetHistory();
      
      manager.done();
      
      assert.ok(createTextEditorDecorationTypeStub.calledOnce);
      const decorationOptions = createTextEditorDecorationTypeStub.getCall(0).args[0];
      assert.ok(decorationOptions.gutterIconPath.fsPath.includes('lemon.svg'));
    });

    it('should work without prior setup', () => {
      manager.done();
      
      // Should not throw and should not set decorations since no active line
      assert.ok((editor.setDecorations as sinon.SinonStub).notCalled);
    });
  });

  describe('dispose', () => {
    it('should dispose decoration type and reset state', () => {
      manager.lineConfig(1, editor);
      const decorationType = createTextEditorDecorationTypeStub.getCall(0).returnValue;
      
      manager.dispose();
      
      assert.ok(decorationType.dispose.calledOnce);
    });

    it('should handle multiple dispose calls', () => {
      manager.lineConfig(1, editor);
      
      manager.dispose();
      manager.dispose(); // Should not throw
      
      // First dispose should be called once, subsequent calls should not throw
      assert.doesNotThrow(() => manager.dispose());
    });

    it('should handle dispose without prior decoration', () => {
      assert.doesNotThrow(() => manager.dispose());
    });

    it('should reset decoration type to null', () => {
      manager.lineConfig(1, editor);
      
      manager.dispose();
      
      // Verify that subsequent calls don't try to dispose null decoration
      assert.doesNotThrow(() => manager.dispose());
    });
  });

  describe('edge cases', () => {
    it('should handle negative line numbers', () => {
      manager.lineConfig(-1, editor);
      
      // Should not set decorations for invalid line
      assert.ok((editor.setDecorations as sinon.SinonStub).notCalled);
    });

    it('should handle applyDecoration with no active line', () => {
      // Call updating without lineConfig first
      manager.updating();
      
      // Should not throw and should not set decorations
      assert.doesNotThrow(() => manager.updating());
      assert.ok((editor.setDecorations as sinon.SinonStub).notCalled);
    });

    it('should handle applyDecoration with no editor', () => {
      // Simulate having active line but no editor
      (manager as any)._activeLine = 5;
      (manager as any)._editor = undefined;
      
      manager.updating();
      
      // Should not throw and should not set decorations
      assert.doesNotThrow(() => manager.updating());
      assert.ok((editor.setDecorations as sinon.SinonStub).notCalled);
    });

    it('should create correct Uri for icon paths', () => {
      manager.lineConfig(1, editor);
      
      const decorationOptions = createTextEditorDecorationTypeStub.getCall(0).args[0];
      assert.ok(decorationOptions.gutterIconPath instanceof vscode.Uri);
      assert.ok(decorationOptions.gutterIconPath.fsPath.includes('lemon.svg'));
    });

    it('should use absolute path from context', () => {
      const customAsAbsolutePathStub = sandbox.stub().returns('/custom/absolute/path/media/lemon.svg');
      const customContext = {
        asAbsolutePath: customAsAbsolutePathStub
      } as any;
      
      const customManager = new GutterIconManager(customContext);
      customManager.lineConfig(1, editor);
      
      assert.ok(customAsAbsolutePathStub.calledWith('media/lemon.svg'));
      assert.ok(customAsAbsolutePathStub.calledWith('media/loading.svg'));
    });
  });
});
