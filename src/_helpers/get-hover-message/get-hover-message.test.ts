import * as assert from 'assert';
import { beforeEach, afterEach, describe, it, vi, expect } from 'vitest';
import * as vscode from 'vscode';
import { getHoverMessages } from './get-hover-message';
import { getLineActions } from '../../_util/get-line-actions/get-line-actions';

// Mock the getLineActions module
vi.mock('../../_util/get-line-actions/get-line-actions');

describe('getHoverMessages', () => {
  let document: vscode.TextDocument;
  let getLineActionsStub: any;

  beforeEach(() => {
    document = {
      uri: vscode.Uri.file('/test/file.ts')
    } as vscode.TextDocument;
    
    getLineActionsStub = vi.mocked(getLineActions);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('with single range', () => {
    it('should return decoration with update action', () => {
      const ranges = [
        {
          key: 'test.key',
          range: new vscode.Range(0, 5, 0, 15),
          fnRange: new vscode.Range(0, 0, 0, 3)
        }
      ];
      getLineActionsStub.mockReturnValue(['update', 'remove']);
      
      const result = getHoverMessages(document, ranges);
      
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].range, ranges[0].range);
      assert.ok(result[0].hoverMessage);
      
      const markdown = result[0].hoverMessage as any;
      assert.ok(markdown.value.includes('🍋 Lemon Tree'));
      assert.ok(markdown.value.includes('test.key'));
      assert.ok(markdown.value.includes('Update Translation'));
      assert.ok(markdown.value.includes('Remove Translation'));
      assert.strictEqual(markdown.isTrusted, true);
    });

    it('should return decoration with add action', () => {
      const ranges = [
        {
          key: 'missing.key',
          range: new vscode.Range(1, 10, 1, 20),
          fnRange: new vscode.Range(1, 5, 1, 8)
        }
      ];
      getLineActionsStub.mockReturnValue(['add', 'remove']);
      
      const result = getHoverMessages(document, ranges);
      
      assert.strictEqual(result.length, 1);
      const markdown = result[0].hoverMessage as vscode.MarkdownString;
      assert.ok(markdown.value.includes('Add Translation'));
      assert.ok(markdown.value.includes('Remove Translation'));
    });

    it('should create correct command URLs', () => {
      const ranges = [
        {
          key: 'url.test',
          range: new vscode.Range(2, 0, 2, 10),
          fnRange: new vscode.Range(2, 0, 2, 1)
        }
      ];
      getLineActionsStub.mockReturnValue(['update', 'remove']);
      
      const result = getHoverMessages(document, ranges);
      
      const markdown = result[0].hoverMessage as vscode.MarkdownString;
      const expectedUpdateParam = encodeURIComponent(JSON.stringify('url.test'));
      const expectedRemoveParam = encodeURIComponent(JSON.stringify('url.test'));
      
      assert.ok(markdown.value.includes(`command:lemon-tree.update-translation?${expectedUpdateParam}`));
      assert.ok(markdown.value.includes(`command:lemon-tree.remove-translation?${expectedRemoveParam}`));
    });

    it('should handle special characters in key', () => {
      const specialKey = 'test.key-with_special@chars#123';
      const ranges = [
        {
          key: specialKey,
          range: new vscode.Range(0, 0, 0, 10),
          fnRange: new vscode.Range(0, 0, 0, 1)
        }
      ];
      getLineActionsStub.mockReturnValue(['update', 'remove']);
      
      const result = getHoverMessages(document, ranges);
      
      const markdown = result[0].hoverMessage as vscode.MarkdownString;
      assert.ok(markdown.value.includes(specialKey));
      
      const expectedParam = encodeURIComponent(JSON.stringify(specialKey));
      assert.ok(markdown.value.includes(expectedParam));
    });

    it('should handle unicode characters in key', () => {
      const unicodeKey = 'test.emoji.🚀.unicode.ñáéíóú';
      const ranges = [
        {
          key: unicodeKey,
          range: new vscode.Range(0, 0, 0, 10),
          fnRange: new vscode.Range(0, 0, 0, 1)
        }
      ];
      getLineActionsStub.mockReturnValue(['update', 'remove']);
      
      const result = getHoverMessages(document, ranges);
      
      const markdown = result[0].hoverMessage as vscode.MarkdownString;
      assert.ok(markdown.value.includes(unicodeKey));
    });

    it('should handle empty key', () => {
      const ranges = [
        {
          key: '',
          range: new vscode.Range(0, 0, 0, 0),
          fnRange: new vscode.Range(0, 0, 0, 1)
        }
      ];
      getLineActionsStub.mockReturnValue(['add', 'remove']);
      
      const result = getHoverMessages(document, ranges);
      
      assert.strictEqual(result.length, 1);
      const markdown = result[0].hoverMessage as vscode.MarkdownString;
      assert.ok(markdown.value.includes('**Key:** ``'));
    });
  });

  describe('with multiple ranges', () => {
    it('should return multiple decorations', () => {
      const ranges = [
        {
          key: 'key1',
          range: new vscode.Range(0, 0, 0, 10),
          fnRange: new vscode.Range(0, 0, 0, 1)
        },
        {
          key: 'key2',
          range: new vscode.Range(1, 0, 1, 10),
          fnRange: new vscode.Range(1, 0, 1, 1)
        },
        {
          key: 'key3',
          range: new vscode.Range(2, 0, 2, 10),
          fnRange: new vscode.Range(2, 0, 2, 1)
        }
      ];
      getLineActionsStub.mockReturnValue(['update', 'remove']);
      
      const result = getHoverMessages(document, ranges);
      
      assert.strictEqual(result.length, 3);
      
      result.forEach((decoration, index) => {
        assert.strictEqual(decoration.range, ranges[index].range);
        const markdown = decoration.hoverMessage as vscode.MarkdownString;
        assert.ok(markdown.value.includes(ranges[index].key));
      });
    });

    it('should handle different actions for different ranges', () => {
      const ranges = [
        {
          key: 'existing.key',
          range: new vscode.Range(0, 0, 0, 10),
          fnRange: new vscode.Range(0, 0, 0, 1)
        },
        {
          key: 'missing.key',
          range: new vscode.Range(1, 0, 1, 10),
          fnRange: new vscode.Range(1, 0, 1, 1)
        }
      ];
      
      getLineActionsStub
        .mockReturnValueOnce(['update', 'remove'])
        .mockReturnValueOnce(['add', 'remove']);
      
      const result = getHoverMessages(document, ranges);
      
      assert.strictEqual(result.length, 2);
      
      const firstMarkdown = result[0].hoverMessage as vscode.MarkdownString;
      const secondMarkdown = result[1].hoverMessage as vscode.MarkdownString;
      
      assert.ok(firstMarkdown.value.includes('Update Translation'));
      assert.ok(secondMarkdown.value.includes('Add Translation'));
    });

    it('should call getLineActions for each range', () => {
      const ranges = [
        {
          key: 'key1',
          range: new vscode.Range(0, 0, 0, 10),
          fnRange: new vscode.Range(0, 0, 0, 1)
        },
        {
          key: 'key2',
          range: new vscode.Range(1, 0, 1, 10),
          fnRange: new vscode.Range(1, 0, 1, 1)
        }
      ];
      getLineActionsStub.mockReturnValue(['update', 'remove']);
      
      getHoverMessages(document, ranges);
      
      assert.strictEqual(getLineActionsStub.mock.calls.length, 2);
      expect(getLineActionsStub).toHaveBeenNthCalledWith(1, document, ranges[0].range, ranges[0].fnRange);
      expect(getLineActionsStub).toHaveBeenNthCalledWith(2, document, ranges[1].range, ranges[1].fnRange);
    });
  });

  describe('with empty ranges', () => {
    it('should return empty array for empty ranges', () => {
      const result = getHoverMessages(document, []);
      
      assert.deepStrictEqual(result, []);
    });

    it('should not call getLineActions for empty ranges', () => {
      getHoverMessages(document, []);
      
      expect(getLineActionsStub).not.toHaveBeenCalled();
    });
  });

  describe('markdown formatting', () => {
    it('should include all required markdown elements', () => {
      const ranges = [
        {
          key: 'format.test',
          range: new vscode.Range(0, 0, 0, 10),
          fnRange: new vscode.Range(0, 0, 0, 1)
        }
      ];
      getLineActionsStub.mockReturnValue(['update', 'remove']);
      
      const result = getHoverMessages(document, ranges);
      
      assert.ok(result.length > 0, 'Result should not be empty');
      assert.ok(result[0].hoverMessage, 'HoverMessage should exist');
      const markdown = result[0].hoverMessage as any;
      assert.ok(markdown.value, 'Markdown should have value property');
      
      // Check for required elements
      assert.ok(markdown.value.includes('### 🍋 Lemon Tree'));
      assert.ok(markdown.value.includes('**Key:**'));
      assert.ok(markdown.value.includes('`format.test`'));
      assert.ok(markdown.value.includes('[Update Translation]'));
      assert.ok(markdown.value.includes('[Remove Translation]'));
      
      // Check markdown structure
      assert.ok(markdown.value.includes('\n\n')); // Line breaks
    });

    it('should set isTrusted to true', () => {
      const ranges = [
        {
          key: 'trust.test',
          range: new vscode.Range(0, 0, 0, 10),
          fnRange: new vscode.Range(0, 0, 0, 1)
        }
      ];
      getLineActionsStub.mockReturnValue(['update', 'remove']);
      
      const result = getHoverMessages(document, ranges);
      
      const markdown = result[0].hoverMessage as vscode.MarkdownString;
      assert.strictEqual(markdown.isTrusted, true);
    });

    it('should escape key in backticks', () => {
      const keyWithBackticks = 'key`with`backticks';
      const ranges = [
        {
          key: keyWithBackticks,
          range: new vscode.Range(0, 0, 0, 10),
          fnRange: new vscode.Range(0, 0, 0, 1)
        }
      ];
      getLineActionsStub.mockReturnValue(['update', 'remove']);
      
      const result = getHoverMessages(document, ranges);
      
      const markdown = result[0].hoverMessage as vscode.MarkdownString;
      assert.ok(markdown.value.includes(`\`${keyWithBackticks}\``));
    });
  });

  describe('edge cases', () => {
    it('should handle null document', () => {
      const ranges = [
        {
          key: 'null.test',
          range: new vscode.Range(0, 0, 0, 10),
          fnRange: new vscode.Range(0, 0, 0, 1)
        }
      ];
      getLineActionsStub.mockReturnValue(['update', 'remove']);
      
      assert.doesNotThrow(() => {
        getHoverMessages(null as any, ranges);
      });
    });

    it('should handle very long keys', () => {
      const longKey = 'a'.repeat(1000);
      const ranges = [
        {
          key: longKey,
          range: new vscode.Range(0, 0, 0, 10),
          fnRange: new vscode.Range(0, 0, 0, 1)
        }
      ];
      getLineActionsStub.mockReturnValue(['update', 'remove']);
      
      const result = getHoverMessages(document, ranges);
      
      assert.strictEqual(result.length, 1);
      const markdown = result[0].hoverMessage as vscode.MarkdownString;
      assert.ok(markdown.value.includes(longKey));
    });

    it('should handle ranges with same position', () => {
      const ranges = [
        {
          key: 'same1',
          range: new vscode.Range(0, 0, 0, 0),
          fnRange: new vscode.Range(0, 0, 0, 0)
        },
        {
          key: 'same2',
          range: new vscode.Range(0, 0, 0, 0),
          fnRange: new vscode.Range(0, 0, 0, 0)
        }
      ];
      getLineActionsStub.mockReturnValue(['update', 'remove']);
      
      const result = getHoverMessages(document, ranges);
      
      assert.strictEqual(result.length, 2);
    });
  });
});
