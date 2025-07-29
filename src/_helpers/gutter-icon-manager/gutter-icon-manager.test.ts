import * as assert from 'assert';
import { beforeEach, afterEach, describe, it, vi, expect } from 'vitest';
import * as vscode from 'vscode';
import { GutterIconManager } from './gutter-icon-manager';

describe('GutterIconManager', () => {
  let context: vscode.ExtensionContext;
  let manager: GutterIconManager;
  let createTextEditorDecorationTypeStub: any;
  let decorationTypeMock: any;
  let editor: vscode.TextEditor;
  let asAbsolutePathStub: any;

  beforeEach(() => {
    asAbsolutePathStub = vi.fn().mockImplementation((path: string) => `/absolute/${path}`);
    
    context = {
      asAbsolutePath: asAbsolutePathStub
    } as any;
    
    decorationTypeMock = {
      dispose: vi.fn()
    };
    
    createTextEditorDecorationTypeStub = vi.mocked(vscode.window.createTextEditorDecorationType)
      .mockReturnValue(decorationTypeMock);
    
    editor = {
      setDecorations: vi.fn()
    } as any;
    
    manager = new GutterIconManager(context);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with context and set icon paths', () => {
      assert.ok(manager);
      expect(asAbsolutePathStub).toHaveBeenCalledWith('media/lemon.svg');
      expect(asAbsolutePathStub).toHaveBeenCalledWith('media/loading.svg');
    });
  });

  describe('lineConfig', () => {
    it('should set active line and editor and apply lemon icon', () => {
      manager.lineConfig(5, editor);
      
      expect(createTextEditorDecorationTypeStub).toHaveBeenCalledOnce();
      const decorationOptions = createTextEditorDecorationTypeStub.mock.calls[0][0];
      assert.strictEqual(decorationOptions.gutterIconSize, 'contain');
      assert.ok(decorationOptions.gutterIconPath);
      
      expect((editor.setDecorations as any)).toHaveBeenCalledOnce();
      const setDecorationsArgs = (editor.setDecorations as any).mock.calls[0];
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
      const firstDecorationType = createTextEditorDecorationTypeStub.mock.results[0].value;
      
      manager.lineConfig(2, editor);
      
      expect(firstDecorationType.dispose).toHaveBeenCalledOnce();
      expect(createTextEditorDecorationTypeStub).toHaveBeenCalledTimes(2);
    });

    it('should handle line 0', () => {
      manager.lineConfig(0, editor);
      
      expect((editor.setDecorations as any)).toHaveBeenCalledOnce();
      const setDecorationsArgs = (editor.setDecorations as any).mock.calls[0];
      const range = setDecorationsArgs[1][0];
      assert.strictEqual(range.start.line, 0);
    });
  });

  describe('updating', () => {
    it('should apply loading icon when called', () => {
      manager.lineConfig(3, editor);
      createTextEditorDecorationTypeStub.mockClear();
      vi.mocked(editor.setDecorations).mockClear();
      
      manager.updating();
      
      expect(createTextEditorDecorationTypeStub).toHaveBeenCalledOnce();
      const decorationOptions = createTextEditorDecorationTypeStub.mock.calls[0][0];
      assert.ok(decorationOptions.gutterIconPath.fsPath.includes('loading.svg'));
    });

    it('should work without prior lineConfig call', () => {
      manager.updating();
      
      // Should not throw and should not set decorations since no active line
      expect(editor.setDecorations).not.toHaveBeenCalled();
    });

    it('should dispose previous decoration', () => {
      manager.lineConfig(1, editor);
      const firstDecorationType = createTextEditorDecorationTypeStub.mock.results[0].value;
      
      manager.updating();
      
      expect(firstDecorationType.dispose).toHaveBeenCalledOnce();
    });
  });

  describe('done', () => {
    it('should apply lemon icon when called', () => {
      manager.lineConfig(3, editor);
      manager.updating(); // switch to loading
      createTextEditorDecorationTypeStub.mockClear();
      vi.mocked(editor.setDecorations).mockClear();
      
      manager.done();
      
      expect(createTextEditorDecorationTypeStub).toHaveBeenCalledOnce();
      const decorationOptions = createTextEditorDecorationTypeStub.mock.calls[0][0];
      assert.ok(decorationOptions.gutterIconPath.fsPath.includes('lemon.svg'));
    });

    it('should work without prior setup', () => {
      manager.done();
      
      // Should not throw and should not set decorations since no active line
      expect(editor.setDecorations).not.toHaveBeenCalled();
    });
  });

  describe('dispose', () => {
    it('should dispose decoration type and reset state', () => {
      manager.lineConfig(1, editor);
      const decorationType = createTextEditorDecorationTypeStub.mock.results[0].value;
      
      manager.dispose();
      
      expect(decorationType.dispose).toHaveBeenCalledOnce();
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
      expect(editor.setDecorations).not.toHaveBeenCalled();
    });

    it('should handle applyDecoration with no active line', () => {
      // Call updating without lineConfig first
      manager.updating();
      
      // Should not throw and should not set decorations
      assert.doesNotThrow(() => manager.updating());
      expect(editor.setDecorations).not.toHaveBeenCalled();
    });

    it('should handle applyDecoration with no editor', () => {
      // Simulate having active line but no editor
      (manager as any)._activeLine = 5;
      (manager as any)._editor = undefined;
      
      manager.updating();
      
      // Should not throw and should not set decorations
      assert.doesNotThrow(() => manager.updating());
      expect(editor.setDecorations).not.toHaveBeenCalled();
    });

    it('should create correct Uri for icon paths', () => {
      manager.lineConfig(1, editor);
      
      const decorationOptions = createTextEditorDecorationTypeStub.mock.calls[0][0];
      assert.ok(decorationOptions.gutterIconPath.fsPath);
      assert.ok(decorationOptions.gutterIconPath.fsPath.includes('lemon.svg'));
    });

    it('should use absolute path from context', () => {
      const customAsAbsolutePathStub = vi.fn().mockReturnValue('/custom/absolute/path/media/lemon.svg');
      const customContext = {
        asAbsolutePath: customAsAbsolutePathStub
      } as any;
      
      const customManager = new GutterIconManager(customContext);
      customManager.lineConfig(1, editor);
      
      expect(customAsAbsolutePathStub).toHaveBeenCalledWith('media/lemon.svg');
      expect(customAsAbsolutePathStub).toHaveBeenCalledWith('media/loading.svg');
    });
  });
});
