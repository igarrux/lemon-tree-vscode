import * as assert from 'assert';
import { LemonTreeConfig } from './lemon-tree-config.type';
import { LemonTreeTranslationConfig } from './lemon-tree-translation-config.type';

describe('LemonTreeConfig type', () => {
  it('should define a valid config structure', () => {
    const validConfig: LemonTreeConfig = {
      languages: ['en', 'es', 'fr'],
      sourceLanguage: 'en',
      default: {
        filePattern: './translations/{{lang}}.json',
        protectionPattern: 'protect_key'
      },
      api: {
        provider: 'google',
        key: 'api-key'
      }
    };

    assert.ok(validConfig);
    assert.deepStrictEqual(validConfig.languages, ['en', 'es', 'fr']);
    assert.strictEqual(validConfig.sourceLanguage, 'en');
    assert.strictEqual(validConfig.default.filePattern, './translations/{{lang}}.json');
    assert.strictEqual(validConfig.api.provider, 'google');
  });

  it('should allow optional properties', () => {
    const configWithOptionals: LemonTreeConfig = {
      languages: ['en'],
      sourceLanguage: 'en',
      cliLanguage: 'es',
      default: {
        filePattern: './translations/{{lang}}.json',
        protectionPattern: 'protect_key',
        typeDefinition: {
          file: './types/{{lang}}.ts',
          exportName: 'TranslationKeys'
        }
      },
      translations: [
        {
          lang: 'es',
          filePattern: './custom/es.json'
        }
      ],
      api: {
        provider: 'plugin',
        key: 'key',
        plugin: './custom-plugin.js'
      },
      preScript: ['npm run build'],
      postScript: ['echo "Done {{action}} {{result}}"'],
      translationFunctionExamples: ['t($text)', 'i18n.t($text)']
    };

    assert.ok(configWithOptionals);
    assert.strictEqual(configWithOptionals.cliLanguage, 'es');
    assert.ok(configWithOptionals.translations);
    assert.ok(Array.isArray(configWithOptionals.preScript));
    assert.ok(Array.isArray(configWithOptionals.postScript));
    assert.ok(Array.isArray(configWithOptionals.translationFunctionExamples));
  });

  it('should allow string for translationFunctionExamples', () => {
    const configWithStringExample: LemonTreeConfig = {
      languages: ['en'],
      sourceLanguage: 'en',
      default: {
        filePattern: './translations/{{lang}}.json',
        protectionPattern: 'protect_key'
      },
      api: {
        provider: 'google',
        key: 'key'
      },
      translationFunctionExamples: 't($text)'
    };

    assert.ok(configWithStringExample);
    assert.strictEqual(configWithStringExample.translationFunctionExamples, 't($text)');
  });

  it('should work with different API providers', () => {
    const providers = ['google', 'deepl-free', 'deepl-pro', 'microsoft', 'yandex', 'plugin'];
    
    providers.forEach(provider => {
      const config: LemonTreeConfig = {
        languages: ['en'],
        sourceLanguage: 'en',
        default: {
          filePattern: './translations/{{lang}}.json',
          protectionPattern: 'protect_key'
        },
        api: {
          provider,
          key: 'test-key'
        }
      };

      assert.strictEqual(config.api.provider, provider);
    });
  });

  it('should include plugin property for plugin provider', () => {
    const configWithPlugin: LemonTreeConfig = {
      languages: ['en'],
      sourceLanguage: 'en',
      default: {
        filePattern: './translations/{{lang}}.json',
        protectionPattern: 'protect_key'
      },
      api: {
        provider: 'plugin',
        key: 'key',
        plugin: './my-plugin.js'
      }
    };

    assert.strictEqual(configWithPlugin.api.plugin, './my-plugin.js');
  });
});
