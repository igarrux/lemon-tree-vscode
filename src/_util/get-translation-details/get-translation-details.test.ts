import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { buildGetTranslationDetails } from './get-translation-details';
import { GetConfig } from '../../_helpers/get-config/get-config';

describe('buildGetTranslationDetails', () => {
  let sandbox: sinon.SinonSandbox;
  let getConfigStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    getConfigStub = sandbox.stub(GetConfig, 'config');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('with no translation examples', () => {
    it('should return null function when no translationFunctionExamples', async () => {
      getConfigStub.resolves({});
      
      const getTranslationDetails = await buildGetTranslationDetails();
      
      assert.strictEqual(getTranslationDetails('test'), null);
    });

    it('should return null function when translationFunctionExamples is undefined', async () => {
      getConfigStub.resolves({ translationFunctionExamples: undefined });
      
      const getTranslationDetails = await buildGetTranslationDetails();
      
      assert.strictEqual(getTranslationDetails('test'), null);
    });
  });

  describe('with string translation example', () => {
    it('should parse single string pattern', async () => {
      getConfigStub.resolves({
        translationFunctionExamples: 't($text)'
      });
      
      const getTranslationDetails = await buildGetTranslationDetails();
      const result = getTranslationDetails('t("hello.world")');
      
      assert.ok(result);
      assert.strictEqual(result.key, 'hello.world');
      assert.strictEqual(result.quote, '"');
      assert.strictEqual(typeof result.start, 'number');
      assert.strictEqual(typeof result.end, 'number');
      assert.strictEqual(typeof result.fnStart, 'number');
      assert.strictEqual(typeof result.fnEnd, 'number');
    });

    it('should handle single quotes', async () => {
      getConfigStub.resolves({
        translationFunctionExamples: 't($text)'
      });
      
      const getTranslationDetails = await buildGetTranslationDetails();
      const result = getTranslationDetails("t('hello.world')");
      
      assert.ok(result);
      assert.strictEqual(result.key, 'hello.world');
      assert.strictEqual(result.quote, "'");
    });

    it('should handle backticks', async () => {
      getConfigStub.resolves({
        translationFunctionExamples: 't($text)'
      });
      
      const getTranslationDetails = await buildGetTranslationDetails();
      const result = getTranslationDetails('t(`hello.world`)');
      
      assert.ok(result);
      assert.strictEqual(result.key, 'hello.world');
      assert.strictEqual(result.quote, '`');
    });
  });

  describe('with array translation examples', () => {
    it('should parse multiple patterns', async () => {
      getConfigStub.resolves({
        translationFunctionExamples: ['t($text)', 'i18n.t($text)']
      });
      
      const getTranslationDetails = await buildGetTranslationDetails();
      
      const result1 = getTranslationDetails('t("hello")');
      assert.ok(result1);
      assert.strictEqual(result1.key, 'hello');
      
      const result2 = getTranslationDetails('i18n.t("world")');
      assert.ok(result2);
      assert.strictEqual(result2.key, 'world');
    });

    it('should prioritize longer function names', async () => {
      getConfigStub.resolves({
        translationFunctionExamples: ['t($text)', 'i18n.t($text)']
      });
      
      const getTranslationDetails = await buildGetTranslationDetails();
      const result = getTranslationDetails('i18n.t("test")');
      
      assert.ok(result);
      assert.strictEqual(result.key, 'test');
    });
  });

  describe('edge cases', () => {
    it('should return null for empty text line', async () => {
      getConfigStub.resolves({
        translationFunctionExamples: 't($text)'
      });
      
      const getTranslationDetails = await buildGetTranslationDetails();
      const result = getTranslationDetails('');
      
      assert.strictEqual(result, null);
    });

    it('should return null for null text line', async () => {
      getConfigStub.resolves({
        translationFunctionExamples: 't($text)'
      });
      
      const getTranslationDetails = await buildGetTranslationDetails();
      const result = getTranslationDetails(null as any);
      
      assert.strictEqual(result, null);
    });

    it('should return null when no match found', async () => {
      getConfigStub.resolves({
        translationFunctionExamples: 't($text)'
      });
      
      const getTranslationDetails = await buildGetTranslationDetails();
      const result = getTranslationDetails('console.log("hello")');
      
      assert.strictEqual(result, null);
    });

    it('should handle escaped quotes', async () => {
      getConfigStub.resolves({
        translationFunctionExamples: 't($text)'
      });
      
      const getTranslationDetails = await buildGetTranslationDetails();
      const result = getTranslationDetails('t("hello\\"world")');
      
      assert.ok(result);
      assert.strictEqual(result.key, 'hello\\"world');
    });

    it('should handle special regex characters in function names', async () => {
      getConfigStub.resolves({
        translationFunctionExamples: ['$t($text)', '$.t($text)']
      });
      
      const getTranslationDetails = await buildGetTranslationDetails();
      const result = getTranslationDetails('$t("test")');
      
      assert.ok(result);
      assert.strictEqual(result.key, 'test');
    });

    it('should handle function names with dots and numbers', async () => {
      getConfigStub.resolves({
        translationFunctionExamples: ['i18n.t($text)', 'app.translate($text)']
      });
      
      const getTranslationDetails = await buildGetTranslationDetails();
      
      const result1 = getTranslationDetails('i18n.t("key1")');
      assert.ok(result1);
      assert.strictEqual(result1.key, 'key1');
      
      const result2 = getTranslationDetails('app.translate("key2")');
      assert.ok(result2);
      assert.strictEqual(result2.key, 'key2');
    });

    it('should handle assignment patterns', async () => {
      getConfigStub.resolves({
        translationFunctionExamples: ['title = $text']
      });
      
      const getTranslationDetails = await buildGetTranslationDetails();
      const result = getTranslationDetails('title = "Hello World"');
      
      assert.ok(result);
      assert.strictEqual(result.key, 'Hello World');
    });

    it('should provide correct position information', async () => {
      getConfigStub.resolves({
        translationFunctionExamples: 't($text)'
      });
      
      const getTranslationDetails = await buildGetTranslationDetails();
      const textLine = 'const msg = t("hello.world");';
      const result = getTranslationDetails(textLine);
      
      assert.ok(result);
      assert.strictEqual(result.key, 'hello.world');
      assert.strictEqual(textLine.substring(result.fnStart, result.fnEnd), 't');
      assert.strictEqual(textLine.substring(result.start, result.end), 'hello.world');
    });
  });

  describe('regex execution state', () => {
    it('should handle multiple calls with same function', async () => {
      getConfigStub.resolves({
        translationFunctionExamples: 't($text)'
      });
      
      const getTranslationDetails = await buildGetTranslationDetails();
      
      // First call
      const result1 = getTranslationDetails('t("first")');
      assert.ok(result1);
      assert.strictEqual(result1.key, 'first');
      
      // Second call
      const result2 = getTranslationDetails('t("second")');
      assert.ok(result2);
      assert.strictEqual(result2.key, 'second');
    });
  });
});
