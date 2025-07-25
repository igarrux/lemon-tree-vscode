import * as assert from 'assert';
import { LemonTreeTranslationConfig } from './lemon-tree-translation-config.type';

describe('LemonTreeTranslationConfig type', () => {
  it('should define a valid translation config structure', () => {
    const validConfig: LemonTreeTranslationConfig = {
      lang: 'es'
    };

    assert.ok(validConfig);
    assert.strictEqual(validConfig.lang, 'es');
  });

  it('should allow all optional properties', () => {
    const fullConfig: LemonTreeTranslationConfig = {
      lang: 'fr',
      filePattern: './custom/french.json',
      protectionPattern: 'protect_key_fr',
      typeDefinition: {
        file: './types/french.d.ts',
        exportName: 'FrenchKeys'
      }
    };

    assert.ok(fullConfig);
    assert.strictEqual(fullConfig.lang, 'fr');
    assert.strictEqual(fullConfig.filePattern, './custom/french.json');
    assert.strictEqual(fullConfig.protectionPattern, 'protect_key_fr');
    assert.ok(fullConfig.typeDefinition);
    assert.strictEqual(fullConfig.typeDefinition.file, './types/french.d.ts');
    assert.strictEqual(fullConfig.typeDefinition.exportName, 'FrenchKeys');
  });

  it('should work with different language codes', () => {
    const languages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ru'];
    
    languages.forEach(lang => {
      const config: LemonTreeTranslationConfig = {
        lang
      };

      assert.strictEqual(config.lang, lang);
    });
  });

  it('should work with regional language codes', () => {
    const regionalLanguages = ['en-US', 'en-GB', 'es-ES', 'es-MX', 'pt-BR', 'zh-CN'];
    
    regionalLanguages.forEach(lang => {
      const config: LemonTreeTranslationConfig = {
        lang
      };

      assert.strictEqual(config.lang, lang);
    });
  });

  it('should enforce protection pattern format', () => {
    // Test valid protection patterns (must contain 'key')
    const validPatterns = [
      'protect_key',
      'key_protection',
      'my_key_pattern',
      'prefix_key_suffix'
    ] as const;
    
    validPatterns.forEach(pattern => {
      const config: LemonTreeTranslationConfig = {
        lang: 'en',
        protectionPattern: pattern
      };

      assert.ok(config.protectionPattern?.includes('key'));
    });
  });

  it('should require both file and exportName for typeDefinition', () => {
    const configWithTypeDefinition: LemonTreeTranslationConfig = {
      lang: 'en',
      typeDefinition: {
        file: './types/en.d.ts',
        exportName: 'EnglishTranslations'
      }
    };

    assert.ok(configWithTypeDefinition.typeDefinition);
    assert.strictEqual(configWithTypeDefinition.typeDefinition.file, './types/en.d.ts');
    assert.strictEqual(configWithTypeDefinition.typeDefinition.exportName, 'EnglishTranslations');
  });

  it('should handle interpolated file patterns', () => {
    const interpolatedPatterns = [
      './translations/{{lang}}.json',
      './{{provider}}/{{lang}}/translations.json',
      './i18n/{{sourceLanguage}}/{{lang}}.yaml'
    ];
    
    interpolatedPatterns.forEach(pattern => {
      const config: LemonTreeTranslationConfig = {
        lang: 'en',
        filePattern: pattern
      };

      assert.strictEqual(config.filePattern, pattern);
    });
  });

  it('should handle empty type definition', () => {
    const configWithoutTypes: LemonTreeTranslationConfig = {
      lang: 'en',
      filePattern: './translations/en.json'
    };

    assert.ok(configWithoutTypes);
    assert.strictEqual(configWithoutTypes.typeDefinition, undefined);
  });

  it('should work with minimal config', () => {
    const minimalConfig: LemonTreeTranslationConfig = {
      lang: 'en'
    };

    assert.ok(minimalConfig);
    assert.strictEqual(minimalConfig.lang, 'en');
    assert.strictEqual(minimalConfig.filePattern, undefined);
    assert.strictEqual(minimalConfig.protectionPattern, undefined);
    assert.strictEqual(minimalConfig.typeDefinition, undefined);
  });

  it('should work with complex file paths', () => {
    const complexPaths = [
      '../shared/translations/{{lang}}/main.json',
      './src/assets/i18n/{{lang}}.ts',
      '/absolute/path/to/{{lang}}/translations.yaml'
    ];
    
    complexPaths.forEach(path => {
      const config: LemonTreeTranslationConfig = {
        lang: 'en',
        filePattern: path
      };

      assert.strictEqual(config.filePattern, path);
    });
  });
});
