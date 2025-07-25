import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { activateTranslationDecorations } from './activate-translation-decorators';
import { GetConfig } from '../../_helpers';
import { handleActiveLineUI } from '../../_util/handle-active-line-ui/handle-active-line-ui';

describe('activateTranslationDecorations', () => {
  let sandbox: sinon.SinonSandbox;
  let context: vscode.ExtensionContext;
  let activeTextEditor: vscode.TextEditor;
  let document: vscode.TextDocument;
  let registerCodeLensProviderStub: sinon.SinonStub;
  let onDidChangeActiveTextEditorStub: sinon.SinonStub;
  let onDidChangeTextDocumentStub: sinon.SinonStub;
  let onDidChangeTextEditorSelectionStub: sinon.SinonStub;
  let onDidChangeDiagnosticsStub: sinon.SinonStub;
  let subscribeToConfigStub: sinon.SinonStub;
  let handleActiveLineUIStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    
    context = {
      subscriptions: []
    } as any;
    
    document = {
      uri: vscode.Uri.file('/test/file.ts'),
      languageId: 'typescript'
    } as vscode.TextDocument;
    
    activeTextEditor = {
      document,
      selection: {
        active: { line: 0, character: 0 }
      }
    } as any;
    
    // Stub VS Code window and workspace APIs
    sandbox.stub(vscode.window, 'activeTextEditor').value(activeTextEditor);
    registerCodeLensProviderStub = sandbox.stub(vscode.languages, 'registerCodeLensProvider');
    
    // Create mock event emitters
    const createEventMock = () => {
      const stub = sandbox.stub();
      stub.returns({ dispose: sandbox.stub() });
      return stub;
    };
    
    onDidChangeActiveTextEditorStub = createEventMock();
    onDidChangeTextDocumentStub = createEventMock();
    onDidChangeTextEditorSelectionStub = createEventMock();
    onDidChangeDiagnosticsStub = createEventMock();
    
    sandbox.stub(vscode.window, 'onDidChangeActiveTextEditor').value(onDidChangeActiveTextEditorStub);
    sandbox.stub(vscode.workspace, 'onDidChangeTextDocument').value(onDidChangeTextDocumentStub);
    sandbox.stub(vscode.window, 'onDidChangeTextEditorSelection').value(onDidChangeTextEditorSelectionStub);
    sandbox.stub(vscode.languages, 'onDidChangeDiagnostics').value(onDidChangeDiagnosticsStub);
    
    // Stub GetConfig
    subscribeToConfigStub = sandbox.stub(GetConfig, 'subscribeToConfig');
    subscribeToConfigStub.returns(() => true);
    
    // Stub handleActiveLineUI
    handleActiveLineUIStub = sandbox.stub();
    sandbox.stub(require('../../_util/handle-active-line-ui/handle-active-line-ui'), 'handleActiveLineUI')
      .callsFake(handleActiveLineUIStub);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('initialization', () => {
    it('should register code lens provider when editor exists', () => {
      activateTranslationDecorations(context);
      
      assert.ok(registerCodeLensProviderStub.calledOnce);
      assert.ok(registerCodeLensProviderStub.calledWith('typescript'));
    });

    it('should not register code lens provider when no active editor', () => {
      sandbox.stub(vscode.window, 'activeTextEditor').value(undefined);
      
      activateTranslationDecorations(context);
      
      assert.ok(registerCodeLensProviderStub.notCalled);
    });

    it('should register all event listeners', () => {
      activateTranslationDecorations(context);
      
      assert.ok(onDidChangeActiveTextEditorStub.calledOnce);
      assert.ok(onDidChangeTextDocumentStub.calledOnce);
      assert.ok(onDidChangeTextEditorSelectionStub.calledOnce);
      assert.ok(onDidChangeDiagnosticsStub.calledOnce);
    });

    it('should subscribe to config changes', () => {
      activateTranslationDecorations(context);
      
      assert.ok(subscribeToConfigStub.calledOnce);
    });

    it('should add all subscriptions to context', () => {
      activateTranslationDecorations(context);
      
      assert.strictEqual(context.subscriptions.length, 4);
    });
  });

  describe('event handlers', () => {
    it('should call handleActiveLineUI on active text editor change', () => {
      activateTranslationDecorations(context);
      
      const handler = onDidChangeActiveTextEditorStub.getCall(0).args[0];
      const newEditor = { document: { languageId: 'javascript' } } as any;
      
      handler(newEditor);
      
      assert.ok(handleActiveLineUIStub.calledWith(newEditor));
    });

    it('should call handleActiveLineUI on text document change for same document', () => {
      activateTranslationDecorations(context);
      
      const handler = onDidChangeTextDocumentStub.getCall(0).args[0];
      const changeEvent = {
        document: document
      };
      
      handler(changeEvent);
      
      assert.ok(handleActiveLineUIStub.calledWith(activeTextEditor));
    });

    it('should not call handleActiveLineUI on text document change for different document', () => {
      activateTranslationDecorations(context);
      
      const handler = onDidChangeTextDocumentStub.getCall(0).args[0];
      const differentDocument = {
        uri: vscode.Uri.file('/different/file.ts')
      } as vscode.TextDocument;
      const changeEvent = {
        document: differentDocument
      };
      
      handler(changeEvent);
      
      assert.ok(handleActiveLineUIStub.notCalled);
    });

    it('should call handleActiveLineUI on text editor selection change', () => {
      activateTranslationDecorations(context);
      
      const handler = onDidChangeTextEditorSelectionStub.getCall(0).args[0];
      
      handler();
      
      assert.ok(handleActiveLineUIStub.calledWith(activeTextEditor));
    });

    it('should call handleActiveLineUI on diagnostics change for same document', () => {
      activateTranslationDecorations(context);
      
      const handler = onDidChangeDiagnosticsStub.getCall(0).args[0];
      const diagnosticsEvent = {
        uris: [document.uri, vscode.Uri.file('/other/file.ts')]
      };
      
      handler(diagnosticsEvent);
      
      assert.ok(handleActiveLineUIStub.calledWith(activeTextEditor));
    });

    it('should not call handleActiveLineUI on diagnostics change for different document', () => {
      activateTranslationDecorations(context);
      
      const handler = onDidChangeDiagnosticsStub.getCall(0).args[0];
      const diagnosticsEvent = {
        uris: [vscode.Uri.file('/different/file.ts')]
      };
      
      handler(diagnosticsEvent);
      
      assert.ok(handleActiveLineUIStub.notCalled);
    });

    it('should call handleActiveLineUI on config change', () => {
      activateTranslationDecorations(context);
      
      const configHandler = subscribeToConfigStub.getCall(0).args[0];
      
      configHandler({});
      
      assert.ok(handleActiveLineUIStub.calledWith(activeTextEditor));
    });
  });

  describe('edge cases', () => {
    it('should handle no active text editor', () => {
      sandbox.stub(vscode.window, 'activeTextEditor').value(undefined);
      
      assert.doesNotThrow(() => {
        activateTranslationDecorations(context);
      });
    });

    it('should handle text document change when no active editor', () => {
      sandbox.stub(vscode.window, 'activeTextEditor').value(undefined);
      activateTranslationDecorations(context);
      
      const handler = onDidChangeTextDocumentStub.getCall(0).args[0];
      const changeEvent = {
        document: document
      };
      
      assert.doesNotThrow(() => {
        handler(changeEvent);
      });
    });

    it('should handle editor selection change when no active editor', () => {
      sandbox.stub(vscode.window, 'activeTextEditor').value(undefined);
      activateTranslationDecorations(context);
      
      const handler = onDidChangeTextEditorSelectionStub.getCall(0).args[0];
      
      assert.doesNotThrow(() => {
        handler();
      });
    });

    it('should handle diagnostics change when no active editor', () => {
      sandbox.stub(vscode.window, 'activeTextEditor').value(undefined);
      activateTranslationDecorations(context);
      
      const handler = onDidChangeDiagnosticsStub.getCall(0).args[0];
      const diagnosticsEvent = {
        uris: [vscode.Uri.file('/test/file.ts')]
      };
      
      assert.doesNotThrow(() => {
        handler(diagnosticsEvent);
      });
    });

    it('should handle config change when no active editor', () => {
      sandbox.stub(vscode.window, 'activeTextEditor').value(undefined);
      activateTranslationDecorations(context);
      
      const configHandler = subscribeToConfigStub.getCall(0).args[0];
      
      assert.doesNotThrow(() => {
        configHandler({});
      });
    });

    it('should handle diagnostics event with empty uris array', () => {
      activateTranslationDecorations(context);
      
      const handler = onDidChangeDiagnosticsStub.getCall(0).args[0];
      const diagnosticsEvent = {
        uris: []
      };
      
      handler(diagnosticsEvent);
      
      assert.ok(handleActiveLineUIStub.notCalled);
    });

    it('should handle editor with different language', () => {
      const jsEditor = {
        document: {
          ...document,
          languageId: 'javascript'
        }
      } as any;
      
      sandbox.stub(vscode.window, 'activeTextEditor').value(jsEditor);
      
      activateTranslationDecorations(context);
      
      assert.ok(registerCodeLensProviderStub.calledWith('javascript'));
    });

    it('should handle undefined document in active editor', () => {
      const editorWithoutDoc = {
        document: undefined
      } as any;
      
      sandbox.stub(vscode.window, 'activeTextEditor').value(editorWithoutDoc);
      
      assert.doesNotThrow(() => {
        activateTranslationDecorations(context);
      });
    });
  });

  describe('subscription management', () => {
    it('should create disposable subscriptions', () => {
      activateTranslationDecorations(context);
      
      // Verify all subscriptions are disposable
      context.subscriptions.forEach(subscription => {
        assert.ok(subscription);
        assert.strictEqual(typeof subscription.dispose, 'function');
      });
    });

    it('should handle subscription disposal', () => {
      activateTranslationDecorations(context);
      
      // Dispose all subscriptions
      assert.doesNotThrow(() => {
        context.subscriptions.forEach(subscription => {
          subscription.dispose();
        });
      });
    });
  });
});
