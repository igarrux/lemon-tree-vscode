import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handleActiveLineUI, lemon } from './handle-active-line-ui';
import { buildGetTranslationDetails } from '..';
import { getHoverMessages } from '../../_helpers/get-hover-message/get-hover-message';
import { gutterIconManager } from '../../extension';

// Use global vscode mock from vitest.setup.ts
declare const vscode: any;

// Mock dependencies
vi.mock('..');
vi.mock('../../_helpers/get-hover-message/get-hover-message');
vi.mock('../../extension', () => ({
  gutterIconManager: {
    dispose: vi.fn(),
    lineConfig: vi.fn(),
  }
}));

describe('handleActiveLineUI', () => {
  let mockEditor: any;
  let mockDocument: any;
  let mockLine: any;
  let mockSelection: any;
  let mockGetTranslationDetails: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Setup mock line
    mockLine = {
      text: 't("test.key")'
    };

    // Setup mock document
    mockDocument = {
      lineAt: vi.fn().mockReturnValue(mockLine)
    };

    // Setup mock selection
    mockSelection = {
      active: { line: 5 }
    };

    // Setup mock editor
    mockEditor = {
      document: mockDocument,
      selection: mockSelection,
      setDecorations: vi.fn()
    };

    // Setup mock translation details function
    mockGetTranslationDetails = vi.fn();
    vi.mocked(buildGetTranslationDetails).mockResolvedValue(mockGetTranslationDetails);

    // Setup mock hover messages
    vi.mocked(getHoverMessages).mockReturnValue([]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return early when editor is undefined', async () => {
    await handleActiveLineUI(undefined);
    
    expect(buildGetTranslationDetails).not.toHaveBeenCalled();
  });

  it('should handle editor with no translation matches', async () => {
    mockGetTranslationDetails.mockReturnValue(null);

    await handleActiveLineUI(mockEditor);

    expect(buildGetTranslationDetails).toHaveBeenCalled();
    expect(mockDocument.lineAt).toHaveBeenCalledWith(5);
    expect(gutterIconManager.dispose).toHaveBeenCalled();
    expect(gutterIconManager.lineConfig).not.toHaveBeenCalled();
    expect(mockEditor.setDecorations).toHaveBeenCalled();
  });

  it('should process single translation match', async () => {
    const mockMatch = {
      quote: '"',
      key: 'test.key',
      start: 2,
      end: 12,
      fnStart: 0,
      fnEnd: 14
    };
    
    mockGetTranslationDetails
      .mockReturnValueOnce(mockMatch)
      .mockReturnValueOnce(null);

    await handleActiveLineUI(mockEditor);

    expect(buildGetTranslationDetails).toHaveBeenCalled();
    expect(mockDocument.lineAt).toHaveBeenCalledWith(5);
    expect(gutterIconManager.dispose).toHaveBeenCalled();
    expect(gutterIconManager.lineConfig).toHaveBeenCalledWith(5, mockEditor);
    expect(getHoverMessages).toHaveBeenCalled();
    expect(mockEditor.setDecorations).toHaveBeenCalled();
  });

  it('should process multiple translation matches', async () => {
    const mockMatch1 = {
      quote: '"',
      key: 'test.key1',
      start: 2,
      end: 12,
      fnStart: 0,
      fnEnd: 14
    };
    
    const mockMatch2 = {
      quote: '"',
      key: 'test.key2',
      start: 16,
      end: 26,
      fnStart: 14,
      fnEnd: 28
    };
    
    mockGetTranslationDetails
      .mockReturnValueOnce(mockMatch1)
      .mockReturnValueOnce(mockMatch2)
      .mockReturnValueOnce(null);

    await handleActiveLineUI(mockEditor);

    expect(gutterIconManager.lineConfig).toHaveBeenCalledWith(5, mockEditor);
    expect(getHoverMessages).toHaveBeenCalledWith(
      mockDocument,
      expect.arrayContaining([
        expect.objectContaining({ key: 'test.key1' }),
        expect.objectContaining({ key: 'test.key2' })
      ])
    );
  });

  it('should skip matches with empty keys', async () => {
    const mockMatch = {
      quote: '"',
      key: '',
      start: 2,
      end: 12,
      fnStart: 0,
      fnEnd: 14
    };
    
    mockGetTranslationDetails
      .mockReturnValueOnce(mockMatch)
      .mockReturnValueOnce(null);

    await handleActiveLineUI(mockEditor);

    expect(gutterIconManager.lineConfig).not.toHaveBeenCalled();
    expect(getHoverMessages).toHaveBeenCalledWith(mockDocument, []);
  });

  it('should skip matches with null keys', async () => {
    const mockMatch = {
      quote: '"',
      key: null,
      start: 2,
      end: 12,
      fnStart: 0,
      fnEnd: 14
    };
    
    mockGetTranslationDetails
      .mockReturnValueOnce(mockMatch)
      .mockReturnValueOnce(null);

    await handleActiveLineUI(mockEditor);

    expect(gutterIconManager.lineConfig).not.toHaveBeenCalled();
  });

  it('should skip template literal matches with interpolation', async () => {
    const mockMatch = {
      quote: '`',
      key: 'test.${variable}',
      start: 2,
      end: 12,
      fnStart: 0,
      fnEnd: 14
    };
    
    mockGetTranslationDetails
      .mockReturnValueOnce(mockMatch)
      .mockReturnValueOnce(null);

    await handleActiveLineUI(mockEditor);

    expect(gutterIconManager.lineConfig).not.toHaveBeenCalled();
  });

  it('should allow template literal matches without interpolation', async () => {
    const mockMatch = {
      quote: '`',
      key: 'test.key',
      start: 2,
      end: 12,
      fnStart: 0,
      fnEnd: 14
    };
    
    mockGetTranslationDetails
      .mockReturnValueOnce(mockMatch)
      .mockReturnValueOnce(null);

    await handleActiveLineUI(mockEditor);

    expect(gutterIconManager.lineConfig).toHaveBeenCalledWith(5, mockEditor);
  });

  it('should create correct range objects', async () => {
    const mockMatch = {
      quote: '"',
      key: 'test.key',
      start: 2,
      end: 12,
      fnStart: 0,
      fnEnd: 14
    };
    
    mockGetTranslationDetails
      .mockReturnValueOnce(mockMatch)
      .mockReturnValueOnce(null);

    await handleActiveLineUI(mockEditor);

    expect(getHoverMessages).toHaveBeenCalledWith(
      mockDocument,
      [expect.objectContaining({
        key: 'test.key',
        range: expect.any(Object),
        fnRange: expect.any(Object)
      })]
    );
  });

  it('should set matches on lemon code lens provider', async () => {
    const mockMatch = {
      quote: '"',
      key: 'test.key',
      start: 2,
      end: 12,
      fnStart: 0,
      fnEnd: 14
    };
    
    mockGetTranslationDetails
      .mockReturnValueOnce(mockMatch)
      .mockReturnValueOnce(null);

    // Spy on lemon.setMatches
    const setMatchesSpy = vi.spyOn(lemon, 'setMatches');

    await handleActiveLineUI(mockEditor);

    expect(setMatchesSpy).toHaveBeenCalledWith(5, [
      expect.objectContaining({ key: 'test.key' })
    ]);
  });

  it('should always call dispose on gutterIconManager', async () => {
    mockGetTranslationDetails.mockReturnValue(null);

    await handleActiveLineUI(mockEditor);

    expect(gutterIconManager.dispose).toHaveBeenCalled();
  });
});
