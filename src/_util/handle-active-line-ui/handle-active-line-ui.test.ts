import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { handleActiveLineUI, lemon } from './handle-active-line-ui';

describe('handleActiveLineUI', () => {
  let sandbox: sinon.SinonSandbox;
  let editor: vscode.TextEditor;
  let document: vscode.TextDocument;
  let line: vscode.TextLine;
  let selection: vscode.Selection;
  let buildGetTranslationDetailsStub: sinon.SinonStub;
  let getHoverMessagesStub: sinon.SinonStub;
  let gutterIconManagerMock: any;
  let lineAtStub: sinon.SinonStub;
  let setDecorationsStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    
    // Mock buildGetTranslationDetails
    buildGetTranslationDetailsStub = sandbox.stub();
    sandbox.stub(require('..'), 'buildGetTranslationDetails').returns(buildGetTranslationDetailsStub);
    
    // Mock getHoverMessages
    getHoverMessagesStub = sandbox.stub().returns([]);
    sandbox.stub(require('../../_helpers/get-hover-message/get-hover-message'), 'getHoverMessages')
      .returns(getHoverMessagesStub);
    
    // Mock gutterIconManager
    gutterIconManagerMock = {
      dispose: sandbox.stub(),
      lineConfig: sandbox.stub()
    };
    
    // Stub the global gutterIconManager
    Object.defineProperty(require('../../extension'), 'gutterIconManager', {
      value: gutterIconManagerMock,
      writable: true
    });
    
    line = {
      text: 't("hello.world")',
      lineNumber: 0,
      range: new vscode.Range(0, 0, 0, 15),
      rangeIncludingLineBreak: new vscode.Range(0, 0, 0, 16),
      firstNonWhitespaceCharacterIndex: 0,
      isEmptyOrWhitespace: false
    };
    
    lineAtStub = sandbox.stub().returns(line);
    setDecorationsStub = sandbox.stub();
    
    document = {
      lineAt: lineAtStub,
      uri: vscode.Uri.file('/test/file.ts')
    } as any;
    
    selection = {
      active: { line: 0, character: 5 },
      anchor: { line: 0, character: 5 },
      start: { line: 0, character: 5 },
      end: { line: 0, character: 5 },
      isEmpty: true,
      isSingleLine: true,
      isReversed: false
    } as vscode.Selection;
    
    editor = {
      document,
      selection,
      setDecorations: setDecorationsStub
    } as any;
    
    // Mock lemon.setMatches
    sandbox.stub(lemon, 'setMatches');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('when editor is undefined', () => {
    it('should return early', async () => {
      await handleActiveLineUI(undefined);
      
      assert.ok(buildGetTranslationDetailsStub.notCalled);
    });
  });

  describe('when editor is provided', () => {
    it('should get translation details for active line', async () => {
      const getTranslationDetails = sandbox.stub().returns(null);
      buildGetTranslationDetailsStub.resolves(getTranslationDetails);
      
      await handleActiveLineUI(editor);
      
      assert.ok(buildGetTranslationDetailsStub.calledOnce);
      assert.ok(getTranslationDetails.calledWith('t("hello.world")'));
      assert.ok(lineAtStub.calledWith(0));
    });

    it('should dispose gutterIconManager', async () => {
      const getTranslationDetails = sandbox.stub().returns(null);
      buildGetTranslationDetailsStub.resolves(getTranslationDetails);
      
      await handleActiveLineUI(editor);
      
      assert.ok(gutterIconManagerMock.dispose.calledOnce);
    });

    it('should process single translation match', async () => {
      const match = {
        quote: '"',
        key: 'hello.world',
        start: 2,
        end: 13,
        fnStart: 0,
        fnEnd: 1
      };
      const getTranslationDetails = sandbox.stub()
        .onFirstCall().returns(match)
        .onSecondCall().returns(null);
      
      buildGetTranslationDetailsStub.resolves(getTranslationDetails);
      
      await handleActiveLineUI(editor);
      
      assert.ok(gutterIconManagerMock.lineConfig.calledWith(0, editor));
      assert.ok((lemon.setMatches as sinon.SinonStub).calledOnce);
      assert.ok(getHoverMessagesStub.calledOnce);
      assert.ok(setDecorationsStub.calledOnce);
    });

    it('should process multiple translation matches', async () => {
      const match1 = {
        quote: '"',
        key: 'hello.world',
        start: 2,
        end: 13,
        fnStart: 0,
        fnEnd: 1
      };
      const match2 = {
        quote: "'",
        key: 'goodbye.world',
        start: 20,
        end: 33,
        fnStart: 17,
        fnEnd: 18
      };
      
      const getTranslationDetails = sandbox.stub()
        .onFirstCall().returns(match1)
        .onSecondCall().returns(match2)
        .onThirdCall().returns(null);
      
      buildGetTranslationDetailsStub.resolves(getTranslationDetails);
      
      await handleActiveLineUI(editor);
      
      const setMatchesCall = (lemon.setMatches as sinon.SinonStub).getCall(0);
      assert.strictEqual(setMatchesCall.args[0], 0); // active line
      assert.strictEqual(setMatchesCall.args[1].length, 2); // number of matches
    });

    it('should skip matches with backticks containing interpolation', async () => {
      const validMatch = {
        quote: '"',
        key: 'hello.world',
        start: 2,
        end: 13,
        fnStart: 0,
        fnEnd: 1
      };
      const invalidMatch = {
        quote: '`',
        key: 'hello.${variable}',
        start: 20,
        end: 36,
        fnStart: 17,
        fnEnd: 18
      };
      
      const getTranslationDetails = sandbox.stub()
        .onFirstCall().returns(validMatch)
        .onSecondCall().returns(invalidMatch)
        .onThirdCall().returns(null);
      
      buildGetTranslationDetailsStub.resolves(getTranslationDetails);
      
      await handleActiveLineUI(editor);
      
      const setMatchesCall = (lemon.setMatches as sinon.SinonStub).getCall(0);
      assert.strictEqual(setMatchesCall.args[1].length, 1); // only valid match
      assert.strictEqual(setMatchesCall.args[1][0].key, 'hello.world');
    });

    it('should skip matches with empty key', async () => {
      const match = {
        quote: '"',
        key: '',
        start: 2,
        end: 2,
        fnStart: 0,
        fnEnd: 1
      };
      
      const getTranslationDetails = sandbox.stub()
        .onFirstCall().returns(match)
        .onSecondCall().returns(null);
      
      buildGetTranslationDetailsStub.resolves(getTranslationDetails);
      
      await handleActiveLineUI(editor);
      
      const setMatchesCall = (lemon.setMatches as sinon.SinonStub).getCall(0);
      assert.strictEqual(setMatchesCall.args[1].length, 0); // no matches
    });

    it('should not configure gutter icon when no matches', async () => {
      const getTranslationDetails = sandbox.stub().returns(null);
      buildGetTranslationDetailsStub.resolves(getTranslationDetails);
      
      await handleActiveLineUI(editor);
      
      assert.ok(gutterIconManagerMock.lineConfig.notCalled);
    });

    it('should create correct range objects', async () => {
      const match = {
        quote: '"',
        key: 'hello.world',
        start: 2,
        end: 13,
        fnStart: 0,
        fnEnd: 1
      };
      
      const getTranslationDetails = sandbox.stub()
        .onFirstCall().returns(match)
        .onSecondCall().returns(null);
      
      buildGetTranslationDetailsStub.resolves(getTranslationDetails);
      
      await handleActiveLineUI(editor);
      
      const setMatchesCall = (lemon.setMatches as sinon.SinonStub).getCall(0);
      const ranges = setMatchesCall.args[1];
      
      assert.strictEqual(ranges.length, 1);
      assert.strictEqual(ranges[0].key, 'hello.world');
      assert.ok(ranges[0].range instanceof vscode.Range);
      assert.ok(ranges[0].fnRange instanceof vscode.Range);
      
      // Check range coordinates
      assert.strictEqual(ranges[0].range.start.line, 0);
      assert.strictEqual(ranges[0].range.start.character, 2);
      assert.strictEqual(ranges[0].range.end.line, 0);
      assert.strictEqual(ranges[0].range.end.character, 13);
      
      assert.strictEqual(ranges[0].fnRange.start.line, 0);
      assert.strictEqual(ranges[0].fnRange.start.character, 0);
      assert.strictEqual(ranges[0].fnRange.end.line, 0);
      assert.strictEqual(ranges[0].fnRange.end.character, 1);
    });

    it('should handle different active line numbers', async () => {
      // Create new selection with different line
      const newSelection = {
        active: { line: 5, character: 5 },
        anchor: { line: 5, character: 5 },
        start: { line: 5, character: 5 },
        end: { line: 5, character: 5 },
        isEmpty: true,
        isSingleLine: true,
        isReversed: false
      } as vscode.Selection;
      
      editor.selection = newSelection;
      
      const match = {
        quote: '"',
        key: 'test.key',
        start: 5,
        end: 13,
        fnStart: 2,
        fnEnd: 3
      };
      
      const getTranslationDetails = sandbox.stub()
        .onFirstCall().returns(match)
        .onSecondCall().returns(null);
      
      buildGetTranslationDetailsStub.resolves(getTranslationDetails);
      
      await handleActiveLineUI(editor);
      
      assert.ok(lineAtStub.calledWith(5));
      assert.ok(gutterIconManagerMock.lineConfig.calledWith(5, editor));
      
      const setMatchesCall = (lemon.setMatches as sinon.SinonStub).getCall(0);
      assert.strictEqual(setMatchesCall.args[0], 5);
    });
  });
});
