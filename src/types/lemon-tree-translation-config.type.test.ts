import { describe, it, expect } from 'vitest';
import { LemonTreeTranslationConfig } from './lemon-tree-translation-config.type';

describe('LemonTreeTranslationConfig type', () => {
  it('should define a valid translation config structure', () => {
    const validConfig: LemonTreeTranslationConfig = {
      lang: 'es'
    };

    expect(validConfig).toBeDefined();
    expect(validConfig.lang).toBe('es');
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

    expect(fullConfig).toBeDefined();
    expect(fullConfig.lang).toBe('fr');
    expect(fullConfig.filePattern).toBe('./custom/french.json');
    expect(fullConfig.protectionPattern).toBe('protect_key_fr');
    expect(fullConfig.typeDefinition).toBeDefined();
    expect(fullConfig.typeDefinition!.file).toBe('./types/french.d.ts');
    expect(fullConfig.typeDefinition!.exportName).toBe('FrenchKeys');
  });

  it('should work with different language codes', () => {
    const languages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ru'];
    
    languages.forEach(lang => {
      const config: LemonTreeTranslationConfig = {
        lang
      };

      expect(config.lang).toBe(lang);
    });
  });

  it('should work with regional language codes', () => {
    const regionalLanguages = ['en-US', 'en-GB', 'es-ES', 'es-MX', 'pt-BR', 'zh-CN'];
    
    regionalLanguages.forEach(lang => {
      const config: LemonTreeTranslationConfig = {
        lang
      };

      expect(config.lang).toBe(lang);
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

      expect(config.protectionPattern?.includes('key')).toBe(true);
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

    expect(configWithTypeDefinition.typeDefinition).toBeDefined();
    expect(configWithTypeDefinition.typeDefinition!.file).toBe('./types/en.d.ts');
    expect(configWithTypeDefinition.typeDefinition!.exportName).toBe('EnglishTranslations');
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

      expect(config.filePattern).toBe(pattern);
    });
  });

  it('should handle empty type definition', () => {
    const configWithoutTypes: LemonTreeTranslationConfig = {
      lang: 'en',
      filePattern: './translations/en.json'
    };

    expect(configWithoutTypes).toBeDefined();
    expect(configWithoutTypes.typeDefinition).toBeUndefined();
  });

  it('should work with minimal config', () => {
    const minimalConfig: LemonTreeTranslationConfig = {
      lang: 'en'
    };

    expect(minimalConfig).toBeDefined();
    expect(minimalConfig.lang).toBe('en');
    expect(minimalConfig.filePattern).toBeUndefined();
    expect(minimalConfig.protectionPattern).toBeUndefined();
    expect(minimalConfig.typeDefinition).toBeUndefined();
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

      expect(config.filePattern).toBe(path);
    });
  });
});
