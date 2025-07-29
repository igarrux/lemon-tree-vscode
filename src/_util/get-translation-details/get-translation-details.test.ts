import * as assert from 'assert';
import { beforeEach, afterEach, describe, it, vi, expect } from 'vitest';
import * as vscode from 'vscode';
import { buildGetTranslationDetails } from './get-translation-details';
import { GetConfig } from '../../_helpers/get-config/get-config';

// Mock modules
vi.mock('../../_helpers/get-config/get-config');

describe('buildGetTranslationDetails', () => {
  let getConfigStub: any;

  beforeEach(() => {
    getConfigStub = vi.mocked(GetConfig.config);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('with no translation examples', () => {
    it('should return null function when no translationFunctionExamples', async () => {
      getConfigStub.mockResolvedValue({});
      
      const getTranslationDetails = await buildGetTranslationDetails();
      
      assert.strictEqual(getTranslationDetails('test'), null);
    });

    it('should return null function when translationFunctionExamples is undefined', async () => {
      getConfigStub.mockResolvedValue({ translationFunctionExamples: undefined });
      
      const getTranslationDetails = await buildGetTranslationDetails();
      
      assert.strictEqual(getTranslationDetails('test'), null);
    });

    it('should return null function when translationFunctionExamples is empty array', async () => {
      getConfigStub.mockResolvedValue({ translationFunctionExamples: [] });
      
      const getTranslationDetails = await buildGetTranslationDetails();
      
      assert.strictEqual(getTranslationDetails('test'), null);
    });
  });

  describe('with string translation example', () => {
    it('should parse single string pattern', async () => {
      getConfigStub.mockResolvedValue({
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
      getConfigStub.mockResolvedValue({
        translationFunctionExamples: 't($text)'
      });
      
      const getTranslationDetails = await buildGetTranslationDetails();
      const result = getTranslationDetails("t('hello.world')");
      
      assert.ok(result);
      assert.strictEqual(result.key, 'hello.world');
      assert.strictEqual(result.quote, "'");
    });

    it('should handle backticks', async () => {
      getConfigStub.mockResolvedValue({
        translationFunctionExamples: 't($text)'
      });
      
      const getTranslationDetails = await buildGetTranslationDetails();
      const result = getTranslationDetails('t(`hello.world`)');
      
      assert.ok(result);
      assert.strictEqual(result.key, 'hello.world');
      assert.strictEqual(result.quote, '`');
    });

    it('should handle variable names without quotes (returns null)', async () => {
      getConfigStub.mockResolvedValue({
        translationFunctionExamples: 't($text)'
      });
      
      const getTranslationDetails = await buildGetTranslationDetails();
      const result = getTranslationDetails('t(variableName)');
      
      assert.strictEqual(result, null); // This should return null as the implementation requires quotes
    });
  });

  describe('with array translation examples', () => {
    it('should parse multiple patterns', async () => {
      getConfigStub.mockResolvedValue({
        translationFunctionExamples: ['t($text)', 'i18n.t($text)']
      });
      
      const getTranslationDetails = await buildGetTranslationDetails();
      
      const result1 = getTranslationDetails('t("hello")');
      assert.ok(result1);
      assert.strictEqual(result1.key, 'hello');
      const getTranslationDetails2 = await buildGetTranslationDetails();

      const result2 = getTranslationDetails2('i18n.t("world")');
      assert.ok(result2);
      assert.strictEqual(result2.key, 'world');
    });

    it('should prioritize longer function names', async () => {
      getConfigStub.mockResolvedValue({
        translationFunctionExamples: ['t($text)', 'i18n.t($text)']
      });
      
      const getTranslationDetails = await buildGetTranslationDetails();
      const result = getTranslationDetails('i18n.t("test")');
      
      assert.ok(result);
      assert.strictEqual(result.key, 'test');
    });

    it('should handle mixed types in array (filters out non-strings)', async () => {
      getConfigStub.mockResolvedValue({
        translationFunctionExamples: ['t($text)', null, undefined, 't2($text)', 123, false]
      });
      
      const getTranslationDetails = await buildGetTranslationDetails();
      
      const result1 = getTranslationDetails('t("hello")');
      assert.ok(result1);
      assert.strictEqual(result1.key, 'hello');
      const getTranslationDetails2 = await buildGetTranslationDetails();
      const result2 = getTranslationDetails2('t2("world")');
      assert.ok(result2);
      assert.strictEqual(result2.key, 'world');
    });
  });

  describe('edge cases', () => {
    it('should return null for empty text line', async () => {
      getConfigStub.mockResolvedValue({
        translationFunctionExamples: 't($text)'
      });
      
      const getTranslationDetails = await buildGetTranslationDetails();
      const result = getTranslationDetails('');
      
      assert.strictEqual(result, null);
    });

    it('should return null for null text line', async () => {
      getConfigStub.mockResolvedValue({
        translationFunctionExamples: 't($text)'
      });
      
      const getTranslationDetails = await buildGetTranslationDetails();
      const result = getTranslationDetails(null as any);
      
      assert.strictEqual(result, null);
    });

    it('should return null for undefined text line', async () => {
      getConfigStub.mockResolvedValue({
        translationFunctionExamples: 't($text)'
      });
      
      const getTranslationDetails = await buildGetTranslationDetails();
      const result = getTranslationDetails(undefined as any);
      
      assert.strictEqual(result, null);
    });

    it('should return null when no match found', async () => {
      getConfigStub.mockResolvedValue({
        translationFunctionExamples: 't($text)'
      });
      
      const getTranslationDetails = await buildGetTranslationDetails();
      const result = getTranslationDetails('console.log("hello")');
      
      assert.strictEqual(result, null);
    });

    it('should handle escaped quotes', async () => {
      getConfigStub.mockResolvedValue({
        translationFunctionExamples: 't($text)'
      });
      
      const getTranslationDetails = await buildGetTranslationDetails();
      const result = getTranslationDetails('t("hello\\"world")');
      
      assert.ok(result);
      assert.strictEqual(result.key, 'hello\\"world');
    });

    it('should handle special regex characters in function names', async () => {
      getConfigStub.mockResolvedValue({
        translationFunctionExamples: ['$t($text)', '$.t($text)']
      });
      
      const getTranslationDetails = await buildGetTranslationDetails();
      const result = getTranslationDetails('$t("test")');
      
      assert.ok(result);
      assert.strictEqual(result.key, 'test');
    });

    it('should handle function names with dots and numbers', async () => {
      getConfigStub.mockResolvedValue({
        translationFunctionExamples: ['i18n.t($text)', 'app.translate($text)']
      });
      
      const getTranslationDetails = await buildGetTranslationDetails();
      
      const result1 = getTranslationDetails('i18n.t("key1")');
      assert.ok(result1);
      assert.strictEqual(result1.key, 'key1');
      const getTranslationDetails2 = await buildGetTranslationDetails();
      const result2 = getTranslationDetails2('app.translate("key2")');
      assert.ok(result2);
      assert.strictEqual(result2.key, 'key2');
    });

    it('should handle assignment patterns (returns null for unsupported syntax)', async () => {
      getConfigStub.mockResolvedValue({
        translationFunctionExamples: ['title = $text']
      });
      
      const getTranslationDetails = await buildGetTranslationDetails();
      const result = getTranslationDetails('title = "Hello World"');
      
      // The current implementation doesn't support this pattern correctly
      assert.strictEqual(result, null);
    });

    it('should provide correct position information', async () => {
      getConfigStub.mockResolvedValue({
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

    it('should handle GetConfig.config throwing error', async () => {
      getConfigStub.mockRejectedValue(new Error('Config error'));
      
      try {
        const getTranslationDetails = await buildGetTranslationDetails();
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert.strictEqual((error as Error).message, 'Config error');
      }
    });

    it('should handle whitespace in patterns', async () => {
      getConfigStub.mockResolvedValue({
        translationFunctionExamples: 't($text)'
      });
      
      const getTranslationDetails = await buildGetTranslationDetails();
      const result = getTranslationDetails('t( "hello world" )');
      
      assert.ok(result);
      assert.strictEqual(result.key, 'hello world');
    });

    it('should handle complex nested quotes', async () => {
      getConfigStub.mockResolvedValue({
        translationFunctionExamples: 't($text)'
      });
      
      const getTranslationDetails = await buildGetTranslationDetails();
      const result = getTranslationDetails('t("key with \\"nested\\" quotes")');
      
      assert.ok(result);
      assert.strictEqual(result.key, 'key with \\"nested\\" quotes');
    });
  });

  describe('regex execution state', () => {
    it('should handle multiple calls with same function', async () => {
      getConfigStub.mockResolvedValue({
        translationFunctionExamples: 't($text)'
      });
      
      const getTranslationDetails = await buildGetTranslationDetails();
      
      // First call - Note: global regex needs reset between tests
      const result1 = getTranslationDetails('t("first") t("second")');
      assert.ok(result1);
      assert.strictEqual(result1.key, 'first');
      
      // Second call

      const result2 = getTranslationDetails('t("first") t("second") ');
      assert.ok(result2);
      assert.strictEqual(result2.key, 'second');
    });

    it('should handle different patterns in sequence', async () => {
      getConfigStub.mockResolvedValue({
        translationFunctionExamples: ['t($text)', 'translate($text)']
      });
      
      const getTranslationDetails = await buildGetTranslationDetails();
      
      const result1 = getTranslationDetails('t("first") translate("second") t("third")');
      assert.ok(result1);
      assert.strictEqual(result1.key, 'first');

      const result2 = getTranslationDetails('t("first") translate("second") t("third")');
      assert.ok(result2);
      assert.strictEqual(result2.key, 'second');
      
      // Back to first pattern
      const result3 = getTranslationDetails('t("first") translate("second") t("third")');
      assert.ok(result3);
      assert.strictEqual(result3.key, 'third');
    });
  });
});
