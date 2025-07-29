import * as assert from 'assert';
import { beforeEach, afterEach, describe, it, vi, expect } from 'vitest';
import * as vscode from 'vscode';
import { LemonCodeLensProvider } from './activate-line-lens-provider';
import { getLineActions } from '../../_util/get-line-actions/get-line-actions';

// Mock the getLineActions module
vi.mock('../../_util/get-line-actions/get-line-actions');

describe('LemonCodeLensProvider', () => {
  let provider: LemonCodeLensProvider;
  let document: vscode.TextDocument;
  let getLineActionsStub: any;

  beforeEach(() => {
    provider = new LemonCodeLensProvider();
    
    document = {
      uri: vscode.Uri.file('/test/file.ts')
    } as vscode.TextDocument;
    
    getLineActionsStub = vi.mocked(getLineActions);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('setMatches', () => {
    it('should set active line and matches', () => {
      const matches = [
        {
          range: new vscode.Range(5, 10, 5, 20),
          key: 'test.key',
          fnRange: new vscode.Range(5, 5, 5, 8)
        }
      ];
      
      provider.setMatches(5, matches);
      
      // Verify internal state is set (through behavior in provideCodeLenses)
      assert.doesNotThrow(() => provider.setMatches(5, matches));
    });

    it('should fire onDidChangeCodeLenses event', () => {
      return new Promise<void>((resolve) => {
        provider.onDidChangeCodeLenses(() => {
          resolve();
        });
        
        provider.setMatches(0, []);
      });
    });

    it('should handle empty matches array', () => {
      assert.doesNotThrow(() => provider.setMatches(0, []));
    });

    it('should handle multiple matches', () => {
      const matches = [
        {
          range: new vscode.Range(1, 10, 1, 20),
          key: 'key1',
          fnRange: new vscode.Range(1, 5, 1, 8)
        },
        {
          range: new vscode.Range(1, 30, 1, 40),
          key: 'key2',
          fnRange: new vscode.Range(1, 25, 1, 28)
        }
      ];
      
      assert.doesNotThrow(() => provider.setMatches(1, matches));
    });
  });

  describe('provideCodeLenses', () => {
    it('should return empty array when activeLine is null', async () => {
      const result = await provider.provideCodeLenses(document);
      
      assert.deepStrictEqual(result, []);
    });

    it('should provide update and remove code lenses for normal actions', async () => {
      const matches = [
        {
          range: new vscode.Range(5, 10, 5, 20),
          key: 'test.key',
          fnRange: new vscode.Range(5, 5, 5, 8)
        }
      ];
      getLineActionsStub.mockReturnValue(['update', 'remove']);
      
      provider.setMatches(5, matches);
      const result = await provider.provideCodeLenses(document);
      
      assert.strictEqual(result.length, 2);
      
      const updateLens = result.find(lens => lens.command?.title === '🌐 Update');
      const removeLens = result.find(lens => lens.command?.title === '🗑️ Remove');
      
      assert.ok(updateLens);
      assert.ok(removeLens);
      
      assert.strictEqual(updateLens?.command?.command, 'lemon-tree.update-translation');
      assert.deepStrictEqual(updateLens?.command?.arguments, ['test.key']);
      
      assert.strictEqual(removeLens?.command?.command, 'lemon-tree.remove-translation');
      assert.deepStrictEqual(removeLens?.command?.arguments, ['test.key']);
    });

    it('should provide add and remove code lenses for error actions', async () => {
      const matches = [
        {
          range: new vscode.Range(3, 5, 3, 15),
          key: 'error.key',
          fnRange: new vscode.Range(3, 0, 3, 3)
        }
      ];
      getLineActionsStub.mockReturnValue(['add', 'remove']);
      
      provider.setMatches(3, matches);
      const result = await provider.provideCodeLenses(document);
      
      assert.strictEqual(result.length, 2);
      
      const addLens = result.find(lens => lens.command?.title === '✚ Add');
      const removeLens = result.find(lens => lens.command?.title === '🗑️ Remove');
      
      assert.ok(addLens);
      assert.ok(removeLens);
      
      assert.strictEqual(addLens?.command?.command, 'lemon-tree.update-translation');
      assert.deepStrictEqual(addLens?.command?.arguments, ['error.key']);
    });

    it('should handle only update action', async () => {
      const matches = [
        {
          range: new vscode.Range(1, 0, 1, 10),
          key: 'update.only',
          fnRange: new vscode.Range(1, 0, 1, 1)
        }
      ];
      getLineActionsStub.mockReturnValue(['update']);
      
      provider.setMatches(1, matches);
      const result = await provider.provideCodeLenses(document);
      
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].command?.title, '🌐 Update');
    });

    it('should handle only add action', async () => {
      const matches = [
        {
          range: new vscode.Range(2, 0, 2, 10),
          key: 'add.only',
          fnRange: new vscode.Range(2, 0, 2, 1)
        }
      ];
      getLineActionsStub.mockReturnValue(['add']);
      
      provider.setMatches(2, matches);
      const result = await provider.provideCodeLenses(document);
      
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].command?.title, '✚ Add');
    });

    it('should handle only remove action', async () => {
      const matches = [
        {
          range: new vscode.Range(4, 0, 4, 10),
          key: 'remove.only',
          fnRange: new vscode.Range(4, 0, 4, 1)
        }
      ];
      getLineActionsStub.mockReturnValue(['remove']);
      
      provider.setMatches(4, matches);
      const result = await provider.provideCodeLenses(document);
      
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].command?.title, '🗑️ Remove');
    });

    it('should handle multiple matches with different actions', async () => {
      const matches = [
        {
          range: new vscode.Range(1, 0, 1, 10),
          key: 'key1',
          fnRange: new vscode.Range(1, 0, 1, 1)
        },
        {
          range: new vscode.Range(1, 20, 1, 30),
          key: 'key2',
          fnRange: new vscode.Range(1, 15, 1, 18)
        }
      ];
      
      getLineActionsStub
        .mockReturnValueOnce(['update', 'remove'])
        .mockReturnValueOnce(['add', 'remove']);
      
      provider.setMatches(1, matches);
      const result = await provider.provideCodeLenses(document);
      
      assert.strictEqual(result.length, 4); // 2 + 2 actions
      
      const updateLenses = result.filter(lens => lens.command?.title === '🌐 Update');
      const addLenses = result.filter(lens => lens.command?.title === '✚ Add');
      const removeLenses = result.filter(lens => lens.command?.title === '🗑️ Remove');
      
      assert.strictEqual(updateLenses.length, 1);
      assert.strictEqual(addLenses.length, 1);
      assert.strictEqual(removeLenses.length, 2);
    });

    it('should handle empty matches array', async () => {
      provider.setMatches(0, []);
      const result = await provider.provideCodeLenses(document);
      
      assert.deepStrictEqual(result, []);
    });

    it('should handle no available actions', async () => {
      const matches = [
        {
          range: new vscode.Range(1, 0, 1, 10),
          key: 'no.actions',
          fnRange: new vscode.Range(1, 0, 1, 1)
        }
      ];
      getLineActionsStub.mockReturnValue([]);
      
      provider.setMatches(1, matches);
      const result = await provider.provideCodeLenses(document);
      
      assert.deepStrictEqual(result, []);
    });

    it('should create code lenses with correct ranges', async () => {
      const testRange = new vscode.Range(5, 10, 5, 20);
      const matches = [
        {
          range: testRange,
          key: 'range.test',
          fnRange: new vscode.Range(5, 5, 5, 8)
        }
      ];
      getLineActionsStub.mockReturnValue(['update']);
      
      provider.setMatches(5, matches);
      const result = await provider.provideCodeLenses(document);
      
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].range, testRange);
    });

    it('should pass correct parameters to getLineActions', async () => {
      const range = new vscode.Range(3, 10, 3, 20);
      const fnRange = new vscode.Range(3, 5, 3, 8);
      const matches = [
        {
          range,
          key: 'param.test',
          fnRange
        }
      ];
      getLineActionsStub.mockReturnValue(['update']);
      
      provider.setMatches(3, matches);
      await provider.provideCodeLenses(document);
      
      expect(getLineActionsStub).toHaveBeenCalledOnce();
      expect(getLineActionsStub).toHaveBeenCalledWith(document, range, fnRange);
    });
  });

  describe('onDidChangeCodeLenses event', () => {
    it('should be available and callable', () => {
      assert.strictEqual(typeof provider.onDidChangeCodeLenses, 'function');
      
      const disposable = provider.onDidChangeCodeLenses(() => {});
      assert.ok(disposable);
      assert.strictEqual(typeof disposable.dispose, 'function');
    });

    it('should fire when setMatches is called', () => {
      return new Promise<void>((resolve) => {
        let eventFired = false;
        
        provider.onDidChangeCodeLenses(() => {
          eventFired = true;
          assert.ok(true);
          resolve();
        });
        
        provider.setMatches(0, []);
      });
    });

    it('should allow multiple listeners', () => {
      return new Promise<void>((resolve) => {
        let listener1Called = false;
        let listener2Called = false;
        
        provider.onDidChangeCodeLenses(() => {
          listener1Called = true;
          checkCompletion();
        });
        
        provider.onDidChangeCodeLenses(() => {
          listener2Called = true;
          checkCompletion();
        });
        
        function checkCompletion() {
          if (listener1Called && listener2Called) {
            resolve();
          }
        }
        
        provider.setMatches(0, []);
      });
    });
  });
});
