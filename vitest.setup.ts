import { vi } from 'vitest';

vi.mock('vscode', () => ({
  workspace: {
    getConfiguration: vi.fn(),
    workspaceFolders: [],
    onDidSaveTextDocument: vi.fn(),
    onDidChangeConfiguration: vi.fn(),
    createFileSystemWatcher: vi.fn(() => ({
      onDidCreate: vi.fn(),
      onDidChange: vi.fn(),
      onDidDelete: vi.fn(),
      dispose: vi.fn()
    }))
  },
  window: {
    createOutputChannel: vi.fn(() => ({
      append: vi.fn(),
      appendLine: vi.fn(),
      clear: vi.fn(),
      dispose: vi.fn(),
      hide: vi.fn(),
      show: vi.fn(),
      name: 'Lemon Tree'
    })),
    showErrorMessage: vi.fn(),
    showWarningMessage: vi.fn(),
    showInformationMessage: vi.fn(),
    createTextEditorDecorationType: vi.fn(() => ({
      dispose: vi.fn()
    })),
    activeTextEditor: null
  },
  languages: {
    createDiagnosticCollection: vi.fn(),
    getDiagnostics: vi.fn(() => []),
    registerCodeLensProvider: vi.fn(),
    registerHoverProvider: vi.fn(),
    registerCodeActionsProvider: vi.fn()
  },
  Uri: {
    file: vi.fn((path) => ({ 
      fsPath: path, 
      path,
      constructor: { name: 'Uri' }
    })),
    parse: vi.fn()
  },
  Range: vi.fn((startLine, startChar, endLine, endChar) => ({
    start: { line: startLine, character: startChar },
    end: { line: endLine, character: endChar }
  })),
  Position: vi.fn((line, character) => ({ line, character })),
  DiagnosticSeverity: {
    Error: 0,
    Warning: 1,
    Information: 2,
    Hint: 3
  },
  CodeLens: vi.fn((range, command) => ({ range, command })),
  EventEmitter: vi.fn().mockImplementation(() => {
    const listeners: Array<(...args: any[]) => void> = [];
    return {
      event: vi.fn((listener: (...args: any[]) => void) => {
        listeners.push(listener);
        return {
          dispose: vi.fn(() => {
            const index = listeners.indexOf(listener);
            if (index > -1) listeners.splice(index, 1);
          })
        };
      }),
      fire: vi.fn((...args: any[]) => {
        listeners.forEach(listener => listener(...args));
      }),
      dispose: vi.fn(() => {
        listeners.length = 0;
      })
    };
  }),
  ThemeColor: vi.fn((color) => ({ id: color })),
  MarkdownString: vi.fn().mockImplementation((value = '') => ({
    value,
    isTrusted: false,
    supportHtml: false,
    supportThemeIcons: false,
    baseUri: undefined,
    constructor: { name: 'MarkdownString' }
  })),
  Hover: vi.fn((contents, range) => ({ contents, range })),
  commands: {
    registerCommand: vi.fn(),
    executeCommand: vi.fn()
  },
  ConfigurationTarget: {
    Global: 1,
    Workspace: 2,
    WorkspaceFolder: 3
  }
}));
