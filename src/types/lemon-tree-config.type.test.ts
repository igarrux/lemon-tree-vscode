import { describe, it, expect } from 'vitest';
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

    expect(validConfig).toBeDefined();
    expect(validConfig.languages).toEqual(['en', 'es', 'fr']);
    expect(validConfig.sourceLanguage).toBe('en');
    expect(validConfig.default.filePattern).toBe('./translations/{{lang}}.json');
    expect(validConfig.api.provider).toBe('google');
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

    expect(configWithOptionals).toBeDefined();
    expect(configWithOptionals.cliLanguage).toBe('es');
    expect(configWithOptionals.translations).toBeDefined();
    expect(Array.isArray(configWithOptionals.preScript)).toBe(true);
    expect(Array.isArray(configWithOptionals.postScript)).toBe(true);
    expect(Array.isArray(configWithOptionals.translationFunctionExamples)).toBe(true);
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

    expect(configWithStringExample).toBeDefined();
    expect(configWithStringExample.translationFunctionExamples).toBe('t($text)');
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

      expect(config.api.provider).toBe(provider);
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

    expect(configWithPlugin.api.plugin).toBe('./my-plugin.js');
  });
});
